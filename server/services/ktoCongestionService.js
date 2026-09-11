// [V5-2b] 공사 관광지 집중률·방문자추이 예측 · IA §11.7(혼잡 Chip·추천 날짜) · 근거 probe-kto: TatsCnctrRateService/tatsCnctrRatedList
//   (areaCd, signguCd = 법정동 시도+시군구 5자리 · tAtsNm 선택) → 관광지별 baseYmd(30일 예측)·cnctrRate · 정상 '0000'
//   춘천 전체(probe 2026-09-11: 60곳 × 30일 = 1800행)를 하루 1번 받아 메모리 캐시 · 풀 항목과는 공백 무시 이름 일치로 연결
//   API가 일 단위라 IA의 "추천 시간대"는 30일 예측 중 가장 한가한 날로 대신한다.
const { ktoGet, asItems } = require('../lib/kto');
const { ensureKtoIds, norm } = require('./ktoSpotService');

const BASE = 'http://apis.data.go.kr/B551011/TatsCnctrRateService';
const COMMON = { MobileOS: 'ETC', MobileApp: 'KRoute' };
const TTL_MS = 24 * 60 * 60 * 1000;
// 3구간(여유 relaxed / 보통 moderate / 혼잡 busy) 경계 = 춘천 1800행 분포의 3분위
//   (probe 2026-09-11: min 1.94 · p33 32.15 · p50 44.17 · p66 61.16 · max 100)
const BANDS = [
  [32.15, 'relaxed'],
  [61.16, 'moderate'],
];
const band = (rate) => (rate == null ? null : (BANDS.find(([max]) => rate < max)?.[1] ?? 'busy'));
const kstToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date()).replaceAll('-', '');

let cache = null; // { at, byName: Map(정규화 이름 → { name, days:[{ baseYmd, rate }] }) }
async function byName() {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.byName;
  const { areaCd, signguCd } = (await ensureKtoIds()).ldong;
  const rows = [];
  for (let pageNo = 1; ; pageNo += 1) {
    const body = await ktoGet(BASE, 'tatsCnctrRatedList', { ...COMMON, areaCd, signguCd, numOfRows: 1000, pageNo });
    const got = asItems(body);
    rows.push(...got);
    if (!got.length || rows.length >= Number(body?.totalCount ?? 0)) break;
  }
  const map = new Map();
  for (const r of rows) {
    const k = norm(r.tAtsNm);
    if (!map.has(k)) map.set(k, { name: r.tAtsNm, days: [] });
    map.get(k).days.push({ baseYmd: r.baseYmd, rate: Number(r.cnctrRate) });
  }
  cache = { at: Date.now(), byName: map };
  return map;
}

// 풀 동점 정렬용 · 오늘 집중률(정규화 이름 → rate)
async function todayRates() {
  const today = kstToday();
  const out = new Map();
  for (const [k, v] of await byName()) {
    const d = v.days.find((x) => x.baseYmd === today);
    if (d) out.set(k, d.rate);
  }
  return out;
}

// 단건 · 오늘 값 + 30일 예측 + 가장 한가한 날 · 이름 불일치면 matched false
async function getCongestion(name) {
  const hit = (await byName()).get(norm(name));
  if (!hit) return { matched: false };
  const days = [...hit.days].sort((a, b) => a.baseYmd.localeCompare(b.baseYmd)).map((d) => ({ ...d, band: band(d.rate) }));
  const quietest = days.reduce((m, d) => (d.rate < m.rate ? d : m), days[0]);
  return { matched: true, name: hit.name, today: days.find((d) => d.baseYmd === kstToday()) ?? null, quietest, days };
}

module.exports = { getCongestion, todayRates, band };
