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

[세션 정체성] 너는 PHASE 3 — AGENT-SERVER 다. 담당은 COMPONENTS.md 섹션 D 전부 + 클라이언트는 `src/data/api.js` 내부만. 그 외 클라이언트 파일 수정 금지 — **페이지 코드 diff 0이 완료 조건이다.**

[사전 확인] `.env`에 DATABASE_URL / GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / SESSION_SECRET / CLIENT_ORIGIN 이 있는지 먼저 확인해라. 없으면 멈추고 사용자에게 요청해라.

[작업]
1. `schema.sql` + `seed.sql`: IA §4 스키마. 시드는 client/src/data의 목데이터와 동일 값(라인 3, 정류장, 향후 14일 회차).
2. `db.js`: pg Pool(Neon TLS). 마이그레이션은 `node server/migrate.js`(schema→seed 순차 실행) 1개 스크립트로.
3. Auth: Google OAuth authorization-code 플로우. 콜백에서 id_token 검증 → users upsert → 세션 쿠키(httpOnly, Secure, SameSite=Lax, 서명은 SESSION_SECRET). `/api/me`, `/api/logout`. 토큰·비밀은 클라이언트로 절대 내리지 않는다.
4. API: lines / departures(날짜 필터, booked_count 집계 + status 계산) / bookings(POST 인증 필수 — **트랜잭션으로 잔여 좌석 검증, 초과 시 409**, 6자 코드 생성) / handsfree(POST 인증 필수).
5. 클라이언트 `api.js`: 목 구현을 fetch(`credentials:'include'`)로 교체. `AuthContext`의 login()은 `/api/auth/google`로 리다이렉트하는 기존 인터페이스 유지(Context 파일 수정이 필요하면 최소 diff로, 이유를 먼저 보고).
6. CORS: CLIENT_ORIGIN만 허용 + credentials.

[완료 조건 — 전부 직접 검증]
- migrate 1회 실행으로 스키마+시드 완료(멱등).
- OAuth 왕복: 로그인 → /api/me 200 → logout → 401.
- 게스트: lines/departures GET 전부 200, bookings POST 401.
- 좌석 12석 회차에 13석째 예약 → 409, 12석째 → 201.
- 프론트 전 플로우(예약→티켓)가 서버 데이터로 동작, 페이지 코드 diff 0.

완료 후 PROGRESS.md 갱신, 커밋 제안([AS] feat: 서버) 후 멈춰라. 다음 프롬프트를 스스로 이어서 실행하지 마라. 명세 밖 결정은 질문해라.
