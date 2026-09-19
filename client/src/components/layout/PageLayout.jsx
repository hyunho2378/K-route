// 셸 · Header + Outlet + Footer. [V17] GlassDock(하단 바) 폐지 — 모바일 내비는 Header의 햄버거(MobileMenu).
//   /travel-log만 Footer 숨김(풀블리드 지도 · ROUTES §2 분기 1곳 허용).
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useLang } from '../../i18n/LangContext';
import Footer from '../nav/Footer';
import Header from '../nav/Header';

// pathname → meta.title 키 (v4 라우트 기준 · 구 loop 분기는 리다이렉트 경유라 잔존 무해).
export function routeKeyFromPath(pathname) {
  if (pathname === '/') return 'home';
  if (pathname === '/gate') return 'gate';
  if (pathname === '/gts') return 'gtsIntro'; // [V5-15] 인트로(구 setup 리다이렉트 자리)
  if (pathname === '/gts/setup') return 'gtsSetup';
  if (pathname === '/gts/build') return 'gtsBuild';
  if (pathname === '/gts/route') return 'gtsRoute';
  if (pathname === '/gts/checkout') return 'gtsCheckout';
  if (pathname === '/gts/quiz') return 'gtsQuiz'; // [V5-3]
  if (pathname === '/gts/go') return 'gtsGo'; // [V5-3]
  if (pathname.startsWith('/stamp/')) return 'stamp'; // [V5-6]
  if (pathname === '/travel-log') return 'travelLog'; // [V3]
  if (pathname === '/hands-free' || pathname === '/gate/hands-free') return 'handsfree';
  if (pathname === '/loop') return 'loop';
  if (/^\/loop\/[^/]+\/book\/?$/.test(pathname)) return 'booking';
  if (/^\/loop\/[^/]+\/?$/.test(pathname)) return 'lineDetail';
  if (pathname.startsWith('/ticket/')) return 'ticket';
  if (pathname === '/reviews') return 'reviews';
  if (pathname === '/team') return 'team'; // [V10]
  if (pathname === '/profile') return 'profile'; // [V10]
  // [V10] /about·/pilot은 비공개(HIDDEN) — meta 타이틀도 notFound로 폴백(404 위장 완성). 아래 default가 처리.
  if (pathname === '/legal/privacy') return 'legalPrivacy';
  if (pathname === '/legal/terms') return 'legalTerms';
  return 'notFound';
}

export default function PageLayout() {
  const { pathname } = useLocation();
  const { t } = useLang();
  const routeKey = routeKeyFromPath(pathname);
  // [V3] /travel-log = 풀블리드 지도(구 /loop 셸 재활용) — 보존해 둔 Footer 숨김 분기 재사용
  const hideFooter = pathname === '/travel-log';

  // 페이지 title · "K-Route · {meta.title.*}" (ROUTES §4 · [V5-18-1] GTS 잔재 소탕)
  useEffect(() => {
    document.title = `K-Route · ${t(`meta.title.${routeKey}`)}`;
  }, [routeKey, t]);

  // [H2-3] 라우트 변경 시 항상 최상단(결제→티켓 replace 포함) · 해시 앵커(#proof) 이동만 예외
  useEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <Header />
      {/* [H2-4] 짧은 페이지 푸터 밀어내기 · 헤더는 fixed(문서 공간 미점유)라 main이 top 0부터
          시작 — min-height 100dvh로 푸터를 첫 화면 밖으로 민다.
          [V17] 하단 바(GlassDock) 폐지로 dock 여백(pb-96) 제거 — 하단 콘텐츠 잘림 없음(각 페이지 자체 하단 패딩 보유). */}
      <main className="relative z-content min-h-[100dvh]">
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
    </>
  );
}
