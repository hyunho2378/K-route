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
- [x] P1 데이터: 공사 TourAPI 연동 + SOURCE_SPOTS 태깅 + 하이브리드 풀 — 프롬프트 2 (2026-09-11 · 공사 실데이터 적재 완료 · [V5-2b] = 1823dc1 · V5-2 폴백 작업 포함)
- [x] P2 화면: quiz·추천·build개조·go — 프롬프트 3 (2026-09-12 · [V5-3] = b74803a)
- [x] P3-A 정합성 수정: odii 정확매칭 · ktoText · 큐 X 포커스 (2026-09-12 · [V5-4] = 7a508ae)
- [x] P3-C K-가이드 RAG(공사 데이터) + NFC 스탬프 + 제출팩 (2026-09-12 · [V5-6] 커밋 대기)
- [x] P4 게이미피케이션 이식: K-콘텐츠 노선 체계 · 스탯 게이지 · 라인 판독 · 노선 여권 · 스탬프 단일화 · 오염 정리 (2026-09-13 · [V5-9] bd82615~44e3d73)
- [x] P5 축제 API 연결: searchFestival2 실사용(법정동 필터 · 기간 한정 배지 · 라인 매핑) (2026-09-13 · [V5-10])
- [x] P6 문제 지표 수치 통일: 감사 후 검증 확정 수치만 Home 근거 스트립으로 노출(출처 병기) (2026-09-13 · [V5-11])
- [x] P7 게스트 공개 진입: 케이로드 전 구간을 로그인 없이 체험 가능하게(심사 대응) (2026-09-13 · [V5-12])
- [x] P8 추천 카드 실데이터·라인 색: 실분류 칩(categoryCode2) · place별 한 줄 · 앵커 거리 페널티 면제 · 카드 면 복구 (2026-09-13 · [V5-13])
- [x] P9 홈 정체성 K-Route 재작성 + /gts 인트로(노선도 2층 구조) + 직접 URL 조용한 튕김 제거 (2026-09-13 · [V5-15])
- [x] P10 지도 2층 구조(1층 도시 전체 노선 + 2층 내 노선) · 경로선 구간별 라인 색 · route 혼잡도 잔재 제거 (2026-09-13 · [V5-16])
- [x] P11 관광사진 갤러리(detailImage2 활성화) + 드라마·애니 콘텐츠 재확인 + 축제 배지 원인 규명 (2026-09-13 · [V5-17])

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

### P1 데이터 결과 (2026-09-11 · 브랜치 v5-kroute · [V5-1] = e5e1fed · [V5-2] 커밋 대기)

| 항목 | 결과 |
|---|---|
| 공사 키·문서 | 공사 전용 키·docs/kto 활용가이드 없음 → data.go.kr 계정 공통키(TAGO 키 값)로 probe(사용자 결정) · 6개 서비스 경로 존재, 전부 resultCode 30 미등록 = **활용신청 대기** · KorService1·EngService1 폐기(12) · 근거 = KTO_API.md probe 기록 |
| 호출 코어 | lib/kto.js = tago.js 계약 재사용(tagoGet에 key 인자 추가 · 기존 호출부 무변경) · KTO_SERVICE_KEY 우선, 없으면 TAGO_SERVICE_KEY |
| 공사 서비스 4종 | ktoSpot·Related·Congestion·Audio = 승인 대기 신호(KTO_PENDING) → 라우트 200 fallback(reason) · 집중률 3구간 band()는 PLACEHOLDER 경계 |
| SOURCE 태깅 | server/data/ksource.js = SOURCE_SPOTS.md 런타임 파싱(사본 없음) · 표 24행·배지 14 · 3건 문자대조 OK(셀프체크 + API 출력 둘 다) · 원문 무변경 |
| 하이브리드 풀 | services/spotPool.js · 공사 1차(현재 0) + venues 51(client venues.js 직접 import) · 배지 규칙 위반 0 · 약함·근거없음 배지 0 |
| 추천 | recommendService.js(결정론 · 셀프체크) + POST /api/quiz/recommend · LLM off / on(키 없음) 순위 동일·reasonKey 폴백 · quiz_sessions 저장 · 로그인 시 journey_events 'recommend' · 잘못된 answers 400 |
| 클라 | ktoApi.js 실호출(getSpots·getSpotDetail·getRelated·getCongestion·recommend · 실패 시 fallback) · GtsContext.runRecommend · i18n quiz.reason 5키 ×3 |
| 검증 | migrate 2회 멱등 · build 통과 · 3언어 1186키 동형 · grep 0(B551011은 probe 스크립트만) · transit bus/train live 유지 · 회귀 E2E 티켓 5MWDEP 통과 |

결정(사용자 확인 2026-09-11): TAGO 키로 probe · [V5-1] 선커밋 · 서버가 client venues.js 직접 import · 추천 가중표 초안 채택(q2 성향·q3 동행 = category·kType 파생).

명세 밖 결정(보고):
- venues 실제 51곳(SOURCE_SPOTS 문구는 52) · id 51/51 일치.
- SOURCE evidence "상동"은 원문 유지 · §6 표(비고 열)는 note 필드로.
- 추천 출력 수 = q4 반나절 8 / 하루 12 · 응답 reason(문자열|null) + reasonKey 병행.
- LLM 키 이름 GEMINI_API_KEY · 모델 gemini-2.5-flash(키 발급 후 실호출 확인 필요).
- 설문 답 허용값 = recommendService.ANSWERS(q1 kfood·kdrama·kanime·kpop·undecided / q2 photo·localfood·nature·cafe / q3 solo·friends·family / q4 half·day / q5 transit·taxi) → P2 quizQuestions.js가 이 값을 쓴다.

다음 세션 참고:
- coord:null(DEMO) 장소는 거리 조건(연계·시내 밖 -2)에서 빠져 대중교통 선택 시 상대적으로 유리(tongnamujip은 PLACEHOLDER 좌표라 -2). 실좌표 확보 시 해소.
- 사용자 준비물: data.go.kr 같은 계정으로 공사 6개 서비스 활용신청 → `node server/scripts/probe-kto.js auth` 재실행 → 오퍼레이션 확인 후 서비스 구현(P1 잔여) · Gemini 키(GEMINI_API_KEY + LLM_PROVIDER=gemini) · quiz.reason th 네이티브 검수.

### P1b 공사 실데이터 결과 (2026-09-11 · [V5-2b] 커밋 대기 · V5-2 폴백 작업 포함 · 미커밋)

| 항목 | 결과 |
|---|---|
| probe | auth: 6개 서비스 전부 HTTP 200(403·30 해소) · 정상 코드 = '0000' · verify: 채택 체인 전 단계 0000(KTO_API.md 표) |
| 계약 | tago.js 판정 확장('0000' + 최상위 오류 envelope · TAGO 동작 불변) · lib/kto.js = tagoGet 재사용 + 실호출 1줄 로그 |
| 코드 매칭 | areaCode2 강원 32·춘천 13(ko·en) · ldongCode2 51·110 → signguCd 51110 · server/cache/kto-ids.json(하드코딩 0) |
| 적재 | kto_spots ko 167 · en 17(원문 raw.list · 상세는 요청 시 common·intro·images) · 기동 시 + TTL 24h |
| 풀 | 206 = 공사 162(ko 151 · 영문명 5 · en 전용 11 · venue 합류 7) + venue 44 · 배지 14 · 규칙 위반 0 · 집중률 붙은 항목 34 |
| 사용처 4곳 | 목록 /kto/spots 200 live · 상세 /kto/spots/2605236 200(ko·en 원문) · 연관 /kto/related/2605236 200(baseYm 202608 · 50건) · 집중률 /kto/congestion/2605236 200(오늘 35.29 보통 · 가장 한가한 날 09-22 26.45) |
| 추천 | kfood 질의 공사 1/8(원조숯불닭불고기집 ← wonjo-charcoal-dak 배지 승계) · 자연·가족 질의 공사 11/12 |
| odii | getAudioGuide 실호출(강촌레일파크 이야기 1 · audioUrl 있음) · 라우트 없음(P3 RAG 소비) |
| 검증 | migrate 2회 멱등 · build · 3언어 1186키 · grep 0 · transit live 유지 · 회귀 E2E 티켓 3A9P3J 통과 |

명세 밖 결정(보고):
- ko 목록이 풀의 기준 · en은 제목 끝 괄호의 한글 원명이 ko 제목과 같을 때만 영문명으로 연결(EngService2 contentid가 달라 조인 불가) · 불일치 en은 별도 항목.
- 풀 제외 = 숙박(B02)·추천코스(C01) · 카페/전통찻집(A05020900) = foodspace · 공사 스팟 성향 = A01 자연 → nature, A02 인문 → photo.
- venue와 같은 곳(이름 일치 또는 포함 + 300m)이면 공사 항목 하나로 합치고 venue SOURCE 태그 승계(venueId 표기).
- 집중률 3구간 경계 = 춘천 1800행 분포 3분위(32.15 / 61.16) · IA "추천 시간대"는 API가 일 단위라 30일 중 가장 한가한 날로 대체.
- 연관관광지 baseYm = KST 전월부터 최대 6개월 자동 탐색 · 이미지 http → https 치환은 응답에서만(원문 보존).

다음 세션 참고:
- 합류 7곳은 풀 id가 공사 contentid(venueId로 venues 연결) · P2 build·route가 kind·venueId·coord를 처리해야 함.
- 연관관광지를 recommend 연계(+2) 판정에 쓰는 건 후속(기준 관광지 29곳 이름과 앵커 매칭 설계 필요).
- th 이름은 en 제목 폴백(LLM 번역은 P3) · 트래픽: 목록·집중률 하루 1회, 상세·연관은 항목별 24h 캐시.

### P2 화면 결과 (2026-09-11~12 · 브랜치 v5-kroute · [V5-2b] = 1823dc1 · [V5-3] = b74803a)

| 항목 | 결과 |
|---|---|
| 구조 | 단독(공용 계약 확정·검증) → 병렬 3(A quiz · B build · C go · 파일 소유 계약) → 단독(통합·검증) |
| 공용 | data/gts/spots.js(id 이원화 kind 'kto'·'venue' · 이미지 후보 · 공사 원문 텍스트화) · GtsContext(setQuizAnswer·submitQuiz·selectSpot·setGoOrigin · cap·course · 가드 quiz→build→route→go · v4 식사 액션 제거) · i18n quiz·go·gts.spot/detail/guide(3언어 1319키 동형) · KBadge·CongestionChip·GuideFab · StepStage(nextLabel·exitKey·세로 중앙·겹친 모달 Escape 수정) · /gts → /gts/quiz |
| 서버 | recommend K-푸드 보정(kfood·강함 앵커 +2 · 거리 페널티 면제 · 48조합 강함 앵커 최소 8/8 · 보정 전 photo·solo 1/8, cafe·solo·taxi 0/8) · 추천 응답 = 풀 항목 전체 · 풀: 합류 7곳 venue 한 줄·webp·좌표·영문명 보강 + congestionBand + 10분 메모 · 상세 odii(이름 일치 장소만) · GET /api/go(직선거리 도보·택시 예상 · 좌표 없음 no-coord) · track quiz·go · db pool 'error' 리스너 |
| quiz | StepStage 6스텝 · q1 복수('아직 안 정함' 배타) · 탭 120ms 자동 전진 · 결과 = q2 여행 타입 4종 + SuccessStamp 1회 + "See N places"(정원 안내) |
| build | 단일 풀 = 추천 · 정원 q4(3/4) · 카드 = 공사 대표이미지 → 합류 webp → 텍스트 + K배지 + 사유 1줄 + 집중률 Chip · 상세 = detailCommon·Intro 원문 + odii · 리뷰 제거 |
| route | 타임라인 K배지·집중률 · CTA 3종(첫 장소로 출발 · 다시 고르기 · 차량으로 이동 텍스트링크) · FAB 자리(비활성) |
| go | §21 동의 → 현재 위치(거부 시 춘천역) · FieldSelect 도착 · 도보·택시 예상 레그 · 지도(출발 링 핀 · 거리 비례 draw-on) · 집중률 카드(3xl 이상 우측) · 다음 장소 |
| 검증 | E2E 비로그인 게이트 → 홈 → /gate → /gts → quiz → build 3픽 → route → go(위치 허용) → 다음 장소 → 차량 → setup → checkout → 티켓 M47ENR(공사 id 포함 3곳 해석) · 콘솔 에러 0 · 폭 320/768/1440/2560/3840(go 1920 추가) 가로 스크롤 0 · ko·th 0 · 대비 전 조합 4.5:1 이상 · grep 금지 항목 0(58파일) · build 통과 · 셀프체크(recommend·spots) PASS |

명세 밖 결정(보고):
- K-푸드 보정은 점수 가산(+2) · 다른 앵커는 성향 일치 시 여전히 상위(kfood+kanime/photo/family에서 애니메이션박물관 2위).
- /api/go: TAGO 시외버스·열차는 터미널·역 간 구간이라 시내 이동에 적용 불가 → fallback(직선거리 × 1.3 · 도보 4km/h · 택시 30km/h PLACEHOLDER) · UI는 '예상' 표시.
- odii는 테마 이름이 장소 이름과 일치할 때만(좌표 근접 판정은 통나무집 → 막국수박물관, 원조숯불닭 → 춘천낭만시장처럼 다른 장소 해설을 붙여 폐기).
- 합류 항목 영문명: 공사 영문 대응 항목이 없으면 venues.js 영문·태국어 이름.
- K배지·집중률 Chip = 흰 pill + ink 라벨 + 원색 도트 · spice 텍스트(글래스 위 2.2:1 · 흰 면 3.4:1)는 AA 미달이라 StepStage 사유·정원 안내를 ink로.
- 여행 타입명 Frame Hunter / Local Taster / Lakeside Walker / Cafe Hopper(KR 프레임 헌터·로컬 테이스터·호숫가 산책러·카페 호퍼).
- setup CTA는 route 경유·Travel Log 템플릿이면 "Continue to checkout"(gts.setup.ctaCheckout 신규).
- 티켓: 공사 id가 섞인 예약은 풀 조회 후 일정 표시(부분 목록·순번 튐 방지).
- server/db/pool.js 'error' 리스너 추가(Neon 유휴 연결 종료로 동시 검증 중 API 서버 exit 1 재현).

다음 세션 참고:
- 내비 표시명 "Tour Builder" → IA §11.2 "K-Route"(케이로드) 교체 미실시.
- 춘천 시내 교통 provider(ODsay 등) 연결 시 /api/go legs[] 채우기(클라는 이미 legs 유무 분기 자리).
- Neon 연결 끊김으로 /api/me 등 간헐 실패(재요청 시 회복) · pool idleTimeoutMillis 등 운영 설정 검토.
- th 번역(quiz·go·detail) 네이티브 검수 · Travel Log는 공사 id 코스를 표시하지 않음(venues id만 해석 · 기존 규칙).
- setup StepIndicator(v4 4단계 문구)는 v5 흐름과 순서가 맞지 않음 · LLM 키 없어 추천 사유 LLM 경로(spot.reason) 미검증.

### P3-A 정합성 수정 (2026-09-12 · 단독 · [V5-3] = b74803a · [V5-4] 커밋 대기)

| 항목 | 결과 |
|---|---|
| odii | 좌표 근접(themeLocationBasedList 반경 최근접) + 이름 포함 판정 폐지 → themeSearchList(장소명) + 이름 완전일치(전체 또는 끝 괄호 별칭 제외 · 공백·기호 무시) + 테마 addr1 같은 시도 · 테마 응답에 contentid 필드 없음(실응답 확인) · 상세 패널 테마명 병기 제거(없으면 블록 비렌더) |
| odii 감사 | 풀 206 × ko·en 이름 완전일치 테마 10건 전부 같은 장소(강촌레일파크 ko·en · 물레길 · 소양강댐 · 춘천 명동 닭갈비 골목 · 삼악산 호수케이블카 · Chuncheon Makguksu Museum · 김유정문학촌 · 애니메이션박물관 ko·en) · 원조숯불닭불고기집·통나무집 닭갈비 0건 |
| ktoText | `<br>` + 원문 줄바꿈 1개 처리는 이미 적용(P2) · VenueDetail val(겹줄 합치기) 제거(캐시 상세 20건 intro 빈 줄 0 · \r 0 = 중복) · overview 빈 줄 4건은 원문 문단 구분(`<br /><br />` 1 · 원문 \n\n 3)이라 유지 |
| 배지 truncate | KBadge·CongestionChip max-w-full + LangSwap min-w-0 grid-cols-1 [&>span]:truncate 는 P2 적용분 · 320 th·en·ko K배지 8 · 집중률 Chip 6 카드 밖 0 · th 1건 말줄임 동작 · 가로 스크롤 0 |
| 죽은 코드 | togglePick·toggleMeal·setMealPlan·mealCap 참조 0(P2에서 제거 · 주석 1줄만) · mealPlan·meals 상태는 Travel Log 템플릿·예약 API 계약이라 유지 |
| 큐 X 포커스 | 큐 X(키보드 Enter) → 그리드로 돌아온 그 카드(data-spot)로 포커스 · 다른 페이지면 그 페이지로 넘긴 뒤 · 2회 PASS |
| 검증 | build 통과 · 회귀 E2E 티켓 EDXT8A 통과(콘솔 에러 0) · 3언어 1319키 동형 · 변경 파일 grep 금지 항목 0(줄표는 기존 12건 · 추가 0) |

명세 밖 결정(보고):
- 완전일치 = 이름 전체 또는 끝 괄호 별칭을 뗀 이름(공사 ko 제목 "강촌레일파크(김유정레일바이크)" · 테마 "강촌레일파크"). 공백·기호 무시.
- 타 지역 동명 차단 = 테마 addr1이 같은 시도(ktoSpotService REGION 검색어 export). addr1이 시도까지만 와서 시군구 대조는 불가.

다음 세션 참고:
- 2026-09-12 01시대 감사 스크립트(병렬 4)가 Odii 초당 한도·일일 한도(LIMITED_NUMBER_OF_SERVICE_REQUESTS_*)를 소진 → 그날 상세 odii는 전부 null(폴백 동작). 강촌레일파크 UI 오디오 표기는 한도 초기화 후 재확인.
- odii는 상세 열 때마다 1~2회 호출(캐시 없음 · P2와 동일) · 시연 전 호출량 주의.

### P3-B 리듬 코스 동선 설계 (2026-09-12 · [V5-4] = 7a508ae · [V5-5] 커밋 대기)

| 항목 | 결과 |
|---|---|
| 동선 엔진 | server/services/routePlanner.js(결정론 · 셀프체크) · 좌표 있는 스팟 전 순열(≤6!) 완전탐색 · 비용 = 이동 + 대기 + 막차 이후 페널티 − 연관 인접 가산 · 좌표 없는 스팟은 거리 계산 제외 후 뒤로 |
| 묶기(연관) | 공사 TarRlteTarService1 · 두 스팟이 서로의 연관 목록에 있으면 인접 가산 · 연관 데이터는 같은 시도 안에서만 연결(실측: 춘천 기준 1412행 100% 강원) |
| 혼잡(날짜) | 집중률 API가 일 단위 30일 예측뿐(시간대 값 없음 · 필드 baseYmd·tAtsNm·cnctrRate) → 사용자 결정대로 "날짜 회피": 코스 합이 가장 낮은 날 추천 + 선택일 혼잡 수 비교 · 춘천 집중률 60곳 중 풀 매칭 35곳 |
| 실현(배차·막차) | TAGO 시내버스 4개 서비스가 우리 키로 403 미등록(scripts/probe-citybus.js 기록) → ASSUME 상수(외곽 배차 60~180분 중간값의 절반 대기 · 막차 17:30 · 표정속도 20km/h · 외곽 = 중심 5km 밖)로 판정 · 응답 assumed:true · 화면 고지 |
| API | POST /api/route/plan(ids·date·startTime → order·stops·legs·metrics) · GET /api/route/spread/:id(내륙 확산) · 실패는 200 fallback |
| 남이섬 | searchKeyword2로 목록 보강(구 areaCode·cat1 공란이라 areaBasedList2 누락) · ko 128019 · en 264244 · 풀 204곳 · SOURCE_SPOTS §2에 contentid 키 행 추가(kdrama·중간·"겨울연가 배경") → K-Drama 배지 + q1 K-드라마 앵커 |
| 확산 | 남이섬 직접 연관은 춘천 0건(기준 데이터가 가평/경기) → 좌표상 가장 가까운 춘천 기준 관광지(연관 목록 보유 39곳)를 경유(viaNearby) · 실측: 강촌유원지 기준 → 공지천·김유정문학촌·엘리시안 강촌·물레길·소양강처녀상·통나무집 닭갈비 |
| 화면 | GtsRoute 순서 근거 카드(연관 쌍·이동대기 절감·막차·혼잡 날짜) + 타임라인 구간 표기(이동·대기·막차 이후) · 지도 라인 = 설계 순서 · GtsBuild 확산 섹션(기준지·근거 문구) · VisitTimeline 순서 변경 FLIP(transform만) |
| 샘플 3코스 | A 남이섬·김유정문학촌·소양강스카이워크 = 순서 유지 · 연관 1쌍 · 이동대기 220분(절감 20) · 막차 OK · 혼잡 3곳 → 09.16 0곳 / B 원조숯불닭·국립춘천박물관·구봉산 = 27분(절감 4) · 혼잡 2곳 → 10.02 0곳 / C 강촌레일파크·막국수체험박물관·의암호스카이워크 = 재정렬(막국수 ↔ 의암호) · 188분(절감 17) |

명세 밖 결정(보고):
- 대기 절감만으로는 지표가 0이 되기 쉬워(외곽 구간이 섞이면 순열마다 대기가 같다) 화면 지표는 이동+대기 절감(timeSavedMin)으로 표기하고 waitSavedMin은 응답에만 남겼다.
- 좌표가 없는 스팟이 낀 구간은 이동·대기·막차를 전부 계산하지 않는다(unknown) — 거리 없는 구간에 가정값을 붙이지 않기 위해.
- 확산 기준지는 "연관 목록을 가진 기준 관광지"(areaBasedList1 tAtsNm 39곳)만 후보 · 남이섬 최근접 7곳은 전부 기준지가 아니라 5.9km의 엘리시안 강촌부터 후보가 된다.

다음 세션 참고:
- TAGO 시내버스 활용신청(버스노선·정류소·도착·위치) 승인되면 `node server/scripts/probe-citybus.js`로 오퍼레이션 채택 후 routePlanner ASSUME 블록을 live 조회로 교체(첫차·막차·배차는 노선정보 getRouteInfoIem 계열 후보).
- 집중률·연관은 이름 문자열 매칭이라 표기가 다르면(강촌레일파크 ↔ 강촌레일바이크(경강역)) 연결되지 않는다 · 코드 기반 매칭은 후속.
- 이 세션과 같은 시각에 다른 세션이 [V5-6](RAG 챗·스탬프)를 같은 레포에서 작업했다 · COMPONENTS.md·IA.md·PROGRESS.md·GtsBuild.jsx·i18n 등이 그쪽 스테이징과 겹친다.

### P3-C K-가이드 RAG · NFC 스탬프 · 제출팩 (2026-09-12 · 단독 · [V5-6] 커밋 대기)

| 항목 | 결과 |
|---|---|
| 이식 | 동해사이 검증 챗봇 rag.mjs·byteFallback.mjs → server/services/ · byteFallback 원본과 **바이트 동일**(테스트 6/6) · rag 테스트 8/8 · 폴더·용어에 소버린 서사 0건 |
| 지식베이스 | spot_chunks 346행 · 지식 항목 189개(장소×언어) · ko overview 151·intro 122·related 17·source 24 / en overview 16·intro 16 · 공사 호출 607회 · odii는 그날 일일 한도 초과(HTTP 429)로 건너뜀 |
| 검색 | 키워드 + 춘천 동의어(임베딩 0) · 순위는 전 언어 공통으로 매기고 장소별로 질문 언어 자료 우선, 없으면 한국어(모델이 옮긴다) |
| 생성 | 기본 로컬 Ollama gemma4:e4b(API 비용 0) · LLM_PROVIDER=gemini + 키면 Gemini · 둘 다 없으면 원문 모드(생성 0) |
| 챗 실측(ko) | 닭갈비·막국수체험·공지천 3질문 모두 근거 기반 + 출처 칩 일치(1.5 닭갈비 본점·우미 닭갈비·통나무집 닭갈비 / 춘천막국수체험박물관 / 공지천) · 첫 토큰 0.5~3.2s |
| 오답 방어 | "공지천이 겨울연가 촬영지야?" → 촬영 근거가 없다고 답함(SOURCE 근거없음 반영) |
| 다국어 | en 질문 → 영어 답 · th 질문 → 태국어 답(UI도 태국어) · 공사에 태국어가 없어 ko·en 자료를 모델이 옮긴다 |
| 정보 없음 | 인용 chunk도 대화 이력도 없으면 모델 호출 0 + 고정 문구(chat.noInfo) · 이력이 있으면 모델이 "다른 지역 정보는 없다"로 거절 |
| 원문 모드 | OLLAMA_URL을 죽은 포트로 두고 기동 → `mode: extractive` + 공사 원문 그대로(생성 문장 0) |
| 스탬프 | API 8케이스 통과(201·201·201 / 재요청 200 added false / 잘못된 토큰 403 / 대상 아님 404 / 비로그인 401 / 요약 complete) · UI 3태그 → 배지 2종 → Tour complete + 인증서 버튼 |
| 회귀 | 퀴즈 → build(카드 8) → route(방문 순서 1·2·3) → go(도착 + 공사 집중률 "지금 가면 보통" · 가장 한가한 날) 통과 · 콘솔 오류 0 |
| 정적 | client build 통과 · 3언어 1342키 동형(chat 10 · gts.stamp 13) · 가로 스크롤 0(320·1280·3840) · 신규·변경 파일 grep 0(HEX·저장소·줄표·KTX·B551011·scale·이모지·오답 카피) |

명세 밖 결정(보고):
- 폴더명 `sovereign` 을 쓰지 않았다(소버린 서사 금지) → `server/services/rag.mjs`·`byteFallback.mjs`.
- 동해사이 SovereignChat UI 는 그대로 못 쓴다(보더·임의 px·zustand 의존). 스트리밍 훅·ndjson 읽기·조사 교정 로직만 이식하고 화면은 Modal(§36) + 토큰으로 다시 그렸다.
- en·th 답변은 영어 규칙 프롬프트(RULES_EN)로 분기. 긴 한국어 규칙 뒤에서는 모델이 한국어로 샜다(실측: 영어 질문에 한국어 불릿, 태국어 질문에 태국어 인사 + 한국어 본문).
- 지식 항목 머리말에 한국어·영어 이름을 함께 넣어 다른 언어 답변에서도 그 언어 이름을 쓰게 했다.
- K-드라마 스탬프는 없다. venues 에 grade 강함 드라마 앵커가 없다(공지천 = 촬영 근거 없음 · SOURCE §8).
- **App.jsx `ResetToHomeOnLoad`([V20]) 예외에 `/stamp/*` 추가.** NFC 태그는 항상 새 탭 전체 로드라 예외가 없으면 스탬프를 찍을 수 없었다(기능 자체가 막힘 · `/admin` 과 같은 사유).

다음 세션 참고:
- **odii 청크 0.** 한도가 풀린 날 `node server/scripts/build-knowledge.js` 를 다시 돌리면 odii 행만 채워진다(다른 소스는 그대로 갈아 끼움).
- 배포 서버(Render)에는 Ollama 가 없어 챗봇이 원문 모드로 동작한다. 문장형 답변이 필요하면 Gemini 키를 넣는다.
- 모델이 장소명 앞 숫자를 떨어뜨리는 일이 있다("1.5 닭갈비 본점" → "닭갈비 본점"). 출처 칩은 이름 변형 매칭으로 보정했다.
- 스탬프 스티커 URL 은 **배포 서버와 같은 SESSION_SECRET** 으로 다시 뽑아야 인증된다.
- 검증 흔적(Neon): kroute.test 계정 8 · stamps 6행(2명) · chat_logs 24행(ko 16 · en 3 · th 5) · spot_chunks 346행.
- th 문안은 여전히 네이티브 검수 대기(사전·챗 답변 모두).

### P4 게이미피케이션 이식 (2026-09-13 · 단독 · [V5-9] bd82615 · 7e11f5e · b3f9637 · 5074a8d · e562656 · c930a8a · 44e3d73)

지시서 = "GenLocal 재미 루프를 메커니즘만 이식"(픽셀·다람쥐·GenLocal 코드·localStorage 금지 · 데이터는 공사 TourAPI).

| 항목 | 결과 |
|---|---|
| 라인 체계 | `data/gts/lineSystem.js` 신설(순수 함수 · 셀프체크 별도 파일) · 라인 3종은 기존 3색 재배정(drama=lake · food=dakgalbi · anime=potato) · 신규 색 0 |
| 역 판정 | 역 = K배지 통과분만(SOURCE UI 규칙) · 실측 배지 13 = kfood 13 · kdrama 1(남이섬) · kanime 1 · 나머지는 연계 로컬 |
| 퀴즈 게이지 | 문항마다 라인 축 3막대 + 크루 레벨 · 채움은 `transform: scaleX`(MOTION 준수) · 실측 K-Food 선택 시 food 0.75, q2 photo 추가 시 drama 0.25 |
| 타입 리빌 | "너는 ○○ 라인" 판독 · 실측 q1 K-Drama(3) > q2 cafe 보정(1) → Drama Line · 스탬프 면 rgb(0,115,236) · 기존 여행 타입은 보조 칩 보존 |
| 노선 여권 | route 라인 요약 칩 + 지도 핀·타임라인 노드 라인 색 · 실측 K-푸드 코스 3곳 전부 spice · 혼합 코스는 drama primary + 연계 로컬 surface 로 구분 |
| 편집 agency | 담기·빼기는 기존 경로(VenueGrid ↔ CourseQueue) 유지 · 큐 pill 에 라인 도트 추가(실측: 남이섬만 도트, 로컬 2곳 없음) |
| 스탬프 | 로컬 KIND 표 폐기 → lineSystem 단일화 · 실측 kfood 면 spice · kanime 면 yellow(구 코드는 파랑) · 진행바 scaleX 0.5 → 1 |
| 오염 정리 | 집중률 Chip 노출 제거(build·route) · go `CrowdCard` 유지 · K-가이드 FAB 3곳 제거 · 참조 grep 확인(CongestionChip = 정의+CrowdCard / GuideFab = 정의만) |
| 축제 API | `searchFestival2` probe 채택 근거 확보(KTO_API.md) · 코드 미사용(아래 대기) |
| 검증 | E2E 회귀 PASS(홈 → gate → quiz → build → route → go → setup → checkout → 티켓 JBCBFW) · 3언어 1367키 동형 · build 통과 · 320/768/1440 가로 스크롤 0 · 콘솔 에러 0 · 변경 파일 HEX·웹스토리지·네이티브 select·TS 0건 |

명세 밖 결정(보고):
- **문항을 6~8개로 늘리지 않고 기존 5문항을 유지했다.** 지시서의 추가 문항 후보인 식이(할랄·비건)는 근거 데이터가 0건이고(venues·공사 풀·SOURCE 전수 grep), 서버 `validAnswers` 가 q1~q5 를 엄격 검증해 계약 변경이 필요하다. 스탯 축은 기존 답에서 파생했다.
- q3·q4·q5 는 스탯 축을 올리지 않는다(장소 조건이지 취향 축이 아니다 · 없는 상관관계를 만들지 않으려고). 문항마다의 반응은 레벨이 담당한다.
- 애니 라인은 q1 kanime 명시 선택으로만 올라간다(근거 있는 애니 앵커가 1곳뿐이라 성향만으로 배정하지 않는다).
- 게이지·진행바 채움에 `transform: scaleX` 를 썼다(DESIGN §17.3 기능적 scale 4범주 밖이지만 MOTION.md 가 width 애니메이션을 금지한다 · VenueGrid `scale(0.6)`·CourseQueue `scale(0.9)` 선례와 같은 기능적 상태 표시).
- **연계 로컬 면을 `NO_LINE_FACE`(surface)로 분리했다.** drama = lake = primary 라서 "기본 primary" 를 폴백으로 두면 드라마 역과 연계 로컬이 같은 색이 된다(실측으로 잡았고 셀프체크 어서션으로 고정).
- 챗봇은 FAB 만 내리고 코드는 전부 보존했다(사용자 결정 "기능 유지") → `GuideFab`·`ChatSheet`·`useGuideChat`·`openChat` 은 호출부 0 상태로 남는다.
- 봄내크루 레벨업은 라인 아이콘으로 대체했다(크루 PNG 3종이 32×32 단색 스텁 · IA §7 PLACEHOLDER 대기). 에셋이 들어오면 `LINES.crew` 경로만 갈아 끼우면 된다.

다음 세션 참고:
- **축제(`searchFestival2`) 코드 미연결** → [V5-10] 에서 연결 완료(아래 P5). 오퍼레이션은 실재하나 areaCode 필터로는 0건이고, 춘천 축제 8건이 전부 지역코드 공란·법정동 51/110 이다(남이섬과 같은 구조). 채택하려면 지역 필터 없이 받아 법정동으로 거른다. 춘천막국수닭갈비축제·춘천애니토이페스티벌이 각각 K-푸드·애니 라인과 직결이다.
- 집중률은 풀 일부만 이름 매칭된다(실측: 춘천막국수체험박물관 matched, 원조숯불닭·통나무집 unmatched) → go `CrowdCard` 가 미매칭 장소에서는 "정보 없음" 문구를 그린다(정상 동작 · 데이터 한계).
- 봄내크루 실제 에셋, th 네이티브 검수는 여전히 대기.

### P5 축제 API 연결 (2026-09-13 · 단독 · [V5-10])

공사 OpenAPI 6번째 실사용. 얇은 라인(드라마·애니)을 기간 한정 이벤트로 두껍게 한다.

| 항목 | 결과 |
|---|---|
| 실연동 | `ktoFestivalService` 신설 · searchFestival2 를 지역 필터 없이 받아 법정동 51/110 으로 거른다(코드는 ensureKtoIds 캐시 · 하드코딩 0) · 응답 원문 무가공 · 24h 메모리 캐시 |
| API | `GET /api/kto/festivals?date=YYYYMMDD`(없으면 KST 오늘) · 그 날짜에 열려 있는 축제만 · 실패 200 fallback |
| 라인 매핑 | 근거 있는 둘만: 춘천막국수닭갈비축제 → food(SOURCE §1 K-푸드 앵커 근거의 바로 그 축제) · 춘천애니토이페스티벌 → anime(SOURCE §4 애니타운페스티벌 계열) · 나머지 6건은 매핑 없음 |
| 화면 | route 라인 요약 아래 기간 한정 배지 · 라인 근거 있는 축제만 라인 색 도트 · 날짜 밖이면 행 자체 비렌더 · 상시 역(방문 순서)에는 넣지 않는다 |
| 검증 | API 토글 실측(오늘 1건 인형극제 · 10-16 1건 닭갈비축제 · 10-13 **0건** · 10-04 1건 애니토이) · 화면 토글 실측(도트 spice/yellow · 기간 밖 null) · E2E 회귀 PASS(티켓 RDF7BK) · 빌드 · 셀프체크 2종 · 3언어 1368키 동형 · 320 가로 스크롤 0 · 콘솔 에러 0 |

명세 밖 결정(보고):
- 축제는 `kto_spots` 에 적재하지 않고 24h 메모리 캐시에 원문을 둔다(목록 갱신이 "목록에 없는 행 삭제"라 매번 지워진다 · 8건이라 DB 이점도 없다).
- 기준 날짜는 `travelDate` 가 없으면 KST 오늘이다(심사 경로 quiz → build → route → go 는 setup 을 거치지 않아 날짜가 비어 있다).
- 축제 제목은 공사 ko 원문만 쓴다(EngService2 축제 조회는 범위 밖) → en·th 화면에도 한글 제목이 나온다. 장소명·리뷰 본문과 같은 데이터 영역 예외.
- `eventStartDate` 는 필수값이라 "올해 1월 1일"부터 받고 기간 겹침은 코드가 판정한다(연도 하드코딩 없음 · KST 오늘에서 연도를 뽑는다).

### P6 문제 지표 수치 통일 (2026-09-13 · 단독 · [V5-11])

감사 결과(지시 1항): 지목 수치 6종(80.4 · 63.6 · 37.6 · 41.2 · 80.3 · 86.7)은 **앱 코드에 0건**이었다.
존재한 곳은 `res.md`(69.3 · 84.0 · 80.3 · 80.4 · 63.6 · 37.6)와 `gemini.res.md`(41.2 · 86.7) 두 문서뿐이다.
지목된 brand 계열(ProblemCards · ProofSection · BrandHero · StayLonger · WhatWeRun)과 home 계열(PilotStrip · HowItWorks)에는
하드코딩 통계가 하나도 없었고, `data/pilot.js` 의 3·14·5 는 자체 파일럿 실적 PLACEHOLDER 라 지목 통계와 무관하다.
게다가 `components/brand/*` 는 `About.jsx` 만 쓰는데 그 About 은 [V10] HIDDEN 이라 `App.jsx` 에서 import 조차 되지 않는 dead code 였다.
즉 교정할 대상이 앱에 없었고, 검증 조건인 "폐기 수치 잔재 0" 은 착수 시점에 이미 충족 상태였다.

사용자 결정(2026-09-13): ① 확정 수치는 살아있는 화면인 Home 에 근거 스트립을 신설해 넣는다 ② `res.md`·`gemini.res.md` 는 그대로 둔다.

| 항목 | 결과 |
|---|---|
| 데이터 | `data/evidence.js` 신설 · 검증 확정 7항목의 단일 출처 · 검증 안 된 수치는 넣지 않는다(넣지 않으면 화면에도 뜨지 않는다) |
| 확정 수치 | 공연 티켓판매액 수도권 82.7% · 대중교통 격차 7배(서울 37% 대 강원 5.3%) · 농어촌 배차 69.3분 · 서울 방문율 80.3%(2023) · FIT 84.0%(2023) · 남이섬 41.2% · 당일치기 86.7% |
| 출처 | 7개 전부 병기 · 지시서 제공 5개 + 문서에서 확인한 2개(남이섬 = 강원특별자치도 공식통계 · 당일치기 = 한국관광 데이터랩 2022 공표) |
| 정의 혼용 방지 | 설문 기반(외래관광객조사 80.3%)과 통신 기반(데이터랩 86.7%)을 출처 문구에 명시해 구분 · 무효 조합(서울 대중교통 대 전국 평균)은 쓰지 않고 같은 기준끼리 비교한 서울 37% 대 강원 5.3% 로 대체 |
| 화면 | Home `#evidence` 섹션(Hero 다음) · 값 + 라벨 + 출처 캡션 · 출처는 `data-source` 속성에도 남는다 |
| 검증 | 폐기 수치 앱 잔재 **0건** · 화면 텍스트 잔재 **[]** · 카드 7개 실측(캡션·속성 양쪽 확인) · 빌드 통과 · 3언어 1384키 동형 · E2E 회귀 PASS(티켓 8GYGS4) · 320/768/1440 가로 스크롤 0 · 콘솔 에러 0 |

명세 밖 결정(보고):
- IA §10.2 가 Home 섹션 순서를 고정하고 있으나 근거 스트립을 Hero 다음에 더했다(문제 제기 → 해법 순서 · 기존 5섹션의 상대 순서는 불변).
- `evidence.js` 주석에 폐기 수치를 숫자로 적지 않는다. 검수 grep("잔재 0")에 주석이 오탐으로 걸리기 때문이다.
- 남이섬 41.2% 는 "춘천 10대 지점 방문객 대비 점유율"이다(춘천 전체 방문객 대비가 아니다) · 라벨에 그대로 적었다.
- 대중교통 격차 카드의 값은 "7×" 로 두고 서울 37%·강원 5.3% 는 라벨에서 밝힌다(배 단위가 언어에 따라 달라지기 때문).
- th 문구는 기계 번역 초안이다(기관명은 원문 유지 · 네이티브 검수 대기).

다음 세션 참고:
- 기획서(`res.md`)의 폐기 수치 3종(80.4 · 63.6 · 37.6)은 사용자 결정에 따라 손대지 않았다. 앱과 완전히 일치시키려면 기획서 본문을 직접 정리해야 한다.
- `components/brand/*` 와 `pages/About.jsx` 는 여전히 dead code 다(About 공개 여부 미결). 공개하면 그쪽 카피도 확정 수치로 맞춰야 한다.

### P7 게스트 공개 진입 (2026-09-13 · 단독 · [V5-12])

문제: 배포본에서 케이로드 전 구간이 RequireAuth 에 막혀 로그인해야만 열렸다. 공모전 심사위원은 로그인하지 않는다.

감사(지시 1항): RequireAuth 8곳 = `/gts/{setup,build,route,checkout,quiz,go}` · `/stamp/:spotId/:t` · `/profile`. `/gate` 는 이미 공개였다.
서버는 추천·동선·확산·축제·집중률·챗이 **이미 비로그인으로 동작**했고(quiz.js 는 readUserId 가 없으면 저장만 건너뛴다),
실제로 막던 곳은 stamps(401 2곳)·track(401)·gts 예약 조회·취소(401)뿐이었다.

| 항목 | 결과 |
|---|---|
| 라우트 | 케이로드 전 구간 공개 · `/profile` 만 RequireAuth 유지 |
| 스탬프 | 게스트는 세션 키만 발급(ensureAnonKey) + 빈 요약 · 태그 검증은 동일 · 화면이 이번 세션 메모리로 표시(사용자 결정 · stamps.user_id NOT NULL 이라 스키마 변경 없이 성립) |
| 계측 | track 은 게스트에게 200 + skipped · 저장은 로그인 사용자만 · 이것이 게스트 "콘솔 에러 0" 을 만든 실제 수정이다 |
| 결제 | onPay 게스트 통과 + 데모 표기 · resolveUserId 가 null 을 주어 예약은 user_id 없이 저장되고 계정 생성은 없다 · 실결제도 없다 |
| 게스트 E2E | 쿠키 0 컨텍스트(시크릿 등가) · 홈 → gate → quiz → build(3곳) → route → go → checkout 완주 · **로그인 벽 0회** · 실패 요청 0건 · 콘솔 에러 0 |
| 로그인 회귀 | 기존 플로우 PASS(티켓 THJWBY) · 콘솔 0 · track 변경이 로그인 계측을 깨지 않음 |
| 정적 | 빌드 통과 · 3언어 1386키 동형 |

명세 밖 결정(보고):
- `/gts/setup`·`/gts/checkout` 도 함께 열었다(지시는 6개였으나 route 의 "차량으로 이동" 으로 이어지는 경로라 막히면 데모가 중간에 끊긴다).
- track 은 게스트 이벤트를 저장하지 않는다(401 을 200 으로 바꾸기만 했다) · journey_events 는 로그인 사용자 귀속이 전제다.
- GtsStamp 는 렌더를 고치지 않고 응답 수신 지점에서 게스트 스탬프를 합성했다(diff 최소 · 로그인 경로 무영향).

다음 세션 참고:
- **직접 URL 진입은 여전히 홈으로 돌아간다.** ResetToHomeOnLoad([V20] 사용자 요청)가 `/`·`/admin`·`/stamp/*` 외 전 경로를 홈으로 replace 한다.
  홈에서 클릭으로 들어오면 문제없지만, 배포 URL 뒤에 `/gts/quiz` 같은 경로를 붙여 공유하면 홈으로 간다. 심사 안내에 경로를 적을 계획이면 예외 목록에 케이로드 경로를 넣어야 한다.
- 배포 env 의 `DEMO_MODE` 는 false 여야 한다(true 면 게스트 예약이 데모 계정에 귀속된다).

### P8 추천 카드 실데이터 · 라인 색 (2026-09-13 · 단독 · [V5-13])

문제(사용자 실측): build 추천 카드 12장의 한 줄이 전부 "Fits the kind of trip you said you like." 하나였고 태그도 전부 "Activity" 였다.
드라마 라인을 골랐는데 드라마 장소가 하나도 안 나왔고, 카드가 검은 배경 + 흰 텍스트로 렌더됐다.

감사(지시 1항 · 원인 특정):
- 한 줄은 하드코딩이 아니다. `reasonKey` 가 5버킷(anchor·linked·style·company·default) 라벨이고 LLM 이 꺼져 있어(LLM_PROVIDER=unset) 클라가 `t(reasonKey)` 를 그린다.
  q1=kdrama 는 12장 중 11장이 같은 버킷(style)으로 떨어져 같은 문장이 됐다.
- place 별 텍스트가 **애초에 서버에 없었다**: `toItem()` 이 `oneLine: {}` 으로 비워 보낸다(합류 venue 2곳만 실제 한 줄을 갖는다).
- 태그는 `cat1` 하나로 3버킷 축약하면서 원문의 `cat2`·`cat3`·`addr1` 을 버리고 있었다(kto_spots.raw 에는 전부 들어 있다).
- 라인 필터링은 **이미 동작하고 있었다**: 드라마 12곳과 K푸드 12곳의 겹침 0/12(K푸드는 12곳 전부 K배지 앵커).
  드라마가 비어 보인 진짜 원인은 필터 부재가 아니라 아래 점수 버그다.

| 항목 | 결과 |
|---|---|
| 분류 칩 | categoryCode2 로 cat2 이름(ko·en) 적재 → q1=kdrama 카드 칩이 "Activity" 1종에서 6종(건축/조형물·문화시설·휴양관광지·역사관광지·체험관광지 등)으로 갈렸다 |
| place 별 한 줄 | `where`(addr1 에서 시도 접두만 제거) 추가 · 고유 한 줄 12/12(이전 1/12) |
| 앵커 점수 | 대중교통 페널티 -2 가 앵커에도 걸려 유일한 드라마 앵커(남이섬)가 3점이 되어 무관한 공원·도서관과 동점 → 동점 정렬에 밀려 12곳에서 탈락했다. 앵커 면제 후 1위(score 5) |
| 카드 면 | bg-ink + ink 75/60/40 그라데이션 폐지 → white(mock 은 surface) + shadow.sm + 보더 0 · 사진은 상단 aspect-video 밴드 · 검정 카드 0장 실측 |
| 라인 색 | `LINE_BG` + `lineOfSpot` 도트(배지 통과분만) · 드라마 1장 / K푸드 8장 실측 |
| 회귀 | 두 라인 겹침 0/12(절반 이상 달라야 하는 기준 통과) · 320px 가로 넘침 false · 콘솔 에러 0 · E2E PASS(티켓 VVMKN3) · 빌드 통과 · 3언어 1386키 동형(신규 키 0) |

명세 밖 결정(보고):
- A05(음식)는 categoryCode2 이름을 쓰지 않는다. cat2 가 '음식점' 하나뿐이라 카페까지 음식점이 되는데, 기존 category 3버킷이 CAFE_CAT3 로 이미 더 정확히 가른다.
- 사진을 지우지 않고 상단 밴드로 옮겼다. 지시는 "배경을 white/surface 로 복구" 였고 사진 제거가 아니었다(공사 대표이미지는 데이터 활용 근거다).
- 앵커 거리 페널티 면제는 지시 2항(라인 반영)의 범위로 판단해 함께 고쳤다. 이것을 고치지 않으면 드라마 라인은 여전히 앵커 0곳이다.

다음 세션 참고:
- **풀 순서가 재기동마다 달라진다(미수정 · 승인 대기).** `ktoSpotService.poolItems()` 의 `SELECT ... FROM kto_spots WHERE raw ? 'list'` 에 ORDER BY 가 없어
  Postgres 가 행 순서를 보장하지 않는다. 동점 정렬의 최종 기준이 "풀 원래 순서"라 같은 답이 재기동 전후로 다른 12곳을 준다(IA §11.4 결정론 주장과 어긋남).
  `ORDER BY contentid` 한 줄이면 되지만 노출되는 장소 구성이 바뀌므로 지시 범위 밖으로 두고 보고만 한다.
- K푸드 라인 카드 칩은 대부분 "Meal" 이다(A05 제외 결정의 당연한 결과). 식당을 더 잘게 나누려면 cat3 이름(카페/전통찻집 등)까지 받아야 한다.

### P9 홈 정체성 K-Route 재작성 · /gts 인트로 (2026-09-13 · 단독 · [V5-15])

지시: 홈 메인 피치를 K-Route 로 교체(A) · 죽은 CTA 수정(B) · 조용한 실패 제거(C) · 옛 용어 정리(D).

감사(먼저 실측 · 지시와 코드가 어긋난 부분):
- **B5 "Build my day 가 onClick 때문에 안 움직인다" 는 재현되지 않았다.** 히어로 CTA 는 `Button as={Link} to="/gts"` 순수 링크이고
  `Button.jsx`·`HeroCarousel.jsx` 어디에도 이동을 막는 onClick 이 없다. 쿠키 0 브라우저 실측: 가려짐 없음 · `/gts/quiz` 이동 성공 ·
  SPA 유지 · 콘솔 0. 같은 href 링크가 헤더·히어로·서비스카드·푸터에 5개라 처음에 푸터를 눌러 놓고 히어로를 확인했다고 오독할 뻔했다(index 로 지목해 재실측).
- **C6 "Travel Log 가 비로그인이면 조용히 홈으로 튕긴다" 도 재현되지 않았다.** `/travel-log` 는 [V5-12] 이후 RequireAuth 밖(공개 라우트)이고
  TravelLog 자체에도 인증 가드가 없다. 실측: 모달 없이 정상 진입. RequireAuth 가 남은 유일한 곳(`/profile`)은 조용히 튕기지 않고 LoginGate 를 띄운다.
- **실재하는 유일한 "조용한 튕김" 은 `ResetToHomeOnLoad`([V20] 사용자 요청)였다.** 새로고침·직접 URL 진입 시 예외 3곳을 뺀 전 경로를 말없이 홈으로 replace 한다.
- 배포본은 확인하지 못했다(레포에 배포 URL 기록이 없고 `server/.env` 의 CLIENT_ORIGIN 은 localhost 였다 · 한때 배포를 본 줄 알았으나 로컬이었음을 확인하고 정정했다).

사용자 결정(질문 후 진행): B5 는 코드를 건드리지 않고 A4 인트로로 흡수 · ResetToHomeOnLoad 는 케이로드·Travel Log 예외 추가.

| 항목 | 결과 |
|---|---|
| 히어로 | "Chuncheon has no subway." / "그래서 노선을 깔았다" 계열로 교체 · 주 CTA = 케이로드(primary), 보조 = Trip Planner(onPhoto) |
| 섹션 순서 | Hero → **lines**(라인 3종) → evidence(Why K-Route + 해법 한 줄) → how-it-works(퀴즈 → 여권 → 스탬프) → services(보조 도구) → reviews → proof |
| Trip Planner | 주 피치에서 내려와 라인 섹션의 보조 텍스트 링크 + 보조 도구 카드로 재편입(Travel Log 와 한 쌍) |
| /gts 인트로 | 노선도 2층 구조 한 화면(위층 K-콘텐츠 노선 3종 · 아래층 공사 데이터 실제 이동) + 흐름 3단계 + 시작하기 → 퀴즈 · 건너뛰기는 모듈 인메모리 플래그(웹스토리지 금지) |
| 조용한 튕김 | `OPEN_PATHS = ['/gts','/travel-log','/reviews']` 하위 경로 포함 예외 · 실측: 세 경로 직접 진입 생존, 예외 밖(`/profile`)은 기존대로 홈 리셋 |
| 정체성 자가 점검 | 첫 화면 텍스트에 K-Route 등장 · Hero 다음 첫 섹션이 라인 소개 · 구 "Two services" 잔재 0 |
| 회귀 | E2E PASS(티켓 5CS3AH · 인트로 한 칸 경유하도록 하네스 수정) · 빌드 통과 · 콘솔 에러 0 · **i18n 누락 키 0**(LangSwap 3언어 겹침 렌더 기준 실화면 검증) · 3언어 동형 1408키 · 320px 가로 넘침 0 |

명세 밖 결정(보고):
- **IA §11.2 를 개정했다.** `/gts` 는 quiz 직행이 아니라 인트로다(사용자 지시 A4). 심사 경로 §11.1 의 순서는 그대로고 앞에 한 칸이 붙는다.
- `ServiceCards` 를 버리지 않고 보조 도구(Trip Planner · Travel Log)로 재배치했다. 케이로드 진입은 히어로·라인 섹션이 소유하므로 여기서 중복으로 부르지 않는다.
- `meta.title.gtsSetup` 의 "Tour Builder" 를 이동 준비 계열로 바꿨다(D 옛 용어 정리 중 라우트 제목에 직접 노출되던 것만).

다음 세션 참고:
- **D 옛 용어 잔여(미처리 · 사용자가 다음 세션 허용).** `gts.setup.cta` "Build my day" · `gts.build.s2` "Course selection" · `reviews.form.courseLabel` "Course" ·
  `brand.js` "Full Day Course". reviews 의 Course 는 후기 작성 시 고른 코스를 뜻해 맥락상 아직 유효하므로 함께 판단이 필요하다.
- **배포본 미확인.** 사용자가 보는 화면과 로컬이 다를 수 있다(B5·C6 가 배포본에서만 재현될 가능성). 배포 URL 을 받으면 같은 감사 스크립트를 그대로 돌릴 수 있다.
- 인트로 건너뛰기는 앱 로드 단위다. 새로고침하면 인트로를 다시 본다(웹스토리지 금지의 필연적 결과 · 데모상 문제없음).
- th 카피는 기계 번역 초안이다(네이티브 검수 대기 · 기존 규율 유지).

### P10 지도 2층 구조 · 라인 색 (2026-09-13 · 단독 · [V5-16])

지시 6항목 중 **3개는 실측에서 재현되지 않았다**(고치지 않고 보고). 지시의 파일 추정도 두 곳이 실제와 달랐다.

감사:
- **항목 2의 "LoopMap" 은 `/loop` 계열 deprecated 다.** 동선 지도의 실체는 `components/gts/ItineraryMap.jsx` 이고,
  **핀은 [V5-9] 에서 이미 라인 색**이었다(`LINE_FACE`). 실제로 primary 고정이던 것은 **폴리라인 3레이어**뿐이다(기준 스크린샷에 핀은 빨강·선은 파랑으로 찍혔다).
- **항목 3(타입 리빌 텍스트 없음) 재현 안 됨.** `QuizResult` 가 이미 라인 이름(h2)과 한 줄 설명을 렌더한다.
  실측: "K-Food Line" 노출 true · 설명 노출 true · 스크린샷(v516-before-reveal)에 "YOUR LINE / K-Food Line / A line that follows dakgalbi and makguksu." 가 그대로 찍혔다.
- **항목 5(스탬프) 재현 안 됨.** `/gts/stamp` 라는 경로는 없다(실제는 `/stamp/:spotId/:t` · 토큰 = HMAC 12자).
  정상 태그 URL 로 스탬프 화면에 **도달한다**(`/stamp/tongnamujip/...` → "K-ROUTE STAMP · Tongnamujip Dakgalbi"). `/gts/stamp` 도 [V5-15] 예외 덕에 홈으로 튕기지 않고 NotFound 를 렌더한다.
- **항목 4 는 유효했다.** "Busy spots" 는 `m.busyOnDate != null` 조건부라 그 값이 null 인 날에만 안 보였을 뿐 렌더 코드가 살아 있었다(서버 metrics 에 키 실재 확인).
- **항목 6 답**: odii 성지 스토리는 상세 패널 하단에 **실제로 노출된다**(`VenueDetail` · 음원 없으면 원고만).
  반면 `detailImage2` 로 받아 둔 **관광사진 배열은 어디에서도 렌더되지 않는다**(클라 전수 grep 0건). 히어로는 `spotImages`(대표이미지 1장 + venue webp)만 쓴다.

| 항목 | 결과 |
|---|---|
| 1층 네트워크 | 사용자 승인대로 "있는 그대로": K푸드는 역을 선으로 잇고, 역이 1곳뿐인 드라마·애니는 **점**으로 그린다(없는 역을 지어내지 않는다) · 배지 통과 + **실좌표** 스팟만(좌표 없는 것은 제외 = DEMO 좌표로 역을 세우지 않는다) |
| 2층 경로선 | 구간별 라인 색 · 실측 `gts-route-food-main = #FF4438`(spice) 로 primary 고정 해제 확인 · 라인 없는 구간은 중립 잉크 |
| 혼잡도 | `gts.route.plan.crowd` 렌더 제거(서버 산출·i18n 키는 보존) · 실측 "Busy spots" 문구 0 |
| 스탬프·리빌 | 회귀 확인만(수정 없음) · 둘 다 정상 |
| 회귀 | E2E PASS(티켓 SXYDZH) · 빌드 통과 · 콘솔 0 · i18n 누락 키 0 · 3언어 동형 1409키 |

드라마·애니 앵커 재조회(사용자 별도 지시 · "공사 API 가 이미 가진 데이터 안에서만"):
- SOURCE_SPOTS §2 전수 = kdrama 3건 중 anchor 는 남이섬 하나뿐. `gongjicheon`(근거없음 · '촬영지' 표기 금지) · `jungdo-mullegil`(약함) 은 **근거 등급 때문에 의도적으로 anchor=false** 다(검색 반경 문제가 아니다).
- §2 주석이 이름을 댄 겨울연가 실제 촬영지 4곳을 `searchKeyword2` 로 직접 조회한 결과:
  **춘천고등학교 전국 0건 · 준상이네집 전국 0건 · 중앙시장 전국 30건이나 춘천 0건 · 메타세쿼이아 전국 11건이나 춘천 0건.**
  "중도" 로 잡힌 춘천 2건 중 `춘천중도 물레길`(2774566)은 이미 SOURCE_SPOTS 에 등재돼 grade=약함 으로 배제된 바로 그 항목이다.
- **판정: 실제 데이터 한계로 확정.** 억지로 채우지 않았고 SOURCE_SPOTS 표는 한 글자도 고치지 않았다(태그 추가는 승인 사안).

사고:
- 1층을 붙이며 `fitBounds` 에 네트워크 좌표까지 담았더니 남이섬 같은 외곽 역 때문에 화면이 춘천 권역 전체로 넓어져 **개인 노선 3역이 점처럼 뭉개졌다**(스크린샷으로 발견).
  1층은 배경이므로 화면 밖으로 나가도 된다 → `fitBounds` 를 내 노선 기준으로 되돌렸다.

다음 세션 참고:
- `detailImage2` 원문이 `kto_spots.raw.images` 에 쌓여 있는데 화면이 안 쓴다. 상세 패널에 사진 갤러리를 붙이면 공사 데이터 활용 지점이 하나 는다(이번 지시 범위 밖이라 보고만).
- 드라마·애니 라인은 당분간 점 하나다. 역이 늘어나려면 SOURCE_SPOTS 에 근거 있는 앵커가 추가돼야 하고, 그건 공사 API 조회가 아니라 근거 확보의 문제다.

### P11 관광사진 갤러리 · 콘텐츠 재확인 · 축제 배지 (2026-09-13 · 단독 · [V5-17])

지시 3항목 중 **A만 구현이고 B·C 는 감사 결과 작업이 없었다**(고치지 않고 보고).

| 항목 | 결과 |
|---|---|
| A 갤러리 | 서버가 이미 저장한 `detailImage2` 원문을 상세 패널에 렌더. 실측: 원조숯불닭불고기집 썸네일 **4장 전부 로드 성공 · http 주소 0장**(표시용 https 변환 동작) · 사진 없는 장소는 블록 자체 비렌더(빈 박스 0) · 신규 API 호출 0 |
| B 콘텐츠 재확인 | **확인했으나 없음**(아래 표) · SOURCE_SPOTS 미수정 |
| C 축제 배지 | **뷰포트 버그 아님**. 7개 폭(1440·1280·1024·768·430·390·320)에서 `visibility:visible`·`opacity:1`·조상 overflow 전부 `visible`·pill 잘림 0·화면 밖 넘침 0. 실제 원인은 **날짜 조건부 렌더** |
| 회귀 | E2E PASS(티켓 Q3H28Z) · 빌드 통과 · 콘솔 0 · i18n 누락 키 0 · 3언어 동형 1410키 |

B 재확인 상세(공사 API 안에서만 · 외부 데이터 미사용):

| 검색 | 결과 |
|---|---|
| 적재 춘천 164건 이름 포함: 드라마·영화·촬영·세트·애니·만화·캐릭터·토이·웹툰 | **전부 0건** |
| 적재 164건 "인형" | `춘천인형극장&인형극박물관/130487`(cat2 A0206 문화시설) 1건 |
| `searchKeyword2` 드라마·영화·촬영지·만화·캐릭터 | 춘천 **0건**(전국으로는 12·41·13·10·1건) |
| `searchKeyword2` 애니메이션 | 춘천 1건 = `춘천 애니메이션박물관·토이로봇관/130472` = 이미 등재된 `animation-museum` 그 시설 |
| `searchFestival2` 춘천 축제 8건 | 애니 계열은 `춘천애니토이페스티벌`뿐이고 이미 [V5-10] 에서 anime 라인에 매핑돼 있다 |

C 원인 확정(날짜 조건):
- 기본(서버가 KST 오늘로 판정) 노출 = true → `travelDate=2026-09-20`(축제 없는 날) = **false** → `travelDate=2026-10-15`(막국수닭갈비축제) = true.
- 즉 "일부 상황에서 안 보인다"의 정체는 **그 날짜에 열리는 축제가 없으면 서버가 0건을 주고 섹션이 통째로 사라지는 것**이다([V5-10] 의 의도된 동작 · 기간 한정 배지).
- 고칠 버그가 아니라고 판단해 코드를 바꾸지 않았다. 축제가 없는 날에도 무언가 보이게 하려면 "이 날짜에는 축제가 없습니다" 같은 빈 상태 카피가 필요한데, 그건 새 사양이라 승인 사안이다.

사고:
- 갤러리를 넣으면서 `photos.length`·`photos.map` 을 쓰고 **`photos` 정의(useMemo)를 빠뜨렸다.** ReferenceError 로 상세 패널이 렌더 중 죽었고,
  화면에는 "상세가 안 열리고 그리드 돋보기까지 사라지는" 모습으로 나타나 원인이 한눈에 안 보였다. 빌드는 런타임 오류라 잡아 주지 않는다.
  → 검증 하네스가 "상세가 안 열림"을 만나면 수집된 페이지 에러를 즉시 찍도록 고쳤다(다음에는 한 번에 드러난다).
- 하네스 교훈 하나 더: 상세가 `aria-modal` 로 열리면 브라우저가 배경을 접근성 트리에서 숨겨 Playwright `getByRole` 이 그리드 버튼을 못 찾는다. CSS 셀렉터로 집어야 한다.

다음 세션 참고:
- **`춘천인형극장&인형극박물관`(130487)은 공사 데이터에 실재하는데 SOURCE_SPOTS 에 없다.** 인형극을 애니메이션으로 등치할 근거를 만들 수 없어 추가하지 않았다(§8 규율).
  애니 라인의 역을 늘리려면 이 시설을 어떤 근거·등급으로 넣을지 사용자 판단이 필요하다(승인 사안).
- 사진 없는 표본으로 찍은 통나무집 닭갈비는 `kind: 'venue'` 라 애초에 공사 상세 경로가 아니다. 공사 스팟 중 `images` 0장인 사례는 `강촌레일파크경강레일바이크/2774559` 로 확인했다.

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
