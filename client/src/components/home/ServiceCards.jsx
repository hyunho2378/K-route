// 서비스 진입 카드 2장 · v4.2 존 B5(IA §10.2.②) · [V5-15] 보조 도구로 재배치:
//   구 "Trip Planner / Tour Builder" → Trip Planner(→/gate) / Travel Log(→/travel-log).
//   케이로드 진입은 히어로 CTA 와 라인 섹션이 소유한다 — 여기서 중복으로 부르지 않는다(주 피치 희석 방지).
// lucide 아이콘 + 한 줄 설명 · 카드 문법 = 무보더 white + shadow.sm, hover md + 2px 리프트(DESIGN §7),
// §34 프레스 피드백(.pressable) · 라벨 전부 LangSwap(3언어 겹침 · 시프트 0).
import { Link } from 'react-router-dom';
import { ArrowRight, Footprints, Route } from 'lucide-react';
import LangSwap from '../../i18n/LangSwap';

// 아이콘: 경로 = Route / 발자취 = Footprints (lucide-react 실존 확인)
const SERVICES = [
  { id: 'planner', to: '/gate', icon: Route },
  { id: 'log', to: '/travel-log', icon: Footprints },
];

export default function ServiceCards() {
  return (
    <div className="grid gap-16 md:grid-cols-2 md:gap-24">
      {SERVICES.map(({ id, to, icon: Icon }) => (
        <Link
          key={id}
          to={to}
          className="pressable flex items-start gap-16 rounded-lg bg-white p-24 shadow-sm hover:-translate-y-0.5 hover:shadow-md"
        >
          <span
            aria-hidden="true"
            className="flex h-48 w-48 shrink-0 items-center justify-center rounded-pill bg-primary text-white shadow-sm"
          >
            <Icon size={24} />
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-4">
            <LangSwap k={`home.services.${id}.title`} as="span" className="text-h3 font-semibold" />
            <LangSwap k={`home.services.${id}.desc`} as="span" className="text-small text-inkSec" />
          </span>
          <ArrowRight size={20} aria-hidden="true" className="mt-4 shrink-0 text-primary" />
        </Link>
      ))}
    </div>
  );
}
