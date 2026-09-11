// [V5-2b] 공사 관광지별 연관 관광지 · IA §11.4 · 근거 probe-kto: TarRlteTarService1
//   areaBasedList1(areaCd, signguCd 5자리, baseYm) · searchKeyword1(+ keyword) → tAtsNm 기준 rlteTatsNm·rlteRank·rlteCtgry*Nm · 정상 '0000'
//   baseYm은 코드에 박지 않는다: KST 전월부터 최대 6개월 거슬러 areaBasedList1이 데이터를 주는 달(probe 2026-09-11: 202608 · 1412행 · 기준 29곳)
//   recommendService 연계 판정(LINK_KM 거리)을 이 목록으로 바꾸는 건 후속(기준 관광지 29곳 이름이 venues 앵커와 달라 매칭 설계 필요).
const { ktoGet, asItems } = require('../lib/kto');
const { ensureKtoIds, norm } = require('./ktoSpotService');

const BASE = 'http://apis.data.go.kr/B551011/TarRlteTarService1';
const COMMON = { MobileOS: 'ETC', MobileApp: 'KRoute' };
const TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map(); // key → { at, value } · baseYm·키워드 결과 24h

async function cached(key, load) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value;
  const value = await load();
  cache.set(key, { at: Date.now(), value });
  return value;
}

const latestBaseYm = (ldong) =>
  cached('baseYm', async () => {
    const [y, m] = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit' })
      .format(new Date())
      .split('-')
      .map(Number);
    for (let back = 1; back <= 6; back += 1) {
      const d = new Date(Date.UTC(y, m - 1 - back, 1));
      const baseYm = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      const body = await ktoGet(BASE, 'areaBasedList1', { ...COMMON, ...ldong, baseYm, numOfRows: 1, pageNo: 1 });
      if (Number(body?.totalCount) > 0) return baseYm;
    }
    throw new Error('연관관광지 최근 6개월 데이터 없음');
  });

// 관광지 이름(ko) → { baseYm, items: 연관 관광지 원문(rlteRank 순) }
async function getRelated(name) {
  const { ldong } = await ensureKtoIds();
  const baseYm = await latestBaseYm(ldong);
  const items = await cached(`kw:${baseYm}:${norm(name)}`, async () =>
    asItems(await ktoGet(BASE, 'searchKeyword1', { ...COMMON, ...ldong, baseYm, keyword: name, numOfRows: 100, pageNo: 1 })),
  );
  return { baseYm, items: [...items].sort((a, b) => Number(a.rlteRank) - Number(b.rlteRank)) };
}

module.exports = { getRelated };
