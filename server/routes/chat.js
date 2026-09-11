// [V5-0] K-가이드 봇 스텁 · IA §11.8(ragService 연결은 P3) · 200 { source:'fallback' }(500 금지).
const express = require('express');

const router = express.Router();

router.post('/chat', (req, res) => res.json({ source: 'fallback' }));

module.exports = router;
