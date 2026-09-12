// [V5-2] LLM 공급자 분기 · IA §11.8 · LLM_PROVIDER=gemini 일 때만 호출(그 외·키 없음·실패 = throw → 호출부 폴백).
// SDK 설치 금지: 공급자 REST를 fetch로 직접 호출. 키 env 이름 = GEMINI_API_KEY(발급 대기 · P0 지시서 예시 이름 채택).
// ponytail: 모델명 고정 상수 · 키 발급 후 실호출로 가용 모델 확인·교체(현재 키 없어 미검증).
const GEMINI_MODEL = 'gemini-2.5-flash';
const TIMEOUT_MS = 8000;
const llmProvider = () => process.env.LLM_PROVIDER || null;
const embeddingProvider = () => process.env.EMBEDDING_PROVIDER || null;

// prompt → 텍스트 1개 · json=true면 JSON 응답 모드(파싱은 호출부)
async function generate(prompt, { json = false } = {}) {
  if (llmProvider() !== 'gemini') throw new Error(`LLM off (LLM_PROVIDER=${llmProvider() ?? 'unset'})`);
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY 미설정');
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
    method: 'POST',
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      ...(json && { generationConfig: { responseMimeType: 'application/json' } }),
    }),
  });
  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
  const text = (await res.json())?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini 빈 응답');
  return text;
}

async function embed() {
  // 분기 자리: embeddingProvider() 값별 호출 · 차원은 spot_chunks.embedding과 일치 · P3 RAG 세션
  throw new Error(`NOT_IMPLEMENTED (EMBEDDING_PROVIDER=${embeddingProvider() ?? 'unset'})`);
}

// [V5-6] K-가이드 봇 대화 어댑터 · 키가 없으면 로컬 Ollama(API 비용 0 · 동해사이 검증 방식) · GEMINI_API_KEY + LLM_PROVIDER=gemini 면 Gemini
//   Ollama 가 없으면(배포 서버) throw → chat 라우트가 검색된 공사 원문을 그대로 보내는 원문 모드로 내려간다
const OLLAMA_URL = () => process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = () => process.env.OLLAMA_MODEL || 'gemma4:e4b'; // 동해사이 검증 모델 · 실행 환경에 있는 모델로 바꾼다
const OLLAMA_CONNECT_MS = 30000; // 모델 첫 적재까지 · 응답 헤더가 오면 해제(긴 스트림은 끊지 않는다)
const OLLAMA_OPTIONS = { num_ctx: 8192 }; // ponytail: 규칙 + 자료집 3건 + 대화 8턴 기준 · ragService CAP 을 올리면 같이 올린다
const chatProvider = () => (llmProvider() === 'gemini' && process.env.GEMINI_API_KEY ? 'gemini' : 'ollama');

async function ollama(body) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), OLLAMA_CONNECT_MS);
  const res = await fetch(`${OLLAMA_URL()}/api/chat`, {
    method: 'POST',
    signal: ac.signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: OLLAMA_MODEL(), think: false, keep_alive: '30m', options: OLLAMA_OPTIONS, ...body }),
  }).finally(() => clearTimeout(timer));
  if (!res.ok || !res.body) throw new Error(`Ollama HTTP ${res.status} ${(await res.text().catch(() => '')).slice(0, 120)}`);
  return res;
}

// 챗 요청 · ollama = 스트리밍 응답 body(라우트가 ndjson 을 읽는다) · gemini = 비스트리밍 텍스트 1개
//   ponytail: Gemini 는 스트리밍 없이 generate 1회 · 키 발급 후 streamGenerateContent 로 바꾸면 첫 토큰이 빨라진다(현재 키 없어 미검증)
async function chatRequest(messages) {
  if (chatProvider() === 'gemini') {
    const prompt = messages.map((m) => (m.role === 'system' ? m.content : `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)).join('\n\n');
    return { text: await generate(prompt) };
  }
  return { body: (await ollama({ messages, stream: true })).body };
}

// 검색용 번역(사용자에게 보이지 않는다) · 태국어 질문을 영어로 옮겨 en 청크를 찾는다
async function translate(text, to) {
  const prompt = `Translate the following text into ${to}. Output only the translation.\n\n${text}`;
  if (chatProvider() === 'gemini') return (await generate(prompt)).trim();
  const res = await ollama({ messages: [{ role: 'user', content: prompt }], stream: false });
  return ((await res.json())?.message?.content ?? '').trim() || text;
}

module.exports = { generate, embed, llmProvider, chatRequest, translate };
