// [V5-3] /gts/quiz 취향 찾기 · IA §11.3 게이미피케이션 설문(5문항 + 결과) · PATTERNS §41 StepStage 재사용.
//   q1 복수선택(1개 이상 → 다음 버튼) · q2~q5 단일선택 = 카드 탭 → 프레스 120ms(durPress) 후 자동 전진(§41).
//   q5 → 결과 스텝 진입과 동시에 submitQuiz(완성 답 · 상태 갱신 전이라 마지막 탭 값 병합) → SuccessStamp 1회.
//   계측('quiz')은 submitQuiz 소유(중복 전송 금지) · 가드 없음(진입점) · 첫 스텝 뒤로 = 나가기 확인 → /gate.
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StepStage from '../components/gts/StepStage';
import QuizQuestion from '../components/quiz/QuizQuestion';
import QuizResult from '../components/quiz/QuizResult';
import Container from '../components/layout/Container';
import { useGts } from '../context/GtsContext';
import { quizQuestions } from '../data/gts/quizQuestions';
import { useLang } from '../i18n/LangContext';
import LangSwap from '../i18n/LangSwap';
import { motion } from '../tokens';

// 스텝 키 = 문항 5 + 결과(StepStage titleKey·stepKey = quiz.step.{key})
const STEPS = [...quizQuestions.map((q) => q.id), 'result'];

export default function GtsQuiz() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const { quizAnswers, setQuizAnswer, submitQuiz, recommended } = useGts();
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState('loading'); // 결과 스텝 · 'loading' | 'ok' | 'error'
  const autoRef = useRef(0);
  const reqRef = useRef(0); // 최신 제출만 결과 반영(결과 → 뒤로 → 재제출 경합)
  const lastRef = useRef(null); // 재시도 = 같은 답 재호출

  useEffect(() => () => clearTimeout(autoRef.current), []);

  const key = STEPS[step];
  const question = quizQuestions[step]; // 결과 스텝이면 undefined
  const answer = quizAnswers[key];

  const submit = async (answers) => {
    const req = ++reqRef.current;
    lastRef.current = answers;
    setStatus('loading');
    const { ok } = await submitQuiz(answers, lang);
    if (req === reqRef.current) setStatus(ok ? 'ok' : 'error');
  };

  const advance = (answers) => {
    if (key === 'q5') submit(answers);
    setStep(step + 1);
  };

  const onPick = (id) => {
    setQuizAnswer(key, id);
    if (question.multi) return; // q1 복수 토글('아직 안 정함' 배타는 Context) · 다음 버튼으로 전진
    const answers = { ...quizAnswers, [key]: id };
    clearTimeout(autoRef.current);
    autoRef.current = setTimeout(() => advance(answers), parseInt(motion.durPress, 10));
  };

  const onNext = () => {
    clearTimeout(autoRef.current);
    if (key === 'result') navigate('/gts/build');
    else advance(quizAnswers);
  };
  const onBack = () => {
    clearTimeout(autoRef.current);
    setStep(step - 1);
  };

  // 다음 게이트: q1 = 1개 이상 · q2~q5 = 답 있음(돌아온 문항은 다음으로도 전진) · 결과 = 로딩·실패 중 비활성
  let disabled = status !== 'ok';
  if (question) disabled = question.multi ? !answer.length : answer == null;

  return (
    <>
      {/* 오버레이 아래 바닥 페이지(GtsBuild 동형) · 실콘텐츠는 StepStage 소유 */}
      <Container>
        <div className="pb-64 pt-96">
          <LangSwap k="quiz.title" as="h1" className="text-h1 font-bold tracking-display" />
        </div>
      </Container>

      <StepStage
        stepIndex={step}
        stepCount={STEPS.length}
        titleKey={`quiz.step.${key}`}
        stepKey={key}
        onBack={onBack}
        onNext={onNext}
        nextDisabled={disabled}
        reasonKey={key === 'q1' ? 'quiz.needOne' : null}
        onExit={() => navigate('/gate')}
        exitKey="quiz"
        nextLabel={
          key === 'result' && status === 'ok' ? (
            <LangSwap k="quiz.result.cta" vars={{ n: recommended.length }} />
          ) : null
        }
      >
        {question ? (
          <QuizQuestion question={question} answer={answer} onPick={onPick} />
        ) : (
          <QuizResult
            status={status}
            type={quizAnswers.q2}
            stay={quizAnswers.q4}
            count={recommended.length}
            onRetry={() => submit(lastRef.current)}
          />
        )}
      </StepStage>
    </>
  );
}
