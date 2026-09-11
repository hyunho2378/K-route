# PROGRESS.md — Bomnae Helper 진행 상태

> 갱신 규칙: 각 프롬프트 완료 시 + 컨텍스트 85% 도달 시. 재시작 세션은 이 파일을 먼저 읽는다.

## v5 K-Route (2026-09~) — 2026 관광데이터 활용 공모전 ②-2 지정과제 3

> 세션마다 완료·진행중·다음을 갱신.

서비스: 춘천 지역특화 K-콘텐츠 여행 플래너. 봄내헬퍼(솔버톤 GTS) 100% 재사용 + 확장.

### 확정 사실 (근거)
- 교통 API = TAGO 시외버스(SuburbsBusInfo) + 철도(TrainInfo, ITX·일반열차). 외부 API로 유지.
- 장소 = venues.js 52곳 하드코딩 존재 → 공사 TourAPI 하이브리드로 전환(적격 요건).
- K-콘텐츠 태깅 = SOURCE_SPOTS.md(사실검증 완료 · 무결성 대상). 앵커=K-푸드 중심.
- 팀 2명: 주현호(기획·디자인·프론트) / 송준하(백엔드·RAG·데이터). 공고 5명 이내 OK.
- LLM = Gemini 단일키 예정(임베딩+생성+번역). env 미설정 → 발급 필요.
- 공사 OpenAPI = 현재 0건 → api.visitkorea.or.kr 활용신청 필요(사용자 작업).

### 마일스톤
- [x] P0 SETUP: v5 scaffold(스텁·DB·env·문서) — 프롬프트 1 (2026-09-11 · 브랜치 v5-kroute · [V5-1] 커밋 대기)
- [ ] P1 데이터: 공사 TourAPI 연동 + SOURCE_SPOTS 태깅 + 하이브리드 풀 — 프롬프트 2
- [ ] P2 화면: quiz·추천·build개조·go — 프롬프트 3
- [ ] P3 RAG봇 + 다국어 + 기능설명서·시연 — 프롬프트 4

### 리스크
- 공사 키 승인 지연 → 스텁 폴백으로 화면 먼저, 키 오면 실데이터 스왑.
- Gemini 키 미발급 → 추천 사전문장 폴백·챗봇 비활성으로 데모 가능하게 방어.

### P0 SETUP 결과 (2026-09-11 · 브랜치 v5-kroute · [V5-1] 커밋 대기)

| 항목 | 결과 |
|---|---|
| 문서 | IA §11·ROUTES v5 = 끝에 append, PROGRESS v5 = 상단 삽입, append 3종·README_배치 삭제, 루트 6종(PITFALLS·MOTION·RESPONSIVE·SESSION_HEADER·SOURCE_SPOTS·KTO_API) 유지 |
| env | server/.env 키: DATABASE_URL · GOOGLE_CLIENT_ID · GOOGLE_CLIENT_SECRET · SESSION_SECRET · CLIENT_ORIGIN · TAGO_SERVICE_KEY · BLOB_READ_WRITE_TOKEN / 공사 키 없음 / LLM 키 없음 / client/.env 부재 → .env.example 복사 생성(사용자 결정) |
| DB | Neon SELECT 1 OK · vector 미설치(available 0.8.6) → CREATE EXTENSION 성공 · migrate 2회 exit 0·카운트 동일 · kto_spots / spot_chunks(embedding vector(768)) / quiz_sessions / chat_logs 존재 · journey_events.step + quiz·recommend·go·chat |
| docs/kto | 신규 생성 + README(KTO_API.md 배치 목록) · 활용가이드 문서 0건 |
| 서버 스텁 | lib/kto.js(asItems = tago.js 재사용) · services 6 · routes 4(index.js 기존 순서 뒤에 등록) · 7 엔드포인트 curl 전부 200 {source:'fallback'} |
| 클라 스텁 | pages GtsQuiz·GtsGo(Section id만) · components/{quiz,chat,go}/.gitkeep · data/gts/ktoApi.js(서버 스텁 1:1 7함수 fallback) · quizQuestions.js([]) · i18n quiz·chat·go ×3 빈 객체 + index 등록 · GtsContext 필드 3 · App 라우트 2(RequireAuth) |
| 검증 | client build 통과 · /api/health 200 · 스텁 진입 비로그인 = LoginGate / 로그인 = 렌더 · 회귀 E2E 홈 → /gate → /gts(setup) → build → route → checkout → 티켓(UZPUSQ) 통과·콘솔 에러 0 · grep(HEX·스토리지·TS·이모지·scale·B551011·줄표) 0건 · 3언어 1181키 동형 |

결정(사용자 확인 2026-09-11):
- /gts → /gts/quiz 리다이렉트는 **P2로 연기**(퀴즈 구현 전 진입점이 빈 스텁에 막히는 것 방지). 현재 /gts = GtsSetup 유지 · ROUTES v5 표는 목표 명세로 둠.
- 스텁은 title 없는 Section(quiz·go 네임스페이스 빈 객체 유지).
- 검증 계정 v5setup01@kroute.test 신규 · 예약 UZPUSQ·journey_events가 Neon에 남음.

명세 밖 결정(보고):
- journey_events 제약은 [V3] CHECK 목록을 직접 확장(별도 DROP+ADD 블록을 두면 [V3]의 좁은 목록 재ADD가 신규 step 행과 충돌해 2회차 migrate 실패).
- migrate.js 무수정: schema.sql 전체를 실행하는 구조라 v5 블록(IF NOT EXISTS)이 곧 멱등 블록. schema.sql에 CREATE EXTENSION IF NOT EXISTS vector 포함(신규 DB 재현성).
- 서버 라우트는 서비스 미연결 직접 fallback(연결은 P1~P3) · .env.example은 공사 키 변수 없이 주석 자리만(실제 이름 미확정) + LLM_PROVIDER= · EMBEDDING_PROVIDER= 빈값.

다음 세션 참고:
- /gts/quiz·/gts/go 문서 title·Dock 라벨이 "Not found"(PageLayout routeKeyFromPath 미등록 · /admin 선례와 동일) → P2에서 routeKey + meta.title 키 추가.
- server/routes/track.js STEPS 화이트리스트엔 quiz·recommend·go·chat 미추가(DB 제약만 확장) → 계측 붙일 때 추가.
- 사용자 준비물: 공사 키 발급 + docs/kto 활용가이드 배치, Gemini 키 발급(키 이름 확정 후 .env.example 반영).

## 상태

| PHASE | 담당 | 상태 | 커밋 |
|---|---|---|---|
| 0 SETUP | 단독 | ✅ 완료 (2026-07-20) | 미커밋 — git 저장소 미초기화 |
| 1A 기반 | AGENT-1 | ✅ 완료 (2026-07-20) | 미커밋 — git 저장소 미초기화 |
| 1B Gate·Home | AGENT-2 (서브에이전트) | ✅ 완료 (2026-07-21) | 01606a6 [A2] |
| 1B Loop | AGENT-3 (서브에이전트) | ✅ 완료 (2026-07-21) | 1463f05 [A3] |
| 2 검증·조립 | AGENT-REVIEW (오케스트레이터) | ✅ 완료 (2026-07-21) | [AR] 커밋 예정 |
| 3 서버 | AGENT-SERVER | ⬜ 대기 (.env 필요 — 이번 세션 제외) | |

## 진행 중 작업

- 없음

## v4 GTS 피벗 (2026-07-21)

| 커밋 | 내용 |
|---|---|
| [D1] | GTS 시드 데이터 격리 세션: `data/gts/` 3파일 — hubs(§29 허브 6·도착점 2·템플릿 7, durMin 11건 전부 PLACEHOLDER), vehicles(§9.3 결정론 매칭 + 요금 5건 전부 DRAFT), venues(카테고리당 12 = 실명 11 + Mockup 25, 3언어 동형·목업 coord null). 창작 실명 0, 시각표·편명 0 |
| [D2] | 존 A4 셸: /gts 4라우트 + /gts(=setup), 리다이렉트 5종(/loop*→/gts, /hands-free·/gate/hands-free→/gts/setup, /pilot→/about), GtsContext(§31 파생 vehicle·가드 캐스케이드 실검증), 내비 3항목(헤더·독·푸터 동일), i18n gts 뼈대(freq 3키)+nav/meta 키, 구 loop 15파일 DEPRECATED(삭제 0) |
| [D3] | 존 B4 PLANNER: 양방향 플래너(토글 시 DOM 불변 실측), hubs.js 조회 전용 결과(임의 HH:MM 0, 빈 조합 EmptyState 5종), RouteTimeline §28 세로(GateJourney·CSS 완전 삭제, grep 0), 현위치 §21 동형 모달, gate.planner 3언어 +25키 |
| [D4] | 존 C4 BUILDER: setup 매칭(4케이스 규칙 일치·CarFront/Bus 실존 확인), build 3스텝(VenueGrid §30 — 2/3/4열·로테이션 중 선택 보존·cap 초과 자동 해제 없음·순서 배지), route ItineraryMap §32(번호핀·draw-on·fitBounds·목업 coord null 시 리스트 폴백), checkout §33(1뷰·하차 필수·프로토타입 Dialog·LoginGate·스탬프), Ticket GTS 모드, data/gts/api.js 목 창구(api.js 원본 미수정), gts 3언어 74키 |
| [DR] | 검수: 임의 시각 정규식 신규 코드 0 / DEPRECATED 라이브 참조 0(주석·CSS 재사용 3건은 판정 무해) / 3언어 527키 동형 / HEX·localStorage·select·이모지·blur 신규·font-normal 전부 0 / 매트릭스 320·1280·3840 가로 스크롤 0·캡 1800·그리드 2→4열 / E2E: 게이트 양방향 + setup→build→route→checkout→ticket 전 구간 브라우저 통과 / gateRoutes.js 소비자 0 → DEPRECATED 주석 |

### 검증용 무마찰 결제 (2026-07-22 · 커밋 [V5] feat: frictionless checkout for validation 대기)

- 목적: 외국인 사용성 검증 완주율 저하 방지 — 하차 지점·결제 수단 두 필수값을 선택 없이 통과.
- [1] 하차 지점: 필수 제거(미입력 Pay 활성). 미입력 시 서버·트래킹에 빈문자 아닌 null 저장(schema dropoff_text NOT NULL 해제·멱등), 티켓 상세 "Not specified"(3언어). 입력 시 기존대로 원문. 체크아웃에 "선택 입력" 안내 캡션 추가.
- [2] 결제 수단: 미선택 Pay 활성. null 저장, 티켓 "Not selected"(3언어). 그리드는 선택 가능 유지(강제 없음), 카드 폼 빈 제출 유지.
- [3] Pay 게이팅 재점검: dropoff·pay_method·카드입력 어느 것도 Pay 미차단 — 로그인만 유지(RequireAuth 라우트 가드 + onPay LoginGate 폴백). dropoff 필수 사유 문구는 REQUIRE_DROPOFF 시에만 렌더(기본 미표시).
- [4] 트래킹 정합: complete payload에 dropoffProvided·payMethodProvided(bool) 기록. 관리자 Overview에 스탯 2개 추가(Dropoff skipped % / Payment skipped % · 완주자 중 flag 보유분의 false 비율 · grid 4→6장).
- [5] 회귀 방지: 서버 env REQUIRE_DROPOFF/REQUIRE_PAYMETHOD(기본 false) · 클라 GtsCheckout 모듈 상수(기본 false). true 시 필수 검증·비활성·사유 문구 복원.
- 검증(실측): 둘 다 미선택 → Pay 활성 → 예약 QC7XFB/2QXNTV 생성(dropoffText·payMethod 모두 null 저장·재조회 확인) → 티켓 "Not specified"/"Not selected" 스크린샷 → complete payload {dropoffProvided:false, payMethodProvided:false} DB 기록 → 관리자 6스탯(Dropoff/Payment skipped 100%) 렌더. 서버 REQUIRE_* true 재기동 → dropoff/payMethod 누락 각각 400·둘 다 있으면 201(재필수화 복원). 780키×3 동형·줄표 0. 빌드 통과.
- 로그인 게이팅: /gts/* 는 RequireAuth로 감싸져 비로그인은 체크아웃 도달 불가(LoginGate) — "로그인 없을 때만 Pay 막힘" 구조로 충족.
- 커밋 라벨 주의: 사용자가 지정한 [V5]는 직전 mockup 실좌표 작업(아래 섹션)에도 임시로 붙어 있었음(둘 다 미커밋). 커밋 분리 여부는 사용자 확인 필요.

### mockup1.md 실명·실좌표 venues.js 반영 (2026-07-22 · [V5] 커밋 대기)

- mockup1.md에 Restaurant 1~6 섹션 추가(맨 위 · 목업 순서 meal→food→activity) + 앱 반영: venues.js의 제네릭 목업 슬롯 20곳(meal 1~6·food 12~20·activity 21~25)을 사용자 제공 실명으로 교체(mock:false). meal 7~11만 제네릭 유지. 최종 카운트 meal 7실+5목 / food 12실 / activity 12실 · 중복 id 0 · 실명 전원 좌표 보유.
- 좌표는 지어내지 않고 실측: 네이버 링크는 place redirect의 lat/lng(9곳), 구글맵 링크·무링크 식당은 인앱 브라우저로 열어 URL !3d!4d(정확) 또는 og:image static map center(1곳=춘천백일칼국수, verify) 추출(11곳). 전 좌표 춘천 권역(lng 127.6~127.85 · lat 37.7~37.98) 범위 내 확인. 주석에 출처(네이버/구글맵) 표기.
- 검증: 빌더 식사 스텝에 실명 카드(Baekil Kalguksu·Hoeyeongru·Saemto·1.5 Dakgalbi·Todam…) 노출 · Hoeyeongru+Earth17+Makguksu 3픽 → /gts/route 지도가 실제 춘천 위치(시내·동면·율문리)에 핀·라인 렌더 스크린샷. 빌드 통과.
- 명세 밖 결정(보고): ①"전부 반영" = mockup1.md 20곳 전체로 해석(6 식당만 아님) ②회영루 원문 "gun"→"restaurant" 정정 ③th는 en 폴백(네이티브 검수 대기 · 파일 th-초안 정책) ④oneLine ko는 신규 번역 ⑤**activity 23 'Chuncheon Makguksu Museum'은 기존 실명 venue 'makguksu-museum'(막국수체험박물관)과 동일 장소 — 현재 둘 다 유지(코드 주석 [V5-주의] 플래그). 하나만 남기고 기존 좌표를 실측값으로 교체할지 사용자 확인 필요.** ⑥할루시네이션 방지 계약 헤더를 [V5] 예외(사용자 제공 실명+실측 좌표)로 갱신.
- 사용자 준비물: makguksu 중복 정리 결정, th 네이티브 표기, 신규 20곳 상세(VENUE_DETAILS) 미보유 → 돋보기 상세는 "Coming soon" 폴백(원하면 별도 이식), 춘천백일칼국수 좌표 현장 verify.

### ID/PIN 계정 · 관리자 확장 · 대시보드 정리 · 히어로 재구축 (2026-07-22 · [V4] 커밋 대기)

- [1] 계정 병행: users 확장(멱등 — username TEXT UNIQUE nullable, pin_hash TEXT, email NOT NULL 해제). POST /api/auth/register(username 영문 소문자+숫자 4자+·PIN 6자+·이름 선택 · bcrypt 해시 저장 · 중복 409 · 성공 즉시 세션) / POST /api/auth/login(bcrypt 비교 · 실패 존재 여부 비노출 단일 401). 로그인 모달 개편: 단일 글래스 Modal에 [Log In | Sign Up] 탭(대문자 소형 라벨·하단 인디케이터 슬라이드 §17 easeOut) · 두 탭 공통 Continue with Google → "or" → ID/PIN 폼 · 오류 3언어. returnTo는 구글과 동일(ID/PIN은 SPA navigate).
- [2] 관리자 시드: migrate 멱등 삽입 username "minwoo"/PIN "mardoto!02"(bcrypt)/name "Minwoo". 판별 확장 ADMIN_USERNAMES 폴백('minwoo') + isAdminUser(이메일 OR 유저네임 소문자 비교) — /api/me isAdmin·requireAdmin 두 경로 반영. 아바타 Dashboard 항목 동일(새 탭).
- [3] 대시보드 정리: Overview에서 Participants 테이블 뷰 제거(요약 스탯 4 + Live timeline만 · 사이드바 2항목 유지) · 서버 /api/admin/participants는 스탯 집계 재사용 위해 유지. ParticipantRow·ChevronDown 고아 제거.
- [4] 히어로 CTA 최종 재구축: 기존 래퍼·개별 클래스 전면 삭제 → Button 프리미티브 2개(primary/secondary)를 공통 flex 래퍼(gap-12·items-stretch) 하나로 · 개별 margin·width·height·transform·클래스 0. Button secondary 보더 = ring(box-shadow inset)로 교체(border-box라도 콘텐츠 폭 불식 · 치수 완전 동일) · whitespace-nowrap은 컴포넌트 base로 승격(개별 부여 아님).
- ID/PIN 유저 email null 대응: 헤더 아바타·타임라인은 @username 폴백(Header·AdminPage·admin.js events coalesce).
- 검증(실측): register 201·중복 409·형식 400 / login 200·오답401·부재401(동일 문구) / 모달 UI 가입(requestSubmit)→세션→닫힘 / ID/PIN E2E 여정 login→setup→meal_plan→picks→route_confirm→pay_method→complete 전부 DB 기록(user 41·예약 4GSAMK) / minwoo 로그인→isAdmin true→아바타 Dashboard(target=_blank rel=noopener)→/admin 렌더(스탯 4·Participants 테이블 부재) / 비관리자(tester01) /admin = 404 위장·Dashboard 항목 부재 / PIN 평문 0건(DB 13인 전원 bcrypt $2·로그 0). 3언어 777키 동형·줄표 0.
- 히어로 CTA 측정표(getBoundingClientRect · top·height):
  | 폭 | Plan my route (primary) | Build my day (secondary) | top 일치 | height 일치 |
  |---|---|---|---|---|
  | 1280 | top 452 · h 44 | top 452 · h 44 | ✅ 0 | ✅ 0 |
  | 768 | top 625.27 · h 48 | top 625.27 · h 48 | ✅ 0 | ✅ 0 |
  | 390 | top 435.68 · h 48 | top 495.68 · h 48 | 접힘(2행) | ✅ 0 |
  · 390에서는 두 버튼 내용 폭 합(≈391px)이 가용 폭(≈358px)을 초과해 flex-wrap으로 세로 접힘(§18 무가로스크롤 계약 — docScrollWidth=clientWidth 확인). 접혀도 left 동일(16)·height 동일. 한 행 유지가 필요하면 보고 요청.
- 명세 밖 결정(보고): ①bcrypt는 네이티브 컴파일 회피 위해 bcryptjs(순수 JS · 표준 $2 해시 호환) 채택 ②minwoo/시드 유저는 email null → 아바타·타임라인 @username 폴백 신설 ③히어로 secondary는 전역 규격대로 투명+ring(사진 위 가독은 구 white-pill 대비 낮음 — 지시의 무래퍼·색만차이 규격 우선) ④검증 과정에서 테스트 계정·예약이 dev DB에 누적(대시보드 스탯 반영 · 시연 전 정리 원하면 요청).

### Travel Log · 빌더 날짜 · 라인 상시 렌더 (2026-07-22 · [V3] 커밋 대기)

- [1] /travel-log 신설(내비 5항목: About | Trip Planner | Tour Builder | Travel Log | Reviews · 헤더+Dock): 구 Loop 풀블리드 셸 재활용 + TravelLogMap(구 §13 지도 코드 재활용·개명 — 칩·정류장·셔틀 제거·다중 발자취 전용). 라인별 tokens.logShades(primary 명도 차등 단색 6종 · 그라데이션 0) · 카드 hover/탭 = 해당 라인 강조·타 라인 40% 감쇠 실측. 좌 카드 스택(모바일 하단 가로 스냅): 이니셜+국가(없으면 Traveler)·플랜·픽 이름·날짜·인원. GET /api/travel-logs = 실 로그 익명화 집계(최근 6) + 목업 시드 6(mock true) · 클라 오프라인 폴백 미러. 카드 CTA → applyLogTemplate(플랜·픽·동선 프리필+routeVisited+log_template 계측) → setup(인원만) → 체크아웃 직행 실측 · 체크아웃 "수정하기" → build 프리필 왕복(플랜 활성·1/1·2/2 순서 배지 보존 실측). Footer 숨김 분기 재사용.
- [2] 셋업 여행 날짜: CalendarField(§19 재사용 · 오늘 기본·당일 허용·과거 비활성) → GtsContext.travelDate → gts_bookings.travel_date(멱등 ALTER · to_char 반환으로 TZ 시프트 방지) → 체크아웃 요약·티켓 상세/카드/PNG 관통 실측(생성·재조회 2026-07-25 왕복 정확).
- [3] 라인 상시 렌더 수술: §32 "목업 = 리스트 폴백" 폐지 → data/gts/mockCoords.js 결정적 배치표(춘천 시내 고정 그리드 16점 · venue id 해시+결정적 지터 · // DEMO 좌표 · mockNotice 고지 유지). ItineraryMap coord 전면 venueCoord 경유 · route 상시 렌더 + 체크아웃·티켓 미니맵 신설(Travel Log 직행 플로우의 동선 첫 시각 확인 지점). 매트릭스 실측: lunchDinner+실1·목3(4핀 라인) / lunch+실명(템플릿 경유 체크아웃) / none+목2(2핀 라인) / Travel Log 발자취 6+ 동시 / 티켓 4핀 — 전부 라인 렌더 스크린샷 확보.
- journey_events step 제약에 log_template 추가(DROP+ADD 멱등) · track.js·AdminPage 요약 동기 · DB 기록 2건 실측. 3언어 759키 동형 · 값 줄표 0.
- 명세 밖 결정(보고): ①목업 시드는 DB가 아닌 서버 상수(users에 국가 컬럼이 없어 DB 경유로는 카드 명세 충족 불가 — 실 로그 국가는 Traveler 폴백) ②체크아웃·티켓 미니맵 신설(증상 문구가 전제 · Travel Log 직행 시 필수) ③날짜 기본값 오늘 ④구 Loop 파일 자체는 보존(코드 재활용·개명은 TravelLogMap로).
- 환경 참고: 임베디드 프리뷰 rAF 서스펜션으로 MapLibre load가 안 와 검증 시 rAF 심 주입 — 실 브라우저 무관(기존 지도 전부 동일 조건).

### 장소 상세 확장 카드 (2026-07-22 · [V2] 커밋 대기)

- FLIP 이식(포트폴리오 검증 기법): 돋보기(primary 원형 36 · ZoomIn 실존 확인 · absolute라 카드 높이 136/172 불변) → 원본 카드 rect 측정 → fixed inset-0 오버레이(z-sheet · 스크림 0→1 520ms)에서 승격 카드가 transform(translate+scale)만으로 center(scale min(vw·0.62/w, vh·0.82/h) · 520ms cubic-bezier(0.16,1,0.3,1)) → 좌 도킹(min(vw·0.34/w, vh·0.8/h) · 560ms) 연속 재생. 실측: 도킹 scale 1.7067 = 수식값 정확, 트랜지션 속성 transform·opacity 뿐(grep 0건), 총 1080ms ≤ 1.1s.
- 우 패널(50% · rounded-l-xl · shadow.lg · scroll-quiet): ①장소명+heroFacts ②Brand story ③Guest reviews(별점+인용+메타 · "Sample reviews" 캡션 목업 명시) ④Store info(라벨 좌 2열) ⑤하단 CTA Select/Selected(해제 가능) — 블록 스태거 360ms·70ms 계단. 패널 선택↔그리드 동기(선택·해제 모두 닫힘 동기 실측), 정원 초과 거절 시 열림 유지+capFull 고지.
- 닫기 3경로(X·스크림·Escape) 역재생 실측 · 열림 중 Escape 인터럽트 = 현재값 역재생 무깨짐 · Escape는 window 캡처+stopPropagation로 StepStage '뒤로' 격리(스텝 2/3 유지 실측) · 카드 본체=선택만/돋보기=상세만(상호 오염 0 실측, 형제 버튼 구조라 중첩 button 0).
- 모바일 390: 중앙 확대(520)까지만 → 풀스크린 시트 크로스페이드(fixed inset-0 · 상단 40dvh surface 면+장소명 · 세로 스크롤 884px 실측 · 닫기 상단 우측 스크롤 중 고정·히트 가능 · CTA 풀폭 358 · safe-area). reduced-motion·키보드 개시(detail 0) = 전 트랜지션 none 즉시(동일 still 경로 실측).
- 콘텐츠: Venue details.md v5 → i18n venues 네임스페이스(EN 원문 · ko/th 번역 · 96키×3 동형, 전체 748×3 동형). [VERIFY]는 UI 미표기·venueDetails.js 주석 이관. 문서 id 매핑: gamja-batt→gamja-farm · mullegil→jungdo-mullegil. blur 신규 0(스크림+솔리드 패널).
- 명세 밖 결정(보고): 문서 미커버 실장소 5곳(soul-roastery·hwadong-2571·soyang-dam·soyang-maiden·art-circle)은 목업 공통 상세(Coming soon 한 벌) 재사용 — 창작 금지 계약상 유일한 무창작 폴백 · 선택 배지는 돋보기와 겹쳐 right-48로 이동.
- 사용자 준비물: [VERIFY] 항목 실측(요금·시간·주소 6곳 — venueDetails.js 주석 목록) 후 i18n 값 갱신, 장소 실사진 확보(현재 무이미지 분기: surface 면+장소명 타이포), 문서 미커버 실장소 5곳 상세 문안(Venue details.md 추가), th 네이티브 검수.

### 검증 스프린트 (2026-07-22 · [V1] 커밋 대기)

- 인증: DEMO_AUTH·DEMO_MODE 기본 false(플래그 보존·env 토글), 헤더 Sign in → 글래스 로그인 모달(구글 G SVG·No sign-up·연구 동의 3언어·소셜 1종), /gts/* = RequireAuth(비로그인 모달·닫으면 홈), 리뷰 작성 가드, returnTo = OAuth state HMAC(쿼리 비노출·내부 경로 검증), 아바타 팝 메뉴 → 로그아웃 확인 모달.
- 트래킹: journey_events(멱등 migrate) + GtsContext 계측(sessionId uuid·스텝 duration) + POST /api/track(로그인 필수 401) — setup/meal_plan/meals/picks/route_confirm/pay_method/complete + login(OAuth 복귀 마커). 비차단 검증: /api/track 전면 실패 상태에서 setup→build→meals 전진 실측.
- 관리자: ADMIN_EMAILS 3인 폴백(env 우선·소문자 비교 — 대문자 판별 통과 실측), requireAdmin(비로그인 401/비관리자 403 curl 증명), /admin = DAH RequireAdmin(비관리자·비로그인 404 위장 실측·헤더 링크 없음), civic useApi 폴링 15s + Refresh, Overview(스탯 4·행 확장 스텝 리스트)·Live timeline(신규 유입 1s 내 상단 삽입+플래시 1회 실측). 문자열 영어 하드카피(내부 도구 예외 주석).
- E2E(세션 쿠키 시뮬): 8스텝 여정 → participants 집계(complete·TEST01·67.3s·스텝별 payload/소요) 대시보드 렌더 확인. 실 구글 왕복은 OAuth 화면 진입(state 포함·returnTo 비노출)까지 자동 검증 — 실계정 로그인은 사용자 확인 필요(자격 증명 입력 불가).
- cross-origin 쿠키: sameSite none/secure(prod)·lax(로컬)·trust proxy 코드 증명. Privacy §2·§3 연구 기록 조항 3언어 + LEGAL_COPY.md. 3언어 652키 동형.
- 미결: /admin의 Dock 라벨이 "Not found"로 표기(routeKey 미등록 — 관리자 존재 위장에 부합해 의도 유지).
- 홈 히어로 CTA 페어 재구축: inline-grid auto-cols-fr(동일폭 강제·유령 정렬 사고) 폐지 → flex flex-wrap items-stretch gap-12(배치=래퍼, 크기=Button size=lg 동일, 폭=내용 기반, 높이=stretch 동일). Plan=primary→/gate, Build=secondary(흰 배경 pill·box-border 보더 안쪽)→/gts. LangSwap이 축소맞춤으로 EN 라벨을 CJK 폭으로 붕괴시켜 2줄 래핑되던 근인 = whitespace-nowrap로 수리. LangSwap 최장 언어(태국어) 고정폭 두 개가 390 한 줄 초과 → flex-wrap로 세로 접힘(가로 스크롤 0). 실측: 1280/768 한 줄·height diff 0·top diff 0·gap 12·좌측 정렬·1줄, 390 접힘(각 48·좌측 16·무래핑·무오버플로).
- 헤더 아바타 메뉴에 관리자 전용 Dashboard 항목: 서버 판정(/api/me isAdmin)만 신뢰, 비관리자·게스트는 DOM 미렌더(존재 비노출), Log out 바로 위, /admin 새 탭(target=_blank rel=noopener), 기존 팝 메뉴 문법 그대로. 실측: 관리자 쿠키 = 이메일→Dashboard→Sign out, 참가자 쿠키 = DOM 전체에 a[href="/admin"] 부재, /api/me isAdmin true/false 일치.
- 성공 리다이렉트 'ttps://…' 스킴 소실 수리: 코드 전수 점검 결과 서버에 앞 글자 자르는 지점 없음 — 원인 = Render CLIENT_ORIGIN env 값 자체 오염(붙여넣기 소실). 방어: clientOrigin 정규화(trim·끝 슬래시·스킴 불완전 시 https 재조립) + 기동 base 로그 + res.redirect 직전 최종 URL 1회 로그. 오염 입력 5종(ttps/tps/공백+슬래시/스킴 누락/localhost http) 실측 전부 정상.
- OAuth token_exchange 수리: redirect_uri 단일 고정 — SERVER_ORIGIN env(trim·끝 슬래시 제거) 우선, 미설정 시 로컬호스트 외 https 강제(프록시 뒤 http 조립 사고 방지 · 인가·교환 동일 함수). 기동 시 "OAuth redirect_uri = …" 1회 로그(콘솔 등록값 문자 대조용). CLIENT_SECRET trim(공백·줄바꿈 = invalid_client). trust proxy 확인. 실측: 미설정/설정(공백+슬래시 오염 입력) 양 모드 조립 정확.
- OAuth 콜백 duplicate key(users_email_key) 근본 수리: upsert를 이메일 기준(ON CONFLICT (email) · lower() 정규화)으로 교체 + 같은 sub가 다른 이메일 행에 잔류 시 선행 분리(행 보존·참조 유지). 콜백 catch는 reason 코드 로깅·응답({error:'oauth_failed', reason}) — 토큰·시크릿 비로깅. 실제 함수 호출 검증: 기존 행 갱신·연속 재로그인·신규 삽입(대문자→lower)·sub 이동 전부 통과, DB 중복·고아 행 없음 확인(병합 불필요).

### v4.4 수리 3건 + About 정밀 전사 (2026-07-22 · [I1])

- 수리: ① /gts/build lg 1280×800 3스텝 내부 스크롤 0(패딩 32·카드 lg 136·gap 12 — 스크롤 대신 크기 축소, over 0 실측) ② 헤더 시각 간격 포렌식 — LangSwap 겹침 유령 폭(0~44px)이 원인, 내비 단일 언어 렌더로 [60,76,49]→[32,32,32] 오차 0(언어 전환 시 내비 폭 변동 트레이드오프 보고) ③ 데모 도착 8초.
- About 15섹션 전사(레퍼런스 구도·지시 카피): Hero 55:45+폰 SVG draw-on / 문제 3카드 / WHAT WE RUN 수평 플로우 / 하루 타임라인 5 / #proof 카운트업 3·14·5 / 실사 풀블리드+글래스 카드 / 스토리 2 / 순환 궤도 SVG / Do the math 3열(GTS 승격) / 후기 시드 3건 인용 / FAQ 상시 노출 / 리워드 4카드(MOST POPULAR 링·리본) / 자금 도넛+진행바(campaign.js 단일 출처) / 로드맵 4노드 / 팀·약속+CTA 밴드. StickyBackBar(§35 · 히어로 후 등장·CTA 도달 시 소멸) 실측 3상태 통과.
- 3언어 646키 동형 · 이모지 0 · 사전 줄표 0 · 320 가로 스크롤 0.
- DEMO 초안(지시 13~15 카피 부재 — 레퍼런스 가독 대형 텍스트+campaign 연출값 기반, 교정 대상): funds h2·범례 4종/퍼센트(40/25/20/15), roadmap 연도(2026/2027/2027/2028), team body. 사진 3종(/images/about/) 부재 시 surface 폴백.
- Kanit 800 미로드 → 700 대체(로드 스택 400~700).

### v4.3 폴리시 + About 크라우드펀딩 (2026-07-22 · [H2] 커밋 — 사용자 "6번째 세팅" 포함)

- 19항목 전부 수리·브라우저 검증: CTA 페어 동일 폭(grid 1fr)·gap12 / 내비 gap 32 균일(개별 마진 0) / ScrollToTop 해시 예외 / main 100dvh(짧은 페이지 푸터 폴드 밖 — fixed 헤더라 -헤더높이 빼면 안 되는 함정 수리) / 시간 필드 = FieldSelect 닫힘(KST 현재)+TimeWheel 팝(TimeField 신설·KoreaClock 렌더 제거·DEPRECATED) / 폼 컴팩트(compact 트리거 h-48·lg 4필드 한 행) / 두 섹션 첫 화면 동시 인지 / 데모 10초 / 현위치 스텁 검증(동의 모달→값 교체→용산 최근접+varies, 라벨 "Current location" 상태형 통일) / setup 단일 카드 좌 Your ride·우 입력·CTA 우하(1차 order 배치 버그 재수리) / 숫자 원형 페이지네이션(Pagination 신설 · IA §10.4 페어 대체 · ←→ 키보드) / 벤처 카드 172px 고정+line-clamp+Chip 바닥(TriText clampClass — 겹침 렌더라 언어 불변 자동) / StepStage 1120·§35 화이트 글래스·Back white 채움 48 / 결제 sticky top-24 / 로고 svg→png→텍스트 3단 폴백 / 월렛 시뮬 문구 3언어 삭제 / 정렬 라벨 600 / 리뷰 메타 고정 슬롯(mt-auto).
- About 크라우드펀딩: 어바웃.md 전문 이식(brand.crowd 3언어 · 이모지 0 · 줄표 값 0 · "Mobile App"→"Web platform" 교정 · Travel→Tourism 브랜드 통일 보고) — 섹션 8종 md 순서, #proof 블록 보존 삽입, FAQ 4항목 전부 펼침, 구 섹션 6종 렌더 제거(파일·키 보존). 3언어 601키 동형.
- 미결: th 신규 카피(crowd·TimeField 라벨) 네이티브 검수 대상 추가.

### 반응형 패스 v1 (2026-07-21 · [H1] 커밋 완료)

- DESIGN §18 신설(내비 단일 규칙 <1024/≥1024 · 그리드 2/3/4 · 터치 44 · safe-area · dvh · 동일 DOM).
- 크롬: 모바일 헤더 56(lg 80), StepStage 88dvh/84dvh+safe-area, BottomSheet 90dvh+내부 스크롤+그랩바 44px 히트, TimeWheel 항목 44px(§18.3이 §38 40px에 우선), Dialog·BottomSheet body 스크롤 락(useBodyScrollLock 훅), **오버레이 3종(StepStage·BottomSheet·Dialog) body 포털** — main z-content 스태킹에 갇혀 Dock pill이 오버레이 위에 그려지고 탭을 가로채던 실버그 수리.
- 수리(전→후): 홈 320 가로 스크롤 1065px(ReviewsStrip truncate×grid min-width:auto → min-w-0) / /reviews 333px(ReviewCard 별점·날짜 행 오버플로 → flex-wrap+p-16 md:p-24, GlassDock 접힘 intrinsic 폭 → maxWidth 캡) / 결제 그리드 md 3열 / 리뷰 그리드 2/3/4 / 티켓 lg 미만 하단 고정 CTA 바(bottom-80 · LineDetail 선례)+pb-128.
- 매트릭스: 12뷰포트(320~3840) × 9라우트 + StepStage 3스텝·route·checkout·티켓 — 가로 스크롤 0·내비 모드 정확(1023 모바일/1024 데스크탑 경계 스크린샷)·잘림 0. 스크린샷: 768 모바일 모드, 1024 데스크탑 모드, 320 스텝1·2, 768 스텝2, 320 티켓 CTA 바.
- reduced-motion: 전역 룰(0.01ms)·크로스페이드 분기 전부 opacity/transform 한정 — 레이아웃 속성 무변경(코드 판정 · 임베디드 브라우저는 미디어 강제 불가).
- 미해결 잔존: 없음(전 항목 통과). vh 잔존 4건은 전부 DEPRECATED 파일(라이브 0).

### 서버 v1 (2026-07-21 · [G1] 커밋 완료)

- 스키마 v4: users·gts_bookings·reviews(+title·seed_likes 최소 추가)·review_likes, migrate 2회 멱등 실증(Neon · reviews 12 유지), seed.sql은 클라 시드 문안 그대로 생성.
- Auth: Google OAuth code 플로우(/api/auth/google 302 확인·tokeninfo 검증·users upsert·HMAC 서명 httpOnly 쿠키) + DEMO_MODE 기본(비로그인 쓰기 → demo@gts.ac.kr 귀속). 실OAuth 왕복은 사용자 수동 확인 항목(구글 콘솔 redirect_uri 등록 필요).
- API: 예약 생성(총액 서버 재계산 — 조작값 99 → 85,000 실증)·코드 조회·리뷰 목록/게시/좋아요 토글(세션 키 unique·재요청 취소)·health.
- TAGO: 시외버스 = 문서(docs/tago/...시외버스정보v1.1.docx) 근거 4오퍼레이션, 동서울(NAI0511601)·춘천(NAI2443501) 기동 시 이름 매칭·캐시(tago-ids.json)·당일 외 fallback. 열차 = probe-train.js 실호출 검증으로 1613000/TrainInfo + GetCtyCodeList/GetCtyAcctoTrainSttnList/GetStrtpntAlocFndTrainInfo 채택(청량리→남춘천 18건 샘플). serviceKey 재인코딩 금지(tago.js 원문 이어붙이기 · URLSearchParams 0건).
- 클라 스왑: gts/api.js·reviews 접근 계층(+Reviews.jsx 배선부 — 사용자 승인·UI diff 0 증명)·RouteOptionCard LIVE 분기(용산→춘천 실배차 3편 브라우저 실증)·WhatWeRun 정식 라우트·.env.example(VITE_API_BASE). GTS 4페이지·Ticket·컨텍스트 diff 0 git 증명.
- 브라우저 실증: 리뷰 13건 로드·좋아요·새로고침 생존 / 티켓 FZRQDV DB 복원(Van·Visa·85,000·하차 원문) / 플래너 LIVE+Est. 공존.

### v4.2 (2026-07-21 · [F1]~[FR])

| 커밋 | 내용 |
|---|---|
| [F1] | 존 A5 셸: 내비 4항목(About/Trip Planner/Tour Builder/Reviews)·/reviews 라우트·데모 로그인(DEMO_AUTH 플래그·게이트 통과 실증)·DRAFT 고지 전수 삭제(키 6종 동형 제거)·푸터 모토(BRAND §13)·GtsContext /gts 이탈 전체 리셋(실증) |
| [F2] | 존 B5: 홈 재건(§10.2 — 스탯·라인·미니폼 삭제, 히어로 카피, CTA 페어 동일 44px 나란히, 진입 카드 2, HIW 재작성, 리뷰 스트립), 수직 2섹션 플래너, TimeWheel(§38 KST 디폴트·라이브 시계·키보드 즉시), computeLegTimes(§39 환승 10분 PLACEHOLDER·예상 라벨·자정 넘김), 데모 도착 시퀀스(§40 3초·To 전용·ARRIVAL_MODE 플래그 보존), gate 사전 -59/+20 |
| [F3] | 존 C5: StepStage(§41 — 진행 바 폐지·scrim 0.7·글래스 1040/84vh·단일 선택 자동 전진·±24px 280ms easeInOut·Escape 뒤로), 스텝2 반반 분할, 페이지네이션 페어 전 그리드, 방문순서 세로 타임라인(§10.5), 결제 8종 그리드+카드 폼 빈 제출+월렛 2종 생략+onError 폴백(§42), 티켓 2컬럼·primary 단색 무보더·sticky 320·즉시 다운로드(§43), 리뷰 12시드(6언어·mock·실명 허용목록만)+정렬+좋아요+즉시 게시(§10.8), reviews 네임스페이스 3언어 |
| [FR] | 검수: E2E 전 구간(홈→빌더→결제→티켓→리뷰) 브라우저 통과, grep(DRAFT UI 0·새로고침 라벨 0·share 0·이모지 0·스토리지 0·리뷰 실명 허용목록 내), 매트릭스 320/1280/3840(캡 1800·StepStage 1040 중앙·sticky 320·hScroll 0), About CtaBand /loop→/gts 수리 |

- 미결(후속 세션): About WhatWeRun 3필러의 /loop·/hands-free 링크(리다이렉트 생존 — §14 About 반영 세션에서 재편 권장), Ticket 구 라인 분기 내 /loop 링크(보존 계약), BRAND §14 About 카피 반영 미실행(v4.2 실행 절차 밖).

### v4.1 크래프트 패스 (2026-07-21 · [E1] 커밋 완료)

- tokens.motion v4.1 동기화(easeOut/easeInOut/easeDrawer/spring + 120/180/160/280/360ms), tailwind 이징·지속 토큰 재편(ease-in 유틸리티 미생성), 구 320ms·ease-spring 전수 재매핑(시트→drawer/sheet, Dock 모핑·스탬프만 spring 존속).
- §34: .pressable(Button·IconButton·Chip·캘린더 셀·LineCard·VenueGrid 카드) 120ms/0.97 + 팝 5면(FieldSelect·LangMenu·CalendarField·StopPopup·Dialog) origin-aware 0.97→1 진입·@starting-style·usePopExit 퇴장 역재생.
- §17.1: 키보드 개시 팝(ArrowDown/Enter/Escape/detail 0 클릭)은 pop-instant 무애니메이션 — 브라우저 검증(키보드 즉시 1/Escape 즉시 unmount/마우스 진입·역재생).
- §35: Header·GlassDock .chrome(0.72+blur20 saturate180+빛 맺힘), 헤더 스크롤 엣지 페이드(마스크 점진 블러·스크롤 0 비표시), 접근성 3신호(motion/transparency/contrast) 분기.
- §36: BottomSheet 드래그 물리(motion 1개 의존 신규) — 1:1·오프셋 존중·러버밴드·모멘텀 투영·속도 인계 스프링·재터치 인터럽트·reduced 크로스페이드. 판정 산식 node 4케이스 검증.
- §17.5: 크기별 트래킹(-0.02/-0.01/0/+0.01)·행간(1.1/1.5) base 기본값, 전역 단일 letter-spacing 없음 확인.
- 검수 도구 발견 사항: Tailwind @layer 내 @starting-style 내부 규칙 복제 버그(레이어 밖 배치로 수리), 임베디드 프리뷰의 rAF·scroll 이벤트 미발화는 환경 아티팩트로 판정(실기기 무관).
- 미결: LinePreviewOverlay(DEPRECATED·미라우트)에는 §36 물리 미적용 — 재활성 시 BottomSheet 물리 재사용 전제. GTS 티켓 PNG 공유와 동일하게 재활성 세션 몫.

### v4 검수 판정·미결 기록
- StopPopup 2줄 조건화(존 C4 보고): onViewLine 부재 시 버튼 비렌더 — Loop 호출부 영향 0 판정, 수용.
- ArrivalCard가 From Chuncheon 탭에서도 렌더(구조 동형 우선, 존 B4 결정) — 의미상 To 전용이 맞는지 사용자 판단 대기.
- 결제 완료 후 GtsContext reset 미호출(Booking 선례 동일) — 재조립 UX 확정 필요.
- Ticket GTS 모드 PNG 공유 미구현(§7은 라인 티켓 명세 — GTS 공유는 후속 결정).
- 서버 gts_bookings 확장은 다음 서버 세션 몫(§9.6.4 스키마 메모만 존재).

## 다음 작업

- CC_PROMPT_5_AGENT_SERVER 실행 (전제: .env — Google OAuth ID/Secret + Neon DATABASE_URL)
- 사용자 결정 대기 항목: PROGRESS "오케스트레이션 결정 사항" 참조

## v3.1 리디자인 (2026-07-21 · 오케스트레이터 + 존 B/C 서브에이전트)

| 커밋 | 내용 |
|---|---|
| db9ac4f [B1] | 파운데이션: i18n 3언어(en/ko/th) 네임스페이스 분할(365키 동형), Header(메뉴4·액티브 primary·상시 불투명)·LangMenu·FieldSelect·Footer(primary 4컬럼·법적 새 탭)·GlassDock 개정, 무보더 스윕(§16 4패턴 0), 줄표 스윕(주석·사전 전부, api/data는 주석만 — 승인 조건), 법적 페이지 2종, radius/shadow/blur v3.1 토큰 |
| 806a331 [B2] | 존 B: HeroCarousel(3장 크로스페이드·도트)·GateJourney·FieldSelect 3종(시간 24h 사전 라벨)·HandsFree 2컬럼+FAQ |
| 404acba [B3] | 존 C: 3레이어 라인+draw-on·셔틀 lerp 스무딩·StopPopup·글래스 라인 카드(마진 안)·LinePreviewOverlay·StickyBookPanel·Booking 단일 확인 페이지·About 11섹션(BRAND_COPY 이식)·Pilot 삭제 + 라우트 v3.1(/hands-free·/about·리다이렉트 2) |
| [BR] | 검수: 터미널 라벨 3언어 겹침(트리거 시프트 0), 구 hero.jpg 고아 제거, 매트릭스 10뷰포트×10라우트 100/100 |

### v3.1 검수 판정 기록
- EN↔KO 시프트: 홈·게이트·핸즈프리 0 / About는 가로 0·본문 높이 캐스케이드만(PATTERNS §1 장문 허용 영역).
- EN↔TH: :lang(th) Kanit 스택(§18 명세)이 전체 서체 메트릭을 바꿔 폭 변동 발생 — 명세 간 상충의 구조적 결과로 허용 판정.
- max-w 잔존 4건은 전부 카드·일러스트 폭(텍스트 측정폭 아님): Ticket 카드 2, Booking 성공 래퍼 1, EmptyState 일러스트 1.
- 데이터 문자열 줄표 9건 잔존(gateRoutes 4·stops 5) — 사용자 조건(문자열 불변) 준수, 실촬영·확정 카피 교체 시 정리 대상.
- FieldSelect primary는 문자열 기본 + 겹침 렌더 노드 허용(날짜·터미널) — 계약 문서화 예외.
- StickyBookPanel sticky top은 §15의 top-24를 픽셀 스케일 환산(top-96 = 헤더 72+24)으로 적용.

## v3.2 리디자인 (2026-07-21 2차 크리틱 · 오케스트레이터 + 존 B2/C2 서브에이전트)

| 커밋 | 내용 |
|---|---|
| 8f471fd [C1] | 파운데이션: primary #0073EC·니어블랙 3단·SUIT Variable(Pretendard 폐지)·컨테이너 확폭(1320/1560/1800·마진 16/24/40)·헤더 80/64·17px 600·About 최좌측·모바일 상단 헤더 신설·모바일 독 깨짐 수리·푸터 2단 202px·표시명 교체(§16.7)·Button secondary·CalendarGrid·scroll-quiet·법적 위치 조항 3언어 |
| fade3ca [C2] | Getting Here: 현위치 옵션+최근접 공항 매칭+무음 폴백·CalendarField(§19)·크로스셀 삭제·Optional 배지·ArrivalWatcher 상태기 7종(§21 · 사전 설명 모달 선행, 2연속 판정, 좌표 비노출)·ArrivalProvider 전역 배선 |
| 5ab8d3f [C3] | City Lines: 초기 라인 0+칩 3(§24)·§23 지도 수술 6항목(줌 20회 무아티팩트)·hover 즉시 팝업(200ms 유지)·POI 앵커 3·scroll-quiet·모바일 카드 ≤132px·2개월 캘린더+원색 도트 범례+회차 전부 펼침(§20)·GateToLinesTransition(§22 · Escape 스킵) |
| [CR] | 검수: navy 잔재 3건 수리(Button hover·PilotStrip 면)·StoryClips 구 마진 4px 오버플로 수리·매트릭스 100/100·3언어 구조 동형 확인 |

### v3.2 검수 판정 기록
- 3언어 레이아웃 동형(§16.6): 4개 라우트에서 요소 수·태그 시퀀스 3언어 완전 동일, EN↔KO 좌표 0(About는 장문 세로 캐스케이드만·가로 0), TH x변동은 §18 Kanit 스택 메트릭 파생으로 허용(요소 재배치·조건부 노출 없음).
- 확정 판정: §20 gap-12 채택 / C2 패널 브래킷 2곳(산식 조합) / 전환 라벨 850ms 연출+1.5s 비차단 잔존 / 도착 모달은 Modal 래퍼(모바일 대응·COMPONENTS A4 정합) / denied "설정 다시 보기"=사전 설명 모달 재노출 / LineDetail 날짜 기본값 오늘.
- 도착 모달 본문 2문장은 IA 미지정으로 최소 창작(확정 카피 교체 대상), 크로스셀 키 3언어 제거.

## 사용자 준비물 (v3.1 추가)

- [ ] 히어로 실사진 3장 교체 (`client/public/images/hero-1..3.jpg` — 현재 무료 스톡)
- [ ] About Proof 지표 3종 실측값 (`[PLACEHOLDER]`)
- [ ] 태국어(th) 사전 전체 네이티브 검수 (기계 번역 초안 상태)
- [ ] 법적 문안 전문가 검토 (LEGAL_COPY 학생 초안 고지)

## 오케스트레이션 결정 사항 (PHASE 1B·2에서 확정 — 이견 시 되돌릴 것)

- i18n 사전은 공유 파일이라 서브에이전트가 fragment(소유 구역 내 임시 파일)로 납품 → 오케스트레이터가 병합 후 삭제. 최종 162키 en/ko 동형.
- 데이터 유래 텍스트(라인·정류장·미팅포인트명, 언어별 포맷 문자열)의 fit-content 렌더가 EN↔KR 시프트를 만들던 지점 12곳을 PATTERNS §1 겹침 마크업으로 수리(전 화면 시프트 0 달성). 신규 공용 컴포넌트는 만들지 않음(사용자 규칙).
- stories/pilot 데이터는 api.js에 접근자가 없어 페이지가 직접 import(사용자 "api.js 수정 금지" 규칙 우선; PHASE 3 API 목록에 stories/pilot 없음 — 정적 데이터 유지라 이관 영향 없음).
- 미팅포인트는 춘천역(첫 항목) 고정, 주말 가산은 성인·아동 좌석당 동일 적용(전부 DRAFT).
- 문서화된 명세값 예외 3곳: VideoPlayer text-[17px](DESIGN §12), Loop 패널 lg:w-[360px](IA §2.4), HeroSection min-height 인라인(DESIGN §5). LoopMap.css의 #fff 1곳은 PATTERNS §4 기준 구현.

## AGENT-1 인수인계 노트 (AGENT-2/3 필독)

- api.js는 전부 async — 페이지에서 항상 await로 호출할 것(PHASE 3 fetch 교체 대비).
- api.js에 `getMeetingPoints()` 추가됨(티켓 미팅포인트 접근용 — 계약 외 추가라 사용자 확인 대기).
- Chip에 `disabled` prop 있음(PATTERNS §5 만석 회차 근거). IconButton에는 disabled 없음 — Stepper는 클램프로 처리.
- StatusBadge: WCAG AA 때문에 green/yellow 배경 + ink 텍스트, closed는 surface+inkMeta로 구현.
- 명세 고정 치수(44/56/72px, dialog 560px, 컨테이너 캡)는 전부 tailwind.config.js에서 클래스로 제공
  (h-44/h-56/h-72, max-w-lg=1200/max-w-2xl=1400/max-w-3xl=1560/max-w-dialog=560, h-px=1px).
  컴포넌트 파일에 px 직입력 금지 유지. 예외 1곳: VideoPlayer 자막 text-[17px](DESIGN §12 명세값, PATTERNS §10 기준 구현).
- gateRoutes terminal 키: 't1'|'t2'|'gmp' — GateForm select value 동일하게 맞출 것.

## 사용자 준비물 (블로커 — 코드 진행과 무관하게 병행)

- [ ] 봄내크루 원본 에셋 (배경 제거본) → `client/public/images/crew/`
- [ ] Google OAuth 클라이언트 ID/Secret (PHASE 3 전까지)
- [ ] Neon DATABASE_URL (PHASE 3 전까지)
- [ ] 히어로 실사진 — 텍스트 없는 실사 (3~4일차 촬영)
- [ ] 사장님 스토리 클립 (3~4일차 촬영)
- [ ] 파일럿 운행 촬영 — 차내 클립 시청 장면 / 도착 즉시 감자빵 (3~4일차)
- [ ] 정류장 GPS 실좌표 수집 (3~4일차 현장에서 핀 찍기 → stops.js 교체)
- [ ] 라인 가격·회차 확정 (5일차 BM 검토)
- [ ] 서비스명 영문 표기 최종 확정 (Bomnae Helper 유지 여부)
- [ ] unDraw 일러스트 3종(login/404/빈결과) primary 단색 재컬러 SVG → `client/public/images/illustrations/` (현재 img 경로만 참조 중)
- [ ] og-image.png (1200x630) 제작·배치 (`client/public/og-image.png` — index.html og:image가 이미 참조 중), 배치 후 카카오 캐시 초기화 도구로 갱신
- [ ] apple-touch-icon.png (180x180, 흰 배경 위 logo.svg 중앙 배치) 제작·배치 후 index.html 주석 해제
- [ ] GTS 허브 소요시간(durMin 11건)·배차 실측 검증 (`data/gts/hubs.js` — 전건 PLACEHOLDER)
- [ ] GTS 요금표 확정 (`data/gts/vehicles.js` — base/perPerson/luggageFee 5건 전부 DRAFT)
- [ ] GTS 실명 로컬 브랜드 추가 확보 — 목업 25슬롯(meal 11·foodspace 9·activity 5) 교체 + 실명 11곳 좌표 현장 검증 (`data/gts/venues.js`)
- [ ] 결제 로고 8종 배치 — `client/public/pay/{applepay,alipay,visa,mastercard,paypal,amex,jcb,unionpay}.svg` 고정 파일명(§42 — 현재 onError 텍스트 폴백으로 동작)
- [ ] 리뷰 실데이터 승격 — `data/reviews.js` mock 12건 → 서버 reviews·review_likes 테이블(§10.8 백엔드 체크리스트)
- [ ] 카카오 REST 키(선택) — 현위치 주소명 라벨용 서버 프록시 `/api/geo/label` 구현 완료(§39 — 키 없으면 fallback 응답·클라 "현재 위치" 고정 라벨 유지)
- [ ] Google OAuth 실왕복 1회 수동 확인 — 구글 콘솔에 redirect_uri(`{SERVER_ORIGIN}/api/auth/google/callback`) 등록 후 /api/auth/google 진입(서버 302·콜백·쿠키는 구현 완료)
- [ ] 열차정보 공식 활용가이드 PDF 확보 시 docs/tago/ 배치 — 현재 probe 실호출 검증 기반(문서 근거로 승격)

## 사고 이력 / 교훈

- (이전 창 계승) CC 프롬프트 전체를 한 번에 붙이면 에이전트가 범위를 섞는다 — 반드시 한 프롬프트씩.
- (이전 창 계승) 세션 정체성(어느 AGENT인지) 프롬프트에 명시.
- (이전 창 계승) 스텁은 "확장(교체 아님), 기준은 명세 문서" 단서 필수.
- (v3) 구 sloverthon 마커의 scale hover는 화이트리스트 위반 — 사이즈 스텝+펄스 링으로 대체함 (PATTERNS §4).
- (PHASE 0) @vitejs/plugin-react@6은 vite@8 요구 → vite@^5 + plugin-react@^4로 고정함.
- (PHASE 0) express는 무버전 스펙이라 5.x가 설치됨 — PHASE 3 라우트 작성 시 Express 5 문법 기준(와일드카드 라우트 등 4와 다름).
- (PHASE 0) tailwind colors를 tokens로 전면 교체하면서 white/transparent 2값만 명세 근거(DESIGN §6·§7·§8, PATTERNS §10)로 추가함.
- (1A) 임베디드 브라우저 페인은 ① 프로그래매틱/키보드 스크롤이 scroll 이벤트를 발화하지 않고 ② 격리 월드 dispatch가 페이지 리스너에 닿지 않으며 ③ 비활성 시 rAF가 실행되지 않는다 — 스크롤/rAF 계열 검증은 페이지 월드 script 주입 + rAF 심으로 수행할 것. 코드 자체는 PATTERNS §2 rAF 스로틀 유지(실브라우저 표준 동작).
- (1A) departures 시드는 3~12 범위로 고정해 명세 미정의 구간(booked<3)을 만들지 않음. 폴백은 likely.
