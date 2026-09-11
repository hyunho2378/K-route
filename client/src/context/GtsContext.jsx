// GTS·K-Route 상태기 · PATTERNS §31 + IA §11 (존 A4 소유 — 서브에이전트 수정 금지, 확장 요청은 보고).
// vehicle은 저장하지 않고 셀렉터로 파생(§9.3 규칙) — 인원·짐 변경 시 자동 재매칭.
// in-memory 전용: 새로고침 시 처음부터(웹스토리지 금지 유지).
// [V5-3] 심사 경로 quiz → build → route → go(IA §11.1). 가드: build = 추천 결과 있음 / route = 정원(q4)만큼 담음 /
//   go = route 경유 + 코스 있음 / checkout = route 경유(기존 유지). setup은 route '차량으로 이동' 보조 진입(가드 없음).
//   코스(course) = picks(고른 순서) → 스팟(data/gts/spots · kind 'kto'|'venue' 이원화) · Travel Log 템플릿(meals+picks)도 같은 파생.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { itineraryVenues, splitItinerary } from '../components/gts/itinerary';
import { recommend } from '../data/gts/ktoApi';
import { Q1_EXCLUSIVE } from '../data/gts/quizQuestions';
import { toSpot } from '../data/gts/spots';
import { matchVehicle } from '../data/gts/vehicles';

// [V1] 여정 트래킹 · 비차단(실패해도 UX 진행 · 콘솔 경고만) — 서버 /api/track(로그인 필수)
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

const GtsContext = createContext(null);

const initial = {
  party: null, // setup CTA에서 확정되기 전 null
  luggage: false,
  mealPlan: null, // null | 'none' | 'lunch' | 'lunchDinner' · [V5-3] 설문 제출 시 'none'(식사 플랜 폐지 · 예약 API 계약 유지)
  meals: [], // venue id, push 순서 = 점심 → 저녁(§31 · Travel Log 템플릿 호환)
  picks: [], // 스팟 id(공사 contentid | venue id) · 고른 순서 = 방문 순서 · [V5-3] 정원 = q4(3/4)
  dropoffText: '',
  routeVisited: false,
  travelDate: null, // [V3] YYYY-MM-DD · 셋업 진입 시 오늘 기본(당일 예약 허용)
  logTemplate: null, // [V3] Travel Log 템플릿 적용 시 로그 code — setup CTA가 체크아웃 직행 판단
  quizAnswers: { q1: [] }, // [V5-3] IA §11.3 · q1 배열(복수) · q2~q5 단일 값(recommendService.ANSWERS)
  recommended: [], // [V5-3] 추천 스팟(서버 풀 항목 + score·reasonKey·reason · toSpot)
  goOrigin: null, // [V5-3] go 출발점 { kind: 'current' | 'station', coord: [lng, lat] }
};

// [V5-3] q4 → 담기 정원(IA §11.3 반나절 3곳 · 하루 4곳)
export const CAP = { half: 3, day: 4 };
export const capOf = (answers) => CAP[answers?.q4] ?? 0;

export function GtsProvider({ children }) {
  const [state, setState] = useState(initial);
  const { pathname } = useLocation();
  const wasInFlow = useRef(false);
  // [V1] 세션·스텝 계측 — sessionId는 플로우 진입 시 생성, lastStepAt은 직전 track 이후 경과(duration)
  const sessionIdRef = useRef(null);
  const lastStepAtRef = useRef(0);

  // v4.2 §10.4 상태 리셋 정책: /gts/* 밖으로 이탈하면 하차 텍스트 포함 전체 초기화.
  // 플로우 내부 이동은 보존. 결제 직행(/ticket)도 이탈 — 예약 스냅샷은 data/gts/api 저장분이 소유.
  useEffect(() => {
    const inFlow = pathname.startsWith('/gts');
    if (!wasInFlow.current && inFlow) {
      // [V1] 플로우 진입 — 트래킹 세션 시작
      sessionIdRef.current = crypto.randomUUID();
      lastStepAtRef.current = performance.now();
    }
    if (wasInFlow.current && !inFlow) setState(initial);
    wasInFlow.current = inFlow;
  }, [pathname]);

  // [V1] 스텝 완료 계측 · 비차단 — duration = 직전 스텝 완료 이후 경과
  const trackStep = useCallback((step, payload = {}) => {
    const now = performance.now();
    const durationMs = lastStepAtRef.current ? Math.round(now - lastStepAtRef.current) : null;
    lastStepAtRef.current = now;
    const sessionId = sessionIdRef.current ?? crypto.randomUUID();
    sessionIdRef.current = sessionId;
    fetch(`${API_BASE}/api/track`, {
      method: 'POST',
      credentials: 'include',
      keepalive: true, // [V6] 단계 전환·페이지 이탈 중에도 요청 생존(fire-and-forget 드롭 방지)
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, step, payload, durationMs }),
    }).catch(() => console.warn(`[track] ${step} 전송 실패(무시)`));
  }, []);

  const setParty = useCallback((party) => setState((s) => ({ ...s, party })), []);
  const setLuggage = useCallback((luggage) => setState((s) => ({ ...s, luggage })), []);

  // [V5-3] v4 식사 플랜 3택·반반 분할 폐지로 setMealPlan·toggleMeal·togglePick 제거(담기 = selectSpot)
  const setDropoffText = useCallback((dropoffText) => setState((s) => ({ ...s, dropoffText })), []);
  const markRouteVisited = useCallback(() => setState((s) => ({ ...s, routeVisited: true })), []);
  const setTravelDate = useCallback((travelDate) => setState((s) => ({ ...s, travelDate })), []); // [V3]
  const reset = useCallback(() => setState(initial), []);

  // [V5-3] 설문 답 기록 · q1은 복수 토글('아직 안 정함'은 배타) · q2~q5는 단일 값 교체
  const setQuizAnswer = useCallback(
    (q, value) =>
      setState((s) => {
        const a = s.quizAnswers;
        if (q !== 'q1') return { ...s, quizAnswers: { ...a, [q]: value } };
        let q1;
        if (a.q1.includes(value)) q1 = a.q1.filter((v) => v !== value);
        else if (value === Q1_EXCLUSIVE) q1 = [value];
        else q1 = [...a.q1.filter((v) => v !== Q1_EXCLUSIVE), value];
        return { ...s, quizAnswers: { ...a, q1 } };
      }),
    [],
  );

  // [V5-3] 설문 제출 → 서버 추천(POST /api/quiz/recommend) · answers = 완성된 답(마지막 탭 값 포함 · 상태 갱신 전 호출 대비)
  //   성공: 답·추천 스팟 교체 + 코스·동선 초기화(새 추천 = 새 코스) · 실패(items 없음): 상태 불변 · 반환 { ok, count }
  const quizReqRef = useRef(0); // 최신 제출만 반영(결과 → 뒤로 → 재제출 경합 · 늦게 온 이전 응답 무시)
  const submitQuiz = useCallback(
    async (answers, lang) => {
      const req = ++quizReqRef.current;
      const res = await recommend(answers, lang, sessionIdRef.current);
      if (req !== quizReqRef.current) return { ok: false, count: 0, stale: true };
      if (!Array.isArray(res.items) || !res.items.length) return { ok: false, count: 0 };
      trackStep('quiz', { answers, count: res.items.length, source: res.source });
      setState((s) => ({
        ...s,
        quizAnswers: answers,
        recommended: res.items.map(toSpot),
        mealPlan: 'none',
        meals: [],
        picks: [],
        routeVisited: false,
        logTemplate: null,
        goOrigin: null,
      }));
      return { ok: true, count: res.items.length };
    },
    [trackStep],
  );

  // [V5-3] 코스 담기 토글 · 재클릭 해제 · 정원(q4) 초과면 false(자동 해제 금지 · 화면이 기존 토스트 · §9.4)
  //   반환값은 현재 렌더 기준, 최종 판정은 갱신 함수 안에서 한 번 더(연속 탭 경합에도 정원 초과 없음)
  const selectSpot = useCallback(
    (id) => {
      const accepted = state.picks.includes(id) || state.picks.length < capOf(state.quizAnswers);
      setState((s) => {
        if (s.picks.includes(id)) return { ...s, picks: s.picks.filter((p) => p !== id) };
        if (s.picks.length >= capOf(s.quizAnswers)) return s;
        return { ...s, picks: [...s.picks, id] };
      });
      return accepted;
    },
    [state.picks, state.quizAnswers],
  );

  const setGoOrigin = useCallback((goOrigin) => setState((s) => ({ ...s, goOrigin })), []); // [V5-3]

  // [V3] Travel Log 템플릿 적용 · 로그의 식사 플랜·선택·동선을 그대로 프리필하고
  //   routeVisited까지 마킹(로그 동선 = 확정 동선 → setup 인원 선택 후 체크아웃 직행 가드 성립).
  //   /gts 이탈 리셋 정책은 그대로 — Travel Log → setup 진입은 "밖→안" 전이라 리셋 미발화(보존).
  const applyLogTemplate = useCallback(
    (log) => {
      const { meals, picks } = splitItinerary(log.mealPlan, log.itinerary);
      trackStep('log_template', { code: log.code }); // [V3] journey_events 계측
      setState((s) => ({
        ...initial,
        travelDate: s.travelDate,
        mealPlan: log.mealPlan,
        meals,
        picks,
        routeVisited: true,
        logTemplate: log.code,
      }));
    },
    [trackStep],
  );

  // 파생 차량(§9.3 결정론) — 저장 금지, party 미확정이면 null
  const vehicle = useMemo(
    () => (state.party == null ? null : matchVehicle(state.party, state.luggage)),
    [state.party, state.luggage],
  );

  // [V5-3] 담기 정원 + 코스(방문 순서 스팟) 파생
  const cap = capOf(state.quizAnswers);
  const course = useMemo(
    () =>
      itineraryVenues({
        mealPlan: state.mealPlan,
        meals: state.meals,
        picks: state.picks,
        recommended: state.recommended,
      }),
    [state.mealPlan, state.meals, state.picks, state.recommended],
  );

  const value = useMemo(
    () => ({
      ...state,
      vehicle,
      cap,
      course,
      setParty,
      setLuggage,
      setDropoffText,
      markRouteVisited,
      setTravelDate,
      applyLogTemplate,
      reset,
      trackStep,
      setQuizAnswer,
      submitQuiz,
      selectSpot,
      setGoOrigin,
    }),
    [state, vehicle, cap, course, setParty, setLuggage, setDropoffText, markRouteVisited, setTravelDate, applyLogTemplate, reset, trackStep, setQuizAnswer, submitQuiz, selectSpot, setGoOrigin],
  );

  return <GtsContext.Provider value={value}>{children}</GtsContext.Provider>;
}

export function useGts() {
  return useContext(GtsContext);
}

// 스텝 가드(§31 · [V5-3] IA §11.1 순서 quiz → build → route → go) · 미충족 시 앞 단계로 replace.
// 페이지는 반환값 false면 렌더 중단. quiz·setup은 가드 없음(진입점 · 보조 진입).
export function useGtsGuard(step) {
  const { recommended, picks, quizAnswers, routeVisited, course } = useGts();
  const navigate = useNavigate();

  let ok = true;
  let target = '/gts/quiz';
  if (step === 'build') {
    ok = recommended.length > 0;
  } else if (step === 'route') {
    ok = recommended.length > 0 && picks.length === capOf(quizAnswers);
    if (recommended.length) target = '/gts/build';
  } else if (step === 'go') {
    ok = routeVisited && course.length > 0;
    target = '/gts/route';
  } else if (step === 'checkout') {
    ok = routeVisited;
    target = '/gts/route';
  }

  useEffect(() => {
    if (!ok) navigate(target, { replace: true });
  }, [ok, target, navigate]);

  return ok;
}
