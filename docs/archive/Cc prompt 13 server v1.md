너는 이 세션의 단독 실행자다(서브에이전트 금지 — 서버는 한 몸으로 짜야 한다). PHASE: 서버 연동 v1.

■ 시작 전 필수
이 순서로 읽어라: CLAUDE.md, IA.md(§9.6 데이터 모델·§10), ROUTES.md, COMPONENTS.md(섹션 D + v4 표), PATTERNS.md(§29·§33·§39), LEGAL_COPY.md, PROGRESS.md, AGENTS.md, 그리고 **docs/tago/ 안의 공공데이터포털 기술문서 전부**(열차정보·시외버스정보). server/.env 존재와 키 5종(DATABASE_URL, SESSION_SECRET, CLIENT_ORIGIN, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) + TAGO_SERVICE_KEY 를 확인해라. docs/tago/ 가 비어 있으면 멈추고 사용자에게 기술문서 배치를 요청해라.

■ 할루시네이션 방지 계약
1. **TAGO 오퍼레이션명·엔드포인트·파라미터명은 docs/tago/ 기술문서에 적힌 것만 사실이다.** 문서에 없는 이름을 쓰면 실패다. 구현마다 근거 문서·페이지를 주석으로 인용해라.
2. **역·터미널 ID를 코드에 지어 넣지 마라.** 문서에 명시된 ID 목록 조회 오퍼레이션을 서버 기동 시 1회 호출해 캐시(메모리+`server/cache/tago-ids.json`)하고, 조회 실패 시 해당 기능만 fallback으로 내려라. 우리가 필요한 매핑은 hubs.js의 허브 ↔ TAGO ID 뿐이다(용산·상봉·청량리·춘천역 / 동서울·춘천시외버스터미널 등) — 이름 매칭 결과를 로그로 출력해 사용자가 검증할 수 있게 해라.
3. **serviceKey 는 이미 URL 인코딩된 값이다. 재인코딩 금지** — URLSearchParams 에 넣지 말고 쿼리 문자열에 그대로 이어붙여라(이중 인코딩이 최다 실패 원인).
4. 시외버스 API는 **당일 배차만** 제공한다(문서 명시). 선택 날짜가 오늘이 아니면 API를 호출하지 말고 큐레이션 추정으로 응답해라.

■ 작업
1. **스키마 v4** — `server/db/schema.sql` + `seed.sql` + 멱등 `migrate.js`:
   users(id, google_sub unique nullable, email, name, avatar, created_at)
   gts_bookings(id, code char6 unique, user_id, party, luggage bool, vehicle_type, meal_plan, picks jsonb 순서보존, dropoff_text, pay_method, total, created_at)
   reviews(id, user_id nullable, author_label, country, course_label_key, rating 1~5, body, lang, mock bool, created_at)
   review_likes(review_id, session_key, created_at, unique(review_id, session_key))
   시드: data/reviews.js 의 12개를 mock=true 로 이관(문안 그대로).
2. **Auth**: Google OAuth code 플로우(/api/auth/google → 콜백 → users upsert → httpOnly 세션 쿠키, /api/me, /api/logout). 단 **DEMO_MODE=true(기본)** 이면 비로그인 쓰기 요청을 데모 유저로 귀속 허용 — 시연 기본값. 클라이언트 DEMO_AUTH 플래그는 건드리지 마라.
3. **API**: POST /api/gts/bookings(코드 6자 생성, 총액은 서버가 vehicles 규칙으로 재계산 — 클라 총액 신뢰 금지) / GET /api/gts/bookings/:code / GET /api/reviews(정렬 latest|likes) / POST /api/reviews / POST /api/reviews/:id/like(세션 키 기준 1회, 재요청 시 취소) / GET /api/health.
4. **교통 프록시**: GET /api/transit/train?date&from&to, GET /api/transit/bus?from&to — 내부에서 TAGO 호출(타임아웃 8s, 실패·키미활성 시 `{ source:'fallback' }` 응답). 응답은 클라가 쓰기 좋게 정규화: [{depTime, arrTime, trainType|grade, fare?}]. GET /api/geo/label?lat&lng 는 KAKAO_REST_KEY 있을 때만 활성.
5. **클라이언트 스왑(허용 파일 열거 — 이 외 수정 금지)**: ① src/data/gts/api.js 내부를 fetch(`${import.meta.env.VITE_API_BASE}`, credentials include)로 교체 — GTS 페이지 diff 0 ② reviews 데이터 접근 계층 동일 교체(좋아요·게시 서버 반영, 실패 시 기존 세션 메모리 폴백) ③ 플래너 결과 카드: /api/transit 응답이 live 면 실제 시각 리스트 표기, fallback 이면 기존 계산 추정 유지 + 문구 차이 없음(추정 라벨 유지) — 이 분기 파일 1곳 ④ About 의 WhatWeRun·CtaBand 링크를 /gate·/gts 정식 라우트로 교정(전 세션 미결 2건) ⑤ client/.env.example 에 VITE_API_BASE 추가.
6. CORS: CLIENT_ORIGIN + http://localhost:5173 만, credentials.

■ 완료 조건 (전부 직접 검증·증거 첨부)
- migrate 1회 멱등 / /api/health 200 / 데모 모드에서 예약 생성→코드로 조회→티켓 렌더 E2E / 리뷰 게시·좋아요 토글이 새로고침 후에도 생존(서버 저장 증명).
- TAGO: ID 매핑 로그 출력 + 열차 실호출 1건 성공 샘플(키 미활성이면 fallback 경로 검증으로 대체하고 보고에 명시) + 이중 인코딩 회귀 테스트(키에 % 포함 확인).
- GTS 페이지 diff 가 허용 목록 밖 0건임을 git diff 로 증명. OAuth 는 GOOGLE 키 존재 시 왕복 1회 검증, 부재 시 스킵 명시.

완료 후 PROGRESS.md 갱신, 커밋 [G1] feat: server v1 제안 후 멈춰라. 배포(Render push·Vercel env)는 사용자 절차다 — 보고 말미에 순서만 요약해라. 명세 밖 결정은 질문해라.