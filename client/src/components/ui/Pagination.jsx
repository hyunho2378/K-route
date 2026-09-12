// Pagination · [H2-11] 숫자 원형 인디케이터(전 카드 그리드 공통 — IA §10.4 페어 규정 대체).
// 시각 원 30px · 현재 = primary 배경 white 700 / 나머지 = white 면 ink 600 + shadow.sm.
// 숫자 클릭 = 해당 페이지 직행 · 키보드 ←→ 이동 유지.
// [V5-8] 히트 영역 36 → 44(§18.3 터치 타깃 · 시각 원 30은 그대로라 조밀도 불변) ·
//   arrows = 이전·다음 화살표 페어(기본 없음 · 페이지가 많은 목록만) · align = 정렬 축(기본 start).
//   Reviews 페이지 로컬 사본을 흡수했다(같은 행동·상태 계약 = 공용 1곳).
import { ChevronLeft, ChevronRight } from 'lucide-react';
import LangSwap from '../../i18n/LangSwap';
import { useLang } from '../../i18n/LangContext';

export default function Pagination({
  page,
  pages,
  onSelect,
  labelKey = 'common.pagination',
  arrows = false,
  prevLabelKey = 'reviews.prevPage',
  nextLabelKey = 'reviews.nextPage',
  align = 'start',
}) {
  const { t } = useLang();
  if (pages <= 1) return null;

  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft' && page > 0) {
      e.preventDefault();
      onSelect(page - 1);
    } else if (e.key === 'ArrowRight' && page < pages - 1) {
      e.preventDefault();
      onSelect(page + 1);
    }
  };

  // 화살표 · 경계에서 비활성(순환 아님 · §30 페이지네이션 규칙) · 아이콘 20(DESIGN §8 5단계)
  const arrow = (Icon, to, disabled, key) => (
    <button
      type="button"
      aria-label={t(key)}
      disabled={disabled}
      onClick={() => onSelect(to)}
      className={`pressable inline-flex h-44 w-44 items-center justify-center rounded-pill ${
        disabled ? 'text-inkMeta opacity-40' : 'text-ink hover:bg-surface'
      }`}
    >
      <Icon size={20} aria-hidden="true" />
    </button>
  );

  return (
    <nav
      aria-label="pagination"
      onKeyDown={onKeyDown}
      className={`flex flex-wrap items-center gap-4 ${align === 'center' ? 'justify-center' : ''}`}
    >
      <LangSwap k={labelKey} className="sr-only" />
      {arrows && arrow(ChevronLeft, page - 1, page === 0, prevLabelKey)}
      {Array.from({ length: pages }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-current={i === page ? 'page' : undefined}
          onClick={() => onSelect(i)}
          className="pressable inline-flex h-44 w-44 items-center justify-center rounded-pill"
        >
          <span
            style={{ width: 30, height: 30 }} // 시각 원 30px([V22] 무스크롤·경량화 유지)
            className={`inline-flex items-center justify-center rounded-pill font-display text-caption ${
              i === page ? 'bg-primary font-bold text-white' : 'bg-white font-semibold text-ink shadow-sm'
            }`}
          >
            {i + 1}
          </span>
        </button>
      ))}
      {arrows && arrow(ChevronRight, page + 1, page === pages - 1, nextLabelKey)}
    </nav>
  );
}
