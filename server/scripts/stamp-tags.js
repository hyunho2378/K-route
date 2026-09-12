// [V5-6] NFC 스티커에 심을 URL 목록 · 실행: node scripts/stamp-tags.js [클라이언트 오리진]
//   오리진 = 인자 → CLIENT_ORIGIN → http://localhost:5173
//   토큰은 SESSION_SECRET 에서 나온다 → 배포용 스티커는 배포 서버와 같은 SESSION_SECRET 으로 뽑아야 인증된다
require('dotenv').config({ quiet: true });
const { stampable, tagToken } = require('../services/stampService');

const origin = (process.argv[2] || process.env.CLIENT_ORIGIN || 'http://localhost:5173').replace(/\/$/, '');
for (const s of stampable()) console.log(`${s.kType.padEnd(7)} ${s.id.padEnd(28)} ${origin}/stamp/${s.id}/${tagToken(s.id)}`);
