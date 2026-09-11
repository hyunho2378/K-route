// [V5-0] LLM·임베딩 공급자 분기 자리 · IA §11.8 · env LLM_PROVIDER / EMBEDDING_PROVIDER(.env.example) 값으로 분기.
// SDK 설치 금지: RAG 세션이 공급자 REST를 fetch로 직접 호출한다. 공급자 키 env 이름은 발급 후 확정(현재 없음).
const llmProvider = () => process.env.LLM_PROVIDER || null;
const embeddingProvider = () => process.env.EMBEDDING_PROVIDER || null;

async function generate() {
  // 분기 자리: llmProvider() 값별 호출(예: 'gemini') · P3 RAG 세션
  throw new Error(`NOT_IMPLEMENTED (LLM_PROVIDER=${llmProvider() ?? 'unset'})`);
}

async function embed() {
  // 분기 자리: embeddingProvider() 값별 호출 · 차원은 spot_chunks.embedding과 일치시킬 것
  throw new Error(`NOT_IMPLEMENTED (EMBEDDING_PROVIDER=${embeddingProvider() ?? 'unset'})`);
}

module.exports = { generate, embed };
