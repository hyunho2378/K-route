// [V3] Travel Log 목업 시드 6건(mock: true) — GET /api/travel-logs 응답에 병합되는 서버 시드.
// 결정: DB gts_bookings 시드 대신 서버 상수 — users 스키마에 국가 컬럼이 없어 DB 경유로는
//   카드 명세(이니셜+국가)를 채울 수 없음(명세 밖 결정 · 완료 보고). 실 로그는 DB에서 집계.
// 장소는 전부 venues.js 실명 id 조합(창작 장소 0) · 날짜는 고정 연출값(과거 완료 여정) ·
// 이니셜·국가는 목업 여행자(실인물 아님 · docs/Venue details.md 목업 리뷰 메타와 동일 세계관).
// itinerary 순서 = 점심 → 픽 → (저녁) — 클라 itinerary.js 공유 규칙과 동일.
// 클라 오프라인 폴백 미러: client/src/data/gts/travelLogSeeds.js (동시 수정 계약).
const MOCK_LOGS = [
  {
    code: 'LOGSD1',
    mock: true,
    author: 'P.',
    country: { en: 'Thailand', ko: '태국', th: 'ไทย' },
    party: 2,
    mealPlan: 'lunch',
    itinerary: ['tongnamujip', 'skywalk', 'gamja-farm'],
    travelDate: '2026-06-14',
  },
  {
    code: 'LOGSD2',
    mock: true,
    author: 'D.',
    country: { en: 'Australia', ko: '호주', th: 'ออสเตรเลีย' },
    party: 2,
    mealPlan: 'none',
    itinerary: ['jungdo-mullegil', 'soul-roastery'],
    travelDate: '2026-04-27',
  },
  {
    code: 'LOGSD3',
    mock: true,
    author: 'J.',
    country: { en: 'Japan', ko: '일본', th: 'ญี่ปุ่น' },
    party: 4,
    mealPlan: 'lunch',
    itinerary: ['tongnamujip', 'chuncheon-makguksu-museum', 'gongjicheon'],
    travelDate: '2026-02-09',
  },
  {
    code: 'LOGSD4',
    mock: true,
    author: 'A.',
    country: { en: 'Singapore', ko: '싱가포르', th: 'สิงคโปร์' },
    party: 3,
    mealPlan: 'none',
    itinerary: ['gamja-farm', 'soyang-dam'],
    travelDate: '2025-12-05',
  },
  {
    code: 'LOGSD5',
    mock: true,
    author: 'L.',
    country: { en: 'Vietnam', ko: '베트남', th: 'เวียดนาม' },
    party: 2,
    mealPlan: 'lunch',
    itinerary: ['tongnamujip', 'soyang-maiden', 'hwadong-2571'],
    travelDate: '2025-10-18',
  },
  {
    code: 'LOGSD6',
    mock: true,
    author: 'F.',
    country: { en: 'France', ko: '프랑스', th: 'ฝรั่งเศส' },
    party: 5,
    mealPlan: 'none',
    itinerary: ['skywalk', 'gongjicheon'],
    travelDate: '2025-08-23',
  },
];

module.exports = MOCK_LOGS;
