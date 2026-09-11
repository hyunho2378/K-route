// [V5-3] 취향 설문 문항 1개 · IA §11.3 · 선택 카드 = GtsBuild PlanCard 문법
//   (pressable · rounded-lg · bg-white · shadow-sm · 선택 ring-2 primary · 비선택 hover:shadow-md · scale hover 금지).
// 그리드: 모바일 1열 → md 2열 → lg 선택지 수 홀수(3·5) 3열 / 짝수(2·4) 2열(RESPONSIVE quiz 절 · 균형 배치).
import { useEffect, useRef } from 'react';
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';

export default function QuizQuestion({ question, answer, onPick }) {
  const { t } = useLang();
  const { id, multi, options } = question;
  const isOn = (optId) => (multi ? answer.includes(optId) : answer === optId);
  const focusRef = useRef(null);
  const focusIdx = Math.max(0, options.findIndex((o) => isOn(o.id)));

  // 스텝 진입 시 선택(없으면 첫) 카드로 포커스 · 자동 전진으로 포커스 요소가 사라져도 키보드 흐름 유지.
  //   StepStage 퇴장 사본(aria-hidden 래퍼)은 제외 · 첫 스텝은 StepStage가 패널로 다시 가져간다.
  useEffect(() => {
    const el = focusRef.current;
    if (el && !el.closest('[aria-hidden="true"]')) el.focus({ preventScroll: true });
  }, []);

  return (
    <section className="flex flex-col gap-16">
      <div className="flex flex-col gap-4">
        <LangSwap k={`quiz.${id}.title`} as="h2" className="text-h3 font-semibold" />
        {multi && <LangSwap k="quiz.multiHint" as="p" className="text-small font-medium text-inkSec" />}
      </div>
      <div
        role="group"
        aria-label={t(`quiz.${id}.title`)}
        className={`grid grid-cols-1 gap-12 md:grid-cols-2 ${options.length % 2 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}
      >
        {options.map(({ id: optId, icon: Icon }, i) => {
          const on = isOn(optId);
          return (
            <button
              key={optId}
              ref={i === focusIdx ? focusRef : undefined}
              type="button"
              aria-pressed={on}
              onClick={() => onPick(optId)}
              className={`pressable flex min-h-44 items-center gap-16 rounded-lg bg-white px-20 py-16 text-left shadow-sm ${
                on ? 'ring-2 ring-primary' : 'hover:shadow-md'
              }`}
            >
              <Icon size={24} aria-hidden="true" className="shrink-0 text-primary" />
              <span className="flex min-w-0 flex-col gap-4">
                <LangSwap k={`quiz.${id}.${optId}`} className="text-body font-semibold" />
                <LangSwap k={`quiz.${id}.${optId}Sub`} className="text-small font-medium text-inkSec" />
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
