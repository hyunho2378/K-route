// 헤더 v3.2(DESIGN §16.4 · visitkorea 스케일) · 전 라우트 불투명.
// 높이 80 고정 — 스크롤 축소·글래스 전환 폐지(사용자 결정). 메뉴 17px 600 간격 32+.
// [V17] 모바일 내비 = 우측 햄버거(MobileMenu) · 데스크탑(lg+)은 상단 인라인 내비+언어·통화·계정 유지.
//   GlassDock(하단 바) 폐지(발견 가능성 이슈) — 브레이크포인트 경계에서 두 방식이 겹치거나 둘 다 사라지지 않게 lg로 분기.
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import LoginGate from '../ui/LoginGate';
import LogoutConfirm from '../ui/LogoutConfirm';
import usePopExit from '../ui/usePopExit';
import Avatar from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';
import LangMenu from './LangMenu';
import CurrencyMenu from './CurrencyMenu'; // [V12]
import MobileMenu from './MobileMenu'; // [V17] 모바일 햄버거

// [V10] 4항목: Trip Planner | Tour Builder | Travel Log | Reviews — About 비공개([3])로 내비에서 제거
const MENU = [
  { to: '/gate', k: 'nav.gate' },
  { to: '/gts', k: 'nav.gts' },
  { to: '/travel-log', k: 'nav.travelLog' },
  { to: '/reviews', k: 'nav.reviews' },
];

export default function Header() {
  const { user } = useAuth();
  const { t } = useLang();
  // [V1] 비로그인 Sign in → 글래스 로그인 모달 / 아바타 → 팝 메뉴 → 로그아웃 확인 모달
  const [loginOpen, setLoginOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [instantPop, setInstantPop] = useState(false);
  const { mounted: menuMounted, closing: menuClosing } = usePopExit(menuOpen, instantPop);
  const menuRootRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onDown = (e) => {
      if (!menuRootRef.current?.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [menuOpen]);
  // §35 스크롤 엣지 페이드 표시용 boolean · 헤더 치수는 스크롤과 무관하게 80px 고정(사용자 결정 유지)
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // scroll 이벤트는 브라우저가 프레임당 병합 · boolean 비교라 rAF 스로틀 불필요
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    // §18.1: <lg 모바일 컴팩트 헤더 56(메뉴 없음 · Dock이 내비 소유) / lg+ 풀 헤더 80
    <header className="chrome fixed inset-x-0 top-0 z-header h-56 lg:h-80">
      <div className="mx-auto flex h-full w-full max-w-lg items-center justify-between px-16 md:px-24 lg:px-40 2xl:max-w-2xl 3xl:max-w-3xl">
        {/* [V5-18-1] 이미지 로고(G 심볼) 폐지 → 텍스트 워드마크 "K-Route" 단독(사용자 지시 · 새 로고 디자인 금지).
            "Global Tourism System"(22자)은 375px 폭 초과라 모바일에서 숨겼었지만 "K-Route"(7자)는 폭 문제가 없어
            hidden lg:inline 을 없애고 전 폭에서 상시 노출한다(발견 가능성 우선) · 히트 영역 44(§18.3)는 유지. */}
        <Link
          to="/"
          aria-label={t('nav.home')}
          className="-ml-8 flex min-h-44 items-center rounded-md pl-8 pr-8"
        >
          <span className="whitespace-nowrap font-display text-logo font-semibold tracking-display text-primary">
            K-Route
          </span>
        </Link>
        {/* [V17] 데스크탑 전용 인라인 메뉴(lg+) · 모바일 내비는 우측 햄버거(MobileMenu)가 소유 */}
        <nav className="hidden items-center gap-32 lg:flex">
          {MENU.map(({ to, k }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex min-h-44 items-center text-menu font-semibold tracking-glass transition-colors duration-fast ${
                  isActive ? 'text-primary' : 'text-ink hover:text-primary'
                }`
              }
            >
              {/* [v4.4-2] 단일 언어 렌더 · LangSwap 겹침 유령 폭이 시각 간격을 깨던 원인 수리 */}
              {t(k)}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-8">
          {/* [V17] 데스크탑(lg+): 언어·통화·계정 인라인 · 모바일은 아래 햄버거가 소유 */}
          <div className="hidden items-center gap-8 lg:flex">
          <LangMenu />
          {/* [V12] 통화 선택 · 언어 옆 */}
          <CurrencyMenu />
          {user ? (
            <div ref={menuRootRef} className="relative">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                // [V4] ID/PIN 유저는 email null → username 폴백(@id)로 식별 표기
                aria-label={user.email || `@${user.username}`}
                title={user.email || `@${user.username}`}
                onClick={(e) => {
                  setInstantPop(e.detail === 0);
                  setMenuOpen((v) => !v);
                }}
                className="flex h-44 w-44 items-center justify-center"
              >
                {/* [V10] 아바타 = Blob 사진 있으면 이미지, 없으면 이니셜(Avatar 공용) */}
                <Avatar user={user} size={32} />
              </button>
              {menuMounted && (
                <div
                  role="menu"
                  aria-hidden={menuClosing || undefined}
                  className={`pop-panel origin-top-right ${instantPop ? 'pop-instant' : ''} absolute right-0 top-full z-dialog mt-8 flex w-max flex-col rounded-md bg-white p-8 shadow-md ${menuClosing ? 'pop-panel-exit' : ''}`}
                >
                  <p className="px-12 py-8 text-caption font-medium text-inkMeta">{user.email || `@${user.username}`}</p>
                  {/* [V10] 프로필 진입 */}
                  <Link
                    to="/profile"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex min-h-44 w-full items-center rounded-sm px-12 text-left text-small font-semibold text-ink transition-colors duration-fast hover:bg-surface"
                  >
                    <LangSwap k="nav.profile" />
                  </Link>
                  {/* 관리자 전용 · 서버 판정(/api/me isAdmin)만 신뢰 — 비관리자는 DOM에도 미렌더(존재 비노출).
                      라벨은 관리자 내부 도구라 영어 하드카피(AdminPage와 동일 예외) */}
                  {user.isAdmin && (
                    <a
                      href="/admin"
                      target="_blank"
                      rel="noopener"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      className="flex min-h-44 w-full items-center rounded-sm px-12 text-left text-small font-semibold text-ink transition-colors duration-fast hover:bg-surface"
                    >
                      Dashboard
                    </a>
                  )}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      setLogoutOpen(true); // [V1] 확인 모달 경유
                    }}
                    className="flex min-h-44 w-full items-center rounded-sm px-12 text-left text-small font-semibold text-ink transition-colors duration-fast hover:bg-surface"
                  >
                    <LangSwap k="nav.logout" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className="pressable flex min-h-44 items-center rounded-pill px-16 text-small font-semibold text-primary"
            >
              <LangSwap k="nav.login" />
            </button>
          )}
          </div>
          {/* [V17] 모바일 햄버거 · 언어·통화·계정·내비 전부 패널 안(GlassDock 대체) */}
          <MobileMenu />
        </div>
      </div>
      {/* §35 스크롤 엣지 페이드 · 콘텐츠와 겹칠 때만(스크롤 0 비표시), 1px 경계선 금지 유지 */}
      <div
        aria-hidden="true"
        className={`chrome-fade pointer-events-none absolute inset-x-0 top-full h-12 transition-opacity duration-fast ${
          scrolled ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <LoginGate open={loginOpen} onClose={() => setLoginOpen(false)} returnTo={window.location.pathname} />
      <LogoutConfirm open={logoutOpen} onClose={() => setLogoutOpen(false)} />
    </header>
  );
}
