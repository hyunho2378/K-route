// Home 근거 스트립 · [V5-11] 문제 지표를 검증 확정 수치로만 노출한다.
//   숫자와 항목은 data/evidence.js 단일 출처(검증 안 된 수치가 화면으로 새지 않게).
//   ProofSection 의 dl/dt/dd 문법을 그대로 따른다(값 = Kanit Bold 먼저 · 라벨 = small 뒤).
// [V5-26] 지표당 lucide 아이콘 배지 추가(KRouteLines.jsx 선례와 같은 문법, 새 아이콘 라이브러리 없음).
// [V5-27] 기관명 인용("Ministry of Culture, Sports and Tourism, International Visitor Survey 2023"
//   식)을 화면에서 삭제(사용자 지시 — 처음 보는 외국인 관광객이 보기엔 보고서처럼 읽힘 · 출처 검증
//   자체는 기능설명서(PPTX)에 이미 있음). 수치의 검증 가능성은 잃지 않도록 data-source 속성에만
//   남겨 DOM에서 grep 가능하게 하고, 화면에는 캡션을 띄우지 않는다.
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
            // 출처는 화면에 안 띄우고 속성으로만 남긴다(검수 시 grep 가능 · 관광객 화면엔 기관명 인용 없음)
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
          </div>
        );
      })}
    </dl>
  );
}
