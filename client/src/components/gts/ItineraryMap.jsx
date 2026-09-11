// ItineraryMap · PATTERNS §32 (존 C4 신규) — LoopMap 재사용 아님(경량 신규 · maplibre-gl 직접).
// 소스 1개(선택 순서 LineString) + §13 3레이어(glow→casing→main · primary 단색) + draw-on(720ms,
// reduced-motion 즉시 완성), 번호 마커 28px primary 원 + white 숫자 700(ItineraryMap.css 치수),
// 핀 hover/탭 = StopPopup 재사용(§13 · hover 즉시 표시 + 200ms 유지 §16.9), fitBounds 패딩 80 1회.
// [V3] §32 리스트 폴백 폐지 — coord:null(목업)은 mockCoords 결정적 DEMO 좌표로 대체해
//   어떤 조합에서도 라인을 항상 그린다(지시 [3] · 고지는 페이지 mockNotice 지속).
// [V5-3] go 화면 선택 prop(전부 생략 시 기존 동작 동일 · route·checkout·ticket 호출부 무변경):
//   pinLabels = 핀 텍스트 배열(기본 순번 · null 항목 = 출발 핀: 순번 없는 white 원 + primary 링),
//   drawMs = draw-on 지속(기본 720), labelKey = 지도 region aria-label 사전 키(기본 gts.route.mapLabel).
import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { venueCoord } from '../../data/gts/mockCoords';
import { colors, map as M } from '../../tokens';
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
const solidGradient = (color) => [
  'interpolate',
  ['linear'],
  ['line-progress'],
  0,
  color,
  1,
  color,
];
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// §13 3레이어 [레이어 id, 색] · 단색 primary(§32), casing은 흰색(bg 토큰)
const LAYERS = [
  ['gts-route-glow', colors.primary],
  ['gts-route-casing', colors.bg],
  ['gts-route-main', colors.primary],
];

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

export default function ItineraryMap({
  venues,
  pinLabels,
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

      // 소스 1개 · 선택 순서 LineString(§32) — 재마운트 중복 가드(§23-3 선례)
      if (!map.getSource('gts-route')) {
        map.addSource('gts-route', {
          type: 'geojson',
          lineMetrics: true, // draw-on line-gradient 필수(§13)
          data: {
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: coords },
          },
        });
        const round = { 'line-cap': 'round', 'line-join': 'round' };
        [
          ['gts-route-glow', colors.primary, GLOW_OPACITY, w(12, 18)],
          ['gts-route-casing', colors.bg, 1, w(7, 10)],
          ['gts-route-main', colors.primary, 1, w(4.5, 7)],
        ].forEach(([id, color, opacity, width]) => {
          if (!map.getLayer(id)) {
            map.addLayer(
              {
                id,
                type: 'line',
                source: 'gts-route',
                layout: round,
                paint: { 'line-color': color, 'line-opacity': opacity, 'line-width': width },
              },
              labelLayer?.id,
            );
          }
        });
      }

      // 번호 마커 · 28px primary 원 + white 숫자 700(§32) · hover 즉시 팝업(§16.9)
      venues.forEach((venue, i) => {
        const label = pinLabels ? pinLabels[i] : String(i + 1);
        const el = document.createElement('button');
        el.type = 'button';
        el.className =
          label === null
            ? 'gts-pin bg-white shadow-sm ring-4 ring-inset ring-primary' // [V5-3] 출발 핀 · 순번 대신 링 표기
            : 'gts-pin bg-primary font-display text-small font-bold text-white shadow-sm';
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

      // fitBounds 1회 · 패딩 80(§32)
      const bounds = coords.reduce(
        (b, c) => b.extend(c),
        new maplibregl.LngLatBounds(coords[0], coords[0]),
      );
      map.fitBounds(bounds, { padding: FIT_PADDING, duration: 0 });

      // draw-on(§13) · reduced-motion 즉시 단색
      if (reducedMotion()) {
        LAYERS.forEach(([id, color]) => {
          if (map.getLayer(id)) map.setPaintProperty(id, 'line-gradient', solidGradient(color));
        });
      } else {
        const startT = performance.now();
        const step = (now) => {
          const p = Math.min((now - startT) / drawMs, 1);
          const eased = easeOut(p);
          LAYERS.forEach(([id, color]) => {
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
      map.remove();
      setMapObj(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venues]);

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
