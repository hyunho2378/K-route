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
const CATS_FILE = path.join(__dirname, '..', 'cache', 'kto-cats.json'); // [V5-13] 분류 이름 캐시(kto-ids.json 동형)
const TTL_MS = 24 * 60 * 60 * 1000;
// 풀 대상 분류 · categoryCode2 이름: A01 자연 · A02 인문(문화/예술/역사) · A03 레포츠 · A04 쇼핑 · A05 음식 (B02 숙박·C01 추천코스 제외)
const POOL_CAT1 = new Set(['A01', 'A02', 'A03', 'A04', 'A05']);
const CAFE_CAT3 = 'A05020900'; // categoryCode2(cat1=A05, cat2=A0502): 카페/전통찻집
// [V5-13] 카드 태그로 쓸 실분류(cat2) 이름을 받아 올 cat1 · A05(음식)는 제외한다:
//   A05의 cat2는 '음식점' 하나뿐이라 카페까지 음식점으로 뭉개진다 · 기존 category 3버킷이 CAFE_CAT3로 이미 더 정확히 가른다.
const NAMED_CAT1 = ['A01', 'A02', 'A03', 'A04'];
// [V5-5] 지역 목록 보강 키워드 · 근거 probe-kto verify(searchKeyword2 '0000' · KTO_API.md 표)
//   남이섬은 구 areaCode·sigunguCode·cat1이 전부 공란이라 areaCode 기반 areaBasedList2에 잡히지 않는다
//   (실응답 2026-09-12: contentid 128019 ko · 264244 en · 주소 춘천시 남산면 · 법정동 51/110 · contenttypeid 12/76).
//   → 키워드 조회 결과 중 "제목 완전일치 + 법정동이 춘천"인 항목만 목록에 더한다(contentid·지역코드 하드코딩 없음).
const EXTRA_KEYWORDS = { ko: ['남이섬'], en: ['Nami Island'] };

const call = (lang, op, params) => ktoGet(SVC[lang], op, { ...COMMON, ...params });
const norm = (s) => String(s ?? '').replace(/\s/g, '');
// en title 끝 괄호의 한글 원명(예: "Soyang Dam (소양강댐)" → 소양강댐 · 한 단계 중첩 괄호 허용)
const koNameOf = (title) => /\(([^()]*[가-힣][^()]*(?:\([^()]*\)[^()]*)?)\)\s*$/.exec(title)?.[1] ?? null;
// 끝 괄호 별칭을 뗀 제목("Nami Island (남이섬)" → "Nami Island") · 키워드 완전일치 비교용
const baseTitle = (title) => String(title ?? '').replace(/\s*\([^()]*\)\s*$/, '').trim();

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

// [V5-13] 분류 이름(cat2 코드 → 이름) · ko·en 각각 · 코드 값은 두 서비스가 같고 이름만 언어별로 온다.
//   근거: probe-kto categoryCode2 실호출(KTO_API.md 표 · 응답 code·name) · 2026-09-13 확인: cat1을 주면 그 아래 cat2 목록을 준다
//   (KorService2 A02 → A0201 역사관광지 … A0206 문화시설 8건 / EngService2 A02 → Historical Sites … Cultural Facilities 8건).
//   목적: 카드 태그가 category 3버킷으로 뭉개져 추천 12장이 전부 "Activity"로 보이던 것을 실분류로 되돌린다.
//   호출은 기동 시 1회(cat1 4종 × 2언어 = 8회)뿐이고 결과는 파일 캐시에 남는다 · 실패해도 태그는 기존 3버킷으로 살아 있다.
let cats = null;
let catsP = null;
const ensureCatNames = () =>
  (catsP ??= loadCatNames().catch((e) => {
    catsP = null;
    throw e;
  }));
async function loadCatNames() {
  if (cats) return cats;
  try {
    cats = JSON.parse(fs.readFileSync(CATS_FILE, 'utf8'));
    console.log('[kto] 분류 이름 캐시 파일 재사용:', CATS_FILE);
    return cats;
  } catch {
    /* 캐시 없음 · 신규 조회 */
  }
  const out = {};
  for (const lang of Object.keys(SVC)) {
    out[lang] = {};
    for (const cat1 of NAMED_CAT1) {
      const items = asItems(await call(lang, 'categoryCode2', { cat1, numOfRows: 50, pageNo: 1 }));
      for (const i of items) out[lang][String(i.code)] = String(i.name);
    }
  }
  if (!Object.keys(out.ko ?? {}).length) throw new Error('분류 이름 0건');
  cats = out;
  fs.mkdirSync(path.dirname(CATS_FILE), { recursive: true });
  fs.writeFileSync(CATS_FILE, JSON.stringify(out, null, 2));
  console.log(`[kto] 분류 이름 적재 · ko ${Object.keys(out.ko).length}종 · en ${Object.keys(out.en).length}종`);
  return cats;
}

// [V5-5] 키워드 보강 항목(제목 완전일치 + 법정동 춘천 + 목록에 없는 것만) · 실패해도 목록 적재는 계속
async function extraItems(lang, listed) {
  const { ldong } = await ensureKtoIds();
  const regnCd = String(ldong.areaCd);
  const signguCd = String(ldong.signguCd).slice(regnCd.length); // 51110 → 110(시군구 3자리)
  const have = new Set(listed.map((i) => String(i.contentid)));
  const out = [];
  for (const keyword of EXTRA_KEYWORDS[lang] ?? []) {
    let items = [];
    try {
      items = asItems(await call(lang, 'searchKeyword2', { keyword, numOfRows: 30, pageNo: 1 }));
    } catch (e) {
      console.warn(`[kto] 목록 보강 실패(계속) · ${lang} "${keyword}":`, e.message);
      continue;
    }
    for (const i of items) {
      if (norm(baseTitle(i.title)) !== norm(keyword)) continue;
      if (String(i.lDongRegnCd) !== regnCd || String(i.lDongSignguCd) !== signguCd) continue;
      if (have.has(String(i.contentid))) continue;
      have.add(String(i.contentid));
      out.push(i);
      console.log(
        `[kto] 목록 보강 · ${lang} "${i.title}" contentid=${i.contentid} (검색어 "${keyword}" · 법정동 ${i.lDongRegnCd}/${i.lDongSignguCd})`,
      );
    }
  }
  return out;
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
  const extras = await extraItems(lang, items);
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    // raw 원문 무결성: 항목 자체는 그대로 두고 보강 여부는 형제 키(extra)로만 표시
    for (const [rows, extra] of [[items, false], [extras, true]]) {
      if (!rows.length) continue;
      await client.query(
        `INSERT INTO kto_spots (contentid, lang, raw, fetched_at)
         SELECT x->>'contentid', $1, jsonb_build_object('list', x) || $3::jsonb, now() FROM jsonb_array_elements($2::jsonb) AS x
         ON CONFLICT (contentid, lang) DO UPDATE SET raw = EXCLUDED.raw, fetched_at = now()`,
        [lang, JSON.stringify(rows), JSON.stringify(extra ? { extra: true } : {})],
      );
    }
    await client.query('DELETE FROM kto_spots WHERE lang = $1 AND NOT (contentid = ANY($2::text[]))', [
      lang,
      [...items, ...extras].map((i) => String(i.contentid)),
    ]);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
  console.log(
    `[kto] 목록 적재 · ${lang} ${items.length}건 (areaBasedList2 areaCode=${areaCode} sigunguCode=${sigunguCode})` +
      (extras.length ? ` + 키워드 보강 ${extras.length}건` : ''),
  );
  return items.length + extras.length;
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
const warm = () =>
  Promise.all([
    ...Object.keys(SVC).map(ensureFresh),
    // [V5-13] 분류 이름은 카드 태그 표시용이라 실패해도 목록 적재를 실패로 만들지 않는다
    ensureCatNames().catch((e) => console.warn('[kto] 분류 이름 적재 실패(태그는 기존 분류로):', e.message)),
  ]);

// [V5-13] 주소 한 줄 · 원문 addr1에서 시도 접두만 덜어 낸다("강원특별자치도 춘천시 서면 신매리" → "춘천시 서면 신매리").
//   원문은 kto_spots.raw 에 그대로 남는다(표시용 가공만 · httpsImage 선례).
const trimAddr = (a) => {
  const parts = String(a ?? '').trim().split(/\s+/);
  return parts.length >= 3 ? parts.slice(1).join(' ') : parts.join(' ');
};

const toItem = (i, srcLang, name, extra) => ({
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
  // [V5-13] catName(실분류 이름) · where(주소 한 줄) · 근거가 없으면 필드 자체를 만들지 않는다(화면이 기존 폴백을 쓴다)
  ...extra,
});

// 하이브리드 풀용 공사 스팟 · ko 목록이 기준, en 목록은 괄호 한글 원명이 ko 제목과 같으면 영문명으로 붙이고 아니면 별도 항목
async function poolItems() {
  // [V5-13] 분류 이름은 표시용이라 실패해도 풀은 그대로 나간다(태그가 기존 3버킷으로 돌아갈 뿐)
  const catNames = await ensureCatNames().catch((e) => {
    console.warn('[kto] 분류 이름 없음(태그는 기존 분류로):', e.message);
    return { ko: {}, en: {} };
  });
  // 같은 cat2 코드의 이름을 언어별로 붙인다(코드는 두 서비스 공통) · 한쪽만 있으면 그쪽 이름을 쓴다
  const catOf = (i) => {
    const code = String(i.cat2 ?? '');
    const ko = catNames.ko?.[code];
    const en = catNames.en?.[code];
    return ko || en ? { catName: { ko: ko ?? en, en: en ?? ko, th: en ?? ko } } : null;
  };
  // 주소는 ko 목록·en 목록 각각의 원문에서 · 한쪽만 있으면 그 값을 양쪽에 쓴다(TriText 의 th → en 폴백과 같은 규칙)
  const whereOf = (k, e) => {
    const ko = trimAddr(k?.addr1);
    const en = trimAddr(e?.addr1) || ko;
    return ko || en ? { where: { ko: ko || en, en, th: en } } : null;
  };
  await Promise.all(
    Object.keys(SVC).map((l) => ensureFresh(l).catch((e) => console.warn(`[kto] ${l} 목록 갱신 실패(캐시 사용):`, e.message))),
  );
  const { rows } = await db.query("SELECT lang, raw->'list' AS item, (raw ? 'extra') AS extra FROM kto_spots WHERE raw ? 'list'");
  // [V5-5] 키워드 보강분(extra)은 cat1이 공란이라 분류 필터를 통과하지 못한다 → 분류 필터 예외
  const list = (lang) => rows.filter((r) => r.lang === lang && (POOL_CAT1.has(r.item.cat1) || r.extra)).map((r) => r.item);
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
      return {
        ...toItem(i, 'ko', { ko: i.title, en, th: en }, { ...catOf(i), ...whereOf(i, e) }),
        ...(e && { enId: String(e.contentid) }),
      };
    }),
    ...enOnly.map((e) =>
      toItem(e, 'en', { ko: koNameOf(e.title) ?? e.title, en: e.title, th: e.title }, { ...catOf(e), ...whereOf(e, e) }),
    ),
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
