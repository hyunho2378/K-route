// [V5-6] K-가이드 봇 지식베이스 적재 · 실행: node scripts/build-knowledge.js
//   공사 API 를 많이 부른다(상세 미캐시 장소 × 3 · 공사 장소마다 연관 관광지 1 · 관광지 odii × 2) → 하루 한 번 이하
//   odii 한도 초과면 odii 만 건너뛰고 나머지를 적재한다(기존 odii 행 유지) · 한도가 풀리면 다시 실행
require('dotenv').config({ quiet: true });
const { build } = require('../services/ragService');

const t0 = Date.now();
build()
  .then((t) => {
    console.log(`[knowledge] 완료 ${Math.round((Date.now() - t0) / 1000)}s ·`, JSON.stringify(t));
    process.exit(0);
  })
  .catch((e) => {
    console.error('[knowledge] 실패:', e.message);
    process.exit(1);
  });
