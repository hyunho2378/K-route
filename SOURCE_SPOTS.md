# SOURCE_SPOTS.md · 춘천 K-콘텐츠 태깅 원문 (무결성 대상)

> 이 파일은 **원문 데이터 무결성** 규율 대상이다. 에이전트는 이 표의
> `kcontent`·`evidence`·`grade`·`source` 값을 **한 글자도 바꾸지 않고** 코드에
> 복사한다. 요약·윤문·재작성·근거 강도 상향 전부 금지. 근거가 `약함`이거나
> `근거없음`인 항목에 성지 딱지를 붙이지 않는다. 새 성지를 지어내지 않는다.
>
> 조사 출처: 2026-09 K-콘텐츠 사실검증 보고서(launch_extended_search_task 결과).
> venues.js 52곳(id 기준)에 아래 태그를 부여한다. 표에 없는 venue는 `local`이다.

## 태그 스키마
- `kType`: `kfood` | `kdrama` | `kpop` | `kanime` | `landmark` | `local`
- `anchor`: true(방문 동기·성지) | false(연계 로컬 — 성지 주변 소비)
- `kcontent`: 연결된 K-콘텐츠 이름(원문 그대로 · 없으면 빈 문자열)
- `grade`: 근거강도 `강함` | `중간` | `약함` | `근거없음`
- `evidence`: 한 줄 근거(원문 그대로)
- **UI 노출 규칙**: `anchor && grade in (강함,중간)` 인 것만 K-콘텐츠 배지를 단다.
  `약함`·`근거없음`은 배지 없이 일반 로컬 카드로만 노출(성지 주장 금지).

## 1. K-푸드 앵커 (grade 강함 — 서비스의 실질 앵커)
| venue id | kType | anchor | kcontent | grade | evidence |
|---|---|---|---|---|---|
| tongnamujip | kfood | true | 춘천 닭갈비 | 강함 | 춘천 닭갈비는 K-치킨벨트 미식여행상품·막국수닭갈비축제로 제도화된 K-푸드 |
| saemto-dakgalbi | kfood | true | 춘천 닭갈비 | 강함 | 상동 |
| wonjo-charcoal-dak | kfood | true | 춘천 닭갈비 | 강함 | 상동 |
| onefive-dakgalbi | kfood | true | 춘천 닭갈비 | 강함 | 상동 |
| todam-galbi | kfood | true | 춘천 닭갈비 | 강함 | 상동 |
| umi-dakgalbi | kfood | true | 춘천 닭갈비 (블루리본) | 강함 | 블루리본 인증(venues 원문) + 춘천 닭갈비 K-푸드 |
| sandak | kfood | true | 춘천 닭갈비 | 강함 | 춘천식 닭갈비+감자전+막국수 로컬 조합 |
| hakgok-makguksu | kfood | true | 춘천 막국수·닭갈비 | 강함 | 막국수·닭갈비 동시 · 춘천 2대 대표메뉴 |
| saembat-makguksu | kfood | true | 춘천 막국수 | 강함 | 순메밀 막국수 · 춘천 막국수 K-푸드 |
| silbi-makguksu | kfood | true | 춘천 막국수 | 강함 | 상동 |
| nambu-makguksu | kfood | true | 춘천 막국수 | 강함 | 상동 |
| modern-buckwheat | kfood | true | 춘천 막국수 | 중간 | 춘천 메밀 현대적 재해석(venues 원문) |
| chuncheon-makguksu-museum | kfood | true | 춘천 막국수 (체험박물관) | 강함 | 막국수체험박물관 실재 · 만들기 체험 운영 |

## 2. K-드라마 촬영지 (검증분만 anchor)
| venue id | kType | anchor | kcontent | grade | evidence |
|---|---|---|---|---|---|
| gongjicheon | kdrama | false | (겨울연가 관광벨트 인접 · 촬영지 아님) | 근거없음 | 공지천=겨울연가 촬영 근거 없음 · '촬영지'로 표기 금지 · 막국수닭갈비축제 개최지로만 |
| jungdo-mullegil | kdrama | false | (중도 일원 · 겨울연가 연인의숲 인접) | 약함 | 겨울연가 메타세쿼이아길은 중도이나 물레길과 동일지점 근거 불충분 |

> 주의: venues.js에는 겨울연가 실제 촬영지(춘천고·중앙시장·소양로 준상이네집·중도
> 메타세쿼이아길)가 개별 항목으로 **없다.** 이들을 성지로 쓰려면 TourAPI로 신규
> 스팟을 조회해 추가해야 한다(하드코딩 신규 생성 금지 · §데이터 규율). 조사 근거:
> NHK 다큐·강원도민일보. 추가 시 grade=강함 부여 가능.

## 3. K-팝 연고 (셀럽 고향 — anchor 후보, 초상권 주의)
| 대상 | kcontent | grade | evidence | 서비스 반영 |
|---|---|---|---|---|
| 뉴진스 민지 | 춘천 출생·성장 | 강함 | 2004 춘천 출생, 중1까지 성장, 춘천 실용음악학원 수강 | 셀럽 코스는 학교·학원 '외관'만 · 사생활/초상권 검토 후 · venue 신규조회 |
| 오마이걸 승희 | 춘천 출신 | 강함 | 천전초·유봉여중 졸업 | 상동 |
| 오마이걸 비니 | 춘천 출신 | 강함 | 부안초·봉의여중·춘천여고 졸업 | 상동 |

> venues.js에 셀럽 연고 스팟은 없음. 별도 코스로 확장 시 신규 조회. 초상권·사생활
> 이슈로 v5 MVP에서는 '설문 취향 태그'로만 쓰고 물리적 성지 핀은 보류 권장.

## 4. 애니메이션·캐릭터
| venue id | kType | anchor | kcontent | grade | evidence |
|---|---|---|---|---|---|
| animation-museum | kanime | true | K-애니메이션 (전시·체험 허브) | 강함 | 국내 유일 애니메이션 전문 박물관 · GICA 운영 · 애니타운페스티벌(1997~) |

> '춘천 제작 유명 애니메이션'은 근거없음 → '전시·체험 허브'로만 표기, 특정 제작작 주장 금지.

## 5. 셀럽 랜드마크
| venue id | kType | anchor | kcontent | grade | evidence |
|---|---|---|---|---|---|
| infield | landmark | false | 손흥민 (스포츠파크 내 카페) | 중간 | 손흥민 춘천 출신(후평동·춘천고) · 손흥민 체육공원 실재 · Infield는 파크 내 카페(venues 원문) |

> 손흥민 체육공원 자체는 venue에 없음(동면 감정리). 앵커로 쓰려면 신규 조회. Infield는
> 연계 카페로만.

## 6. 기타 명소 (landmark · anchor=false)
| venue id | kType | 비고 |
|---|---|---|
| skywalk | landmark | 소양강 스카이워크 · K-콘텐츠 근거 없음 · 경관 명소 |
| soyang-dam | landmark | 소양강댐 · 상동 |
| soyang-maiden | landmark | 소양강처녀상 · 상동 |
| art-circle | landmark | 소양아트서클 · 상동 |
| gangchon-railpark | landmark | 강촌레일파크 · 드라마 촬영 근거 약함 · 외국인 급증 관광지로만 |
| chuncheon-national-museum | landmark | 국립춘천박물관 · 2024 입장객 120%↑ |
| legoland | landmark | 레고랜드 · **덴마크 IP · K-콘텐츠 아님** · kType=landmark 고정 · K배지 금지 |

## 7. 나머지 전 항목 = local (kType=local, anchor=false)
카페·베이커리 계열(gamja-farm, soul-roastery, hwadong-2571, earth17-cafe, mom-in-garden,
saempildeu-cafe, choilang, character-indeo, cafe-nas, arcape-coffee, santorini, farmers-garden,
doldam-cafe, sinbuk-coffee, slow-day, cafe-de-220volt, carpe, dancing-caffein, salon-jade)
및 기타 식당(baekil-kalguksu, hoeyeongru, haneoul, hwadon-garden, himalayan-indian,
keunjip-hanwoo, pyeongyang-naengmyeon, san-squid): 전부 `local`. 성지 배지 없음.
추천 엔진에서 앵커 성지 주변 '연계 로컬'로만 가중.

## 8. 사업계획서/서비스 카피 금지사항 (검증 반증분)
- 우주소녀 다원 = 서울 강남 출신 → **춘천 아님. 쓰지 마라.**
- 배우 신하균 = 서울 중랑구 → 쓰지 마라.
- 배우 박소담 = 서울 송파구 → 쓰지 마라.
- 여자친구(GFRIEND) = 춘천 출신 멤버 없음(화보만 춘천 촬영) → 멤버 연고로 쓰지 마라.
- 공지천 '겨울연가 촬영지' → 촬영 근거 없음. '촬영지' 단어 쓰지 마라.
- 레고랜드 'K-콘텐츠' → 덴마크 IP. K-콘텐츠로 분류 금지.
