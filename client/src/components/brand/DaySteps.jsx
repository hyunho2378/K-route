// About §5 How a day works(IA §2.8.5) · 수평 단계 스트립 5.
// 카피는 docs/BRAND_COPY.md §5(brand.day.steps.s1~s5). 번호는 실제 순서 · 숫자 마커 허용.
import LangSwap from '../../i18n/LangSwap';
import Section from '../layout/Section';

const STEPS = ['s1', 's2', 's3', 's4', 's5'];

export default function DaySteps() {
  return (
    <Section id="how-a-day-works" title="brand.day.title">
      <ol className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-5 lg:gap-24">
        {STEPS.map((s, i) => (
          <li key={s} className="flex items-start gap-12 lg:flex-col">
            <span
              aria-hidden="true"
              className="flex h-32 w-32 shrink-0 items-center justify-center rounded-pill bg-primary font-display text-small font-semibold text-white"
            >
              {i + 1}
            </span>
            <LangSwap k={`brand.day.steps.${s}`} as="p" className="text-body font-medium" />
          </li>
        ))}
      </ol>
    </Section>
  );
}
