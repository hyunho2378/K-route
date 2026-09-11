// [V5-2b] 공사 OpenAPI·하이브리드 풀 라우트 · IA §11.9 · 공사 사용처 4곳 = 목록(/kto/spots) · 상세(/kto/spots/:id) ·
//   연관(/kto/related/:id) · 집중률(/kto/congestion/:id) · 실패는 200 { source:'fallback', reason }(500 금지 · transit.js 선례)
//   source = 공사 데이터 포함 여부 · 풀 항목(items)은 fallback이어도 venues로 채워져 나간다.
const express = require('express');
const { getPool } = require('../services/spotPool');
const { getSpot } = require('../services/ktoSpotService');
const { getRelated } = require('../services/ktoRelatedService');
const { getCongestion } = require('../services/ktoCongestionService');
const { getAudioGuide } = require('../services/ktoAudioService');

const router = express.Router();
const LANGS = ['en', 'ko', 'th'];
const langOf = (q) => (LANGS.includes(q) ? q : 'en');
const fallback = (res, e) => res.json({ source: 'fallback', reason: e.message.slice(0, 120) });
// 풀 id(공사 contentid | venue id) · 합류 7곳은 구 venue id(Travel Log·구 예약)로도 찾는다
const findIn = (items, id) => items.find((s) => s.id === id) ?? items.find((s) => s.venueId === id);
const findItem = async (id) => findIn((await getPool()).items, id);
// [V5-3] 상세 패널 odii 해설 · 반경 안 가장 가까운 테마 이름이 장소 이름(ko·en·th 중 하나)과 포함 관계일 때만 · 아니면 null
//   (검증 2026-09-11: 좌표 근접 판정은 통나무집 닭갈비 → 막국수체험박물관(PLACEHOLDER 좌표), 원조숯불닭불고기집 → 춘천낭만시장(150m 안)처럼
//    다른 장소 해설을 붙였다 → 이름 일치만 남김)
const nameKey = (s) => String(s ?? '').toLowerCase().replace(/[^0-9a-z가-힣]/g, '');
const samePlace = (theme, item) => {
  const t = nameKey(theme.title);
  return !!t && Object.values(item.name ?? {}).some((n) => nameKey(n) && (nameKey(n).includes(t) || t.includes(nameKey(n))));
};
const audioOf = (item, lang) =>
  item.coord
    ? getAudioGuide(item.coord, lang)
        .then((a) => (a.theme && samePlace(a.theme, item) ? a : null))
        .catch((e) => {
          console.warn('[kto] odii 없음(상세 계속):', e.message);
          return null;
        })
    : null;

// 목록 · 하이브리드 풀(공사 1차 + venues 2차 · SOURCE 태그·badge·집중률)
router.get('/kto/spots', async (req, res) => {
  try {
    res.json(await getPool());
  } catch (e) {
    fallback(res, e);
  }
});

// 상세 · venue는 풀 항목 그대로 / 공사 스팟은 detailCommon2·detailIntro2·detailImage2 원문 · en·th는 영문 대응 항목이 있으면 EngService2
//   [V5-3] audio = Odii 해설(themeLocationBasedList → storyBasedList 원문 · 좌표 있는 항목만 · 없으면 null)
router.get('/kto/spots/:id', async (req, res) => {
  const lang = langOf(req.query.lang);
  try {
    const spotPool = await getPool();
    const item = findIn(spotPool.items, req.params.id);
    if (!item) return res.status(404).json({ error: 'not_found' });
    if (item.kind === 'venue') return res.json({ source: spotPool.source, item, audio: await audioOf(item, lang) });
    const [cid, clang] = lang !== 'ko' && item.enId ? [item.enId, 'en'] : [item.contentid, item.srcLang];
    const [detail, audio] = await Promise.all([getSpot(cid, clang), audioOf(item, lang)]);
    res.json({ source: 'live', item, detail, audio });
  } catch (e) {
    fallback(res, e);
  }
});

// 연관 · 풀 항목 이름(ko)으로 TarRlteTarService1/searchKeyword1
router.get('/kto/related/:id', async (req, res) => {
  try {
    const item = await findItem(req.params.id);
    if (!item) return res.status(404).json({ error: 'not_found' });
    res.json({ source: 'live', name: item.name.ko, ...(await getRelated(item.name.ko)) });
  } catch (e) {
    fallback(res, e);
  }
});

// 집중률 · 풀 항목 이름(ko) = tatsCnctrRatedList tAtsNm(공백 무시 일치) · 오늘 값·30일 예측·가장 한가한 날
router.get('/kto/congestion/:id', async (req, res) => {
  try {
    const item = await findItem(req.params.id);
    if (!item) return res.status(404).json({ error: 'not_found' });
    res.json({ source: 'live', ...(await getCongestion(item.name.ko)) });
  } catch (e) {
    fallback(res, e);
  }
});

module.exports = router;
