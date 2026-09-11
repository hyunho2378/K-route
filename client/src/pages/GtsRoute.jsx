// GTS·K-Route 동선 결과 · IA §9.5 + §10.5 + §11.6 + PATTERNS §32 (존 C5 개정 → [V5-3] 최소 수정).
// §10.5: Visit order 번호 리스트 → §28 RouteTimeline 문법의 세로 타임라인(VisitTimeline ·
//   노드 = 순번 원 28px primary + white 숫자 · 우측 장소명) · 지도와 병렬 배치.
// [V5-3] 순서 = 코스(GtsContext course · 고른 순서 · kind 'kto'|'venue' 스팟) · 타임라인에 K배지·집중률 Chip ·
//   CTA 3종(IA §11.6): 주 "첫 장소로 출발"(→ go) / 보조 "다시 고르기"(→ build) / 텍스트링크 "차량으로 이동"(→ setup · 기존 결제 플로우) ·
//   K-가이드 봇 FAB 자리(챗은 P3 · 비활성).
// [V3] §32 리스트 폴백 폐지 · 어떤 조합에서도 지도 라인 상시 렌더(mockCoords 결정적 DEMO 좌표 · 좌표 없는 장소 포함 시 mockNotice 고지).
// 가드(§31 · [V5-3]): 추천 결과 + 정원(q4)만큼 담음 · 미충족 시 build(또는 quiz)로 replace. 통과 시 route 경유 마킹.
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CongestionChip from '../components/gts/CongestionChip';
import GuideFab from '../components/gts/GuideFab';
import ItineraryMap from '../components/gts/ItineraryMap';
import KBadge from '../components/gts/KBadge';
import VisitTimeline from '../components/gts/VisitTimeline';
import Container from '../components/layout/Container';
import Button from '../components/ui/Button';
import { useGts, useGtsGuard } from '../context/GtsContext';
import LangSwap from '../i18n/LangSwap';

export default function GtsRoute() {
  const ok = useGtsGuard('route');
  // course = Context 파생(useMemo) · 참조 고정이라 ItineraryMap 재마운트 없음
  const { course, markRouteVisited, trackStep } = useGts();
  const navigate = useNavigate();

  useEffect(() => {
    if (ok) markRouteVisited();
  }, [ok, markRouteVisited]);

  if (!ok) return null;

  const hasMock = course.some((spot) => !spot.coord);

  return (
    <Container>
      <div className="flex flex-col gap-32 pb-64 pt-96">
        <div className="flex flex-col gap-12">
          {/* v4.2 §10.4: 사용자 노출 DRAFT 고지 삭제 · 시각 초안 여부는 코드 주석만 */}
          <LangSwap k="gts.route.title" as="h1" className="text-h1 font-bold tracking-display" />
        </div>

        <div className="flex flex-col gap-24 lg:grid lg:grid-cols-[380px_1fr] lg:items-start lg:gap-12">
          {/* 지도 · [V3] 목업 포함 상시 렌더(리스트 폴백 폐지 · mockCoords DEMO 좌표) */}
          <div className="relative aspect-square overflow-hidden rounded-xl shadow-sm md:aspect-video">
            <ItineraryMap venues={course} />
          </div>

          {/* 방문 순서 · §10.5 세로 타임라인(§28 문법) — 지도와 병렬 배치(lg 좌측) */}
          <section className="flex flex-col gap-12 rounded-xl bg-white p-24 shadow-sm lg:order-first">
            <LangSwap k="gts.route.listTitle" as="h2" className="text-h3 font-semibold" />
            {hasMock && (
              <LangSwap k="gts.route.mockNotice" as="p" className="text-small font-medium text-inkSec" />
            )}
            <VisitTimeline
              items={course.map((spot) => ({
                id: spot.id,
                name: spot.name,
                oneLine: spot.oneLine?.en ? spot.oneLine : null, // 공사 단독 스팟은 한 줄 소개 없음
                // [V5-3] K배지(SOURCE 근거 anchor·grade만) + 집중률 Chip(오늘 3구간)
                extra:
                  spot.badge || spot.congestionBand ? (
                    <span className="flex flex-wrap items-center gap-4">
                      <KBadge spot={spot} />
                      <CongestionChip band={spot.congestionBand} />
                    </span>
                  ) : null,
              }))}
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
      <GuideFab />
    </Container>
  );
}
