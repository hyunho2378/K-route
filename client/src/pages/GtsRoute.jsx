// GTS·K-Route 동선 결과 · IA §9.5 + §10.5 + §11.6 + PATTERNS §32 (존 C5 개정 → [V5-3] 최소 수정).
// §10.5: Visit order 번호 리스트 → §28 RouteTimeline 문법의 세로 타임라인(VisitTimeline ·
//   노드 = 순번 원 28px primary + white 숫자 · 우측 장소명) · 지도와 병렬 배치.
// [V5-3] 순서 = 코스(GtsContext course · 고른 순서 · kind 'kto'|'venue' 스팟) · 타임라인에 K배지·집중률 Chip ·
//   CTA 3종(IA §11.6): 주 "첫 장소로 출발"(→ go) / 보조 "다시 고르기"(→ build) / 텍스트링크 "차량으로 이동"(→ setup · 기존 결제 플로우) ·
//   K-가이드 봇 FAB 자리(챗은 P3 · 비활성).
// [V3] §32 리스트 폴백 폐지 · 어떤 조합에서도 지도 라인 상시 렌더(mockCoords 결정적 DEMO 좌표 · 좌표 없는 장소 포함 시 mockNotice 고지).
// 가드(§31 · [V5-3]): 추천 결과 + 정원(q4)만큼 담음 · 미충족 시 build(또는 quiz)로 replace. 통과 시 route 경유 마킹.
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getFestivals, getSpots, planRoute } from '../data/gts/ktoApi';
import ItineraryMap from '../components/gts/ItineraryMap';
import KBadge from '../components/gts/KBadge';
import VisitTimeline from '../components/gts/VisitTimeline';
import Container from '../components/layout/Container';
import Button from '../components/ui/Button';
import { useGts, useGtsGuard } from '../context/GtsContext';
import { LINE_BG, LINE_IDS, lineOfFestival, lineOfSpot } from '../data/gts/lineSystem';
import LangSwap from '../i18n/LangSwap';

// [V5-5] 추천 날짜 표기 · 20260916 → 09.16(언어 무관 숫자)
const fmtDate = (ymd) => (String(ymd).length === 8 ? `${String(ymd).slice(4, 6)}.${String(ymd).slice(6, 8)}` : ymd);

export default function GtsRoute() {
  const ok = useGtsGuard('route');
  // course = Context 파생(useMemo) · 참조 고정이라 ItineraryMap 재마운트 없음
  //   [V5-5] plan이 있으면 course는 설계 순서다(Context에서 적용) · plan 없으면 담은 순서
  const { course, markRouteVisited, trackStep, plan, setPlan, travelDate } = useGts();
  const navigate = useNavigate();
  // [V5-10] 여행 날짜에 열리는 공사 축제 · setup 을 안 거치면 travelDate 가 없다(심사 경로) → 서버가 KST 오늘로 판정한다
  const [festivals, setFestivals] = useState([]);

  useEffect(() => {
    if (ok) markRouteVisited();
  }, [ok, markRouteVisited]);

  // [V5-5] 동선 설계 1회 · 담기가 바뀌면 Context가 plan을 비우므로 다시 조회한다
  //   실패·fallback이면 order null로 저장 → 담은 순서 유지(재조회 루프 없음)
  const ids = course.map((s) => s.id).join(',');
  useEffect(() => {
    if (!ok || plan || !course.length) return undefined;
    let alive = true;
    planRoute(course.map((s) => s.id)).then((r) => {
      if (alive) setPlan(r.order ? r : { ...r, order: null });
    });
    return () => {
      alive = false;
    };
    // course는 설계 적용 시 순서만 바뀐다 → 의존성은 id 목록(ids)으로 고정
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ok, plan, ids]);

  // [V5-10] 축제는 기간 한정이라 날짜가 바뀌면 다시 받는다 · 실패·fallback이면 빈 배열(섹션 자체가 안 그려진다)
  useEffect(() => {
    if (!ok) return undefined;
    let alive = true;
    getFestivals(travelDate ? travelDate.replaceAll('-', '') : undefined).then((r) => {
      if (alive) setFestivals(Array.isArray(r.items) ? r.items : []);
    });
    return () => {
      alive = false;
    };
  }, [ok, travelDate]);

  // [V5-16] 1층 = 도시 전체 K-콘텐츠 노선(고정 배경) · 풀 전체에서 배지 통과 + 실좌표 스팟만 라인별로 묶는다.
  //   좌표 없는 스팟은 넣지 않는다: mockCoords DEMO 좌표로 그리면 있지도 않은 역을 노선도에 세우는 셈이다(SOURCE_SPOTS §8).
  //   실측 2026-09-13: 배지 15곳 중 실좌표 보유가 kfood 6 · kdrama 1 · kanime 1 → 드라마·애니는 선이 아니라 점으로 그려진다.
  const [pool, setPool] = useState([]);
  useEffect(() => {
    if (!ok) return undefined;
    let alive = true;
    getSpots('en').then((r) => {
      if (alive) setPool(Array.isArray(r.items) ? r.items : []);
    });
    return () => {
      alive = false;
    };
  }, [ok]);

  // 라인별 역 좌표 · 서에서 동으로 정렬해 노선도처럼 읽히게 한다(역이 1곳뿐이면 ItineraryMap 이 점으로 그린다).
  //   참조가 바뀌면 지도가 다시 그려지므로 useMemo 로 고정한다(ItineraryMap network prop 계약).
  const network = useMemo(() => {
    const by = {};
    for (const spot of pool) {
      const line = lineOfSpot(spot);
      if (!line || !spot.coord) continue;
      (by[line] ??= []).push(spot.coord);
    }
    return LINE_IDS.filter((id) => by[id]?.length).map((id) => ({
      lineId: id,
      coords: by[id].sort((a, b) => a[0] - b[0]),
    }));
  }, [pool]);

  if (!ok) return null;

  // [V5-9] 노선 여권 · 역이 속한 K-콘텐츠 라인(배지 통과분만 역이 된다 · 나머지는 연계 로컬)
  const lines = course.map(lineOfSpot);
  const lineCount = lines.reduce((acc, id) => (id ? { ...acc, [id]: (acc[id] ?? 0) + 1 } : acc), {});
  const localCount = lines.filter((id) => id == null).length;

  const m = plan?.metrics;

  const hasMock = course.some((spot) => !spot.coord);

  return (
    <Container>
      <div className="flex flex-col gap-32 pb-64 pt-96">
        <div className="flex flex-col gap-12">
          {/* v4.2 §10.4: 사용자 노출 DRAFT 고지 삭제 · 시각 초안 여부는 코드 주석만 */}
          <LangSwap k="gts.route.title" as="h1" className="text-h1 font-bold tracking-display" />
        </div>

        {/* [V5-5] 순서 근거 · 공사 연관(묶기)·집중률(날짜)·배차 가정(막차) 산출값 · 값 없는 줄은 렌더 안 함 */}
        {m && (
          <section className="flex flex-col gap-8 rounded-xl bg-white p-24 shadow-sm">
            <LangSwap k="gts.route.plan.title" as="h2" className="text-h3 font-semibold" />
            <ul className="flex flex-col gap-4">
              {m.relatedPairs > 0 && (
                <li>
                  <LangSwap
                    k="gts.route.plan.related"
                    vars={{ n: m.relatedPairs }}
                    className="text-small font-medium text-inkSec"
                  />
                </li>
              )}
              {m.timeSavedMin > 0 && (
                <li>
                  <LangSwap
                    k="gts.route.plan.wait"
                    vars={{ n: m.timeSavedMin }}
                    className="text-small font-medium text-inkSec"
                  />
                </li>
              )}
              <li>
                <LangSwap
                  k={m.lastBusOk ? 'gts.route.plan.lastBusOk' : 'gts.route.plan.lastBusWarn'}
                  vars={{ time: m.lastBusAt, n: m.firstFailIdx + 1 }}
                  className="text-small font-semibold text-ink"
                />
              </li>
              {/* [V5-16] 혼잡도("Busy spots: N on your date") 렌더 제거 · 혼잡 축은 go 화면 CrowdCard 만 유지한다는
                  [V5-9] 결정과 어긋나 있었다(조건부라 busyOnDate 가 null 인 날에만 안 보였을 뿐 코드는 살아 있었다).
                  서버 metrics 의 busyOnDate·bestDate 산출과 i18n 키(gts.route.plan.crowd)는 그대로 둔다(go·향후 재사용). */}
            </ul>
            {plan.assumed && (
              <LangSwap k="gts.route.plan.assumed" className="text-caption font-medium text-inkMeta" />
            )}
          </section>
        )}

        <div className="flex flex-col gap-24 lg:grid lg:grid-cols-[380px_1fr] lg:items-start lg:gap-12">
          {/* 지도 · [V3] 목업 포함 상시 렌더(리스트 폴백 폐지 · mockCoords DEMO 좌표) */}
          <div className="flex flex-col gap-8">
            <div className="relative aspect-square overflow-hidden rounded-xl shadow-sm md:aspect-video">
              {/* [V5-9] 번호 핀 = 그 역이 속한 라인 색(없으면 기존 primary)
                  [V5-16] network = 1층 도시 전체 노선(고정 배경) · 경로선은 구간별로 그 역의 라인 색으로 그려진다 */}
              <ItineraryMap venues={course} pinLines={lines} network={network} />
            </div>
            {/* 지도는 하나, 여정은 사람마다 다르다 · 옅은 배경선이 무엇인지 밝힌다 */}
            {network.length > 0 && (
              <LangSwap k="gts.route.networkNote" as="p" className="text-caption font-medium text-inkMeta" />
            )}
          </div>

          {/* 방문 순서 · §10.5 세로 타임라인(§28 문법) — 지도와 병렬 배치(lg 좌측) */}
          <section className="flex flex-col gap-12 rounded-xl bg-white p-24 shadow-sm lg:order-first">
            <LangSwap k="gts.route.listTitle" as="h2" className="text-h3 font-semibold" />
            {/* [V5-9] 노선 여권 1층 · 이 코스가 어느 라인의 역으로 이루어졌는지 · 라인 없는 곳은 연계 로컬로 정직하게 센다 */}
            {(localCount > 0 || LINE_IDS.some((id) => lineCount[id])) && (
              <div className="flex flex-wrap items-center gap-8">
                <LangSwap k="gts.route.lineTitle" className="text-small font-semibold" />
                {LINE_IDS.filter((id) => lineCount[id]).map((id) => (
                  <span
                    key={id}
                    className="inline-flex items-center gap-8 rounded-pill bg-white px-12 py-4 text-caption font-semibold text-ink shadow-sm"
                  >
                    <span aria-hidden="true" className={`h-8 w-8 shrink-0 rounded-pill ${LINE_BG[id]}`} />
                    <LangSwap k={`gts.line.${id}.name`} />
                    <span className="font-display font-bold">{lineCount[id]}</span>
                  </span>
                ))}
                {localCount > 0 && (
                  <span className="inline-flex items-center gap-8 rounded-pill bg-surface px-12 py-4 text-caption font-medium text-inkSec">
                    <LangSwap k="gts.route.lineLocal" />
                    <span className="font-display font-bold">{localCount}</span>
                  </span>
                )}
              </div>
            )}
            {/* [V5-10] 기간 한정 배지 · 여행 날짜에 걸린 공사 축제만(날짜 밖이면 서버가 주지 않아 행 자체가 사라진다) ·
                라인 근거가 있는 축제에만 라인 색 도트 · 상시 역이 아니므로 아래 방문 순서에는 넣지 않는다 */}
            {festivals.length > 0 && (
              <div className="flex flex-wrap items-center gap-8">
                <LangSwap k="gts.route.festivalTitle" className="text-small font-semibold" />
                {festivals.map((f) => {
                  const line = lineOfFestival(f.title);
                  return (
                    <span
                      key={f.contentid}
                      className="inline-flex min-w-0 max-w-full items-center gap-8 rounded-pill bg-white px-12 py-4 text-caption font-semibold text-ink shadow-sm"
                    >
                      {line && <span aria-hidden="true" className={`h-8 w-8 shrink-0 rounded-pill ${LINE_BG[line]}`} />}
                      <span className="min-w-0 truncate">{f.title}</span>
                      <span className="shrink-0 font-display font-bold">
                        {fmtDate(f.eventstartdate)}~{fmtDate(f.eventenddate)}
                      </span>
                    </span>
                  );
                })}
              </div>
            )}
            {hasMock && (
              <LangSwap k="gts.route.mockNotice" as="p" className="text-small font-medium text-inkSec" />
            )}
            <VisitTimeline
              items={course.map((spot, i) => {
                const leg = plan?.legs?.[i]; // 이 장소 → 다음 장소 구간(마지막은 없음)
                return {
                  id: spot.id,
                  lineId: lines[i], // [V5-9] 순번 원을 그 역의 라인 색으로
                  name: spot.name,
                  oneLine: spot.oneLine?.en ? spot.oneLine : null, // 공사 단독 스팟은 한 줄 소개 없음
                  // [V5-3] K배지(SOURCE 근거 anchor·grade만) · [V5-9] 집중률 Chip 노출 제거(혼잡 축은 go 화면만)
                  extra: spot.badge ? <KBadge spot={spot} /> : null,
                  // [V5-5] 다음 장소까지 구간 · 이동·대기(가정 배차) · 막차 이후면 고지 · 좌표 없으면 거리 미계산
                  leg: leg ? (
                    <span className="flex flex-wrap items-center gap-8 text-caption font-medium text-inkSec">
                      {leg.travelMin != null && (
                        <LangSwap k="gts.route.plan.legRide" vars={{ n: leg.travelMin }} />
                      )}
                      {leg.waitMin > 0 && <LangSwap k="gts.route.plan.legWait" vars={{ n: leg.waitMin }} />}
                      {leg.unknown && <LangSwap k="gts.route.plan.unknown" />}
                      {leg.afterLastBus && (
                        <LangSwap
                          k="gts.route.plan.legLate"
                          className="rounded-pill bg-white px-8 font-semibold text-ink shadow-sm"
                        />
                      )}
                    </span>
                  ) : null,
                };
              })}
            />
            <div className="flex flex-wrap items-center gap-12 pt-8">
              <Button
                onClick={() => {
                  // [V1] 방문 순서 확정 계측 · [V5-3] 확정 = 출발(go) 진입
                  trackStep('route_confirm', {
                    order: course.map((s) => ({ id: s.id, kind: s.kind, name: s.name.en })),
                  });
                  navigate('/gts/go');
                }}
              >
                <LangSwap k="gts.route.go" />
              </Button>
              <Button variant="secondary" onClick={() => navigate('/gts/build')}>
                <LangSwap k="gts.route.repick" />
              </Button>
            </div>
            {/* [V5-3] 텍스트링크 · 차량 예약·결제(setup → checkout · 심사 경로 밖 · BM 근거) */}
            <Link
              to="/gts/setup"
              className="inline-flex min-h-44 w-fit items-center text-small font-semibold text-primary underline underline-offset-4 transition-colors duration-fast hover:text-ink"
            >
              <LangSwap k="gts.route.vehicle" />
            </Link>
          </section>
        </div>
      </div>
      {/* [V5-9] K-가이드 FAB 제거(챗봇을 헤드라인에서 내린다) · 챗 기능·컴포넌트는 보존 */}
    </Container>
  );
}
