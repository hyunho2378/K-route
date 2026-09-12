// About §7 Local stories(IA §2.8.7) · 사장님·정류장 스토리 카드(감자밭 대표).
// 카피는 docs/BRAND_COPY.md §7(brand.stories.*) · 썸네일은 data/stories.js 자산 재사용.
import stories from '../../data/stories'; // api.js에 접근자 없음 · 직접 import(기 확정 결정)
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';
import Section from '../layout/Section';

// BRAND_COPY §7 스토리 → data/stories.js 썸네일 매핑
const CARDS = [
  { key: 'brand.stories.farm', storyId: 'gamja' },
  { key: 'brand.stories.roastery', storyId: 'roastery' },
];

export default function LocalStories() {
  const { t } = useLang();
  return (
    <Section id="local-stories" title="brand.stories.title">
      <ul className="grid grid-cols-1 gap-16 md:grid-cols-2 md:gap-24">
        {CARDS.map(({ key, storyId }) => {
          const story = stories.find((s) => s.id === storyId);
          return (
            <li key={key} className="overflow-hidden rounded-lg bg-white shadow-sm">
              {story && (
                <img
                  src={story.thumb} // PLACEHOLDER · 촬영 교체
                  alt=""
                  loading="lazy"
                  className="aspect-video w-full bg-surface object-cover"
                />
              )}
              <div className="flex flex-col gap-8 p-24">
                <LangSwap k={`${key}.title`} as="h3" className="text-h3 font-semibold" />
                {/* 본문 장문 · t() 직접 렌더 허용 영역(PATTERNS §1) */}
                <p className="text-small font-medium text-inkSec">{t(`${key}.body`)}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
