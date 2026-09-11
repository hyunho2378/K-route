// ============================================================
// ktoApi.js · K-Route v5 데이터 창구 스텁 (IA §11 · [V5-0])
// 서버 스텁(/api/kto/*, /api/quiz/recommend, /api/chat, /api/go)과 1:1 · 지금은 호출 없이 전부 fallback 반환.
// 구현 세션이 내부만 fetch로 교체(api.js 원본 미수정 · data/gts/api.js 선례).
// ============================================================
const fallback = async () => ({ source: 'fallback' });

export const getKtoSpots = fallback; // GET /api/kto/spots
export const getKtoSpot = fallback; // GET /api/kto/spots/:id
export const getKtoRelated = fallback; // GET /api/kto/related/:id
export const getKtoCongestion = fallback; // GET /api/kto/congestion/:id
export const recommendQuiz = fallback; // POST /api/quiz/recommend
export const sendChat = fallback; // POST /api/chat
export const getGo = fallback; // GET /api/go?lat&lng&to
