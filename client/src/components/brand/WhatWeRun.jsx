// About §4 What we run(IA §2.8.4) · 3필러 카드(Gate/Loop/Hands-Free) + 아이콘 배지 + 페이지 링크.
// 카피는 docs/BRAND_COPY.md §4(brand.run.*). 무보더 카드 + hover 리프트(DESIGN §7).
import { Link } from 'react-router-dom';
import { Bus, Luggage, Plane } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';
import Section from '../layout/Section';

const PILLARS = [
  // [G1] 명세 5-④: 퇴역 라우트(/loop·/hands-free) 링크를 정식 라우트로 교정(리다이렉트 의존 제거)
  { key: 'brand.run.gate', to: '/gate', icon: Plane },
  { key: 'brand.run.loop', to: '/gts', icon: Bus },
  { key: 'brand.run.handsfree', to: '/gts', icon: Luggage },
];

export default function WhatWeRun() {
  const { t } = useLang();
  return (
    <Section id="what-we-run" title="brand.run.title">
      <div className="flex flex-col gap-24">
        <LangSwap k="brand.run.sub" as="p" className="text-h3 font-medium text-inkSec" />
        <ul className="grid grid-cols-1 gap-16 md:grid-cols-3 md:gap-24">
          {PILLARS.map(({ key, to, icon: Icon }) => (
            <li key={key}>
              <Link
                to={to}
                className="flex h-full flex-col gap-12 rounded-lg bg-white p-24 shadow-sm transition-all duration-fast hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* 아이콘 배지 · 크롬 컬러(primary) 소프트 원(DESIGN §8 색상 토큰) */}
                <span
                  aria-hidden="true"
                  className="flex h-44 w-44 items-center justify-center rounded-pill bg-primary text-white"
                >
                  <Icon size={24} aria-hidden="true" />
                </span>
                <LangSwap k={`${key}.name`} as="h3" className="font-display text-h3 font-semibold" />
                {/* 본문 장문 · t() 직접 렌더 허용 영역(PATTERNS §1) */}
                <p className="text-small font-medium text-inkSec">{t(`${key}.body`)}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
