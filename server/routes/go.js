// [V5-0] 현위치 → 첫 장소 교통 스텁 · IA §11.7(GET /api/go?lat&lng&to · TAGO busService·trainService 재사용은 P2) · 200 { source:'fallback' }.
const express = require('express');

const router = express.Router();

router.get('/go', (req, res) => res.json({ source: 'fallback' }));

module.exports = router;
