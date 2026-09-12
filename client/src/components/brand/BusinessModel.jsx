// About §9 Business model(IA §2.8.9) · BMC 9블록 그리드(무보더 카드) + 수익 구조 한 줄.
// 카피는 docs/BRAND_COPY.md §9(brand.bm.*) · 블록 라벨은 BMC 영문 용어 그대로(3언어 공통).
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';
import Section from '../layout/Section';

const BLOCKS = [
  'partners',
  'activities',
  'resources',
  'value',
  'relationships',
  'channels',
  'segments',
  'cost',
  'revenue',
];

export default function BusinessModel() {
  const { t } = useLang();
  return (
    <Section id="business-model" title="brand.bm.title">
      <div className="flex flex-col gap-24">
        <LangSwap k="brand.bm.oneLiner" as="p" className="text-h3 font-medium text-inkSec" />
        <ul className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-3 lg:gap-24">
          {BLOCKS.map((b) => (
            <li key={b} className="flex flex-col gap-8 rounded-lg bg-white p-24 shadow-sm">
              <LangSwap
                k={`brand.bm.blocks.${b}.label`}
                as="h3"
                className="text-caption font-medium uppercase tracking-eyebrow text-inkMeta"
              />
              {/* 요약 문구 · t() 직접 렌더 허용 영역(PATTERNS §1) */}
              <p className="text-small font-medium">{t(`brand.bm.blocks.${b}.body`)}</p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
