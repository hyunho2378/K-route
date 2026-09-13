# KTO_API.md · 한국관광공사 OpenAPI 활용 계약 (probe 실호출 근거 · 2026-09-11)

> docs/kto 에 활용가이드 문서가 아직 없다. 아래 표는 전부 `server/scripts/probe-kto.js verify` 실호출
> (HTTP 200 + resultCode 0000)로 확인한 것만 적는다. 표에 없는 오퍼레이션·파라미터는 쓰지 않는다.
> 활용가이드(PDF/DOCX)가 docs/kto 에 들어오면 문서와 대조해 갱신한다.

## 발급 · 키
- data.go.kr 공사 6개 서비스 활용신청 승인(2026-09-11): 국문 KorService2 · 영문 EngService2 · 연관 관광지 TarRlteTarService1 ·
  집중률 TatsCnctrRateService · 오디오가이드 Odii · 관광사진 PhotoGalleryService1.
- env `KTO_SERVICE_KEY`(비우면 TAGO_SERVICE_KEY · data.go.kr 인증키는 계정 공통). 이미 URL 인코딩된 값이므로 재인코딩 금지.

## 공통 계약 (probe 확인)
- 호출: `http://apis.data.go.kr/B551011/<서비스>/<오퍼레이션>?serviceKey=<원문>&MobileOS=ETC&MobileApp=KRoute&_type=json&…`
- 정상: HTTP 200 + `response.header.resultCode = "0000"` (TAGO의 "00"과 다름 → tago.js 판정에 추가).
- 오류: 최상위 `{ resultCode, resultMsg }` (예: `11 NO_MANDATORY_REQUEST_PARAMETERS_ERROR1(baseYm)`) · 미등록 키 HTTP 403 · 30 · 폐기 서비스 HTTP 400 · 12.
- `items.item` 단건/복수/빈값 → asItems로 배열 정규화.
- 폐기: KorService1 · EngService1 (12 NO_OPENAPI_SERVICE_ERROR) → 사용 금지.

## 채택 오퍼레이션 (verify 전 단계 0000)
| 서비스 | 오퍼레이션 | 확인한 파라미터 | 응답 주요 필드 | 코드 사용처 |
|---|---|---|---|---|
| KorService2 · EngService2 | areaCode2 | 없음(시도 17) · areaCode(시군구 18) | code, name | ktoSpotService 코드 매칭 |
| KorService2 | ldongCode2 | 없음(법정동 시도 16) · lDongRegnCd(시군구 18) | code, name | 법정동 areaCd·signguCd |
| KorService2 · EngService2 | areaBasedList2 | areaCode, sigunguCode, numOfRows, pageNo | contentid, contenttypeid, title, addr1, mapx, mapy, firstimage, cat1~3, lclsSystm1~3, lDongRegnCd, lDongSignguCd | 목록 → kto_spots |
| KorService2 · EngService2 | detailCommon2 | contentId | overview, homepage, tel, addr1, mapx, mapy | 상세 |
| KorService2 · EngService2 | detailIntro2 | contentId, contentTypeId | 유형별(음식점 firstmenu·opentimefood / 문화시설 usetimeculture·usefee) | 상세 |
| KorService2 · EngService2 | detailImage2 | contentId | originimgurl, smallimageurl, imgname, cpyrhtDivCd | 상세 |
| KorService2 · EngService2 | searchKeyword2 | keyword, numOfRows, pageNo | areaBasedList2와 동일 필드(areacode·sigungucode·cat1은 공란일 수 있음) | [V5-5] 지역 목록 누락분 보강(ktoSpotService) |
| KorService2 | searchFestival2 | eventStartDate(필수) · 지역코드는 쓰지 않고 법정동으로 거른다(아래 주) | contentid, title, eventstartdate, eventenddate, addr1, mapx, mapy, firstimage, lDongRegnCd, lDongSignguCd, progresstype, festivaltype | [V5-10] 기간 한정 축제 배지(ktoFestivalService · GET /api/kto/festivals) |
| KorService2 · EngService2 | categoryCode2 | 없음(cat1 7) · cat1(그 아래 cat2 목록) · cat1 + cat2(cat3) | code, name | 분류 이름 근거(아래) · [V5-13] 카드 분류 칩 실사용(ktoSpotService.ensureCatNames · ko·en) |
| TatsCnctrRateService | tatsCnctrRatedList | areaCd, signguCd(시도+시군구 5자리), tAtsNm(선택), numOfRows, pageNo | baseYmd, tAtsNm, cnctrRate | 집중률 |
| TarRlteTarService1 | areaBasedList1 | areaCd, signguCd(5자리), baseYm(YYYYMM) | baseYm, tAtsNm, rlteTatsNm, rlteRank, rlteCtgryLclsNm·Mcls·Scls | 최신 baseYm 탐색 |
| TarRlteTarService1 | searchKeyword1 | areaCd, signguCd, baseYm, keyword | areaBasedList1과 동일 | 연관 |
| Odii | themeSearchList | langCode(ko·en), keyword | tid, tlid, themeCategory, addr1(시도까지만), addr2, title, mapX, mapY, langCheck, langCode, imageUrl | [P3-A] 오디오가이드 테마 · 장소명 완전일치만(ktoAudioService) · [V5-6] K-가이드 지식(ragService · 관광지만) |
| Odii | storyBasedList | langCode, tid, tlid | audioTitle, script, playTime, audioUrl | 오디오가이드 이야기 · [V5-6] spot_chunks odii(ragService) |
| Odii | themeLocationBasedList · themeBasedList | langCode, mapX, mapY, radius · langCode | 테마 필드 동일 | 확인만 · 코드 미사용([P3-A] 좌표 근접 매칭 폐지) |
| PhotoGalleryService1 | galleryList1 · gallerySearchList1 | 없음 · keyword | galTitle, galWebImageUrl, galPhotographyLocation | 확인만 · 코드 미사용 |

## 코드 값 (런타임 조회 · 코드에 박지 않음 · server/cache/kto-ids.json · 참고 기록)
- areaCode2: 강원특별자치도 32 → 춘천시 13 (ko·en 동일).
- ldongCode2: 강원특별자치도 51 → 춘천시 110 → 집중률·연관 signguCd = **51110** (110만 넣으면 0건 · verify 대조).
- 분류(categoryCode2): A01 자연 · A02 인문(문화/예술/역사) · A03 레포츠 · A04 쇼핑 · A05 음식 · B02 숙박 · C01 추천코스 · A05020900 카페/전통찻집.
- 연관관광지 baseYm: KST 전월부터 거슬러 데이터가 있는 첫 달(2026-09-11 기준 202608 · 1412행 · 기준 관광지 29곳).
- 집중률: 춘천 60곳 × 30일 예측(2026-09-11~10-10) = 1800행 · 분포 min 1.94 · p33 32.15 · p50 44.17 · p66 61.16 · max 100
  → 3구간 경계 32.15 / 61.16(여유·보통·혼잡 · ktoCongestionService).

## 적재 · 캐시 · 무결성
- kto_spots(contentid, lang).raw = API 원문 JSON 그대로: `{ list }`(areaBasedList2 항목) + 상세 요청 시 `{ common, intro, images }`.
- 적재: 서버 기동 시 1회 + TTL 24h lazy(풀 요청 시) · 목록에서 빠진 행은 삭제 · 상세는 목록 갱신 때 비워져 24h마다 재조회.
- [V5-13] 분류 이름 캐시 `server/cache/kto-cats.json` = categoryCode2(cat1 A01~A04 × ko·en = 8호출)를 기동 시 1회 · cat2 코드 → 이름.
  A05(음식)는 cat2 가 '음식점' 하나뿐이라 받지 않는다(카페까지 음식점으로 뭉개진다) · 기존 category 3버킷이 CAFE_CAT3 로 카페/식당을 이미 더 정확히 가른다.
  실패해도 카드 칩이 3버킷으로 돌아갈 뿐 풀은 그대로 나간다. 2026-09-13 적재: ko 16종 · en 16종(A0201 역사관광지 = Historical Sites 등).
  실측 효과: q1=kdrama 추천 12곳의 칩이 전부 "Activity" 하나였던 것 → 6종(건축/조형물·문화시설·휴양관광지·역사관광지·체험관광지 등)으로 갈렸다.
- 2026-09-11 적재: ko 167행(이미지 145) · en 17행(이미지 13).
- 풀 편입: cat1 A01~A05(숙박 B02·추천코스 C01 제외) · category = A05 음식(카페/전통찻집 → foodspace, 그 외 meal) · 나머지 activity.
- en 항목은 제목 끝 괄호의 한글 원명이 ko 제목과 같으면 ko 항목의 영문명으로 붙이고(5건) 아니면 별도 항목(11건).
- 성지 여부·K배지는 SOURCE_SPOTS.md 태그로만 판정. 공사 스팟은 SOURCE 표에 없으면 local · badge false,
  venue와 같은 곳이면 그 venue 태그를 물려받는다(spotPool.js).
- 이미지: tong.visitkorea.or.kr http 주소는 풀 응답에서만 https로 바꿔 내린다(원문은 그대로 · https GET 206 확인).
- [V5-5] 목록 보강: areaCode 기반 areaBasedList2는 구 areaCode·sigunguCode가 공란인 항목을 주지 않는다(남이섬 실응답 2026-09-12:
  areacode "" · cat1 "" · 법정동 51/110 · contentid 128019 ko · 264244 en · contenttypeid 12/76). searchKeyword2로 "제목 완전일치 +
  법정동이 춘천"인 항목만 더해 적재하고, raw에는 원문(list)과 형제 키 extra:true 만 둔다(원문 무가공 유지 · 분류 필터 예외).
- [V5-9] 축제: `searchFestival2` 는 실재한다(2026-09-13 probe · eventStartDate=20260101 · HTTP 200 · 0000 · 전국 712건). 단 **areaCode=32·sigunguCode=13 으로 조회하면 ko·en 모두 0건**이다.
  춘천 축제 8건이 전부 areacode·sigungucode 공란이고 법정동 51/110 만 갖고 있기 때문이다(남이섬과 같은 구조). 채택하려면 지역 필터 없이 받아 법정동 51/110 으로 거른다.
  실측 8건: 강원한우데이 · 제38회 춘천인형극제 · 춘천 미니 술페스타 · 춘천 술 페스타 · 춘천 썸머워터 페스티벌 · 춘천마임축제 · 춘천막국수닭갈비축제(20261014~18) · 춘천애니토이페스티벌(20261003~05).
  `searchFestival1` 은 폐기(HTTP 400 · NO_OPENAPI_SERVICE_ERROR).
- [V5-10] 채택: `ktoFestivalService` 가 지역 필터 없이 받아 법정동 51/110 으로 거른다(코드는 ensureKtoIds 캐시에서 읽는다 · 하드코딩 0 ·
  ktoSpotService.extraItems 와 같은 계약). 응답 항목은 가공 없이 24h 메모리 캐시에 둔다(kto_spots 에 넣지 않는다: 목록 갱신이
  "목록에 없는 행 삭제"라 매번 지워진다). `GET /api/kto/festivals?date=YYYYMMDD`(없으면 KST 오늘)가 그 날짜에 열려 있는 축제만 원문으로 내린다.
  실측 2026-09-13: 오늘 1건(제38회 춘천인형극제 0910~0916) · 10-16 1건(춘천막국수닭갈비축제 1014~1018) · 10-13 0건 · 10-04 1건(춘천애니토이페스티벌 1003~1005).
- [V5-6] K-가이드 지식 = `spot_chunks`(overview · intro · odii · related · source) · `node server/scripts/build-knowledge.js` · 기존 채택 오퍼레이션만 쓴다.
  2026-09-12 적재: 풀 206곳 · 공사 호출 607회(detailCommon2·Intro2·Image2 ko 134 · en 13 · searchKeyword1 162 · areaBasedList1 1 · 집중률 2) ·
  odii는 그날 일일 한도 초과(HTTP 429 LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS)로 건너뜀 → 한도가 풀리면 같은 스크립트를 다시 돌린다(다른 소스 행은 그대로 갈아 끼움).

## docs/kto/ 배치 목록 (README로도 안내)
위 6개 서비스의 '오픈API 활용가이드' 문서를 docs/kto/ 에 넣는다. 파일명에 서비스명 포함. 들어오면 이 표와 대조한다.

## probe 기록 (server/scripts/probe-kto.js)
| 시점 | 키 | 결과 |
|---|---|---|
| ① 2026-09-11 활용신청 전 `auth` | TAGO_SERVICE_KEY 값 | 6개 서비스 HTTP 403 · 30 SERVICE_KEY_IS_NOT_REGISTERED(경로 존재) · KorService1·EngService1 400 · 12 폐기 |
| ② 2026-09-11 승인 후 `auth` | KTO_SERVICE_KEY | 6개 전부 HTTP 200 · KorService2·EngService2·PhotoGalleryService1 0000 · TarRlte·TatsCnctr·Odii 11 필수 파라미터 누락(인증·오퍼레이션 유효) |
| ③ 2026-09-11 `verify` | KTO_SERVICE_KEY | 위 채택 표 전 단계 HTTP 200 · 0000 |
