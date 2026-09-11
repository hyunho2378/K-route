// [V5-3] 설문 결과 스텝 · IA §11.3 여행 타입 배지(q2 성향 결정론 4종 · lucide) + 추천 N곳 + 정원 안내.
//   loading = 결과 실루엣 Skeleton(PATTERNS §6 · 스탬프 96 원과 같은 자리) / ok = SuccessStamp 1회(§9 · 컨페티 없음) /
//   error = 안내 + 재시도(같은 답 재호출). 상태 변화는 aria-live polite(DESIGN §14).
import { useEffect, useRef } from 'react';
import SuccessStamp from '../booking/SuccessStamp';
import Button from '../ui/Button';
import Skeleton from '../ui/Skeleton';
import { TRAVEL_TYPE_ICONS } from '../../data/gts/quizQuestions';
import LangSwap from '../../i18n/LangSwap';

export default function QuizResult({ status, type, stay, count, onRetry }) {
  const TypeIcon = TRAVEL_TYPE_ICONS[type];
  const ref = useRef(null);

  // 스텝 진입 시 결과 영역으로 포커스(q5 자동 전진으로 사라진 포커스 복구) · 퇴장 사본(aria-hidden)은 제외
  useEffect(() => {
    const el = ref.current;
    if (el && !el.closest('[aria-hidden="true"]')) el.focus({ preventScroll: true });
  }, []);

  return (
    <div ref={ref} tabIndex={-1} aria-live="polite" className="flex flex-col items-center py-24 text-center outline-none">
      {status === 'loading' && (
        <div className="flex w-full flex-col items-center gap-24">
          <Skeleton className="h-96 w-96 rounded-pill" />
          <LangSwap k="quiz.result.loading" as="p" className="text-body font-semibold" />
          <div className="flex w-full flex-col items-center gap-8">
            <Skeleton className="h-32 w-1/2" />
            <Skeleton className="h-16 w-2/3" />
          </div>
        </div>
      )}

      {status === 'ok' && (
        // 스탬프 면 = primary(line 생략) · 아이콘 흰색 48(면 text-white 상속)
        <SuccessStamp mark={<TypeIcon size={48} aria-hidden="true" />}>
          <div className="flex flex-col items-center gap-8">
            {/* 글래스 위 텍스트 = inkSec까지(§17.4 회색 금지) */}
            <LangSwap
              k="quiz.result.eyebrow"
              as="p"
              className="text-caption font-semibold uppercase tracking-eyebrow text-inkSec"
            />
            <LangSwap k={`quiz.type.${type}.name`} as="h2" className="font-display text-h2 font-bold" />
            <LangSwap k={`quiz.type.${type}.body`} as="p" className="text-body" />
            <LangSwap k="quiz.result.ready" vars={{ n: count }} as="p" className="pt-16 text-body font-semibold" />
            <LangSwap
              k={stay === 'day' ? 'quiz.result.capDay' : 'quiz.result.capHalf'}
              as="p"
              className="text-small font-medium text-inkSec"
            />
          </div>
        </SuccessStamp>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center gap-16">
          <LangSwap k="quiz.result.error" as="p" className="text-body font-semibold" />
          {/* StepStage 뒤로 버튼과 같은 글래스 위 가시성 처리(white 채움 + shadow.sm) */}
          <span className="grid rounded-pill bg-white shadow-sm">
            <Button variant="secondary" onClick={onRetry}>
              <LangSwap k="quiz.result.retry" />
            </Button>
          </span>
        </div>
      )}
    </div>
  );
}
