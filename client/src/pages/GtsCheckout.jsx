// GTS 체크아웃 · IA §9.6 + §10.6 + PATTERNS §42 (존 C5 개정 — Pay 흐름 교체).
// 요약(차량·인원·짐·식사·픽 순서) + 금액 내역 전부 1뷰 노출(다크패턴 금지 §16.10) 유지.
// §42 결제: 결제 수단 그리드 8종 → 카드 계열 = 하단 카드 폼 확장(easeOut 220ms · 검증 없음 ·
//   빈 제출 허용 · 폼 하단 프로토타입 고지 caption) / Apple Pay·Alipay = 폼 생략 + 월렛
//   시뮬레이션 카피 1줄 + 바로 Pay. 확인 Dialog·성공 인터스티셜(스탬프 화면·View ticket) 삭제 —
//   Pay → createGtsBooking(결제 수단 문자열 저장 확장) → /ticket/:id replace 직행.
//   스탬프는 Ticket 페이지 진입 시 1회 재생으로 이동(§43).
// 로그인: 기본 데모 유저(§10.6)로 게이트 통과 — user 없을 때만 LoginGate 폴백(Guest-first 보존).
// 가드(§31): route 경유 — 미충족 시 route로 replace.
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, CarFront, Loader2 } from 'lucide-react';
import CardForm from '../components/pay/CardForm';
import ItineraryMap from '../components/gts/ItineraryMap';
import PayMethodGrid from '../components/pay/PayMethodGrid';
import { PAY_METHODS } from '../components/pay/payMethods';
import PassBreakdown from '../components/gts/PassBreakdown';
import TriText from '../components/gts/TriText';
import Container from '../components/layout/Container';
import Button from '../components/ui/Button';
import Money from '../components/ui/Money'; // [V12] 통화 환산 표시
import LoginGate from '../components/ui/LoginGate';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext'; // [V12] 환산 고지 조건
import { useGts, useGtsGuard } from '../context/GtsContext';
import { createGtsBooking } from '../data/gts/api';
import { LUGGAGE_FEE, PASS_ORDER, PASS_PRICES, computePassTotal } from '../data/gts/passes';
import { useLang } from '../i18n/LangContext';
import LangSwap from '../i18n/LangSwap';

const VEHICLE_ICON = { taxi: CarFront, van: Bus };

// [V23] 필수값 복원: 하차 지점·결제 수단을 다시 필수화(플래그 구조 유지 · 기본값만 true로 전환).
//   서버 REQUIRE_* env와 짝 — 서버도 REQUIRE_DROPOFF=true·REQUIRE_PAYMETHOD=true로 함께 강제(OPS/배포 env).
const REQUIRE_DROPOFF = true;
const REQUIRE_PAYMETHOD = true;

// 요약 행 · Booking 단일 확인 페이지 Row 선례(라벨 caption + 값 우측)
function Row({ labelKey, children }) {
  return (
    <div className="flex items-baseline justify-between gap-16 py-12">
      <LangSwap
        k={labelKey}
        as="dt"
        className="shrink-0 text-caption font-medium uppercase tracking-eyebrow text-inkMeta"
      />
      <dd className="flex min-w-0 items-baseline justify-end gap-8 text-right text-body">
        {children}
      </dd>
    </div>
  );
}

// [V23] 필수 표시 배지 · 라벨 옆(하차 지점·결제 수단) — 사전 인지용(별표 대체 텍스트 배지)
function RequiredBadge() {
  return (
    <LangSwap
      k="gts.checkout.requiredBadge"
      as="span"
      className="shrink-0 rounded-pill bg-spice/10 px-8 py-2 text-caption font-semibold uppercase tracking-eyebrow text-spice"
    />
  );
}

export default function GtsCheckout() {
  const ok = useGtsGuard('checkout');
  const { user } = useAuth();
  const { t } = useLang();
  const { convert } = useCurrency(); // [V12] 외화 환산 활성 여부(고지 문구 노출 조건)
  const { party, luggage, vehicle, mealPlan, meals, picks, course, dropoffText, travelDate, setDropoffText, trackStep } = useGts();
  const navigate = useNavigate();
  const [gateOpen, setGateOpen] = useState(false);
  const [payMethod, setPayMethod] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [attempted, setAttempted] = useState(false); // [V23] 제출 시도 후에만 인라인 오류 노출
  const dropoffRef = useRef(null); // [V23] 미입력 제출 시 포커스 이동 대상
  // [V7] 시간제 이용권(금액의 단일 근거 · 미선택 시 Pay 비활성 — 무마찰 예외 아님) + 환불 규정 동의(필수)
  const [passType, setPassType] = useState(null);
  const [consent, setConsent] = useState(false);

  if (!ok) return null;

  const entries = course; // [V5-3] 방문 순서 스팟(kind 'kto'|'venue' · GtsContext 파생)
  const total = computePassTotal(passType, luggage); // [V7] 이용권 + 짐 보관(선택 시) · 미선택 null
  const dropoffOk = dropoffText.trim().length > 0;
  const Icon = VEHICLE_ICON[vehicle];
  const method = PAY_METHODS.find((m) => m.id === payMethod) ?? null;

  // [V23] Pay 활성 조건 4가지: 이용권 · 환불 동의 · (필수 시) 하차 지점 · (필수 시) 결제 수단
  const blocked =
    !passType || !consent || (REQUIRE_DROPOFF && !dropoffOk) || (REQUIRE_PAYMETHOD && !method);
  // 버튼 하단 부족 항목 안내(읽기 순서: 이용권 → 하차 지점 → 결제 수단 → 환불 동의)
  const missing = [
    !passType && 'gts.checkout.needPass',
    REQUIRE_DROPOFF && !dropoffOk && 'gts.checkout.needDropoff',
    REQUIRE_PAYMETHOD && !method && 'gts.checkout.needPay',
    !consent && 'gts.checkout.needConsent',
  ].filter(Boolean);
  // 비활성 Pay 버튼 위 클릭은 통과(Button disabled = pointer-events-none) → 제출 시도 계측 + 첫 미입력 포커스
  const onBlockedAttempt = () => {
    setAttempted(true);
    if (REQUIRE_DROPOFF && !dropoffOk) dropoffRef.current?.focus();
  };

  // §42: 카드 입력값은 저장하지 않는다(검증 없음 · 빈 제출 허용) — 수단 문자열만 예약에 저장
  // [V5-frictionless] 하차·결제 수단 모두 선택적 · 미선택이면 null 저장
  const submit = async () => {
    setSubmitting(true);
    const dropoffValue = dropoffText.trim() || null;
    // [V7] pay 단계 payload에 passType·consent 기록(명세 [4])
    trackStep('pay_method', { method: method?.id ?? null, passType, consent });
    const booking = await createGtsBooking({
      party,
      luggage,
      vehicleType: vehicle,
      mealPlan,
      meals,
      picks,
      itinerary: entries.map((venue) => venue.id), // 순서 보존(§9.6 picks 순서 원칙)
      dropoffText: dropoffValue, // [V5] 미입력이면 null(빈 문자열 아님)
      payMethod: method?.id ?? null, // [V5] 미선택이면 null
      travelDate, // [V3] 빌더 날짜 관통(서버 travel_date)
      // [V7] 시간제 이용권 · 서버가 금액 재계산(클라 값은 오프라인 폴백 티켓 표시용)
      passType,
      consent,
      passAmount: PASS_PRICES[passType],
      luggageAmount: luggage ? LUGGAGE_FEE : 0,
      totalAmount: total,
      total,
    });
    // [V5] 검증 계측: 사람들이 이 두 단계를 건너뛰는가(대시보드 스킵 비율 소스)
    trackStep('complete', {
      code: booking.code ?? booking.id,
      dropoffProvided: !!dropoffValue,
      payMethodProvided: !!method,
    });
    // 성공 인터스티셜 없음 · 티켓 직행(§42 replace) — 스탬프는 Ticket 진입 시 1회(§43)
    navigate(`/ticket/${booking.id}`, { replace: true });
  };

  // 데모 유저 기본 로그인(§10.6) — user 없을 때만 LoginGate(Guest-first 폴백)
  const onPay = () => {
    if (user) submit();
    else setGateOpen(true);
  };

  return (
    <Container>
      <div className="flex flex-col gap-32 pb-64 pt-96">
        <LangSwap k="gts.checkout.title" as="h1" className="text-h1 font-bold tracking-display" />

        {/* 좌 요약 / 우 금액+결제(lg) · 380px은 §15 패널 폭 준용(Booking 선례) */}
        <div className="flex flex-col gap-24 lg:grid lg:grid-cols-[1fr_380px] lg:items-start lg:gap-12">
          <div className="flex flex-col gap-24">
            {/* [V7] 시간제 이용권 · 체크아웃 상단 — 새 요금의 단일 기준(카드 4종 단일 선택 · 미선택 시 Pay 비활성) */}
            <section className="flex flex-col gap-16 rounded-xl bg-white p-24 shadow-sm">
              <LangSwap k="gts.checkout.passTitle" as="h2" className="text-h3 font-semibold" />
              {/* [V13] 이용권 3종(2h/4h/day) — 3열 그리드 */}
              <div className="grid grid-cols-1 gap-12 sm:grid-cols-3">
                {PASS_ORDER.map((id) => {
                  const selected = passType === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setPassType(id)}
                      className={`pressable flex flex-col gap-8 rounded-lg p-16 text-left ${
                        selected ? 'bg-primary/10 ring-2 ring-inset ring-primary' : 'bg-surface'
                      }`}
                    >
                      <LangSwap k={`gts.pass.names.${id}`} className="text-small font-semibold" />
                      {/* [V12] ₩ 주 금액 + 환산 보조(카드에선 아래 줄) */}
                      <Money
                        krw={PASS_PRICES[id]}
                        className="font-display text-h3 font-bold text-primary"
                        convClassName="block text-caption font-medium text-inkMeta"
                      />
                      {/* 각 카드 포함 안내 1줄(명세 [1]) */}
                      <LangSwap k="gts.pass.included" className="text-caption font-medium text-inkSec" />
                    </button>
                  );
                })}
              </div>
              {/* 카드 아래 공통 초과 요금 안내 1줄(명세 [1]) */}
              <LangSwap k="gts.pass.overtime" as="p" className="text-caption font-medium text-inkMeta" />
            </section>

            {/* 선택 요약 · 전부 펼침(1뷰) */}
            <section className="flex flex-col rounded-xl bg-white px-24 py-8 shadow-sm">
              <LangSwap k="gts.checkout.summaryTitle" as="h2" className="pt-16 text-h3 font-semibold" />
              <dl className="flex flex-col divide-y divide-line">
                <Row labelKey="gts.checkout.vehicleLabel">
                  <span className="flex items-center gap-8">
                    {Icon && <Icon size={16} aria-hidden="true" className="text-primary" />}
                    <LangSwap k={`gts.vehicle.${vehicle}`} className="font-semibold" />
                  </span>
                </Row>
                <Row labelKey="gts.checkout.partyLabel">
                  <span className="font-display font-semibold">{party}</span>
                </Row>
                <Row labelKey="gts.checkout.luggageLabel">
                  <LangSwap
                    k={luggage ? 'gts.checkout.luggageYes' : 'gts.checkout.luggageNo'}
                    className="font-semibold"
                  />
                </Row>
                <Row labelKey="gts.checkout.mealPlanLabel">
                  <LangSwap k={`gts.build.plan.${mealPlan}`} className="font-semibold" />
                </Row>
                {/* [V3] 여행 날짜 · 셋업 CalendarField 값 관통 */}
                {travelDate && (
                  <Row labelKey="gts.checkout.dateLabel">
                    <span className="font-display font-semibold">{travelDate}</span>
                  </Row>
                )}
              </dl>
            </section>

            {/* [V3] 동선 미니맵 · 라인 상시 렌더(Travel Log 직행 플로우는 route를 안 거치므로
                여기가 동선의 첫 시각 확인 지점 — mockCoords로 어떤 조합에도 그린다) */}
            <div className="relative aspect-video overflow-hidden rounded-xl shadow-sm">
              <ItineraryMap venues={entries} />
            </div>

            {/* 방문 순서 리스트 · route와 동일 파생 규칙(§9.6) */}
            <section className="flex flex-col gap-12 rounded-xl bg-white p-24 shadow-sm">
              <LangSwap k="gts.checkout.orderTitle" as="h2" className="text-h3 font-semibold" />
              <ol className="flex flex-col gap-12">
                {entries.map((venue, i) => (
                  <li key={venue.id} className="flex items-center gap-12">
                    <span
                      aria-hidden="true"
                      className="flex h-24 w-24 shrink-0 items-center justify-center rounded-pill bg-primary font-display text-caption font-bold text-white"
                    >
                      {i + 1}
                    </span>
                    <TriText text={venue.name} className="min-w-0 text-body font-semibold" />
                  </li>
                ))}
              </ol>
            </section>

            {/* 최종 하차 지점 · [V23] 필수 복원(미입력 시 Pay 비활성 · 제출 시도 시 포커스+인라인 오류) */}
            <section className="flex flex-col gap-12 rounded-xl bg-white p-24 shadow-sm">
              <label className="flex flex-col gap-8">
                <span className="flex items-center gap-8">
                  <LangSwap k="gts.checkout.dropoffLabel" as="span" className="text-h3 font-semibold" />
                  {REQUIRE_DROPOFF && <RequiredBadge />}
                </span>
                <LangSwap
                  k={REQUIRE_DROPOFF ? 'gts.checkout.dropoffRequiredNote' : 'gts.checkout.dropoffOptional'}
                  className="text-caption font-medium text-inkMeta"
                />
                <input
                  ref={dropoffRef}
                  type="text"
                  value={dropoffText}
                  onChange={(e) => setDropoffText(e.target.value)}
                  placeholder={t('gts.checkout.dropoffPlaceholder')}
                  aria-invalid={REQUIRE_DROPOFF && attempted && !dropoffOk}
                  // 포커스·오류 링을 ring-inset(요소 안쪽)으로 — 부모 경계에 잘리지 않고 크기·위치 불변(CardForm과 동일 문법)
                  className={`h-48 rounded-md bg-surface px-16 text-body focus:ring-2 focus:ring-inset focus:ring-primary ${
                    REQUIRE_DROPOFF && attempted && !dropoffOk ? 'ring-2 ring-inset ring-spice' : ''
                  }`}
                />
              </label>
              {/* [V23] 인라인 오류 = 제출 시도(attempted) 후 미입력일 때만 */}
              {REQUIRE_DROPOFF && (
                <div aria-live="polite">
                  {attempted && !dropoffOk && (
                    <LangSwap
                      k="gts.checkout.dropoffRequired"
                      as="p"
                      className="text-small font-medium text-spice"
                    />
                  )}
                </div>
              )}
            </section>

            {/* §42 결제 수단 그리드 8종 + 카드 폼/월렛 카피 · [V23] 필수 복원(미선택 시 Pay 비활성) */}
            <section className="flex flex-col gap-16 rounded-xl bg-white p-24 shadow-sm">
              <div className="flex items-center gap-8">
                <LangSwap k="gts.pay.title" as="h2" className="text-h3 font-semibold" />
                {REQUIRE_PAYMETHOD && <RequiredBadge />}
              </div>
              <PayMethodGrid value={payMethod} onChange={setPayMethod} />
              {/* [V23] 선택 그리드 아래 인라인 오류 = 제출 시도(attempted) 후 미선택일 때만 */}
              {REQUIRE_PAYMETHOD && (
                <div aria-live="polite">
                  {attempted && !method && (
                    <LangSwap
                      k="gts.checkout.payMethodRequired"
                      as="p"
                      className="text-small font-medium text-spice"
                    />
                  )}
                </div>
              )}
              {/* [H2-16] 월렛 시뮬레이션 카피 삭제 · 월렛 = 폼 생략 + 바로 Pay(§42 유지) */}
              {/* 카드 계열 = 하단 카드 폼 확장(마운트 시 220ms easeOut · CardForm 내장) */}
              {method && !method.wallet && <CardForm />}
            </section>
          </div>

          {/* 금액 내역 + Pay · 전 항목 + 합계 항상 펼침(§33) · [H2-14] lg+ sticky 동행 */}
          <aside className="flex flex-col gap-24 rounded-xl bg-white p-24 shadow-md lg:sticky lg:top-24">
            <LangSwap k="gts.checkout.priceTitle" as="h2" className="text-h3 font-semibold" />
            {/* [V7] 분리 내역: 이용권(이름·시간)·짐 보관(선택 시)·최종 금액 — FareBreakdown 대체 */}
            <PassBreakdown passType={passType} luggage={luggage} />
            {/* [V7] 전액 포함 안내 밴드(명세 [2]) · 결제 버튼 위 */}
            <LangSwap
              k="gts.checkout.allIncluded"
              as="p"
              className="rounded-md bg-surface px-16 py-12 text-caption font-semibold text-inkSec"
            />
            {/* [V12] 환산 고지 · 외화 표시 중일 때만(결제 내역 하단 1줄) — 원화 결제·참고용 환산 */}
            {convert(1000) && (
              <LangSwap k="common.money.disclaimer" as="p" className="text-caption font-medium text-inkMeta" />
            )}
            {/* [V7] 취소·환불 규정 요약 + 동의(필수 · 미동의 시 Pay 비활성 · 동의 시각 consent_at 저장) */}
            <div className="flex flex-col gap-12 rounded-md bg-surface px-16 py-12">
              <LangSwap k="gts.checkout.refundTitle" as="h3" className="text-small font-semibold" />
              <LangSwap k="gts.checkout.refundBody" as="p" className="text-caption font-medium text-inkSec" />
              <label className="flex min-h-44 cursor-pointer items-center gap-12">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="h-20 w-20 shrink-0 accent-primary"
                />
                <LangSwap k="gts.checkout.consentLabel" className="text-small font-medium" />
              </label>
            </div>
            {/* [V23] Pay 활성 조건 4가지(이용권·동의·하차 지점·결제 수단) · 미충족 시 비활성 + 부족 항목 안내 */}
            <div className="grid gap-8">
              {/* 비활성 시 Button은 pointer-events-none — 래퍼가 클릭을 받아 제출 시도 계측+포커스 처리 */}
              <div className="grid" onClick={blocked && !submitting ? onBlockedAttempt : undefined}>
                <Button disabled={submitting || blocked} onClick={onPay}>
                  <LangSwap k="gts.checkout.payCta" />
                  {submitting && (
                    <Loader2 size={16} aria-hidden="true" className="animate-spin motion-reduce:animate-none" />
                  )}
                </Button>
              </div>
              {/* 무엇이 남았는지 한 줄 안내(비활성일 때만) */}
              {blocked && !submitting && (
                <p aria-live="polite" className="text-caption font-medium text-inkSec">
                  {t('gts.checkout.needLabel')}: {missing.map((k) => t(k)).join(', ')}
                </p>
              )}
            </div>
            {/* [V3] 수정하기 · 현재 선택(템플릿 포함)이 프리필된 채 build 스텝으로 복귀 —
                StepStage 정상 동작(카운터·정원 규칙 유지 · Context 상태 그대로) */}
            <div className="grid">
              <Button variant="secondary" onClick={() => navigate('/gts/build')}>
                <LangSwap k="gts.checkout.editCta" />
              </Button>
            </div>
          </aside>
        </div>
      </div>

      <LoginGate open={gateOpen} onClose={() => setGateOpen(false)} returnTo="/gts" />
    </Container>
  );
}
