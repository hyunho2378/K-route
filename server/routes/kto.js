// [V5-2b] 공사 OpenAPI·하이브리드 풀 라우트 · IA §11.9 · 공사 사용처 4곳 = 목록(/kto/spots) · 상세(/kto/spots/:id) ·
//   연관(/kto/related/:id) · 집중률(/kto/congestion/:id) · 실패는 200 { source:'fallback', reason }(500 금지 · transit.js 선례)
//   source = 공사 데이터 포함 여부 · 풀 항목(items)은 fallback이어도 venues로 채워져 나간다.
const express = require('express');
const { getPool } = require('../services/spotPool');
const { getSpot } = require('../services/ktoSpotService');
const { getRelated } = require('../services/ktoRelatedService');
const { getCongestion } = require('../services/ktoCongestionService');

const router = express.Router();
const LANGS = ['en', 'ko', 'th'];
const langOf = (q) => (LANGS.includes(q) ? q : 'en');
const fallback = (res, e) => res.json({ source: 'fallback', reason: e.message.slice(0, 120) });
const findItem = async (id) => (await getPool()).items.find((s) => s.id === id);

// 목록 · 하이브리드 풀(공사 1차 + venues 2차 · SOURCE 태그·badge·집중률)
router.get('/kto/spots', async (req, res) => {
  try {
    res.json(await getPool());
  } catch (e) {
    fallback(res, e);
  }
});

// 상세 · venue는 풀 항목 그대로 / 공사 스팟은 detailCommon2·detailIntro2·detailImage2 원문 · en·th는 영문 대응 항목이 있으면 EngService2
router.get('/kto/spots/:id', async (req, res) => {
  const lang = langOf(req.query.lang);
  try {
    const spotPool = await getPool();
    const item = spotPool.items.find((s) => s.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'not_found' });
    if (item.kind === 'venue') return res.json({ source: spotPool.source, item });
    const [cid, clang] = lang !== 'ko' && item.enId ? [item.enId, 'en'] : [item.contentid, item.srcLang];
    res.json({ source: 'live', item, detail: await getSpot(cid, clang) });
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
