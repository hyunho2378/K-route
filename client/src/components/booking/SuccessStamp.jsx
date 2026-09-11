// 예약 성공 스탬프 · PATTERNS §9 그대로: 라인 컬러 원형 스탬프(라인 이니셜 Kanit Bold)
// scale 1.4→1.0 + opacity 0→1, spring 320ms. scale 화이트리스트 1/2(DESIGN §10).
// 착지 시점에 아래 텍스트(children) 페이드 인. reduced-motion: 즉시 표시.
import { useEffect, useState } from 'react';
import { motion } from '../../tokens';

// 라인 컬러 정적 클래스 + 배경 위 텍스트(AA: yellow 위 ink만 · DESIGN §2)
const FACE = {
  potato: 'bg-yellow text-ink',
  dakgalbi: 'bg-spice text-white',
  lake: 'bg-primary text-white',
};

// [V5-3] mark = 이니셜 대신 넣을 노드(quiz 결과 여행 타입 lucide 아이콘) · line 생략 시 lake(primary) 면
export default function SuccessStamp({ line = { id: 'lake' }, mark = null, children }) {
  const [landed, setLanded] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setLanded(true); // reduced-motion: 즉시 표시(PATTERNS §9)
      return undefined;
    }
    const raf = requestAnimationFrame(() => setLanded(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div className="flex flex-col items-center gap-24 text-center">
      <span
        aria-hidden="true"
        className={`flex h-96 w-96 items-center justify-center rounded-pill font-display text-h1 font-bold ${FACE[line.id]}`}
        style={
          reduced
            ? undefined
            : {
                // scale 1.4→1.0 드롭 · §17.3 범주 1(스탬프) · 스프링 허용 표면, §17.7 0.3~0.5s 구간
                transform: landed ? 'scale(1)' : 'scale(1.4)',
                opacity: landed ? 1 : 0,
                transition: `transform ${motion.durSheet} ${motion.spring}, opacity ${motion.durSheet} ${motion.spring}`,
              }
        }
      >
        {mark ?? line.name_en[0]}
      </span>
      <div
        style={
          reduced
            ? undefined
            : {
                // 착지 시점에 텍스트 페이드 인(PATTERNS §9)
                opacity: landed ? 1 : 0,
                // 진입 페이드 = easeOut(§17.2) · 딜레이는 스탬프 착지(360ms)와 동기
                transition: `opacity ${motion.fast} ${motion.easeOut} ${motion.durSheet}`,
              }
        }
      >
        {children}
      </div>
    </div>
  );
}
