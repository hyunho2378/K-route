// [V5-15] 홈 K-Route 라인 소개 · 홈의 주 피치를 "두 서비스"에서 K-콘텐츠 노선으로 바꾼다(사용자 지시 A2).
//   라인 정의·색·이름은 data/gts/lineSystem + i18n gts.line.* 단일 출처를 재사용한다(홈용 사본을 만들지 않는다).
//   Trip Planner(게이트)는 여기서 보조 텍스트 링크로 내려간다(K-Route 여정의 한 단계 = 춘천까지 오는 길).
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { LINES, LINE_FACE } from '../../data/gts/lineSystem';
import { LINE_ICONS } from '../../data/gts/quizQuestions';
import Button from '../ui/Button';
import LangSwap from '../../i18n/LangSwap';

export default function KRouteLines() {
  return (
    <div className="flex flex-col gap-24">
      <LangSwap k="home.lines.lead" as="p" className="max-w-[62ch] text-body font-medium text-inkSec" />
      <ul className="grid gap-16 md:grid-cols-3 md:gap-24">
        {LINES.map((line) => {
          const Icon = LINE_ICONS[line.id];
          return (
            <li key={line.id} className="flex flex-col items-start gap-8 rounded-lg bg-white p-24 shadow-sm">
              {/* 라인 색 면 · yellow 면 위 글자는 ink 만 허용(LINE_FACE 가 그 규칙의 단일 출처) */}
              <span
                aria-hidden="true"
                className={`flex h-48 w-48 items-center justify-center rounded-pill shadow-sm ${LINE_FACE[line.id]}`}
              >
                <Icon size={24} />
              </span>
              <LangSwap k={`gts.line.${line.id}.name`} as="span" className="text-h3 font-semibold" />
              <LangSwap k={`gts.line.${line.id}.body`} as="span" className="text-small font-medium text-inkSec" />
            </li>
          );
        })}
      </ul>
      <div className="flex flex-wrap items-center gap-16">
        <Button as={Link} to="/gts">
          <LangSwap k="home.lines.cta" />
        </Button>
        {/* 보조 = 춘천까지 오는 길(Trip Planner) · 주 피치를 가리지 않게 텍스트 링크로만 */}
        <Link
          to="/gate"
          className="pressable inline-flex min-h-44 items-center gap-4 text-small font-semibold text-primary"
        >
          <LangSwap k="home.lines.planner" />
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
