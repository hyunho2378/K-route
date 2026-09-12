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

[세션 정체성] 너는 PHASE 1B — AGENT-2 (Gate·Home) 다. 담당은 COMPONENTS.md 섹션 B 전부. AGENT-1이 만든 기반(프리미티브·데이터·셸)을 import해서 쓰고, 기반 파일은 수정하지 마라. 페이지 스텁(Home/Gate/HandsFree)은 **확장한다(교체 아님)** — 기준은 IA.md·COMPONENTS.md. Loop 계열(섹션 C)은 범위 밖이다.

[작업]
1. Home: IA §2.1의 7섹션 **순서 고정** — HeroSection(풀블리드, scrim 그라데이션 예산 1/1, min-height clamp(560px,72vh,960px)), ProblemStrip("4 / 5" Kanit Bold), GateEntryCard(제출 → `/gate?terminal=&time=&date=`), LinesPreview+LineCard(hover 보더 primary + translateY(-2px), scale 금지), HowItWorks, PilotStrip, (Footer는 셸).
2. Gate: GateForm(쿼리 프리필) → `planGate` 결과 → RouteOptionCard 2~3개(총 소요·요금·환승·첫 탑승 편) → 선택 시 RouteStepList(leg별 사진 PLACEHOLDER + 방향 문장 + 소요, 수직 타임라인 primary). 결과 컨테이너 `aria-live="polite"`. 하단 HandsFreeCard 크로스셀.
3. HandsFree: 폼(Stepper 수하물, 터미널·날짜, 숙소 주소, 이메일) → 합계(개당 DRAFT 요금) → 확정 버튼에서 LoginGate → `createHandsFree` → 접수 코드 화면(Kanit Bold 6자).
4. 히어로 실사진이 아직 없으므로 `client/public/images/`에 단색 surface placeholder를 쓰되 `<img>` 구조와 alt는 실사진 기준으로 완성해 둔다(교체만 하면 되게).

[완료 조건 — 전부 직접 검증]
- Home 7섹션 순서, 히어로 320~3840 무결점(3840에서 풀블리드 + 타이포 104px 캡).
- 카드 리빌 패턴(PATTERNS §8) — Home 카드 그리드에만 적용, reduced-motion 즉시 표시.
- Gate: 도착 22:30 입력 시 +60분 버퍼가 첫 탑승 편에 반영되는지 케이스 확인.
- 전 라벨 사전 키(EN/KR 토글 시프트 0), 하드코딩 문자열 0.
- 폼 에러 인라인(PATTERNS §6), focus-visible 전 요소.

완료 후 PROGRESS.md 갱신, 커밋 제안([A2] feat: Gate·Home) 후 멈춰라. 다음 프롬프트를 스스로 이어서 실행하지 마라. 명세 밖 결정은 질문해라.
