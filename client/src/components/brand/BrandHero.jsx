// About §1 Brand hero(IA §2.8.1) · 로고 + "We move you to the story." + 실사 배경.
// 풀블리드 허용(히어로 · DESIGN §5). 스크림은 평면 오버레이(그라데이션 예산은 Home 히어로 1곳뿐).
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';
import Container from '../layout/Container';

export default function BrandHero() {
  const { t } = useLang();
  return (
    <header className="relative flex items-center overflow-hidden">
      {/* PLACEHOLDER · 히어로 실사진(텍스트 없는 실사) 3~4일차 촬영 교체(PROGRESS 준비물) */}
      <img
        src="/images/hero.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-scrim" />
      <div className="relative w-full">
        <Container>
          {/* min-height는 DESIGN §5 히어로 명세값(clamp) · 문서화된 인라인 예외(PROGRESS) */}
          <div
            className="flex flex-col justify-center gap-24 py-96"
            style={{ minHeight: 'clamp(560px, 72vh, 960px)' }}
          >
            <p className="font-display text-h3 font-bold tracking-display text-white">
              {t('common.brandName')}
            </p>
            <div className="flex flex-col gap-16">
              <LangSwap
                k="brand.hero.title"
                as="h1"
                className="font-display text-h1 font-bold tracking-display text-white"
              />
              {/* 장문 서브 · t() 직접 렌더 허용 영역(PATTERNS §1) */}
              <p className="text-h3 font-medium text-white">{t('brand.hero.sub')}</p>
            </div>
          </div>
        </Container>
      </div>
    </header>
  );
}
