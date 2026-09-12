// [V5-6] NFC 성지 스탬프 · GET /api/stamps(내 스탬프·배지·완주) · POST /api/stamps { spotId, t }(URL 태그 /stamp/<spotId>/<t> 인증 → 기록)
//   로그인 필수(클라 /stamp/:spotId 는 RequireAuth) · 같은 곳은 한 번만(PRIMARY KEY + ON CONFLICT DO NOTHING)
const express = require('express');
const pool = require('../db/pool');
const { readUserId } = require('../lib/session');
const { stampable, tagToken, sameToken, summary } = require('../services/stampService');

const router = express.Router();
const mine = async (uid) =>
  (await pool.query('SELECT spot_id, created_at FROM stamps WHERE user_id = $1 ORDER BY created_at', [uid])).rows;

router.get('/stamps', async (req, res) => {
  const uid = readUserId(req);
  if (!uid) return res.status(401).json({ error: 'login_required' });
  try {
    res.json(summary(await mine(uid)));
  } catch (e) {
    res.status(503).json({ error: e.message.slice(0, 120) });
  }
});

router.post('/stamps', async (req, res) => {
  const uid = readUserId(req);
  if (!uid) return res.status(401).json({ error: 'login_required' });
  const { spotId, t } = req.body ?? {};
  if (!stampable().some((s) => s.id === spotId)) return res.status(404).json({ error: 'not_a_stamp_spot' });
  if (!sameToken(t, tagToken(spotId))) return res.status(403).json({ error: 'bad_tag' });
  try {
    const { rowCount } = await pool.query('INSERT INTO stamps (user_id, spot_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [uid, spotId]);
    res.status(rowCount ? 201 : 200).json({ added: rowCount > 0, spotId, ...summary(await mine(uid)) });
  } catch (e) {
    res.status(503).json({ error: e.message.slice(0, 120) });
  }
});

module.exports = router;
