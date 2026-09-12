// [V5-6] K-가이드 봇 FAB(IA §11.6·§11.8) · build·route·go 우하단 · 탭 → ChatSheet(Modal = <lg BottomSheet §36 / lg+ Dialog)
//   body 포털 · z = tokens.z.sheet: build 의 StepStage(z-sheet · body 포털)보다 늦게 붙어 그 위에 오고, route·go 에선 Dock(z-dock) 위
//   lift = StepStage 하단 버튼 줄(버튼 48 + 여백 16) 위로 올린다(320px 에서 [다음] 과 겹치지 않게)
// 48px 원(44px 이상 HIG) · safe-area · lucide MessageCircle 24 · hover scale 금지(press 만)
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';
import ChatSheet from '../chat/ChatSheet';

export default function GuideFab({ lift = false }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  return createPortal(
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-label={t('chat.open')}
        title={t('gts.guide.fab')}
        onClick={() => setOpen(true)}
        className="pressable fixed right-16 z-sheet inline-flex h-48 w-48 items-center justify-center rounded-pill bg-primary text-white shadow-md lg:right-24"
        style={{
          bottom: lift ? 'calc(max(20px, env(safe-area-inset-bottom)) + 64px)' : 'max(16px, env(safe-area-inset-bottom))',
        }}
      >
        <MessageCircle size={24} aria-hidden="true" />
      </button>
      <ChatSheet open={open} onClose={() => setOpen(false)} />
    </>,
    document.body,
  );
}
