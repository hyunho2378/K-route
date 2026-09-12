# OPS.md — 운영/시연 런북

외부 업타임 핑으로 Render 서버의 콜드 슬립을 막고, 장애 시 확인 순서를 고정한다.
**비밀값(토큰·연결 문자열·알림 웹훅 등)은 이 문서에 적지 않는다.** UptimeRobot 설정과 시크릿은 외부 서비스에만 둔다.

## 헬스 엔드포인트

- **전체 URL:** `https://gts-server-pnzt.onrender.com/health`
  - 서버 origin은 배포 환경변수 `SERVER_ORIGIN` 기준. Render URL이 위와 다르면 실제 Render 도메인 뒤에 `/health`를 붙여 쓴다.
- **평시 응답(200):** `{"status":"ok","uptime":<초>,"ts":"<ISO8601>"}` — DB 무접촉.
- **심층 점검:** `GET /health?deep=1` → Neon `SELECT 1` 수행 후 `"db":"ok"|"fail"` 추가.
  - DB가 죽어도 **500이 아니라 200 + `"db":"fail"`** 로 응답한다(모니터 오탐 방지). 모니터는 평시 URL(`?deep=1` 없이)을 쓰므로 DB 장애가 업타임 다운으로 오인되지 않는다.
- **부작용 없음(설계):**
  - `Set-Cookie` 없음, 쿠키 미생성 (세션/쿠키 미들웨어보다 먼저 등록).
  - `journey_events`에 어떤 행도 남기지 않음 → 관리자 대시보드 참가자/완주율에 절대 포함 안 됨.
  - 응답 헤더에 `X-Robots-Tag: noindex` (검색 색인 제외).
  - 로그: 평시 무기록. `db:"fail"`(또는 5xx) 일 때만 1줄 경고.
  - 레이트리밋: IP당 **분당 20회** 상한(초과 시 429). 5분 간격 핑은 여기 한참 못 미친다.

## UptimeRobot 모니터 설정값

| 항목 | 값 |
|---|---|
| Monitor Type | **HTTP(s)** |
| URL | `https://gts-server-pnzt.onrender.com/health` (평시 URL — `?deep=1` 미사용) |
| Monitoring Interval | **5분** |
| 기대 상태코드 | **200** |
| Method | GET |
| 알림 연락처(Alert Contacts) | 담당자 이메일/휴대폰 등 — **UptimeRobot 대시보드에만 등록**(이 문서에 적지 않음) |

> 참고: 무료 플랜 최소 간격이 5분이다. 핑 주기(5분)는 레이트리밋(분당 20회)에 걸리지 않는다.

## 시연 당일 절차

1. **발표 30분 전**: 브라우저로 `https://gts-server-pnzt.onrender.com/health` 에 직접 1회 접속해 서버를 워밍(콜드 스타트 해소). `{"status":"ok",...}` 200 확인.
2. 이어서 `https://gts-server-pnzt.onrender.com/health?deep=1` 1회 접속해 `"db":"ok"` 확인(Neon 연결 예열).
3. UptimeRobot 대시보드에서 해당 모니터가 **Up(초록)** 인지 확인.
4. 클라이언트(프론트) 첫 페이지도 1회 열어 실제 API 왕복 1회를 예열.

## 장애 시 확인 순서

1. **Render 대시보드** — 서비스 상태(Live/Deploy 실패/슬립) 및 최근 로그 확인. 로그에 `/health` 핑은 남지 않으므로 실제 에러만 보인다.
2. **`GET /health?deep=1`** — 브라우저/`curl`로 호출.
   - `200 + "db":"ok"` → 서버·DB 정상. 문제는 클라이언트/CORS/특정 라우트 쪽.
   - `200 + "db":"fail"` → 서버는 살아있고 **Neon 연결/자격 문제**. 3번으로.
   - 응답 자체 없음/타임아웃 → 서버 다운 또는 콜드 스타트 중. 1번(Render)으로.
3. **Neon** — Neon 콘솔에서 DB Up 여부, 연결 한도, `DATABASE_URL`(sslmode 포함) 유효성 확인. 필요 시 Render 환경변수 재확인 후 재배포.

## 검증 근거(오염 차단)

- `journey_events` 기록은 `POST /api/track` 한 곳뿐이며 로그인 사용자 전용이다(`server/routes/track.js`). 전역 트래킹 미들웨어가 없어 `/health`는 이벤트를 남길 수 없다.
- 관리자 참가자/완주율(`server/routes/admin.js`)은 `journey_events JOIN users`를 실계정 필터로 집계한다. `/health`는 사용자도 이벤트도 만들지 않으므로 구조적으로 집계에 포함될 수 없다.
- 로컬 검증: 미로그인 `/health` 연속 호출 전후 `journey_events` 행 증가 = 0, 서버 로그에 `/health` 라인 0건, `Set-Cookie` 없음 확인 완료.

## [V24] 이미지 포맷

- venues·team·home 이미지는 webp로 넣는다. venues 파일명은 `{id}.webp`(slug=venue id)이며 `client/public/images/venues/{id}.webp`에 배치한다. 원본 jpg는 sharp quality 82로 일괄 변환(62.9MB→5.85MB, 약 91%↓). 되돌리려면 `venues.js`의 `VENUE_IMG_EXT`만 `jpg`로 바꾼다.
