// ItineraryMap · PATTERNS §32 (존 C4 신규) — LoopMap 재사용 아님(경량 신규 · maplibre-gl 직접).
// 소스 1개(선택 순서 LineString) + §13 3레이어(glow→casing→main) + draw-on(720ms,
// reduced-motion 즉시 완성), 번호 마커 28px 원 + 숫자 700(ItineraryMap.css 치수),
// 핀 hover/탭 = StopPopup 재사용(§13 · hover 즉시 표시 + 200ms 유지 §16.9), fitBounds 패딩 80 1회.
// [V3] §32 리스트 폴백 폐지 — coord:null(목업)은 mockCoords 결정적 DEMO 좌표로 대체해
//   어떤 조합에서도 라인을 항상 그린다(지시 [3] · 고지는 페이지 mockNotice 지속).
// [V5-3] go 화면 선택 prop(전부 생략 시 기존 동작 동일 · checkout·ticket 호출부 무변경):
//   pinLabels = 핀 텍스트 배열(기본 순번 · null 항목 = 출발 핀: 순번 없는 white 원 + primary 링),
//   drawMs = draw-on 지속(기본 720), labelKey = 지도 region aria-label 사전 키(기본 gts.route.mapLabel).
// [V5-16] 라인 색·2층 구조:
//   · pinLines 가 있으면 경로선을 구간별로 그 역이 속한 라인 색으로 그린다(핀만 라인 색이고 선은 primary 고정이던 것 수리).
//     maplibre 의 line-gradient 는 레이어 속성이라 feature 별 색을 줄 수 없다 → 색깔별로 소스·레이어를 나눈다.
//     pinLines 를 넘기지 않는 호출부(checkout·ticket·go)는 종전 단색 primary 경로를 그대로 탄다(회귀 방지).
//   · network = 도시 전체 K-콘텐츠 노선(1층 · 고정 배경). draw-on 없이 낮은 불투명도로 깔고 그 위에 내 노선을 올린다.
//     역이 1곳뿐인 라인은 선이 아니라 점으로 그린다(없는 역을 지어내지 않는다 · SOURCE_SPOTS §8).
//     network 는 참조가 바뀌면 지도를 다시 그린다 → 호출부에서 useMemo 로 고정할 것.
import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { venueCoord } from '../../data/gts/mockCoords';
import { LINE_FACE, LINES, NO_LINE_FACE } from '../../data/gts/lineSystem';
import { colors, lineColors, map as M } from '../../tokens';
import { useLang } from '../../i18n/LangContext';
import Skeleton from '../ui/Skeleton';
import StopPopup from '../map/StopPopup';
import '../map/LoopMap.css'; // .stop-popup 팝업 카드 스타일 재사용(§13 · 파일 수정 없음)
import './ItineraryMap.css';

// PATTERNS §13 명세값(지도 레이어 수치는 명세 허용 · 주석 근거)
const DRAW_MS = 720; // draw-on 720ms
const GLOW_OPACITY = 0.22; // glow 컬러 22%
const TRANSPARENT = 'rgba(0,0,0,0)'; // §13 기준 구현 상수(미그린 구간)
const FIT_PADDING = 80; // §32 fitBounds 패딩 명세값
const HOVER_CLOSE_MS = 200; // §16.9 hover 팝업 유지 명세값
const w = (a, b) => ['interpolate', ['linear'], ['zoom'], 11.5, a, 15, b]; // §13 폭 보간
const easeOut = (x) => 1 - (1 - x) ** 3; // §13 "ease" 이징
// draw-on 종료 상태 · gradient 제거 대신 단색 상수 그라디언트(§23-4 검은 플래시 방지 선례)
const solidGradient = (color) => ['interpolate', ['linear'], ['line-progress'], 0, color, 1, color];
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// [V5-16] 라인 id → 실제 색 · lineSystem(LINES)과 tokens(lineColors) 조합이 단일 출처다(여기서 색을 새로 만들지 않는다).
const LINE_COLOR = Object.fromEntries(LINES.map((l) => [l.id, lineColors[l.colorToken]]));
// 라인에 속하지 않는 구간(연계 로컬) · 라인 3색을 쓰면 안 되므로 중립 잉크로 긋는다
const NO_LINE_COLOR = colors.inkSec;
// [V5-16] 1층(도시 전체 노선) 표현값 · 내 노선이 주인공이라 배경은 얇고 옅게
const NET_OPACITY = 0.35;
const NET_DOT_RADIUS = w(4, 7);

// venue(데이터) → StopPopup stop 계약 어댑터(name_en/name_ko·stay_min · th는 en 폴백 v3.1 규칙)
// [V3] 좌표는 venueCoord 경유(목업 = 결정적 DEMO 좌표)
const toStop = (venue) => ({
  id: venue.id,
  lng: venueCoord(venue)[0],
  lat: venueCoord(venue)[1],
  name_en: venue.name.en,
  name_ko: venue.name.ko,
  preorder_en: venue.oneLine.en,
  preorder_ko: venue.oneLine.ko,
  stay_min: venue.stayMin,
});

// [V5-16] 내 노선을 "같은 색끼리" 묶는다 · 구간 i = 역 i → 역 i+1, 색은 출발 역이 속한 라인
//   pinLines 없음 = 기존 단색 경로 1묶음(회귀 방지)
function colorGroups(coords, pinLines) {
  if (coords.length < 2) return [];
  if (!pinLines) return [{ key: 'primary', color: colors.primary, lines: [coords] }];
  const groups = new Map();
  for (let i = 0; i < coords.length - 1; i += 1) {
    const id = pinLines[i] ?? null;
    const key = id ?? 'none';
    if (!groups.has(key)) groups.set(key, { key, color: id ? LINE_COLOR[id] : NO_LINE_COLOR, lines: [] });
    groups.get(key).lines.push([coords[i], coords[i + 1]]);
  }
  return [...groups.values()];
}

// [V5-16] 1층 네트워크 → GeoJSON · 역 2곳 이상은 선, 1곳뿐인 라인은 점(선을 지어내지 않는다)
const networkGeoJson = (network) => ({
  type: 'FeatureCollection',
  features: (network ?? [])
    .filter((n) => n.coords?.length)
    .map((n) => ({
      type: 'Feature',
      properties: { color: LINE_COLOR[n.lineId] ?? NO_LINE_COLOR },
      geometry:
        n.coords.length >= 2
          ? { type: 'LineString', coordinates: n.coords }
          : { type: 'Point', coordinates: n.coords[0] },
    })),
});

export default function ItineraryMap({
  venues,
  pinLabels,
  pinLines,
  network = null,
  drawMs = DRAW_MS,
  labelKey = 'gts.route.mapLabel',
}) {
  const node = useRef(null);
  const closeTimer = useRef(null);
  const [mapObj, setMapObj] = useState(null);
  const [popupStop, setPopupStop] = useState(null);
  const { t } = useLang();

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setPopupStop(null), HOVER_CLOSE_MS);
  };

  useEffect(() => {
    if (!node.current) return undefined;
    const coords = venues.map(venueCoord); // [V3] 목업 포함 항상 유효 좌표
    const map = new maplibregl.Map({
      container: node.current,
      style: M.styleUrl,
      center: M.center,
      zoom: M.zoom,
      pitch: M.pitch,
      bearing: M.bearing,
      antialias: M.antialias, // §32 · tokens.map.antialias 필수 전달
      attributionControl: false,
    });
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    const markers = [];
    let raf = 0;

    map.on('load', () => {
      const labelLayer = map
        .getStyle()
        .layers?.find((l) => l.type === 'symbol' && l.layout?.['text-field']);
      const round = { 'line-cap': 'round', 'line-join': 'round' };

      // [V5-16] 1층 = 도시 전체 노선(고정 배경) · 내 노선보다 먼저 깔아 아래에 둔다.
      //   gradient 를 쓰지 않으므로 feature 속성 색(['get','color'])으로 한 소스에 전 라인을 담는다.
      if (network?.length && !map.getSource('gts-network')) {
        map.addSource('gts-network', { type: 'geojson', data: networkGeoJson(network) });
        if (!map.getLayer('gts-network-line')) {
          map.addLayer(
            {
              id: 'gts-network-line',
              type: 'line',
              source: 'gts-network',
              filter: ['==', ['geometry-type'], 'LineString'],
              layout: round,
              paint: { 'line-color': ['get', 'color'], 'line-opacity': NET_OPACITY, 'line-width': w(3, 5) },
            },
            labelLayer?.id,
          );
        }
        // 역이 1곳뿐인 라인 · 선 대신 점으로(드라마·애니처럼 앵커가 하나인 라인의 정직한 표현)
        if (!map.getLayer('gts-network-dot')) {
          map.addLayer(
            {
              id: 'gts-network-dot',
              type: 'circle',
              source: 'gts-network',
              filter: ['==', ['geometry-type'], 'Point'],
              paint: {
                'circle-color': ['get', 'color'],
                'circle-opacity': NET_OPACITY,
                'circle-radius': NET_DOT_RADIUS,
              },
            },
            labelLayer?.id,
          );
        }
      }

      // 2층 = 내 노선 · 같은 색끼리 소스를 나눈다(line-gradient 는 레이어 속성이라 feature 별 색이 안 된다).
      //   재마운트 중복 가드(§23-3 선례)
      const drawLayers = [];
      colorGroups(coords, pinLines).forEach(({ key, color, lines }) => {
        const sourceId = `gts-route-${key}`;
        if (!map.getSource(sourceId)) {
          map.addSource(sourceId, {
            type: 'geojson',
            lineMetrics: true, // draw-on line-gradient 필수(§13)
            data: {
              type: 'Feature',
              properties: {},
              geometry: { type: 'MultiLineString', coordinates: lines },
            },
          });
        }
        // §13 3레이어(glow → casing → main) · casing 은 흰색(bg 토큰)
        [
          [`${sourceId}-glow`, color, GLOW_OPACITY, w(12, 18)],
          [`${sourceId}-casing`, colors.bg, 1, w(7, 10)],
          [`${sourceId}-main`, color, 1, w(4.5, 7)],
        ].forEach(([id, layerColor, opacity, width]) => {
          if (!map.getLayer(id)) {
            map.addLayer(
              {
                id,
                type: 'line',
                source: sourceId,
                layout: round,
                paint: { 'line-color': layerColor, 'line-opacity': opacity, 'line-width': width },
              },
              labelLayer?.id,
            );
          }
          drawLayers.push([id, layerColor]);
        });
      });

      // 번호 마커 · 28px 원 + 숫자 700(§32) · hover 즉시 팝업(§16.9)
      venues.forEach((venue, i) => {
        const label = pinLabels ? pinLabels[i] : String(i + 1);
        const el = document.createElement('button');
        el.type = 'button';
        // [V5-9] 역이 속한 K-콘텐츠 라인의 색 면(LINE_FACE = 대비 규칙 포함) · 라인 없는 역은 중립 면(NO_LINE_FACE).
        //   pinLines 자체를 넘기지 않는 기존 호출부(checkout·ticket·go)는 종전 primary 그대로 둔다(회귀 방지).
        const face = pinLines ? LINE_FACE[pinLines[i]] ?? NO_LINE_FACE : 'bg-primary text-white';
        el.className =
          label === null
            ? 'gts-pin bg-white shadow-sm ring-4 ring-inset ring-primary' // [V5-3] 출발 핀 · 순번 대신 링 표기
            : `gts-pin ${face} font-display text-small font-bold shadow-sm`;
        el.textContent = label ?? '';
        el.setAttribute('aria-label', label === null ? venue.name.en : `${label} ${venue.name.en}`);
        el.addEventListener('click', (e) => {
          e.stopPropagation(); // 지도 클릭 닫기와 분리(§13)
          cancelClose();
          setPopupStop(toStop(venue));
        });
        el.addEventListener('mouseenter', () => {
          cancelClose();
          setPopupStop(toStop(venue));
        });
        el.addEventListener('mouseleave', scheduleClose);
        markers.push(new maplibregl.Marker({ element: el }).setLngLat(venueCoord(venue)).addTo(map));
      });

      // fitBounds 1회 · 패딩 80(§32) · **내 노선 기준으로만** 맞춘다.
      //   [V5-16] 1층 좌표까지 담아 봤더니(실측 2026-09-13) 남이섬 같은 외곽 역 때문에 화면이 춘천 권역 전체로 넓어져
      //   개인 노선 3역이 점처럼 뭉개졌다 = "1층 위에 개인 노선을 하이라이트한다"가 깨진다.
      //   1층은 배경이라 화면 밖으로 나가도 된다(겹치는 구간만 보여도 맥락은 전달된다).
      const bounds = coords.reduce(
        (b, c) => b.extend(c),
        new maplibregl.LngLatBounds(coords[0], coords[0]),
      );
      map.fitBounds(bounds, { padding: FIT_PADDING, duration: 0 });

      // draw-on(§13) · reduced-motion 즉시 단색 · 색깔별 레이어 전부에 같은 진행도를 준다(구간이 함께 자란다)
      if (reducedMotion()) {
        drawLayers.forEach(([id, color]) => {
          if (map.getLayer(id)) map.setPaintProperty(id, 'line-gradient', solidGradient(color));
        });
      } else {
        const startT = performance.now();
        const step = (now) => {
          const p = Math.min((now - startT) / drawMs, 1);
          const eased = easeOut(p);
          drawLayers.forEach(([id, color]) => {
            if (!map.getLayer(id)) return;
            map.setPaintProperty(
              id,
              'line-gradient',
              p >= 1
                ? solidGradient(color) // 완료 시 단색 복귀(§13)
                : ['step', ['line-progress'], color, Math.max(eased, 0.001), TRANSPARENT],
            );
          });
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      }

      // [V5-16] QA 전용 훅(dev 빌드 한정 · 검증 스크립트가 레이어 색을 읽는다 · LoopMap 선례)
      if (import.meta.env.DEV) window.__bhItineraryMap = map;
      setMapObj(map);
    });

    // 컨테이너 리사이즈 대응(§23-6 선례) · trackResize는 window만 감지
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(node.current);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      cancelClose();
      markers.forEach((m) => m.remove());
      if (import.meta.env.DEV) delete window.__bhItineraryMap;
      map.remove();
      setMapObj(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venues, network]);

  return (
    <div role="region" aria-label={t(labelKey)} className="relative h-full w-full bg-surface">
      <div ref={node} className="h-full w-full" />
      {!mapObj && <Skeleton className="absolute inset-0" />}
      {/* 팝업 · StopPopup 재사용(§32) — onViewLine 미전달(GTS는 라인 개념 없음) */}
      <StopPopup
        map={mapObj}
        stop={popupStop}
        onClose={() => setPopupStop(null)}
        onPointerEnter={cancelClose}
        onPointerLeave={scheduleClose}
      />
    </div>
  );
}
