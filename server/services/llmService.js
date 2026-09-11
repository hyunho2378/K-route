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

module.exports = { generate, embed, llmProvider };
