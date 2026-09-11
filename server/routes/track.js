// [V1] 여정 트래킹 · POST /api/track — 로그인 필수(user_id는 세션에서 · 데모 귀속 없음).
// 클라 전송은 비차단(실패해도 UX 진행) — 서버는 검증 후 insert만.
const express = require('express');
const pool = require('../db/pool');
const { readUserId } = require('../lib/session');

const router = express.Router();

// [V3] Travel Log 템플릿 적용 · [V5-3] quiz·go(journey_events CHECK는 V5-0에서 확장 완료)
const STEPS = new Set(['login', 'setup', 'meal_plan', 'meals', 'picks', 'route_confirm', 'pay_method', 'complete', 'log_template', 'quiz', 'go']);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

router.post('/track', async (req, res) => {
  const uid = readUserId(req);
  if (!uid) return res.status(401).json({ error: 'unauthorized' });
  const { sessionId, step, payload, durationMs } = req.body ?? {};
  if (!UUID_RE.test(String(sessionId ?? ''))) return res.status(400).json({ error: 'bad_session' });
  if (!STEPS.has(step)) return res.status(400).json({ error: 'bad_step' });
  const dur = Number.isFinite(durationMs) ? Math.max(0, Math.round(durationMs)) : null;
  try {
    await pool.query(
      'INSERT INTO journey_events (user_id, session_id, step, payload, duration_ms) VALUES ($1, $2, $3, $4, $5)',
      [uid, sessionId, step, JSON.stringify(payload ?? {}), dur],
    );
    res.json({ ok: true });
  } catch (e) {
    // [V6] 실패를 삼키지 말고 1줄 경고(트래킹 유실 원인 추적용). 클라는 비차단이라 UX 무영향.
    console.warn(`[track] insert 실패 user=${uid} step=${step}: ${e.message}`);
    res.status(500).json({ error: 'track_failed' });
  }
});

module.exports = router;
