// probe-kto.js · 한국관광공사 OpenAPI 실호출 검증(PITFALLS: 활용가이드 부재 시 probe 채택 · probe-train.js 선례).
// docs/kto 에 활용가이드가 없어 서비스·오퍼레이션명을 기억으로 확정하지 않는다. 후보를 실호출해
// HTTP 200 + 정상 resultCode('0000')가 확인된 조합만 채택한다(응답 헤더·필드 콘솔 출력 · 키 마스킹).
// serviceKey 재인코딩 금지(원문 이어붙이기 · tago.js 계약 동일).
// 실행: node scripts/probe-kto.js auth | verify
// [결과 2026-09-11 ① TAGO_SERVICE_KEY 값] 공사 6개 서비스 전부 HTTP 403 · 30 SERVICE_KEY_IS_NOT_REGISTERED_ERROR(경로 존재 · 미등록)
//   KorService1·EngService1 → HTTP 400 · 12 NO_OPENAPI_SERVICE_ERROR(폐기 · 채택 제외)
// [결과 2026-09-11 ② KTO_SERVICE_KEY · 활용신청 승인 후] 6개 서비스 전부 인증 통과(HTTP 200):
//   KorService2·EngService2·PhotoGalleryService1 → '0000' OK
//   TarRlteTarService1·TatsCnctrRateService·Odii → 최상위 resultCode 11 NO_MANDATORY_REQUEST_PARAMETERS_ERROR(필수값 누락 = 인증·오퍼레이션 유효)
//   → verify 단계가 필수값을 앞 단계 응답에서 얻어 채우고 전 단계 '0000'을 확인한다.
//   정상 코드는 '0000'(TAGO '00'과 다름 → tago.js 판정에 추가) · 오류는 최상위 { resultCode, resultMsg } envelope.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const KEY = process.env.KTO_SERVICE_KEY || process.env.TAGO_SERVICE_KEY;
const HOST = 'http://apis.data.go.kr/B551011';
const COMMON = { MobileOS: 'ETC', MobileApp: 'KRoute', _type: 'json' };
const mask = (s) => s.split(KEY).join('***').split(decodeURIComponent(KEY)).join('***');

async function call(svc, op, params = {}) {
  const qs = Object.entries({ ...COMMON, ...params })
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join('&');
  const res = await fetch(`${HOST}/${svc}/${op}?serviceKey=${KEY}&${qs}`, { signal: AbortSignal.timeout(20000) });
  const text = mask(await res.text());
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* XML·HTML 오류 응답 */
  }
  const header = json?.response?.header ?? (json?.resultCode ? { resultCode: json.resultCode, resultMsg: json.resultMsg } : null);
  const body = json?.response?.body ?? null;
  const it = body?.items?.item;
  const items = !it ? [] : Array.isArray(it) ? it : [it];
  return { status: res.status, header, total: body?.totalCount, items, raw: text.slice(0, 180).replace(/\s+/g, ' ') };
}

const show = (tag, r) =>
  console.log(
    `${tag} → HTTP ${r.status} · ${r.header ? `resultCode=${r.header.resultCode} ${r.header.resultMsg}` : `raw=${r.raw}`}` +
      (r.total !== undefined ? ` · totalCount=${r.total} · 필드=${r.items[0] ? Object.keys(r.items[0]).join(',') : '-'}` : ''),
  );

// 1단계 · 서비스별 인증·경로 확인(후보 = 공사 서비스명 기억 · 채택은 실응답으로만)
const AUTH = [
  ['KorService2', 'areaCode2'],
  ['KorService1', 'areaCode1'],
  ['EngService2', 'areaCode2'],
  ['EngService1', 'areaCode1'],
  ['TarRlteTarService1', 'areaBasedList1'],
  ['TatsCnctrRateService', 'tatsCnctrRatedList'],
  ['Odii', 'themeBasedList'],
  ['PhotoGalleryService1', 'galleryList1'],
];

// 2단계 · 채택 체인(각 호출 '0000' 필수) · 코드 값은 앞 단계 응답의 이름 매칭으로 얻는다(하드코딩 없음)
async function verify() {
  const need = async (svc, op, params) => {
    const r = await call(svc, op, params);
    const shown = Object.entries(params).map(([k, v]) => `${k}=${v}`).join(' ');
    show(`${svc}/${op} ${shown}`, r);
    if (r.header?.resultCode !== '0000') throw new Error(`${svc}/${op} 채택 실패`);
    return r;
  };
  const byName = (r, kw) => {
    const hit = r.items.find((i) => String(i.name).includes(kw));
    if (!hit) throw new Error(`이름 매칭 실패: ${kw}`);
    console.log(`   매칭 "${kw}" → ${hit.code} ${hit.name}`);
    return hit.code;
  };
  const first = {};
  for (const [svc, [area, city]] of [
    ['KorService2', ['강원', '춘천']],
    ['EngService2', ['Gangwon', 'Chuncheon']],
  ]) {
    const areaCode = byName(await need(svc, 'areaCode2', { numOfRows: 50 }), area);
    const sigunguCode = byName(await need(svc, 'areaCode2', { areaCode, numOfRows: 50 }), city);
    first[svc] = (await need(svc, 'areaBasedList2', { areaCode, sigunguCode, numOfRows: 1, pageNo: 1 })).items[0];
    const { contentid: contentId, contenttypeid: contentTypeId } = first[svc];
    await need(svc, 'detailCommon2', { contentId });
    await need(svc, 'detailIntro2', { contentId, contentTypeId });
    await need(svc, 'detailImage2', { contentId });
  }
  await need('KorService2', 'categoryCode2', { numOfRows: 20 });
  await need('KorService2', 'categoryCode2', { cat1: 'A05', cat2: 'A0502', numOfRows: 30 });
  const areaCd = byName(await need('KorService2', 'ldongCode2', { numOfRows: 50 }), '강원');
  const signgu = byName(await need('KorService2', 'ldongCode2', { lDongRegnCd: areaCd, numOfRows: 50 }), '춘천');
  const signguCd = `${areaCd}${signgu}`;
  show('   대조 · 시군구 3자리 signguCd', await call('TatsCnctrRateService', 'tatsCnctrRatedList', { areaCd, signguCd: signgu, numOfRows: 1, pageNo: 1 }));
  const cn = await need('TatsCnctrRateService', 'tatsCnctrRatedList', { areaCd, signguCd, numOfRows: 1, pageNo: 1 });
  await need('TatsCnctrRateService', 'tatsCnctrRatedList', { areaCd, signguCd, tAtsNm: cn.items[0].tAtsNm, numOfRows: 1, pageNo: 1 });
  // 연관관광지 baseYm: KST 전월부터 거슬러 데이터가 있는 첫 달
  const [y, m] = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit' }).format(new Date()).split('-').map(Number);
  let rel = null;
  let baseYm = null;
  for (let back = 1; back <= 6 && !rel; back += 1) {
    const d = new Date(Date.UTC(y, m - 1 - back, 1));
    baseYm = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    const r = await call('TarRlteTarService1', 'areaBasedList1', { areaCd, signguCd, baseYm, numOfRows: 1, pageNo: 1 });
    show(`TarRlteTarService1/areaBasedList1 areaCd=${areaCd} signguCd=${signguCd} baseYm=${baseYm}`, r);
    if (r.header?.resultCode === '0000' && r.items.length) rel = r;
  }
  if (!rel) throw new Error('TarRlteTarService1 baseYm 탐색 실패');
  await need('TarRlteTarService1', 'searchKeyword1', { areaCd, signguCd, baseYm, keyword: rel.items[0].tAtsNm, numOfRows: 1, pageNo: 1 });
  const { mapx: mapX, mapy: mapY } = first.KorService2; // 반경 중심 = 춘천 목록 첫 스팟 좌표(API 값)
  for (const langCode of ['ko', 'en']) {
    const th = await need('Odii', 'themeLocationBasedList', { langCode, mapX, mapY, radius: 10000, numOfRows: 1, pageNo: 1 });
    await need('Odii', 'storyBasedList', { langCode, tid: th.items[0].tid, tlid: th.items[0].tlid, numOfRows: 1, pageNo: 1 });
  }
  await need('PhotoGalleryService1', 'gallerySearchList1', { keyword: '춘천', numOfRows: 1, pageNo: 1 });
  console.log('\n[결론] 채택 체인 전 단계 HTTP 200 · resultCode 0000');
}

async function main() {
  if (!KEY) throw new Error('인증키 없음(KTO_SERVICE_KEY·TAGO_SERVICE_KEY 모두 미설정)');
  const step = process.argv[2] || 'auth';
  if (step === 'auth') {
    for (const [svc, op] of AUTH) {
      try {
        show(`${svc}/${op}`, await call(svc, op, { numOfRows: 3, pageNo: 1 }));
      } catch (e) {
        console.log(`${svc}/${op} → 실패 ${e.message}`);
      }
    }
  } else if (step === 'verify') {
    await verify();
  }
}

main().catch((e) => {
  console.error('[probe-kto]', e.message);
  process.exitCode = 1;
});
