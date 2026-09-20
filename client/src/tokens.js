// ============================================================
// tokens.js · K-Route 단일 진실(Single Source of Truth)
// 모든 색·타이포·간격·모션·지도 상수는 이 파일에서만 나온다.
// 컴포넌트/CSS에 HEX·px 하드코딩 금지. tailwind.config.js가 이 파일을 import한다.
// 배치 경로: client/src/tokens.js
// ============================================================

export const colors = {
  bg: '#FFFFFF',            // 배경 순백. 웜톤·파스텔·AI색 전면 금지
  primary: '#0073EC',       // v3.2: Apple 웹 캘리브레이션 블루로 교체(사용자 결정). 로고·액티브·푸터·CTA 등 크롬 단일색
  navy: '#27348B',          // v3.1: 크롬에서 퇴출. 티켓 카드 면 전용 액센트로만 잔존
  yellow: '#FFC400',        // 고채도 서포트 · Potato Line
  spice: '#FF4438',         // 고채도 서포트 · Dakgalbi Line
  green: '#00B865',         // 고채도 서포트 · 성공/확정 상태
  magenta: '#F0347C',       // 고채도 서포트 · 포인트(절제 사용)
  ink: '#101114',           // v3.2 텍스트 primary · 니어블랙. 회색 본문 전면 금지
  inkSec: '#2E3138',        // v3.2 secondary · 차콜. 이보다 연한 색으로 문장 조판 금지
  inkMeta: '#4E5257',       // v3.2 caption 전용 하한선. 12~13px 캡션 외 사용 금지, 링크·본문·라벨 금지
  line: 'rgba(20,23,46,0.10)',   // 보더
  glass: 'rgba(255,255,255,0.66)', // 글래스 면 (blur 예산 3곳 전용)
  scrim: 'rgba(20,23,46,0.55)',    // 영상 자막 밴드 + 히어로 스크림(그라데이션 1곳)
  surface: '#F5F6FA',       // 중립 면(스켈레톤, 지도 로딩면, 입력 배경)
};

// 라인 컬러 · 캐릭터 파스텔은 UI 팔레트가 아님(콘텐츠 이미지로만).
// UI에서 라인을 지칭할 때는 반드시 아래 3색만 사용한다.
export const lineColors = {
  potato: colors.yellow,    // Potato Line: 감자밭 → 소양강댐 → 소울로스터리
  dakgalbi: colors.spice,   // Dakgalbi Line: 통나무집 닭갈비 → 막국수체험박물관 → 구도심
  lake: colors.primary,     // Lake/Culture Line: 소양강스카이워크 → 화동2571 → 공지천
};

// [V11] Travel Log 발자취 라인 · 채도 높은 8색 순환(파랑 1 + 주황·초록·보라·로즈·청록·앰버·인디고).
//   기존 primary 명도 차등(구분 저하)을 교체 — 라인별 1색(그라데이션 금지 · §16.1), 로그 > 8이면 modulo 순환.
//   카드 좌측 도트와 지도 라인이 같은 색으로 짝지어진다(TravelLog·TravelLogMap 공유).
export const logShades = [
  '#0073EC', // blue (파랑 계열 1개 유지)
  '#FB6A00', // orange (주황)
  '#00B865', // green (초록)
  '#8B3FE8', // purple (보라)
  '#F0347C', // rose (로즈)
  '#00B5AD', // teal (청록)
  '#F5A623', // amber (앰버)
  '#3F51D6', // indigo (인디고)
];

export const fonts = {
  // v3.2: 본문 Pretendard → SUIT Variable 교체(라틴 회색조·얇음 문제). Kanit은 디스플레이·숫자·태국어.
  display: `'Kanit','SUIT Variable',sans-serif`,
  body: `'SUIT Variable','Kanit',sans-serif`,
  thai: `'Kanit','SUIT Variable',sans-serif`,
};

// 웨이트 위계 강제: 한 화면 최소 3웨이트 공존, 인접 동일 웨이트 나열 금지
export const weights = {
  bold: 700,      // display · H1 · 숫자
  semibold: 600,  // H2 · CTA
  medium: 500,    // H3 · 네비 · 칩 · caption
  regular: 400,   // 본문
  light: 300,     // 18px 이상에서만 허용
};

export const typeScale = {
  display: 'clamp(44px, 6vw, 104px)',
  h1: 'clamp(32px, 4vw, 56px)',
  h2: 'clamp(24px, 2.5vw, 36px)',
  h3: '20px',
  body: '16px',
  small: '14px',
  caption: '12px', // weight 500 고정
};

export const spacing = [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128];

export const breakpoints = {
  sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536, '3xl': 1920,
  // 1920 이상(2560 QHD, 3840 4K 32")은 추가 브레이크포인트 없이 컨테이너 캡 + 여백으로 대응.
  // QA는 3840까지 수행한다 (DESIGN.md §5 매트릭스).
};

export const containers = {
  // v3.2: 좌우 여백 축소·콘텐츠 확폭 (사용자 크리틱: 여백 과다)
  maxLg: 1320,   // lg~2xl
  max2xl: 1560,  // 2xl~3xl
  max3xl: 1800,  // 3xl 이상 · 4K에서도 이 캡
  marginBase: 16, // ~md
  marginMd: 24,   // md~lg
  marginLg: 40,   // lg~
};

// v3.1: G-Local Station 마감 스케일 이식(6~20). 칩/작은 요소 sm, 카드 md~lg, 시트/패널 xl.
export const radius = { xs: 6, sm: 10, md: 12, lg: 16, xl: 20, pill: 999 };

// v3.1 엘리베이션 체계 · 보더 전면 폐지의 대체재. 깊이는 오직 이 3단 그림자로만 표현한다.
// 카드 기본 sm, hover·Dock·팝업 md, 시트·다이얼로그·글래스 패널 lg. 임의 그림자 금지.
export const shadow = {
  sm: '0 2px 10px rgba(20,23,46,0.07)',
  md: '0 8px 28px rgba(20,23,46,0.12)',
  lg: '0 16px 48px rgba(20,23,46,0.18)',
  dock: '0 12px 40px rgba(20,23,46,0.16)',   // = md급, GlassDock 전용 유지
  sheet: '0 -12px 40px rgba(20,23,46,0.14)', // = 상향 그림자, Sheet 전용 유지
};

// v3.1 blur(리퀴드 글래스) 허용 5면: Header / GlassDock / Sheet·Dialog / 지도 위 라인 카드 / LinePreview 오버레이.
// 중첩 blur 금지(글래스 위 글래스 없음).
export const blur = { glass: '16px', glassSoft: '10px' };

// v4.1 모션 체계 (skills 이식): 기본 UI = 강한 ease-out(오버슛 없음), 스프링(바운스)은 모멘텀 표면 전용
export const motion = {
  easeOut: 'cubic-bezier(0.23, 1, 0.32, 1)',      // 진입·퇴장·기본값
  easeInOut: 'cubic-bezier(0.77, 0, 0.175, 1)',   // 화면 내 이동·모핑
  easeDrawer: 'cubic-bezier(0.32, 0.72, 0, 1)',   // 시트·드로어
  spring: 'cubic-bezier(0.32,1.32,0.5,1)',        // 모멘텀 제스처 결과 전용(스탬프·Dock). 일반 UI 금지
  durPress: '120ms',
  durPop: '180ms',
  fast: '160ms',
  dur: '280ms',        // v4.1: UI 상한 300ms 미만(구 320ms 폐지)
  durSheet: '360ms',
};

export const z = { map: 0, content: 10, header: 40, dock: 50, sheet: 60, dialog: 70 };

// MapLibre 상수 (sloverthon 레포 포팅 · PATTERNS.md §4)
export const map = {
  styleUrl: 'https://tiles.openfreemap.org/styles/liberty',
  antialias: true,          // v3.2: 줌 시 extrusion 지글거림·검은 면 아티팩트 완화 · Map 생성 옵션에 반드시 전달
  extrusionOpacity: 1,      // v3.2: 반투명 extrusion의 z-fighting(검게 깨짐) 방지 · 불투명 고정
  center: [127.735, 37.885], // 춘천 전경
  zoom: 11.5,
  pitch: 58,      // 시네마틱 기본
  pitchFocus: 63, // 정류장 포커스
  bearing: -18,
  flyDuration: 1500,
  extrusionMinZoom: 13,
  // 3D 건물 컬러 램프 · 중립 잉크 톤(라인 컬러가 주인공이 되도록 건물은 침묵)
  extrusion: { low: '#E8EAF2', mid: '#C3C8DA', high: '#8B90A7' },
};

const tokens = {
  colors, lineColors, logShades, fonts, weights, typeScale, spacing,
  breakpoints, containers, radius, shadow, blur, motion, z, map,
};
export default tokens;
