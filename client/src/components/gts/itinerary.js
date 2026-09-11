// 방문 순서 파생(IA §9.5) · route/checkout/ticket 공유 규칙.
// 순서 = 점심 → 픽1 → 픽2 → 저녁(플랜별 가감). meals push 순서 = 점심, 저녁(PATTERNS §31),
// picks는 고른 순서 보존. venues는 조회만(data/gts 값 수정 금지).
// [V5-3] K-Route는 mealPlan 'none' → 순서 = picks · id → 스팟은 spots.resolveSpot(추천 결과 우선 · venues 폴백)
import { resolveSpot } from '../../data/gts/spots';

export function itineraryIds({ mealPlan, meals, picks }) {
  const ids = [];
  if (mealPlan !== 'none' && meals[0]) ids.push(meals[0]);
  ids.push(...picks);
  if (mealPlan === 'lunchDinner' && meals[1]) ids.push(meals[1]);
  return ids;
}

// [V3] itineraryIds 역파생 · Travel Log 템플릿(itinerary 전체 배열) → {meals, picks} 분리.
// 순서 규칙의 역함수: 첫 항목 = 점심(플랜 有), 마지막 항목 = 저녁(lunchDinner), 나머지 = picks.
export function splitItinerary(mealPlan, ids) {
  const rest = [...ids];
  const meals = [];
  if (mealPlan !== 'none' && rest.length) meals.push(rest.shift());
  if (mealPlan === 'lunchDinner' && rest.length) meals.push(rest.pop());
  return { meals, picks: rest };
}

// selection.recommended = 추천 스팟(없으면 venues.js만) · 반환 = 스팟(kind 'kto'|'venue')
export function itineraryVenues(selection) {
  return itineraryIds(selection)
    .map((id) => resolveSpot(id, selection.recommended))
    .filter(Boolean);
}

// [V7] DEPRECATED — 방문 순서 타임테이블 화면 제거로 소비자 0(롤백 대비 보존 · 삭제 금지).
// 구: 정오 기점 stayMin(120) 누적 시각 · §9.5 DRAFT 표기 규칙의 공유 구현(route + ticket §43).
// 시각표 생성이 아니라 표기 전용(코드 주석 한정 · 사용자 노출 초안 고지 없음 §10.4).
const NOON_MIN = 12 * 60;

export function itinerarySchedule(entries) {
  let acc = NOON_MIN;
  return entries.map((venue) => {
    const start = acc;
    acc += venue.stayMin;
    const h = String(Math.floor(start / 60)).padStart(2, '0');
    const m = String(start % 60).padStart(2, '0');
    return { venue, time: `${h}:${m}` };
  });
}
