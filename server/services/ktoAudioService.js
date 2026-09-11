// [V5-2b] 공사 관광지 오디오가이드(odii) · IA §11.8(RAG 지식베이스 · P3 소비) · 근거 probe-kto(KTO_API.md 채택표): Odii
//   themeSearchList(langCode ko·en, keyword) → 테마(tid·tlid·title·addr1) · storyBasedList(langCode, tid, tlid) → 이야기(audioTitle·script·audioUrl)
//   tlid는 언어마다 다르다(probe: 강촌레일파크 ko 208/549 · en 208/550) → 언어별로 테마부터 조회 · 정상 '0000'
// [P3-A] 장소 ↔ 테마 매칭 = 이름 완전일치만(좌표·반경·포함 관계 판정 전면 폐지). 테마 응답에 contentid 필드가 없어(2026-09-12 실응답
//   tid·tlid·themeCategory·addr1·addr2·title·mapX·mapY·langCheck·langCode·imageUrl·createdtime·modifiedtime) 이름으로만 잇는다.
//   이름 = 장소명 전체 또는 끝 괄호 별칭을 뗀 이름(공백·기호 무시) · 테마 주소가 같은 시도(REGION 검색어)일 때만(타 지역 동명 차단 ·
//   테마 addr1은 시도까지만 온다: 실응답 "강원특별자치도" · "Gangwon-do")
//   (검증 2026-09-11: 좌표 근접 판정은 원조숯불닭불고기집 → 춘천낭만시장, 통나무집 닭갈비 → 막국수체험박물관 해설을 붙였다)
const { ktoGet, asItems } = require('../lib/kto');
const { REGION } = require('./ktoSpotService');

const BASE = 'http://apis.data.go.kr/B551011/Odii';
const COMMON = { MobileOS: 'ETC', MobileApp: 'KRoute' };

const nameKey = (s) => String(s ?? '').toLowerCase().replace(/[^0-9a-z가-힣]/g, '');
const baseName = (s) => String(s ?? '').replace(/\s*\([^()]*\)\s*$/, '').trim(); // "강촌레일파크(김유정레일바이크)" → "강촌레일파크"

// 장소명 { ko, en, … } → { theme, stories }(원문) · 이름 완전일치 + 같은 시도 테마가 없거나 이야기가 없으면 null
async function getAudioGuide(name, lang = 'ko') {
  const langCode = lang === 'ko' ? 'ko' : 'en';
  const full = name?.[langCode];
  const keyword = baseName(full);
  if (!nameKey(keyword)) return null;
  const keys = new Set([nameKey(full), nameKey(keyword)]);
  const area = REGION[langCode][0];
  const themes = asItems(await ktoGet(BASE, 'themeSearchList', { ...COMMON, langCode, keyword, numOfRows: 20, pageNo: 1 }));
  const theme = themes.find((t) => keys.has(nameKey(t.title)) && String(t.addr1 ?? '').includes(area));
  if (!theme) return null;
  const stories = asItems(
    await ktoGet(BASE, 'storyBasedList', { ...COMMON, langCode, tid: theme.tid, tlid: theme.tlid, numOfRows: 50, pageNo: 1 }),
  );
  return stories.length ? { theme, stories } : null;
}

module.exports = { getAudioGuide, nameKey, baseName };
