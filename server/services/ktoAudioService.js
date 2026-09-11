// [V5-2b] 공사 관광지 오디오가이드(odii) · IA §11.8(RAG 지식베이스 · P3 소비) · 근거 probe-kto: Odii
//   themeLocationBasedList(langCode ko·en, mapX, mapY, radius) → 테마(tid·tlid·title) · storyBasedList(langCode, tid, tlid) → 이야기(audioTitle·script·audioUrl)
//   tlid는 언어마다 다르다(probe: 강촌레일파크 ko 208/549 · en 208/550) → 언어별로 테마부터 조회 · 정상 '0000'
const { ktoGet, asItems } = require('../lib/kto');
const { km } = require('./recommendService');

const BASE = 'http://apis.data.go.kr/B551011/Odii';
const COMMON = { MobileOS: 'ETC', MobileApp: 'KRoute' };
const RADIUS_M = 1000; // PLACEHOLDER · 장소 좌표 반경 안에서 가장 가까운 테마 1개

// 장소 좌표 [lng, lat] → { theme, stories }(원문) · 반경 안 테마가 없으면 theme null
async function getAudioGuide(coord, lang = 'ko') {
  const langCode = lang === 'ko' ? 'ko' : 'en';
  const themes = asItems(
    await ktoGet(BASE, 'themeLocationBasedList', {
      ...COMMON,
      langCode,
      mapX: coord[0],
      mapY: coord[1],
      radius: RADIUS_M,
      numOfRows: 20,
      pageNo: 1,
    }),
  );
  if (!themes.length) return { theme: null, stories: [] };
  const [theme] = themes
    .map((t) => ({ t, d: km(coord, [Number(t.mapX), Number(t.mapY)]) }))
    .sort((a, b) => a.d - b.d)
    .map((x) => x.t);
  const stories = asItems(
    await ktoGet(BASE, 'storyBasedList', { ...COMMON, langCode, tid: theme.tid, tlid: theme.tlid, numOfRows: 50, pageNo: 1 }),
  );
  return { theme, stories };
}

module.exports = { getAudioGuide };
