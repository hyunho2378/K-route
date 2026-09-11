// [V5-2b] 공사 관광정보 서비스 · 근거 = probe-kto.js 실호출(docs/kto 활용가이드 부재 → probe 채택 · 결과표 KTO_API.md)
//   KorService2(ko)·EngService2(en) · 정상 resultCode '0000' · 공통 파라미터 MobileOS·MobileApp(probe 호출값 그대로)
//   areaCode2(areaCode?) · ldongCode2(lDongRegnCd?) · areaBasedList2(areaCode, sigunguCode) · detailCommon2(contentId) ·
//   detailIntro2(contentId, contentTypeId) · detailImage2(contentId)
// 지역코드 하드코딩 금지: areaCode2·ldongCode2 이름 매칭(강원 → 춘천) → server/cache/kto-ids.json(tago-ids.json 동형 · 매칭 로그)
// 적재(기동 시 1회 + TTL 24h lazy): areaBasedList2 춘천 전체 원문 → kto_spots(contentid, lang).raw = { list: 원문 }
//   단건 상세는 요청 시 raw.common·raw.intro·raw.images(원문)를 더한다 · 목록 갱신 때 비워져 24h마다 재조회 · 목록에서 빠진 행은 삭제
const fs = require('fs');
const path = require('path');
const db = require('../db/pool');
const { ktoGet, asItems } = require('../lib/kto');

const HOST = 'http://apis.data.go.kr/B551011';
const SVC = { ko: `${HOST}/KorService2`, en: `${HOST}/EngService2` };
const COMMON = { MobileOS: 'ETC', MobileApp: 'KRoute' };
const REGION = { ko: ['강원', '춘천'], en: ['Gangwon', 'Chuncheon'] }; // 이름 매칭 검색어(코드 아님)
const CACHE_FILE = path.join(__dirname, '..', 'cache', 'kto-ids.json');
const TTL_MS = 24 * 60 * 60 * 1000;
// 풀 대상 분류 · categoryCode2 이름: A01 자연 · A02 인문(문화/예술/역사) · A03 레포츠 · A04 쇼핑 · A05 음식 (B02 숙박·C01 추천코스 제외)
const POOL_CAT1 = new Set(['A01', 'A02', 'A03', 'A04', 'A05']);
const CAFE_CAT3 = 'A05020900'; // categoryCode2(cat1=A05, cat2=A0502): 카페/전통찻집

const call = (lang, op, params) => ktoGet(SVC[lang], op, { ...COMMON, ...params });
const norm = (s) => String(s ?? '').replace(/\s/g, '');
// en title 끝 괄호의 한글 원명(예: "Soyang Dam (소양강댐)" → 소양강댐 · 한 단계 중첩 괄호 허용)
const koNameOf = (title) => /\(([^()]*[가-힣][^()]*(?:\([^()]*\)[^()]*)?)\)\s*$/.exec(title)?.[1] ?? null;

let ids = null;
let idsP = null;
// 단일 비행 · 기동 시 ko·en 적재가 동시에 불러도 코드 조회는 1번
const ensureKtoIds = () =>
  (idsP ??= loadIds().catch((e) => {
    idsP = null;
    throw e;
  }));
async function loadIds() {
  if (ids) return ids;
  try {
    ids = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    console.log('[kto] ID 캐시 파일 재사용:', CACHE_FILE);
    return ids;
  } catch {
    /* 캐시 없음 · 신규 조회 */
  }
  const pick = (items, kw, tag) => {
    const hit = items.find((i) => String(i.name).includes(kw));
    if (!hit) throw new Error(`코드 매칭 실패: ${tag}(${kw}) · 후보 ${items.length}건`);
    console.log(`[kto] 코드 매칭 · ${tag} ← ${hit.code} "${hit.name}" (검색어 "${kw}")`);
    return String(hit.code);
  };
  const codes = (lang, op, params = {}) => call(lang, op, { numOfRows: 50, pageNo: 1, ...params }).then(asItems);
  const out = {};
  for (const [lang, [area, city]] of Object.entries(REGION)) {
    const areaCode = pick(await codes(lang, 'areaCode2'), area, `${lang} areaCode`);
    const sigunguCode = pick(await codes(lang, 'areaCode2', { areaCode }), city, `${lang} sigunguCode`);
    out[lang] = { areaCode, sigunguCode };
  }
  // 법정동 코드(집중률·연관 API의 areaCd·signguCd) · probe: signguCd는 시도+시군구 5자리여야 결과가 나온다(시군구 3자리 → 0건)
  const areaCd = pick(await codes('ko', 'ldongCode2'), REGION.ko[0], 'ldong 시도');
  const signgu = pick(await codes('ko', 'ldongCode2', { lDongRegnCd: areaCd }), REGION.ko[1], 'ldong 시군구');
  out.ldong = { areaCd, signguCd: `${areaCd}${signgu}` };
  ids = out;
  fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify(out, null, 2));
  return ids;
}

async function refreshList(lang) {
  const { areaCode, sigunguCode } = (await ensureKtoIds())[lang];
  const items = [];
  for (let pageNo = 1; ; pageNo += 1) {
    const body = await call(lang, 'areaBasedList2', { areaCode, sigunguCode, numOfRows: 500, pageNo });
    const got = asItems(body);
    items.push(...got);
    if (!got.length || items.length >= Number(body?.totalCount ?? 0)) break;
  }
  if (!items.length) throw new Error(`${lang} 목록 0건 · 기존 캐시 유지`);
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO kto_spots (contentid, lang, raw, fetched_at)
       SELECT x->>'contentid', $1, jsonb_build_object('list', x), now() FROM jsonb_array_elements($2::jsonb) AS x
       ON CONFLICT (contentid, lang) DO UPDATE SET raw = EXCLUDED.raw, fetched_at = now()`,
      [lang, JSON.stringify(items)],
    );
    await client.query('DELETE FROM kto_spots WHERE lang = $1 AND NOT (contentid = ANY($2::text[]))', [
      lang,
      items.map((i) => String(i.contentid)),
    ]);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
  console.log(`[kto] 목록 적재 · ${lang} ${items.length}건 (areaBasedList2 areaCode=${areaCode} sigunguCode=${sigunguCode})`);
  return items.length;
}

const inflight = {};
async function ensureFresh(lang) {
  const {
    rows: [r],
  } = await db.query('SELECT max(fetched_at) AS at FROM kto_spots WHERE lang = $1', [lang]);
  if (r.at && Date.now() - new Date(r.at).getTime() < TTL_MS) return;
  inflight[lang] ??= refreshList(lang).finally(() => delete inflight[lang]);
  await inflight[lang];
}

// 기동 시 코드 매칭 + 목록 적재(24h 내 적재분이 있으면 재사용)
const warm = () => Promise.all(Object.keys(SVC).map(ensureFresh));

const toItem = (i, srcLang, name) => ({
  id: String(i.contentid),
  contentid: String(i.contentid),
  srcLang,
  kind: 'kto',
  name,
  oneLine: {},
  category: i.cat1 === 'A05' ? (i.cat3 === CAFE_CAT3 ? 'foodspace' : 'meal') : 'activity',
  cat1: i.cat1,
  coord: i.mapx && i.mapy ? [Number(i.mapx), Number(i.mapy)] : null,
  image: i.firstimage || null,
});

// 하이브리드 풀용 공사 스팟 · ko 목록이 기준, en 목록은 괄호 한글 원명이 ko 제목과 같으면 영문명으로 붙이고 아니면 별도 항목
async function poolItems() {
  await Promise.all(
    Object.keys(SVC).map((l) => ensureFresh(l).catch((e) => console.warn(`[kto] ${l} 목록 갱신 실패(캐시 사용):`, e.message))),
  );
  const { rows } = await db.query("SELECT lang, raw->'list' AS item FROM kto_spots WHERE raw ? 'list'");
  const list = (lang) => rows.filter((r) => r.lang === lang && POOL_CAT1.has(r.item.cat1)).map((r) => r.item);
  const ko = list('ko');
  const koByName = new Map(ko.map((i) => [norm(i.title), i]));
  const enOf = new Map();
  const enOnly = [];
  for (const e of list('en')) {
    const k = koByName.get(norm(koNameOf(e.title)));
    if (k) enOf.set(k.contentid, e);
    else enOnly.push(e);
  }
  const items = [
    ...ko.map((i) => {
      const e = enOf.get(i.contentid);
      const en = e?.title ?? i.title;
      return { ...toItem(i, 'ko', { ko: i.title, en, th: en }), ...(e && { enId: String(e.contentid) }) };
    }),
    ...enOnly.map((e) => toItem(e, 'en', { ko: koNameOf(e.title) ?? e.title, en: e.title, th: e.title })),
  ];
  if (!items.length) throw new Error('kto_spots 비어 있음');
  return items;
}

// 단건 상세 원문(detailCommon2·detailIntro2·detailImage2) · 24h 캐시(목록 갱신 시 비워짐)
async function getSpot(contentid, lang) {
  const {
    rows: [row],
  } = await db.query('SELECT raw FROM kto_spots WHERE contentid = $1 AND lang = $2', [contentid, lang]);
  if (!row) throw new Error(`kto_spots 에 없음: ${contentid}/${lang}`);
  if (row.raw.common) return row.raw;
  const p = { contentId: contentid };
  const [common, intro, images] = await Promise.all([
    call(lang, 'detailCommon2', p).then((b) => asItems(b)[0] ?? null),
    call(lang, 'detailIntro2', { ...p, contentTypeId: row.raw.list.contenttypeid }).then((b) => asItems(b)[0] ?? null),
    call(lang, 'detailImage2', { ...p, numOfRows: 20, pageNo: 1 }).then(asItems),
  ]);
  const raw = { ...row.raw, common, intro, images };
  await db.query('UPDATE kto_spots SET raw = $3 WHERE contentid = $1 AND lang = $2', [contentid, lang, JSON.stringify(raw)]);
  return raw;
}

module.exports = { ensureKtoIds, warm, poolItems, getSpot, norm, REGION };
