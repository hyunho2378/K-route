// Home 근거 스트립 · [V5-11] 문제 지표를 검증 확정 수치로만 노출한다.
//   숫자와 항목은 data/evidence.js 단일 출처(검증 안 된 수치가 화면으로 새지 않게) · 라벨·출처 문구는 i18n 3언어.
//   각 수치에 출처를 캡션으로 병기하고 data-source 속성에도 남긴다(지시 규칙: 캡션 또는 data-source).
//   ProofSection 의 dl/dt/dd 문법을 그대로 따른다(값 = Kanit Bold 먼저 · 라벨 = small 뒤).
import { EVIDENCE } from '../../data/evidence';
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';

export default function EvidenceStrip() {
  const { t } = useLang();
  return (
    <dl className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-24">
      {EVIDENCE.map((e) => (
        <div
          key={e.id}
          // 출처는 캡션으로도 보이고 속성으로도 남는다(검수 시 grep 가능)
          data-source={t(`home.evidence.source.${e.id}`)}
          className="flex flex-col gap-8 rounded-lg bg-white p-24 shadow-sm"
        >
          {/* 값은 언어 무관 숫자 · 단위가 언어에 따라 달라지는 항목은 라벨이 말한다 */}
          <dd className="font-display text-h1 font-bold tracking-display text-primary">{e.value}</dd>
          <LangSwap k={`home.evidence.items.${e.id}`} as="dt" className="text-small font-semibold" />
          {/* 출처 캡션 · inkMeta 는 12~13px 캡션 전용 하한선(DESIGN §16.1) */}
          <p className="text-caption font-medium text-inkMeta">{t(`home.evidence.source.${e.id}`)}</p>
        </div>
      ))}
    </dl>
  );
}
