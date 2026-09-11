// [V5-3] K-가이드 봇 FAB 자리(IA §11.6·§11.8 · 챗 BottomSheet는 P3) · 우하단 고정 · 비활성(aria-disabled) + "곧 열림" 툴팁
// 48px 원(44px 이상 HIG) · safe-area · lucide MessageCircle 24 · hover scale 금지 · z = tokens.z.dock
import { MessageCircle } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';

export default function GuideFab() {
  const { t } = useLang();
  return (
    <button
      type="button"
      aria-disabled="true"
      aria-label={`${t('gts.guide.fab')}. ${t('gts.guide.soon')}`}
      title={t('gts.guide.soon')}
      onClick={(e) => e.preventDefault()}
      className="fixed right-16 z-dock inline-flex h-48 w-48 cursor-not-allowed items-center justify-center rounded-pill bg-primary text-white opacity-40 shadow-md lg:right-24"
      style={{ bottom: 'max(16px, env(safe-area-inset-bottom))' }}
    >
      <MessageCircle size={24} aria-hidden="true" />
    </button>
  );
}
