// [V5-3] /gts/go 출발 · IA §11.7 현위치 → 코스 장소 · 가드 useGtsGuard('go')(route 경유 + 코스 있음).
// 상단 요약: 출발(현재 위치 | 춘천역) → 도착(FieldSelect · 코스 전체 · 기본 1번) · 모바일 세로 스택 / lg 가로.
// 현재 위치 = §21 동의 패턴(GateForm 선례): goOrigin 없으면 설명 Modal 먼저 → '허용'에서만 geolocation 1회.
//   거절·실패·미지원·'나중에' = 춘천역 출발 + noLocation 안내(에러 톤 금지) · 좌표는 조회에만 쓰고 화면에 내지 않는다.
// 결과 = /api/go(춘천 시내 실시간 provider 미연결 → 직선거리 기반 도보·택시 '예상') · q5 우선 수단 먼저.
//   no-coord = 숫자 없이 mockNotice(지도도 비렌더 · 지어낸 거리 금지) · 네트워크 실패 = go.error + 재시도.
// 지도 = ItineraryMap 재사용([출발점, 도착] · 출발 핀 = 순번 없는 링 · draw-on 지속 = 직선거리 비례 · 하한·상한).
// 집중률 카드(공사 API 근거) = 3xl 미만 결과 아래 · 3xl 이상 우측 열(RESPONSIVE go 절 · 같은 DOM에 배치만 전환).
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowRight, LocateFixed, MapPin, RotateCcw, TrainFront } from 'lucide-react';
import CrowdCard from '../components/go/CrowdCard';
import LegTimeline from '../components/go/LegTimeline';
import RoutePassCard from '../components/go/RoutePassCard';
import ItineraryMap from '../components/gts/ItineraryMap';
import TriText from '../components/gts/TriText';
import Container from '../components/layout/Container';
import Button from '../components/ui/Button';
import FieldSelect from '../components/ui/FieldSelect';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import { useGts, useGtsGuard } from '../context/GtsContext';
import { haversineKm } from '../data/gts/distance';
import { chuncheonPoints } from '../data/gts/hubs';
import { getGo } from '../data/gts/ktoApi';
import LangSwap from '../i18n/LangSwap';
// 출발 핀 이름 3언어(StopPopup name 필드) · 사전 직접 참조(StopPopup 선례)
import en from '../i18n/en';
import ko from '../i18n/ko';
import th from '../i18n/th';

// 1회 측위 옵션 · PATTERNS §21 watch 옵션과 동일 계열(고정밀 불필요)
const LOCATE_OPTIONS = { enableHighAccuracy: false, maximumAge: 30000, timeout: 20000 };
// 위치 거부·실패 시 출발점 · hubs.js 춘천역 좌표(PLACEHOLDER — verify)
const STATION = chuncheonPoints.find((p) => p.id === 'chuncheon-station').coord;
// draw-on 지속 = 직선거리 비례(MOTION go 절 "라인 길이 기반") · 하한·상한으로 짧은/긴 구간 모두 읽히게
const DRAW_MS_PER_KM = 150;
const DRAW_MIN_MS = 600;
const DRAW_MAX_MS = 1400;

export default function GtsGo() {
  const ok = useGtsGuard('go');
  const { course, quizAnswers, goOrigin, setGoOrigin, trackStep } = useGts();
  const navigate = useNavigate();
  const [destId, setDestId] = useState(() => course[0]?.id);
  const [locateOpen, setLocateOpen] = useState(!goOrigin); // 진입 시 출발점 미정이면 설명 모달 먼저
  const [locating, setLocating] = useState(false);
  const [go, setGo] = useState(null); // { key, res } · res null = 네트워크 실패(to 없음)
  const [retry, setRetry] = useState(0);
  const consented = useRef(false); // 동의는 페이지 세션 1회(§21 · GateForm 선례)
  // [V5-33] "Your location" 라벨만으로는 실제로 맞는 위치를 잡았는지 확인이 안 된다는 지적 반영.
  //   OpenStreetMap Nominatim(이미 지도 타일 출처로 쓰는 곳과 동일 데이터셋)으로 좌표 → 짧은 주소를
  //   1회 역지오코딩해 보조 캡션으로 보여준다. 실패·타임아웃이면 조용히 원래 라벨만 유지(실패가
  //   화면에 에러로 드러나지 않는다 · 외부 서비스 1개 추가 의존이라 반드시 폴백 경로를 둔다).
  const [address, setAddress] = useState(null);

  const destIdx = Math.max(0, course.findIndex((s) => s.id === destId));
  const dest = course[destIdx];
  const isLast = destIdx === course.length - 1;
  const originKind = goOrigin?.kind;
  const [oLng, oLat] = goOrigin?.coord ?? [];

  // 도착 옵션 · 참조 고정(열린 listbox의 하이라이트가 부모 재렌더로 초기화되지 않게) · 라벨은 겹침 렌더라 언어 무관
  const options = useMemo(
    () =>
      course.map((spot, i) => ({
        id: spot.id,
        icon: MapPin,
        primary: <TriText text={spot.name} />,
        secondary: <LangSwap k="go.stopN" vars={{ n: i + 1 }} />,
      })),
    [course],
  );

  // 조회 키 = 도착 + 출발(종류·좌표) + 재시도 · 측위 중엔 null(이중 조회·이중 계측 방지)
  //   결과는 키가 같을 때만 표시 → 도착·출발 전환 직후 이전 결과가 새 장소명과 섞여 보이는 프레임 차단
  const reqKey = goOrigin && !locating && dest ? `${dest.id}|${goOrigin.kind}|${goOrigin.coord}|${retry}` : null;
  useEffect(() => {
    if (!ok || !reqKey) return undefined;
    let alive = true;
    const [lng, lat] = goOrigin.coord;
    getGo(lat, lng, dest.id).then((res) => {
      if (!alive) return;
      setGo({ key: reqKey, res: res.to ? res : null });
      // 결과가 뜰 때마다 계측 1회(네트워크 실패 = 결과 아님)
      if (res.to) trackStep('go', { to: dest.id, kind: dest.kind, origin: goOrigin.kind, source: res.source });
    });
    return () => {
      alive = false;
    };
    // reqKey가 goOrigin·dest·retry의 값 변화를 모두 담는다(같은 값의 새 객체로는 재조회·재계측하지 않음)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ok, reqKey]);

  // 지도 입력 · 출발/도착이 바뀔 때만 새 배열(ItineraryMap은 venues 참조로 재마운트) · 측위 중엔 보류(이중 마운트 방지)
  const map = useMemo(() => {
    if (!originKind || locating || !dest?.coord) return null;
    const origin = {
      id: 'origin',
      kind: 'origin',
      name: { en: en.go[originKind], ko: ko.go[originKind], th: th.go[originKind] },
      oneLine: {},
      coord: [oLng, oLat],
      stayMin: 0, // StopPopup 체류 칩 필드 · 출발점은 체류 없음
    };
    const km = haversineKm(origin.coord, dest.coord);
    return {
      venues: [origin, dest],
      pinLabels: [null, String(destIdx + 1)],
      drawMs: Math.min(DRAW_MAX_MS, Math.max(DRAW_MIN_MS, Math.round(km * DRAW_MS_PER_KM))),
    };
  }, [originKind, oLng, oLat, locating, dest, destIdx]);

  if (!ok) return null;

  const toStation = () => setGoOrigin({ kind: 'station', coord: STATION });

  // 측위 1회 · 반드시 동의 흐름 뒤에서만 호출(§21) · 거절·실패·미지원 = 춘천역(에러 톤 금지)
  const locate = () => {
    if (!('geolocation' in navigator)) {
      toStation();
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false);
        setGoOrigin({ kind: 'current', coord: [coords.longitude, coords.latitude] });
      },
      () => {
        setLocating(false);
        toStation();
      },
      LOCATE_OPTIONS,
    );
  };

  // 현재 위치 다시 시도 · 동의가 이미 있으면(이번 세션 허용 또는 현재 위치 출발 중) 모달 없이
  const requestLocation = () => {
    if (consented.current || originKind === 'current') locate();
    else setLocateOpen(true);
  };

  const allow = () => {
    consented.current = true;
    setLocateOpen(false);
    locate();
  };

  // '나중에'·Escape·닫기 = 춘천역 출발(이미 춘천역이면 그대로 · 중복 재조회 방지)
  const later = () => {
    setLocateOpen(false);
    if (originKind !== 'station') toStation();
  };

  // 다음 장소 · 도착을 다음 순번으로 교체 + 현재 위치 출발이면 재측위(동의 이미 받음 · 모달 없음)
  const next = () => {
    setDestId(course[destIdx + 1].id);
    if (originKind === 'current') locate();
  };

  useEffect(() => {
    if (originKind !== 'current' || oLat == null || oLng == null) {
      setAddress(null);
      return undefined;
    }
    let alive = true;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000); // 5초 넘으면 포기(폴백 라벨 유지)
    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${oLat}&lon=${oLng}&zoom=16&accept-language=en`,
      { signal: ctrl.signal },
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!alive || !data?.address) return;
        const a = data.address;
        // 동/읍면 단위 우선, 없으면 더 넓은 단위로(빈 문자열이면 표시 안 함 · 지어내지 않는다)
        const short = a.suburb || a.neighbourhood || a.village || a.town || a.city_district || a.city || null;
        if (short) setAddress(short);
      })
      .catch(() => {}) // 네트워크 실패·타임아웃 = 조용히 무시(기존 "Your location" 라벨만 유지)
      .finally(() => clearTimeout(timer));
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [originKind, oLat, oLng]);

  const pending = locating || !originKind;
  const OriginIcon = originKind === 'station' && !pending ? TrainFront : LocateFixed;
  const cur = go?.key === reqKey ? go : null; // null = 조회 중(키 불일치 = 이전 결과 무효)
  const res = cur?.res;

  return (
    <>
      <Container>
        <div className="flex flex-col gap-32 pb-64 pt-96">
          <LangSwap k="go.title" as="h1" className="text-h1 font-bold tracking-display" />

          {/* [V5-31] 노선 패스카드 · 이전역 ← 현재역 → 다음역(실제 지하철 플랫폼 행선 안내판 참고자료 반영) */}
          <RoutePassCard course={course} destIdx={destIdx} />

          {/* 3xl 미만 = 세로 흐름(요약 → 결과·지도 → 집중률 → 버튼) · 3xl 이상 = 집중률 카드만 우측 열 */}
          <div className="flex flex-col gap-24 3xl:grid 3xl:grid-cols-[minmax(0,1fr)_380px] 3xl:items-start 3xl:gap-x-32">
            {/* 요약 · 출발 → 도착(모바일 세로 스택 · lg 가로) */}
            <section className="flex flex-col rounded-xl bg-white p-24 shadow-sm 3xl:col-start-1">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-16">
                {/* 출발 · FieldSelect 닫힘 문법과 같은 면(비인터랙티브) · 측위 상태 aria-live */}
                <div className="flex flex-col gap-4 rounded-md bg-surface p-16 lg:flex-1">
                  <LangSwap k="go.from" className="text-caption font-medium text-inkMeta" />
                  <span aria-live="polite" className="flex items-center gap-8">
                    <OriginIcon size={20} aria-hidden="true" className="shrink-0 text-ink" />
                    <span className="flex min-w-0 flex-col">
                      <LangSwap
                        k={pending ? 'go.locating' : `go.${originKind}`}
                        className={`text-body font-medium ${pending ? 'text-inkSec' : 'text-ink'}`}
                      />
                      {/* [V5-33] 역지오코딩된 짧은 주소 · 실패하면 아예 안 뜬다(폴백은 위 라벨만) */}
                      {!pending && originKind === 'current' && address && (
                        <span className="truncate text-caption font-medium text-inkMeta">{address}</span>
                      )}
                    </span>
                  </span>
                </div>
                <ArrowDown size={20} aria-hidden="true" className="shrink-0 self-center text-inkMeta lg:hidden" />
                <ArrowRight size={20} aria-hidden="true" className="hidden shrink-0 text-inkMeta lg:block" />
                <div className="lg:flex-1">
                  <FieldSelect
                    label="go.to"
                    value={dest.id}
                    placeholder="go.to"
                    options={options}
                    onChange={setDestId}
                  />
                </div>
              </div>
              {/* 춘천역 출발 안내 + 현재 위치 다시 시도(에러 톤 금지 · 안내 문법) */}
              {originKind === 'station' && !locating && (
                <div className="mt-16 flex flex-wrap items-center gap-12">
                  <LangSwap k="go.noLocation" as="p" className="text-small font-medium text-inkSec" />
                  <Button variant="secondary" onClick={requestLocation}>
                    <LocateFixed size={20} aria-hidden="true" />
                    <LangSwap k="go.useLocation" />
                  </Button>
                </div>
              )}
            </section>

            {/* 결과 + 지도 · lg = 좌 결과 380 / 우 지도(GtsRoute 레이아웃) · 좌표 없는 도착은 지도 없이 결과만 */}
            <div
              className={`flex flex-col gap-24 3xl:col-start-1 ${
                dest.coord ? 'lg:grid lg:grid-cols-[380px_minmax(0,1fr)] lg:items-start lg:gap-12' : ''
              }`}
            >
              <section className="flex flex-col gap-16 rounded-xl bg-white p-24 shadow-sm">
                <LangSwap k="go.resultTitle" as="h2" className="text-h3 font-semibold" />
                <div aria-live="polite" className="flex flex-col gap-16">
                  {!cur && <Skeleton className="h-132" />}
                  {cur && !res && (
                    <>
                      <LangSwap k="go.error" as="p" className="text-body text-inkSec" />
                      <div>
                        <Button variant="secondary" onClick={() => setRetry((n) => n + 1)}>
                          <RotateCcw size={20} aria-hidden="true" />
                          <LangSwap k="go.retry" />
                        </Button>
                      </div>
                    </>
                  )}
                  {res?.estimates && (
                    <>
                      <LegTimeline
                        originKind={originKind}
                        estimates={res.estimates}
                        prefer={quizAnswers.q5 === 'taxi' ? 'taxi' : 'walk'}
                        dest={dest}
                        n={destIdx + 1}
                      />
                      <LangSwap
                        k="go.distance"
                        vars={{ km: res.km }}
                        as="p"
                        className="text-small font-semibold text-inkSec"
                      />
                      <LangSwap k="go.fallbackNote" as="p" className="text-caption font-medium text-inkMeta" />
                    </>
                  )}
                  {res && !res.estimates && (
                    <LangSwap k="gts.route.mockNotice" as="p" className="text-small font-medium text-inkSec" />
                  )}
                </div>
              </section>

              {dest.coord && (
                <div className="relative aspect-square overflow-hidden rounded-xl shadow-sm md:aspect-video">
                  {map ? (
                    <ItineraryMap
                      venues={map.venues}
                      pinLabels={map.pinLabels}
                      drawMs={map.drawMs}
                      labelKey="go.mapLabel"
                    />
                  ) : (
                    <Skeleton className="absolute inset-0" />
                  )}
                </div>
              )}
            </div>

            <CrowdCard id={dest.id} className="3xl:col-start-2 3xl:row-span-3 3xl:row-start-1" />

            {/* 하단 · 다음 장소(마지막이면 비활성 + 안내) · 보조 = 동선으로 돌아가기 */}
            <div className="flex flex-col 3xl:col-start-1">
              <div className="flex flex-wrap items-center gap-12">
                <Button onClick={next} disabled={isLast}>
                  <LangSwap k="go.next" />
                  <ArrowRight size={20} aria-hidden="true" />
                </Button>
                <Button variant="secondary" onClick={() => navigate('/gts/route')}>
                  <LangSwap k="go.back" />
                </Button>
              </div>
              <div aria-live="polite">
                {isLast && (
                  <LangSwap k="go.last" as="p" className="mt-12 text-small font-medium text-inkSec" />
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* [V5-9] K-가이드 FAB 제거(챗봇을 헤드라인에서 내린다) · 챗 기능·컴포넌트는 보존 */}

      {/* 위치 사용 사전 설명 모달 · §21 동의 패턴(GateForm 구조 동형) · "허용"에서만 실제 geolocation 요청 */}
      <Modal open={locateOpen} onClose={later} title="go.locate.title">
        <div className="flex flex-col gap-16">
          <LangSwap k="go.locate.body" as="p" className="text-body font-medium text-inkSec" />
          <div className="flex flex-wrap items-center gap-12">
            <Button onClick={allow}>
              <LangSwap k="go.locate.allow" />
            </Button>
            <Button variant="secondary" onClick={later}>
              <LangSwap k="go.locate.later" />
            </Button>
          </div>
          <LangSwap k="go.locate.footnote" as="p" className="text-caption font-medium text-inkMeta" />
        </div>
      </Modal>
    </>
  );
}
