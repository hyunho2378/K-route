# PITFALLS.md · 반복 발생 버그와 방지책 (모든 작업에서 항상 읽는다)

봄내헬퍼 → K-Route 확장에서 실제로 터졌거나 터질 함정. 스킬 절대규칙과 중복되면 스킬이 우선.

## 공모전 치명 (이거 틀리면 심사 탈락)
- **공사 OpenAPI 0건 = 적격 탈락.** TAGO(국토부)는 공사 API 아님. 장소 데이터는 공사 TourAPI로
  조회해야 데이터활용 20점·적격 요건 충족. 교통만 TAGO 유지 허용.
- **근거 없는 성지 주장 금지.** SOURCE_SPOTS.md grade가 약함·근거없음인 항목에 K배지·성지 카피 금지.
  공지천 '겨울연가 촬영지', 레고랜드 'K-콘텐츠', 다원/신하균/박소담 '춘천 출신' → 전부 오답(SOURCE §8).
- **KTX 아님.** 춘천선은 ITX-청춘·일반열차. 문서·카피에 'KTX' 쓰지 마라 → "철도(ITX·일반열차)".

## API 계약 (tago.js 선례 = 그대로 따른다)
- serviceKey는 이미 URL 인코딩된 값 — **재인코딩 금지**(URLSearchParams로 감싸면 이중인코딩 = 최다 실패).
  쿼리스트링에 원문 그대로 이어붙인다. 공사 API도 동일 계약 적용.
- ID(터미널·역·지역코드·contentid)를 코드에 **박지 마라.** 기동 시 목록조회 API로 이름 매칭·캐시
  (server/cache/*.json). 공사 areaCode/sigunguCode도 코드조회로 확보.
- 오퍼레이션명·엔드포인트·파라미터명은 **docs/ 활용가이드 문서에 있는 것만 사실.** 없으면 probe 스크립트로
  실호출 검증 후 채택하고 근거 로그를 주석에 남긴다. 문서 없이 URL·파라미터 지어내면 즉시 실패.
- 응답 정규화: items.item 단건=객체·복수=배열·없음='' → 항상 asItems로 배열화(기존 tago.js 패턴).
- resultCode '00'/0 만 정상. XML 응답(OpenAPI_ServiceResponse)은 키 미활성·게이트웨이 오류 → 폴백.

## 프론트 (스킬 절대규칙 외 추가)
- localStorage/sessionStorage 금지 — 인증은 httpOnly 쿠키(기존 session.js). 게스트 상태는 서버 세션.
- 네이티브 select/date 금지 — go 화면 장소 드롭다운은 커스텀 FieldSelect.
- 기존 GtsContext 상태기·useGtsGuard 계약 유지. 가드 재설계는 IA §11 확정 세션에서만.
- i18n 3언어(en·ko·th) 키 동형 필수 — 새 네임스페이스(quiz·chat·go) 추가 시 3파일 다 채우고 index 등록.
  th 콘텐츠는 LLM 번역 캐시 허용하되 UI 크롬 th는 사전 필수.
- 지도는 maplibre 직접(기존 ItineraryMap). 새 지도 스택 도입 금지.

## DB
- 마이그레이션 DROP 금지 · ADD COLUMN IF NOT EXISTS · 멱등(2회 실행 증명).
- 시드 비파괴 · ON CONFLICT DO NOTHING · 기존값 COALESCE 보호.
- vector 확장: Neon은 지원. 없으면 embedding 컬럼만 빼고 생성 후 CREATE EXTENSION 재시도.
- kto_spots.raw는 API 원문 JSON 그대로(가공 금지 · 원문 무결성).

## 배포
- client/vercel.json rewrites 필수(SPA 새로고침 404 방지 · 이미 있음, 지우지 마라).
- cross-origin이면 쿠키 sameSite:'none'+secure+trust proxy+NODE_ENV=production. CORS origin 끝슬래시 없이.
- 도메인·API주소·키 하드코딩 금지 → env.
