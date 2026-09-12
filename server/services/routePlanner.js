// [V5-5] 리듬 코스 동선 설계 · 문제 C(춘천 대중교통 분산·긴 배차·이른 막차)를 순서 설계로 푸는 결정론 엔진(LLM 무관).
// 입력 = 담은 스팟(공사 contentid | venue id 혼재 · 좌표 보유분만 순서 계산) · 출력 = 순서 + 구간 타임라인 + 정량 지표.
//
// 세 가지 데이터로만 판단한다(지어내지 않는다):
//   (a) 묶기  = 공사 연관관광지(TarRlteTarService1): 두 스팟이 서로의 연관 목록에 있으면 인접 배치에 가산.
//               연관 데이터는 같은 시도 안에서만 연결된다(실측 2026-09-12: 춘천 기준 1412행 100% 강원).
//   (b) 혼잡  = 공사 집중률(TatsCnctrRateService): 일 단위 30일 예측만 제공(시간대 값 없음)이라
//               "시간대 회피"가 아니라 "날짜 회피"로 쓴다(사용자 결정 2026-09-12): 코스 전체 집중률 합이 가장 낮은 날 추천.
//   (c) 실현  = 시내버스 배차·막차: TAGO 시내버스 4개 서비스가 우리 키로 403 미등록(scripts/probe-citybus.js)이라
//               아래 ASSUME 상수(사용자 제공 사업계획서 수치)로 판정한다. 실측 시간표 아님 · 응답의 assumed:true 로 고지.
//
// 순서 선택: 좌표 있는 스팟의 모든 순열(≤ PERM_MAX!)을 비용으로 비교하는 완전탐색(결정론 · 동점이면 담은 순서 우선).
//   비용 = 이동 + 대기 + 막차 이후 구간 페널티 − 연관 인접 가산. 좌표 없는 스팟은 거리 계산에서 빼고 순서 뒤에 붙인다.
// 셀프체크: node services/routePlanner.js
const { km } = require('./recommendService');

const STAY_MIN = 120; // IA §9.4 픽 1개 = 2시간 슬롯(client SLOT_MIN 동일)
const ROAD_FACTOR = 1.3; // PLACEHOLDER · 직선 → 도로 보정(routes/go.js·client distance.js 동일 값)
const PERM_MAX = 6; // 완전탐색 상한(6! = 720) · 초과하면 담은 순서 그대로 비용만 계산

// PLACEHOLDER · 전부 실측 아님. (c) 근거: 사용자 제공 사업계획서 수치(외곽 배차 60~180분 · 막차 17:30) +
//   TAGO 시내버스 미등록. 키 승인 후 probe-citybus.js로 오퍼레이션을 채택하면 이 블록을 live 조회로 교체한다.
const ASSUME = {
  transitKmh: 20, // 시내버스 표정속도 가정
  outerKm: 5, // 중심에서 이 거리 밖 = 외곽(recommendService CITY_KM 동일 기준)
  outerHeadwayMin: [60, 180], // 외곽 배차 범위 · 대기는 중간값의 절반으로 계산
  lastBus: '17:30', // 외곽 막차
  startTime: '10:00', // 기본 출발 시각(첫 장소 도착 기준)
};
const CENTER = [127.73, 37.8813]; // PATTERNS §21 춘천 권역 중심 [lng, lat](recommendService와 동일)

const hhmm = (min) => `${String(Math.floor(min / 60) % 24).padStart(2, '0')}:${String(Math.round(min) % 60).padStart(2, '0')}`;
const toMin = (s) => {
  const [h, m] = String(s).split(':').map(Number);
  return h * 60 + m;
};
const isOuter = (spot) => !!spot.coord && km(CENTER, spot.coord) > ASSUME.outerKm;
// 외곽이 한쪽이라도 끼면 외곽 배차 대기(중간값의 절반) · 시내 구간은 근거 수치가 없어 0(대기 미산정)
const headwayMid = (ASSUME.outerHeadwayMin[0] + ASSUME.outerHeadwayMin[1]) / 2;
const waitMinOf = (a, b) => (isOuter(a) || isOuter(b) ? headwayMid / 2 : 0);
const travelMinOf = (a, b) =>
  a.coord && b.coord ? Math.round(((km(a.coord, b.coord) * ROAD_FACTOR) / ASSUME.transitKmh) * 60) : 0;

// 한 순서의 구간·시각 · 막차 판정 = 그 구간 출발 시각이 막차를 넘겼는가(외곽 구간만 버스 대상)
function legsOf(order, startMin) {
  const legs = [];
  let at = startMin;
  order.forEach((spot, i) => {
    if (i === 0) return;
    const prev = order[i - 1];
    const departAt = at + STAY_MIN;
    // 한쪽이라도 좌표가 없으면 거리를 모른다 → 이동·대기·막차를 지어내지 않는다(unknown 구간)
    const known = !!(prev.coord && spot.coord);
    const outer = known && (isOuter(prev) || isOuter(spot));
    const wait = known ? waitMinOf(prev, spot) : 0;
    const travel = known ? travelMinOf(prev, spot) : 0;
    const arriveAt = departAt + wait + travel;
    legs.push({
      fromId: prev.id,
      toId: spot.id,
      km: known ? Math.round(km(prev.coord, spot.coord) * 10) / 10 : null,
      outer,
      unknown: !known,
      waitMin: Math.round(wait),
      travelMin: known ? travel : null,
      departAt: hhmm(departAt),
      arriveAt: hhmm(arriveAt),
      // 외곽 버스 구간인데 출발이 막차 이후 = 대중교통으로 못 감(택시 필요)
      afterLastBus: outer && departAt > toMin(ASSUME.lastBus),
    });
    at = arriveAt;
  });
  return legs;
}

const LAST_BUS_PENALTY = 600; // 막차 이후 구간 1개 = 10시간치 비용(실현 가능 순서를 항상 앞세운다)
const RELATED_BONUS = 20; // 연관 인접 1쌍 = 20분치 가산(묶기 효과 · 이동·대기와 같은 단위)

function costOf(order, startMin, relatedPair) {
  const legs = legsOf(order, startMin);
  let cost = 0;
  legs.forEach((l, i) => {
    cost += (l.travelMin ?? 0) + l.waitMin + (l.afterLastBus ? LAST_BUS_PENALTY : 0);
    if (relatedPair(order[i].id, order[i + 1].id)) cost -= RELATED_BONUS;
  });
  return cost;
}

// 순열(결정론 · 사전순 = 입력 순서 기준)
function* permutations(list) {
  if (list.length <= 1) {
    yield list;
    return;
  }
  for (let i = 0; i < list.length; i += 1) {
    const rest = [...list.slice(0, i), ...list.slice(i + 1)];
    for (const p of permutations(rest)) yield [list[i], ...p];
  }
}

// spots: [{ id, name:{ko}, coord|null, congestionBand? }]
// deps.relatedNames(nameKo) → 연관 관광지 이름 배열 · deps.congestionDays(nameKo) → [{ baseYmd, rate, band }]
// options: { date 'YYYYMMDD', startTime 'HH:MM' }
async function planRoute(spots, options = {}, deps = {}) {
  const startMin = toMin(options.startTime ?? ASSUME.startTime);
  const withCoord = spots.filter((s) => s.coord);
  const noCoord = spots.filter((s) => !s.coord);

  // (a) 묶기 · 연관 목록(이름) → 쌍 판정 · 조회 실패는 가산 없음으로 흡수
  const relNames = new Map();
  if (deps.relatedNames) {
    for (const s of spots) {
      relNames.set(s.id, new Set((await deps.relatedNames(s.name?.ko).catch(() => [])).map(normName)));
    }
  }
  const relatedPair = (aId, bId) => {
    const a = spots.find((s) => s.id === aId);
    const b = spots.find((s) => s.id === bId);
    return nameHit(relNames.get(aId), b?.name?.ko) || nameHit(relNames.get(bId), a?.name?.ko);
  };

  // 순서 선택 · 완전탐색(상한 초과면 담은 순서) + 무작위 순서 기준선(전 순열 평균 대기)
  let best = withCoord;
  let bestCost = Infinity;
  let waitSum = 0;
  let timeSum = 0;
  let permCount = 0;
  if (withCoord.length <= PERM_MAX) {
    for (const p of permutations(withCoord)) {
      permCount += 1;
      const lg = legsOf(p, startMin);
      waitSum += lg.reduce((n, l) => n + l.waitMin, 0);
      timeSum += lg.reduce((n, l) => n + l.waitMin + (l.travelMin ?? 0), 0);
      const c = costOf(p, startMin, relatedPair);
      if (c < bestCost) {
        bestCost = c;
        best = p;
      }
    }
  }
  const order = [...best, ...noCoord];
  const legs = legsOf(order, startMin);
  const chosenWait = legs.reduce((n, l) => n + l.waitMin, 0);
  const chosenTime = legs.reduce((n, l) => n + l.waitMin + (l.travelMin ?? 0), 0);

  // (b) 혼잡 · 날짜 회피(집중률은 일 단위) · 선택일 혼잡 수 vs 30일 중 합이 가장 낮은 날
  const congestion = await pickDate(spots, options.date, deps.congestionDays);

  const relatedPairs = legs.filter((l) => relatedPair(l.fromId, l.toId)).length;
  return {
    order: order.map((s) => s.id),
    stops: order.map((s, i) => ({
      id: s.id,
      arriveAt: hhmm(startMin + legs.slice(0, i).reduce((n, l) => n + l.waitMin + (l.travelMin ?? 0) + STAY_MIN, 0)),
      stayMin: STAY_MIN,
      noCoord: !s.coord,
    })),
    legs,
    metrics: {
      // 무작위 순서(전 순열 평균) 대비 절감 · 순열을 다 못 돈 경우(상한 초과) null
      //   waitSaved = 대기만(외곽 배차 가정) · timeSaved = 이동 + 대기(화면 표기는 이쪽 · 순서가 실제로 바꾸는 값)
      waitSavedMin: permCount ? Math.round(waitSum / permCount - chosenWait) : null,
      timeSavedMin: permCount ? Math.round(timeSum / permCount - chosenTime) : null,
      waitMin: chosenWait,
      timeMin: chosenTime,
      lastBusOk: legs.every((l) => !l.afterLastBus),
      lastBusAt: ASSUME.lastBus,
      firstFailIdx: legs.findIndex((l) => l.afterLastBus),
      relatedPairs,
      ...congestion,
    },
    assumed: true, // 배차·막차·속도는 ASSUME 상수(실측 아님) · 화면 고지 대상
    assumptions: ASSUME,
  };
}

const normName = (s) => String(s ?? '').replace(/[\s/()]/g, '');
// 연관 이름 집합에 이 이름이 있나(공사 표기는 "통나무집닭갈비/본점"처럼 지점이 붙어 포함 관계도 인정)
const nameHit = (set, name) => {
  if (!set || !name) return false;
  const n = normName(name);
  if (!n) return false;
  for (const r of set) if (r === n || r.includes(n) || n.includes(r)) return true;
  return false;
};

// 코스 전체 집중률 합이 가장 낮은 날 · 선택일과 비교(혼잡 = band busy)
async function pickDate(spots, date, congestionDays) {
  if (!congestionDays) return { date: date ?? null, busyOnDate: null, bestDate: null, busyOnBest: null };
  const byDay = new Map(); // baseYmd → { sum, busy, n }
  for (const s of spots) {
    const days = await congestionDays(s.name?.ko).catch(() => []);
    for (const d of days) {
      const cur = byDay.get(d.baseYmd) ?? { sum: 0, busy: 0, n: 0 };
      cur.sum += Number(d.rate) || 0;
      cur.busy += d.band === 'busy' ? 1 : 0;
      cur.n += 1;
      byDay.set(d.baseYmd, cur);
    }
  }
  if (!byDay.size) return { date: date ?? null, busyOnDate: null, bestDate: null, busyOnBest: null };
  const days = [...byDay.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const chosen = date && byDay.has(date) ? date : days[0][0];
  const best = days.reduce((m, d) => (d[1].sum < m[1].sum ? d : m), days[0]);
  return {
    date: chosen,
    busyOnDate: byDay.get(chosen).busy,
    bestDate: best[0],
    busyOnBest: best[1].busy,
    ratedSpots: Math.max(...days.map(([, v]) => v.n)), // 집중률이 붙은 스팟 수(전부는 아님 · 이름 일치분만)
  };
}

module.exports = { planRoute, ASSUME, STAY_MIN };

if (require.main === module) {
  const assert = require('assert');
  // 중심(시내) 2곳 + 외곽 1곳 · 담은 순서는 시내 → 외곽 → 시내(외곽을 가운데 두면 외곽 구간 2개)
  const city1 = { id: 'c1', name: { ko: '시내1' }, coord: [127.73, 37.881] };
  const outer = { id: 'o1', name: { ko: '외곽1' }, coord: [127.83, 37.95] };
  const city2 = { id: 'c2', name: { ko: '시내2' }, coord: [127.735, 37.884] };
  const noCoord = { id: 'n1', name: { ko: '좌표없음' }, coord: null };

  (async () => {
    const r = await planRoute([city1, outer, city2, noCoord], { startTime: '10:00' });
    // 외곽은 끝으로 밀려 외곽 구간 1개만 남는다(대기 60분 1회) · 좌표 없는 곳은 항상 마지막
    assert.deepStrictEqual(r.order, ['c1', 'c2', 'o1', 'n1']);
    assert.strictEqual(r.metrics.waitMin, 60);
    assert.ok(r.metrics.waitSavedMin > 0, '무작위 평균보다 대기가 적어야 한다');
    assert.ok(r.metrics.timeSavedMin > 0, '무작위 평균보다 이동+대기가 적어야 한다');
    assert.strictEqual(r.metrics.timeMin, r.legs.reduce((n, l) => n + l.waitMin + (l.travelMin ?? 0), 0));
    // 10:00 시작 · 2시간 슬롯 → c2 12:00 도착대, o1 구간 출발 14:00대(막차 17:30 전)
    assert.strictEqual(r.metrics.lastBusOk, true);
    assert.strictEqual(r.legs.length, 3);
    assert.strictEqual(r.legs[1].outer, true);

    // 늦게 출발하면 외곽 구간이 막차 이후 → lastBusOk false
    const late = await planRoute([city1, outer], { startTime: '16:00' });
    assert.strictEqual(late.metrics.lastBusOk, false);
    assert.strictEqual(late.legs[0].afterLastBus, true);

    // 연관 가산: c1↔o1이 서로 연관이면 둘을 붙인 순서가 선택된다
    const withRel = await planRoute([city1, city2, outer], { startTime: '10:00' }, {
      relatedNames: async (n) => (n === '시내1' ? ['외곽1'] : n === '외곽1' ? ['시내1'] : []),
    });
    assert.strictEqual(withRel.metrics.relatedPairs, 1);

    // 날짜 회피: 집중률 합이 가장 낮은 날을 고르고 혼잡 수를 센다
    const days = {
      시내1: [
        { baseYmd: '20260912', rate: 90, band: 'busy' },
        { baseYmd: '20260913', rate: 10, band: 'relaxed' },
      ],
      외곽1: [
        { baseYmd: '20260912', rate: 80, band: 'busy' },
        { baseYmd: '20260913', rate: 20, band: 'relaxed' },
      ],
    };
    const withCong = await planRoute([city1, outer], { startTime: '10:00', date: '20260912' }, {
      congestionDays: async (n) => days[n] ?? [],
    });
    assert.strictEqual(withCong.metrics.busyOnDate, 2);
    assert.strictEqual(withCong.metrics.bestDate, '20260913');
    assert.strictEqual(withCong.metrics.busyOnBest, 0);
    console.log('routePlanner 셀프체크 PASS');
  })();
}
