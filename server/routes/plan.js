// [V5-5] 리듬 코스 · 동선 설계(POST /api/route/plan)와 내륙 확산 추천(GET /api/route/spread/:id).
//   실패는 200 { source:'fallback', reason }(500 금지 · transit.js·kto.js 선례) · 화면은 담은 순서 그대로 간다.
const express = require('express');
const { getPool } = require('../services/spotPool');
const { planRoute } = require('../services/routePlanner');
const { getRelated, getBaseNames } = require('../services/ktoRelatedService');
const { getCongestion } = require('../services/ktoCongestionService');
const { km } = require('../services/recommendService');

const router = express.Router();
const MAX_IDS = 8; // 담기 정원(3~4)의 여유 상한
const NEAR_TRY = 5; // 확산 기준지 후보(가까운 순) 최대 조회 수
const SPREAD_MAX = 8; // 확산 추천 최대 개수

// 풀 id(공사 contentid | venue id) · 합류 7곳은 구 venue id로도 찾는다(kto.js 동일 계약)
const findIn = (items, id) => items.find((s) => s.id === id) ?? items.find((s) => s.venueId === id);
// 요청 1건 안에서 같은 이름 재조회 방지(서비스 캐시 24h와 별개)
const memo = (fn) => {
  const m = new Map();
  return (k) => {
    if (!m.has(k)) m.set(k, fn(k));
    return m.get(k);
  };
};

const normName = (s) => String(s ?? '').replace(/[\s/()]/g, '');
// 연관 목록(원문 이름) → 풀 항목 · 공사 표기는 "통나무집닭갈비/본점"처럼 지점이 붙어 포함 관계도 인정
function matchPool(rows, items, excludeId) {
  const out = [];
  const seen = new Set([excludeId]);
  for (const r of [...rows].sort((a, b) => Number(a.rlteRank) - Number(b.rlteRank))) {
    const n = normName(r.rlteTatsNm);
    if (!n) continue;
    const hit = items.find((s) => {
      if (seen.has(s.id)) return false;
      const sn = normName(s.name?.ko);
      return sn && (sn === n || sn.includes(n) || n.includes(sn));
    });
    if (!hit) continue;
    seen.add(hit.id);
    out.push({ ...hit, reasonKey: 'quiz.reason.spread', rlteRank: Number(r.rlteRank) });
  }
  return out;
}

// 동선 설계 · ids = 담은 순서(공사 contentid | venue id) · date(YYYYMMDD)·startTime(HH:MM) 선택
router.post('/route/plan', async (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids.map(String) : [];
  if (!ids.length || ids.length > MAX_IDS) return res.status(400).json({ error: 'bad_ids' });
  try {
    const { items } = await getPool();
    const spots = ids.map((id) => findIn(items, id)).filter(Boolean);
    if (spots.length !== ids.length) return res.status(404).json({ error: 'not_found' });
    const relatedNames = memo((name) =>
      getRelated(name)
        .then((r) => r.items.map((i) => i.rlteTatsNm))
        .catch(() => []),
    );
    const congestionDays = memo((name) =>
      getCongestion(name)
        .then((c) => (c.matched ? c.days : []))
        .catch(() => []),
    );
    const plan = await planRoute(spots, { date: req.body.date, startTime: req.body.startTime }, { relatedNames, congestionDays });
    res.json({ source: 'live', ...plan });
  } catch (e) {
    res.json({ source: 'fallback', reason: e.message.slice(0, 120) });
  }
});

// 내륙 확산 · 그 스팟 방문객이 이어서 가는 춘천 스팟
//   연관관광지 데이터는 같은 시도 안에서만 연결된다(실측 2026-09-12: 춘천 기준 1412행 100% 강원 · 남이섬 기준 50행 100% 경기)
//   → 남이섬처럼 경기로 등록된 스팟은 직접 연관이 0건이라, 좌표상 가까운 춘천 기준 관광지의 연관 목록으로 확산한다(viaNearby).
router.get('/route/spread/:id', async (req, res) => {
  try {
    const { items } = await getPool();
    const item = findIn(items, req.params.id);
    if (!item) return res.status(404).json({ error: 'not_found' });
    const own = await getRelated(item.name.ko).catch(() => ({ items: [] }));
    let base = item;
    let hits = matchPool(own.items ?? [], items, item.id);
    if (!hits.length && item.coord) {
      // 기준 관광지(연관 목록 보유 39곳)만 후보 · 그중 좌표가 가까운 순
      const bases = await getBaseNames().catch(() => []);
      const baseKeys = bases.map(normName);
      const near = items
        .filter((s) => {
          if (!s.coord || s.id === item.id) return false;
          const sn = normName(s.name?.ko);
          return sn && baseKeys.some((b) => b === sn || b.includes(sn) || sn.includes(b));
        })
        .sort((a, b) => km(item.coord, a.coord) - km(item.coord, b.coord));
      for (const cand of near.slice(0, NEAR_TRY)) {
        const r = await getRelated(cand.name.ko).catch(() => ({ items: [] }));
        const h = matchPool(r.items ?? [], items, item.id);
        if (h.length) {
          base = cand;
          hits = h;
          break;
        }
      }
    }
    res.json({
      source: hits.length ? 'live' : 'fallback',
      of: { id: item.id, name: item.name },
      base: { id: base.id, name: base.name },
      viaNearby: base.id !== item.id,
      items: hits.slice(0, SPREAD_MAX),
    });
  } catch (e) {
    res.json({ source: 'fallback', reason: e.message.slice(0, 120) });
  }
});

module.exports = router;
