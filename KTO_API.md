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
| KorService2 | categoryCode2 | 없음(cat1 7) · cat1 + cat2(cat3) | code, name | 분류 이름 근거(아래) |
| TatsCnctrRateService | tatsCnctrRatedList | areaCd, signguCd(시도+시군구 5자리), tAtsNm(선택), numOfRows, pageNo | baseYmd, tAtsNm, cnctrRate | 집중률 |
| TarRlteTarService1 | areaBasedList1 | areaCd, signguCd(5자리), baseYm(YYYYMM) | baseYm, tAtsNm, rlteTatsNm, rlteRank, rlteCtgryLclsNm·Mcls·Scls | 최신 baseYm 탐색 |
| TarRlteTarService1 | searchKeyword1 | areaCd, signguCd, baseYm, keyword | areaBasedList1과 동일 | 연관 |
| Odii | themeSearchList | langCode(ko·en), keyword | tid, tlid, themeCategory, addr1(시도까지만), addr2, title, mapX, mapY, langCheck, langCode, imageUrl | [P3-A] 오디오가이드 테마 · 장소명 완전일치만(ktoAudioService) |
| Odii | storyBasedList | langCode, tid, tlid | audioTitle, script, playTime, audioUrl | 오디오가이드 이야기(P3 RAG) |
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
- 2026-09-11 적재: ko 167행(이미지 145) · en 17행(이미지 13).
- 풀 편입: cat1 A01~A05(숙박 B02·추천코스 C01 제외) · category = A05 음식(카페/전통찻집 → foodspace, 그 외 meal) · 나머지 activity.
- en 항목은 제목 끝 괄호의 한글 원명이 ko 제목과 같으면 ko 항목의 영문명으로 붙이고(5건) 아니면 별도 항목(11건).
- 성지 여부·K배지는 SOURCE_SPOTS.md 태그로만 판정. 공사 스팟은 SOURCE 표에 없으면 local · badge false,
  venue와 같은 곳이면 그 venue 태그를 물려받는다(spotPool.js).
- 이미지: tong.visitkorea.or.kr http 주소는 풀 응답에서만 https로 바꿔 내린다(원문은 그대로 · https GET 206 확인).

## docs/kto/ 배치 목록 (README로도 안내)
위 6개 서비스의 '오픈API 활용가이드' 문서를 docs/kto/ 에 넣는다. 파일명에 서비스명 포함. 들어오면 이 표와 대조한다.

## probe 기록 (server/scripts/probe-kto.js)
| 시점 | 키 | 결과 |
|---|---|---|
| ① 2026-09-11 활용신청 전 `auth` | TAGO_SERVICE_KEY 값 | 6개 서비스 HTTP 403 · 30 SERVICE_KEY_IS_NOT_REGISTERED(경로 존재) · KorService1·EngService1 400 · 12 폐기 |
| ② 2026-09-11 승인 후 `auth` | KTO_SERVICE_KEY | 6개 전부 HTTP 200 · KorService2·EngService2·PhotoGalleryService1 0000 · TarRlte·TatsCnctr·Odii 11 필수 파라미터 누락(인증·오퍼레이션 유효) |
| ③ 2026-09-11 `verify` | KTO_SERVICE_KEY | 위 채택 표 전 단계 HTTP 200 · 0000 |
