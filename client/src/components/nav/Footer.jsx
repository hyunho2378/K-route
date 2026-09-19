// 푸터 v3.2(DESIGN §16.5 압축) · primary 풀블리드, 세로 2단.
// 240px 캡은 Explore 세로 나열(사용자 지시)과 양립 불가라 해제 — DESIGN §16.5에 반영.
// 1단: 로고+한 문장 / Explore 세로 나열 / Contact 이메일(우측 인셋). 2단: © | Privacy · Terms(새 탭).
// 대회 풀네임·주소성 텍스트 금지. 언어 진입점은 헤더 LangMenu 단일.
import { Link } from 'react-router-dom';
import LangSwap from '../../i18n/LangSwap';
import Container from '../layout/Container';
import { useLang } from '../../i18n/LangContext';

// [V10] Explore: About 제거([3]) · Travel Log를 Reviews 위에 추가([5]).
const EXPLORE = [
  { to: '/gate', k: 'nav.gate' },
  { to: '/gts', k: 'nav.gts' },
  { to: '/travel-log', k: 'nav.travelLog' },
  { to: '/reviews', k: 'nav.reviews' },
];

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="bg-primary text-white">
      <Container>
        <div className="flex flex-col gap-24 py-32 lg:flex-row lg:items-start lg:justify-between lg:gap-40">
          {/* [V18] 모바일: 슬로건 아래 여백 확대(mb-16)로 Explore 섹션과 명확히 분리 · lg는 gap-40 유지 */}
          {/* [V5-18-1] 이미지 로고(G 심볼) 폐지 → 텍스트 워드마크 "K-Route" 단독(Header 와 동일 결정) */}
          <div className="mb-16 flex flex-col gap-8 lg:mb-0">
            <span className="font-display text-logo font-semibold">{t('common.brandName')}</span>
            <LangSwap k="common.footer.tagline" as="p" className="text-small font-medium" />
          </div>
          <div className="flex flex-col gap-8">
            <LangSwap
              k="common.footer.explore"
              as="p"
              className="text-caption font-semibold uppercase tracking-eyebrow"
            />
            <ul className="flex flex-col">
              {EXPLORE.map(({ to, k }) => (
                <li key={to}>
                  <Link to={to} className="inline-flex min-h-44 items-center text-small font-semibold">
                    <LangSwap k={k} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-8 lg:mr-96">
            <LangSwap
              k="common.footer.contact"
              as="p"
              className="text-caption font-semibold uppercase tracking-eyebrow"
            />
            <a
              href="mailto:official@k-route.app"
              className="inline-flex min-h-44 items-center font-display text-small font-semibold"
            >
              official@k-route.app
            </a>
          </div>
        </div>
        {/* [V18] 모바일: flex-col-reverse로 저작권 줄을 항상 최하단에(링크 위→저작권 아래) · sm+는 좌우 배치 */}
        <div className="flex flex-col-reverse gap-8 pb-24 sm:flex-row sm:items-center sm:justify-between">
          {/* [V10] "Team Bomnae Helper"를 /team 링크로 · 앞뒤 텍스트는 pre/post(t로 유령폭 회피) */}
          <p className="text-caption font-medium">
            {t('common.footer.copyrightPre')}
            {/* [V18] 밑줄 제거 · hover 시에만 색 변화(§17 링크 문법) */}
            <Link to="/team" className="font-semibold transition-colors duration-fast hover:text-white/70">
              {t('common.footer.teamName')}
            </Link>
            {t('common.footer.copyrightPost')}
          </p>
          <div className="flex items-center gap-24">
            {/* 내부 경로지만 새 탭 의도라 a 태그 허용(PATTERNS §17 유일 예외) */}
            <a
              href="/legal/privacy"
              target="_blank"
              rel="noopener"
              className="inline-flex min-h-44 items-center text-caption font-semibold"
            >
              <LangSwap k="common.footer.privacy" />
            </a>
            <a
              href="/legal/terms"
              target="_blank"
              rel="noopener"
              className="inline-flex min-h-44 items-center text-caption font-semibold"
            >
              <LangSwap k="common.footer.terms" />
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
