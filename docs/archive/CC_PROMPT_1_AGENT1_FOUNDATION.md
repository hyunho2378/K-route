아래 작업을 순서대로 실행해라.
세션 시작. 작업 전 아래 파일을 순서대로 전부 읽어라.
1. CLAUDE.md
2. DESIGN.md
3. src/tokens.js
4. IA.md
5. ROUTES.md
6. COMPONENTS.md
7. PATTERNS.md
8. PROGRESS.md
9. AGENTS.md

[세션 정체성] 너는 PHASE 1A — AGENT-1 (기반) 이다. 담당 범위는 COMPONENTS.md 섹션 A 전부이며, 섹션 B(Gate·Home)·C(Loop)의 실제 구현은 범위 밖이다.

[작업]
1. i18n: `en.js` / `ko.js`(키 완전 동형 — nav, home, gate, handsfree, loop, booking, ticket, pilot, status, common, meta 네임스페이스), `LangContext.jsx`, `LangSwap.jsx`(PATTERNS §1 그대로).
2. Context: `AuthContext.jsx`(목 로그인), `BookingContext.jsx`.
3. 데이터: `lines.js`, `stops.js`(전 좌표 `// PLACEHOLDER — verify on site` 주석), `departures.js`, `gateRoutes.js`(도착+60분 버퍼 룰), `stories.js`, `pilot.js`, `api.js`(단일 창구 — COMPONENTS A2 스펙).
4. 레이아웃·내비: `PageLayout.jsx`(/loop Footer 숨김), `Container.jsx`(DESIGN §5 캡 규칙 — 3xl 이상 1560 고정), `Section.jsx`, `Header.jsx`(PATTERNS §2), `GlassDock.jsx`(PATTERNS §3 — 포커스 트랩·수축 트리거 4종), `Footer.jsx`(navy 풀블리드 + 라인 3색 스트라이프), `LangToggle.jsx`.
5. UI 프리미티브: Button, IconButton, Chip, StatusBadge, Stepper, BottomSheet, Dialog, Modal(뷰포트 자동 분기), EmptyState, VideoPlayer(자막 상시), Skeleton, LoginGate — 전부 COMPONENTS A4 props 계약 그대로.
6. `App.jsx`: ROUTES.md §2 셸 + 각 페이지는 `<Section title={사전키}>` 한 줄 스텁으로 생성. 스텁 파일 상단에 주석: `// STUB — AGENT-2/3가 확장한다(교체 아님). 기준: IA.md, COMPONENTS.md`.

[완료 조건 — 전부 직접 검증]
- 토큰 클래스 전부 동작, Kanit·Pretendard 로드(네트워크 탭 확인).
- EN↔KR 토글 시 Header·Dock·Footer 레이아웃 시프트 0.
- Header 스크롤 72→56 수축. GlassDock 접힘/확장 + 수축 트리거 4종(바깥탭·스와이프다운·Escape·라우트 변경) + 포커스 트랩.
- 전 라우트 스텁 렌더, 404 동작.
- 320 / 1280 / 3840 에서 셸 무결점(가로 스크롤 0, 컨테이너 캡 준수).
- grep 검증: localStorage 0건, HEX 직입력 0건(tokens·설정 파일 제외), scale 0건.

완료 후 PROGRESS.md 갱신, 커밋 제안([A1] feat: 기반) 후 멈춰라. 다음 프롬프트를 스스로 이어서 실행하지 마라. 명세 밖 결정은 질문해라.
