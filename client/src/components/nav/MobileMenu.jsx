// [V17] 모바일 햄버거 메뉴 · GlassDock(하단 바) 대체 — 발견 가능성 우선(심미성보다).
//   헤더 우측 44x44 햄버거 → 우측 슬라이드 풀하이트 패널(스크림·스크롤락·ESC·스크림탭 닫기·포커스 트랩).
//   그룹: 주 내비 / 계정(로그인 분기) / 설정(Language·Currency) / 하단(Team·Privacy·Terms·메일).
//   현재 라우트 = 좌측 인디케이터 + 색상 · 항목 탭 시 닫고 이동 · 텍스트 라벨 병기(아이콘만 금지).
//   첫 방문 1회 햄버거 펄스(2초) · 웹스토리지 금지(DESIGN §13)라 모듈 인메모리 플래그(앱 로드당 1회).
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../i18n/LangContext';
import { CURRENCY_ORDER, CURRENCY_SYMBOL, useCurrency } from '../../context/CurrencyContext';
import LangSwap from '../../i18n/LangSwap';
import Button from '../ui/Button';
import LoginGate from '../ui/LoginGate';
import LogoutConfirm from '../ui/LogoutConfirm';
import useBodyScrollLock from '../ui/useBodyScrollLock';
import { motion } from '../../tokens';

// 헤더/데스크탑 내비와 동일 4항목(About 비공개 제거)
const MENU = [
  { to: '/gate', k: 'nav.gate' },
  { to: '/gts', k: 'nav.gts' },
  { to: '/travel-log', k: 'nav.travelLog' },
  { to: '/reviews', k: 'nav.reviews' },
];
const LANGS = ['en', 'ko', 'th'];

// [V17] 첫 방문 1회 펄스 · 웹스토리지 금지 → 모듈 인메모리(앱 로드당 1회, 이후 표시 안 함)
let hintShown = false;

const trapTab = (e, root) => {
  const els = root.querySelectorAll(
    'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  if (!els.length) return;
  const first = els[0];
  const last = els[els.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
};

// 활성 좌측 인디케이터
function ActiveBar({ on }) {
  return on ? (
    <span aria-hidden="true" className="absolute left-0 top-1/2 h-24 w-3 -translate-y-1/2 rounded-pill bg-primary" />
  ) : null;
}

const navItemClass = (active) =>
  `relative flex min-h-48 items-center gap-12 rounded-md pl-16 pr-12 text-body font-semibold transition-colors duration-fast ${
    active ? 'bg-primary/10 text-primary' : 'text-ink hover:bg-surface'
  }`;

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [hint, setHint] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lang, setLang, t } = useLang();
  const { currency, setCurrency } = useCurrency();
  const panelRef = useRef(null);
  const triggerRef = useRef(null);

  useBodyScrollLock(open);

  // 라우트 변경 시 닫기
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // [V17] 첫 방문 1회 펄스(2초 · reduced-motion 정적)
  useEffect(() => {
    if (hintShown) return undefined;
    hintShown = true;
    setHint(true);
    const tm = setTimeout(() => setHint(false), 2000);
    return () => clearTimeout(tm);
  }, []);

  // ESC 닫기 + 열림 시 패널 포커스(포커스 트랩 시작점)
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    const raf = requestAnimationFrame(() => panelRef.current?.focus());
    return () => {
      window.removeEventListener('keydown', onKey);
      cancelAnimationFrame(raf);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      {/* 햄버거 버튼 · 모바일 전용(lg:hidden) · 44x44 · 첫 방문 펄스 */}
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={t('nav.menu')}
        onClick={() => setOpen(true)}
        className={`flex h-44 w-44 items-center justify-center rounded-pill text-ink lg:hidden ${hint ? 'bh-ham-hint' : ''}`}
      >
        <Menu size={24} aria-hidden="true" />
      </button>
      <style>{`
        .bh-ham-hint { animation: bh-ham-pulse 1000ms ease-in-out 2; }
        @keyframes bh-ham-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.14); } }
        @keyframes bh-menu-slide { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes bh-menu-fade { from { opacity: 0; } to { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          .bh-ham-hint, .bh-menu-panel, .bh-menu-scrim { animation: none !important; }
        }
      `}</style>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-dialog lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label={t('nav.menu')}
            onKeyDown={(e) => {
              if (e.key === 'Tab') trapTab(e, panelRef.current);
            }}
          >
            {/* 스크림(어둡게) · 클릭 닫기 */}
            <div
              aria-hidden="true"
              onClick={close}
              className="bh-menu-scrim absolute inset-0 bg-scrim"
              style={{ animation: `bh-menu-fade 240ms ${motion.easeOut}` }}
            />
            {/* 우측 슬라이드 풀하이트 패널 */}
            <div
              ref={panelRef}
              tabIndex={-1}
              className="bh-menu-panel absolute inset-y-0 right-0 flex w-[86%] max-w-[360px] flex-col bg-white shadow-lg"
              // [V18] 열림 0.1s 더 느리게(280→380) + 드로어 이징(부드럽게)
              style={{ animation: `bh-menu-slide 380ms ${motion.easeDrawer}` }}
            >
              <div className="flex items-center justify-between px-16 py-12">
                <span className="font-display text-small font-semibold uppercase tracking-eyebrow text-inkMeta">
                  <LangSwap k="nav.menu" />
                </span>
                <button
                  type="button"
                  aria-label={t('common.close')}
                  onClick={close}
                  className="flex h-44 w-44 items-center justify-center rounded-pill text-inkSec hover:text-ink"
                >
                  <X size={22} aria-hidden="true" />
                </button>
              </div>

              <div
                className="flex-1 overflow-y-auto scroll-quiet px-8"
                style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
              >
                {/* 주 내비 */}
                <nav className="flex flex-col gap-2">
                  {MENU.map(({ to, k }) => (
                    <NavLink key={to} to={to} onClick={close} className={({ isActive }) => navItemClass(isActive)}>
                      {({ isActive }) => (
                        <>
                          <ActiveBar on={isActive} />
                          <LangSwap k={k} />
                        </>
                      )}
                    </NavLink>
                  ))}
                </nav>

                {/* 계정 */}
                <div className="mt-8 flex flex-col gap-2 border-t border-line pt-8">
                  {user ? (
                    <>
                      {/* [V18] 프로필 옆 원형 아이콘(Avatar) 제거 — 텍스트 라벨만 */}
                      <NavLink to="/profile" onClick={close} className={({ isActive }) => navItemClass(isActive)}>
                        {({ isActive }) => (
                          <>
                            <ActiveBar on={isActive} />
                            <LangSwap k="nav.profile" />
                          </>
                        )}
                      </NavLink>
                      {user.isAdmin && (
                        // 관리자 도구 · 영어 하드카피(Header와 동일 예외)
                        <a href="/admin" target="_blank" rel="noopener" onClick={close} className={navItemClass(false)}>
                          Dashboard
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          close();
                          setLogoutOpen(true);
                        }}
                        className={`${navItemClass(false)} w-full text-left`}
                      >
                        <LangSwap k="nav.logout" />
                      </button>
                    </>
                  ) : (
                    // 비로그인 = 강조된 Log in
                    <div className="grid px-8 py-4">
                      <Button
                        onClick={() => {
                          close();
                          setLoginOpen(true);
                        }}
                      >
                        <LangSwap k="nav.login" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* 설정 · Language / Currency */}
                <div className="mt-8 border-t border-line pt-12">
                  <p className="px-16 pb-8 text-caption font-semibold uppercase tracking-eyebrow text-inkMeta">
                    <LangSwap k="common.language" />
                  </p>
                  <div role="group" aria-label={t('common.language')} className="flex flex-wrap gap-8 px-16">
                    {LANGS.map((code) => (
                      <button
                        key={code}
                        type="button"
                        aria-pressed={lang === code}
                        onClick={() => setLang(code)}
                        className={`inline-flex min-h-40 items-center rounded-pill px-16 text-small font-semibold transition-colors duration-fast ${
                          lang === code ? 'bg-primary text-white' : 'bg-surface text-inkSec'
                        }`}
                      >
                        {t(`common.lang.${code}`)}
                      </button>
                    ))}
                  </div>
                  <p className="px-16 pb-8 pt-16 text-caption font-semibold uppercase tracking-eyebrow text-inkMeta">
                    <LangSwap k="common.money.label" />
                  </p>
                  <div role="group" aria-label={t('common.money.label')} className="flex flex-wrap gap-8 px-16">
                    {CURRENCY_ORDER.map((code) => (
                      <button
                        key={code}
                        type="button"
                        aria-pressed={currency === code}
                        onClick={() => setCurrency(code)}
                        className={`inline-flex min-h-40 items-center gap-4 rounded-pill px-12 font-display text-small font-semibold transition-colors duration-fast ${
                          currency === code ? 'bg-primary text-white' : 'bg-surface text-inkSec'
                        }`}
                      >
                        <span className={currency === code ? 'text-white' : 'text-inkMeta'}>{CURRENCY_SYMBOL[code]}</span>
                        {code}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 하단 · Privacy / Terms / 공식 메일 ([V18] Team 제거 — 푸터에만 둔다) */}
                <div className="mt-8 flex flex-col gap-1 border-t border-line pt-8">
                  <a
                    href="/legal/privacy"
                    target="_blank"
                    rel="noopener"
                    onClick={close}
                    className="flex min-h-44 items-center px-16 text-small font-medium text-inkSec hover:text-ink"
                  >
                    <LangSwap k="common.footer.privacy" />
                  </a>
                  <a
                    href="/legal/terms"
                    target="_blank"
                    rel="noopener"
                    onClick={close}
                    className="flex min-h-44 items-center px-16 text-small font-medium text-inkSec hover:text-ink"
                  >
                    <LangSwap k="common.footer.terms" />
                  </a>
                  <a
                    href="mailto:official@cheongchun.app"
                    className="flex min-h-44 items-center px-16 font-display text-small font-medium text-primary"
                  >
                    official@cheongchun.app
                  </a>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      <LoginGate open={loginOpen} onClose={() => setLoginOpen(false)} returnTo={pathname} />
      <LogoutConfirm open={logoutOpen} onClose={() => setLogoutOpen(false)} />
    </>
  );
}
