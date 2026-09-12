// [V5-6] NFC 성지 스탬프 · GET /api/stamps(내 스탬프·배지·완주) · POST /api/stamps { spotId, t }(URL 태그 /stamp/<spotId>/<t> 인증 → 기록)
//   로그인 필수(클라 /stamp/:spotId 는 RequireAuth) · 같은 곳은 한 번만(PRIMARY KEY + ON CONFLICT DO NOTHING)
const express = require('express');
const pool = require('../db/pool');
const { readUserId, ensureAnonKey } = require('../lib/session');
const { stampable, tagToken, sameToken, summary } = require('../services/stampService');

const router = express.Router();
const mine = async (uid) =>
  (await pool.query('SELECT spot_id, created_at FROM stamps WHERE user_id = $1 ORDER BY created_at', [uid])).rows;

router.get('/stamps', async (req, res) => {
  const uid = readUserId(req);
  // [V5-12] 비로그인 게스트도 스탬프 화면을 연다(공모전 데모 · 로그인 벽 제거).
  //   게스트 세션 키(gts_anon)만 발급하고 DB 에는 저장하지 않는다(stamps 스키마 불변 · 사용자 결정).
  //   빈 요약이라 찍을 수 있는 곳과 갈래는 그대로 보이고 내 스탬프만 0이다 · 화면이 이번 세션 메모리로 표시한다.
  if (!uid) {
    ensureAnonKey(req, res);
    return res.json({ guest: true, ...summary([]) });
  }
  try {
    res.json(summary(await mine(uid)));
  } catch (e) {
    res.status(503).json({ error: e.message.slice(0, 120) });
  }
});

router.post('/stamps', async (req, res) => {
  const uid = readUserId(req);
  const { spotId, t } = req.body ?? {};
  // 태그 유효성은 로그인 여부와 무관하게 먼저 판정한다(없는 스팟·위조 토큰은 게스트에게도 거절)
  if (!stampable().some((s) => s.id === spotId)) return res.status(404).json({ error: 'not_a_stamp_spot' });
  if (!sameToken(t, tagToken(spotId))) return res.status(403).json({ error: 'bad_tag' });
  // [V5-12] 게스트: 검증까지는 같고 DB 저장만 하지 않는다 · 화면이 이번 세션 메모리로 "찍음"을 표시한다
  if (!uid) {
    ensureAnonKey(req, res);
    return res.json({ guest: true, added: true, spotId, ...summary([]) });
  }
  try {
    const { rowCount } = await pool.query('INSERT INTO stamps (user_id, spot_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [uid, spotId]);
    res.status(rowCount ? 201 : 200).json({ added: rowCount > 0, spotId, ...summary(await mine(uid)) });
  } catch (e) {
    res.status(503).json({ error: e.message.slice(0, 120) });
  }
});

module.exports = router;
