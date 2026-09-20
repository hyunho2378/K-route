# DESIGN.md — Cheongchun Line · CHUNCHEON VIVID v3

이 문서는 디자인의 유일한 기준이다. 여기 없는 색·크기·효과는 존재하지 않는 값이다.
모든 수치의 실제 값은 `client/src/tokens.js`가 단일 진실이며, 이 문서는 그 사용 규칙을 정의한다.

---

## 0. 플랫폼 확정

- **B형 반응형 웹.** 정체성은 웹이다. 앱이 아니다. 앱 성격·모호한 디자인 금지.
- 대응 구간: **320px ~ 3840px (4K 32인치 포함).** 마스터 프롬프트의 2560 상한을 3840으로 확장한다.
- Mobile First로 작성하되, 데스크탑이 열등한 축소판이 되지 않게 한다 — lg 이상에서 지도·라인맵은 화면의 주인공이 된다.

## 1. 브랜드 무드 — CHUNCHEON VIVID

- 순백(#FFFFFF) 위에 고채도 라인 컬러가 지하철 노선도처럼 흐르는 인상. 배경은 침묵하고 라인이 말한다.
- **시그니처 요소(단 하나): 살아있는 라인 맵.** 시네마틱 3D 지도 위에 3개 라인이 컬러로 흐르고 셔틀 위치가 실시간 표시된다. 나머지 화면은 이 하나를 위해 절제한다.
- 캐릭터(봄내크루)는 라인의 얼굴이지만 **콘텐츠 이미지로만** 등장한다. 캐릭터의 파스텔 색을 UI 팔레트로 쓰지 않는다.
- 금지 무드: 웜톤 크림 배경, 파스텔 UI, 그라데이션 남용, "AI가 만든 것 같은" 기본값 룩.

## 2. 컬러 (tokens.colors)

| 토큰 | 값 | 역할 |
|---|---|---|
| bg | #FFFFFF | 페이지 배경. 전 페이지 공통 |
| primary | #009FE3 | 링크·활성 상태·CTA·Lake Line |
| navy | #27348B | 푸터 풀블리드, 강대비 면, 티켓 면 |
| yellow | #FFC400 | Potato Line 전용 + 경고성 배지 |
| spice | #FF4438 | Dakgalbi Line 전용 + 에러 |
| green | #00B865 | 성공/출발확정 상태 |
| magenta | #F0347C | 포인트 강조(페이지당 1회 이하) |
| ink / inkSec / inkMeta | #14172E / #4E5470 / #8B90A7 | 텍스트 3단계 |
| line | rgba(20,23,46,0.10) | 보더 |
| glass | rgba(255,255,255,0.66) | 글래스 면 (blur 예산 3곳 전용) |
| scrim | rgba(20,23,46,0.55) | 자막 밴드 + 히어로 스크림 |
| surface | #F5F6FA | 입력 배경·스켈레톤·지도 로딩면 |

규칙:
- HEX·rgb 직접 입력 전면 금지. Tailwind 클래스는 tokens에서 생성된 것만 사용.
- 고채도 서포트 4색(yellow/spice/green/magenta)은 **면적을 크게 쓰지 않는다.** 라인 스트로크, 배지, 마커, 스탬프 등 소면적 고밀도로.
- 글래스 위 텍스트는 ink 계열 선명 컬러만 (HIG Materials: 반투명 머티리얼 위에는 vibrant/선명 색상만 — 저대비 색 금지).
- WCAG 2.1 AA: 일반 텍스트 대비 4.5:1 이상, 대형 텍스트·UI 컴포넌트 3:1 이상. yellow 위 텍스트는 ink만 허용(white 금지).

## 3. 라인 컬러 매핑 (tokens.lineColors)

| 라인 | 토큰 | 코스 |
|---|---|---|
| Potato Line | yellow #FFC400 | 감자밭 → 소양강댐 → 소울로스터리 |
| Dakgalbi Line | spice #FF4438 | 통나무집 닭갈비 → 막국수체험박물관 → 구도심 |
| Lake/Culture Line | primary #009FE3 | 소양강스카이워크 → 화동2571 → 공지천 |

라인을 지칭하는 모든 UI(맵 스트로크, 정류장 스트립, 배지, 티켓, 스탬프)는 이 3색으로만 식별한다.

## 4. 타이포그래피

- **Kanit(300~700)**: 영문·숫자·디스플레이 전용. **한글 글리프가 없다 — 한글에 절대 지정 금지.**
- **Pretendard Variable**: 한글 전담 + 본문.
- 폰트 스택은 tokens.fonts만 사용: display 텍스트는 `fonts.display`, 본문은 `fonts.body`. 스택 순서 덕에 라틴/숫자는 Kanit, 한글은 Pretendard로 자동 폴백된다.
- CDN: Kanit = Google Fonts(300;400;500;600;700), Pretendard Variable = jsDelivr dynamic-subset. `index.html`에서 preconnect + link.

웨이트 위계(강제):
- Bold 700 — display, H1, 큰 숫자(가격·시간·예약코드)
- SemiBold 600 — H2, CTA 라벨
- Medium 500 — H3, 네비, 칩, caption
- Regular 400 — 본문
- Light 300 — 18px 이상에서만
- **한 화면 최소 3웨이트 공존. 인접 요소 동일 웨이트 나열 금지.**

Fluid 스케일 (tokens.typeScale): display `clamp(44px,6vw,104px)` / h1 `clamp(32px,4vw,56px)` / h2 `clamp(24px,2.5vw,36px)` / h3 20px / body 16px / small 14px / caption 12px·500.
- display는 4K에서도 104px 캡을 넘지 않는다 — 대형 화면 대응은 글자 확대가 아니라 여백 확대다.
- 자간: display/h1의 라틴 대문자는 letter-spacing `-0.01em ~ -0.02em`, caption 라틴 대문자 라벨(eyebrow)은 `+0.08em`.

## 5. 레이아웃 · 반응형 · 4K 전략

브레이크포인트 (tokens.breakpoints): sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536 / 3xl 1920.

컨테이너 (tokens.containers):
| 구간 | 규칙 |
|---|---|
| ~md | 좌우 마진 20px |
| md~lg | 좌우 마진 32px |
| lg~2xl | max-width 1200px + 마진 48px, 중앙 정렬 |
| 2xl~3xl | max-width 1400px |
| 3xl(1920)~**3840** | **max-width 1560px 캡 고정 + 여백. 콘텐츠 확장 금지** |

- **풀블리드 허용 3곳뿐: 히어로 / 지도(LoopMap) / 푸터.** 그 외 전부 컨테이너 안.
- 4K 32인치 대응 원칙: 캡+여백. 히어로는 `min-height: clamp(560px, 72vh, 960px)`로 위아래가 비지 않게, 지도는 뷰포트를 가득 채우고, 텍스트 콘텐츠는 1560 캡 안에서 좌우 대칭 여백으로 안정시킨다.
- 간격은 tokens.spacing 배수만 사용. 임의 px 금지.
- 그리드: 모바일 4컬럼 / md 8컬럼 / xl 12컬럼. 카드 그리드는 gap 16(모바일)→24(md)→32(xl).

**QA 뷰포트 매트릭스 (전 항목 필수 — AGENT-REVIEW가 실행):**
`320 / 390 / 640 / 768 / 1024 / 1280 / 1536 / 1920 / 2560 / 3840`
각 뷰포트에서: 가로 스크롤 없음, 콘텐츠 잘림 없음, 컨테이너 캡 준수, 풀블리드 3곳 외 전폭 요소 없음.

## 6. 내비게이션

**데스크탑 (lg+) — Header**
- 상단 고정. 로고(primary 단색) + 메뉴(Gate / Loop / Hands-Free / About) + LangMenu + 로그인 아이콘.
- 메뉴 라벨 기본 **SemiBold 600 / ink** (v3.1: 500은 너무 얇아 한 단계 상향). 현재 라우트는 **라벨 자체가 primary 컬러** — 언더라인·바·인디케이터 일절 금지. hover는 inkSec→ink 160ms.
- 초기 높이 72px → 스크롤 시 glass + 56px 수축은 유지하되, **초기 상태도 투명 금지**: 항상 `rgba(255,255,255,0.92)` 이상의 면을 가진다. 지도·사진 위에서 헤더가 사라지는 사고(v3.0 Loop) 재발 방지 — 라우트 무관 동일 규칙.
- **LangMenu**: 토글이 아니라 드롭다운. lucide `Globe` 아이콘 IconButton(44×44) → 클릭 시 메뉴 카드(radius md, shadow md)에 `English / 한국어 / ไทย` 세로 나열, 각 항목은 해당 언어의 자기 표기. 현재 언어는 primary 라벨 + `Check` 아이콘. 국기·이모지 금지. 키보드 순회 + Escape 닫기.

**모바일 (<lg) — GlassDock**
- 중앙 하단 **리퀴드 글래스 모핑 필**(blur 예산 2/3, 그림자 예산 1/2).
- 접힘: 로고 + 현재 페이지명 + 점 3개. 높이 56px, pill radius.
- 탭 → 위로 부풀며 spring 320ms로 전체 메뉴 + 언어 토글 + 로그인 노출.
- 수축 트리거: 바깥 탭 / 스와이프 다운 / 라우트 변경. 확장 중 포커스 트랩 + Escape 닫기.
- **탭바·햄버거 금지.** 터치 타깃 최소 44×44px (HIG).

**푸터 (v3.1 전면 개정)** — **primary #009FE3 풀블리드**, 텍스트 white(메타는 white 72%). navy·검정 금지, 상단 스트라이프 보더 폐지. G-Local 구조 이식: 4컬럼 그리드(브랜드 한 문장+로고 / Explore 링크 / Contact: `official@bomnaehelper.ac.kr` / Team 5 · STATION C Glocal Solverthon Chuncheon). 최하단 바: 좌측 `© 2026 Cheongchun Line · Team 5`, **우측 Privacy Policy · Terms of Service** — 각각 `/legal/privacy` `/legal/terms`를 **새 탭**(`target="_blank" rel="noopener"`)으로. **언어 토글 없음**(헤더 LangMenu가 유일한 언어 진입점), "Prototype for demonstration…" 문구 삭제(해당 고지는 Terms 본문 안으로 이동).

## 7. 컴포넌트 스타일 규칙

- **버튼(CTA)**: SemiBold 600, radius pill, 높이 48(모바일)/44(데스크탑), primary 배경 + white 텍스트. 텍스트 버튼은 흐름 전진 CTA만("Find my route", "Reserve seats"). hover: 배경 navy 전환 160ms. focus-visible: 2px primary 아웃라인 offset 2px.
- **IconButton**: 반복 액션 전부(공유, 닫기, 언어, +/-). lucide 단일, aria-label 필수, 데스크탑 툴팁. 44×44 히트영역.
- **카드 (v3.1 무보더 원칙)**: bg white 단색 + `shadow.sm`, radius lg(16). **모든 보더 폐지** — 특히 좌측·상단 1~2px 액센트 보더는 어디에도 금지. 깊이는 tokens.shadow 3단으로만: 기본 sm, hover는 `shadow.md + translateY(-2px)` 160ms. 배경이 white인 면 위 카드가 안 떠 보이면 카드 bg를 surface로 바꾸지 말고 섹션 배경을 surface로 깔아 대비를 만든다. **scale 금지.**
- **구분선**: 카드·박스 외곽선은 0. 리스트 항목 사이 등 내부 구획이 꼭 필요할 때만 `colors.line` 1px 수평 디바이더 허용.
- **칩/배지**: Medium 500, caption 12px, pill. 상태 배지 색: 출발확정 green / 출발유력 yellow(+ink 텍스트) / 마감 inkMeta.
- **폼 (v3.1)**: 입력은 보더 없이 **surface 배경 단색면**, radius md. focus 시 `box-shadow: 0 0 0 2px primary`(링) — border 속성 미사용. 라벨 small 14 Medium. 에러는 인라인(spice 텍스트 + 필드 링 spice) — 팝업 금지. 문구는 무엇이 잘못됐고 어떻게 고치는지(사과·모호함 금지).
- **FieldSelect (v3.1 — 네이티브 select·time input 전면 금지)**: 터미널·시간·인원 등 모든 선택은 Skyscanner식 커스텀 필드. 닫힘 상태 = 라벨(caption inkMeta) + 값 또는 플레이스홀더("Airport", "Time"). 클릭 → 필드 아래 옵션 카드(radius lg, shadow md)에 lucide 아이콘 + 주 텍스트 + 보조 텍스트(코드·설명) 리스트. 키보드 ↑↓·Enter·Escape, `role="listbox"`. **네이티브 time input의 OS 로케일(오전/오후) 누수 사고를 원천 차단** — 시간 옵션 라벨도 사전 키로 언어 전환.
- **모달리티 (HIG Modality 근거)**: 모바일 = BottomSheet(위로 슬라이드, blur 예산 3/3, 그림자 예산 2/2, 그랩바, 스와이프 다운 닫기), 데스크탑 = 중앙 Dialog(max-width 560px, 동일 glass 면). 모달은 예약 확인·로그인 게이트 등 완결 과업에만.
- **EmptyState**: unDraw 일러스트(프라이머리 단색 재컬러) + 한 문장 + 행동 CTA. 위치 제한: 빈 검색 결과, 404/500, 로그인 게이트.

## 8. 아이콘 라이브러리 (필수 규칙)

- 기본: **lucide-react** (https://lucide.dev) — 모든 인터페이스 아이콘은 여기서만.
- 보조(사용자 사전 승인 필요): Bootstrap Icons, react-icons, Heroicons. **AGENT 임의 도입 금지.**
- 한 페이지 내 라이브러리 혼용 금지.
- 사이즈 5단계만: 16 / 20 / 24 / 32 / 48px.
- 색상은 텍스트 토큰만: ink, inkSec, inkMeta, primary, white.
- **이모지 아이콘 전면 금지.**

## 9. 일러스트

- unDraw만. 위치: EmptyState / 로그인 게이트 / 404·500. 콘텐츠 페이지(라인 상세, 예약, 티켓) 사용 금지.
- 메인 컬러는 primary 또는 흑백으로 재지정 후 SVG로 `client/public/images/illustrations/` 저장. 다색 일러스트 금지.
- 일러스트 + 사진 한 화면 혼용 금지.

## 10. 모션 · 효과 예산

| 예산 (v3.1) | 허용 위치 |
|---|---|
| blur(리퀴드 글래스) 5면 | Header / GlassDock / BottomSheet·Dialog / 지도 위 라인 카드(Loop) / LinePreview 오버레이 패널. **중첩 blur 금지, 글래스 위 텍스트는 선명색만(HIG Materials)** |
| 그림자 | 개수 제한 대신 **체계 제한**: tokens.shadow 3단(sm/md/lg)+dock/sheet 외 임의 그림자 금지. 무보더 원칙의 유일한 깊이 수단 |
| 그라데이션 1곳 | 히어로 스크림(scrim → transparent). 지도 라인 글로우는 그라데이션이 아니라 저불투명 두꺼운 스트로크로 해결 |
| scale 화이트리스트 2곳 | 예약 성공 스탬프 드롭 1.4→1.0 / 카드 리빌 0.96→1.0 |

- 스프링: `cubic-bezier(0.32,1.32,0.5,1)` 320ms. 일반 전환 160ms ease.
- 위 화이트리스트 외 **transform: scale 전면 금지** (마커·카드 hover 포함).
- 히어로 패럴랙스 금지. 스크롤 하이재킹 금지.
- `prefers-reduced-motion: reduce` 전면 대응 — 애니메이션·전환 제거, 스탬프는 즉시 표시.
- 모션은 의미가 있을 때만(HIG Motion): 상태 변화·공간 관계 전달 목적. 장식 모션 금지.

## 11. 지도 (MapLibre)

- **MapLibre GL + openfreemap liberty 타일만.** 구글·네이버맵 임베드 금지.
- 기본 카메라: tokens.map — center [127.735,37.885], zoom 11.5, pitch 58, bearing -18. 정류장 포커스 시 flyTo(zoom 15, pitch 63, 1500ms).
- 3D 건물: fill-extrusion, minzoom 13, 컬러 램프는 tokens.map.extrusion(중립 잉크 톤) — 건물은 침묵, 라인이 주인공.
- **라인 3레이어 (v3.1 생동감)**: 아래부터 ①글로우 — 라인 컬러 22% 불투명, 폭 12→18px ②케이싱 — 흰색, 폭 7→10px ③본선 — lineColors, 폭 4.5→7px(zoom 11.5→15 보간). `line-cap/join: round`. 이 3겹이 "얇고 밋밋한 줄" 문제의 해답이다 — 그라데이션·scale 없이 두께 위계로만.
- **draw-on 등장**: 소스 `lineMetrics: true` + `line-gradient` progress를 rAF로 0→1 이징(720ms, ease). 페이지 진입·라인 선택 시 선이 그려지듯 나타난다. reduced-motion이면 즉시 완성 상태.
- 정류장 마커: 커스텀 HTML 마커(라인 컬러 링 + 흰 코어). active는 **scale이 아니라** 사이즈 스텝(22→28px) + 펄스 링. 클릭 시 **StopPopup**: 마커 위로 글래스가 아닌 white 카드(radius lg, shadow lg) — 정류장명·한 줄 소개·체류시간·"View line" 텍스트 버튼. 동시에 1개만, 지도 탭·Escape로 닫기.
- **셔틀 스무딩 (v3.1 자글거림 수술)**: 위치는 매 프레임 새 값 대입이 아니라 **지수 lerp**(current += (target−current)×min(1, dt×3))로 따라가고, 마커 요소는 `will-change: transform` + translate3d, `pitchAlignment:'map'`. 진행은 경로 누적거리 기반 보간(정점 간 등속) — 정점마다 덜컥거리는 원인 제거. reduced-motion 시 정지.
- 지도 컨트롤은 우하단, attribution compact 유지(오픈데이터 크레딧 의무).

## 12. 미디어

- 영상: `muted autoplay playsInline loop` + **상시 자막(always-on)**. 자막 17px 이상, 밴드 scrim `rgba(20,23,46,0.55)`, 하단 safe 영역 위.
- **이미지에 텍스트 굽기 금지** — 포스터형 이미지 금지, 모든 텍스트는 DOM에.
- 사진: aspect-ratio 고정, `loading="lazy"`, alt 필수. 히어로용 실사진은 텍스트 없는 실사만(현장탐방 촬영분).

## 13. 이중언어 (EN 기본 / KR 토글)

- **v3.1 다국어**: 사전은 네임스페이스 분할 — `src/i18n/{en,ko,th}/{common,gate,loop,brand,legal}.js`를 각 언어 index가 병합. 3개 언어 **키 완전 동형.** UI 하드코딩 문자열 0. 태국어 글리프는 **Kanit이 네이티브 커버**(Kanit은 태국어 서체다) — th일 때 display·body 모두 Kanit 우선 스택. th 초안은 en 기반 기계 번역 허용하되 PROGRESS 준비물에 "네이티브 검수" 등재.
- **카피 표기 규칙 (v3.1)**: **줄표(—, –) 전면 금지** — 사전·하드카피·주석 노출 문자열 전부. 문장은 마침표·쉼표·접속사로 자연스럽게 잇는다. 하이픈(-)은 복합어(Hands-Free)에만.
- **본문 측정폭 해제 (v3.1)**: 텍스트 블록에 `max-w-*` 개별 캡 금지. 줄바꿈은 오직 컨테이너 폭이 결정한다 — 우측이 비는데 강제 개행되는 현상의 원인 제거. `<br>` 수동 개행도 히어로 디스플레이 타이포 외 금지.
- 전 인터랙티브 라벨은 **LangSwap 패턴**(PATTERNS.md §1): 같은 grid 셀에 두 언어 겹침 + invisible → 전환 시 레이아웃 시프트 0. **EN 기준 폭 설계.**
- 언어 상태는 in-memory Context (localStorage 금지). 기본 EN.
- 카피 원칙: 시스템 구조가 아니라 사용자가 인식하는 행동으로 명명("Reserve seats", "Send my bags"). 버튼 라벨은 플로우 끝까지 동일 어휘 유지.

## 14. 접근성 (WCAG 2.1 AA)

- 대비 4.5:1(일반) / 3:1(대형·UI). 모든 이미지 alt, 모든 IconButton aria-label.
- 키보드 완전 지원: focus-visible 스타일 필수, Dock/Sheet 포커스 트랩, Escape 닫기.
- 지도는 키보드 대체 경로 제공 — 정류장 리스트가 지도와 동일한 선택을 수행한다(지도 없이도 전 기능 사용 가능).
- aria-live: 경로 결과·예약 상태 변경 영역에 polite.

## 15. 금지 종합

TypeScript(.ts/.tsx/interface/type) / localStorage·sessionStorage / 색·간격·폰트 하드코딩 / 이모지 / 탭바·햄버거 / 화이트리스트 외 scale / 패럴랙스 / 구글·네이버맵 / 포스터 이미지(텍스트 굽기) / 웜톤·파스텔 UI / Kanit에 한글 / 캐릭터 파스텔의 UI 사용 / generic sans-serif·system-ui 폰트 지정.

---

## 16. v3.2 전면 개정 (2026-07-21 2차 크리틱) — 이 섹션이 앞 섹션과 충돌하면 이 섹션이 이긴다

### 16.1 컬러 (Apple 캘리브레이션)
- **primary = #0073EC 단일.** 구 #009FE3, navy를 포함한 다른 블루 UI 사용 전면 금지(navy는 티켓 카드 면 하나만 잔존). Lake 라인 컬러도 primary를 따른다(tokens.lineColors 자동 반영).
- **회색 텍스트 전면 금지.** 본문·라벨·링크·버튼 = ink(#101114) 또는 white. 보조 문장 = inkSec(#2E3138) 차콜까지만. inkMeta는 12~13px 캡션 전용 하한선. 이보다 연한 어떤 회색도 텍스트에 금지.
- **연한 색면(파스텔·틴트) 전면 금지.** 라인 컬러의 soft/알파 배경, 연노랑 면, 옅은 색 배지 금지. 색은 원색 그대로 쓰고 면적으로 조절한다. yellow(#FFC400)는 면·도트·배지 배경 전용, 텍스트 컬러 금지(대비 미달).
- 상태 도트·라인 뱃지: **쨍한 원색 원 + shadow.sm** (yountravel 캘린더 범례 방식).

### 16.2 타이포그래피 (웨이트 위계 강제 강화)
- 본문 폰트 **SUIT Variable**(Pretendard 폐지). 디스플레이·숫자·태국어 Kanit 유지.
- **Light(300) 사용 금지**(디스플레이 104px급 1곳 예외 검토조차 하지 말 것). 기본 조판: 본문 400, 라벨·메뉴·버튼 600, h3 600, h2 700, h1·display 700. **한 화면에 400/600/700 세 웨이트가 반드시 공존**하고, 인접 텍스트 동일 웨이트 나열 금지.
- 회색+얇음 조합은 "AI틱"의 근원이다. 위계는 색이 아니라 **웨이트와 크기**로 만든다.

### 16.3 레이아웃 확폭
- tokens.containers v3.2 적용: 캡 1320/1560/1800, 마진 16/24/40. 전 페이지 공통, 예외 없음.
- 법적 페이지·긴 산문만 읽기 폭을 위해 컨테이너 안 좌측 정렬 유지(별도 max-w 금지 원칙은 유지하되 컨테이너가 이미 넓어졌으므로 그대로 둔다).

### 16.4 헤더 (visitkorea 스케일)
- 높이 80px(스크롤 시 64px). 로고 22px 700. **메뉴 라벨 17px SemiBold 600**, 항목 간격 32px 이상. 외국인 가독 최우선.
- 메뉴 순서: **About | Getting Here | Bag Delivery | City Lines** (§16.7 명명). 액티브 = primary 텍스트.
- **모바일에도 상단 헤더 존재**: 로고 + LangMenu + 로그인. 내비게이션만 GlassDock(하단)이 담당, 햄버거 금지. 상단 헤더에서 메뉴 시도 금지(v3.1 모바일 깨짐 사고의 원인 제거 — 메뉴는 Dock 단일 소유).
- 헤더는 전 라우트 불투명 유지(재확인).

### 16.5 푸터 압축
- 세로 최대 2단: [1단] 로고+한 문장, Explore 링크 가로 나열, Contact 이메일 — 한 행 그리드. [2단] 하단 바: 좌 `© 2026 Cheongchun Line. All rights reserved.` + `Team 5`, 우 Privacy Policy · Terms of Service(새 탭). 대회 풀네임·주소성 텍스트 금지. 데스크탑 기준 총 높이 240px 이내.

### 16.6 언어 동형 원칙 (레이아웃 패리티)
- en/ko/th **어떤 언어에서도 요소의 위치·순서·개수·구조가 동일**해야 한다. 언어 전환은 텍스트만 바뀐다(LangSwap). 언어별 디자인 분기·요소 이동·조건부 노출 전면 금지. 검수 시 3언어 스크린샷 오버레이 비교.

### 16.7 서비스 명명 (사용자 언어로 전환)
공급자 용어(Gate/Loop) 노출 폐지. 라우트·코드 식별자는 유지하고 **표시 명칭만** i18n에서 교체:
| 코드 | EN | KR | TH 방향 |
|---|---|---|---|
| gate | Getting Here | 춘천 가는 길 | 의미역 |
| hands-free | Bag Delivery | 짐 보내기 | 의미역 |
| loop | City Lines | 시내 라인 | 의미역 |
| about | About | 소개 | - |
카피 전반에서도 "Gate/Loop" 브랜드 은어 대신 행위 언어("Plan my arrival", "Explore the lines")를 쓴다. 단 §16.10 도착 전환 연출의 "LOOP ACTIVE" 등 연출 카피는 예외적으로 허용.

### 16.8 버튼 페어 (Apple 패턴)
- Primary: primary 배경 + white 텍스트 600, radius pill, 높이 48/44.
- **Secondary(반전): 투명 배경 + primary 텍스트 600 + primary 1.5px 보더 pill.** 무보더 원칙의 명시적 예외 1호(버튼 한정). hover: primary 8% 틴트 배경(면이 아니라 상호작용 피드백이므로 §16.1 틴트 금지의 예외).
- 버튼은 텍스트 길이+패딩(좌우 24px)으로 폭 결정 — 임의 고정폭·풀폭 남발 금지(모바일 시트 CTA만 풀폭). 컨테이너 정렬 축과 버튼 정렬 축 일치(Find my route 정렬 사고 재발 방지).

### 16.9 지도 v3.2
- **초기 상태: 라인·정류장 비노출.** 지도 상단(마진 안) **라인 칩 3개**(네이버지도 카테고리 필 방식: white pill + shadow md + 라인 컬러 도트 + 라인명 600). 칩 선택 시에만 해당 라인 draw-on + 정류장 마커 + 셔틀 등장. 재탭 해제. 칩이 유일한 라인 진입점이므로 키보드 포커스 1순위.
- **hover 즉시 정보**: 데스크탑에서 정류장 마커 hover 시 StopPopup 즉시 표시(클릭 불필요), leave 시 유지 200ms 후 닫힘. 터치 기기는 탭 = hover 동등.
- 지도 장식 레이어: 라인 미선택 상태에서도 비어 보이지 않게 **춘천 POI 앵커 3~5개**(소양강댐·명동·남춘천역 등)를 무채색 미니 라벨 마커로 상시 표시(클릭 시 관련 라인 칩 하이라이트). 과밀 금지, 5개 상한.
- **줌 아티팩트 수술**: Map 생성 시 `antialias:true`(tokens.map), extrusion `fill-extrusion-opacity: 1`(반투명 z-fighting이 검은 깨짐의 원인), `fill-extrusion-vertical-gradient: false`, extrusion 레이어는 1회만 추가(HMR·재마운트 중복 addLayer 가드), 라인 draw-on 완료 후 gradient 속성 제거. WebGL 컨텍스트 유실 시 `webglcontextlost` 핸들러로 재초기화.
- 모바일 Loop: 라인 카드를 네이버 모바일처럼 **하단 소형 카드**(높이 최대 132px, 가로 스냅)로 축소. 지도 점유율 최우선.
- 패널·카드 내부 스크롤은 **스크롤바 비표시**(scrollbar-width:none + ::-webkit-scrollbar{display:none}) — 스크롤 기능은 유지.

### 16.10 UX 원칙 검증 의무
- 닐슨 휴리스틱 10 + 슈나이더만 황금률 8을 검수 단계 체크리스트로 상시 실행. 특히: 시스템 상태 가시성(로딩·도착 감지 상태), 사용자 통제(모든 모달 Escape·명시적 닫기), 인식>회상(선택값 상시 노출), 다크패턴 금지(정보를 클릭 뒤에 숨기지 않는다 — 캘린더 가격·잔여석은 펼친 상태가 기본).

---

## 17. v4.1 모션·머티리얼·크래프트 체계 (skills 이식) — 충돌 시 이 섹션이 이긴다

원전: 레포 `.claude/skills/`의 apple-design, emil-design-eng, review-animations(STANDARDS), improve-animations, find-animation-opportunities, animation-vocabulary. 아래는 이 프로젝트에 구속력을 갖는 증류본이고, 세부 근거·코드가 필요하면 해당 스킬을 연다.

### 17.1 애니메이션 결정 게이트 (빈도표 — 만들기 전에 통과)
| 빈도 | 결정 |
|---|---|
| 하루 100회+(키보드 트리거, 반복 토글) | 애니메이션 금지. 키보드 개시 동작은 항상 무애니메이션 |
| 하루 수십 회(hover, 리스트 이동) | 제거하거나 극소화 |
| 가끔(모달·시트·토스트) | 표준 애니메이션 |
| 드묾(온보딩·성공·스탬프) | 딜라이트 허용 |
유효 목적: 공간 일관성·상태 표시·설명·피드백·급변 방지. "멋있어서"는 자주 보이는 요소에선 무효.

### 17.2 이징·지속시간 (tokens.motion v4.1)
- 진입·퇴장 = easeOut / 화면 내 이동 = easeInOut / hover·색 = ease / 등속 = linear. **ease-in 전면 금지.**
- 지속: 프레스 120ms, 팝오버·드롭 180ms, 일반 UI 280ms(300 상한), 시트 360ms. 구 320ms 일괄 사용 폐지.
- 스프링(오버슛)은 **모멘텀이 실린 제스처의 결과에만**: 스탬프 드롭, Dock 모핑, 시트 플릭. 그냥 나타나는 메뉴에 바운스 금지.

### 17.3 scale 정책 개정 — "화이트리스트 2곳"에서 "원칙 4범주"로
장식적 scale 금지는 유지하되, 기능적 scale 4범주를 허용한다(이 외 전면 금지 동일):
1. 성공 스탬프 드롭 1.4→1.0 (기존)
2. 카드·팝오버 진입 0.96→1.0 + opacity (기존 확장: **scale(0) 시작 전면 금지** — 무에서 생기는 건 세상에 없다)
3. **프레스 피드백**: 모든 pressable에 `:active { transform: scale(0.97) }` transition 120ms easeOut — pointer-down 즉시, release 대기 금지
4. 팝오버·드롭·시트 진입 시 **origin-aware**: transform-origin을 트리거 위치로(모달만 center 예외)
지도 마커의 scale 금지는 유지(사이즈 스텝 방식 존속).

### 17.4 머티리얼 개정 — 헤더 규칙 교체
- 구 "헤더 상시 불투명 ≥0.92" 폐지. **헤더·Dock = 반투명 머티리얼 상시**: `rgba(255,255,255,0.72)` + `backdrop-filter: blur(20px) saturate(180%)` + 상단 1px `rgba(255,255,255,0.4)` 하이라이트(빛 맺힘 — 무보더 원칙의 머티리얼 예외). 콘텐츠는 밑으로 스크롤. v3.0 사고의 원인은 '완전 투명'이었고 머티리얼은 그 반대다.
- 스티키 크롬 아래 1px 경계선 대신 **스크롤 엣지 페이드**(콘텐츠와 겹치는 지점만 그라데이션 마스크 — 그라데이션 예산의 기능 예외).
- 밝은 반투명 위에 밝은 반투명 중첩 금지(기존 중첩 blur 금지와 동일). 글래스 위 텍스트: 회색 금지·약간 무거운 웨이트·letter-spacing +0.01em.
- 접근성 3신호 의무: `prefers-reduced-motion`(슬라이드·스프링→크로스페이드), `prefers-reduced-transparency`(글래스→불투명 white·blur 제거), `prefers-contrast: more`(불투명 + 명확한 경계선 — 무보더 원칙의 접근성 예외).

### 17.5 타이포 트래킹 (크기별, 고정값 금지)
display·h1 = letter-spacing -0.02em, line-height 1.05~1.15 / h2·h3 = -0.01em / 본문 = 0, line-height 1.5 / caption 12~13px = +0.01em. 하나의 letter-spacing 전역 지정 금지.

### 17.6 컴포넌트 크래프트 규칙
- 피드백은 pointer-down에서 시작하고 상호작용 내내 1:1(드래그 끝에서만 애니메이션 금지).
- 시트 드래그: 릴리즈 속도로 모멘텀 투영(project 함수) 후 최근접 스냅, 경계는 러버밴드(하드스톱 금지), 닫힘/복귀 판정은 위치가 아니라 **속도 부호**.
- 인터럽트 가능성: 제스처 대상은 CSS keyframes 금지(트랜지션 또는 스프링), 항상 현재 표시값에서 재시작.
- 툴팁: 첫 hover만 지연, 연속 hover는 지연·애니메이션 스킵.
- 진입 상태는 @starting-style 점진 적용(미지원 브라우저 무해).
- 모든 화면은 wayfinding 4문(여기가 어디, 어디로 갈 수 있나, 거기 뭐가 있나, 어떻게 나가나)에 답해야 한다.

### 17.7 스프링 구현 수단
제스처 구동 표면(BottomSheet 드래그, Dock 모핑, LinePreviewOverlay, 스탬프)에 한해 `motion` 패키지 채택 허용(React용 `motion/react`). 그 외 UI는 CSS 트랜지션 유지 — 라이브러리 남용 금지. 값은 bounce 0~0.2, duration 0.3~0.5 구간.

## 18. 반응형 계약 v1 (2026-07-21 · [H1]) — 충돌 시 이 섹션이 이긴다

### 18.1 내비게이션 단일 규칙
- **<1024px = 모바일 모드**: 상단 컴팩트 헤더(높이 56 · 로고+LangMenu+로그인 · 메뉴 없음) + 하단 GlassDock 내비.
- **≥1024px = 데스크탑 모드**: 풀 헤더(높이 80 · 메뉴 4항목) · Dock 없음.
- 두 모드 동시 노출·공백 구간이 1px도 없어야 한다. 태블릿(768~1023)은 모바일 모드다.

### 18.2 그리드 계약
- 카드 그리드(빌더·결제·리뷰): 모바일 2열 / md(768) 3열 / lg(1024) 4열.
- 2컬럼 레이아웃(티켓·상세): lg 미만 세로 스택(본문 먼저 · 패널 뒤) + 하단 고정 CTA 바.
- StepStage 반반 분할: lg 미만 상하 스택 + 섹션 헤더로 구분.

### 18.3 터치·safe-area 계약
- 전 인터랙티브 요소 최소 44×44(HIG). 터치 기기에서 hover 의존 기능은 탭 동등(StopPopup 등).
- 하단 고정 요소(GlassDock·모바일 CTA 바·StepStage 버튼 페어)는 `padding-bottom: env(safe-area-inset-bottom)` 필수.
- **100vh 금지 — dvh 사용**(모바일 주소창 변동). 시트류 전고 상한 90dvh.

### 18.4 동일 DOM 원칙
모바일 전용 페이지·컴포넌트 분기 금지 — 같은 DOM에 반응형 클래스만. 언어 동형 원칙이
브레이크포인트에도 적용된다: 어떤 폭에서도 요소의 존재·순서는 동일하고 배치만 바뀐다.
