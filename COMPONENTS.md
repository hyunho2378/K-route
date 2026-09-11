# COMPONENTS.md — Bomnae Helper 컴포넌트 인벤토리 v3

전 컴포넌트 JSX(JavaScript). 여기 없는 컴포넌트는 만들지 않는다.
props 계약은 병렬 에이전트 간 인터페이스다 — **임의 변경 금지, 변경 필요 시 질문 후 대기.**
반응형 표기: 모든 컴포넌트는 320~3840 대응이 기본이며, 별도 표기는 변형이 있는 경우만.

## A. 기반 (AGENT-1)

### A1. 컨텍스트 · i18n
| 파일 | 스펙 |
|---|---|
| `src/tokens.js` | 루트의 tokens.js를 그대로 복사 배치. 수정 금지 |
| `src/i18n/en.js` `src/i18n/ko.js` | 사전. 키 완전 동형. 중첩 객체(`nav.gate`, `booking.cta` …) |
| `src/i18n/LangContext.jsx` | `LangProvider`, `useLang()` → `{ lang:'en'|'ko', setLang, t(key) }`. in-memory, 기본 'en'. t는 키 미존재 시 키 문자열 반환 + console.warn |
| `src/i18n/LangSwap.jsx` | props: `k`(사전 키), `as`(태그, 기본 span), `className`. 두 언어를 같은 grid 셀에 겹쳐 렌더, 비활성 언어 `invisible` — 레이아웃 시프트 0 (PATTERNS §1) |
| `src/context/AuthContext.jsx` | `AuthProvider`, `useAuth()` → `{ user:null|{name,email}, login(), logout() }`. PHASE 1은 목(login = 목 유저 세팅). PHASE 3에서 서버 연동으로 내부만 교체(인터페이스 불변) |
| `src/context/BookingContext.jsx` | 게스트 예약 초안 in-memory: `{ draft, setDraft, reset }`. draft = `{lineId, date, time, adults, children}` |

### A2. 데이터 (전부 목 — PHASE 3에서 API로 교체, shape 불변)
| 파일 | 스펙 |
|---|---|
| `src/data/lines.js` | IA §4 shape. 3개 라인. 가격 DRAFT 주석 |
| `src/data/stops.js` | 라인별 3개 정류장 + 미팅포인트 2개(춘천역·남춘천역). **전 좌표 `// PLACEHOLDER — verify on site`** |
| `src/data/departures.js` | `getDepartures(lineId, date)` → 회차 3개(10:00/13:00/16:00), capacity 12, booked_count 랜덤 고정 시드, status 규칙: booked≥6 confirmed, ≥3 likely, 만석 closed |
| `src/data/gateRoutes.js` | `planGate({terminal, date, time})` → 옵션 배열. 룰: 도착시각+60분 버퍼 후 첫 탑승 편 계산. 시간표 DRAFT 상수 + PLACEHOLDER 주석 |
| `src/data/stories.js` | 감자밭(이미소·이청강 서사 요약) 포함 정류장별 스토리 메타 |
| `src/data/pilot.js` | 지표 3개 + 갤러리 항목. PLACEHOLDER |
| `src/data/api.js` | 데이터 접근 단일 창구: `getLines()`, `getLine(id)`, `getStops(lineId)`, `getDepartures()`, `createBooking(payload)`(목: 6자 코드 생성 후 in-memory 저장), `getBooking(id)`, `createHandsFree(payload)`. **모든 페이지는 api.js만 호출** — PHASE 3 교체 지점 |

### A3. 레이아웃 · 내비
| 파일 | props / 스펙 |
|---|---|
| `src/components/layout/PageLayout.jsx` | Header + `<Outlet/>` + GlassDock(<lg) + Footer. `/loop`에서 Footer 숨김 |
| `src/components/layout/Container.jsx` | `size:'lg'\|'2xl'\|'3xl'`(기본 자동: DESIGN §5 캡 규칙), children. 마진 규칙 내장 |
| `src/components/layout/Section.jsx` | `id`, `eyebrow`(사전 키), `title`(사전 키), children. eyebrow=caption 500 대문자 자간+, title=h2 |
| `src/components/nav/Header.jsx` | lg+ 전용. 스크롤 glass 72→56 (PATTERNS §2). 메뉴 3 + LangToggle + 로그인 IconButton(user 있으면 이니셜 원형) |
| `src/components/nav/GlassDock.jsx` | <lg 전용. DESIGN §6 + PATTERNS §3 명세 그대로. 접힘 56px pill / 확장 메뉴+언어+로그인. 포커스 트랩, Escape, 라우트 변경 수축 |
| `src/components/nav/Footer.jsx` | navy 풀블리드. 상단 1px 라인 3색 스트라이프. 크레딧·언어·법적 고지 |
| `src/components/nav/LangToggle.jsx` | EN/KR 세그먼트. 44px 타깃 |

### A4. UI 프리미티브
| 파일 | props / 스펙 |
|---|---|
| `src/components/ui/Button.jsx` | `variant:'primary'\|'ghost'`, `size:'md'\|'lg'`, `as`(Link 지원), `disabled`. DESIGN §7 |
| `src/components/ui/IconButton.jsx` | `icon`(lucide 컴포넌트), `label`(사전 키 — aria-label+툴팁), `size:16\|20\|24`, `onClick`. 44px 히트영역 |
| `src/components/ui/Chip.jsx` | `active`, `onClick`, children. 필터/탭용 |
| `src/components/ui/StatusBadge.jsx` | `status:'confirmed'\|'likely'\|'closed'`. 색: green / yellow+ink / inkMeta. 라벨 사전 키 `status.*` |
| `src/components/ui/Stepper.jsx` | `value`, `min`, `max`, `onChange`, `label`(사전 키). IconButton(-,+) + 숫자 Kanit 600 |
| `src/components/ui/BottomSheet.jsx` | `open`, `onClose`, `title`, children. <lg 전용. blur 3/3, shadow 2/2, 그랩바, 스와이프다운·바깥탭·Escape 닫기, 포커스 트랩 |
| `src/components/ui/Dialog.jsx` | 같은 props. lg+ 전용, 중앙 max-w 560. **Sheet/Dialog 선택은 `src/components/ui/Modal.jsx` 래퍼가 뷰포트로 자동 분기** — 페이지는 Modal만 사용 |
| `src/components/ui/EmptyState.jsx` | `illustration`(파일명), `titleKey`, `bodyKey`, `cta:{labelKey,to}` |
| `src/components/ui/VideoPlayer.jsx` | `src`, `poster`, `captionKey`. muted autoplay playsInline loop + 상시 자막 밴드(DESIGN §12) |
| `src/components/ui/Skeleton.jsx` | `className`. surface 배경 펄스(reduced-motion 시 정지) |
| `src/components/ui/LoginGate.jsx` | Modal 내부: unDraw 단색 + "Sign in to confirm" + Google 버튼(useAuth.login). 성공 시 `onSuccess` 콜백 |

## B. Gate · Home (AGENT-2)

| 파일 | 스펙 |
|---|---|
| `src/pages/Home.jsx` | IA §2.1 섹션 순서 고정. 섹션 컴포넌트는 `src/components/home/` 하위 |
| `src/components/home/HeroSection.jsx` | 풀블리드, display 타이포, scrim(그라데이션 예산 1/1), CTA 2. min-height clamp(560px,72vh,960px) |
| `src/components/home/ProblemStrip.jsx` | 숫자 "4 / 5" Kanit Bold display + 리서치 문장 |
| `src/components/home/GateEntryCard.jsx` | 터미널 select + 시간 input → navigate(`/gate?…`) |
| `src/components/home/LinesPreview.jsx` | LineCard ×3 그리드(1→2→3열) |
| `src/components/home/LineCard.jsx` | props `line`. 라인 컬러 상단 스트라이프 4px, 캐릭터 이미지, 정류장 3, 소요·가격. hover 보더 primary + translateY(-2px) |
| `src/components/home/HowItWorks.jsx` | 3스텝. 번호는 실제 순서이므로 숫자 마커 허용 |
| `src/components/home/PilotStrip.jsx` | 썸네일 + 카피 + Link |
| `src/pages/Gate.jsx` | IA §2.2. 쿼리 프리필. 결과 영역 aria-live="polite" |
| `src/components/gate/GateForm.jsx` | terminal/date/time. 제출 → `planGate` 호출 결과 상위로 |
| `src/components/gate/RouteOptionCard.jsx` | props `option`, `selected`, `onSelect`. 총 소요·요금·환승 수·첫 탑승 편 |
| `src/components/gate/RouteStepList.jsx` | props `legs`. leg = 사진 + 방향 문장 + 소요. 수직 타임라인(라인 컬러 아님 — primary) |
| `src/components/gate/HandsFreeCard.jsx` | 크로스셀 → /gate/hands-free |
| `src/pages/HandsFree.jsx` | IA §2.3. 폼 → 요금 합계 → 확정(LoginGate) → `createHandsFree` → 접수 코드 화면 |

## C. Loop (AGENT-3)

| 파일 | 스펙 |
|---|---|
| `src/pages/Loop.jsx` | 풀블리드 LoopMap + LinePanel(데스크탑 좌측 white 패널 360px / 모바일 하단 시트형 고정 리스트). 패널이 지도 대체 접근 경로 |
| `src/components/map/LoopMap.jsx` | PATTERNS §4 포팅 그대로. props: `focusLineId`, `focusStopId`, `onSelectStop`. 라인 GeoJSON + 정류장 마커 + 셔틀 시뮬레이션 |
| `src/components/map/useShuttleSim.js` | 라인 좌표 배열 따라 rAF 보간 이동 훅. reduced-motion 시 정지 위치 |
| `src/components/loop/LinePanel.jsx` | 라인 3개 리스트 + 정류장 하위 리스트. 선택 → LoopMap focus |
| `src/pages/LineDetail.jsx` | IA §2.5 순서 고정 |
| `src/components/loop/LineHero.jsx` | 라인 컬러 면 + 캐릭터 + 라인명 + 메타 |
| `src/components/loop/StopStrip.jsx` | 수직 노선도. 노드 = 라인 컬러 링. 정류장별 사진·선주문 문구 |
| `src/components/loop/StoryClips.jsx` | 썸네일 카드 가로 스크롤(모바일) / 3열(lg). VideoPlayer 사용 |
| `src/components/loop/DepartureCalendar.jsx` | props `lineId`, `onPick({date,time})`. 날짜 그리드 + 가격 인라인 + StatusBadge + 회차 선택 + 남은 좌석 |
| `src/pages/Booking.jsx` | 3스텝(IA §2.6). BookingContext 사용. 확정 → LoginGate → `createBooking` → navigate ticket |
| `src/components/booking/PartyStep.jsx` | Stepper ×2 + 합계 |
| `src/components/booking/SummaryStep.jsx` | 전체 요약 + 동승 인원 문장 + 호스트 |
| `src/components/booking/SuccessStamp.jsx` | 라인 스탬프 드롭 1.4→1.0 (scale 화이트리스트 1/2, reduced-motion 즉시 표시) |
| `src/pages/Ticket.jsx` | IA §2.7. navy 티켓 + 예약 코드 + 공유(PATTERNS §7) + "2 lines left" |
| `src/pages/Pilot.jsx` | IA §2.8 |
| `src/pages/NotFound.jsx` | EmptyState 사용 |

## D. 서버 (AGENT-SERVER, PHASE 3)

| 파일 | 스펙 |
|---|---|
| `server/index.js` | Express 부트스트랩, CORS(클라이언트 오리진), cookie-parser, JSON |
| `server/db.js` | `pg` Pool — `process.env.DATABASE_URL`(Neon) |
| `server/schema.sql` `server/seed.sql` | IA §4 스키마 + 라인/정류장/회차 시드 |
| `server/routes/auth.js` | Google OAuth 코드 플로우: `/api/auth/google` → 리다이렉트, `/api/auth/callback` → 토큰 교환 → 유저 upsert → **httpOnly 세션 쿠키**. `/api/me`, `/api/logout` |
| `server/routes/lines.js` | GET `/api/lines`, `/api/lines/:id`, `/api/lines/:id/departures?date=` |
| `server/routes/bookings.js` | POST `/api/bookings`(인증 필수, 좌석 잔여 검증 트랜잭션), GET `/api/bookings/:id` |
| `server/routes/handsfree.js` | POST `/api/handsfree`(인증 필수) |
| 클라이언트 | `src/data/api.js` 내부만 fetch로 교체 — 페이지 코드 무변경이 완료 조건 |

---

## v3.1 리디자인 증분 (2026-07-21 크리틱 라운드)

기존 섹션 A~D는 유지. 아래는 **변경·신설분**이며 충돌 시 이 표가 이긴다. 담당 = 리디자인 존.

### 존 A (파운데이션·크롬 — 선행 단독)
| 항목 | 명세 |
|---|---|
| i18n 네임스페이스 분할 | `src/i18n/{en,ko,th}/{common,gate,loop,brand,legal}.js` + 언어별 index 병합. 기존 en/ko 키를 네임스페이스로 이관, th 신규(en 기반 번역, Kanit 스택). **B·C존은 자기 네임스페이스 파일만 쓴다 — 충돌 원천 차단** |
| 카피 스윕 | 전 사전·소스에서 줄표(—, –) 제거 후 자연문으로 재작성. `grep -rn "—\|–" src` 0건이 완료 조건 |
| 측정폭 해제 | 텍스트 블록의 개별 `max-w-*` 제거(컨테이너만 폭 결정). `<br>` 수동 개행 제거(히어로 디스플레이 제외) |
| 무보더 스윕 | 전 컴포넌트 `border`(액센트 보더 포함) 제거 → tokens.shadow 3단 적용. 폼은 surface면+focus 링. grep `border-l\|border-t-2\|border-2` 0건 |
| Header rev | 메뉴 4개(Gate/Loop/Hands-Free/About), 라벨 600, 액티브=primary 컬러 텍스트(인디케이터 폐지), 상시 불투명면, LangMenu 탑재 |
| `LangMenu.jsx` | Globe IconButton + 드롭 카드(English/한국어/ไทย), Check 표시, 키보드·Escape. LangToggle 대체(파일 삭제 아님, deprecated 주석 후 미사용) |
| `FieldSelect.jsx` | DESIGN §7 명세. props: label, value, placeholder, options[{id,icon,primary,secondary}], onChange. 시간·터미널·인원 외 전 셀렉트가 이걸 쓴다 |
| Footer rev | DESIGN §6 v3.1 — primary 풀블리드, 4컬럼, 법적 링크 새 탭, 언어 토글 제거, 프로토타입 문구 제거 |
| `pages/LegalPrivacy.jsx` `pages/LegalTerms.jsx` | LEGAL_COPY.md 전문 이식. 컨테이너 좁게(prose 폭은 컨테이너 캡으로), h1+갱신일+섹션 h2, small 본문. i18n legal 네임스페이스 |

### 존 B (Gate 계열)
| 항목 | 명세 |
|---|---|
| Home rev | HeroCarousel(사진 3, 크로스페이드 6s, 도트, reduced-motion 1장) / Lines preview 카드에 아이콘 배지(Sprout·Flame·Waves) / Proof strip → /about#proof |
| `GateJourney.jsx` | PATTERNS §12. Plane↔Building2 + 트랙 + 모드별 TrainFront/Bus 주행 애니메이션 |
| Gate rev | FieldSelect 3종 적용, GateJourney 삽입, 모드 카드↔Journey 동기 |
| HandsFree rev | `/hands-free` 이동, 헤드라인 섹션 + `1fr_380px` 2컬럼, 3단계 미니 스트립 |

### 존 C (Loop·예약·브랜드 계열)
| 항목 | 명세 |
|---|---|
| LoopMap rev | 3레이어 라인 + draw-on + 셔틀 lerp 스무딩(DESIGN §11, PATTERNS §13) |
| `StopPopup.jsx` | 마커·리스트 선택 시 정류장 카드 팝업. 동시 1개, Escape 닫기 |
| Loop rev | 사이드 컬럼 폐지 → 지도 위 글래스 라인 카드(마진 안, 데스크탑 좌 스택 340 / 모바일 하단 스냅) |
| `LinePreviewOverlay.jsx` | PATTERNS §14. scrim+글래스 패널, Stories·캘린더·호스트·Reserve 제외, CTA "Book and see details" 단일 |
| `StickyBookPanel.jsx` | PATTERNS §15. G-Local aside 이식: sticky top-24, 캘린더+회차+Stepper+합계+CTA. 모바일 하단 CTA 바→BottomSheet |
| LineDetail rev | `1fr_380px` 그리드, 좌 콘텐츠/우 StickyBookPanel, 캘린더·인원 좌측 중복 금지 |
| Booking rev | 단일 확인 페이지(IA §2.6 v3.1). 스텝 컴포넌트 3종 폐기 |
| `pages/About.jsx` + `components/brand/*` | IA §2.8 11섹션. 카피는 BRAND_COPY.md 이식(창작 금지). Pilot.jsx 삭제, 라우트 리다이렉트 |

---

## v3.2 리디자인 증분 (2차 크리틱) — 충돌 시 이 표가 이긴다

### 존 A2 (파운데이션·크롬)
| 항목 | 명세 |
|---|---|
| tokens v3.2 반영 | primary #0073EC, 텍스트 니어블랙 3단, SUIT Variable, 컨테이너 확폭, map.antialias — client/src/tokens.js 동기화 + tailwind 재생성 |
| 폰트 교체 | Pretendard 링크 제거 → SUIT Variable + Kanit(thai 서브셋). PATTERNS §27 |
| 회색·틴트 스윕 | inkMeta를 캡션 외에서 쓰는 곳, 라인컬러 soft 배경, 연한 면 전수 제거. grep `inkMeta\|/10\|/20\|-soft` 검토 |
| 웨이트 스윕 | Light 사용 0건, 화면당 400/600/700 공존 확인. 버튼·메뉴·라벨 600 통일 |
| Header v3.2 | 높이 80/64, 메뉴 17px 600, 순서 About/Getting Here/Bag Delivery/City Lines, 모바일 상단 헤더(로고+Lang+로그인, 메뉴 없음) 신설 + 기존 모바일 메뉴 깨짐 제거 |
| 명명 교체 | i18n 표시명 전면 교체(DESIGN §16.7). 라우트·파일명 불변 |
| Footer 압축 | 2단 240px 이내, © 2026 Bomnae Helper. All rights reserved. + Team 5, 대회 풀네임 삭제 |
| Button 페어 | Secondary 아웃라인 변형 추가(§16.8), 정렬 축 통일 |
| `CalendarGrid.jsx` | §19 공용 캘린더 그리드(게이트 CalendarField + 상세 캘린더 공유) |

### 존 B2 (Getting Here 계열)
| 항목 | 명세 |
|---|---|
| Gate 입력 개정 | 출발지 FieldSelect에 현재 위치 1옵션(geolocation 1회, 거부 폴백), 날짜 = CalendarField(§19) |
| 크로스셀 삭제 | Hands-Free 카드 섹션 제거 |
| `ArrivalCard.jsx` `ArrivalExplainModal.jsx` `ArrivalModal.jsx` + ArrivalContext | IA §8.5 + PATTERNS §21 문안·상태 그대로 |
| HandsFree | Optional 배지 + 선택 사항 카피 |

### 존 C2 (City Lines 계열)
| 항목 | 명세 |
|---|---|
| Loop 초기화 개정 | 라인 기본 비노출, LineChips(§24), 선택 시 draw-on, hover 즉시 StopPopup, 패널 scroll-quiet, 모바일 하단 소형 카드(≤132px) |
| 지도 수술 | PATTERNS §23 전 항목 |
| POI 앵커 | 무채색 미니 라벨 마커 ≤5개, 클릭 시 관련 칩 하이라이트 |
| LineDetail 개정 | 2개월 스프레드 캘린더 + 원색 도트 범례 + 회차 전부 펼침(§20), 빈 이미지 박스 제거, 라인 아이콘 배지 삭제 → 원색 컬러 도트+shadow |
| 전환 연출 | `GateToLinesTransition.jsx` — PATTERNS §22, ArrivalModal 승인 시 재생 |

### 존 D2 (실험 — 별도 프롬프트, 병렬 금지)
| 항목 | 명세 |
|---|---|
| `pages/ArStop.jsx` `/loop/ar/:stopId` | PATTERNS §26 locar.js. 의존성 2개 정확히, 미지원 기기 진입점 비노출, Beta 배지 |

---

## v4 GTS 증분 — 충돌 시 이 표가 이긴다

### 존 A4 (오케스트레이터 직접, 선행)
| 항목 | 명세 |
|---|---|
| 내비 v4 | 헤더 About/Getting Here/Make GTS, Bag Delivery 항목 삭제 |
| 라우트 | `/gts/setup·build·route·checkout` 신설, `/loop*`→`/gts`(=setup) · `/hands-free`→`/gts/setup` redirect, 구 loop 계열 라우트 제거(파일은 deprecated 주석 보존) |
| i18n | `gts` 네임스페이스 신설(3언어 동형), 구 loop 키 보존 |
| GtsContext | PATTERNS §31 |

### 존 B4 (서브에이전트 PLANNER)
| 소유 | pages/Gate.jsx, components/gate/**, data/gts/hubs.js 소비, i18n */gate.js |
| 항목 | 방향 토글 2탭(구조 고정), 현재 위치 옵션(§21 동의 모달 재사용), 도착지 춘천역/터미널 2택, 허브 FieldSelect, 결과 카드 = §29 조회 전용, RouteTimeline(§28) 교체 + 구 GateJourney 삭제, 도착 감지 카드 위치 유지 |

### 존 C4 (서브에이전트 BUILDER)
| 소유 | pages/GtsSetup·GtsBuild·GtsRoute·GtsCheckout.jsx, components/gts/**, ItineraryMap, i18n */gts.js, Ticket GTS 모드 확장 |
| 항목 | §9.3 차량 매칭 카드(아이콘 실존 확인), §9.4 스텝 플로우+VenueGrid(§30)+진행 바, §9.5 ItineraryMap(§32), §9.6 체크아웃(§33), 성공 스탬프 재사용 |

### 격리 세션 (병렬 금지) — GTS 데이터 시드
| 소유 | src/data/gts/{hubs.js, vehicles.js, venues.js} 3파일만 |
| 계약 | §29 형태 준수, 실명 창작 금지(기확보 브랜드 외 전부 "Mockup N"), 시각·요금·편명 생성 금지, 모든 수치 PLACEHOLDER 주석 |

---

## v4.1 크래프트 패스 증분
| 항목 | 명세 |
|---|---|
| .claude/skills 이식 | 레포 루트 `.claude/skills/`에 6개 스킬 폴더 배치(사용자 수행). CC는 존재 확인만 |
| tokens 동기화 | motion v4.1(easeOut/easeInOut/easeDrawer/durPress/durPop/dur 280) client 반영, 구 320ms 참조 전수 교체 |
| 프레스·진입 스케일 | §34 — 전 pressable, 전 팝 패널. scale(0) grep 0건 |
| 머티리얼 | §35 — Header·GlassDock 교체, 스크롤 엣지, reduced-transparency·contrast 미디어쿼리 |
| 시트 물리 | §36 — BottomSheet 드래그 디스미스(속도 판정·러버밴드·속도 인계), motion 패키지 1개 추가 |
| 타이포 트래킹 | §17.5 크기별 letter-spacing, 전역 고정값 제거 |
| 툴팁·@starting-style | 연속 hover 지연 스킵, 진입 @starting-style |
| 모션 감사 | §37 절차로 전 라우트 감사 표 + 수정 |

---

## v4.2 증분 — 충돌 시 이 표가 이긴다

### 존 A5 (오케스트레이터 직접, 선행)
| 항목 | 명세 |
|---|---|
| 명명·내비 | Trip Planner/Tour Builder/Reviews 4항목(§10.1), /reviews 라우트 신설 |
| 데모 로그인 | AuthContext 기본 = 데모 유저, 로그인 게이트 통과. `DEMO_AUTH=true` 플래그로 복원 가능 |
| DRAFT 고지 스윕 | 사용자 노출 초안 고지 전 삭제, grep "Draft prices\|초안" UI 문자열 0건 |
| 푸터 모토 | 브랜드 한 문장 교체: EN "Sightseeing on your terms for those seeking convenience and new experiences." / KR·th BRAND_COPY §13 |
| GtsContext 리셋 | /gts/* 이탈 시 전체 초기화(§10.4) |

### 존 B5 (서브에이전트 HOME-PLANNER)
| 소유 | pages/{Home,Gate}.jsx, components/{home,gate}/**, i18n */gate.js·home 키 |
| 항목 | §10.2 홈 재건(삭제 3종+히어로+CTA 페어 정렬+진입 카드+HIW 재작성+리뷰 스트립), §10.3 수직 2섹션·TimeWheel(§38)·레그 시각 계산(§39)·데모 도착 시퀀스(§40)·현재 위치(§39) |

### 존 C5 (서브에이전트 BUILDER-PAY)
| 소유 | pages/{GtsSetup,GtsBuild,GtsRoute,GtsCheckout,Ticket,Reviews}.jsx, components/{gts,pay,reviews}/**, data/reviews.js, i18n */gts.js·reviews 키 |
| 항목 | §41 StepStage 전면 적용(진행 바 폐지·자동 전진·전환 모션), 스텝2 반반 분할, 페이지네이션 페어(새로고침 폐지), §10.5 방문순서 타임라인, §42 결제, 성공 인터스티셜 삭제→티켓 직행, §43 티켓 개편, §10.8 리뷰 페이지+시드 12개(다국적·mock:true·과장 금지) |

---

## v5 K-Route 증분 ([V5-3] P2 화면 · 2026-09-11) · 충돌 시 이 표가 이긴다

### 공용(오케스트레이터 단독 확정 · 병렬 에이전트 읽기 전용)
| 파일 | 스펙 |
|---|---|
| `src/data/gts/spots.js` | 스팟 규약(id 이원화: kind 'kto' = 공사 contentid · 합류 7곳 venueId 역링크 / kind 'venue' = venues.js id) · toSpot(stayMin 120) · resolveSpot(id, known)(추천·풀 우선 · 합류 구 venue id 매칭 · venues.js 폴백) · spotImages(공사 대표이미지 → 합류 webp) · ktoText(공사 원문 HTML → 텍스트 · 엔티티 복원) · ktoHref(http(s)만) |
| `src/data/gts/quizQuestions.js` | IA §11.3 5문항(option id = server recommendService.ANSWERS) · Q1_EXCLUSIVE('아직 안 정함' 배타) · TRAVEL_TYPE_ICONS(q2 → lucide) |
| `src/components/gts/KBadge.jsx` | props `spot`. badge(SOURCE anchor && 강함·중간) + K 4종(kfood·kdrama·kanime·kpop)만 · 흰 pill + BadgeCheck(primary) + ink 라벨 · 페이드 인 · 좁으면 말줄임 |
| `src/components/gts/CongestionChip.jsx` | props `band`('relaxed'·'moderate'·'busy'), `labelKey`(스크린리더 맥락 · null이면 생략). 흰 pill + 원색 도트(green·yellow·spice) + ink 라벨 · 색 전환만 · 경계 32.15 / 61.16(서버 band) |
| `src/components/gts/GuideFab.jsx` | K-가이드 봇 FAB 자리(비활성 · 우하단 fixed · z-dock · 챗 BottomSheet는 P3) |
| GtsContext | 상태 quizAnswers·recommended·goOrigin · 액션 setQuizAnswer·submitQuiz(answers, lang)·selectSpot·setGoOrigin · 파생 cap(q4 반나절 3·하루 4)·course(방문 순서 스팟) · 가드 quiz → build → route → go(checkout = route 경유 유지) · v4 setMealPlan·toggleMeal·togglePick 제거 |
| StepStage | 신규 prop `nextLabel`(다음 버튼 노드) · `exitKey`(나가기 카피 접두) · 진행 도트 색 전환 · 짧은 스텝 세로 중앙 · 겹친 모달 안 Escape 무시 · 사유 문구 ink |
| SuccessStamp · LangSwap · VisitTimeline · StopPopup | `mark`(이니셜 대신 노드) · `vars`({이름} 치환) · items[].extra(부가 노드) · 체류 0이면 체류 칩 비렌더 |

### 병렬 존(파일 소유 계약)
| 존 | 소유 | 항목 |
|---|---|---|
| A 취향 찾기 | pages/GtsQuiz.jsx · components/quiz/{QuizQuestion,QuizResult}.jsx | StepStage 6스텝(q1~q5 + 결과) · q1 복수 · 탭 자동 전진 · 결과 = 여행 타입 배지(q2 결정론 4종) + SuccessStamp 1회 + "추천 N곳 보기" |
| B 코스 담기 | pages/GtsBuild.jsx · components/gts/{VenueGrid,VenueDetail,CourseQueue}.jsx | 단일 풀 = 추천 결과 · 정원 q4 · 카드 = 공사 대표이미지 → webp → 텍스트 + K배지 + 사유 1줄 + 집중률 Chip · 상세 = 공사 detailCommon·Intro 원문 + odii(같은 장소 이름 일치만) · 리뷰 제거 |
| C 출발 | pages/GtsGo.jsx · components/go/{LegTimeline,CrowdCard}.jsx · ItineraryMap 선택 prop(pinLabels·drawMs·labelKey) | §21 동의 → 현재 위치(거부 시 춘천역) → FieldSelect 도착 · /api/go 도보·택시 '예상' 레그 · 지도 폴리라인(거리 비례 draw-on) · 집중률 카드(3xl 이상 우측) · 다음 장소 |
| 통합(오케스트레이터) | pages/GtsRoute.jsx · Ticket(공사 id 풀 해석) · GtsSetup(route 경유 체크아웃 직행) · GtsCheckout(course) | route CTA 3종 + K배지·집중률 + FAB |
