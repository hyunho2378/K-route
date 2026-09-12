// Proof 스트립 · [V10] van-hero(/images/home/van-hero.webp)를 히어로 이미지로 연결.
//   데스크톱 풀블리드(고정 높이) / 모바일 16:9 크롭 · 하단 어두운 그라데이션(0→0.55)으로 텍스트 가독성 확보.
//   alt = 3언어 사전 키(home.proof.alt) · 파일 부재/로드 실패 시 기존 갤러리 플레이스홀더로 폴백.
//   About 비공개([V10] §3)로 링크 목적지는 /gts(Tour Builder)로 변경 — /about#proof는 이제 404 위장.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';
import { gallery } from '../../data/pilot';
import { colors } from '../../tokens';

const HERO_SRC = '/images/home/van-hero.webp';

export default function PilotStrip() {
  const { t } = useLang();
  // van-hero 부재 시 기존 플레이스홀더(갤러리 첫 컷)로 폴백 · 그것도 없으면 bg-surface 노출
  const [src, setSrc] = useState(HERO_SRC);

  return (
    <Link
      to="/gts"
      className="group relative block overflow-hidden rounded-lg shadow-sm transition-all duration-fast hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[16/9] w-full sm:aspect-auto sm:h-[440px]">
        <img
          src={src}
          alt={t('home.proof.alt')}
          loading="lazy"
          onError={() => src !== gallery[0].photo && setSrc(gallery[0].photo)}
          className="h-full w-full bg-surface object-cover"
        />
        {/* 하단 어두운 그라데이션(투명 0 → scrim 0.55) — 오버레이 텍스트 가독성 */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-2/3"
          /* [V5-8] 하드코딩 rgba → tokens.colors.scrim(같은 값) · 끝점은 같은 색의 알파 0 */
          style={{ background: `linear-gradient(to top, ${colors.scrim}, rgba(20,23,46,0))` }}
        />
        {/* 좌하단 오버레이 텍스트 · body + CTA(흰색) */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-12 p-24 lg:p-40">
          <LangSwap k="home.proof.body" as="p" className="max-w-[560px] whitespace-pre-line text-body font-medium text-white" />
          <span className="inline-flex min-h-44 items-center gap-8 font-semibold text-white">
            <LangSwap k="home.proof.cta" />
            <ArrowRight size={20} aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}
