// [V5-2b] 하이브리드 풀 · IA §11.4: 1차 = 공사 스팟(kind 'kto' · KorService2/EngService2 춘천 목록 원문) / 2차 = venues.js(공사에 없는 로컬 보강)
//   공사 스팟과 venue가 같은 곳이면(공백 무시 이름 일치, 또는 한쪽 이름이 다른 쪽을 포함하고 MATCH_KM 이내) 공사 항목 하나로 합치고
//   그 venue의 SOURCE_SPOTS 태그를 물려받는다(venueId 표기) · 나머지 공사 스팟은 SOURCE 표에 없음 → local · badge false.
//   badge = anchor && grade ∈ {강함, 중간}(약함·근거없음 = false · 성지 주장 금지) · congestion = 공사 집중률 오늘 값(이름 일치분 · 동점 정렬용)
//   [V5-3] congestionBand = 오늘 값 3구간(ktoCongestionService.band · 화면 Chip) · 합류 항목은 venue 한 줄 소개·webp(fallbackImage)를 잇고
//   공사 좌표가 없으면 venue 좌표로 보강(이미지 1순위·좌표 1순위는 공사 원문)
//   venues 단일 출처 = client/src/data/gts/venues.js 직접 import(사용자 결정 · Render는 레포 전체 체크아웃)
//   source = 공사 데이터 포함 여부('live' | 'fallback' = venues만)
const path = require('path');
const { pathToFileURL } = require('url');
const { tagsFor, isBadge } = require('../data/ksource');
const ktoSpotService = require('./ktoSpotService');
const { todayRates, band } = require('./ktoCongestionService');
const { km } = require('./recommendService');

const { norm } = ktoSpotService;
const VENUES_URL = pathToFileURL(path.join(__dirname, '..', '..', 'client', 'src', 'data', 'gts', 'venues.js')).href;
const MATCH_KM = 0.3; // PLACEHOLDER · 이름 포함 관계일 때 같은 곳으로 보는 거리
let venuesP = null;
const loadVenues = () => (venuesP ??= import(VENUES_URL).then((m) => m.venues));

const withTags = (item, tagId) => {
  const t = tagsFor(tagId);
  return { ...item, ...t, badge: isBadge(t) };
};
// 공사 이미지 http → https(원문은 kto_spots.raw 그대로 · probe: https GET 206 image/jpg)
const httpsImage = (u) => (u ? u.replace(/^http:\/\/tong\.visitkorea\.or\.kr\//, 'https://tong.visitkorea.or.kr/') : null);
const sameSpot = (k, v) => {
  const kn = norm(k.name.ko);
  const vn = norm(v.name.ko);
  if (kn === vn) return true;
  return !!(k.coord && v.coord && (kn.includes(vn) || vn.includes(kn)) && km(k.coord, v.coord) <= MATCH_KM);
};

// [V5-3] 풀 메모 · 풀은 kto_spots 목록(24h 갱신)·집중률(24h 캐시)에서만 파생 → 요청마다 DB를 3번 조회하던 것을 10분 메모로
//   (검증 2026-09-11: 동시 검증 중 /kto/congestion 5~47s · Neon 연결 끊김과 풀 대기가 겹침) · 단일 비행 · live 결과만 메모
const POOL_TTL_MS = 10 * 60 * 1000;
let memo = null; // { at, p }
function getPool() {
  if (memo && Date.now() - memo.at < POOL_TTL_MS) return memo.p;
  const p = buildPool();
  memo = { at: Date.now(), p };
  const drop = () => {
    if (memo?.p === p) memo = null;
  };
  p.then((r) => r.source !== 'live' && drop(), drop);
  return p;
}

async function buildPool() {
  const venues = (await loadVenues()).map((v) =>
    withTags({ id: v.id, kind: 'venue', name: v.name, oneLine: v.oneLine, category: v.category, coord: v.coord, image: v.image }, v.id),
  );
  let kto = [];
  let reason;
  try {
    kto = await ktoSpotService.poolItems();
  } catch (e) {
    reason = e.message.slice(0, 120);
  }
  const rates = kto.length
    ? await todayRates().catch((e) => {
        console.warn('[pool] 집중률 없음(동점 정렬만 영향):', e.message);
        return new Map();
      })
    : new Map();
  const used = new Set();
  const items = [
    ...kto.map((k) => {
      const v = venues.find((x) => !used.has(x.id) && sameSpot(k, x));
      if (v) used.add(v.id);
      // 공사 영문 대응 항목이 없으면(en·th = ko 제목) venue의 영문·태국어 이름을 쓴다(검증 2026-09-11: 춘천막국수체험박물관이 en 화면에 한글로 노출)
      const names = v && !k.enId && k.srcLang === 'ko' && { name: { ...k.name, en: v.name.en, th: v.name.th } };
      const merged = v && { venueId: v.id, ...names, oneLine: v.oneLine, coord: k.coord ?? v.coord, fallbackImage: v.image };
      return withTags({ ...k, image: httpsImage(k.image), ...merged }, v?.id ?? k.id);
    }),
    ...venues.filter((v) => !used.has(v.id)),
  ].map((s) => {
    const c = rates.get(norm(s.name.ko));
    return c == null ? s : { ...s, congestion: c, congestionBand: band(c) };
  });
  return { source: kto.length ? 'live' : 'fallback', ...(reason && { reason }), items };
}

module.exports = { getPool };
