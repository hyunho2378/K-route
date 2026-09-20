// SubwayNetworkMap.jsx · 신규 독립 컴포넌트. 실제 서울 지하철 노선도(2023 옥토리니어 리디자인) 스타일로
// K-콘텐츠 3라인(drama/food/anime)을 그리는 순수 SVG 프레젠테이션 컴포넌트.
//
// 범위(작업 지시 준수):
//   · 이 파일은 신규 추가만 한다. ItineraryMap.jsx·GtsRoute.jsx·lineSystem.js·tokens.js는 읽기만 했고
//     한 글자도 고치지 않았다. 기존 지도(ItineraryMap = maplibre 지리 좌표 기반)와는 별개의,
//     "노선도" 목적의 추상 그리드 다이어그램이다(실좌표 아님 · 실제 앱 배선은 범위 밖).
//   · 데이터는 전부 props로 받는다. 컴포넌트 파일 안에 SAMPLE_LINES/SAMPLE_STATIONS/SAMPLE_NETWORK를
//     자체 목업으로 두고 기본값으로 사용해 `<SubwayNetworkMap />`만으로도 독립 렌더된다.
//
// 브랜드 명칭: 작업 지시상 구 명칭 "케이로드/K-Route"는 폐기되고 "Cheongchun Line"으로 브랜드 변경된
//   상태라 안내받았다. 이 컴포넌트의 기본 타이틀 문자열에 그 이름을 쓴다. 단 데이터 구조(id·kType 등)는
//   IA §11·COMPONENTS v5-9의 실제 라인 3종 체계(drama·food·anime)를 그대로 따른다(신규 라인 발명 없음).
//
// 데이터 호환성: lineSystem.js의 LINES 는 { id, colorToken, crew, kType } 구조다. 아래 SAMPLE_LINES도
//   같은 4개 키를 그대로 갖는다(+ 이 컴포넌트가 실제로 쓰는 name/stationIds 만 추가). 나중에 실 데이터를
//   연결할 때 lineSystem.LINES를 그대로 매핑해 넣을 수 있게 하기 위함이다(연결 자체는 이번 범위 밖).
//
// 옥토리니어 로직: client/src/components/gts/octolinear.js(같은 폴더 · 신규)가 좌표 계산만 하는 순수 함수를 담는다.
//   역 좌표가 8방향(수평·수직·45도)에서 벗어나 있어도 자동으로 꺾임점(elbow)을 끼워 노선도 규칙을 지킨다.
//
// 색상: tokens.js 3라인 색(lineColors)과 동일한 tokens.colors 항목이 이미 Tailwind 테마에 등록돼 있어
//   (drama→primary, food→spice, anime→yellow) fill-primary/stroke-spice 같은 토큰 파생 유틸리티 클래스로만
//   칠한다. 이 파일에 HEX 리터럴은 0건이다(lineSystem.js의 LINE_BG/LINE_STROKE 정적 매핑 선례를 그대로 따름).
//   Tailwind는 동적 템플릿 클래스명을 스캔하지 못하므로 반드시 완성된 문자열 리터럴로 매핑한다.
// 간격: 역 간 그리드 단위·마커 반지름·스트로크 두께는 tokens.spacing 배열 인덱스에서만 가져온다(직접 숫자 나열 금지).
// 모션: 진입 시 라인 draw-on(stroke-dashoffset) + 역 페이드 인. tokens.motion(easeOut/fast)만 참조하고,
//   prefers-reduced-motion을 JS matchMedia + CSS 미디어쿼리 이중으로 모두 존중한다(즉시 완성 상태).
// 금지 항목 자체 준수: TypeScript 문법 없음 · 브라우저 저장소 미사용 · 이모지 없음 · hover 확대 트랜스폼 미사용
//   (호버·포커스 피드백은 반지름(r) 속성 보간으로만 표현. LoopMap 마커의 "사이즈 스텝" 선례와 동일 원칙).
import { useEffect, useMemo, useRef, useState } from 'react';
import { spacing, motion } from '../../tokens';
import { boundingBox, buildOctolinearRoute } from './octolinear';

// ------------------------------------------------------------------
// 자체 목업 데이터 (실 데이터 연결은 범위 밖 · props로 교체 가능)
// 좌표(x, y)는 지리 좌표가 아니라 "그리드 단위"의 추상 논리 좌표다. 실제 정류장 위치를 지어내지 않기 위해
// 노선도 다이어그램 전용 값임을 명확히 한다(SOURCE_SPOTS §8: 근거 없는 위치 단정 금지 원칙과 같은 취지).
// 역 이름은 DESIGN.md §3(라인 코스 원문) + IA.md §11(검증된 K-콘텐츠 앵커: 남이섬·애니메이션박물관)에서
// 이미 확정된 표현을 그대로 재사용했다. 신규 성지 주장 0건.
// ------------------------------------------------------------------

// 라인 3종 · lineSystem.js LINES와 동일한 4키(id, colorToken, crew, kType) 유지 + name/stationIds 추가.
//
// [V5-25] 역 구성을 SOURCE_SPOTS.md 검증 앵커 수와 그대로 맞춘다(인위적 균형 금지). K푸드는
// grade=강함/중간 anchor가 13곳으로 실질 주력 라인이라 7곳을 대표로 보여주고, 드라마·애니는 각각
// 단 1곳(남이섬=128019 겨울연가 grade 중간, 애니메이션박물관 grade 강함)뿐이라 그대로 1역으로
// 놓는다(점 하나로만 렌더된다 · COMPONENTS.md v5-16 "역이 1곳뿐인 라인 = dot" 선례와 같은 원칙).
// 이 불균형을 감추지 않고 그대로 보여주는 것이 설계 의도다(근거 없는 성지 주장 금지 원칙).
// 드라마·애니는 가상 환승점을 지어내지 않으므로 푸드 라인과 서로 교차하지 않는다(환승역 0곳).
export const SAMPLE_LINES = [
  {
    id: 'drama',
    colorToken: 'lake', // tokens.lineColors.lake = tokens.colors.primary
    crew: 'lake',
    kType: 'kdrama',
    name: { en: 'Drama Line', ko: '드라마 라인' },
    stationIds: ['nami-island'],
  },
  {
    id: 'food',
    colorToken: 'dakgalbi', // tokens.lineColors.dakgalbi = tokens.colors.spice
    crew: 'dakgalbi',
    kType: 'kfood',
    name: { en: 'Food Line', ko: '푸드 라인' },
    stationIds: [
      'tongnamujip',
      'hakgok-makguksu',
      'wonjo-charcoal-dak',
      'chuncheon-makguksu-museum',
      'umi-dakgalbi',
      'saembat-makguksu',
      'sandak',
    ],
  },
  {
    id: 'anime',
    colorToken: 'potato', // tokens.lineColors.potato = tokens.colors.yellow
    crew: 'potato',
    kType: 'kanime',
    name: { en: 'Anime Line', ko: '애니 라인' },
    stationIds: ['animation-museum'],
  },
];

// 역 목록 · x/y는 그리드 단위(정수), labelSide는 라벨을 마커 어느 방향에 둘지(n/s/e/w).
// 이름은 SOURCE_SPOTS.md 검증 표의 venue id·venues.js 표시명을 그대로 따른다(신규 성지 0건).
// 좌표는 실좌표가 아니라 노선도용 개략 좌표다(실제 지리적 위치를 단정하지 않는다).
export const SAMPLE_STATIONS = [
  { id: 'nami-island', name: { en: 'Nami Island', ko: '남이섬' }, x: 1, y: 7, labelSide: 's' },
  { id: 'tongnamujip', name: { en: 'Tongnamujip Dakgalbi', ko: '통나무집 닭갈비' }, x: 0, y: 0, labelSide: 'n' },
  { id: 'hakgok-makguksu', name: { en: 'Hakgok Makguksu & Dakgalbi', ko: '학곡막국수닭갈비' }, x: 2, y: 0, labelSide: 'n' },
  { id: 'wonjo-charcoal-dak', name: { en: 'Wonjo Charcoal Dak Bulgogi', ko: '원조숯불닭불고기' }, x: 4, y: 0, labelSide: 'n' },
  { id: 'chuncheon-makguksu-museum', name: { en: 'Chuncheon Makguksu Museum', ko: '춘천막국수체험박물관' }, x: 6, y: 2, labelSide: 'e' },
  { id: 'umi-dakgalbi', name: { en: 'Umi Dakgalbi', ko: '우미 닭갈비' }, x: 8, y: 2, labelSide: 'n' },
  { id: 'saembat-makguksu', name: { en: 'Saembat Makguksu', ko: '샘밭막국수' }, x: 10, y: 2, labelSide: 'n' },
  { id: 'sandak', name: { en: 'Sandak', ko: '산닭' }, x: 12, y: 0, labelSide: 'n' },
  { id: 'animation-museum', name: { en: 'Animation Museum', ko: '애니메이션박물관' }, x: 11, y: 7, labelSide: 's' },
];

export const SAMPLE_NETWORK = { lines: SAMPLE_LINES, stations: SAMPLE_STATIONS };

// ------------------------------------------------------------------
// 라인 id → Tailwind 유틸리티 클래스 정적 매핑(lineSystem.js LINE_BG/LINE_RING 선례와 동일 문법).
// Tailwind는 `fill-${x}` 같은 동적 템플릿 클래스명을 스캔하지 못하므로 완성된 리터럴만 둔다.
// 이 3개 클래스는 이미 tailwind.config.js가 tokens.colors를 그대로 이론상 생성한 것이라 HEX 하드코딩이 아니다.
// ------------------------------------------------------------------
const LINE_STROKE = { drama: 'stroke-primary', food: 'stroke-spice', anime: 'stroke-yellow' };
const LINE_FILL = { drama: 'fill-primary', food: 'fill-spice', anime: 'fill-yellow' };
const LINE_BG = { drama: 'bg-primary', food: 'bg-spice', anime: 'bg-yellow' };
const FALLBACK_STROKE = 'stroke-inkSec';
const FALLBACK_FILL = 'fill-inkSec';
const FALLBACK_BG = 'bg-inkSec';

// [V5-29] 실제 서울 지하철 역 표지판(초록 원 안 역번호 · 예: 2호선 210)을 참고 자료로 받아 반영.
// 노선별 역 번호 배지 — 라인 이니셜(D/F/A) + 그 라인 안에서 몇 번째 역인지(1부터). 스키마틱 맵이라
// 물리적 노선도의 "역 번호"를 그대로 지어내지 않고, 우리 라인 3종에 맞는 자체 코드 체계로 표현한다.
const LINE_CODE_LETTER = { drama: 'D', food: 'F', anime: 'A' };
const LINE_BADGE_BG = { drama: 'fill-primary', food: 'fill-spice', anime: 'fill-yellow' };
const LINE_BADGE_TEXT = { drama: 'fill-white', food: 'fill-white', anime: 'fill-ink' };
const BADGE_R = spacing[2]; // 8 · 역번호 배지 반지름
const BADGE_OFFSET = spacing[3]; // 12 · 역 마커 중심에서 배지까지 대각선 오프셋

// ------------------------------------------------------------------
// 기하 상수 · 전부 tokens.spacing 배열 인덱스에서만 가져온다(직접 숫자 나열 금지).
// spacing = [0,4,8,12,16,20,24,32,40,48,64,80,96,128]
// ------------------------------------------------------------------
const GRID = spacing[10]; // 64 · 역 간 기본 격자 간격(SVG 좌표 단위)
const STATION_R = spacing[2]; // 8 · 일반 역 반지름
const TRANSFER_R = spacing[3]; // 12 · 환승역 반지름(더 큰 원)
const TRANSFER_RING = spacing[1]; // 4 · 환승역 흰 테두리 두께
const LINE_WIDTH = spacing[1]; // 4 · 본선 스트로크 두께
const CASING_WIDTH = spacing[2]; // 8 · 본선 아래 흰 케이싱(본선보다 두껍게 감싼다)
const HOVER_BUMP = spacing[1]; // 4 · hover/focus 시 반지름 증가폭(scale 대신 반지름 보간)
const LABEL_GAP = spacing[1]; // 4 · 마커 테두리와 라벨 사이 여백
const PADDING_UNITS = 1.5; // 그리드 여백(바운딩 박스 밖 여유 · 그리드 단위, px 아님)
const DRAW_MS = 720; // PATTERNS §13 draw-on 명세값(720ms)과 동일 지속시간
const STAGGER_MS = 160; // 라인별 시작 지연 · tokens.motion.fast(160ms)와 동일 값 재사용

const LABEL_DIR = {
  n: { dx: 0, dy: -1, anchor: 'middle', baseline: 'auto' },
  s: { dx: 0, dy: 1, anchor: 'middle', baseline: 'hanging' },
  e: { dx: 1, dy: 0, anchor: 'start', baseline: 'middle' },
  w: { dx: -1, dy: 0, anchor: 'end', baseline: 'middle' },
};

const reducedMotionQuery = () =>
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

const DEFAULT_TITLE = { en: 'Cheongchun Line network map', ko: '청춘라인 노선도' };
const DEFAULT_NOTE = {
  en: 'Demo layout. Station names reuse confirmed line stops, and positions are schematic, not real coordinates.',
  ko: '데모용 배치다. 역 이름은 확정된 라인 코스명을 그대로 썼고, 위치는 실제 좌표가 아닌 노선도용 개략 좌표다.',
};
const MAP_LABEL = { en: 'K-content line network diagram', ko: 'K-콘텐츠 라인 노선도' };

function pick(dict, lang) {
  return dict[lang] ?? dict.en;
}

export default function SubwayNetworkMap({
  network = SAMPLE_NETWORK,
  lang = 'en',
  title,
  note,
  showLegend = true,
  className = '',
  onStationSelect,
}) {
  const lines = network?.lines ?? [];
  const stations = network?.stations ?? [];
  const [activeId, setActiveId] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const lineRefs = useRef({});

  const stationMap = useMemo(() => new Map(stations.map((s) => [s.id, s])), [stations]);

  // 환승역 판정: 2개 이상 라인의 stationIds에 동시에 등장하는 역 id 집합.
  const transferIds = useMemo(() => {
    const seen = new Map();
    lines.forEach((line) => {
      (line.stationIds ?? []).forEach((id) => seen.set(id, (seen.get(id) ?? 0) + 1));
    });
    return new Set([...seen.entries()].filter(([, n]) => n >= 2).map(([id]) => id));
  }, [lines]);

  // [V5-29] 역번호 코드(라인이니셜+순번) · 각 라인의 stationIds 순서 그대로 1부터 매긴다.
  //   지금 데이터엔 환승역이 없어 역 하나 = 라인 하나로 코드가 유일하게 정해진다.
  const stationCodes = useMemo(() => {
    const codes = new Map();
    lines.forEach((line) => {
      const letter = LINE_CODE_LETTER[line.id] ?? line.id.charAt(0).toUpperCase();
      (line.stationIds ?? []).forEach((id, idx) => {
        if (!codes.has(id)) codes.set(id, `${letter}${idx + 1}`);
      });
    });
    return codes;
  }, [lines]);

  // 라인별 옥토리니어 폴리라인(그리드 단위) → px 변환 포인트 문자열.
  const drawnLines = useMemo(
    () =>
      lines.map((line) => {
        const gridPoints = (line.stationIds ?? [])
          .map((id) => stationMap.get(id))
          .filter(Boolean)
          .map((s) => ({ x: s.x, y: s.y }));
        const routed = buildOctolinearRoute(gridPoints); // 8방향 규칙 보장(이미 정렬돼 있으면 그대로 반환)
        const pxPoints = routed.map((p) => ({ x: p.x * GRID, y: p.y * GRID }));
        return { ...line, pxPoints };
      }),
    [lines, stationMap],
  );

  // viewBox: 전체 역 좌표(그리드 단위) 기준 바운딩 박스 + 여백 → px 변환.
  const viewBox = useMemo(() => {
    if (!stations.length) return '0 0 100 100';
    const bbox = boundingBox(
      stations.map((s) => ({ x: s.x, y: s.y })),
      PADDING_UNITS,
    );
    return `${bbox.minX * GRID} ${bbox.minY * GRID} ${bbox.width * GRID} ${bbox.height * GRID}`;
  }, [stations]);

  const aspect = useMemo(() => {
    if (!stations.length) return 1;
    const bbox = boundingBox(
      stations.map((s) => ({ x: s.x, y: s.y })),
      PADDING_UNITS,
    );
    return bbox.width / bbox.height;
  }, [stations]);

  // draw-on: 마운트 후 각 라인의 실제 길이를 구해 stroke-dashoffset을 0으로 보간한다.
  // reduced-motion이면 즉시 완성 상태(transition 없음)로 그린다.
  useEffect(() => {
    const mq = reducedMotionQuery();
    let cancelled = false;
    const apply = (reduced) => {
      drawnLines.forEach((line, i) => {
        const el = lineRefs.current[line.id];
        if (!el) return;
        const length = el.getTotalLength();
        if (reduced) {
          el.style.transition = 'none';
          el.style.strokeDasharray = 'none';
          el.style.strokeDashoffset = '0';
          return;
        }
        el.style.transition = 'none';
        el.style.strokeDasharray = `${length}`;
        el.style.strokeDashoffset = `${length}`;
        // 강제 reflow(한 프레임 뒤 transition이 걸리게). 값을 읽기만 하고 버린다.
        void el.getBoundingClientRect();
        el.style.transition = `stroke-dashoffset ${DRAW_MS}ms ${motion.easeOut} ${i * STAGGER_MS}ms`;
        el.style.strokeDashoffset = '0';
      });
      if (!cancelled) setRevealed(true);
    };
    apply(Boolean(mq?.matches));
    const onChange = (e) => apply(e.matches);
    mq?.addEventListener?.('change', onChange);
    return () => {
      cancelled = true;
      mq?.removeEventListener?.('change', onChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawnLines]);

  const titleText = title ?? pick(DEFAULT_TITLE, lang);
  const noteText = note ?? pick(DEFAULT_NOTE, lang);

  return (
    <div className={`w-full ${className}`}>
      {titleText && <h3 className="mb-16 text-h3 font-semibold text-ink">{titleText}</h3>}

      {/* 반응형 컨테이너: 뷰포트 기반 SVG viewBox + aspect-ratio 유지(320~3840px 전 구간 비율 고정). */}
      <div className="relative w-full" style={{ aspectRatio: aspect || 1 }}>
        <svg
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={pick(MAP_LABEL, lang)}
          className="h-full w-full"
        >
          {/* prefers-reduced-motion 이중 방어(JS matchMedia + CSS) · scale 사용 없음(반지름 보간만) */}
          <style>{`
            .bh-subway-station circle { transition: r ${motion.fast} ${motion.easeOut}; }
            .bh-subway-station { opacity: ${revealed ? 1 : 0}; transition: opacity ${motion.dur} ${motion.easeOut}; }
            @media (prefers-reduced-motion: reduce) {
              .bh-subway-line { transition: none !important; stroke-dashoffset: 0 !important; }
              .bh-subway-station { opacity: 1 !important; transition: none !important; }
              .bh-subway-station circle { transition: none !important; }
            }
          `}</style>

          {/* 케이싱(흰 테두리) 먼저 → 그 위에 본선 색 · 케이싱이 본선보다 두꺼워 감싸는 효과 */}
          {drawnLines.map((line) => (
            <polyline
              key={`${line.id}-casing`}
              points={line.pxPoints.map((p) => `${p.x},${p.y}`).join(' ')}
              className="fill-none stroke-bg"
              strokeWidth={CASING_WIDTH}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {drawnLines.map((line, i) => (
            <polyline
              key={`${line.id}-main`}
              ref={(el) => {
                lineRefs.current[line.id] = el;
              }}
              points={line.pxPoints.map((p) => `${p.x},${p.y}`).join(' ')}
              className={`bh-subway-line fill-none ${LINE_STROKE[line.id] ?? FALLBACK_STROKE}`}
              strokeWidth={LINE_WIDTH}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transitionDelay: `${i * STAGGER_MS}ms` }}
            />
          ))}

          {/* 역 마커: 일반 = 원(라인 색 채움), 환승역 = 더 큰 흰 테두리 원(2개 라인이 만나는 지점) */}
          {stations.map((station) => {
            const isTransfer = transferIds.has(station.id);
            const cx = station.x * GRID;
            const cy = station.y * GRID;
            const r = (isTransfer ? TRANSFER_R : STATION_R) + (activeId === station.id ? HOVER_BUMP : 0);
            const dir = LABEL_DIR[station.labelSide ?? 'n'];
            const labelOffset = r + LABEL_GAP;
            const lx = cx + dir.dx * labelOffset;
            const ly = cy + dir.dy * labelOffset;
            // 역이 속한 라인(1개면 그 색, 환승역이면 흰 바탕 + ink 링이라 색 채움 없음)
            const ownerLineId = lines.find((l) => (l.stationIds ?? []).includes(station.id))?.id;
            const fillClass = isTransfer ? 'fill-bg' : LINE_FILL[ownerLineId] ?? FALLBACK_FILL;
            const label = pick(station.name, lang);
            // [V5-29] 역번호 배지 · 실제 지하철 역 표지판(초록 원 안 역번호) 참고자료 반영.
            //   환승역은 라인이 2개라 배지도 2개(살짝 겹쳐 나란히), 일반역은 1개.
            const codeLines = isTransfer
              ? lines.filter((l) => (l.stationIds ?? []).includes(station.id))
              : ownerLineId
                ? [lines.find((l) => l.id === ownerLineId)]
                : [];
            const badgeCx = cx + BADGE_OFFSET * Math.SQRT1_2;
            const badgeCy = cy - BADGE_OFFSET * Math.SQRT1_2;

            return (
              <g
                key={station.id}
                className="bh-subway-station cursor-pointer"
                tabIndex={0}
                role="button"
                aria-label={isTransfer ? `${label} (${pick({ en: 'Transfer', ko: '환승' }, lang)})` : label}
                onMouseEnter={() => setActiveId(station.id)}
                onMouseLeave={() => setActiveId((cur) => (cur === station.id ? null : cur))}
                onFocus={() => setActiveId(station.id)}
                onBlur={() => setActiveId((cur) => (cur === station.id ? null : cur))}
                onClick={() => onStationSelect?.(station)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onStationSelect?.(station);
                  }
                }}
              >
                <title>{label}</title>
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  className={`${fillClass} ${isTransfer ? 'stroke-ink' : 'stroke-none'}`}
                  strokeWidth={isTransfer ? TRANSFER_RING : 0}
                />
                <text
                  x={lx}
                  y={ly}
                  textAnchor={dir.anchor}
                  dominantBaseline={dir.baseline}
                  className={`font-body text-caption ${isTransfer ? 'font-semibold' : 'font-medium'} text-ink`}
                >
                  {label}
                </text>
                {/* 역번호 배지(들) · 라인색 원 + 코드(라인이니셜+순번), 흰 테두리로 본선/역 위에서도 또렷하게 */}
                {codeLines.map((codeLine, ci) => {
                  const code = stationCodes.get(station.id + (codeLines.length > 1 ? `::${codeLine.id}` : ''))
                    ?? `${LINE_CODE_LETTER[codeLine.id] ?? codeLine.id.charAt(0).toUpperCase()}${(codeLine.stationIds ?? []).indexOf(station.id) + 1}`;
                  const bx = badgeCx + ci * (BADGE_R * 1.8);
                  return (
                    <g key={codeLine.id}>
                      <circle
                        cx={bx}
                        cy={badgeCy}
                        r={BADGE_R}
                        className={`${LINE_BADGE_BG[codeLine.id] ?? FALLBACK_FILL} stroke-bg`}
                        strokeWidth={spacing[1]}
                      />
                      <text
                        x={bx}
                        y={badgeCy}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className={`font-display text-[9px] font-bold ${LINE_BADGE_TEXT[codeLine.id] ?? 'fill-white'}`}
                      >
                        {code}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      {showLegend && (
        <div className="mt-16 flex flex-wrap gap-8">
          {lines.map((line) => (
            <span
              key={line.id}
              className="flex items-center gap-8 rounded-pill bg-white px-16 py-8 shadow-sm"
            >
              <span
                aria-hidden="true"
                className={`h-12 w-12 rounded-pill ${LINE_BG[line.id] ?? FALLBACK_BG}`}
              />
              <span className="text-small font-semibold text-ink">{pick(line.name, lang)}</span>
            </span>
          ))}
        </div>
      )}

      {noteText && <p className="mt-8 text-caption font-medium text-inkMeta">{noteText}</p>}
    </div>
  );
}
