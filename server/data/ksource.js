// [V5-2] SOURCE_SPOTS.md K-콘텐츠 태그 로더 · 무결성: 표 셀 문자열을 가공 없이 담는다(셀 앞뒤 공백 trim만).
//   §1·§2·§4·§5 표 = venue id | kType | anchor | kcontent | grade | evidence
//   §6 표 = venue id | kType | 비고 → anchor false(섹션 제목 근거) · kcontent '' · grade '-' · evidence '' · note = 비고 원문
//   §7 목록 · 표에 없는 id = { kType:'local', anchor:false, kcontent:'', grade:'-', evidence:'' }
//   evidence "상동"은 원문 그대로 둔다(윗행 참조 표기 · 해석은 소비처 몫).
// 배지 규칙(SOURCE_SPOTS "UI 노출 규칙"): anchor && grade ∈ {강함, 중간} · 약함·근거없음은 배지 없음.
// 단일 출처 = 레포 루트 SOURCE_SPOTS.md(런타임 파싱 · 사본 없음). 셀프체크: node data/ksource.js
const fs = require('fs');
const path = require('path');

const MD_PATH = path.join(__dirname, '..', '..', 'SOURCE_SPOTS.md');
const LOCAL = { kType: 'local', anchor: false, kcontent: '', grade: '-', evidence: '' };
const BADGE_GRADES = new Set(['강함', '중간']);
const ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/; // 헤더·구분선·§3 인물 행 제외

function parse(md) {
  const map = {};
  for (const line of md.split('\n')) {
    if (!line.startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (!ID_RE.test(cells[0])) continue;
    if (cells.length === 6) {
      const [id, kType, anchor, kcontent, grade, evidence] = cells;
      map[id] = { kType, anchor: anchor === 'true', kcontent, grade, evidence };
    } else if (cells.length === 3) {
      map[cells[0]] = { ...LOCAL, kType: cells[1], note: cells[2] };
    }
  }
  return map;
}

let cache = null;
const ksource = () => (cache ??= parse(fs.readFileSync(MD_PATH, 'utf8')));
const tagsFor = (id) => ({ ...LOCAL, ...ksource()[id] });
const isBadge = (t) => t.anchor && BADGE_GRADES.has(t.grade);

module.exports = { ksource, tagsFor, isBadge, MD_PATH };

if (require.main === module) {
  const assert = require('assert');
  const md = fs.readFileSync(MD_PATH, 'utf8');
  const map = ksource();
  // 3건 문자단위 대조: 파싱값으로 표 행을 재조립해 원문에 그대로 존재하는지(§1·§2·§5 각 1건)
  for (const id of ['tongnamujip', 'gongjicheon', 'infield']) {
    const t = map[id];
    const row = `| ${id} | ${t.kType} | ${t.anchor} | ${t.kcontent} | ${t.grade} | ${t.evidence} |`;
    assert.ok(md.includes(row), `원문 불일치: ${id}`);
    console.log(`문자대조 OK · ${row}`);
  }
  assert.strictEqual(isBadge(tagsFor('tongnamujip')), true); // kfood 강함
  assert.strictEqual(isBadge(tagsFor('modern-buckwheat')), true); // 중간
  assert.strictEqual(isBadge(tagsFor('gongjicheon')), false); // 근거없음
  assert.strictEqual(isBadge(tagsFor('jungdo-mullegil')), false); // 약함
  assert.strictEqual(isBadge(tagsFor('infield')), false); // anchor false
  assert.strictEqual(tagsFor('legoland').kType, 'landmark'); // 덴마크 IP · K배지 금지
  assert.strictEqual(isBadge(tagsFor('legoland')), false);
  assert.deepStrictEqual(tagsFor('carpe'), LOCAL); // §7 목록 = 기본값
  const all = Object.keys(map);
  console.log(`표 파싱 ${all.length}건 · 배지 ${all.filter((id) => isBadge(map[id])).length}건 · 셀프체크 PASS`);
}
