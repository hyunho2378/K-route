// [V5-10] 공사 축제 · KorService2/searchFestival2 · 근거 = probe 2026-09-13(KTO_API.md 채택표)
//   지역코드(areaCode·sigunguCode)로 조회하면 0건이다: 춘천 축제 8건이 전부 areacode·sigungucode 공란이고
//   법정동(lDongRegnCd 51 · lDongSignguCd 110)만 갖는다(남이섬과 같은 구조) → 지역 필터 없이 받아 법정동으로 거른다.
//   법정동 코드는 하드코딩하지 않는다(ktoSpotService.ensureKtoIds 캐시 · extraItems 선례와 동일 계약).
//   원문 무가공: 응답 항목을 그대로 들고 있고 파생 필드를 만들지 않는다(가공은 소비처 몫 · 레포 원문 무결성 규율).
//   캐시 = 24h 메모리(ktoCongestionService 선례). kto_spots 에 넣지 않는 이유: 목록 갱신이 "목록에 없는 행 삭제"라 매번 지워진다.
const { ktoGet, asItems } = require('../lib/kto');
const { ensureKtoIds } = require('./ktoSpotService');

const BASE = 'http://apis.data.go.kr/B551011/KorService2';
const COMMON = { MobileOS: 'ETC', MobileApp: 'KRoute' };
const TTL_MS = 24 * 60 * 60 * 1000;

const kstToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date()).replaceAll('-', '');
// 'YYYY-MM-DD' | 'YYYYMMDD' → 'YYYYMMDD' · 형식이 아니면 null(호출부가 오늘로 대체)
const ymd = (s) => {
  const t = String(s ?? '').replace(/-/g, '');
  return /^\d{8}$/.test(t) ? t : null;
};
// 여행 기간 [from, to] 와 축제 기간이 겹치는지 · 같은 YYYYMMDD 형식이라 문자열 비교로 충분
const overlaps = (f, from, to) => String(f.eventstartdate) <= to && from <= String(f.eventenddate);

let cache = null; // { at, items } · items = 응답 원문 그대로
async function allFestivals() {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.items;
  const { ldong } = await ensureKtoIds();
  const regnCd = String(ldong.areaCd);
  const signguCd = String(ldong.signguCd).slice(regnCd.length); // 51110 → 110(시군구 3자리 · extraItems 선례)
  // eventStartDate 는 필수값 · 올해 1월 1일부터 받으면 그 이후 시작하는 축제가 전부 들어온다(기간 판정은 아래 코드가 한다)
  const eventStartDate = `${kstToday().slice(0, 4)}0101`;
  const rows = [];
  for (let pageNo = 1; ; pageNo += 1) {
    const body = await ktoGet(BASE, 'searchFestival2', { ...COMMON, eventStartDate, numOfRows: 1000, pageNo });
    const got = asItems(body);
    rows.push(...got);
    if (!got.length || rows.length >= Number(body?.totalCount ?? 0)) break;
  }
  const items = rows.filter((i) => String(i.lDongRegnCd) === regnCd && String(i.lDongSignguCd) === signguCd);
  console.log(`[kto] 축제 · 전국 ${rows.length}건 → 법정동 ${regnCd}/${signguCd} ${items.length}건`);
  cache = { at: Date.now(), items };
  return items;
}

// 여행 날짜(없으면 KST 오늘)에 열려 있는 축제만 · 원문 그대로 반환
async function getFestivals(from, to) {
  const a = ymd(from) ?? kstToday();
  const b = ymd(to) ?? a;
  const all = await allFestivals();
  return { date: a, dateTo: b, total: all.length, items: all.filter((f) => overlaps(f, a, b)) };
}

module.exports = { getFestivals, allFestivals, overlaps, ymd };

// 셀프체크(실호출 없음 · 기간 판정과 날짜 정규화만): node services/ktoFestivalService.js
if (require.main === module) {
  const assert = require('assert');
  const f = { eventstartdate: '20261014', eventenddate: '20261018' }; // 춘천막국수닭갈비축제 실측값
  assert.ok(overlaps(f, '20261014', '20261014')); // 첫날
  assert.ok(overlaps(f, '20261018', '20261018')); // 마지막날
  assert.ok(overlaps(f, '20261016', '20261016')); // 중간
  assert.ok(!overlaps(f, '20261013', '20261013')); // 하루 전 = 숨김
  assert.ok(!overlaps(f, '20261019', '20261019')); // 하루 뒤 = 숨김
  assert.ok(overlaps(f, '20261010', '20261015')); // 여행 기간이 축제 앞부분에 걸침
  assert.ok(!overlaps(f, '20261001', '20261013')); // 여행 기간이 시작 전에 끝남
  assert.strictEqual(ymd('2026-10-14'), '20261014');
  assert.strictEqual(ymd('20261014'), '20261014');
  assert.strictEqual(ymd('2026-1-4'), null); // 자릿수 미달은 거부(오늘로 대체된다)
  assert.strictEqual(ymd(null), null);
  console.log('축제 기간 판정 셀프체크 PASS');
}
