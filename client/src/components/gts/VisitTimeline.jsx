// VisitTimeline · §10.5 방문 순서 타임라인 (존 C5 신설) — PATTERNS §28 RouteTimeline 문법의
// 경량 세로 타임라인. components/gate는 존 소유 밖이라 임포트 금지 · gts 존 자체 구현.
// ol 시맨틱 · 좌측 수직 라인 2px colors.line(§28 명세값) 위에 노드 겹침.
// 노드 = 순번 원 28px primary 배경 + white 숫자(§10.5 명세값) · 우측 장소명 + 2시간 슬롯 시각.
// 이동·주행 애니메이션 없음(§28 · 정적). GtsRoute 방문 순서 + Ticket 일정 타임라인(§43)이 공유.
// [V5-5] item.leg = 다음 장소까지의 구간 표기(이동·대기·막차) · 순서가 바뀌면 FLIP 리플로우(transform·opacity만 · MOTION.md).
import { useLayoutEffect, useRef } from 'react';
import TriText from './TriText';
import { motion } from '../../tokens';

const REORDER_MS = 420; // [V9] VenueGrid 재정렬과 같은 지속(오류처럼 안 보이게)
const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function VisitTimeline({ items }) {
  const nodes = useRef(new Map()); // id → li 요소
  const prevTop = useRef(new Map()); // id → 직전 top(리플로우 측정)

  // 순서 변경 시 이전 위치에서 현재 위치로 미끄러지게(레이아웃 유발 속성 미사용 · transform만)
  useLayoutEffect(() => {
    const skip = prefersReduced();
    nodes.current.forEach((el, id) => {
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      const prev = prevTop.current.get(id);
      if (!skip && prev !== undefined && Math.abs(prev - top) > 1) {
        el.animate([{ transform: `translateY(${prev - top}px)` }, { transform: 'translateY(0px)' }], {
          duration: REORDER_MS,
          easing: motion.easeOut,
        });
      }
      prevTop.current.set(id, top);
    });
  });

  return (
    <ol className="flex flex-col">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <li
            key={item.id}
            ref={(el) => {
              if (el) nodes.current.set(item.id, el);
              else nodes.current.delete(item.id);
            }}
            className="flex gap-16"
          >
            <span aria-hidden="true" className="flex flex-col items-center">
              <span
                className="flex shrink-0 items-center justify-center rounded-pill bg-primary font-display text-caption font-bold text-white shadow-sm"
                style={{ width: 28, height: 28 }} // §10.5 명세값 · 순번 원 28px
              >
                {i + 1}
              </span>
              {/* 수직 라인 2px = PATTERNS §28 명세값(스페이싱 토큰 외 · 인라인 허용 예외) */}
              {!isLast && <span className="flex-1 bg-line" style={{ width: 2 }} />}
            </span>
            <div className={`flex min-w-0 flex-1 flex-col gap-4 ${isLast ? '' : 'pb-24'}`}>
              {item.time && <span className="font-display text-small font-bold">{item.time}</span>}
              <TriText text={item.name} className="text-body font-semibold" />
              {item.oneLine && (
                <TriText text={item.oneLine} className="text-caption font-medium text-inkSec" />
              )}
              {/* [V5-3] extra = 부가 노드(route K배지·집중률 Chip) · 생략 시 기존과 동일 */}
              {item.extra}
              {/* [V5-5] leg = 다음 장소까지 구간(이동·대기·막차) · 마지막 장소는 없음 */}
              {item.leg && <div className="pt-8">{item.leg}</div>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
