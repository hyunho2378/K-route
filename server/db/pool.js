// pg Pool 단일 인스턴스 · DATABASE_URL(Neon)은 URL에 sslmode 포함 전제.
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Neon 등 관리형 PG: URL sslmode와 무관하게 TLS 강제(로컬 PG면 PGSSLMODE=disable로 우회 가능)
  ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false },
  max: 5,
});

// [V5-3] 유휴 연결이 끊기면(Neon 유휴 종료·네트워크) pg Pool이 'error'를 내는데 리스너가 없으면 프로세스가 죽는다
//   (검증 2026-09-11: 동시 검증 중 API 서버 exit 1) → 경고만 남기고, 풀은 끊긴 클라이언트를 버린 뒤 다음 요청에 새로 연결한다
pool.on('error', (e) => console.warn('[db] 유휴 연결 끊김(다음 요청에 재연결):', e.message));

module.exports = pool;
