# K-Route (케이로드)

춘천 지역특화 K-콘텐츠 여행 플래너. 취향 설문으로 갈 곳을 고르고, 지도로 동선을 잡고, 현위치에서 출발하고,
한국관광공사 공식 데이터로만 답하는 K-가이드 챗봇에게 물어본다.

- 2026 관광데이터 활용 공모전(웹·앱 구현 부문) 지정과제 3
- 화면: `/gts/quiz` → `/gts/build` → `/gts/route` → `/gts/go` · 챗봇은 build부터 우하단 FAB
- 문서: 기획 `IA.md`(§11) · 디자인 `DESIGN.md` · 공사 API 계약 `KTO_API.md` · 제출물 `docs/submission/`

## 실행

필요한 것: Node 20+ · Postgres(Neon) · 한국관광공사 OpenAPI 키. 챗봇 답변 생성만 Ollama(선택).

```bash
# 1) 서버
cd server
npm install
cp .env.example .env          # 값 채우기(아래 표)
node db/migrate.js            # 멱등 · 여러 번 돌려도 결과 동일
npm start                     # http://localhost:3001

# 2) 클라이언트
cd client
npm install
cp .env.example .env          # VITE_API_BASE
npm run dev                   # http://localhost:5173
```

### 챗봇 (선택)

키가 없어도 로컬 모델로 돈다. 없으면 검색된 공사 원문을 그대로 보여 주는 원문 모드로 내려간다.

```bash
ollama pull gemma4:e4b                      # server/.env 의 OLLAMA_MODEL 기본값
node server/scripts/build-knowledge.js      # 공사 응답 → spot_chunks(하루 한 번 이하 · 호출량 많음)
```

### 스크립트

| 명령 | 하는 일 |
|---|---|
| `node db/migrate.js` | 스키마 + 시드(멱등) |
| `node scripts/build-knowledge.js` | K-가이드 지식베이스 적재(공사 상세·연관·오디오가이드) |
| `node scripts/stamp-tags.js [오리진]` | NFC 스티커에 심을 스탬프 URL 출력 |
| `node scripts/probe-kto.js auth\|verify` | 공사 API 키·오퍼레이션 실호출 확인 |
| `node --test services/*.test.mjs` | RAG 검색·스트리밍 조립 테스트 |

## 환경변수 (이름만 · 값은 저장소에 두지 않는다)

`server/.env`

| 이름 | 용도 |
|---|---|
| `DATABASE_URL` `PGSSLMODE` | Neon Postgres |
| `SESSION_SECRET` | 로그인 쿠키 서명 · 스탬프 태그 토큰 파생 |
| `CLIENT_ORIGIN` `SERVER_ORIGIN` | CORS·OAuth 리다이렉트 |
| `GOOGLE_CLIENT_ID` `GOOGLE_CLIENT_SECRET` | 구글 로그인 |
| `KTO_SERVICE_KEY` | 한국관광공사 OpenAPI(비우면 `TAGO_SERVICE_KEY`) |
| `TAGO_SERVICE_KEY` | 국토교통부 TAGO(시외버스·철도) |
| `LLM_PROVIDER` `GEMINI_API_KEY` | `gemini` 로 두면 챗봇·추천 사유를 Gemini 로 |
| `OLLAMA_URL` `OLLAMA_MODEL` | 로컬 모델(기본 `http://localhost:11434` · `gemma4:e4b`) |
| `ADMIN_EMAILS` `ADMIN_USERNAMES` `ADMIN_2FA_PIN` | 관리자 대시보드 |
| `BLOB_READ_WRITE_TOKEN` | 프로필 사진(Vercel Blob) |

`client/.env` = `VITE_API_BASE` 하나.

## 배포

| 대상 | 위치 |
|---|---|
| 서버 | Render · `https://gts-server-pnzt.onrender.com` (헬스 `/health` · `?deep=1` 이면 DB까지) |
| 클라이언트 | Vercel · 프로젝트 URL은 배포 설정의 `CLIENT_ORIGIN` 값과 같다 |
| DB | Neon Postgres |

- 서버는 무료 플랜이라 콜드 스타트가 있다. 시연 30분 전 `/health` 를 한 번 열어 예열한다(`OPS.md`).
- 배포 서버에는 Ollama가 없다. 챗봇은 자동으로 원문 모드(검색된 공사 원문 표시)로 동작한다.

## 규율

TypeScript 금지(JSX만) · 브라우저 저장소 금지(인증은 httpOnly 쿠키) · 색·간격은 `client/src/tokens.js` 경유 ·
근거 없는 K-콘텐츠 성지 주장 금지(`SOURCE_SPOTS.md` 근거 강도 준수) · 공사 API 오퍼레이션은 `KTO_API.md` 확인분만.
