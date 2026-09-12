// GTS 코스 담기 · IA §11.5 + PATTERNS §41 ([V5-3] K-Route 개정: 식사 플랜 3택·meal/foodspace/activity 3풀·반반 분할 폐지).
// StepStage 단일 스텝: 추천 결과 단일 풀(서버 추천 순서 그대로) → 정원(q4 반나절 3 · 하루 4)만큼 담기.
//   순서 = 고른 순서(CourseQueue) · 남은 후보는 마지막 픽 좌표 기준 가까운 순 재정렬([V9] queueMode 유지).
//   정원 초과 = 자동 해제 없음 + 3초 토스트([V22]) · 다음 → route.
// 페이지네이션([H2-11] 숫자 인디케이터)은 VenueGrid 소유.
// 가드(§31 · IA §11.1): 추천 결과 필수 · 미충족 시 quiz로 replace.
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StepStage from '../components/gts/StepStage';
import TriText from '../components/gts/TriText';
import VenueDetail from '../components/gts/VenueDetail';
import VenueGrid from '../components/gts/VenueGrid';
import CourseQueue from '../components/gts/CourseQueue';
import GuideFab from '../components/gts/GuideFab';
import Container from '../components/layout/Container';
import { useGts, useGtsGuard } from '../context/GtsContext';
import { venueCoord } from '../data/gts/mockCoords';
import { courseKm, courseMinutes } from '../data/gts/distance';
import { getSpread } from '../data/gts/ktoApi';
import LangSwap from '../i18n/LangSwap';
import { motion } from '../tokens';

// 선택 카운터 · 상시 노출(§9.4 인식>회상 · §10.4 상단 상시)
function Counter({ n, max }) {
  return (
    <div className="flex items-baseline gap-8">
      <span className="font-display text-h3 font-bold">
        {n} / {max}
      </span>
      <LangSwap k="gts.build.counterLabel" className="text-small font-medium text-inkSec" />
    </div>
  );
}

export default function GtsBuild() {
  const ok = useGtsGuard('build');
  const navigate = useNavigate();
  const { recommended, picks, cap, course, selectSpot, trackStep, addSpots } = useGts();
  const [capNotice, setCapNotice] = useState(false);
  // [V2] 장소 상세 오버레이 · { spot, rect(FLIP 시작점), instant(키보드 개시) }
  const [detail, setDetail] = useState(null);
  const [spread, setSpread] = useState(null); // [V5-5] 내륙 확산 { of, base, viaNearby, items }
  const toastRef = useRef(0); // [V22] 초과 안내 토스트 3초 자동 해제 타이머
  const spreadCache = useRef(new Map()); // 스팟당 1회 조회

  useEffect(() => () => clearTimeout(toastRef.current), []);

  // [V5-5] 내륙 확산 · 마지막으로 담은 장소에서 이어 가는 공사 연관 관광지를 후보 풀 앞에 더한다.
  //   남이섬처럼 춘천 안 연관이 0건이면 서버가 가까운 기준 관광지를 경유한다(viaNearby) · 결과 없으면 섹션 비노출.
  const lastPick = picks[picks.length - 1];
  useEffect(() => {
    if (!lastPick) {
      setSpread(null);
      return undefined;
    }
    let alive = true;
    const p = spreadCache.current.get(lastPick) ?? getSpread(lastPick);
    spreadCache.current.set(lastPick, p);
    p.then((r) => {
      if (!alive) return;
      if (r.items?.length) {
        addSpots(r.items);
        setSpread(r);
      } else setSpread(null);
    });
    return () => {
      alive = false;
    };
  }, [lastPick, addSpots]);

  // [V5-6] K-가이드 출처 칩(route·go 에서도 온다) → 이 화면 장소 상세 · 키보드 개시와 같은 instant 로 열고 state 는 비운다(뒤로가기 재오픈 방지)
  //   VenueDetail 은 FLIP 원점 rect 가 필요하다 → 도킹 카드 크기의 화면 중앙 rect(scale 1)
  const location = useLocation();
  useEffect(() => {
    const spot = location.state?.spot;
    if (!spot) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    setDetail({ spot, rect: new DOMRect(vw * 0.33, vh * 0.1, vw * 0.34, vh * 0.8), instant: true });
    navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate]);

  if (!ok) return null;

  const day = cap === 4; // [V5-3] q4 하루(4곳) · 아니면 반나절(3곳)
  const done = picks.length === cap;

  // [V9] 코스(고른 순서 스팟) 파생 · 마지막 좌표 = 남은 후보 재정렬 기준, 좌표열 = 큐 합계 거리·시간 배지.
  //   큐가 비면 sortCoord null(추천 순서 복귀).
  const queueCoords = course.map(venueCoord);
  const sortCoord = queueCoords.length ? queueCoords[queueCoords.length - 1] : null;
  const courseKmVal = courseKm(queueCoords);
  const courseMin = courseMinutes(courseKmVal);

  // 정원 초과 시 자동 해제 금지 · [V22] 안내 = 3초 오버레이 토스트(레이아웃 불변) · 재초과 시 재표시
  const showCapToast = () => {
    setCapNotice(true);
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setCapNotice(false), 3000);
  };
  const onToggle = (id) => {
    if (!selectSpot(id)) showCapToast();
  };

  const onNext = () => {
    setCapNotice(false);
    trackStep('picks', { selections: course.map((s) => ({ id: s.id, kind: s.kind, name: s.name.en })) }); // [V1]
    navigate('/gts/route');
  };

  return (
    <>
      {/* 오버레이 아래 바닥 페이지(넓은 컨테이너 · §10.4 확폭) — 실콘텐츠는 StepStage 소유 */}
      <Container>
        <div className="flex flex-col gap-32 pb-64 pt-96">
          <LangSwap k="gts.build.title" as="h1" className="text-h1 font-bold tracking-display" />
        </div>
      </Container>

      {/* 단일 스텝 · 뒤로(첫 스텝) = 나가기 확인 → 취향 찾기 복귀 */}
      <StepStage
        stepIndex={0}
        stepCount={1}
        titleKey="gts.build.step.picks"
        stepKey="picks"
        onNext={onNext}
        nextDisabled={!done}
        reasonKey={done ? null : day ? 'gts.build.reason.day' : 'gts.build.reason.half'}
        onExit={() => navigate('/gts/quiz')}
        toast={
          capNotice ? (
            // [V22] 절제된 경고: 다크 pill + 앰버 도트(붉은 경고 지양) · 3초 후 자동 해제(레이아웃 불변)
            <div
              role="status"
              className="flex items-center gap-8 rounded-pill bg-ink px-16 py-8 text-small font-semibold text-white shadow-lg"
              style={{ animation: `bh-toast-in 220ms ${motion.easeOut}` }}
            >
              <span aria-hidden="true" className="h-8 w-8 shrink-0 rounded-pill bg-yellow" />
              <LangSwap k="gts.build.capFull" />
            </div>
          ) : null
        }
      >
        <section className="flex flex-col gap-8">
          <div className="flex flex-wrap items-baseline justify-between gap-12">
            <LangSwap
              k={day ? 'gts.build.picksDay' : 'gts.build.picksHalf'}
              as="h2"
              className="text-h3 font-semibold"
            />
            <Counter n={picks.length} max={cap} />
          </div>
          {/* [V5-5] 확산 고지 · 어떤 장소 기준인지와 근거(직접 연관 / 인접 기준지 경유)를 밝힌다 */}
          {spread && (
            <div className="flex flex-col gap-4 rounded-lg bg-surface p-12">
              <span className="flex flex-wrap items-baseline gap-8">
                <LangSwap k="gts.build.spread.title" className="text-small font-semibold" />
                <TriText text={spread.of.name} className="text-small font-semibold text-primary" />
              </span>
              <span className="flex flex-wrap items-baseline gap-8">
                <LangSwap
                  k={spread.viaNearby ? 'gts.build.spread.basisNearby' : 'gts.build.spread.basis'}
                  className="text-caption font-medium text-inkSec"
                />
                <TriText text={spread.base.name} className="text-caption font-semibold text-inkSec" />
              </span>
            </div>
          )}
          <VenueGrid
            pool={recommended}
            selected={picks}
            max={cap}
            onToggle={onToggle}
            onDetail={(spot, rect, instant) => setDetail({ spot, rect, instant })}
            queueMode
            sortCoord={sortCoord}
          />
          {/* [V9] 선택 큐 · 순서 유지 + X 제거 + 거리·시간 배지 */}
          <CourseQueue items={course} onRemove={selectSpot} km={courseKmVal} minutes={courseMin} />
        </section>
      </StepStage>

      {/* [V5-6] K-가이드 FAB · StepStage 다음에 붙어 그 위에 온다 · 하단 버튼 줄 위로 */}
      <GuideFab lift />

      {/* [V2] 장소 상세 확장 카드 · StepStage 형제(포털은 body — 늦은 마운트라 StepStage 위) */}
      {detail && (
        <VenueDetail
          venue={detail.spot}
          originRect={detail.rect}
          instant={detail.instant}
          isSelected={picks.includes(detail.spot.id)}
          onToggle={() => selectSpot(detail.spot.id)}
          onClose={() => setDetail(null)}
        />
      )}
    </>
  );
}
