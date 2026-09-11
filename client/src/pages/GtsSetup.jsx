// GTS 셋업 · IA §9.3 (존 C4 확장 · 스텁 확장 — 교체 아님).
// 인원 Stepper(1~12) + 짐 보관 토글(Optional 성격 카피 · 캐리어 없음/숙소에 둠 케이스) →
// GtsContext setParty/setLuggage. 매칭 카드 = 파생 vehicle(§9.3 결정론 · Context 셀렉터) 실시간 표시 +
// fares 조회 요금 구성(DRAFT 고지). CTA → /gts/build.
// 아이콘: taxi = CarFront(TAXI 문자 아이콘 금지), van = Bus — lucide-react 실존 확인 완료.
// (Caravan도 실존하나 캠핑 트레일러 형상이라 밴 대체 부적합 · 완료 보고 참조)
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, CarFront } from 'lucide-react';
import CalendarField from '../components/gate/CalendarField';
import Container from '../components/layout/Container';
import StepIndicator from '../components/gts/StepIndicator';
import Button from '../components/ui/Button';
import Stepper from '../components/ui/Stepper';
import { useGts } from '../context/GtsContext';
import { OFFICIAL_EMAIL, PARTY_CONTACT_THRESHOLD } from '../config';
import { useLang } from '../i18n/LangContext';
import LangSwap from '../i18n/LangSwap';

const VEHICLE_ICON = { taxi: CarFront, van: Bus };

// [V3] 오늘(로컬) YYYY-MM-DD · 당일 예약 허용 기준값
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function GtsSetup() {
  const { party, luggage, vehicle, travelDate, logTemplate, routeVisited, setParty, setLuggage, setTravelDate, trackStep } = useGts();
  const navigate = useNavigate();
  const { t } = useLang();

  // 첫 진입 시 인원 1 확정(Stepper 하한 · build 가드 성립 근거)
  useEffect(() => {
    if (party == null) setParty(1);
  }, [party, setParty]);

  // [V3] 여행 날짜 기본 = 오늘(당일 예약 허용 · 미조작 시에도 값 관통)
  useEffect(() => {
    if (travelDate == null) setTravelDate(todayStr());
  }, [travelDate, setTravelDate]);

  const Icon = vehicle ? VEHICLE_ICON[vehicle] : CarFront;
  // [V9] 9명 이상 단체는 이메일 문의(Build 비활성 + 안내) · 8 이하로 내리면 즉시 복구
  const overCap = (party ?? 1) >= PARTY_CONTACT_THRESHOLD;

  return (
    <Container>
      {/* v4.2 §10.4 데스크탑 확폭: max-w-dialog 페이지 래퍼 제거 — lg 2컬럼으로 v3.2 컨테이너 실사용 */}
      <div className="flex w-full flex-col gap-32 pb-64 pt-96">
        {/* [V8] 헤딩 + 단계 인디케이터 · lg = 헤딩 우측 상단(레이아웃 불침범) / <lg = 헤딩 아래 한 줄 컴팩트 */}
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-24">
          <div className="flex flex-col gap-8">
            <LangSwap k="gts.setup.title" as="h1" className="text-h1 font-bold tracking-display" />
            <LangSwap k="gts.setup.sub" as="p" className="text-body text-inkSec" />
          </div>
          {/* 이 화면 = 1단계 active · 다른 화면 부착은 currentStep 한 줄 확장 */}
          <StepIndicator currentStep={1} />
        </div>

        {/* [H2-10] 단일 카드: 좌 = Your ride / 우 = Travelers+짐 토글, CTA는 우측 컬럼 아래 우측 정렬 */}
        <div className="grid gap-24 rounded-xl bg-white p-24 shadow-sm lg:grid-cols-2 lg:items-start lg:gap-40 lg:p-40">
        {/* 매칭 결과(Your ride) · 좌측 컬럼(lg) — 파생 vehicle(§9.3) · 카드 안 서브 영역(surface 면) */}
        <section className="flex flex-col gap-24 rounded-lg bg-surface p-24">
          <LangSwap k="gts.setup.matchTitle" as="h2" className="text-h3 font-semibold" />
          <div className="flex items-center gap-16">
            <span
              aria-hidden="true"
              className="flex h-64 w-64 shrink-0 items-center justify-center rounded-pill bg-primary text-white"
            >
              <Icon size={32} aria-hidden="true" />
            </span>
            {vehicle && (
              <LangSwap k={`gts.vehicle.${vehicle}`} className="font-display text-h2 font-bold" />
            )}
          </div>
          {/* [V7] 구 요금 구성(FareBreakdown) 렌더 제거 — 요금은 체크아웃의 시간제 이용권이 단일 기준.
              셋업 카드는 차량 매칭 결과만 표시(모순되는 이중 가격 노출 방지 · 명세 밖 결정 보고). */}
        </section>

        {/* 인원 + 짐 보관 · 우측 컬럼(lg) */}
        <section className="flex flex-col gap-24">
          {/* [V3] 여행 날짜 · CalendarField(§19 · 오늘 링·과거 비활성·당일 허용) */}
          <CalendarField
            label="gts.setup.dateLabel"
            value={travelDate}
            placeholder="gts.setup.datePlaceholder"
            onChange={setTravelDate}
          />
          <div aria-hidden="true" className="h-px w-full bg-line" />
          <Stepper value={party ?? 1} min={1} max={12} onChange={setParty} label="gts.setup.partyLabel" />
          {/* 수평 디바이더 · colors.line 허용 예외(Booking 요약 카드 선례) */}
          <div aria-hidden="true" className="h-px w-full bg-line" />
          <div className="flex items-center justify-between gap-16">
            <div className="flex min-w-0 flex-col gap-4">
              <LangSwap k="gts.setup.luggageTitle" className="text-small font-medium" />
              {/* Optional 성격 카피(§9.3) · 캐리어 없음/숙소에 둠 케이스 */}
              <LangSwap k="gts.setup.luggageBody" className="text-caption font-medium text-inkSec" />
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={luggage}
              aria-label={t('gts.setup.luggageToggle')}
              onClick={() => setLuggage(!luggage)}
              className="inline-flex min-h-44 shrink-0 items-center"
            >
              <span
                aria-hidden="true"
                className={`flex h-24 w-44 items-center rounded-pill p-4 transition-colors duration-fast ${
                  luggage ? 'bg-primary' : 'bg-line'
                }`}
              >
                <span
                  className={`h-16 w-16 rounded-pill bg-white shadow-sm transition-transform duration-fast ease-in-out ${
                    luggage ? 'translate-x-20' : ''
                  }`}
                />
              </span>
            </button>
          </div>
        </section>

        {/* [H2-10] CTA · 우측 컬럼 바로 아래 우측 정렬(고아 좌측 버튼 금지) · [V9] 9명+ 비활성+안내 */}
        <div className="flex flex-col items-end gap-8 lg:col-start-2">
          <Button
            disabled={overCap}
            onClick={() => {
              // [V1] setup 완료 계측(비차단) · [V3] 날짜 포함
              trackStep('setup', { party: party ?? 1, luggage, vehicle, travelDate });
              // [V3] Travel Log 템플릿 적용 상태 = 인원 선택만 진행 → 체크아웃 직행
              // [V5-3] K-Route route '차량으로 이동'(동선 확정 후 진입)도 체크아웃 직행
              navigate(logTemplate || routeVisited ? '/gts/checkout' : '/gts/build');
            }}
          >
            {/* [V5-3] 체크아웃 직행 분기(route 경유·Travel Log 템플릿)면 라벨도 결제로 */}
            <LangSwap k={logTemplate || routeVisited ? 'gts.setup.ctaCheckout' : 'gts.setup.cta'} />
          </Button>
          {/* [V9] 9명 이상 단체 문의 안내 · 버튼 아래 · 실제 메일은 config OFFICIAL_EMAIL */}
          {overCap && (
            <p className="text-right text-small font-medium text-inkSec" aria-live="polite">
              {t('gts.setup.partyCapHelp')}{' '}
              <a
                href={`mailto:${OFFICIAL_EMAIL}`}
                className="font-semibold text-primary underline underline-offset-4"
              >
                {OFFICIAL_EMAIL}
              </a>
            </p>
          )}
        </div>
        </div>
      </div>
    </Container>
  );
}
