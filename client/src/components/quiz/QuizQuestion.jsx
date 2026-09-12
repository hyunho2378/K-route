// [V5-3] 취향 설문 문항 1개 · IA §11.3 · 선택 카드 = GtsBuild PlanCard 문법
//   (pressable · rounded-lg · bg-white · shadow-sm · 선택 ring-2 primary · 비선택 hover:shadow-md · scale hover 금지).
// 그리드: 모바일 1열 → md 2열 → lg 선택지 수 홀수(3·5) 3열 / 짝수(2·4) 2열(RESPONSIVE quiz 절 · 균형 배치).
// [V5-9] 상단에 스탯 게이지 + 크루 레벨(lineSystem) · 문항마다 반응이 보이게 한다.
import { useEffect, useRef } from 'react';
import { Compass } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';
import { AXIS_MAX, LINE_AXES, LINE_BG, LINE_RING, levelOf, lineOf, statsOf } from '../../data/gts/lineSystem';
import { LINE_ICONS } from '../../data/gts/quizQuestions';
import { motion } from '../../tokens';

// [V5-9] 스탯 게이지 + 크루 레벨 · 답할수록 라인 축이 차고 선두 라인(색·아이콘·이름)이 바뀐다.
//   막대 채움은 transform: scaleX만 쓴다(MOTION.md · width 등 레이아웃 유발 속성 금지) ·
//   reduced-motion은 index.css 전역 규칙이 전환을 즉시로 축약한다(KBadge 선례).
//   크루 자리: 봄내크루 PNG가 32×32 스텁이라(IA §7 PLACEHOLDER 대기) 지금은 라인 아이콘을 쓴다.
//   실제 에셋이 들어오면 이 원 안의 아이콘만 /images/crew/{crew}.png 로 바꾼다(lineSystem.LINES.crew).
function LineGauge({ answers }) {
  const { t } = useLang();
  const stats = statsOf(answers);
  const lead = lineOf(answers);
  const Crew = lead ? LINE_ICONS[lead] : Compass; // 아직 취향이 안 잡혔으면 중립 아이콘
  return (
    <div role="group" aria-label={t('quiz.gauge')} className="flex items-center gap-12">
      <span
        className={`flex h-40 w-40 shrink-0 items-center justify-center rounded-pill bg-surface ring-2 ${
          lead ? LINE_RING[lead] : 'ring-line'
        }`}
      >
        <Crew size={20} aria-hidden="true" className="text-ink" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-4">
        <span className="flex flex-wrap items-baseline gap-8">
          <LangSwap k="quiz.level" vars={{ n: levelOf(answers) }} className="text-caption font-semibold" />
          {lead && <LangSwap k={`gts.line.${lead}.name`} className="text-caption font-semibold text-inkSec" />}
        </span>
        {/* 막대 3개 = 라인 축(색이 곧 라인) · 수치는 위 텍스트가 말하므로 막대는 장식 */}
        <span aria-hidden="true" className="flex gap-4">
          {LINE_AXES.map((axis) => (
            <span key={axis} className="h-8 flex-1 overflow-hidden rounded-pill bg-line">
              <span
                className={`block h-full w-full origin-left rounded-pill ${LINE_BG[axis]}`}
                style={{
                  transform: `scaleX(${stats[axis] / AXIS_MAX[axis]})`,
                  transition: `transform ${motion.dur} ${motion.easeOut}`,
                }}
              />
            </span>
          ))}
        </span>
      </span>
    </div>
  );
}

export default function QuizQuestion({ question, answer, answers, onPick }) {
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
      <LineGauge answers={answers} />
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
