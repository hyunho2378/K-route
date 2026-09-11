// [V5-3] go 레그 타임라인 · PATTERNS §28 문법(RouteTimeline 선례 · components/gate는 읽기만이라 go 존 자체 구현).
// ol · 노드 = white 원 40px + shadow.sm + lucide 20 ink · 2px 세로선 bg-line · 마지막 도착 노드만 primary 면 + white 아이콘.
// 출발(현재 위치 LocateFixed | 춘천역 TrainFront) → 이동(q5 우선 수단 + 다른 수단 한 줄 병기 · 둘 다 '예상' 칩 아래) → 도착(장소명).
// 주행 애니메이션 금지 · 진입 = 항목 순차 페이드(bh-fade-in · 지연 상한) · reduced-motion은 스타일 없이 즉시 표시(지연 포함 제거).
import { CarFront, Footprints, LocateFixed, MapPin, TrainFront } from 'lucide-react';
import LangSwap from '../../i18n/LangSwap';
import { motion } from '../../tokens';
import TriText from '../gts/TriText';

const MODE_ICON = { walk: Footprints, taxi: CarFront };
const ORIGIN_ICON = { current: LocateFixed, station: TrainFront };
const STAGGER_MS = 80; // 항목당 페이드 지연
const STAGGER_CAP_MS = 240; // 지연 상한(MOTION 원칙: stagger가 끝없이 밀리지 않게)

function Node({ icon: Icon, arrive = false }) {
  return (
    <span aria-hidden="true" className="flex flex-col items-center">
      <span
        className={`flex h-40 w-40 shrink-0 items-center justify-center rounded-pill shadow-sm ${
          arrive ? 'bg-primary' : 'bg-white'
        }`}
      >
        <Icon size={20} className={arrive ? 'text-white' : 'text-ink'} />
      </span>
      {/* 수직 라인 2px = PATTERNS §28 명세값(스페이싱 토큰 외 · 인라인 허용 예외) */}
      {!arrive && <span className="flex-1 bg-line" style={{ width: 2 }} />}
    </span>
  );
}

// originKind 'current'|'station' · estimates [{ mode, min }] · prefer = q5 우선 수단 · dest = 스팟 · n = 코스 순번
export default function LegTimeline({ originKind, estimates, prefer, dest, n }) {
  const main = estimates.find((e) => e.mode === prefer) ?? estimates[0];
  const others = estimates.filter((e) => e !== main);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fade = (i) =>
    reduced
      ? undefined
      : {
          animation: `bh-fade-in ${motion.dur} ${motion.easeOut} both`,
          animationDelay: `${Math.min(i * STAGGER_MS, STAGGER_CAP_MS)}ms`,
        };

  return (
    <ol className="flex flex-col">
      <li className="flex gap-16" style={fade(0)}>
        <Node icon={ORIGIN_ICON[originKind]} />
        <LangSwap k={`go.${originKind}`} className="min-w-0 flex-1 pb-24 pt-8 text-body font-semibold" />
      </li>

      <li className="flex gap-16" style={fade(1)}>
        <Node icon={MODE_ICON[main.mode]} />
        <div className="flex min-w-0 flex-1 flex-col gap-4 pb-24 pt-8">
          <span className="flex flex-wrap items-center gap-8">
            <LangSwap k={`go.mode.${main.mode}`} className="text-body font-semibold" />
            <LangSwap
              k="go.estimate"
              className="rounded-pill bg-surface px-8 py-4 text-caption font-semibold text-ink"
            />
          </span>
          <LangSwap k="go.minutes" vars={{ min: main.min }} className="font-display text-h3 font-bold" />
          {others.map((e) => {
            const Icon = MODE_ICON[e.mode];
            return (
              <span key={e.mode} className="flex flex-wrap items-center gap-8 text-small text-inkSec">
                <Icon size={16} aria-hidden="true" className="shrink-0" />
                <LangSwap k={`go.mode.${e.mode}`} className="font-semibold" />
                <LangSwap k="go.minutes" vars={{ min: e.min }} />
              </span>
            );
          })}
        </div>
      </li>

      <li className="flex gap-16" style={fade(2)}>
        <Node icon={MapPin} arrive />
        <div className="flex min-w-0 flex-1 flex-col gap-4 pt-8">
          <TriText text={dest.name} className="text-body font-semibold" />
          <LangSwap k="go.stopN" vars={{ n }} className="text-caption font-medium text-inkMeta" />
        </div>
      </li>
    </ol>
  );
}
