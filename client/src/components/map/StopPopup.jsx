// 정류장 팝업 · v3.1 신설(DESIGN §11, PATTERNS §13, COMPONENTS v3.1 존 C).
// maplibregl.Popup({closeButton:false, offset:18, className:'stop-popup'}) · white 카드
// (스타일은 LoopMap.css .stop-popup 블록 · 값은 tokens 근거 주석).
// 내용: 정류장명(h3) + 한 줄 소개(선주문 대행 문구 재사용 · stops 데이터의 유일한 한 줄 카피,
// 질문 목록 보고) + 체류시간 chip + "View line" 텍스트 버튼.
// 동시에 1개(단일 인스턴스 + stop 변경 시 이전 popup remove), 지도 탭·Escape 닫기.
// v3.2(§16.9): hover 즉시 표시 대응 · onPointerEnter/onPointerLeave로 마커→팝업 이동 시
// 200ms 닫힘 타이머를 유지/재개(타이머는 Loop 페이지 소관).
import { useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import maplibregl from 'maplibre-gl';
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';
// 체류시간 단위 3언어 겹침 렌더용(PATTERNS §1·§18) · 시프트 0
import en from '../../i18n/en';
import ko from '../../i18n/ko';
import th from '../../i18n/th';

const DICTS = { en, ko, th };
const LANGS = ['en', 'ko', 'th'];

export default function StopPopup({ map, stop, onClose, onViewLine, onPointerEnter, onPointerLeave }) {
  const { lang } = useLang();
  // 팝업 콘텐츠 루트 · stop이 바뀌면 새 엘리먼트(이전 팝업은 cleanup에서 remove)
  const container = useMemo(() => document.createElement('div'), [stop?.id]);

  // 콜백 최신 참조 · 부모 재렌더(언어 전환 등)로 팝업이 재생성되지 않게 effect 의존성에서 제외
  const onCloseRef = useRef(onClose);
  const onViewLineRef = useRef(onViewLine);
  useEffect(() => {
    onCloseRef.current = onClose;
    onViewLineRef.current = onViewLine;
  }, [onClose, onViewLine]);

  useEffect(() => {
    if (!map || !stop) return undefined;
    const popup = new maplibregl.Popup({
      closeButton: false,
      offset: 18, // PATTERNS §13 명세값
      className: 'stop-popup',
    })
      .setLngLat([stop.lng, stop.lat])
      .setDOMContent(container)
      .addTo(map);

    // 지도 탭 닫기 · 마커 클릭은 stopPropagation으로 여기까지 오지 않는다(LoopMap)
    const onMapClick = () => onCloseRef.current?.();
    map.on('click', onMapClick);
    // Escape 닫기
    const onKey = (e) => {
      if (e.key === 'Escape') onCloseRef.current?.();
    };
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
      map.off('click', onMapClick);
      popup.remove(); // 동시에 1개 보장 · 이전 팝업 제거(PATTERNS §13)
    };
  }, [map, stop, container]);

  if (!map || !stop) return null;

  return createPortal(
    <div
      onMouseEnter={onPointerEnter}
      onMouseLeave={onPointerLeave}
      className="flex min-w-0 flex-col gap-8 font-body text-ink"
    >
      {/* 정류장명 · 데이터 필드(th 없음)는 en 폴백: lang!=='ko'일 때 en 스팬(v3.1 규칙) */}
      <h3 className="grid font-display text-h3 font-semibold">
        <span aria-hidden={lang === 'ko'} className={`col-start-1 row-start-1 ${lang !== 'ko' ? '' : 'invisible'}`}>{stop.name_en}</span>
        <span aria-hidden={lang !== 'ko'} className={`col-start-1 row-start-1 ${lang === 'ko' ? '' : 'invisible'}`}>{stop.name_ko}</span>
      </h3>
      {/* 한 줄 소개 · 데이터 본문(시프트 허용 영역), th는 en 폴백 */}
      <p className="text-small font-medium text-inkSec">
        {lang === 'ko' ? stop.preorder_ko : stop.preorder_en}
      </p>
      {/* 체류시간 chip · [V5-3] 체류 없음(go 출발 핀 stay 0·null)이면 비렌더 */}
      {stop.stay_min > 0 && (
        <span className="inline-flex w-fit items-center rounded-pill bg-surface px-12 py-4 text-caption font-medium text-inkSec">
          <span className="grid font-display">
            {LANGS.map((code) => (
              <span
                key={code}
                aria-hidden={lang !== code}
                className={`col-start-1 row-start-1 ${lang === code ? '' : 'invisible'}`}
              >
                {stop.stay_min} {DICTS[code].loop.detail.stayUnit}
              </span>
            ))}
          </span>
        </span>
      )}
      {/* View line 텍스트 버튼 · LinePreviewOverlay 오픈(페이지 이탈 없음 · IA §2.4)
          v4(§32): onViewLine 미전달 시 비렌더 — GTS ItineraryMap 재사용 대응(라인 개념 없음),
          기존 Loop 호출부는 항상 전달하므로 동작 불변 */}
      {onViewLine && (
        <button
          type="button"
          onClick={() => onViewLineRef.current?.(stop.line_id)}
          className="inline-flex min-h-44 w-fit items-center text-small font-semibold text-primary transition-colors duration-fast hover:text-ink"
        >
          <LangSwap k="loop.panel.viewLine" />
        </button>
      )}
    </div>,
    container,
  );
}
