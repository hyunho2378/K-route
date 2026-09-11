// [V5-2b] 하이브리드 풀 · IA §11.4: 1차 = 공사 스팟(kind 'kto' · KorService2/EngService2 춘천 목록 원문) / 2차 = venues.js(공사에 없는 로컬 보강)
//   공사 스팟과 venue가 같은 곳이면(공백 무시 이름 일치, 또는 한쪽 이름이 다른 쪽을 포함하고 MATCH_KM 이내) 공사 항목 하나로 합치고
//   그 venue의 SOURCE_SPOTS 태그를 물려받는다(venueId 표기) · 나머지 공사 스팟은 SOURCE 표에 없음 → local · badge false.
//   badge = anchor && grade ∈ {강함, 중간}(약함·근거없음 = false · 성지 주장 금지) · congestion = 공사 집중률 오늘 값(이름 일치분 · 동점 정렬용)
//   venues 단일 출처 = client/src/data/gts/venues.js 직접 import(사용자 결정 · Render는 레포 전체 체크아웃)
//   source = 공사 데이터 포함 여부('live' | 'fallback' = venues만)
const path = require('path');
const { pathToFileURL } = require('url');
const { tagsFor, isBadge } = require('../data/ksource');
const ktoSpotService = require('./ktoSpotService');
const { todayRates } = require('./ktoCongestionService');
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

async function getPool() {
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
      return withTags({ ...k, image: httpsImage(k.image), ...(v && { venueId: v.id }) }, v?.id ?? k.id);
    }),
    ...venues.filter((v) => !used.has(v.id)),
  ].map((s) => {
    const c = rates.get(norm(s.name.ko));
    return c == null ? s : { ...s, congestion: c };
  });
  return { source: kto.length ? 'live' : 'fallback', ...(reason && { reason }), items };
}

module.exports = { getPool };
