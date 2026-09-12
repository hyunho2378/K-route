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
// [V5-6] K-가이드 챗 · ndjson 스트림이라 call() 을 쓰지 않고 Response 를 그대로 돌려준다(읽기는 components/chat/useGuideChat) · 네트워크 오류 = null
export const openChat = (body) =>
  fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => null);
// [V5-6] NFC 성지 스탬프 · { stamps:[{spotId,kType,at}], kinds, badges, complete } · 실패 = { source:'fallback' }
export const getStamps = () => call('/api/stamps');
export const postStamp = (spotId, t) =>
  call('/api/stamps', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ spotId, t }) });
// [V5-3] 현위치 → 코스 장소 · { source, reason, to, km, estimates:[{mode:'walk'|'taxi', min}] } · live provider가 붙으면 legs[]
export const getGo = (lat, lng, to) => call(`/api/go?lat=${lat}&lng=${lng}&to=${enc(to)}`);
// [V5-5] 동선 설계 · ids = 담은 순서 · { source, order, stops, legs, metrics, assumed } · fallback이면 order 없음(담은 순서 유지)
export const planRoute = (ids, date, startTime) =>
  call('/api/route/plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids, date, startTime }),
  });
// [V5-5] 내륙 확산 · { source, of, base, viaNearby, items:[풀 항목 + reasonKey] }
export const getSpread = (id) => call(`/api/route/spread/${enc(id)}`);
// [V5-10] 공사 축제 · { source, date, dateTo, total, items:[searchFestival2 원문] } · date 생략 시 서버가 KST 오늘로 판정
export const getFestivals = (date) => call(`/api/kto/festivals${date ? `?date=${enc(date)}` : ''}`);
