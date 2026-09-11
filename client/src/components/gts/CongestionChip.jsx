// [V5-3] 집중률 Chip · 공사 관광지 집중률 3구간(서버 band · 경계 32.15 / 61.16 = 춘천 1800행 3분위 · ktoCongestionService)
// 색 = tokens 원색 도트(여유 green · 보통 yellow · 혼잡 spice · DESIGN §16.1 상태 도트 문법) + ink 라벨
//   (yellow 텍스트 금지 · 흰 면 위 ink = 대비 4.5:1 이상) · band 없으면 렌더 안 함(빈 칩 금지)
// labelKey = 스크린리더·툴팁 맥락 라벨(기본 "오늘 혼잡도") · 바로 앞 텍스트가 맥락을 주면 null(go 집중률 카드 dt)
// 모션: 색 전환만(MOTION 집중률 Chip 절 · 깜빡임 금지)
import LangSwap from '../../i18n/LangSwap';
import { useLang } from '../../i18n/LangContext';

const DOT = { relaxed: 'bg-green', moderate: 'bg-yellow', busy: 'bg-spice' };

export default function CongestionChip({ band, labelKey = 'gts.spot.crowd.label' }) {
  const { t } = useLang();
  if (!DOT[band]) return null;
  return (
    <span
      title={labelKey ? t(labelKey) : undefined}
      className="inline-flex min-w-0 max-w-full shrink-0 items-center gap-4 rounded-pill bg-white px-8 text-caption font-semibold text-ink shadow-sm"
    >
      <span aria-hidden="true" className={`h-8 w-8 shrink-0 rounded-pill shadow-sm transition-colors duration-fast ${DOT[band]}`} />
      {labelKey && <span className="sr-only">{t(labelKey)}</span>}
      {/* 좁은 카드(320px 2열 · th 라벨)에서는 말줄임(카드 밖 넘침 금지) */}
      <LangSwap k={`gts.spot.crowd.${band}`} className="min-w-0 grid-cols-1 [&>span]:truncate" />
    </span>
  );
}
