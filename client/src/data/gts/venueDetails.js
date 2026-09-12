// ============================================================
// venueDetails.js · [V2] 장소 상세 구조 데이터 (docs/Venue details.md v5)
// 텍스트 전문은 i18n venues 네임스페이스 소유 — 여기는 구조(문단 수·별점)만.
// guestReviews 는 전부 목업(mockReviews: true) — 실후기 아님(문서 규칙을 데이터에 명시).
// 문서 id ↔ 카드 데이터 id 매핑(venues.js가 카드 원본): gamja-batt → gamja-farm · mullegil → jungdo-mullegil.
// 이 표에 없는 실장소(soul-roastery·hwadong-2571·soyang-dam·soyang-maiden·art-circle)와
//   mock 카드는 "목업 카드 공통 상세"(venues.v.mock) 한 벌을 재사용 — 문서에 없는 정보 창작 금지.
//
// [VERIFY] 대기 값(UI 미표기 · 문서 원문 주석 이관 — 사용자 실측 후 i18n 값 갱신):
//   gamja-farm.price      감자빵 3,500원선 [VERIFY]
//   tongnamujip.address   정확한 지점 주소 [VERIFY exact branch address] · price 1인 14,000원선 [VERIFY]
//   skywalk.hours         현재 시즌 운영 시간 [VERIFY current season] · price 상품권 환급 조건 [VERIFY]
//   jungdo-mullegil       address 선착장 주소 [VERIFY dock address] · hours [VERIFY] · 대여료 [VERIFY fee]
//   gongjicheon.price     자전거 대여료 [VERIFY fee]
// ============================================================

export const VENUE_DETAILS = {
  'gamja-farm': { paragraphs: 3, ratings: [5, 5, 4], mockReviews: true },
  tongnamujip: { paragraphs: 3, ratings: [5, 5, 4], mockReviews: true },
  skywalk: { paragraphs: 3, ratings: [5, 4, 5], mockReviews: true },
  'jungdo-mullegil': { paragraphs: 2, ratings: [5, 5, 4], mockReviews: true },
  gongjicheon: { paragraphs: 2, ratings: [5, 4, 5], mockReviews: true },
  'baekil-kalguksu': { paragraphs: 2, ratings: [5, 5, 4], mockReviews: true },
  'hoeyeongru': { paragraphs: 2, ratings: [4, 5, 4], mockReviews: true },
  'saemto-dakgalbi': { paragraphs: 2, ratings: [5, 4, 5], mockReviews: true },
  'wonjo-charcoal-dak': { paragraphs: 2, ratings: [5, 4, 4], mockReviews: true },
  'onefive-dakgalbi': { paragraphs: 2, ratings: [5, 5, 4], mockReviews: true },
  'todam-galbi': { paragraphs: 2, ratings: [5, 4, 5], mockReviews: true },
  'soul-roastery': { paragraphs: 2, ratings: [5, 5, 4], mockReviews: true },
  'hwadong-2571': { paragraphs: 3, ratings: [4, 5, 4], mockReviews: true },
  'earth17-cafe': { paragraphs: 2, ratings: [5, 5, 4], mockReviews: true },
  'mom-in-garden': { paragraphs: 2, ratings: [5, 4, 5], mockReviews: true },
  'saempildeu-cafe': { paragraphs: 2, ratings: [5, 5, 5], mockReviews: true },
  'choilang': { paragraphs: 2, ratings: [5, 5, 4], mockReviews: true },
  'character-indeo': { paragraphs: 2, ratings: [4, 5, 4], mockReviews: true },
  'cafe-nas': { paragraphs: 2, ratings: [5, 4, 5], mockReviews: true },
  'arcape-coffee': { paragraphs: 2, ratings: [5, 5, 5], mockReviews: true },
  'soyang-dam': { paragraphs: 3, ratings: [5, 4, 5], mockReviews: true },
  'soyang-maiden': { paragraphs: 2, ratings: [5, 5, 4], mockReviews: true },
  'art-circle': { paragraphs: 2, ratings: [5, 4, 5], mockReviews: true },
  'gangchon-railpark': { paragraphs: 3, ratings: [5, 5, 4], mockReviews: true },
  'chuncheon-national-museum': { paragraphs: 3, ratings: [5, 4, 5], mockReviews: true },
  'chuncheon-makguksu-museum': { paragraphs: 3, ratings: [5, 4, 4], mockReviews: true },
  'legoland': { paragraphs: 3, ratings: [4, 5, 4], mockReviews: true },
  'animation-museum': { paragraphs: 2, ratings: [5, 4, 5], mockReviews: true },
};

export default VENUE_DETAILS;
