# 한국관광공사 OpenAPI 사용처 (데이터활용 20점 증빙)

> 근거 = `KTO_API.md`(probe 실호출 기록 · HTTP 200 + resultCode `0000` 확인분만). 표에 없는 오퍼레이션·파라미터는 코드에서 쓰지 않는다.
> 활용신청 승인 2026-09-11 · 6개 서비스. 키는 `KTO_SERVICE_KEY`(없으면 `TAGO_SERVICE_KEY` · data.go.kr 계정 공통).

## 1. 서비스별 사용처

| # | 공사 서비스 | 오퍼레이션 | 쓰는 화면 | 무엇에 쓰나 | 코드 |
|---|---|---|---|---|---|
| 1 | 국문 관광정보 KorService2 | `areaBasedList2` | build · route · go | 춘천 관광지 목록(하이브리드 풀 1차) | `services/ktoSpotService.js` |
| 2 | 국문 관광정보 KorService2 | `detailCommon2` `detailIntro2` `detailImage2` | build 상세 · chat | 장소 소개 원문 · 이용시간/요금/메뉴 · 사진 | `ktoSpotService.getSpot` |
| 3 | 영문 관광정보 EngService2 | 위와 동일 | build · chat(영어·태국어) | 영문 이름·소개(다국어) | `ktoSpotService.js` |
| 4 | 관광지별 연관 관광지 TarRlteTarService1 | `areaBasedList1` `searchKeyword1` | build · chat | 함께 많이 찾는 곳(연계 로컬) | `services/ktoRelatedService.js` |
| 5 | 관광지 집중률 TatsCnctrRateService | `tatsCnctrRatedList` | build · route · go | 지금 혼잡도 Chip · 가장 한가한 날 | `services/ktoCongestionService.js` |
| 6 | 관광지 오디오가이드 Odii | `themeSearchList` `storyBasedList` | build 상세 · chat | 장소 해설(이름 완전일치 테마만) | `services/ktoAudioService.js` |
| 7 | 지역코드 | `areaCode2` `ldongCode2` | (기동 시) | 강원 32 · 춘천 13 · 법정동 51110 매칭 캐시 | `ktoSpotService.loadIds` |

- 지역코드는 **코드에 박지 않는다.** 기동 시 코드조회 API로 이름을 매칭해 `server/cache/kto-ids.json`에 캐시한다.
- 응답 원문은 `kto_spots.raw`에 **가공 없이** 저장한다(원문 무결성). 화면에 쓸 때만 HTML 태그·엔티티를 푼다.

## 2. 화면 → 공사 API 매핑

| 화면 | 공사 API | 화면에서 보이는 것 |
|---|---|---|
| `/gts/quiz` → 추천 | 1, 4, 5 | 취향 답변으로 고른 추천 장소(동점은 집중률 낮은 순) |
| `/gts/build` 코스 담기 | 1, 2, 3, 5 | 카드 대표이미지·제목·K배지·집중률 Chip / 상세 = 공사 원문 + 오디오가이드 |
| `/gts/route` 지도 | 1, 5 | 타임라인 장소명 + 집중률 |
| `/gts/go` 출발 | 1, 5 | 다음 장소 · "지금 가면 여유/보통/혼잡" |
| K-가이드 챗(build·route·go) | 2, 3, 4, 6 | 답변 근거 = `spot_chunks`(공사 상세·이용정보·연관·오디오가이드) + 출처 장소 칩 |

## 3. K-가이드 챗의 지식베이스

`node server/scripts/build-knowledge.js` 가 공사 응답을 `spot_chunks`(장소 × 언어 × 소스)로 적재한다.

| 소스 | 공사 API | 2026-09-12 적재 |
|---|---|---|
| `overview` | detailCommon2 | ko 151 · en 16 |
| `intro` | detailIntro2 | ko 122 · en 16 |
| `related` | searchKeyword1 | ko 17 |
| `source` | (공사 아님 · SOURCE_SPOTS.md 검증 태그 원문) | ko 24 |
| `odii` | storyBasedList | 0 (그날 일일 호출 한도 초과 · 한도 해제 후 같은 스크립트 재실행) |

- 적재 1회 = 공사 호출 607건(detail 3종 ko 134·en 13 · 연관 162 · 지역/집중률 3).
- **답변은 이 청크에 있는 사실만 쓴다.** 인용할 청크가 없으면 모델을 부르지 않고 "정보가 없습니다"로 끝낸다.

## 4. 공사 API가 아닌 것 (구분)

| 데이터 | 출처 | 이유 |
|---|---|---|
| 시외버스·철도 | 국토교통부 TAGO | 교통은 공사 API 영역이 아니다(ITX 청춘·일반열차) |
| 지도 타일 | OpenFreeMap | 배경 지도 |
| 로컬 맛집 51곳 | 자체 조사(`venues.js`) | 공사 목록에 없는 로컬을 메우는 2차 풀 |
| K-콘텐츠 태그 | 자체 사실검증(`SOURCE_SPOTS.md`) | 근거 강도까지 기록 · 근거 약한 곳에는 배지를 붙이지 않는다 |
