// 라우터 셸 v4 · IA §9.1 — /gts 4단계 신설, 구 loop 계열 라우트 제거(파일은 DEPRECATED 보존).
// 리다이렉트: /loop* → /gts(=setup), /hands-free·/gate/hands-free → /gts/setup, /pilot → /about.
// GtsProvider 전역 배선(§31 — 스텝 상태는 라우트 이동에도 유지, 새로고침 시 setup부터).
import { useEffect, useRef } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import PageLayout from './components/layout/PageLayout';
import RequireAuth from './components/ui/RequireAuth'; // [V1]
import { ArrivalProvider } from './context/ArrivalContext';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { CurrencyProvider } from './context/CurrencyContext'; // [V12]
import { GtsProvider } from './context/GtsContext';
import { LangProvider } from './i18n/LangContext';
// [V10] About는 비공개(HIDDEN) — 라우트가 404 위장을 렌더하므로 import하지 않음(pages/About.jsx는 보존).
import Team from './pages/Team'; // [V10]
import Profile from './pages/Profile'; // [V10]
import Gate from './pages/Gate';
import GtsBuild from './pages/GtsBuild';
import GtsCheckout from './pages/GtsCheckout';
import GtsGo from './pages/GtsGo'; // [V5-3]
import GtsQuiz from './pages/GtsQuiz'; // [V5-3]
import GtsRoute from './pages/GtsRoute';
import GtsStamp from './pages/GtsStamp'; // [V5-6]
import GtsSetup from './pages/GtsSetup';
import Home from './pages/Home';
import LegalPrivacy from './pages/LegalPrivacy';
import LegalTerms from './pages/LegalTerms';
import NotFound from './pages/NotFound';
import AdminPage from './pages/AdminPage'; // [V1] 헤더 링크 없음 · 직접 URL 진입만
import AdminUsers from './pages/AdminUsers'; // [V11] User Management(2차 게이트 경유)
import Reviews from './pages/Reviews';
import TravelLog from './pages/TravelLog'; // [V3] 발자취(공개 열람 · 템플릿 시작은 /gts 가드 경유)
import Ticket from './pages/Ticket';

// [V20] 새로고침·직접 URL 진입 시 홈으로 리셋(사용자 요청) — 앱 최초 마운트(=전체 페이지 로드) 1회만 동작.
//   SPA 내부 네비게이션은 App이 재마운트되지 않아 영향 없음(정상 이동). 트레이드오프: OAuth 복귀·
//   /ticket 딥링크도 홈으로 이동함(필요 시 예외 경로 화이트리스트 가능 — 보고에 명시).
function ResetToHomeOnLoad() {
  const navigate = useNavigate();
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    // [V25] /admin(대시보드 첫 진입)은 아바타·햄버거 메뉴의 Dashboard 링크가 새 탭(target=_blank)으로 여는
    //   전체 페이지 로드다 — 여기서 홈으로 리셋하면 관리자 진입 자체가 막힌다(회귀). 이 경로만 예외 처리.
    //   (/admin/users는 2차 인증 게이트 유지를 위해 예외 아님 — 대시보드 내 버튼 경유 SPA 이동만 허용.)
    //   [V5-6] /stamp/* 도 예외다: NFC 스티커는 늘 새 탭 전체 로드로 열리므로 여기서 홈으로 돌리면 스탬프를 찍을 수 없다(기능 자체가 막힌다).
    const path = window.location.pathname;
    if (path !== '/' && path !== '/admin' && !path.startsWith('/stamp/')) navigate('/', { replace: true });
  }, [navigate]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <LangProvider>
        <CurrencyProvider>
        <AuthProvider>
          <BookingProvider>
            <ArrivalProvider>
              <GtsProvider>
                <ResetToHomeOnLoad />
                <Routes>
                  <Route element={<PageLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/gate" element={<Gate />} />
                    {/* [V5-3] /gts = 취향 찾기(IA §11.2 진입점 setup→quiz · ROUTES v5) · /gts/setup은 route '차량으로 이동' 보조 진입 */}
                    <Route path="/gts" element={<Navigate to="/gts/quiz" replace />} />
                    {/* [V5-12] 케이로드 전 구간 공개 · 심사위원은 로그인하지 않는다(로그인 벽이 있으면 데모 자체가 열리지 않는다).
                        서버도 추천·동선·확산·축제·집중률·챗은 이미 비로그인으로 동작하고, 스탬프는 게스트 폴백을 넣었다.
                        로그인이 실제로 필요한 곳(/profile·관리자)만 가드를 유지한다. */}
                    <Route path="/gts/setup" element={<GtsSetup />} />
                    <Route path="/gts/build" element={<GtsBuild />} />
                    <Route path="/gts/route" element={<GtsRoute />} />
                    <Route path="/gts/checkout" element={<GtsCheckout />} />
                    {/* [V5-3] K-Route 취향 찾기·출발(IA §11.3·§11.7) */}
                    <Route path="/gts/quiz" element={<GtsQuiz />} />
                    <Route path="/gts/go" element={<GtsGo />} />
                    {/* [V5-6] NFC 성지 스탬프(IA §11.10 개정 · 스티커 URL) · [V5-12] 게스트는 이번 세션 화면 표시만(서버 저장 없음) */}
                    <Route path="/stamp/:spotId/:t" element={<GtsStamp />} />
                    <Route path="/ticket/:bookingId" element={<Ticket />} />
                    <Route path="/travel-log" element={<TravelLog />} />
                    <Route path="/reviews" element={<Reviews />} />
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/admin/users" element={<AdminUsers />} />
                    {/* [V10] 프로필(로그인 필수) · 팀 소개(공개) */}
                    <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
                    <Route path="/team" element={<Team />} />
                    {/* [V10] About HIDDEN · 접근 시 404 위장(라우트·파일 보존 · 내비/푸터 링크 제거) */}
                    <Route path="/about" element={<NotFound />} />
                    <Route path="/legal/privacy" element={<LegalPrivacy />} />
                    <Route path="/legal/terms" element={<LegalTerms />} />
                    {/* v4 리다이렉트 · 구 링크 생존(§9.1) */}
                    <Route path="/loop/*" element={<Navigate to="/gts" replace />} />
                    <Route path="/hands-free" element={<Navigate to="/gts/setup" replace />} />
                    <Route path="/gate/hands-free" element={<Navigate to="/gts/setup" replace />} />
                    <Route path="/pilot" element={<Navigate to="/about" replace />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </GtsProvider>
            </ArrivalProvider>
          </BookingProvider>
        </AuthProvider>
        </CurrencyProvider>
      </LangProvider>
    </BrowserRouter>
  );
}
