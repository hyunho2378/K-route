// lineSystem 셀프체크 · 실행: node client/src/data/gts/lineSystem.check.mjs
// 어디서도 import 하지 않으므로 클라이언트 번들에 들어가지 않는다(순수 함수만 검증).
import assert from 'node:assert/strict';
import { lineColors } from '../../tokens.js';
import {
  AXIS_MAX,
  LINES,
  LINE_BG,
  LINE_RING,
  levelOf,
  lineOf,
  lineOfKType,
  lineOfSpot,
  statsOf,
} from './lineSystem.js';

// 라인 색은 tokens.lineColors 3색과 1:1 · 신규 색을 만들지 않았는지(DESIGN §3)
assert.deepEqual([...LINES.map((l) => l.colorToken)].sort(), Object.keys(lineColors).sort());
assert.equal(LINES.length, 3);
// 클래스 매핑은 세 라인 전부 존재(동적 클래스명 금지라 표가 비면 색이 사라진다)
for (const { id } of LINES) {
  assert.ok(LINE_BG[id] && LINE_RING[id], `클래스 매핑 누락: ${id}`);
}

// kType → 라인 · K-팝은 앵커 장소가 없어 라인을 만들지 않는다(SOURCE_SPOTS §3)
assert.equal(lineOfKType('kfood'), 'food');
assert.equal(lineOfKType('kdrama'), 'drama');
assert.equal(lineOfKType('kanime'), 'anime');
assert.equal(lineOfKType('kpop'), null);
assert.equal(lineOfKType('landmark'), null);

// 역(성지)은 K배지 통과 스팟만 · 배지 없는 같은 태그는 라인에 넣지 않는다(성지 주장 금지)
assert.equal(lineOfSpot({ badge: true, kType: 'kfood' }), 'food');
assert.equal(lineOfSpot({ badge: false, kType: 'kdrama' }), null); // 공지천 = 근거없음
assert.equal(lineOfSpot(null), null);

// 점수 · q1 kfood(3) + q2 cafe(라인 +1 · 보조 +2)
const s1 = statsOf({ q1: ['kfood'], q2: 'cafe' });
assert.equal(s1.food, 4);
assert.equal(s1.cafe, 2);
assert.equal(s1.drama, 0);
assert.equal(s1.anime, 0);
assert.equal(lineOf({ q1: ['kfood'], q2: 'cafe' }), 'food');

// q3~q5는 축을 올리지 않는다(장소 조건이라 취향 축이 아니다)
assert.deepEqual(statsOf({ q1: ['kfood'], q2: 'cafe', q3: 'family', q4: 'day', q5: 'taxi' }), s1);

// 애니는 명시 선택(kanime)으로만 · 성향만으로는 배정되지 않는다
assert.equal(lineOf({ q1: ['kanime'], q2: 'localfood' }), 'anime'); // 3 vs 1
assert.equal(lineOf({ q1: ['undecided'], q2: 'photo' }), 'drama'); // 콘텐츠 미정 → 성향 보정만
assert.equal(lineOf({ q1: ['kpop'], q2: 'localfood' }), 'food'); // K-팝은 라인 축 0

// 동점은 LINE_AXES 순서로 결정론 고정(drama → food → anime)
assert.equal(lineOf({ q1: ['kfood', 'kdrama'], q2: 'nature' }), 'drama'); // drama 3+1 vs food 3
assert.equal(lineOf({ q1: ['kfood', 'kdrama'], q2: 'cafe' }), 'food'); // food 3+1 vs drama 3
assert.equal(lineOf({}), null); // 답 없음

// 게이지 분모가 실제 최대 점수와 일치(막대가 100%를 넘지 않는다)
const full = statsOf({ q1: ['kfood', 'kdrama', 'kanime'], q2: 'photo' });
for (const [axis, max] of Object.entries(AXIS_MAX)) {
  assert.ok(full[axis] <= max, `${axis} 상한 초과: ${full[axis]} > ${max}`);
}
assert.equal(full.drama, AXIS_MAX.drama); // 콘텐츠 3 + 성향 1 = 상한

// 레벨 = 답을 마친 문항 수
assert.equal(levelOf({}), 0);
assert.equal(levelOf({ q1: [] }), 0);
assert.equal(levelOf({ q1: ['kfood'] }), 1);
assert.equal(levelOf({ q1: ['kfood'], q2: 'cafe', q3: 'solo', q4: 'half', q5: 'taxi' }), 5);

console.log('lineSystem 셀프체크 PASS');
