// [V5-3] 현위치 → 코스 장소 길 안내 · IA §11.7 · GET /api/go?lat&lng&to(풀 id · 합류 7곳은 구 venue id도 허용)
//   교통 provider: TAGO 시외버스(SuburbsBusInfo)·열차(TrainInfo)는 터미널·역 사이 구간 전용이라 춘천 시내 이동에 쓸 수 없고,
//   시내버스 오퍼레이션은 docs/tago 문서·probe 근거가 없다(PITFALLS: 근거 없는 호출 금지) → 지금은 직선거리 기반 도보·택시 '예상'(fallback).
//   live provider가 붙으면 같은 응답에 legs[]를 채운다(클라는 legs 유무로 분기).
const express = require('express');
const { getPool } = require('../services/spotPool');
const { km } = require('../services/recommendService');

const router = express.Router();
const ROAD_FACTOR = 1.3; // PLACEHOLDER · 직선 → 도로 보정(client data/gts/distance.js 동일 값)
const SPEED_KMH = { walk: 4, taxi: 30 }; // PLACEHOLDER · 도보 시속 / 시내 택시 시속(distance.js 30 동일)

router.get('/go', async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return res.status(400).json({ error: 'bad_origin' });
  }
  try {
    const { items } = await getPool();
    const id = String(req.query.to ?? '');
    const item = items.find((s) => s.id === id) ?? items.find((s) => s.venueId === id);
    if (!item) return res.status(404).json({ error: 'not_found' });
    const to = { id: item.id, name: item.name, coord: item.coord };
    // 좌표 미확정(venues DEMO) 장소는 거리를 지어내지 않는다
    if (!item.coord) return res.json({ source: 'fallback', reason: 'no-coord', to });
    const straight = km([lng, lat], item.coord);
    const minutes = (mode) => Math.max(1, Math.round(((straight * ROAD_FACTOR) / SPEED_KMH[mode]) * 60));
    res.json({
      source: 'fallback',
      reason: 'no-intracity-provider',
      to,
      km: Math.round(straight * 10) / 10,
      estimates: [
        { mode: 'walk', min: minutes('walk') },
        { mode: 'taxi', min: minutes('taxi') },
      ],
    });
  } catch (e) {
    res.json({ source: 'fallback', reason: e.message.slice(0, 120) });
  }
});

module.exports = router;
