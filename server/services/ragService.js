// [V5-6] K-가이드 봇 지식베이스 · IA §11.8 · 인용할 chunk 가 없으면 답하지 않는다(chat 라우트)
//   소스(하이브리드 풀 항목별):
//     source   : SOURCE_SPOTS.md 큐레이션(kcontent · evidence 원문 · '상동'은 바로 위 행 evidence 로 풀어 쓴다) · ko 만
//     overview : 공사 다국어 상세 detailCommon2 overview · ko = KorService2 · en = EngService2(영문 대응 항목이 있을 때)
//     intro    : 공사 detailIntro2 이용정보(이용시간 · 쉬는 날 · 요금 · 메뉴 · 체험)
//     odii     : 공사 오디오가이드 해설(storyBasedList script) · 관광지(activity)만 조회(음식점은 odii 테마가 아니다)
//     related  : 공사 연관 관광지(TarRlteTarService1) 상위 5곳 · ko 만(응답이 한국어 이름)
//   저장 = spot_chunks(contentid = 풀 id · lang · source · chunk) · embedding 은 비워 둔다(키워드 RAG · 임베딩은 키가 생기면)
//   검색 적재 = 같은 (풀 id, 언어)의 청크를 한 지식 항목으로 묶어 rag.mjs 에 넣는다(출처 카드가 장소 단위로 나오게)
const db = require('../db/pool');
const { getPool } = require('./spotPool');
const { getSpot } = require('./ktoSpotService');
const { getRelated } = require('./ktoRelatedService');
const { getAudioGuide } = require('./ktoAudioService');
const { ksource } = require('../data/ksource');

const LANGS = ['ko', 'en'];
const ORDER = ['source', 'overview', 'intro', 'odii', 'related'];
const CAP = 900; // ponytail: 지식 항목 본문 상한(검색 3건 + 규칙이 gemma 컨텍스트에 들어가게) · 올리면 llmService num_ctx 도 올린다
const STOP = new Set(['춘천', '춘천시', '강원', 'chuncheon', 'gangwon', 'korea', 'the', 'and', 'of']);
const CAT = {
  meal: { ko: '맛집 식당 음식', en: 'food restaurant' },
  foodspace: { ko: '카페 디저트', en: 'cafe coffee' },
  activity: { ko: '관광지 명소 체험', en: 'attraction sightseeing' },
};
const INTRO = [
  [/^(usetime|opentime)/, { ko: '이용시간', en: 'Hours' }],
  [/^restdate/, { ko: '쉬는 날', en: 'Closed' }],
  [/^usefee/, { ko: '요금', en: 'Fee' }],
  [/^firstmenu$/, { ko: '대표 메뉴', en: 'Signature menu' }],
  [/^treatmenu$/, { ko: '메뉴', en: 'Menu' }],
  [/^expguide$/, { ko: '체험 안내', en: 'Experience' }],
];

// 공사 원문 HTML → 텍스트 · client/src/data/gts/spots.js ktoText 와 같은 규칙의 최소판
//   (서버는 그 파일을 import 하지 못한다: 확장자 없는 import './venues')
const text = (html) =>
  String(html ?? '')
    .replace(/<br\s*\/?>\n?/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&#(x[0-9a-f]+|\d+);/gi, (m, n) => String.fromCodePoint(n[0].toLowerCase() === 'x' ? parseInt(n.slice(1), 16) : Number(n)))
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&[lr]squo;/g, "'")
    .replace(/&[lr]dquo;/g, '"')
    .replace(/&middot;/g, '·')
    .trim();

const introFacts = (intro, lang) =>
  Object.entries(intro ?? {})
    .map(([k, v]) => [INTRO.find(([re]) => re.test(k))?.[1][lang], text(v)])
    .filter(([label, v]) => label && v)
    .map(([label, v]) => `${label} ${v}`)
    .join('\n');

// SOURCE 표 원문 · '상동'(= 바로 위와 같음)은 위 행 evidence 로 풀어 쓴다(원문 파일은 그대로)
function sourceRows() {
  const out = new Map();
  let prev = '';
  for (const [id, t] of Object.entries(ksource())) {
    const evidence = t.evidence === '상동' ? prev : t.evidence;
    prev = evidence;
    out.set(id, { kcontent: t.kcontent, evidence });
  }
  return out;
}

// ── 적재(scripts/build-knowledge.js) ─────────────────────────────────────────
async function build({ log = console.log } = {}) {
  const { items, source } = await getPool();
  const src = sourceRows();
  const rows = [];
  const tally = { spots: items.length, pool: source, source: 0, overview: 0, intro: 0, odii: 0, related: 0, fail: {} };
  const push = (contentid, lang, kind, chunk) => {
    if (!chunk) return;
    rows.push({ contentid, lang, source: kind, chunk });
    tally[kind] += 1;
  };
  const miss = (kind, e) => {
    tally.fail[kind] = (tally.fail[kind] ?? 0) + 1;
    if (tally.fail[kind] <= 3) log(`[knowledge] ${kind} 실패(계속): ${e.message.slice(0, 120)}`);
    return null;
  };
  let odiiOff = false; // 한도 초과면 이번 실행에서 odii 호출을 멈춘다(기존 odii 행은 지우지 않고 다음 실행에 다시 시도)

  for (const item of items) {
    const s = src.get(item.venueId ?? item.id);
    if (s && item.kType !== 'local') push(item.id, 'ko', 'source', `${item.name.ko} · ${s.kcontent} · ${s.evidence}`);

    if (item.kind === 'kto') {
      const pairs = item.srcLang === 'ko' ? [['ko', item.contentid], ...(item.enId ? [['en', item.enId]] : [])] : [['en', item.contentid]];
      for (const [lang, cid] of pairs) {
        const raw = await getSpot(cid, lang).catch((e) => miss('overview', e));
        push(item.id, lang, 'overview', text(raw?.common?.overview));
        push(item.id, lang, 'intro', introFacts(raw?.intro, lang));
      }
      const rel = await getRelated(item.name.ko).catch((e) => miss('related', e));
      const names = [...new Set((rel?.items ?? []).map((r) => r.rlteTatsNm))].slice(0, 5);
      if (names.length) push(item.id, 'ko', 'related', `공사 연관 관광지(${rel.baseYm} 기준) · ${item.name.ko} 방문객이 함께 많이 찾은 곳 · ${names.join(', ')}`);
    }

    if (!odiiOff && item.category === 'activity') {
      for (const lang of LANGS) {
        try {
          const guide = await getAudioGuide(item.name, lang);
          if (guide) push(item.id, lang, 'odii', guide.stories.map((st) => `${st.audioTitle}. ${text(st.script)}`).join('\n'));
        } catch (e) {
          if (/LIMITED_NUMBER|HTTP 429/.test(e.message)) {
            odiiOff = true;
            log('[knowledge] odii 호출 한도 초과 → 이번 실행 odii 중단(기존 odii 행 유지 · 한도가 풀리면 다시 실행)');
            break;
          }
          miss('odii', e);
        }
      }
    }
  }

  // 이번에 만든 (풀 id, 언어, 소스)만 갈아 끼운다 · 못 받은 소스(odii 한도 등)의 기존 행은 남긴다
  const kinds = ORDER.filter((k) => !(k === 'odii' && odiiOff));
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM spot_chunks WHERE source = ANY($1::text[])', [kinds]);
    await client.query(
      `INSERT INTO spot_chunks (contentid, lang, source, chunk)
       SELECT contentid, lang, source, chunk FROM jsonb_to_recordset($1::jsonb) AS x(contentid text, lang text, source text, chunk text)`,
      [JSON.stringify(rows.filter((r) => kinds.includes(r.source)))],
    );
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
  loadP = null; // 다음 질문에서 새 지식으로 다시 적재
  return { ...tally, odii: odiiOff ? 'skipped(limit)' : tally.odii };
}

// ── 검색 적재 ───────────────────────────────────────────────────────────────
const clean = (s) => String(s ?? '').toLowerCase().replace(/[()[\],·]/g, ' ').replace(/\s+/g, ' ').trim();

// 첫 키워드 = 표시 이름(findMentionedSources 가 답변에서 찾는 이름) · 나머지 = 소문자 검색어(라우트가 질문을 소문자로 넘긴다)
function keywordsOf(item, lang, name) {
  const kw = new Set();
  for (const n of Object.values(item.name ?? {})) {
    const c = clean(n);
    kw.add(c);
    kw.add(c.replace(/ /g, ''));
    kw.add(clean(String(n).replace(/\s*\([^()]*\)\s*$/, '')));
    for (const w of c.split(' ')) kw.add(w);
  }
  if (item.kcontent) {
    const c = clean(item.kcontent);
    kw.add(c);
    for (const w of c.split(' ')) kw.add(w);
  }
  for (const w of (CAT[item.category]?.[lang] ?? '').split(' ')) kw.add(w);
  return [name, ...[...kw].filter((k) => k.length >= 2 && !STOP.has(k) && k !== name)];
}

let ragP = null;
const rag = () => (ragP ??= import('./rag.mjs'));
let loadP = null;
let loaded = [];

async function load() {
  const [mod, pool, { rows }] = await Promise.all([rag(), getPool(), db.query('SELECT contentid, lang, source, chunk FROM spot_chunks')]);
  const items = new Map(pool.items.map((i) => [i.id, i]));
  const groups = new Map();
  for (const r of rows) {
    const key = `${r.contentid} ${r.lang}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  }
  loaded = [];
  for (const [key, chunks] of groups) {
    const [id, lang] = key.split(' ');
    const item = items.get(id);
    if (!item) continue; // 풀에서 빠진 장소
    const name = lang === 'ko' ? item.name.ko : item.name.en;
    chunks.sort((a, b) => ORDER.indexOf(a.source) - ORDER.indexOf(b.source));
    loaded.push({
      id: `spot-${id}-${lang}`,
      lang,
      link: id,
      weight: item.badge ? 1.3 : 1,
      keywords: keywordsOf(item, lang, name),
      // 머리말에 한국어·영어 이름을 함께 둔다(한국어 자료로 다른 언어 답을 쓸 때 모델이 그 언어 이름을 쓰게)
      content: `[${[...new Set([item.name.ko, item.name.en])].join(' · ')}]\n${chunks.map((c) => c.chunk).join('\n')}`.slice(0, CAP),
    });
  }
  mod.setKnowledge(loaded);
  console.log(`[knowledge] 적재 ${loaded.length}항목 (spot_chunks ${rows.length}행)`);
  return { rag: mod, items };
}

// 첫 질문에 한 번 적재 · 실패하면 다음 질문에 다시 시도
const ready = () =>
  (loadP ??= load().catch((e) => {
    loadP = null;
    throw e;
  }));

// 현재 선택 스팟의 지식 항목(질문이 지금 코스를 가리킬 때 먼저 넣는다)
//   그 언어 자료가 없으면 한국어 자료(모델이 사용자 언어로 옮긴다)
const itemsFor = (ids, lang) =>
  ids.map((id) => loaded.find((k) => k.link === id && k.lang === lang) ?? loaded.find((k) => k.link === id)).filter(Boolean);

module.exports = { build, ready, itemsFor };
