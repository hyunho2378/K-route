// Home 근거 스트립 · [V5-11] 문제 지표를 검증 확정 수치로만 노출한다.
//   숫자와 항목은 data/evidence.js 단일 출처(검증 안 된 수치가 화면으로 새지 않게) · 라벨·출처 문구는 i18n 3언어.
//   각 수치에 출처를 캡션으로 병기하고 data-source 속성에도 남긴다(지시 규칙: 캡션 또는 data-source).
//   ProofSection 의 dl/dt/dd 문법을 그대로 따른다(값 = Kanit Bold 먼저 · 라벨 = small 뒤).
// [V5-26] 지표당 lucide 아이콘 배지 추가(KRouteLines.jsx의 "색 배지 원 + 아이콘" 선례와 같은 문법,
//   새 아이콘 라이브러리 없음). 순수 숫자·텍스트만 있던 카드에 시각 요소를 더해 화면이 밋밋해 보이지
//   않게 한다(사용자 지시). 배지 색은 bg-surface(연한 중립면)로 둬 라인 색 배지와 시각적으로 구분한다.
import { Music, Bus, Clock, MapPin, Backpack, Landmark, Sunset } from 'lucide-react';
import { EVIDENCE } from '../../data/evidence';
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';

const EVIDENCE_ICON = {
  stage: Music, // 공연 티켓판매액
  transit: Bus, // 대중교통 분담률 격차
  headway: Clock, // 배차 간격(분)
  seoul: MapPin, // 서울 방문율
  fit: Backpack, // 개별여행(FIT) 비중
  nami: Landmark, // 남이섬 점유율
  daytrip: Sunset, // 당일치기 비율
};

export default function EvidenceStrip() {
  const { t } = useLang();
  return (
    <dl className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-24">
      {EVIDENCE.map((e) => {
        const Icon = EVIDENCE_ICON[e.id];
        return (
          <div
            key={e.id}
            // 출처는 캡션으로도 보이고 속성으로도 남는다(검수 시 grep 가능)
            data-source={t(`home.evidence.source.${e.id}`)}
            className="flex flex-col gap-8 rounded-lg bg-white p-24 shadow-sm"
          >
            {Icon && (
              <span
                aria-hidden="true"
                className="flex h-40 w-40 items-center justify-center rounded-pill bg-surface text-primary"
              >
                <Icon size={20} />
              </span>
            )}
            {/* 값은 언어 무관 숫자 · 단위가 언어에 따라 달라지는 항목은 라벨이 말한다 */}
            <dd className="font-display text-h1 font-bold tracking-display text-primary">{e.value}</dd>
            <LangSwap k={`home.evidence.items.${e.id}`} as="dt" className="text-small font-semibold" />
            {/* 출처 캡션 · inkMeta 는 12~13px 캡션 전용 하한선(DESIGN §16.1) */}
            <p className="text-caption font-medium text-inkMeta">{t(`home.evidence.source.${e.id}`)}</p>
          </div>
        );
      })}
    </dl>
  );
}
