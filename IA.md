# IA.md — Bomnae Helper 정보 구조 v3

## 0. 서비스 한 줄 정의

**"도달할 수 없는 추천은 그림일 뿐이다."**
Bomnae Helper는 두 개의 교통 문제를 하나의 헬퍼로 해결한다:
- **Gate** — 한국 공항에 내린 순간부터 춘천까지 (경로 + Hands-Free 짐 보내기)
- **Loop** — 춘천 안 외곽 분산 명소를 캐릭터 브랜딩 고정 순환 라인 3개로 (좌석 예약 + 선주문 대행 + 차내 스토리)

MVP 범위 = **예약·라인맵 플랫폼(만들 수 있는 것) + 파일럿 1회 운행 증빙(증명할 수 있는 것).**
플랫폼은 우리가 짓고, 운행은 전세버스·여행상품 등록·DRT 제휴 — 우리는 운수회사가 아니라 플랫폼+상품 기획사다.

## 1. 사이트맵

```
/                       Home — 히어로 캐러셀 + 두 문제 선언 + Gate 진입 + 라인 3개
/gate                   Gate 플래너 — 공항→춘천 오늘의 최적 경로 (GateJourney 인터랙션)
/hands-free             Hands-Free — 짐 먼저 보내기 (v3.1 최상위 승격: 성격·과금이 달라 독립)
/loop                   Loop — 라이브 라인 맵 (시그니처 화면, 오버레이 프리뷰)
/loop/:lineId           라인 상세 — 좌 콘텐츠 + 우 스티키 예약 패널(G-Local 이식)
/loop/:lineId/book      예약 확인 단일 페이지 (v3.1: 3스텝 폐지)
/ticket/:bookingId      티켓 / 예약 확정
/about                  브랜드 상세 페이지 (v3.1: Pilot 대체. 파일럿 증빙은 §Proof 섹션으로 흡수)
/legal/privacy          개인정보처리방침 (새 탭 진입)
/legal/terms            이용약관 (새 탭 진입)
*                       404
```

내비게이션 노출: **Gate / Loop / Hands-Free / About** (4개). Home은 로고. 상세·예약·법적 페이지는 플로우·푸터 진입. `/gate/hands-free`와 `/pilot`은 각각 `/hands-free`·`/about`으로 replace 리다이렉트(구 링크 생존).

## 2. 페이지별 구조

### 2.1 Home `/`
1. **Hero (v3.1 캐러셀)**: 풀블리드 **HeroCarousel** — 실사진 3장(호수·라인 풍경, `public/images/hero-1..3.jpg`, 촬영 전까지 무료 스톡 자연 사진으로 채움) 크로스페이드 6초(opacity 400ms, scale 금지, reduced-motion 시 1장 고정) + scrim + 하단 도트 인디케이터. display 타이포 "You can't visit what you can't reach." 서브: "Airport to Chuncheon, and everywhere inside it." CTA 2개: "Find my route"(→/gate), "See the lines"(→/loop).
2. **Problem strip**: 팀 리서치 근거 한 문장 — "4 of 5 researchers, independently, reached the same conclusion: the problem isn't content — it's reach." (숫자 Kanit Bold)
3. **Gate entry card**: 터미널·시간 미니 입력 → 제출 시 /gate로 쿼리 전달.
4. **Lines preview (v3.1)**: 라인 카드 3장 — 사진 자리 대신 **lucide 아이콘 배지**(라인 컬러 소프트 배경 원 + 아이콘: potato=`Sprout`, dakgalbi=`Flame`, lake=`Waves`) + 3개 정류장 + 소요·가격 → /loop/:lineId. 무보더+shadow.sm.
5. **How it works**: 3단계(Reserve a seat → We pre-order ahead → Arrive, it's ready). 선주문 대행이 핵심 차별점임을 여기서 명시.
6. **Proof strip**: 실운행 썸네일 + "We already ran it." → **/about#proof** (v3.1: Pilot 페이지 흡수).
7. Footer.

### 2.2 Gate `/gate`
1. **헤드 카피 아래 GateJourney (v3.1 시그니처 인터랙션)**: 좌측 lucide `Plane`(공항) 원형 배지, 우측 `Building2`(춘천) 원형 배지, 그 사이 수평 트랙 선. 선택된 모드에 따라 `TrainFront` 또는 `Bus` 아이콘이 좌→우로 **천천히(약 8s linear 무한, reduced-motion 정지)** 이동. 모드 카드 선택과 양방향 동기. PATTERNS §12.
2. 입력: 터미널(ICN T1 / T2 / GMP) + 도착 시각 + 날짜 — **전부 FieldSelect**(DESIGN §7, Skyscanner 패턴): 클릭 시 아이콘+장소/시간 리스트 드롭 카드, 시간 라벨은 사전 키(en에서 오전/오후 누수 금지). 제출 → 결과 aria-live 갱신.
3. 결과: **경로 옵션 카드 2~3개** (룰 기반 정적 시간표 — MVP는 실시간 API 없음):
   - A. Rail: AREX → Seoul Stn → Yongsan → ITX-Cheongchun → Namchuncheon
   - B. Direct bus: 공항 → 춘천시외버스터미널
   - 각 카드: 총 소요·요금·환승 수·첫 탑승 가능 편(도착시각 + 입국수속 버퍼 60분 반영).
4. 선택 시 **단계별 리스트**: leg마다 사진 1장 + 방향 문장 + 소요. (사진은 PLACEHOLDER → 현장 촬영으로 교체)
5. **Hands-Free 크로스셀 카드**: "Send your bags ahead. Travel with just your body." → **/hands-free**. 일본 테부라(手ぶら観光) 표준 언급은 카피 한 줄로.

### 2.3 Hands-Free `/hands-free` (v3.1 독립 페이지 — 헤더 노출)
1. **페이지 헤드라인 섹션**: h1 "Send your bags ahead." + 서브 카피(공항 카운터에서 짐을 부치면 춘천 숙소에 먼저 도착한다, 기존 수하물 딜리버리 사업자 제휴, 우리는 춘천 구간 예약 레이어라는 점을 정직하게) + 3단계 미니 스트립(Drop at airport / We carry to Chuncheon / Meet it at your stay, lucide 아이콘).
   레이아웃 v3.1: **모바일 고정폭 느낌 폐지** — lg+에서 `1fr_380px` 2컬럼(좌 설명·단계·FAQ 2~3개, 우 폼 카드), 컨테이너 마진 정상 준수.
2. 폼: 수하물 개수(Stepper) / 도착 터미널·날짜 / 춘천 숙소 주소 / 연락 이메일.
3. 요금 표시(개당, DRAFT) → 확인 = 로그인 게이트 → 접수 완료 화면(접수 코드).

### 2.4 Loop `/loop` — 시그니처
1. **풀블리드 MapLibre 맵**: 맵만 마진 무시 전폭·전고(헤더 아래 100%). 3레이어 라인 + draw-on + 정류장 마커 + 부드러운 셔틀(DESIGN §11). 헤더는 여기서도 불투명(DESIGN §6).
2. **지도 위 라인 카드 (v3.1 — 네이버맵 패턴)**: 별도 사이드 컬럼 폐지. 라인 3장은 **컨테이너 마진 안쪽, 지도 위에 뜨는 글래스 카드**(blur 허용면, radius lg, shadow lg) — 데스크탑 좌측 세로 스택(폭 340px), 모바일 하단 가로 스크롤 스냅 카드. 카드: 아이콘 배지 + 라인명 + 소요·가격 + 정류장 3개 미니 리스트 + "View line". 선택 → flyTo + 타 라인 40% 투명. 정류장 리스트는 키보드 완전 지원(지도 대체 경로).
3. **StopPopup**: 마커/리스트 선택 시 해당 정류장 위 white 카드 팝업(이름·한 줄·체류시간·View line). DESIGN §11.
4. **LinePreviewOverlay (v3.1 — 페이지 이탈 없는 미리보기)**: "View line" 클릭 시 라우팅하지 않는다. 지도가 scrim 40%로 어두워지고 그 위 **리퀴드 글래스 패널**(우측 고정 폭 420px, 모바일 풀시트)이 spring으로 등장: LineHero 요약(아이콘·라인명·소요·가격) + 정류장 수직 미니 노선도 + 선주문 한 줄. **Stories·Departures·호스트·Reserve seats 블록은 넣지 않는다** — 그건 상세 페이지의 일. 하단 CTA 단 하나: "Book and see details" → /loop/:lineId. 닫기 = 바깥 탭·Escape·X.

### 2.5 라인 상세 `/loop/:lineId` (v3.1 — G-Local 레이아웃 이식)
전체 레이아웃: lg+ `grid-cols-[1fr_380px] gap-12`. **좌측 = 콘텐츠 스크롤, 우측 = 스티키 예약 패널(`sticky top-24`, 스크롤 내내 동행)**. 모바일: 콘텐츠 아래 하단 고정 CTA 바 → 탭 시 BottomSheet로 패널 내용.
1. **Line hero**: 라인 컬러 소프트 면 + 캐릭터 이미지(콘텐츠로만) + 라인명(Kanit Bold) + 소요·정류장 수·가격.
2. **Stop strip**: 수직 노선도(라인 컬러 세로선 + 정류장 노드). 정류장마다: 사진, 이름(EN/KR), 체류 시간, **선주문 대행 내용**("Your gamja-bbang is ready when you arrive" / "Grill pre-heated 15 min before arrival").
3. **Story clips**: 차내에서 보게 될 사장님 스토리 미리보기(썸네일 + 20자 요약). 감자밭 스토리가 대표 자산. 클립은 자막 상시.
4. **우측 스티키 예약 패널 (StickyBookPanel)**: 가격(Kanit Bold)/기준 표기 → DepartureCalendar(가격 인라인 + 상태 배지: 출발확정 green / 출발유력 yellow / 마감 — yountravel 검증 패턴) → 회차 Chip(10:00/13:00/16:00 DRAFT) + 남은 좌석 → Adult/Child Stepper → 디바이더 → 실시간 합계 → "좌석 = 매칭" 한 줄("You'll ride with N other travelers") + 호스트 이름 → CTA "Reserve seats". **캘린더·인원·합계가 전부 이 패널 안** — 좌측 본문에 중복 배치 금지.
5. CTA → /loop/:lineId/book?date=&time=&adult=&child= (선택값 전부 쿼리 전달).

### 2.6 예약 확인 `/loop/:lineId/book` (v3.1 — 단일 페이지, 3스텝 폐지)
선택은 이미 상세 스티키 패널에서 끝났다. 이 페이지는 **확인 한 화면**:
1. 좌측: 요약 카드 — 라인·날짜·회차·미팅포인트·인원·동승 인원·호스트·선주문 안내. 각 항목 옆 "Edit" 텍스트 버튼 → 상세 페이지로 복귀(쿼리 보존).
2. 우측(lg+) 또는 하단: 합계 + 확정 CTA. **확정 버튼에서만 로그인 게이트**(Google, 모달) → POST → /ticket/:id.
3. 성공: **라인 스탬프 드롭 애니메이션(scale 화이트리스트 1/2)**.
- 쿼리 미비(날짜·회차 없음) 진입 시 상세로 replace 리다이렉트. 게스트 상태는 쿼리+in-memory Context(localStorage 금지).
- 결과: 상세(선택) → 확인(1페이지) → 티켓. 사용자가 만나는 화면 총 2장.

### 2.7 티켓 `/ticket/:bookingId`
- navy 면 티켓 카드: 라인 컬러 스트라이프, **예약 코드 6자(Kanit Bold, 큰 숫자)**, 날짜·회차, 미팅포인트(지도 미니 링크), 인원, 호스트, "What you'll watch on board" 클립 1개.
- 공유: `navigator.share({files})` → 실패 시 다운로드 폴백. QR은 로드맵(라이브러리 추가 금지).
- 하단: "2 lines left to complete Chuncheon." — 남은 라인이 곧 재방문 이유(CJM Revisit 구조 내장).

### 2.8 About `/about` (v3.1 — 브랜드 상세 페이지, Pilot 흡수·대체)
목적: 대회 모의 크라우드펀딩 대응 롱폼. 레퍼런스: Return Hound(문제 넘버링·Before/After·단계 스트립·신뢰 지표), 제품 상세페이지 3종(긴 스크롤 스토리텔링). **카피 전문은 BRAND_COPY.md — 지어내지 말고 그대로 사전에 이식.** 섹션 순서 고정:
1. Brand hero: 로고 + "We move you to the story." + 실사 배경.
2. Problem, before you arrive: 넘버링 카드 3(환승 미로·수하물·정보 단절).
3. Problem, after you arrive: 넘버링 카드 3(라스트마일·대기줄·이야기 없는 소비).
4. What we run: 3필러 카드(Gate / Loop / Hands-Free) — 아이콘 배지, 각 페이지 링크.
5. How a day works: 수평 단계 스트립 5(Reserve → We pre-order → Ride with stories → Arrive, it's ready → Stamp the line).
6. **Proof (`#proof`, 구 Pilot 전체 흡수)**: 실운행 영상(자막 상시) + 지표 3(Kanit Bold, 실측 PLACEHOLDER) + 갤러리 + "This wasn't a mockup. We ran the line."
7. Local stories: 사장님·정류장 스토리 카드(감자밭 대표).
8. Stay longer: 1일 → 1박2일 → 롱스테이 확장 로드맵 타임라인.
9. Business model: BMC 9블록 그리드(무보더 카드, 요약 문구) + 수익 구조 한 줄(좌석 마진 + Hands-Free 수수료 + 지역 제휴).
10. Sustainability and beyond: 지역 상생·글로벌 확장(태국어 지원이 그 증거) 카피.
11. CTA 밴드: "Back the first line." → /loop + 크라우드펀딩 예정 문구.

### 2.9 404
- unDraw(단색) + "This stop doesn't exist." + Home CTA.

## 3. 핵심 플로우

1. **Gate**: 입력 → 옵션 비교 → 단계 안내 → (선택) Hands-Free.
2. **Hands-Free**: 폼 → 로그인 게이트 → 접수 코드.
3. **Loop 예약 (v3.1)**: 맵 탐색 → LinePreviewOverlay(페이지 이탈 없음) → 상세(스티키 패널에서 날짜·회차·인원까지) → 확인 1페이지 → 로그인 게이트 → 티켓 → 공유. 화면 수 2.
- 읽기 전 구간 게스트. **쓰기(예약·접수 확정)에서만 로그인** — Guest-first.

## 4. 데이터 IA

```
lines        id(potato|dakgalbi|lake), name_en/ko, color_token, duration_min,
             price_adult, price_child, price_weekend_delta, host_name, character_img
stops        id, line_id, order, name_en/ko, lng, lat, stay_min,
             preorder_en/ko(선주문 대행 문구), photo, story_id?
stories      id, title_en/ko, summary_en/ko, video_url?, thumb
departures   id, line_id, date, time, capacity(12), booked_count, status(confirmed|likely|closed)
bookings     id, code(6자), departure_id, user_id, adults, children, total, status
handsfree    id, code, user_id, terminal, date, bags, address, total, status
users        id, google_sub, email, name
gate_routes  (정적 데이터 파일) option, legs[], duration, fare, first_available 규칙
```
- PHASE 1은 전부 `src/data/*.js` 목데이터. PHASE 3에서 서버 이관(스키마 동일).
- **좌표는 전부 APPROX 플래그** — 3~4일차 현장탐방에서 GPS 실좌표 수집 후 교체(RUNBOOK 과제).
- 가격은 DRAFT — 택시 대비 반값이 세일즈 포인트. 초안: Adult ₩18,000 / Child ₩12,000 / 주말 +₩3,000, Hands-Free ₩25,000/개. 5일차 BM 검토에서 확정.

## 5. 레퍼런스 Teardown — 대전 빵티칸 순례버스 (yountravel.com/master/59425)

빵아저씨 모델의 실제 판매 페이지. 우리 설계에 반영한 것:

**채택한 검증 패턴**
- 날짜 캘린더에 **가격 인라인**(주중 4.0만/주말 4.5만 차등) + **출발확정/출발유력** 상태 → DepartureCalendar에 그대로.
- 성인/아동/유아 **인원 스테퍼** + 실시간 합계 → 예약 Step 2.
- 미팅포인트 고정(대전역 1번출구) + 사전 단톡방 → 미팅포인트 명시 + 호스트 연락 구조.
- "순례 인증서" 발급 → 라인 스탬프·완주 카드(CJM Spread)와 동일 장치, 선례 확인됨.
- **법적 구조**: 여행사(통신판매 등록) 경유 국내여행 특별약관 상품으로 판매 — 우리가 선언한 "여행상품 등록" 경로의 살아있는 선례. 피칭에서 인용.

**실패 지점 (실사용자 리뷰 — 우리 차별화의 근거)**
- 45인 대형버스 → 소규모 가게에 단체가 몰려 **대기줄이 오히려 길어지고 인기 품목 품절**. 사용자 스스로 "20인 미니버스" 제안, 운영자도 40인 미만으로 축소 운영 중이라고 답변.
- → Bomnae Helper: **12인 밴 + 선주문 대행**이 정확히 이 지점을 해결. "도착하면 웨이팅 없이 나와 있다"는 대형버스 모델이 구조적으로 못 하는 약속이다. 피칭 슬라이드 1장 감.

## 6. CJM 루프 매핑

Discover(예약 가능한 춘천이 처음으로 영어 채널에 존재) → Encounter(Gate가 도달 장벽 제거) → Experience(Loop + 차내 스토리) → Revisit(3개 라인 중 1개만 탔다 — 티켓 하단 "2 lines left") → Spread(동승 사진 + 라인 완주 스탬프 공유).

## 7. PLACEHOLDER 목록 (코드에 `// PLACEHOLDER — verify on site` 주석 필수)

정류장 GPS 좌표 전부 / Gate 시간표·요금 / 라인 가격 / 회차 시각 / 히어로 실사진 / 스토리 클립 영상 / 파일럿 지표 / 호스트 이름 / 봄내크루 캐릭터 에셋(배경 제거본).

---

## 8. v3.2 개정 (2차 크리틱) — 충돌 시 이 섹션이 이긴다

### 8.1 내비게이션
순서·명명 변경: **About | Getting Here(/gate) | Bag Delivery(/hands-free) | City Lines(/loop)**. About이 최좌측. 라우트 경로는 불변, 표시명만 i18n(DESIGN §16.7).

### 8.2 Getting Here(/gate) 변경
1. **출발지 = 사용자 현재 위치가 1옵션**: FieldSelect 첫 항목 "Use my current location"(lucide LocateFixed, geolocation 1회 조회) + 공항 3개(ICN T1/T2/GMP) 수동 선택 병존. 위치 거부 시 공항 선택으로 자연 폴백(에러 톤 금지).
2. **날짜 = 달력.** 시간처럼 리스트로 하루하루 내리는 방식 금지. FieldSelect 트리거를 누르면 우리 디자인 시스템 기반 **월 캘린더 팝 카드**(DepartureCalendar와 동일 문법: 요일 헤더, 오늘 표시, 과거 비활성)에서 날짜 선택. PATTERNS §19.
3. **Hands-Free 크로스셀 카드 삭제**("Send your bags ahead…" 섹션 통째). 헤더 진입으로 일원화. Bag Delivery 페이지 안에는 "선택 사항(Optional)" 명시 배지 + "짐 없이도 모든 라인 이용 가능" 한 줄(§8.4).
4. **도착 감지 상태 카드**(§8.5의 진입점): 플래너 결과 아래, 주 기능 방해 없는 위치.

### 8.3 City Lines(/loop)·라인 상세 변경
1. 초기 지도: 라인 비노출 + 상단 라인 칩 3개(DESIGN §16.9). 칩 선택 → 해당 라인만 등장.
2. 정류장 hover 즉시 StopPopup. 좌측(데스크탑) 라인 카드 스택은 선택된 라인의 정류장 리스트로 전환, 내부 스크롤은 스크롤바 비표시.
3. **라인 상세 = yountravel 문법 이식**: 좌측에 **2개월 나란히 달력**(각 날짜 셀 아래 가격 인라인, 상단 우측 범례 "출발확정 ● / 출발유력 ●" 원색 도트), 달력 아래 **회차 리스트**(예약마감 배지 포함, 전부 펼침 — 클릭해야 보이는 숨김 금지). 우측 스티키 패널 = "선택 중인 출발"(라인명·날짜·회차·인원 Stepper·합계·CTA). 이미지 박스 placeholder가 비어 뜨는 현상 금지 — 이미지 없으면 렌더하지 않는다.
4. 다크패턴 제거 원칙: 가격·잔여석·마감 여부는 항상 1뷰에 노출. 스텝을 눌러야 다음 정보가 보이는 구조 금지.

### 8.4 Bag Delivery(/hands-free)
- 헤드라인 옆 **"Optional" Chip**(primary 보더 세컨더리 버튼 스타일 아님, StatusBadge 문법) + 서브 카피에 "모든 라인은 짐 없이도, 짐과 함께도 탈 수 있습니다. 이 서비스는 선택입니다." 명시.

### 8.5 도착 전환 (Getting Here → City Lines) — 신규 플로우
목적: 두 기능이 "춘천으로 이동 → 도착 → 시내 여정 시작" 하나의 여정으로 느껴지게.
1. Getting Here에 상태 카드: 제목 "춘천 도착 후에도 여정을 이어갈까요?" / 설명 "춘천에 도착하면 위치를 확인해 다음 여정 시작 여부를 알려드릴게요." / 주 버튼 "도착 확인 켜기" / 보조 링크 "위치 정보 사용 안내".
2. 버튼 → **사전 설명 모달 먼저**(브라우저 권한 팝업 직행 금지): 제목 "도착 여부를 확인할게요", 본문 "춘천에 도착했을 때 다음 여정 시작 여부를 알려드리기 위해 현재 위치를 사용합니다. 위치는 도착 여부 확인에만 사용돼요.", 주 "위치 사용 허용" / 보조 "다음에 할게요" / 각주 "설정에서 언제든지 위치 확인을 끌 수 있어요." 허용 시에만 실제 권한 요청.
3. 활성 상태: 카드가 "춘천 도착을 기다리고 있어요" + "도착 확인 끄기". 좌표·거리 수치 비노출.
4. 춘천 권역 진입 감지(PATTERNS §21) → **도착 모달**: 상태라벨 "CHUNCHEON ARRIVAL"(Kanit) / 제목 "춘천에 도착했어요." / 본문 2문장 / 주 "여정 이어가기"(→/loop) / 보조 "지금은 괜찮아요" / 우상단 닫기 / 각주 "현재 위치를 기반으로 시내 이동과 경험을 돕습니다."
5. 승인 시 **전환 연출**: 직선(Getting Here 상징)이 중앙으로 모여 원형 궤적(라인 심벌)으로 모핑, 600~900ms, 이후 상단 "LINES ACTIVE" 상태 1.5s 표시. reduced-motion 즉시 전환. 과한 로딩·브랜드 애니메이션 금지.
6. 예외: 거절 시 재알림 금지 + 소형 "여정 이어가기" 버튼 잔존 / 권한 거부 시 "위치 권한 없이도 직접 도착을 확인할 수 있어요" + 수동 "춘천에 도착했어요" 버튼 + "위치 설정 다시 보기" / 측위 실패 시 "현재 위치를 확인하지 못했어요" + 다시 확인·수동 확인 / 권역 밖 "아직 춘천 밖에 있어요"(거리 비노출, 활성 유지).
7. 신뢰 원칙: 위치는 도착 판정에만, 필수 조건화 금지, 전 모달 키보드·포커스 지원, 버튼 문구는 실행 결과형("허용/확인" 단독 금지).
8. **웹 한계 정직 고지**: 감지는 탭이 열려 있는 동안만 동작(백그라운드 푸시 아님) — 카드 각주에 "화면이 켜져 있는 동안 확인해요" 1줄.

### 8.6 지도 고도화·AR (실험 기능, 별도 프롬프트)
- openfreemap 위 장식·POI 앵커 레이어(DESIGN §16.9), GTFS·실시간 교통은 로드맵(이번 범위 아님).
- **AR 정류장 뷰**: StopPopup에 "View in AR" 진입(모바일 + 센서 지원 기기에서만 노출). `/loop/ar/:stopId` 라우트, locar.js 0.2(three ^0.175 동반)로 카메라 뷰 위에 해당 정류장 방향 마커 렌더. iOS 센서 권한 UI, Firefox·데스크탑은 진입점 자체 비노출. 실패 시 지도 복귀. 실험 배지 "Beta" 명시.
- 채택 보류(정직 스코핑): Leaflet·OpenLayers(MapLibre와 중복), GraphHopper(자바 서버 자가호스팅 — MVP 불가), FullCalendar(자체 캘린더와 중복), TREK·AugmentTour(구조 참고만).

---

## 9. v4 피벗 — GTS 조립형 투어 (충돌 시 이 섹션이 이긴다)

### 9.0 서비스 재정의
"춘천까지의 경로 추천 + 춘천 안에서의 조립형 투어" 양대 축. 고정 캐릭터 라인 상품(City Lines·좌석 캘린더·라인 상세·구 예약 플로우)은 **잠정 퇴역**: 라우트에서 제거하되 파일은 deprecated 주석으로 보존(삭제 금지 — 재활용 예정). 지도는 사라지는 게 아니라 **투어 조립의 최종 결과 화면**으로 이동한다.

### 9.1 내비게이션 v4
**About | Getting Here | Make GTS** (3개). Bag Delivery 헤더 항목 삭제(기능은 §9.3에 흡수). 리다이렉트: `/loop*` → `/gts`, `/hands-free` → `/gts/setup`. `/gate`는 유지.

### 9.2 Getting Here 개편 — 양방향 위치 기반 플래너
1. **방향 토글 2탭**: "To Chuncheon"(기본) / "From Chuncheon". 탭 전환 시 출발·도착 필드 역할 반전, 레이아웃 이동 없음(언어 동형 원칙과 동일하게 구조 고정).
2. To Chuncheon: 출발지 = FieldSelect ["Use my current location"(사전 설명 모달 → geolocation, PATTERNS §21 동의 패턴 재사용) + 주요 거점 수동 목록(공항 2·서울권 역/터미널·부산 등, §29 허브 데이터)] / 도착지 = **춘천역 or 춘천시외버스터미널 2택 고정** / 날짜(CalendarField) + 시간(FieldSelect).
3. From Chuncheon: 출발지 = 춘천역·터미널·현재 위치 / 도착지 = 허브 목록(공항·주요 도시) / 동일 날짜·시간.
4. 결과: 경로 옵션 카드(기차·버스·복합) — **§29 큐레이션 허브 데이터에서만 생성**. 구체 출발시각 표기 금지, "약 N분 · 배차 간격 안내" 수준 + PLACEHOLDER 마킹. 실시간 API(ODsay·TAGO)는 로드맵 명시.
5. **RouteTimeline(세로)**: 구 수평 GateJourney(비행기→건물 주행 애니메이션) **삭제**. 대체 = 세로 타임라인: 좌측 수직 라인 + 단계마다 원형 노드(white 원 + shadow.sm + lucide 아이콘: 출발지 MapPin/Plane, 지하철·전철 TrainFront, 기차 TrainFront, 버스 Bus, 도보 Footprints, 도착 Building2), 노드 우측에 단계명·소요·비고. **이동 애니메이션 없음**(정적, 진입 시 카드 리빌만).
6. 도착 감지 카드(§8.5)는 To Chuncheon 결과 하단에 유지.

### 9.3 `/gts/setup` — 인원·짐·차량 매칭 (신설, Bag Delivery 흡수)
1. 인원 Stepper(1~12) + "짐 보관이 필요한가요?" 토글(캐리어 없음/숙소에 두고 옴 케이스 카피로 안내). Optional 성격 카피 유지.
2. **차량 매칭 규칙(결정론, data/gts/vehicles.js)**:
   - 짐 보관 필요: 인원 ≤2 → 택시형 / ≥3 → 밴형(짐 싣고 함께 이동)
   - 짐 보관 불필요: 인원 ≤4 → 택시형 / ≥5 → 밴형
3. 매칭 결과 카드: 차량 아이콘(택시형 = lucide `CarFront` — TAXI 문자 있는 아이콘 금지, 밴형 = `Bus`; **설치된 lucide-react에 실존하는지 확인 후 사용, 더 밴에 가까운 아이콘이 실존하면 교체 허용·보고**) + 요금 구성(기본요금 DRAFT + 짐 보관 시 추가요금 DRAFT, data 파일 값) 실시간 표시.
4. CTA → `/gts/build`.

### 9.4 `/gts/build` — Make GTS 취향 조립
1. **Step 0 식사 플랜 3택**: 식사 안 함 / 점심 코스 / 점심+저녁 코스.
2. **Step 1 식사 선택**(플랜 none이면 스킵): 춘천 로컬 푸드 브랜드 카드 그리드 — lg 4열×2행 8장, 모바일 2열. 카드: 사진(없으면 렌더 안 함, 빈 박스 금지)+브랜드명 700+한 줄+카테고리 Chip. **새로고침 버튼**(lucide RefreshCw, 세컨더리 버튼): 풀에서 다음 8개 로테이션. 선택 규칙: lunch=정확히 1, lunchDinner=정확히 2(고른 순서 = 점심→저녁, 카드에 "Lunch"/"Dinner" 순서 배지), 재클릭 해제.
3. **Step 2 이후 = 합산 정확히 2픽**: 음식 공간(식사 제외 라이트 로컬 브랜드: 카페·베이커리·디저트) 탭 + 액티비티(소양강처녀상·아트서클·스카이워크·카누·중도 물레길 등) 탭, 동일 8장+새로고침 로직. 음식공간 2 / 액티비티 2 / 1+1 모두 허용, 각 픽 = 2시간 슬롯. 선택 카운터 상시 노출("2개 중 N개 선택"), 초과 시 먼저 고른 것 유지 + 안내(자동 해제 금지).
4. 데이터: `src/data/gts/venues.js` — 실존 확보 브랜드(감자밭·소울로스터리·통나무집 닭갈비 등 기확보분) + 나머지는 **"Mockup 1", "Mockup 2"… 명시 표기 카드**(가짜 실명 창작 절대 금지).
5. 하단 고정 진행 바: 현재 스텝·선택 요약·다음 버튼(조건 미충족 시 비활성+사유 문구).

### 9.5 `/gts/route` — 동선 지도 결과
선택 완료 → 지도에 일정 순서대로 번호 핀(1 점심 → 2 슬롯1 → 3 슬롯2 → 4 저녁, 플랜별 가감) + primary 단일 선 draw-on 연결(§13 3레이어 재사용). 핀 hover/탭 = 장소 팝업. 좌측(모바일 하단) 일정 타임라인 카드(각 2시간, 시각은 12:00 기점 DRAFT). CTA "이 동선으로 진행" / 세컨더리 "다시 조립"(build 복귀, 선택 보존).

### 9.6 `/gts/checkout` — 확인·결제
1. 선택 요약(차량·인원·짐·식사·픽 2·동선 미니맵 스냅샷 또는 순서 리스트) + 금액 내역(차량 기본 + 짐 추가 + 인당 요금 DRAFT) 전부 1뷰 노출(다크패턴 금지 원칙).
2. **최종 하차 지점: 텍스트 입력**(필수, placeholder "예: 춘천역, 숙소 주소") — 지오코딩 없음, 원문 저장.
3. 결제 버튼에서 로그인 게이트(Guest-first 유지) → 결제 화면은 **프로토타입 결제**(Terms §2와 일치: 실결제 없음 고지 문구 포함, 확정 시 예약 생성) → 성공 스탬프 → 티켓(기존 Ticket 재활용, GTS 내역 표시로 확장).
4. 데이터 모델 추가(서버 확장 대비): `gts_bookings(id, user_id, party, luggage bool, vehicle_type, meal_plan, picks jsonb 순서 보존, dropoff_text, total, created_at)`.

### 9.7 스코프 밖 (이번 v4에서 하지 않는 것)
개인화 추천 알고리즘·취향 학습, 실시간 교통 API, 실결제(PG), 다일정(1박 이상) 조립, AR 진입점 이관(구 /loop/ar — GTS 결과 지도로 옮기는 건 후속).

---

## 10. v4.2 개정 (홈·플래너·GTS UX 전면) — 충돌 시 이 섹션이 이긴다

### 10.1 명명 재변경 + 내비 4개
Getting Here/Make GTS 직역 폐기. **About | Trip Planner(/gate) | Tour Builder(/gts) | Reviews(/reviews)**. KR: 소개 | 길찾기 | 코스 만들기 | 후기. th 의미역. 라우트 불변, i18n만.

### 10.2 Home 재건 (v4 정합)
섹션 순서: ①Hero ②서비스 진입 카드 2장 ③How it works(GTS 기준 재작성) ④Reviews 스트립 ⑤Proof 스트립 ⑥Footer.
- **삭제**: "4/5 리서처" 스탯 스트립 통째, 시내 라인 3장 섹션, 홈 내 미니 플래너 폼(공항만 나오던 것), /loop 링크 전부.
- Hero 카피 교체(BRAND_COPY §12): EN h1 "Chuncheon, on your terms." sub "One trip, zero missing links. Plan the ride in, then build your day inside." / KR h1 "춘천을, 당신의 방식대로." sub "가는 길부터 하루 일정까지, 끊김 없는 한 번의 여행." 개행은 컨테이너에 맡김(수동 br 금지 유지).
- CTA 페어: "Plan my route"(primary) + "Build my day"(secondary — white 배경·primary 텍스트·primary 1.5px 보더, §16.8) **동일 높이·패딩, 나란히 정렬**. 좌측 쏠림·폭 불일치 금지.
- 진입 카드 2장: Trip Planner(경로 아이콘+한 줄) / Tour Builder(코스 아이콘+한 줄) → 각 페이지.
- How it works 3스텝 재작성: ①도착 계획을 세운다 ②하루 코스를 조립한다(식사·공간·액티비티) ③차량과 함께 준비된 하루를 만난다(선주문 차별점 유지).
- Reviews 스트립: /reviews 상위 3개 카드 미리보기 + "모든 후기 보기".

### 10.3 Trip Planner 개정
- **칩 토글 폐지 → 수직 2섹션**: "To Chuncheon" 섹션 아래 "From Chuncheon" 섹션. 각자 독립 폼(혼동 제거). 구조·필드 문법 동일.
- **TimeWheel(§38)**: 30분 스텝 리스트 폐지. 애플 시계식 휠 피커(시/분 스크롤 스냅, 분 1단위), **디폴트 = 한국 표준시 현재 시각**, 폼 상단에 "지금 한국은 HH:MM:SS" 실시간 틱 표기.
- **결과 카드 시각 계산(§39)**: 선택한 출발 시각 T 기점으로 레그별 누적 도착 시각을 계산해 표기("14:20 출발 → 15:50 용산 → 17:15 춘천역 도착 예상"). durMin(DRAFT) 합산일 뿐 시간표 생성 아님 — "예상" 라벨 필수. 우측 여백엔 레그별 시각·환승 대기 기본치(10분, PLACEHOLDER) 채움.
- 도착 감지 카드 **삭제** → **데모 도착 시퀀스(§40)**: To Chuncheon 결과에서 "내 경로 찾기" 확정 후 3초 뒤 중앙 모달 "춘천에 도착했습니다" + "나만의 여정을 예약하러 가볼까요?" 주 CTA → /gts, 보조 "나중에". 실측 지오로케이션 분기(§21)는 코드 보존하되 데모 모드 기본.
- 현재 위치 옵션: navigator.geolocation(무키). 주소명 표기는 카카오 Local 키 있으면 사용, 없으면 "현재 위치" 라벨만(§39).

### 10.4 Tour Builder UX 전면 — 몰입 스텝 오버레이(§41)
- 하단 진행 바 폐지. 스텝 진입 시 **풀스크린 몰입 레이어**: scrim 70% 다크 + 중앙 리퀴드 글래스 패널(콘텐츠), 하단 중앙에 [뒤로] [다음] 버튼 페어 고정. 이미지1(우주 배경+글래스 원) 무드.
- 단일 선택 스텝(식사 플랜 3택)은 탭 즉시 다음으로. 다중 선택 스텝은 조건 충족 시 다음 활성. 스텝 전환은 §17 이징으로 슬라이드+페이드 마이크로 인터랙션, reduced-motion 크로스페이드.
- **스텝2 반반 분할**: 탭 폐지. 데스크탑 좌 음식공간 4장 / 우 액티비티 4장 동시 노출(모바일 상하). 합산 2픽 규칙 유지, 카운터 상단 상시.
- **"새로고침" 전면 폐지 → 페이지네이션**: [이전 페이지][다음 페이지] 페어(비활성 상태 포함), 전 카드 그리드 공통.
- **DRAFT 고지 전면 삭제**: "Draft prices…" 등 사용자 노출 초안 고지 UI 전부 제거(코드 주석 PLACEHOLDER는 유지).
- **상태 리셋 정책**: /gts/* 밖으로 이탈 시 GtsContext·하차 텍스트 포함 전체 초기화(다시 들어오면 처음부터). 플로우 내부 이동은 보존.
- 데스크탑 확폭 버그 수술: /gts 전 페이지가 v3.2 컨테이너(1320+)를 실제로 쓰는지 — 모바일 폭 고정 원인(max-w·좁은 래퍼) 제거.

### 10.5 Route 결과 — Visit order 타임라인화
번호 리스트 → RouteTimeline(§28) 문법의 세로 선 연결(노드=순번 원, 우측 장소명·2시간 슬롯 시각). 지도와 병렬 배치.

### 10.6 결제 (§42)
- **기본 상태 = 로그인됨(데모 유저)**: AuthContext 초기값 데모 계정, 로그인 게이트 전부 통과. 실 OAuth는 서버 연동 시 복원 플래그.
- Pay → **결제 수단 그리드 8종**: Apple Pay, Alipay, Visa, Mastercard, PayPal, American Express, JCB, UnionPay. 로고는 `public/pay/` 이미지(사용자 제공), 카드형 선택 UI(이미지2 문법: 로고 카드 + 선택 링).
- 수단 선택 → 카드 입력 폼(카드번호·만료·CVC·이름) 렌더. **미입력 제출 허용**(프로토타입) → 즉시 예약 생성.
- 성공 인터스티셜("Your GTS day is set / View ticket") **삭제** → 결제 즉시 `/ticket/:id` 로 replace 이동(스탬프는 티켓 페이지 진입 시 1회 재생).

### 10.7 Ticket 개편 (§43)
- 레이아웃: lg+ 2컬럼 — **좌 = 예약 상세**(아고다 문법: 예약번호·일정 타임라인·인원·차량·하차 지점·결제 수단·환불 규정 요약(LEGAL Terms §3 문구 재사용)·이용 안내) / **우 = 티켓 카드 축소(기존 대비 1/3 폭, sticky)**.
- 티켓 카드: **보더 0, 단색 면**(primary 면 + white 텍스트) + shadow.md.
- "이미지 저장하기" = **직접 다운로드**: canvas 렌더(PATTERNS §7) → `a[download]` 즉시 저장. 시스템 공유 시트 경유 금지.

### 10.8 Reviews `/reviews` 신설
- 목적: 사회적 증거 + 향후 실데이터 축적 구조.
- 카드: 별점(1~5, 채운 별 primary)·제목·본문·작성자 이니셜+국적(국기 이모지 금지 — 텍스트 국가명)·이용 코스(예: "점심+저녁 · 액티비티 2")·작성 언어 원문(리뷰 본문은 사용자 생성 데이터라 언어 동형 원칙 예외 — UI 크롬만 3언어)·날짜·**좋아요 버튼+카운트**.
- 시드: `data/reviews.js` 목업 12개+ — 영어·한국어·태국어·일본어·중국어·스페인어 등 다국적, 만족 톤 다양(과장 금지, 구체 디테일), mock:true.
- 좋아요: 세션 메모리 증가(localStorage 금지 유지) + 서버 연동 시 reviews·review_likes 테이블로 승격(백엔드 체크리스트 등재). 정렬: 최신/좋아요순 토글.
- 작성 폼: 별점+본문+국적+코스 선택 — 데모 유저로 즉시 게시(세션 메모리).


---

## 11. v5 K-Route — 2026 관광데이터 활용 공모전 ②-2 지정과제 3

> 충돌 시 이 §11 이 이긴다. 근거: SOURCE_SPOTS.md + 2026-09 K-콘텐츠 사실검증 보고서.

### 11.0 서비스 재정의 (프레임 확정)
GTS(춘천까지 교통 + 차량 조립 투어) → **K-Route(케이로드): 춘천 지역특화 K-콘텐츠
여행 플래너.** 심사 기준 정렬이 최우선이며, "우리가 하고 싶은 대로"가 아니라
공고 평가기준(구현성 30·기획력 30·데이터활용 20·발전성 20)에 각 화면을 매핑한다.

**정직한 앵커 = K-푸드.** 조사 결과 춘천의 검증된 K-콘텐츠 자산은 닭갈비·막국수
(축제·박물관·K-치킨벨트로 제도화)가 가장 강하고, 그다음이 겨울연가 실제 촬영지(신규
조회 필요)·애니메이션박물관·셀럽 연고(민지·승희·비니)다. "화려한 팬덤 성지순례"로
과장하지 않는다 — 근거 약한 성지 주장은 심사에서 신뢰를 깬다(SOURCE_SPOTS §8 금지사항).

**한 줄 정의:** "K-콘텐츠의 원조 도시 춘천을, 게임처럼 고르고 지도로 걷는다 —
수도권에 쏠린 한류 여행을 춘천으로."

### 11.1 심사 경로 (5화면 + 상주 RAG봇)
`/gate → /gts/quiz → /gts/build → /gts/route → /gts/go`, K-가이드 봇은 build부터 상주.
차량·결제(setup→checkout)는 **퇴역 아님** — route 세컨더리 링크로만 진입(심사 경로 밖·BM 근거).
공사 OpenAPI 는 build·route·go·chat 4화면에 걸린다(적격 요건). TAGO·지도·LLM은 외부 API(자유).

### 11.2 네비게이션 v5
기존 §1 네비의 "Tour Builder/GTS" 라벨 → **"K-Route"**(KR: 케이로드). `/gts` 진입점을
setup→quiz 로 변경(`/gts/setup` 직접 경로는 유지). About HIDDEN 유지. 그룹 라벨과 하위
항목명이 겹치지 않게(스킬 IA 규칙) — 상위 "K-Route", 하위 "취향 찾기/코스 담기/지도/출발".

### 11.3 `/gts/quiz` — 취향 찾기 (게이미피케이션 설문)
- 형식: 기존 StepStage(§41 풀스크린) 재사용, 5스텝, 탭 즉시 전진, 상단 진행 도트. 목표 40초.
- 문항(i18n 키 `quiz.q1~q5`):
  1. **끌린 콘텐츠**(복수선택): K-푸드(닭갈비·막국수) / K-드라마(겨울연가) / 애니·캐릭터 /
     K-팝 연고(춘천 출신 아이돌) / 아직 안 정함. — SOURCE_SPOTS 검증분만 선택지로.
  2. **여행 성향**: 인증샷 / 로컬 먹거리 / 자연·산책 / 감성 카페 (4택)
  3. **동행**: 혼자 / 친구 / 가족 (3택)
  4. **체류**: 반나절(3곳) / 하루(4곳) (2택 → 추천 정원)
  5. **이동**: 대중교통·도보 / 택시 OK (2택 → go 화면 우선순위)
- 결과 스텝: **여행 타입 배지**(성향 기반 결정론 4종) + "추천 N곳 보기" → build. SuccessStamp 1회.
- 저장: `quiz_sessions`(answers·recommended) + journey_events `quiz`. RequireAuth 유지.
- 게임 요소는 여기까지. 점수·랭킹·보상 없음(3주 스코프).

### 11.4 추천 엔진 (서버 POST /api/quiz/recommend · 결정론)
- 후보 풀 = `kto_spots`(공사 TourAPI 춘천 조회분) + venues.js 52곳(폴백·연계 로컬).
  하이브리드: 공사 API가 1차, API 미커버 로컬 맛집은 52곳으로 메움.
- 앵커 = SOURCE_SPOTS `anchor && grade in (강함,중간)`. 연계 = 앵커 주변 `local`.
- 점수 = Σ 태그 가중치. q1 콘텐츠 일치 +5(앵커)/+2(연계) · q2 성향 +3 · q3 동행 +1 ·
  q5 이동(택시불가+시내 밖 -2). 동점은 공사 집중률 낮은 순.
- 출력 8~12곳 `[{contentid|venueId, score, reason}]`. reason = LLM 1문장(사용자 언어),
  실패 시 태그 사전 문장 폴백(`quiz.reason.*`). **추천은 LLM 없이도 동작.**
- 인용·성지 여부는 SOURCE_SPOTS·API 원문만. 창작 금지.

### 11.5 `/gts/build` — 코스 담기 (기존 VenueGrid·StepStage 재사용)
- 기존 식사플랜 3택·meal/foodspace/activity 3풀 **폐지**. 단일 풀 = 추천 결과.
- 카드 = 공사 대표이미지/관광사진(없으면 기존 `/images/venues/{id}.webp` 폴백) + 제목(다국어
  API 원문 or venues i18n) + **K배지**(SOURCE_SPOTS anchor·grade 조건 충족분만) + reason 1줄
  + 집중률 Chip(여유/보통/혼잡 · 공사 집중률 API 구간화).
- 선택 정원 = q4(3/4). 초과 시 기존 토스트. 상세 패널(§V2 FLIP) 유지 — 본문 = detailCommon/Intro
  원문 + odii 해설(있으면). 리뷰 블록 제거.
- 순서 = 고른 순서. 다음 → route.

### 11.6 `/gts/route` — 지도 (기존 ItineraryMap 재사용)
- 번호핀 + 라인 draw-on 유지. 좌 타임라인 = 장소명 + K배지 + 집중률 Chip.
- CTA: 주 "첫 장소로 출발"(→ go) / 보조 "다시 고르기"(→ build) / 텍스트링크 "차량으로 이동"
  (→ /gts/setup 기존 결제 플로우).
- 이 화면부터 K-가이드 봇 FAB 노출.

### 11.7 `/gts/go` — 현위치→첫 장소 (신설)
- 상단: 현위치(geolocation · 기존 §21 동의 모달 재사용) → 첫 장소(route 순서 1번). 드롭다운
  (커스텀 FieldSelect · 네이티브 select 금지)으로 2·3번도 조회.
- 결과 = 외부 교통 API(GO_PROVIDER). **1순위 = TAGO 시외버스/철도 재사용**(이미 있는 tago.js·
  busService·trainService 확장), 시내 대중교통 세분이 필요하면 ODsay 후속 검토. live 시
  레그 타임라인(기존 §28) + 지도 폴리라인. fallback 시 직선거리 도보·택시 '예상' 라벨.
- 우측 카드: 공사 **집중률·방문자추이 예측** — "지금 가면 {여유|보통|혼잡}" + 추천 시간대(값 있을 때).
  이 카드가 go 화면의 공사 API 근거.
- 하단: "다음 장소" → 첫 장소를 다음 순번으로 교체(현위치 재조회).

### 11.8 K-가이드 봇 (RAG · 전 화면 FAB) — 풀 구현
- 진입: build·route·go 우하단 FAB(lucide MessageCircle · Dock 위) → BottomSheet(§36) 채팅.
  컨텍스트 = 현재 선택 장소들.
- 지식베이스 `spot_chunks`: 공사 다국어 상세(detailCommon·Intro) + odii 해설 + 연관관광지 요약
  + SOURCE_SPOTS 큐레이션 문장. 언어별 청크(ko·en). 태국어 질문 → en 검색 → 답변 th 번역(LLM).
- 임베딩·생성·번역 = **Gemini 단일 키**(임베딩+생성+번역 한 키). env `LLM_PROVIDER=gemini`.
- [V5-6] 키가 없으면 생성·번역 = **로컬 Ollama**(gemma4:e4b · API 비용 0 · 동해사이 검증 챗봇 방식). Ollama도 없으면(배포 서버)
  검색된 공사 원문을 그대로 보여 주는 원문 모드. 검색은 키워드 + 춘천 동의어 RAG(임베딩은 키 발급 후 붙이는 선택 경로).
  챗봇의 명분 = "공사 공식 데이터만 답하는 안내원". 인용할 청크도 앞선 대화도 없으면 모델을 부르지 않고 "정보가 없습니다"로 끝낸다.
- 답변 규칙: 인용 chunk 없으면 "정보 없음"으로 답하고 지어내지 않는다. 하단 출처 장소 Chip.
  로그 `chat_logs`.
- 스코프: 텍스트만. 음성·Scan&Explain(카메라 OCR)은 §11.10 밖(후속).

### 11.9 공사 OpenAPI 매핑 (적격 요건 · 엔드포인트명은 KTO_API.md·docs/kto 근거로만)
| 화면 | 공사 API | 용도 |
|---|---|---|
| build | 다국어 관광정보(ko·en) + 관광사진 | 카드·상세 원문·이미지 |
| build·recommend | 관광지별 연관 관광지 | 앵커 주변 연계 후보 |
| build·route·go | 관광지 집중률·방문자추이 예측 | 혼잡 Chip·방문 시간대 |
| chat | 관광지 오디오가이드(odii) | RAG 지식베이스 |
- 지역 필터: 강원(areaCode)·춘천(sigunguCode)은 코드조회 API로 기동 시 매칭·캐시(TAGO ID 계약 동형·하드코딩 금지).
- 캐시: `kto_spots.raw` 원문 JSON · lazy · TTL 24h.
- 태국어: 공사 미지원 → UI 크롬 th 사전 + 콘텐츠 th는 LLM 번역 캐시(원문 en 병기).

### 11.10 스코프 밖 (v5에서 안 하는 것)
Scan&Explain(카메라) · 음성봇 · 팬 커뮤니티 · 다도시 템플릿 · 실결제 · 랭킹·리워드 ·
셀럽 물리적 성지 핀(초상권 검토 전) · 관광지 외 타 지자체.

### 11.11 심사 매핑 (기능설명서·해시태그 근거)
공고 지정과제 3 해시태그 = #덕질투어 #다국어 #로컬관광 #여행플래너 (+RAG봇).
- #덕질투어 = 11.3·11.4 (K-푸드/드라마/애니/K팝 취향 큐레이션)
- #다국어 = 11.9 (공사 다국어 API + th LLM 번역, en·ko·th 3언어)
- #로컬관광 = 11.4 연계 로컬(연관관광지 API)
- #여행플래너 = 11.5·11.6·11.7
- #RAG챗봇 = 11.8
평가배점: 구현성30(11.5·11.6·11.7 실동작+봄내헬퍼 기반) / 기획력30(11.0·11.3 독창성) /
데이터20(11.9 표) / 발전성20(다도시·다국어·BM).

> [V5-6] 방문인증은 NFC URL 태그 스탬프 최소 데모로 범위에 넣었다(사용자 결정 2026-09-12 · §11.12). §11.10 목록에서 뺐다.

### 11.12 NFC 성지 스탬프 (최소 데모 · [V5-6])
- 방식: NFC 스티커에 URL `/stamp/<spotId>/<토큰>`을 심는다. iOS·안드로이드 모두 앱 설치 없이 열린다(웹 NFC API 불필요).
  토큰을 쿼리가 아니라 경로에 두는 이유: RequireAuth가 로그인 뒤 pathname만 되돌려 준다.
- 대상: SOURCE_SPOTS 앵커 중 grade 강함(현재 K-푸드 12곳 · K-애니 1곳). 갈래도 거기서 나온다.
  근거 강함인 K-드라마 앵커가 venues에 없어 K-드라마 스탬프는 없다(공지천 = 촬영 근거 없음 · SOURCE §8).
- 흐름: 로그인 → 서버 기록(`stamps` · 사용자당 같은 곳 1회) → SuccessStamp → 갈래별 배지 → 갈래가 다 모이면 완주 인증서 PNG(사용자 언어).
- 한계: 토큰 = HMAC(SESSION_SECRET) 12자라 URL 추측은 막지만 현장 도착 증명은 아니다. 발전단계 = 위치 반경 교차 검증 · 스티커 토큰 교체.
