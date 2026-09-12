// CourseQueue · [V9] 선택 큐 ([V5-3] 추천 단일 풀 · items = course(고른 순서 = 방문 순서 스팟)).
// 스몰 카드(순번 + 이름 + X) 선택 순서대로 · 우측 끝 합계 배지(거리·시간). 큐 비면 미표시.
// X = 큐에서 제거 → 해당 장소 그리드 복귀(GtsBuild가 selectSpot 재클릭 해제로 처리).
import { X } from 'lucide-react';
import TriText from './TriText';
import { LINE_BG, lineOfSpot } from '../../data/gts/lineSystem';
import LangSwap from '../../i18n/LangSwap';
import { useLang } from '../../i18n/LangContext';
import { motion } from '../../tokens';

export default function CourseQueue({ items, onRemove, km, minutes }) {
  const { t } = useLang();
  if (!items.length) return null;
  // [V13] 거리 배지 = 픽 2개 이상일 때만(0.0km 상태 숨김). 값은 SUIT(기본 폰트)·저두께·큰 크기.
  const showEstimate = km > 0;
  return (
    // [V22] 무스크롤: 큐를 단일 행으로(pill 가로 스크롤) · wrap로 3줄 139px 되던 것 → 1줄로 축소
    <div className="flex items-center gap-8 rounded-lg bg-surface p-12">
      <LangSwap
        k="gts.build.queueTitle"
        className="shrink-0 text-caption font-semibold uppercase tracking-eyebrow text-inkMeta"
      />
      <div className="flex min-w-0 flex-1 items-center gap-8 overflow-x-auto scroll-quiet">
      {items.map((v, i) => {
        // [V5-9] 담은 곳이 어느 K-콘텐츠 라인의 역인지 · 배지 없는 연계 로컬은 도트를 달지 않는다(라인 주장 금지)
        const line = lineOfSpot(v);
        return (
        <span
          key={v.id}
          className="flex shrink-0 items-center gap-8 rounded-pill bg-white pl-12 shadow-sm"
          style={{ animation: `bh-queue-in 220ms ${motion.easeOut} both` }}
        >
          {line && <span aria-hidden="true" className={`h-8 w-8 shrink-0 rounded-pill ${LINE_BG[line]}`} />}
          {/* [V22] "1: 이름" 형식 · gap-8(gap-6은 spacing 스케일 부재로 무효였음 → 붙어 보이던 문제 수리) */}
          <span className="font-display text-caption font-bold text-primary">{i + 1}:</span>
          <TriText text={v.name} className="text-small font-semibold" />
          {/* [V5-3] X 히트 영역 44(§18.3 터치 타깃 · pill 높이 = 44) · 아이콘 16(§8 5단계) */}
          <button
            type="button"
            aria-label={t('gts.build.queueRemove')}
            title={t('gts.build.queueRemove')}
            onClick={() => onRemove(v.id)}
            className="pressable inline-flex h-44 w-44 items-center justify-center rounded-pill text-inkMeta hover:text-ink"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </span>
        );
      })}
      </div>
      {/* [V13] 우측 끝 추정 거리 · 라벨(3언어) + 값(SUIT·medium·body). 픽 1개 이하면 숨김 · [V22] 스크롤 밖 고정 우측 */}
      {showEstimate && (
        // [V22] 라벨·값 우측 끝 정렬 일치(text-right) · LangSwap 오버레이 폭에도 시각 우측선 유지
        <span className="flex shrink-0 flex-col items-end leading-tight">
          <LangSwap k="gts.build.routeEstimate" className="w-full text-right text-caption font-medium text-inkMeta" />
          <span className="w-full text-right text-body font-medium text-primary">
            {`${t('gts.build.approx')} ${km.toFixed(1)}km · ${minutes}${t('gts.build.minUnit')}`}
          </span>
        </span>
      )}
      <style>{`@keyframes bh-queue-in { from { opacity: 0; transform: scale(0.9) translateY(8px); } to { opacity: 1; transform: none; } }`}</style>
    </div>
  );
}
