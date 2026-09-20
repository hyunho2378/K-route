// How it works · [V5-15] 흐름 = 퀴즈 → 노선 여권 → NFC 스탬프(Cheongchun Line 실제 동선).
// 번호는 실제 순서이므로 숫자 마커 허용(COMPONENTS B). [V5-26] 숫자만 있던 카드에 lucide 아이콘 배지
// 추가(KRouteLines.jsx·EvidenceStrip.jsx와 같은 문법 · 새 아이콘 라이브러리 없음).
import { ListChecks, BookOpenCheck, Stamp } from 'lucide-react';
import LangSwap from '../../i18n/LangSwap';

const STEPS = [
  { id: 'step1', icon: ListChecks },
  { id: 'step2', icon: BookOpenCheck },
  { id: 'step3', icon: Stamp },
];

export default function HowItWorks() {
  return (
    <ol className="grid gap-16 md:grid-cols-3 md:gap-24 xl:gap-32">
      {STEPS.map(({ id, icon: Icon }, i) => (
        <li key={id} className="rounded-lg bg-white p-24 shadow-sm">
          <div className="flex items-center justify-between">
            <span aria-hidden="true" className="font-display text-h1 font-bold text-primary">
              {i + 1}
            </span>
            <span aria-hidden="true" className="flex h-40 w-40 items-center justify-center rounded-pill bg-surface text-primary">
              <Icon size={20} />
            </span>
          </div>
          <LangSwap k={`home.how.${id}.title`} as="h3" className="mt-16 text-h3 font-medium" />
          <LangSwap k={`home.how.${id}.body`} as="p" className="mt-8 text-small font-medium text-inkSec" />
        </li>
      ))}
    </ol>
  );
}
