// About §2·§3 Problem 섹션(IA §2.8.2~3) · 넘버링 카드 3(Return Hound 레퍼런스).
// props: { id, titleKey, cardKeys } · cardKeys = brand.{before|after}.cards.* 경로 3개.
// 카피는 docs/BRAND_COPY.md 이식분(brand 네임스페이스). 무보더 카드(shadow.sm · DESIGN §7).
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';
import Section from '../layout/Section';

export default function ProblemCards({ id, titleKey, cardKeys }) {
  const { t } = useLang();
  return (
    <Section id={id} title={titleKey}>
      <ol className="grid grid-cols-1 gap-16 md:grid-cols-3 md:gap-24">
        {cardKeys.map((key, i) => (
          <li
            key={key}
            className="flex flex-col gap-12 rounded-lg bg-white p-24 shadow-sm transition-all duration-fast hover:-translate-y-0.5 hover:shadow-md"
          >
            {/* 번호는 실제 순서 · 숫자 마커 허용(COMPONENTS B HowItWorks 준용), Kanit Bold */}
            <span aria-hidden="true" className="font-display text-h2 font-bold tracking-display text-primary">
              {String(i + 1).padStart(2, '0')}
            </span>
            <LangSwap k={`${key}.title`} as="h3" className="text-h3 font-semibold" />
            {/* 본문 장문 · t() 직접 렌더 허용 영역(PATTERNS §1) */}
            <p className="text-small font-medium text-inkSec">{t(`${key}.body`)}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
