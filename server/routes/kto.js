// [V5-0] 공사 OpenAPI 프록시 스텁 · IA §11.9 · 전부 200 { source:'fallback' }(500 금지).
//   P1 데이터 세션이 services/kto*Service 연결 · 실패·키 미설정은 fallback 유지(transit.js 선례).
const express = require('express');

const router = express.Router();
const fallback = (req, res) => res.json({ source: 'fallback' });

router.get('/kto/spots', fallback);
router.get('/kto/spots/:id', fallback);
router.get('/kto/related/:id', fallback);
router.get('/kto/congestion/:id', fallback);

module.exports = router;
