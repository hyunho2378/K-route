// GTS 조립 상태기 · PATTERNS §31 (존 A4 소유 — 서브에이전트 수정 금지, 확장 요청은 보고).
// vehicle은 저장하지 않고 셀렉터로 파생(§9.3 규칙) — 인원·짐 변경 시 자동 재매칭.
// in-memory 전용: 새로고침 시 setup부터(웹스토리지 금지 유지).
// 가드: build = party 필수 / route = mealPlan 충족 && picks 2 / checkout = route 경유.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { splitItinerary } from '../components/gts/itinerary';
import { matchVehicle } from '../data/gts/vehicles';

// [V1] 여정 트래킹 · 비차단(실패해도 UX 진행 · 콘솔 경고만) — 서버 /api/track(로그인 필수)
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

const GtsContext = createContext(null);

const initial = {
  party: null, // setup CTA에서 확정되기 전 null — build 가드 기준
  luggage: false,
  mealPlan: null, // null | 'none' | 'lunch' | 'lunchDinner'
  meals: [], // venue id, push 순서 = 점심 → 저녁(§31)
  picks: [], // venue id, 합산 정확히 2(§9.4)
  dropoffText: '',
  routeVisited: false,
  travelDate: null, // [V3] YYYY-MM-DD · 셋업 진입 시 오늘 기본(당일 예약 허용)
  logTemplate: null, // [V3] Travel Log 템플릿 적용 시 로그 code — setup CTA가 체크아웃 직행 판단
  quizAnswers: null, // [V5-0] K-Route 설문 응답(IA §11.3) · 필드만, 로직은 P2
  recommended: [], // [V5-0] 추천 결과(IA §11.4)
  goOrigin: null, // [V5-0] go 화면 현위치 출발점(IA §11.7)
};

// 플랜별 식사 픽 정원(§9.4 Step 1)
export function mealCap(mealPlan) {
  if (mealPlan === 'lunch') return 1;
  if (mealPlan === 'lunchDinner') return 2;
  return 0;
}

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

  // 플랜 변경 시 meals를 새 정원으로 절삭(순서 보존) — §31 해제 시 순서 재계산과 동일 원칙
  const setMealPlan = useCallback(
    (mealPlan) => setState((s) => ({ ...s, mealPlan, meals: s.meals.slice(0, mealCap(mealPlan)) })),
    [],
  );

  // 재클릭 해제·정원 초과 시 false 반환(자동 해제 금지 — 컴포넌트가 안내 렌더, §9.4)
  const toggleMeal = useCallback((id) => {
    let accepted = true;
    setState((s) => {
      if (s.meals.includes(id)) return { ...s, meals: s.meals.filter((m) => m !== id) };
      if (s.meals.length >= mealCap(s.mealPlan)) {
        accepted = false;
        return s;
      }
      return { ...s, meals: [...s.meals, id] };
    });
    return accepted;
  }, []);

  const togglePick = useCallback((id) => {
    let accepted = true;
    setState((s) => {
      if (s.picks.includes(id)) return { ...s, picks: s.picks.filter((p) => p !== id) };
      if (s.picks.length >= 2) {
        accepted = false;
        return s;
      }
      return { ...s, picks: [...s.picks, id] };
    });
    return accepted;
  }, []);

  const setDropoffText = useCallback((dropoffText) => setState((s) => ({ ...s, dropoffText })), []);
  const markRouteVisited = useCallback(() => setState((s) => ({ ...s, routeVisited: true })), []);
  const setTravelDate = useCallback((travelDate) => setState((s) => ({ ...s, travelDate })), []); // [V3]
  const reset = useCallback(() => setState(initial), []);

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

  // 식사 플랜 충족 판정(route 가드 성분)
  const mealPlanSatisfied = useMemo(() => {
    if (state.mealPlan === 'none') return true;
    if (state.mealPlan === 'lunch') return state.meals.length === 1;
    if (state.mealPlan === 'lunchDinner') return state.meals.length === 2;
    return false;
  }, [state.mealPlan, state.meals]);

  const value = useMemo(
    () => ({
      ...state,
      vehicle,
      mealPlanSatisfied,
      setParty,
      setLuggage,
      setMealPlan,
      toggleMeal,
      togglePick,
      setDropoffText,
      markRouteVisited,
      setTravelDate,
      applyLogTemplate,
      reset,
      trackStep,
    }),
    [state, vehicle, mealPlanSatisfied, setParty, setLuggage, setMealPlan, toggleMeal, togglePick, setDropoffText, markRouteVisited, setTravelDate, applyLogTemplate, reset, trackStep],
  );

  return <GtsContext.Provider value={value}>{children}</GtsContext.Provider>;
}

export function useGts() {
  return useContext(GtsContext);
}

// 스텝 가드(§31) · 미충족 시 앞 단계로 replace. 페이지는 반환값 false면 렌더 중단.
export function useGtsGuard(step) {
  const { party, mealPlanSatisfied, picks, routeVisited } = useGts();
  const navigate = useNavigate();

  let ok = true;
  let target = '/gts/setup';
  if (step === 'build') {
    ok = party != null;
  } else if (step === 'route') {
    ok = party != null && mealPlanSatisfied && picks.length === 2;
    target = party == null ? '/gts/setup' : '/gts/build';
  } else if (step === 'checkout') {
    ok = routeVisited;
    target = '/gts/route';
  }

  useEffect(() => {
    if (!ok) navigate(target, { replace: true });
  }, [ok, target, navigate]);

  return ok;
}
