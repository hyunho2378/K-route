// ============================================================
// spots.js · [V5-3] K-Route 스팟 공용 규약 (build·route·go·checkout·ticket 공유)
// 풀 id 이원화(IA §11.4): kind 'kto' = 공사 contentid(합류 7곳은 venueId로 venues.js 역링크) · kind 'venue' = venues.js id.
//   이미지 = image(공사 대표이미지 · venue는 webp) → fallbackImage(합류 venue webp) → 둘 다 없거나 실패면 텍스트 카드(빈 박스 금지)
//   좌표 = coord(공사 원문 · 합류분은 공사 좌표가 없으면 서버 spotPool이 venue 좌표로 보강) · null이면 mockCoords DEMO + mockNotice
//   상세 = kto → /api/kto/spots/:id(detailCommon2·detailIntro2 원문 + odii) · venue → venueDetails·venues i18n(기존 VenueDetail)
// venues.js는 조회만 한다(값 수정 금지).
// ============================================================
import { venues } from './venues';

export const SLOT_MIN = 120; // IA §9.4 픽 1개 = 2시간 슬롯(venues.stayMin 동일 · StopPopup 체류 표기)

// 서버 풀 항목(추천 응답·/api/kto/spots) → 화면 스팟 · 한 줄 소개 없는 공사 항목은 빈 객체(TriText 빈 줄)
export const toSpot = (item) => ({ ...item, oneLine: item.oneLine ?? {}, stayMin: SLOT_MIN });

// id → 스팟 · known(추천 결과·풀) 우선(합류 7곳은 구 venue id로도 매칭) · 없으면 venues.js(Travel Log·구 예약 폴백 · 태그 없음)
export function resolveSpot(id, known = []) {
  const hit = known.find((s) => s.id === id) ?? known.find((s) => s.venueId === id);
  if (hit) return hit;
  const v = venues.find((x) => x.id === id);
  if (!v) return null;
  return toSpot({ id: v.id, kind: 'venue', name: v.name, oneLine: v.oneLine, category: v.category, coord: v.coord, image: v.image, badge: false });
}

// 이미지 후보 순서(앞이 실패하면 다음 · onError) · 빈 배열 = 텍스트 카드
export const spotImages = (spot) => [spot.image, spot.fallbackImage].filter(Boolean);

// 공사 원문 HTML 조각(overview의 <br>·&amp;·&rsquo; 등) → 표시 텍스트 · <br>(+ 바로 뒤 원문 줄바꿈) = 줄바꿈 1개 · 태그 제거 ·
//   엔티티 복원(숫자 참조 전부 + 자주 쓰는 이름 참조 · 모르는 이름은 원문 그대로) · innerHTML 금지
//   (검증 2026-09-11: 원조숯불닭불고기집 영문 소개에 &rsquo; 노출 · <br>\n 이 빈 줄로 보임)
const ENTITY = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  middot: '·',
  hellip: '…',
  bull: '•',
  deg: '°',
  times: '×',
  ndash: String.fromCharCode(0x2013), // 줄표는 원문 복원용 코드포인트로만(소스·카피에 줄표 문자 금지 규칙)
  mdash: String.fromCharCode(0x2014),
};
const decode = (m, e) => {
  if (e[0] !== '#') return ENTITY[e.toLowerCase()] ?? m;
  const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : Number(e.slice(1));
  return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : m;
};
export const ktoText = (html) =>
  String(html ?? '')
    .replace(/<br\s*\/?>\n?/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, decode)
    .trim();

// 공사 homepage 필드(<a href="…">) → http(s) 링크만(javascript: 등 차단) · 없으면 null
export function ktoHref(html) {
  const s = String(html ?? '');
  const url = /href=["']([^"']+)["']/i.exec(s)?.[1] ?? ktoText(s);
  return /^https?:\/\//i.test(url) ? url : null;
}

// [V5-17] 공사 이미지 표시용 주소 · 원문은 http 로 오는데 배포는 https 라 그대로 쓰면 mixed content 로 차단된다.
//   원문(kto_spots.raw)은 그대로 두고 화면에 넣기 직전에만 바꾼다(서버 spotPool.httpsImage 와 같은 규칙 · KTO_API 규율).
export const ktoImageUrl = (u) =>
  u ? String(u).replace(/^http:\/\/tong\.visitkorea\.or\.kr\//, 'https://tong.visitkorea.or.kr/') : null;

// [V5-17] 상세 사진 갤러리 · detailImage2 원문 배열(raw.images) → 표시용 { key, src, alt }.
//   서버가 이미 저장해 둔 것만 쓴다(신규 API 호출 0) · 썸네일은 smallimageurl 우선, 없으면 원본.
//   주소가 비었거나 http 변환 후에도 쓸 수 없는 항목은 떨군다(§9.4 빈 박스 금지).
export const ktoGallery = (detail) =>
  (detail?.images ?? [])
    .map((img, n) => ({
      key: String(img.serialnum ?? n),
      src: ktoImageUrl(img.smallimageurl || img.originimgurl),
      alt: ktoText(img.imgname),
    }))
    .filter((img) => img.src);
