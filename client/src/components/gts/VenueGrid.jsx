// VenueGrid · PATTERNS §30 → v4.2 §10.4 개정 (존 C5 — §30 로테이션 조항은 v4.2가 대체).
// "새로고침(RefreshCw · See other places)" 전면 폐지 → 페이지네이션(경계 비활성 · 순환 아님) · 전 카드 그리드 공통 문법.
// props { pool, pageSize, selected[], max, onToggle, onDetail, queueMode, sortCoord } · 열 = 모바일 2 / md 3 / lg 4(§18.2).
// [V9] queueMode(true): 선택된 장소는 그리드에서 사라지고(큐로 이동), 남은 후보를 sortCoord(큐 마지막 좌표)
//   기준 가까운 순으로 재정렬 · 순서 변경은 FLIP 리플로우 애니메이션 · 선택 시 카드가 큐로 내려가는 마이크로인터랙션.
//   queueMode false는 선택 카드 = 링+순번 배지로 그리드 잔류.
// [V5-3] 카드 = 스팟(kind 'kto'|'venue' · IA §11.5): 이미지 = spotImages 후보 순서(공사 대표이미지 → 합류 venue webp ·
//   onError면 다음 후보 · 소진/없음 = 라이트 폴백) + 제목 + 추천 사유 1줄 + 배지 행(K배지 · 집중률 Chip · 카테고리 칩 ·
//   좁으면 줄바꿈 · 배지·칩이 앞). 카드 높이는 내용 기준(min-h) · 같은 행은 h-full로 높이 정렬.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ZoomIn } from 'lucide-react';
import LangSwap from '../../i18n/LangSwap';
import { useLang } from '../../i18n/LangContext';
import Pagination from '../ui/Pagination';
import KBadge from './KBadge';
import TriText from './TriText';
import { venueCoord } from '../../data/gts/mockCoords';
import { haversineKm } from '../../data/gts/distance';
import { spotImages } from '../../data/gts/spots';
import { motion } from '../../tokens';

const COLS = 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';

const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function VenueGrid({
  pool,
  pageSize = 8,
  selected,
  max,
  onToggle,
  onDetail,
  queueMode = false,
  sortCoord = null,
}) {
  const { t } = useLang();
  const [page, setPage] = useState(0);
  const [leavingId, setLeavingId] = useState(null); // [V9] 큐로 내려가는 중인 카드
  // [V5-3] 카드별 이미지 후보 인덱스(spotImages 순서) · onError 시 다음 후보 · 소진이면 라이트 폴백(§9.4 빈 박스 금지)
  const [imgIdx, setImgIdx] = useState({});
  // 같은 후보의 중복 onError에도 한 칸만 전진
  const nextImg = (id, at) => setImgIdx((m) => ((m[id] ?? 0) === at ? { ...m, [id]: at + 1 } : m));
  const timerRef = useRef(0);
  const cardRefs = useRef(new Map()); // [V9] FLIP 위치 측정용
  const prevPos = useRef(new Map());
  const gridRef = useRef(null);
  const refocusAt = useRef(null); // [V5-3] 포커스 이관 자리(null = 첫 렌더 · 이관 안 함)
  const prevSelected = useRef(selected); // [P3-A] 직전 선택(큐 X로 빠진 id 판별)
  const backId = useRef(null); // [P3-A] 포커스를 돌려줄 카드 id(다른 페이지면 페이지 전환 뒤 포커스)

  // [V9] 큐 모드: 선택된 장소 제거 + sortCoord 기준 거리순 재정렬(비면 기본 순서)
  const shown = useMemo(() => {
    if (!queueMode) return pool;
    const rest = pool.filter((v) => !selected.includes(v.id));
    if (!sortCoord) return rest;
    return [...rest].sort(
      (a, b) => haversineKm(venueCoord(a), sortCoord) - haversineKm(venueCoord(b), sortCoord),
    );
  }, [pool, selected, queueMode, sortCoord]);

  // [V5-3] 포커스 유실 방지 · 큐로 간 카드(또는 큐 X)가 사라지면 포커스가 body로 떨어져 모달 밖으로 샌다
  //   → 담은 카드 자리 카드로 이관 · [P3-A] 큐 X 제거면 그리드로 돌아온 그 카드(다른 페이지면 그 페이지로 넘긴 뒤).
  //   거절(정원 초과)은 카드가 남아 포커스 그대로.
  useEffect(() => {
    const at = refocusAt.current;
    refocusAt.current = 0;
    const back = prevSelected.current.find((id) => !selected.includes(id));
    prevSelected.current = selected;
    if (at == null || document.activeElement !== document.body) return;
    const i = back ? shown.findIndex((v) => v.id === back) : -1;
    if (i !== -1) {
      backId.current = back;
      setPage(Math.floor(i / pageSize));
      return;
    }
    const cards = gridRef.current.querySelectorAll('button[aria-pressed]');
    cards[Math.min(at, cards.length - 1)]?.focus();
  }, [shown]);

  // [P3-A] 돌아온 카드가 렌더된 커밋에서 포커스(같은 페이지면 이번 커밋 · 아니면 페이지 전환 커밋)
  useEffect(() => {
    const el = backId.current && gridRef.current.querySelector(`[data-spot="${CSS.escape(backId.current)}"]`);
    if (!el) return;
    backId.current = null;
    el.focus();
  }, [shown, page]);

  const pages = Math.max(1, Math.ceil(shown.length / pageSize));

  // 풀 교체 시 첫 페이지로 · 선택 상태는 Context가 보존
  useEffect(() => {
    setPage(0);
  }, [pool]);
  // [V9] 선택 제거로 페이지가 범위를 넘으면 클램프
  useEffect(() => {
    if (page >= pages) setPage(pages - 1);
  }, [page, pages]);
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const visible = shown.slice(page * pageSize, page * pageSize + pageSize);

  // [V9] FLIP 리플로우 · shown(순서/구성) 변경 시 이전 위치→현재 위치로 부드럽게 이동
  useLayoutEffect(() => {
    if (!queueMode || prefersReduced()) return;
    cardRefs.current.forEach((el, id) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const prev = prevPos.current.get(id);
      if (prev && (prev.left !== rect.left || prev.top !== rect.top)) {
        el.animate(
          [
            { transform: `translate(${prev.left - rect.left}px, ${prev.top - rect.top}px)` },
            { transform: 'translate(0px, 0px)' },
          ],
          { duration: 420, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }, // [V13] 재정렬 420ms(오류처럼 안 보이게)
        );
      }
      prevPos.current.set(id, { left: rect.left, top: rect.top });
    });
  });

  // [V9] 큐 모드 선택: 수용될 때만(정원 미만) 카드가 큐로 내려가는 연출 후 토글 · 초과면 즉시 토글(안내)
  const onCardClick = (id) => {
    refocusAt.current = visible.findIndex((v) => v.id === id);
    if (queueMode && selected.length < max && !prefersReduced()) {
      setLeavingId(id);
      clearTimeout(timerRef.current);
      // [V13] 420ms — 카드가 축소되며 큐(아래)로 내려가는 경로가 눈에 보이게(사라짐이 아니라 이동)
      timerRef.current = setTimeout(() => {
        onToggle(id);
        setLeavingId(null);
      }, 420);
    } else {
      onToggle(id);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div ref={gridRef} className={`grid gap-8 ${COLS}`}>
        {visible.map((venue) => {
          const orderIdx = selected.indexOf(venue.id);
          const isSelected = orderIdx !== -1;
          const leaving = leavingId === venue.id;
          // [V5-3] 이미지 = 후보 체인의 현재 후보 · 있으면 사진+그라데이션+흰 텍스트, 없으면 라이트 폴백
          const imgAt = imgIdx[venue.id] ?? 0;
          const src = spotImages(venue)[imgAt];
          const hasImage = !!src;
          return (
            <div
              key={venue.id}
              ref={queueMode ? (el) => cardRefs.current.set(venue.id, el) : undefined}
              className="relative"
            >
              <button
                type="button"
                onClick={() => onCardClick(venue.id)}
                aria-pressed={isSelected}
                data-spot={venue.id}
                className={`pressable relative flex h-full min-h-[124px] w-full flex-col items-start gap-4 overflow-hidden rounded-lg p-12 text-left shadow-sm ${
                  hasImage ? 'bg-ink' : venue.mock ? 'bg-surface' : 'bg-white'
                } ${isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
                // [V13] 큐로 내려가는 마이크로인터랙션 420ms · 축소하며 아래(큐)로 이동하는 경로가 보이게
                //   (opacity는 약간 늦게 페이드 → 이동 중에도 카드가 보임 = "사라짐 아닌 이동" 인지)
                style={
                  leaving
                    ? {
                        transform: 'scale(0.6) translateY(72px)',
                        opacity: 0,
                        transformOrigin: 'center bottom',
                        transition: `transform 420ms ${motion.easeOut}, opacity 360ms ${motion.easeOut} 60ms`,
                      }
                    : undefined
                }
              >
                {/* [V20] 앞면 배경 사진 + 오버레이 · [V5-3] 흰 글자(제목·추천 사유)가 위쪽이라 위가 가장 어둡게(75 → 60 → 40):
                    흰 사진 최악 기준에서도 흰 글자 4.5:1(ink 57% 이상) · 아래 배지·칩은 자체 흰 면이라 옅어도 된다 */}
                {hasImage && (
                  <>
                    <img
                      src={src}
                      alt={venue.name.en}
                      loading="lazy"
                      onError={() => nextImg(venue.id, imgAt)}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-b from-ink/75 via-ink/60 to-ink/40"
                    />
                  </>
                )}
                {/* [V22] 선택 배지 = 우상단(queueMode false 전용 · 큐 모드는 선택 카드가 큐로 이동) */}
                {isSelected && (
                  <span className="absolute right-8 top-8 z-[1] inline-flex items-center rounded-pill bg-primary px-8 py-2 text-caption font-semibold text-white">
                    {orderIdx + 1}
                  </span>
                )}
                {/* [V22] 제목 말줄임 2줄 · 우패딩으로 선택 배지와 분리 */}
                <TriText
                  text={venue.name}
                  className={`relative z-[1] break-words pr-12 text-body font-bold ${hasImage ? 'text-white' : ''}`}
                  clampClass="line-clamp-2"
                />
                {/* [V5-3] 추천 사유 1줄 · LLM 문장(제출 언어) 우선 → 없으면 사전 폴백(quiz.reason.* · 겹침 렌더 각 언어 1줄) */}
                {venue.reason ? (
                  <span
                    className={`relative z-[1] line-clamp-1 text-caption font-medium ${hasImage ? 'text-white' : 'text-inkSec'}`}
                  >
                    {venue.reason}
                  </span>
                ) : (
                  venue.reasonKey && (
                    <LangSwap
                      k={venue.reasonKey}
                      className={`relative z-[1] text-caption font-medium [&>span]:line-clamp-1 ${hasImage ? 'text-white' : 'text-inkSec'}`}
                    />
                  )
                )}
                {/* [V5-3] 배지 행 = 좌하단 · K배지 → 집중률 Chip → 카테고리 칩 순(좁으면 줄바꿈 · 배지·칩 우선).
                    끝 스페이서 = 돋보기(우하단 absolute) 자리 예약: 마지막 줄 칩과 겹치지 않고, 자리가 없으면 다음 줄로 */}
                <span className="relative z-[1] mt-auto flex w-full flex-wrap items-center gap-4">
                  {/* [V5-9] 집중률 Chip 노출 제거(혼잡 축은 go 화면 CrowdCard 만 유지) · 컴포넌트는 보존 */}
                  <KBadge spot={venue} />
                  {/* [V5-9] 320px 2열에서 긴 라벨("Food space")이 카드 밖으로 3px 넘쳤다(실측) ·
                      KBadge 와 같은 처리로 좁으면 말줄임한다(shrink-0 + 말줄임 없음이 원인이었다) */}
                  <span
                    className={`inline-flex min-w-0 max-w-full items-center rounded-pill px-8 py-2 text-caption font-medium ${
                      hasImage
                        ? 'bg-white/25 text-white'
                        : venue.mock
                          ? 'bg-white text-inkSec'
                          : 'bg-surface text-inkSec'
                    }`}
                  >
                    <LangSwap
                      k={venue.mock ? 'gts.build.comingSoon' : `gts.build.cat.${venue.category}`}
                      className="min-w-0 grid-cols-1 [&>span]:truncate"
                    />
                  </span>
                  {onDetail && <span aria-hidden="true" className="h-32 w-32 shrink-0" />}
                </span>
              </button>
              {onDetail && (
                <button
                  type="button"
                  aria-label={t('venues.detail.view')}
                  title={t('venues.detail.view')}
                  onClick={(e) =>
                    onDetail(venue, e.currentTarget.parentElement.getBoundingClientRect(), e.detail === 0)
                  }
                  /* [V22] 우하단(칩과 좌우 분리) · bg-primary라 이미지/폴백 양쪽 대비 확보
                     · [V5-3] 히트 영역 44(§18.3 터치 타깃) · 시각 원 36은 기존 자리(우하단 8) 유지
                     · z-[1] = 전폭 배지 행(z-[1])보다 뒤 형제라 위에 그려져 클릭을 받는다 */
                  className="pressable absolute bottom-4 right-4 z-[1] inline-flex h-44 w-44 items-center justify-center rounded-pill"
                >
                  <span
                    className="inline-flex items-center justify-center rounded-pill bg-primary text-white shadow-sm"
                    style={{ width: 36, height: 36 }}
                  >
                    <ZoomIn size={20} aria-hidden="true" />
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      <Pagination page={page} pages={pages} onSelect={setPage} />
    </div>
  );
}
