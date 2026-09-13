// [V5-2] 취향 설문 추천 엔진 · IA §11.4 결정론(LLM 무관) · 입력 = 하이브리드 풀 항목 + quiz answers.
// 가중표 = IA §11.4 + 사용자 채택 초안(2026-09-11): 장소별 성향·동행 데이터가 없어 category·SOURCE kType·실좌표로 파생.
//   q1 콘텐츠(복수) +5 배지 앵커 & kType 일치 / +2 연계 = 배지 없는 local 실좌표 장소가 매칭 앵커 LINK_KM 이내
//   q2 성향 +3 (STYLE) · q3 동행 +1 (COMPANY) · q5 대중교통 & 실좌표 & 중심 CITY_KM 밖 -2
//   동점 = 집중률 낮은 순(congestion 없는 항목은 뒤) → 풀 원래 순서 · 출력 수 = q4 반나절 8 / 하루 12
// coord null(DEMO 좌표) 장소는 거리 조건(연계·시내 밖) 판정 제외. 셀프체크: node services/recommendService.js
// [V5-3] K-푸드 보정(사용자 지시 2026-09-11): q1에 kfood가 있으면 SOURCE kfood·강함 앵커 +KFOOD_BOOST ·
//   대중교통 거리 페널티 면제(좌표 없음·PLACEHOLDER 좌표 앵커 포함). SOURCE 원문·태그는 그대로, 점수 로직만 보정.
//   진단(보정 전): 성향 photo·동행 solo/family면 연계 2 + 성향 3 + 동행 1 = 6점 로컬이 앵커(5)를 밀어 강함 앵커 1/8 노출.
const ANSWERS = {
  q1: ['kfood', 'kdrama', 'kanime', 'kpop', 'undecided'], // 복수 · kType 표기 동일(kpop은 venue 앵커 없음 · SOURCE §3)
  q2: ['photo', 'localfood', 'nature', 'cafe'],
  q3: ['solo', 'friends', 'family'],
  q4: ['half', 'day'],
  q5: ['transit', 'taxi'],
};
const CENTER = [127.73, 37.8813]; // PATTERNS §21 춘천 권역 중심 [lng, lat]
const LINK_KM = 1.5; // PLACEHOLDER · 공사 연관관광지 연결 시 거리 대신 연관 목록으로 교체
const CITY_KM = 5; // PLACEHOLDER · "시내" 반경
const COUNT = { half: 8, day: 12 };
// 비앵커 최고점(연계 2 + 성향 3 + 동행 1 = 6) < kfood·강함 앵커 최저점(앵커 5 + 보정 2 = 7)
const KFOOD_BOOST = 2;
// [V5-2b] 공사 스팟은 SOURCE kType이 없어(local) cat1으로 판정 · categoryCode2 이름: A01 자연 · A02 인문(문화/예술/역사)
const STYLE = {
  localfood: (s) => s.category === 'meal' || s.kType === 'kfood',
  cafe: (s) => s.category === 'foodspace',
  nature: (s) => s.category === 'activity' && (s.kType === 'landmark' || s.kType === 'kdrama' || s.cat1 === 'A01'),
  photo: (s) => s.category === 'activity' && (s.kType === 'landmark' || s.kType === 'kanime' || s.cat1 === 'A02'),
};
const COMPANY = { solo: 'foodspace', friends: 'meal', family: 'activity' };

// 하버사인 거리(km) · 좌표 [lng, lat]
const km = ([lng1, lat1], [lng2, lat2]) => {
  const r = Math.PI / 180;
  const a =
    Math.sin(((lat2 - lat1) * r) / 2) ** 2 +
    Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(((lng2 - lng1) * r) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(a));
};

// answers 검증 · 틀리면 null(라우트가 400)
function validAnswers(a) {
  if (!a || !Array.isArray(a.q1) || !a.q1.length || !a.q1.every((v) => ANSWERS.q1.includes(v))) return null;
  for (const q of ['q2', 'q3', 'q4', 'q5']) if (!ANSWERS[q].includes(a[q])) return null;
  return { q1: [...new Set(a.q1)], q2: a.q2, q3: a.q3, q4: a.q4, q5: a.q5 };
}

// pool 항목: { id, kind, category, coord, kType, badge, congestion? } → [{ id, kind, score, reasonKey }]
function recommend(pool, answers) {
  const picked = new Set(answers.q1);
  const anchorCoords = pool.filter((s) => s.badge && picked.has(s.kType) && s.coord).map((s) => s.coord);
  return pool
    .map((s, order) => {
      let score = 0;
      let why = 'default';
      const anchor = s.badge && picked.has(s.kType); // [V5-13] 고른 콘텐츠의 성지 = 방문 이유 그 자체
      const kfoodFirst = picked.has('kfood') && anchor && s.kType === 'kfood' && s.grade === '강함';
      if (anchor) {
        score += 5 + (kfoodFirst ? KFOOD_BOOST : 0);
        why = 'anchor';
      } else if (s.kType === 'local' && s.coord && anchorCoords.some((c) => km(c, s.coord) <= LINK_KM)) {
        score += 2;
        why = 'linked';
      }
      if (STYLE[answers.q2](s)) {
        score += 3;
        if (why === 'default') why = 'style';
      }
      if (s.category === COMPANY[answers.q3]) {
        score += 1;
        if (why === 'default') why = 'company';
      }
      // [V5-13] 대중교통 거리 페널티는 앵커에 걸지 않는다(기존 kfood 전용 면제를 고른 라인 전체로 넓힘).
      //   실측 2026-09-13: q1=kdrama 에서 유일한 드라마 앵커(남이섬)가 5-2=3 이 되어 무관한 공원·도서관과 동점이 되고
      //   동점 정렬(집중률 → 풀 순서)에 밀려 추천 12곳에서 통째로 빠졌다 = "드라마를 골랐는데 드라마 장소가 없다".
      //   성지는 멀어도 방문 이유라 거리로 강등하지 않는다(먼 곳이라는 사실은 동선 화면이 거리·시간으로 말한다).
      if (!anchor && answers.q5 === 'transit' && s.coord && km(CENTER, s.coord) > CITY_KM) score -= 2;
      return { s, score, why, order };
    })
    .sort((a, b) => b.score - a.score || (a.s.congestion ?? Infinity) - (b.s.congestion ?? Infinity) || a.order - b.order)
    .slice(0, COUNT[answers.q4])
    .map(({ s, score, why }) => ({ id: s.id, kind: s.kind, score, reasonKey: `quiz.reason.${why}` }));
}

module.exports = { recommend, validAnswers, ANSWERS, km };

if (require.main === module) {
  const assert = require('assert');
  const near = [127.7305, 37.8815];
  const pool = [
    { id: 'cafe-far', kind: 'venue', category: 'foodspace', coord: [127.9, 37.95], kType: 'local', badge: false },
    { id: 'dak', kind: 'venue', category: 'meal', coord: near, kType: 'kfood', badge: true },
    { id: 'near-local', kind: 'venue', category: 'foodspace', coord: [127.731, 37.882], kType: 'local', badge: false },
    { id: 'weak', kind: 'venue', category: 'activity', coord: near, kType: 'kdrama', badge: false },
    { id: 'demo', kind: 'venue', category: 'meal', coord: null, kType: 'local', badge: false },
  ];
  const r = recommend(pool, { q1: ['kfood'], q2: 'localfood', q3: 'friends', q4: 'half', q5: 'transit' });
  // dak 5+3+1 앵커 / demo 3+1(좌표 없음 → 연계 제외) / near-local 연계 2 / weak 근거없음 kdrama 0 / cafe-far 시내 밖 -2
  assert.deepStrictEqual(
    r.map((x) => [x.id, x.score, x.reasonKey]),
    [
      ['dak', 9, 'quiz.reason.anchor'],
      ['demo', 4, 'quiz.reason.style'],
      ['near-local', 2, 'quiz.reason.linked'],
      ['weak', 0, 'quiz.reason.default'],
      ['cafe-far', -2, 'quiz.reason.default'],
    ],
  );
  // 공사 스팟(kType local)은 cat1으로 성향 판정: A01 자연 → nature +3, 가족 → activity +1
  const kto = recommend([{ id: '126', kind: 'kto', category: 'activity', coord: null, kType: 'local', badge: false, cat1: 'A01' }], {
    q1: ['undecided'], q2: 'nature', q3: 'family', q4: 'half', q5: 'taxi',
  });
  assert.deepStrictEqual(kto.map((x) => [x.id, x.score, x.reasonKey]), [['126', 4, 'quiz.reason.style']]);
  // [V5-3] K-푸드 보정: photo·가족 6점 연계 로컬보다 강함 앵커(7)가 위 · 먼 강함 앵커도 거리 페널티 면제 · 중간 앵커는 보정 없음
  const kf = recommend(
    [
      { id: 'photo-local', kind: 'kto', category: 'activity', coord: near, kType: 'local', badge: false, cat1: 'A02' },
      { id: 'far-dak', kind: 'venue', category: 'meal', coord: [127.9, 37.95], kType: 'kfood', badge: true, grade: '강함' },
      { id: 'near-dak', kind: 'venue', category: 'meal', coord: near, kType: 'kfood', badge: true, grade: '강함' },
      { id: 'mid-dak', kind: 'venue', category: 'meal', coord: null, kType: 'kfood', badge: true, grade: '중간' },
    ],
    { q1: ['kfood'], q2: 'photo', q3: 'family', q4: 'half', q5: 'transit' },
  );
  assert.deepStrictEqual(
    kf.map((x) => [x.id, x.score]),
    [['far-dak', 7], ['near-dak', 7], ['photo-local', 6], ['mid-dak', 5]],
  );
  // [V5-13] 고른 라인의 앵커는 멀어도 페널티가 없다(kfood 전용 면제의 일반화) · 유일한 드라마 앵커가 무관한 장소에 밀리지 않는다
  const kd = recommend(
    [
      { id: 'far-anchor', kind: 'kto', category: 'activity', coord: [127.52, 37.79], kType: 'kdrama', badge: true, grade: '중간' },
      { id: 'photo-local', kind: 'kto', category: 'activity', coord: near, kType: 'local', badge: false, cat1: 'A02' },
    ],
    { q1: ['kdrama'], q2: 'photo', q3: 'solo', q4: 'half', q5: 'transit' },
  );
  assert.deepStrictEqual(kd.map((x) => [x.id, x.score]), [['far-anchor', 5], ['photo-local', 3]]);
  assert.strictEqual(validAnswers({ q1: ['kfood'], q2: 'x', q3: 'solo', q4: 'half', q5: 'taxi' }), null);
  assert.strictEqual(validAnswers({ q1: [], q2: 'cafe', q3: 'solo', q4: 'half', q5: 'taxi' }), null);
  console.log('recommend 셀프체크 PASS');
}
