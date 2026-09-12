// ============================================================
// lineSystem.js · [V5-9] K-콘텐츠 노선 체계 · 라인 3종 · 스탯 축 · 라인(타입) 판독
// 근거: SOURCE_SPOTS.md 태그(kType·anchor·grade) · tokens.lineColors 3색 · IA §11.3 설문 허용값.
// 라인 색·크루는 기존 3종(potato·dakgalbi·lake)을 K-콘텐츠 축으로 재배정한 것이다. 신규 색은 만들지 않는다(DESIGN §3·§16.1).
// 이 파일은 순수 데이터·순수 함수만 둔다(lucide·JSX 없음) → 아이콘은 quizQuestions.LINE_ICONS 소유.
// 셀프체크: node client/src/data/gts/lineSystem.check.mjs
// ============================================================

// 라인 3종 · colorToken = tokens.lineColors 키 · crew = public/images/crew 파일명
//   (크루 PNG는 현재 32×32 단색 스텁 = IA §7 PLACEHOLDER 대기분 · 실제 에셋이 들어오면 같은 경로로 교체된다)
// kType = SOURCE_SPOTS 태그 값 · 이 태그를 가진 앵커만 그 라인의 역(성지)이 된다.
export const LINES = [
  { id: 'drama', colorToken: 'lake', crew: 'lake', kType: 'kdrama' },
  { id: 'food', colorToken: 'dakgalbi', crew: 'dakgalbi', kType: 'kfood' },
  { id: 'anime', colorToken: 'potato', crew: 'potato', kType: 'kanime' },
];
export const LINE_IDS = LINES.map((l) => l.id);
export const lineMeta = (id) => LINES.find((l) => l.id === id) ?? null;

// Tailwind 정적 클래스 매핑(동적 클래스명은 생성되지 않는다 · LineChips·StopStrip 선례 문법).
// 라인 색은 면·도트·스트로크 전용이라 텍스트 컬러 매핑은 두지 않는다
//   (yellow 텍스트 금지 · spice 텍스트는 흰 면에서 3.4:1로 AA 미달 · DESIGN §16.1 + P2 실측).
export const LINE_BG = { drama: 'bg-primary', food: 'bg-spice', anime: 'bg-yellow' };
export const LINE_RING = { drama: 'ring-primary', food: 'ring-spice', anime: 'ring-yellow' };
// 라인 색 면 위에 글자를 얹을 때(지도 번호 핀 · 타임라인 노드)는 대비 규칙을 따른다:
//   yellow 면 위 흰 글자는 AA 미달이라 ink만 허용(DESIGN §2) · SuccessStamp.FACE와 같은 규칙의 단일 출처.
export const LINE_FACE = {
  drama: 'bg-primary text-white',
  food: 'bg-spice text-white',
  anime: 'bg-yellow text-ink',
};
// 라인에 속하지 않는 곳(연계 로컬)의 면. 라인 색을 쓰면 안 된다:
//   drama = lake = primary 라서 "기본 primary"를 폴백으로 두면 드라마 역과 연계 로컬이 같은 색이 된다(실측 2026-09-13).
//   색 없음으로 표현해 라인 역이 주인공으로 남게 한다.
export const NO_LINE_FACE = 'bg-surface text-ink';

// kType → 라인 · kpop은 라인을 만들지 않는다(venues·공사 풀에 K-팝 앵커 장소가 없다 · SOURCE_SPOTS §3 초상권 보류).
export const lineOfKType = (kType) => LINES.find((l) => l.kType === kType)?.id ?? null;

// 역(성지) = K배지 조건을 통과한 스팟만(SOURCE_SPOTS UI 노출 규칙 = 서버 spot.badge) ·
//   배지 없는 장소는 라인에 속하지 않고 연계 로컬로 남는다(근거 약한 성지 주장 금지 · SOURCE_SPOTS §8).
export const lineOfSpot = (spot) => (spot?.badge ? lineOfKType(spot.kType) : null);

// ---- 축제(기간 한정) ----
// [V5-10] 공사 축제(searchFestival2) → 라인 매핑. 근거 있는 것만 붙이고 애매하면 붙이지 않는다.
//   춘천막국수닭갈비축제 = SOURCE_SPOTS §1 이 K-푸드 앵커의 근거로 든 바로 그 축제("막국수닭갈비축제로 제도화") → food
//   춘천애니토이페스티벌 = SOURCE_SPOTS §4 애니메이션박물관의 근거인 애니타운페스티벌 계열 → anime
//   나머지 실측 6건(강원한우데이·춘천인형극제·술페스타 2종·썸머워터 페스티벌·춘천마임축제)은 K-콘텐츠 라인 근거가 없어 매핑하지 않는다.
//   축제는 상시 역이 아니라 기간 한정 배지다. 성지 주장·K배지는 그대로 SOURCE_SPOTS 앵커에만 붙는다(grade 규율 불변).
const FESTIVAL_LINES = [
  { key: '막국수닭갈비축제', line: 'food' },
  { key: '애니토이페스티벌', line: 'anime' },
];
const festKey = (s) => String(s ?? '').replace(/\s/g, '');
// 공사 축제 제목(원문 ko) → 라인 · 공백 무시 포함 판정("제38회 …" 같은 회차 접두를 견딘다) · 근거 없으면 null
export const lineOfFestival = (title) => {
  const t = festKey(title);
  return t ? FESTIVAL_LINES.find((f) => t.includes(f.key))?.line ?? null : null;
};

// ---- 스탯 축 ----
// 라인 축 3개 = 라인을 판별한다 / 보조 축 4개 = q2 성향(축 이름 = q2 답 값) · 라인을 직접 고르지 않는다.
export const LINE_AXES = ['drama', 'food', 'anime'];
export const SUB_AXES = ['photo', 'localfood', 'nature', 'cafe'];
export const AXES = [...LINE_AXES, ...SUB_AXES];

const Q1_LINE = { kfood: 'food', kdrama: 'drama', kanime: 'anime' }; // kpop·undecided는 라인 축을 올리지 않는다
// q2 성향의 라인 보정 · 애니는 q1 kanime 명시 선택으로만 올라간다(근거 있는 애니 앵커가 1곳뿐이라 성향만으로 배정하지 않는다).
const Q2_LINE = { photo: 'drama', nature: 'drama', localfood: 'food', cafe: 'food' };
const W_CONTENT = 3; // q1 콘텐츠 = 방문 동기(앵커)라 가중치가 가장 크다
const W_STYLE_LINE = 1; // q2 성향 = 라인 보정
const W_STYLE_SUB = 2; // q2 성향 = 보조 축 본값

// 게이지 채움 비율의 분모 · 라인 축 = 콘텐츠 3 + 성향 1 / 보조 축 = 성향 2
export const AXIS_MAX = Object.fromEntries([
  ...LINE_AXES.map((a) => [a, W_CONTENT + W_STYLE_LINE]),
  ...SUB_AXES.map((a) => [a, W_STYLE_SUB]),
]);

// 답 → 축 점수. q3(동행)·q4(체류)·q5(이동)은 장소 조건이지 취향 축이 아니라 축을 올리지 않는다
//   (없는 상관관계를 지어내지 않는다 · 문항마다의 반응은 레벨이 담당한다).
export function statsOf(answers) {
  const s = Object.fromEntries(AXES.map((a) => [a, 0]));
  for (const v of answers?.q1 ?? []) {
    const line = Q1_LINE[v];
    if (line) s[line] += W_CONTENT;
  }
  const q2 = answers?.q2;
  if (SUB_AXES.includes(q2)) {
    s[q2] += W_STYLE_SUB;
    s[Q2_LINE[q2]] += W_STYLE_LINE;
  }
  return s;
}

// 레벨 = 답을 마친 문항 수(0~5) · 크루 레벨 인디케이터가 쓴다(전 문항이 반응한다).
export const MAX_LEVEL = 5;
export function levelOf(answers) {
  const a = answers ?? {};
  return (a.q1?.length ? 1 : 0) + ['q2', 'q3', 'q4', 'q5'].filter((q) => a[q] != null).length;
}

// 최종 라인 = 라인 축 최고점 · 동점은 LINE_AXES 순서(drama → food → anime)로 결정론 고정.
//   q2가 항상 라인 축을 1 올리므로 답이 있으면 전 축 0은 나오지 않는다(답 없음만 null).
export function lineOf(answers) {
  const s = statsOf(answers);
  const best = LINE_AXES.reduce((a, b) => (s[b] > s[a] ? b : a));
  return s[best] > 0 ? best : null;
}
