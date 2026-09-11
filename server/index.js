// 서버 v1 · [G1] — Auth(데모 모드)·GTS 예약·리뷰·교통 프록시.
// CORS: CLIENT_ORIGIN + http://localhost:5173 만, credentials(지시 작업 6).
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { router: authRouter, clientOrigin } = require('./routes/auth');
const gtsRouter = require('./routes/gts');
const reviewsRouter = require('./routes/reviews');
const transitRouter = require('./routes/transit');
const trackRouter = require('./routes/track'); // [V1]
const adminRouter = require('./routes/admin'); // [V1]
const travelLogsRouter = require('./routes/travelLogs'); // [V3]
const profileRouter = require('./routes/profile'); // [V10] 프로필 사진 업로드(Vercel Blob)
const ratesRouter = require('./routes/rates'); // [V12] 환율 캐시(GET /api/rates)
const ktoRouter = require('./routes/kto'); // [V5-0] K-Route 스텁 4종(전부 200 fallback)
const quizRouter = require('./routes/quiz');
const chatRouter = require('./routes/chat');
const goRouter = require('./routes/go');

const app = express();
app.set('trust proxy', 1); // Render 등 프록시 뒤 secure 쿠키

// [OPS1] GET /health — 외부 업타임 핑 전용(Render 슬립 방지).
//   CORS/session/rate limit/인증 가드보다 먼저 등록: 이 라우트만 매칭돼 즉시 응답하므로 이후 미들웨어를 타지 않는다.
//   쿠키·Set-Cookie 없음(setUserCookie/ensureAnonKey 미호출·cookieParser 이전) · journey_events 무기록(트래킹은 POST /api/track 로그인 전용).
//   평시 DB 무접촉 · ?deep=1 일 때만 Neon SELECT 1(실패해도 500 아님 → 200 + db:"fail" 로 모니터 오탐 방지).
const healthPool = require('./db/pool');
const HEALTH_RL_WINDOW_MS = 60_000; // 분당 20회 상한(남용 방지) — 5분 핑은 여기 한참 못 미침
const HEALTH_RL_MAX = 20;
const healthHits = new Map(); // ip -> { start, count } · 고정 윈도, 커지면 만료분 정리
function healthAllowed(ip) {
  const now = Date.now();
  const rec = healthHits.get(ip);
  if (!rec || now - rec.start >= HEALTH_RL_WINDOW_MS) {
    healthHits.set(ip, { start: now, count: 1 });
    if (healthHits.size > 1000) for (const [k, v] of healthHits) if (now - v.start >= HEALTH_RL_WINDOW_MS) healthHits.delete(k);
    return true;
  }
  rec.count += 1;
  return rec.count <= HEALTH_RL_MAX;
}
app.get('/health', async (req, res) => {
  res.set('X-Robots-Tag', 'noindex'); // 색인 제외
  if (!healthAllowed(req.ip)) return res.status(429).json({ status: 'rate_limited' });
  const body = { status: 'ok', uptime: process.uptime(), ts: new Date().toISOString() };
  if (req.query.deep === '1') {
    try {
      await healthPool.query('SELECT 1');
      body.db = 'ok';
    } catch (e) {
      body.db = 'fail';
      console.warn('[health] deep DB fail:', e.message); // 로그는 db:"fail" 때만 1줄
    }
  }
  res.json(body);
});

// [V1-fix3] env 원값 대신 정규화된 clientOrigin — env 오염('ttps://…') 시 CORS도 함께 깨지던 사고 방어
const allowed = new Set(['http://localhost:5173', clientOrigin].filter(Boolean));
app.use(
  cors({
    origin: (origin, cb) => cb(null, !origin || allowed.has(origin)),
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', authRouter);
app.use('/api', gtsRouter);
app.use('/api', reviewsRouter);
app.use('/api', transitRouter);
app.use('/api', trackRouter); // [V1] 여정 트래킹
app.use('/api', adminRouter); // [V1] 관리자(requireAdmin 내장)
app.use('/api', travelLogsRouter); // [V3] Travel Log 발자취
app.use('/api', profileRouter); // [V10] 프로필 사진 업로드
app.use('/api', ratesRouter); // [V12] 환율
app.use('/api', ktoRouter); // [V5-0] 공사 OpenAPI 스텁
app.use('/api', quizRouter); // [V5-0] 취향 설문 추천 스텁
app.use('/api', chatRouter); // [V5-0] K-가이드 봇 스텁
app.use('/api', goRouter); // [V5-0] 현위치 교통 스텁

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`Bomnae Helper server listening on port ${PORT}`);
  // [V12] 환율 캐시 워밍(기동 시 1회 + 6시간 간격) · 실패해도 서버는 산다(환산만 숨김)
  require('./services/rates').startRatesCache();
  // [V5-2b] 공사 지역코드 매칭·캐시 + 춘천 목록 적재(24h 내 적재분 재사용) · 비차단 · 실패해도 서버는 산다(풀은 venues fallback)
  require('./services/ktoSpotService')
    .warm()
    .catch((e) => console.error('[kto] 기동 적재 실패(fallback):', e.message));
  // TAGO ID 캐시 워밍(지시 2: 기동 시 1회 · 실패해도 서버는 산다 — 해당 기능만 fallback)
  try {
    const { ensureIds } = require('./services/busService');
    await ensureIds();
  } catch (e) {
    console.error('[tago:bus] ID 캐시 실패(버스는 fallback):', e.message);
  }
  try {
    const { ensureTrainIds } = require('./services/trainService');
    await ensureTrainIds();
  } catch (e) {
    console.error('[tago:train] ID 캐시 실패(열차는 fallback):', e.message);
  }
});
