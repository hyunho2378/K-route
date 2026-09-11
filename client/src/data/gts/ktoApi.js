// ============================================================
// ktoApi.js · K-Route v5 데이터 창구 (IA §11 · [V5-2] 실호출)
// 서버: /api/kto/spots(하이브리드 풀) · /spots/:id · /related/:id · /congestion/:id · POST /api/quiz/recommend.
// 응답 source = 공사 데이터 포함 여부('live' | 'fallback') · 성공 여부는 items 유무로 판단.
// 네트워크·HTTP 오류 시 { source:'fallback' } 반환(화면 비차단 · data/gts/api.js 선례) · api.js 원본 미수정.
// ============================================================
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

async function call(path, init) {
  try {
    const res = await fetch(`${API_BASE}${path}`, { credentials: 'include', ...init });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return { source: 'fallback' };
  }
}
const enc = encodeURIComponent;

export const getSpots = (lang) => call(`/api/kto/spots?lang=${lang}`);
export const getSpotDetail = (id, lang) => call(`/api/kto/spots/${enc(id)}?lang=${lang}`);
export const getRelated = (id) => call(`/api/kto/related/${enc(id)}`);
export const getCongestion = (id) => call(`/api/kto/congestion/${enc(id)}`);
// answers = { q1:[kfood|kdrama|kanime|kpop|undecided], q2, q3, q4, q5 } · 허용값은 server/services/recommendService.js ANSWERS
export const recommend = (answers, lang, sessionId) =>
  call('/api/quiz/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers, lang, sessionId }),
  });
export const sendChat = async () => ({ source: 'fallback' }); // POST /api/chat · P3
// [V5-3] 현위치 → 코스 장소 · { source, reason, to, km, estimates:[{mode:'walk'|'taxi', min}] } · live provider가 붙으면 legs[]
export const getGo = (lat, lng, to) => call(`/api/go?lat=${lat}&lng=${lng}&to=${enc(to)}`);
