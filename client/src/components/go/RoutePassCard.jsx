// RoutePassCard.jsx · [V5-31] 신규 컴포넌트 · "노선 여권" 패스카드.
//
// 배경: 사용자가 실제 서울 지하철 역 표지판(초록 원 안 역번호 · 큰 역명 · 이전역←현재역→다음역
//   방향 표기)을 참고자료로 제공하며 "패스/티켓 카드를 이런 식으로 만들고 싶다"고 지시.
// 이 컴포넌트는 실제 지하철 플랫폼 행선 안내판의 "이전역 ← 현재역 → 다음역" 3분할 레이아웃을
// 그대로 가져와, /gts/go 화면에서 사용자가 고른 코스(course)의 현재 목적지 기준 앞뒤 정류장을
// 보여준다. 노선 색은 lineSystem.js LINE_FACE(단일 출처)를 그대로 쓴다 — 새 색 없음.
//
// 데이터는 전부 props로 받는다(course·destIdx는 GtsGo.jsx가 이미 갖고 있는 상태를 그대로 넘긴다).
// 라인이 없는 장소(배지 없는 연계 로컬)는 중립면(NO_LINE_FACE)로 표시 — 없는 라인을 지어내지 않는다.
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import KBadge from '../gts/KBadge';
import TriText from '../gts/TriText';
import { LINE_FACE, NO_LINE_FACE, lineOfSpot } from '../../data/gts/lineSystem';
import LangSwap from '../../i18n/LangSwap';

// 옆(이전/다음) 칸 · 작게, 흐리게, 화살표와 함께 — 실제 역 표지판의 옆 칸 문법
function SideStop({ spot, n, direction }) {
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight;
  return (
    <div
      // [V5-32] 320~390px 진짜 폰 폭 대응 · sm(640px) 미만은 아이콘+번호만(이름은 sm+에서만) ·
      //   3분할 레이아웃이 실제 좁은 화면에서 중앙 카드를 짓누르지 않게 옆 칸을 압축한다.
      className={`flex min-w-0 shrink-0 items-center gap-4 sm:min-w-0 sm:flex-1 sm:gap-8 ${
        direction === 'prev' ? 'flex-row' : 'flex-row-reverse text-right'
      }`}
    >
      {spot ? (
        <>
          <Icon size={20} aria-hidden="true" className="shrink-0 text-inkMeta" />
          <div className="flex min-w-0 flex-col gap-2">
            <span className="text-caption font-medium text-inkMeta">
              {n}
            </span>
            <TriText
              text={spot.name}
              className="hidden truncate text-small font-semibold text-inkSec sm:block"
              clampClass="truncate"
            />
          </div>
        </>
      ) : (
        <span className="text-caption font-medium text-inkMeta">
          <LangSwap k={direction === 'prev' ? 'go.pass.start' : 'go.pass.end'} />
        </span>
      )}
    </div>
  );
}

export default function RoutePassCard({ course, destIdx }) {
  const current = course[destIdx];
  const prev = destIdx > 0 ? course[destIdx - 1] : null;
  const next = destIdx < course.length - 1 ? course[destIdx + 1] : null;
  if (!current) return null;

  const line = lineOfSpot(current);
  const faceClass = line ? LINE_FACE[line] : NO_LINE_FACE;

  return (
    <section className="flex flex-col gap-16 rounded-xl bg-white p-16 shadow-sm sm:p-24">
      <LangSwap k="go.pass.eyebrow" className="text-caption font-medium uppercase tracking-eyebrow text-inkMeta" />
      {/* 이전역 ← 현재역(큰 배지) → 다음역 · 실제 지하철 플랫폼 행선 안내판 3분할 문법 */}
      <div className="flex items-center gap-8 sm:gap-16">
        <SideStop spot={prev} n={destIdx} direction="prev" />

        {/* 현재역 = 라인 색 큰 면 + 역번호 원 + 역명 · 여기가 표지판의 중앙(가장 큰) 칸 */}
        <div className={`flex min-w-0 flex-1 flex-col items-center gap-8 rounded-lg px-16 py-20 text-center shadow-sm ${faceClass}`}>
          <span className="flex h-40 w-40 items-center justify-center rounded-pill bg-white/20 font-display text-h3 font-bold">
            {destIdx + 1}
          </span>
          <TriText text={current.name} className="text-h3 font-bold" clampClass="line-clamp-2" />
          <span className="flex items-center gap-4 text-caption font-semibold opacity-90">
            <MapPin size={14} aria-hidden="true" />
            <LangSwap k="go.pass.here" />
          </span>
          {current.badge && (
            <span className="[&_svg]:text-current [&>span]:bg-white/90 [&>span]:text-ink">
              <KBadge spot={current} />
            </span>
          )}
        </div>

        <SideStop spot={next} n={destIdx + 2} direction="next" />
      </div>
    </section>
  );
}
