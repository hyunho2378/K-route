// [V5-2] 취향 설문 추천 · POST /api/quiz/recommend · IA §11.4 결정론(recommendService) + LLM 사유 1문장(실패 시 reasonKey 폴백).
//   LLM 없이도 동작(reason null 이면 클라가 t(reasonKey)) · quiz_sessions 저장 + 로그인 시 journey_events 'recommend'(저장 실패는 비차단).
//   source = 공사 데이터 포함 여부(spotPool 동일) · 전체 실패만 items 없이 { source:'fallback', reason }.
const crypto = require('crypto');
const express = require('express');
const pool = require('../db/pool');
const { readUserId } = require('../lib/session');
const { getPool } = require('../services/spotPool');
const { recommend, validAnswers } = require('../services/recommendService');
const { generate } = require('../services/llmService');

const router = express.Router();
const LANG_NAME = { en: 'English', ko: 'Korean', th: 'Thai' };
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i; // track.js 동일

// 추천 사유 1문장(사용자 언어) · 사실 = 풀 원문(이름·한 줄·배지 kcontent)만 · 실패는 throw(호출부 폴백)
async function llmReasons(picks, byId, answers, lang) {
  const facts = picks.map(({ id }) => {
    const s = byId.get(id);
    return {
      id,
      name: s.name?.[lang] ?? s.name?.en,
      about: s.oneLine?.[lang] ?? s.oneLine?.en ?? '',
      kcontent: s.badge ? s.kcontent : '',
    };
  });
  const prompt = [
    `Write one short sentence per place (max 20 words) in ${LANG_NAME[lang]} telling a traveler why it suits them.`,
    `Traveler likes: ${answers.q2}. Traveling: ${answers.q3}.`,
    'Use only the facts given. Do not mention filming locations, celebrities or K-content ties unless they appear in "kcontent". No emojis, no dashes.',
    'Return a JSON object mapping each id to its sentence.',
    JSON.stringify(facts),
  ].join('\n');
  const out = JSON.parse(await generate(prompt, { json: true }));
  return Object.fromEntries(picks.filter(({ id }) => typeof out[id] === 'string').map(({ id }) => [id, out[id].trim()]));
}

router.post('/quiz/recommend', async (req, res) => {
  const answers = validAnswers(req.body?.answers);
  if (!answers) return res.status(400).json({ error: 'bad_answers' });
  const lang = LANG_NAME[req.body?.lang] ? req.body.lang : 'en';
  try {
    const spotPool = await getPool();
    const byId = new Map(spotPool.items.map((s) => [s.id, s]));
    const picks = recommend(spotPool.items, answers);
    let reasons = null;
    try {
      reasons = await llmReasons(picks, byId, answers, lang);
    } catch (e) {
      console.warn('[quiz] LLM 사유 폴백:', e.message);
    }
    const items = picks.map((p) => ({ ...p, reason: reasons?.[p.id] ?? null }));
    const quizSessionId = crypto.randomUUID();
    const uid = readUserId(req);
    try {
      await pool.query('INSERT INTO quiz_sessions (id, user_id, answers, recommended) VALUES ($1, $2, $3, $4)', [
        quizSessionId,
        uid,
        JSON.stringify(answers),
        JSON.stringify(items),
      ]);
      if (uid) {
        const sessionId = UUID_RE.test(String(req.body?.sessionId ?? '')) ? req.body.sessionId : quizSessionId;
        await pool.query(
          "INSERT INTO journey_events (user_id, session_id, step, payload) VALUES ($1, $2, 'recommend', $3)",
          [uid, sessionId, JSON.stringify({ quizSessionId, count: items.length, llm: !!reasons })],
        );
      }
    } catch (e) {
      console.warn('[quiz] 저장 실패(응답은 진행):', e.message);
    }
    res.json({ source: spotPool.source, quizSessionId, llm: !!reasons, items });
  } catch (e) {
    console.error('[quiz] fallback:', e.message);
    res.json({ source: 'fallback', reason: e.message.slice(0, 120) });
  }
});

module.exports = router;
