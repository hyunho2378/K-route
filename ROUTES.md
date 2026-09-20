# ROUTES.md — Cheongchun Line 라우팅 v3 (react-router-dom@6)

## 1. 라우트 테이블

| Path | 컴포넌트 | 담당 | 비고 |
|---|---|---|---|
| `/` | `pages/Home.jsx` | AGENT-2 | |
| `/gate` | `pages/Gate.jsx` | AGENT-2 | 쿼리 `?terminal=&time=&date=` 지원(Home 미니 입력에서 전달) |
| `/hands-free` | `pages/HandsFree.jsx` | AGENT-2 | v3.1 최상위 승격, 헤더 노출 |
| `/loop` | `pages/Loop.jsx` | AGENT-3 | 풀블리드 맵 |
| `/loop/:lineId` | `pages/LineDetail.jsx` | AGENT-3 | lineId ∈ potato \| dakgalbi \| lake, 그 외 404 리다이렉트 |
| `/loop/:lineId/book` | `pages/Booking.jsx` | AGENT-3 | v3.1 단일 확인 페이지. 쿼리 `?date=&time=&adult=&child=` 필수, 미비 시 상세로 replace |
| `/ticket/:bookingId` | `pages/Ticket.jsx` | AGENT-3 | |
| `/about` | `pages/About.jsx` | AGENT-3 | v3.1 브랜드 페이지(Pilot 대체) |
| `/legal/privacy` | `pages/LegalPrivacy.jsx` | AGENT-1 | 푸터에서 새 탭 진입 |
| `/legal/terms` | `pages/LegalTerms.jsx` | AGENT-1 | 푸터에서 새 탭 진입 |
| `/pilot` | redirect | - | `<Navigate to="/about" replace />` |
| `/gate/hands-free` | redirect | - | `<Navigate to="/hands-free" replace />` |
| `*` | `pages/NotFound.jsx` | AGENT-3 | |

## 2. 셸 구조

```jsx
<BrowserRouter>
  <LangProvider>
    <AuthProvider>
      <BookingProvider>
        <Routes>
          <Route element={<PageLayout />}>   {/* Header + Outlet + GlassDock + Footer */}
            <Route path="/" element={<Home />} />
            <Route path="/gate" element={<Gate />} />
            <Route path="/hands-free" element={<HandsFree />} />
            <Route path="/loop" element={<Loop />} />
            <Route path="/loop/:lineId" element={<LineDetail />} />
            <Route path="/loop/:lineId/book" element={<Booking />} />
            <Route path="/ticket/:bookingId" element={<Ticket />} />
            <Route path="/about" element={<About />} />
            <Route path="/legal/privacy" element={<LegalPrivacy />} />
            <Route path="/legal/terms" element={<LegalTerms />} />
            <Route path="/pilot" element={<Navigate to="/about" replace />} />
            <Route path="/gate/hands-free" element={<Navigate to="/hands-free" replace />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BookingProvider>
    </AuthProvider>
  </LangProvider>
</BrowserRouter>
```

- `/loop`만 예외 레이아웃: PageLayout 안에서 Footer 숨김 + 맵이 헤더 아래 뷰포트 전체(`PageLayout`이 `useLocation`으로 판단, `hideFooter` 하드코딩 분기 1곳 허용).

## 3. 가드 · 리다이렉트

- 인증 가드는 **라우트 레벨이 아니라 액션 레벨**: 예약/접수 "확정" 버튼에서 `useAuth()` 미로그인 시 LoginGate 모달 → 성공 후 이어서 제출. 페이지 접근 자체는 전부 게스트 허용 (Guest-first).
- `/loop/:lineId` — lineId 검증 실패 시 `<Navigate to="/loop" replace />`.
- `/ticket/:bookingId` — 존재하지 않는 id는 EmptyState("Booking not found") 렌더(404 라우트 이동 아님).

## 4. 공통 동작

- 라우트 변경 시: 스크롤 top 복원(`ScrollRestoration` 커스텀 훅), GlassDock 수축, 진행 중 시트/다이얼로그 닫기.
- 페이지 title: `Cheongchun Line — {페이지 키}` (사전 키 `meta.title.*`).
- 내부 이동은 전부 `<Link>`/`useNavigate` — `<a href>`는 외부 링크만(`rel="noopener"`).


---

## v5 신규·변경 라우트 (React Router v6 · RequireAuth 기존 래핑 동일)

> 기존 라우트·가드는 삭제/리네임 금지.

| path | element | 가드 | 비고 |
|---|---|---|---|
| /gts | (변경) → /gts/quiz 리다이렉트 | RequireAuth | 기존 /gts=setup 진입점을 quiz로. /gts/setup 직접경로 유지 |
| /gts/quiz | GtsQuiz | RequireAuth + useGtsGuard | 신설 · 게이미피케이션 설문 |
| /gts/build | GtsBuild(개조) | 기존 | 추천 결과 단일 풀 · 식사플랜 폐지 |
| /gts/route | GtsRoute | 기존 | ItineraryMap 재사용 · go 링크 추가 |
| /gts/go | GtsGo | RequireAuth + useGtsGuard | 신설 · 현위치→첫 장소 교통 |
| /gts/setup | GtsSetup | 기존 유지 | route에서 "차량으로 이동" 링크로만 진입(심사 경로 밖) |
| /gts/checkout | 기존 유지 | 기존 | BM 근거로 남김 |
| /stamp/:spotId/:t | GtsStamp | RequireAuth | [V5-6] NFC 성지 스탬프(스티커 URL · 토큰은 로그인 후에도 남게 경로에 둔다 · IA §11.12) |

- [V5-6] `ResetToHomeOnLoad`([V20] 새로고침·직접 URL 진입 시 홈 리셋) 예외에 `/stamp/*` 를 넣었다. NFC 태그는 항상 새 탭 전체 로드라 예외가 없으면 스탬프를 찍을 수 없다(`/admin` 과 같은 사유).

- useGtsGuard 스텝 순서 = quiz → build → route → go. setup·checkout은 별도 분기(가드 재설계는 IA §11 세션).
- 나머지 라우트(/gate, /ticket, /travel-log, /reviews, /admin, /loop 등) 전부 불변.
- [V5-3] 구현: `/gts` → `<Navigate to="/gts/quiz" replace />`(헤더 Tour Builder 링크 = 취향 찾기 진입). 가드 = build: 추천 결과 있음 / route: 정원(q4 반나절 3·하루 4)만큼 담음 /
  go: route 경유 + 코스 있음 / checkout: route 경유(기존). setup은 가드 없음 · route "차량으로 이동" → setup CTA는 route 경유면 checkout 직행(Travel Log 템플릿과 동일 분기).
  meta.title 키 gtsQuiz·gtsGo 추가(PageLayout routeKeyFromPath).
