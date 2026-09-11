// [V5-3] K배지 · SOURCE_SPOTS UI 규칙(anchor && grade ∈ 강함·중간 = 서버 spot.badge)인 스팟만 · 라벨 = kType 4종(i18n gts.spot.kbadge)
// DESIGN §7 칩 문법(caption·pill) · 흰 면 + ink 텍스트(사진 위·흰 카드 위 모두 대비 4.5:1) + lucide BadgeCheck(primary · 16px)
// 모션: 페이드 인만(MOTION build 카드 절) · reduced-motion은 index.css 전역 규칙이 즉시 표시로 축약
import { BadgeCheck } from 'lucide-react';
import LangSwap from '../../i18n/LangSwap';
import { motion } from '../../tokens';

const LABELED = ['kfood', 'kdrama', 'kanime', 'kpop'];

export default function KBadge({ spot }) {
  if (!spot?.badge || !LABELED.includes(spot.kType)) return null;
  return (
    <span
      className="inline-flex min-w-0 max-w-full shrink-0 items-center gap-4 rounded-pill bg-white px-8 text-caption font-semibold text-ink shadow-sm"
      style={{ animation: `bh-fade-in ${motion.dur} ${motion.easeOut} both` }}
    >
      <BadgeCheck size={16} aria-hidden="true" className="shrink-0 text-primary" />
      {/* 좁은 카드(320px 2열)에서는 라벨 말줄임(카드 밖 넘침 금지) */}
      <LangSwap k={`gts.spot.kbadge.${spot.kType}`} className="min-w-0 grid-cols-1 [&>span]:truncate" />
    </span>
  );
}
