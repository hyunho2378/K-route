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

[세션 정체성] 너는 PHASE 1B — AGENT-3 (Loop) 다. 담당은 COMPONENTS.md 섹션 C 전부. AGENT-1 기반은 import만, 수정 금지. 페이지 스텁(Loop/LineDetail/Booking/Ticket/Pilot/NotFound)은 **확장한다(교체 아님)** — 기준은 IA.md·COMPONENTS.md. Gate·Home(섹션 B)은 범위 밖이다.

[작업]
1. LoopMap: PATTERNS §4 포팅 코드 그대로 — liberty 스타일, pitch 58/bearing -18, 3D extrusion(tokens.map.extrusion, 라벨 레이어 앞 삽입 + try/catch), 라인 3개(흰 케이싱 + lineColors, zoom 폭 보간), 정류장 커스텀 마커(**scale 금지 — 사이즈 스텝 22→28 + 펄스 링**, `--line-color` 인라인 변수), 셔틀 useShuttleSim(rAF 보간 ≈90초/루프, reduced-motion 정지). flyTo는 tokens.map 값만.
2. Loop 페이지: 풀블리드 맵(/loop Footer 숨김은 셸이 처리) + LinePanel(데스크탑 좌측 white 360px / 모바일 하단 리스트). 패널↔지도 양방향 선택, 비활성 라인 opacity 0.4. 패널은 키보드만으로 전 정류장 선택 가능해야 한다(지도 대체 경로).
3. LineDetail: IA §2.5의 5블록 **순서 고정** — LineHero(라인 컬러 면 + 캐릭터 이미지 콘텐츠), StopStrip(수직 노선도 + 선주문 문구), StoryClips(VideoPlayer, 영상 없으면 썸네일+요약 카드로 렌더), DepartureCalendar(PATTERNS §5 — 가격 인라인·StatusBadge·회차 Chip·잔여 좌석·roving tabindex), CTA → book.
4. Booking: 3스텝(출발 프리필 → PartyStep → SummaryStep) → 확정에서 LoginGate → `createBooking` → `/ticket/:id`. 성공 화면 SuccessStamp(PATTERNS §9, scale 화이트리스트 1/2).
5. Ticket: navy 티켓 카드(라인 컬러 스트라이프, 코드 6자 Kanit Bold, 미팅포인트, 인원, 호스트, 차내 클립 1개, "2 lines left" 문구) + 공유(PATTERNS §7 — canvas 직접 렌더 PNG + navigator.share + 다운로드 폴백).
6. Pilot: 영상(자막 상시) + 지표 3(Kanit Bold, PLACEHOLDER) + 갤러리. NotFound: EmptyState.

[완료 조건 — 전부 직접 검증]
- 맵: 라인 3색 렌더, 마커 active 펄스, 셔틀 이동, reduced-motion에서 전부 정지.
- 캘린더 status 규칙(booked≥6 confirmed / ≥3 likely / 만석 closed) 및 만석 Chip 비활성.
- 게스트로 3스텝 전부 진행 → 확정에서만 LoginGate 뜨는지.
- 티켓 공유: canShare 미지원 브라우저에서 PNG 다운로드 폴백.
- /loop 320~3840 무결점(3840에서 맵 풀블리드 + 패널 캡 유지).
- 전 라벨 사전 키, 하드코딩 0, grep scale 검사 — SuccessStamp·카드 리빌 외 0건.

완료 후 PROGRESS.md 갱신, 커밋 제안([A3] feat: Loop) 후 멈춰라. 다음 프롬프트를 스스로 이어서 실행하지 마라. 명세 밖 결정은 질문해라.
