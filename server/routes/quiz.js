// [V5-0] 취향 설문 추천 스텁 · IA §11.4(결정론 추천 엔진) · 200 { source:'fallback' }(500 금지) · 구현은 P2 세션.
const express = require('express');

const router = express.Router();

router.post('/quiz/recommend', (req, res) => res.json({ source: 'fallback' }));

module.exports = router;
