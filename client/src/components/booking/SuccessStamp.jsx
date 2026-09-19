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
                // [V5-18-2] 착지 시점에 텍스트 fade + 아래→위 슬라이드(라인 이름·설명 리빌 · transform·opacity 만 · scale 없음)
                opacity: landed ? 1 : 0,
                transform: landed ? 'translateY(0)' : 'translateY(8px)',
                // 진입 = easeOut(§17.2) · durSheet 360ms(지시된 0.3~0.4초 구간 안의 유일한 기존 토큰 · 새 값 생성 금지)
                //   딜레이도 durSheet 로 스탬프 착지(원 확대) 지속시간과 동기
                transition: `opacity ${motion.durSheet} ${motion.easeOut} ${motion.durSheet}, transform ${motion.durSheet} ${motion.easeOut} ${motion.durSheet}`,
              }
        }
      >
        {children}
      </div>
    </div>
  );
}
