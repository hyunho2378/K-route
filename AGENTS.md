# AGENTS.md — Cheongchun Line 에이전트 실행 구조 v3

> 구조 원칙(페이즈 분할·85% 규칙·체크리스트·아이콘 규칙)은 고정 AGENTS.md에서 계승하고,
> 담당 범위·체크 항목만 Cheongchun Line로 재조준했다. 이식 문서 §10 "문서 팩 v3 신규 작성(AGENTS 포함)" 근거.

## 하네스 구조

```
PHASE 0 — SETUP           (단독 1 에이전트)
PHASE 1A — AGENT-1 기반    (단독 선행 — 2·3의 의존성이므로 병렬 불가)
PHASE 1B — AGENT-2 ∥ AGENT-3  (병렬 2 에이전트, 1A 완료 후)
PHASE 2 — AGENT-REVIEW     (단독, 1B 전부 완료 후)
PHASE 3 — AGENT-SERVER     (단독, 2 통과 후)
```

구 버전과 달리 PHASE 1을 3병렬로 돌리지 않는다. AGENT-2/3가 전부 AGENT-1의 셸·프리미티브·데이터를 import하기 때문에, 1을 병렬에 섞으면 스텁 충돌이 난다(사고 이력 교훈).

## 담당 분배

**AGENT-1 (기반)** — COMPONENTS.md 섹션 A 전부
담당: tailwind.config.js, index.html, src/index.css, tokens.js 배치, i18n(사전+LangContext+LangSwap), Auth/Booking Context, data/* 목데이터 + api.js, PageLayout·Container·Section, Header·GlassDock·Footer·LangToggle, UI 프리미티브 전부, App.jsx 라우터 셸 + 페이지 스텁(각 페이지는 `<Section title>` 한 줄 스텁).
완료 조건: 토큰 클래스 전부 동작, 폰트 2종 로드 확인, EN/KR 토글 시프트 0, Header 수축 동작, GlassDock 접힘/확장/수축 트리거 4종 동작, 전 라우트 스텁 렌더, 320/1280/3840에서 셸 깨짐 없음.

**AGENT-2 (Gate·Home)** — 섹션 B 전부
완료 조건: Home 7섹션 순서 고정 렌더, Gate 쿼리 프리필 동작, planGate 결과 카드→단계 리스트 전환, aria-live 동작, HandsFree 확정 시 LoginGate→접수 코드, 전 라벨 사전 키.
스텁 규칙: AGENT-1이 만든 페이지 스텁은 **확장한다(교체 아님)** — 기준은 IA.md·COMPONENTS.md.

**AGENT-3 (Loop)** — 섹션 C 전부
완료 조건: LoopMap 라인 3개+마커+셔틀 시뮬 렌더, 패널↔지도 양방향 선택, 라인 상세 5블록 순서 고정, 캘린더 가격·배지·잔여 좌석, 예약 3스텝→LoginGate→티켓 이동, 스탬프 드롭 1회, 공유 폴백 동작.
스텁 규칙 동일: 확장(교체 아님).

**AGENT-REVIEW (검증)** — 아래 CHECKLIST 전 항목 + App 최종 조립 + 사전 키 누락 스캔.

**AGENT-SERVER (PHASE 3)** — 섹션 D 전부. 완료 조건: schema+seed 적용, 전 API 동작, OAuth httpOnly 쿠키 왕복, api.js 내부 교체 후 **페이지 코드 diff 0**, 좌석 초과 예약 409 검증.

## CHECKLIST (AGENT-REVIEW 필수 실행)

금지 항목 검사
- [ ] 비허용 폰트 지정 없음 (generic sans-serif, system-ui 단독 지정 금지 — tokens.fonts 스택만)
- [ ] 색상·간격 하드코딩 없음 (HEX/rgb/임의 px 직입력 0 — grep 검사)
- [ ] TypeScript 문법 없음 (.ts/.tsx/interface/type)
- [ ] scale 사용이 화이트리스트 2곳(SuccessStamp, 카드 리빌) 외 없음 — grep 'scale' 전수
- [ ] localStorage / sessionStorage 없음 — grep 전수
- [ ] 이모지 없음, lucide 외 아이콘 라이브러리 없음
- [ ] blur 사용 3곳(Header/GlassDock/Modal) 외 없음, 그림자 2곳 외 없음, 그라데이션 1곳(히어로) 외 없음
- [ ] UI 하드코딩 문자열 0 — en.js/ko.js 키 동형 diff 검사
- [ ] Kanit이 한글 텍스트에 단독 지정된 곳 없음

레이아웃 검사 (DESIGN §5 매트릭스: 320/390/640/768/1024/1280/1536/1920/2560/**3840**)
- [ ] 전 뷰포트 가로 스크롤·잘림 없음
- [ ] 컨테이너 캡: 1280에서 1200, 1536에서 1400, 1920 이상 전부 1560 고정
- [ ] 2560·3840에서 콘텐츠 확장 없음(캡+여백), 히어로·지도·푸터만 풀블리드
- [ ] <lg GlassDock / lg+ Header 전환 정확, 탭바·햄버거 없음
- [ ] 터치 타깃 44px, focus-visible 전 인터랙티브 요소

기능 검사
- [ ] EN↔KR 전환 전 화면 레이아웃 시프트 0
- [ ] Gate: 도착시각+60분 버퍼가 첫 탑승 편 계산에 반영
- [ ] 캘린더 status 규칙(booked 기준) 정확, 만석 회차 비활성
- [ ] 예약 확정 전 로그인 게이트, 게스트로 그 외 전 구간 진행 가능
- [ ] 티켓 코드 6자 렌더, 공유 폴백(다운로드) 동작
- [ ] /loop 키보드만으로 정류장 선택 가능(지도 대체 경로)
- [ ] prefers-reduced-motion에서 셔틀 시뮬·펄스·스탬프·리빌 전부 정지/즉시
- [ ] 좌표·가격·시간표 PLACEHOLDER 주석 잔존 확인(삭제 금지 — 현장 교체 대상 목록화)

할루시네이션 방지
- [ ] COMPONENTS.md에 없는 컴포넌트 추가 없음
- [ ] DESIGN.md에 없는 색·크기 없음
- [ ] PATTERNS.md 패턴 임의 변형 없음
- [ ] IA.md 섹션 순서 그대로 (Home 7섹션, LineDetail 5블록)

## 아이콘·일러스트 규칙

DESIGN.md §8·§9와 동일(기본 lucide-react 단독, 보조 라이브러리는 사용자 사전 승인, 사이즈 16/20/24/32/48, 색상 텍스트 토큰만, unDraw 단색·위치 제한). 이 규칙은 고정 AGENTS.md에서 그대로 계승.

## 커밋 규칙

```
[A0] chore: 프로젝트 스캐폴드 (client/server, tailwind, fonts)
[A1] feat: 기반 — tokens, i18n, 셸, 프리미티브, 목데이터
[A2] feat: Gate·Home
[A3] feat: Loop — 맵, 라인, 예약, 티켓
[AR] fix: REVIEW 수정 반영
[AR] chore: 조립·검증 완료
[AS] feat: 서버 — API, OAuth, Neon 연동
```

## 컨텍스트 관리

컨텍스트 85% 도달 시: 즉시 중단 → PROGRESS.md 갱신(완료/진행중/다음) → 대기. 재시작 세션은 PROGRESS.md 먼저 읽고 이어서.

## 절대 규칙 (고정 계승)

localStorage·sessionStorage 금지 / TypeScript 금지(JSX만) / 하드코딩 금지(tokens.js만) / 이모지 금지 / hover·focus 필수 / 320~**3840** 전 구간 무결점 / 명세 밖 결정 금지 — 질문 후 대기 / "통일 = 위반값으로 맞추기" 금지(위반값 쪽을 고친다).
