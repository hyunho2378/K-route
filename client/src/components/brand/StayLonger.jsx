// About §8 Stay longer(IA §2.8.8) · 1일 → 1박2일 → 롱스테이 확장 로드맵 타임라인.
// 카피는 docs/BRAND_COPY.md §8(brand.stay.steps.*).
import LangSwap from '../../i18n/LangSwap';
import Section from '../layout/Section';

const STEPS = ['day', 'overnight', 'long'];

export default function StayLonger() {
  return (
    <Section id="stay-longer" title="brand.stay.title">
      <ol className="flex flex-col">
        {STEPS.map((s, i) => (
          <li key={s} className="flex gap-16">
            {/* 수직 타임라인 · 노드 + 세로선(크롬 컬러 primary) */}
            <div aria-hidden="true" className="flex w-16 flex-col items-center">
              <span className="h-16 w-16 shrink-0 rounded-pill bg-primary" />
              {i < STEPS.length - 1 && <span className="w-4 flex-1 bg-line" />}
            </div>
            <LangSwap
              k={`brand.stay.steps.${s}`}
              as="p"
              className={`text-body font-medium ${i < STEPS.length - 1 ? 'pb-32' : ''}`}
            />
          </li>
        ))}
      </ol>
    </Section>
  );
}
