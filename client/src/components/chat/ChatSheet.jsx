// [V5-6] K-가이드 챗 시트 · IA §11.8 · Modal(<lg BottomSheet §36 스와이프 / lg+ Dialog) 안의 대화
//   동해사이 챗 컴포넌트 흐름(스트리밍 말풍선 · 첫 토큰 전 대기 표시 · Enter 전송 · 한글 조합 중 Enter 무시 · 최신으로 스크롤)을
//   K-Route 토큰으로 다시 그린다(무보더 · 입력 = surface 면 + focus 링 · 사용자 말풍선 = surface 면 · 답변 = 흰 면 위 ink 텍스트)
//   컨텍스트 = 현재 선택 장소(picks) · 출처 칩 탭 → 창을 닫고 /gts/build 장소 상세(route·go 에서도 같은 길 · 코스 편집은 build 에서만)
//   모션(MOTION chat): 말풍선 fade + 위로 8px(bh-rise-in) · 대기 표시는 opacity 펄스만 · reduced-motion 은 전역 규칙이 즉시 표시로 축약
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Send } from 'lucide-react';
import Chip from '../ui/Chip';
import Modal from '../ui/Modal';
import AnswerText from './AnswerText';
import useGuideChat, { stripMarkdown } from './useGuideChat';
import { useGts } from '../../context/GtsContext';
import LangSwap from '../../i18n/LangSwap';
import { useLang } from '../../i18n/LangContext';
import { motion } from '../../tokens';

const RISE = { animation: `bh-rise-in ${motion.dur} ${motion.easeOut} both` };

export default function ChatSheet({ open, onClose }) {
  const { t, lang } = useLang();
  const { picks } = useGts();
  const navigate = useNavigate();
  const { messages, streaming, send } = useGuideChat({ lang, selectedSpotIds: picks });
  const [input, setInput] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  const submit = () => {
    if (streaming) return;
    send(input);
    setInput('');
  };

  const onKeyDown = (e) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const openSpot = (spot) => {
    onClose();
    navigate('/gts/build', { state: { spot } });
  };

  return (
    <Modal open={open} onClose={onClose} title="chat.title">
      <div className="flex flex-col gap-12">
        <div ref={listRef} aria-live="polite" className="scroll-quiet flex flex-col gap-16 overflow-y-auto" style={{ height: '56dvh' }}>
          <p className="text-small text-inkSec">{t('chat.greeting')}</p>

          {messages.map((m, i) => {
            if (m.role === 'user') {
              return (
                <p key={i} className="max-w-full self-end whitespace-pre-wrap rounded-lg bg-surface px-16 py-8 text-small text-ink" style={RISE}>
                  {m.content}
                </p>
              );
            }
            const live = streaming && i === messages.length - 1;
            return (
              <div key={i} className="flex flex-col gap-8" style={RISE}>
                {m.extractive && <p className="text-caption font-medium text-inkMeta">{t('chat.extractive')}</p>}
                {m.noInfo ? (
                  <p className="text-small text-ink">{t('chat.noInfo')}</p>
                ) : m.error ? (
                  <p className="text-small text-ink">{t('chat.error')}</p>
                ) : m.content ? (
                  <AnswerText text={stripMarkdown(m.content)} />
                ) : (
                  <p className="animate-pulse text-small text-inkSec motion-reduce:animate-none">{t('chat.thinking')}</p>
                )}
                {!live && m.sources?.length > 0 && (
                  <div className="flex flex-col gap-8">
                    <p className="text-caption font-medium text-inkMeta">{t('chat.sources')}</p>
                    <div className="flex flex-wrap gap-8">
                      {m.sources.map((s) => (
                        <Chip key={s.id} onClick={() => openSpot(s)}>
                          <span className="inline-flex items-center gap-4">
                            <MapPin size={16} aria-hidden="true" />
                            {s.name?.[lang] ?? s.name?.en}
                          </span>
                        </Chip>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-8">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t('chat.placeholder')}
            aria-label={t('chat.placeholder')}
            className="h-48 min-w-0 flex-1 rounded-md bg-surface px-16 text-body text-ink outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="button"
            onClick={submit}
            disabled={streaming || !input.trim()}
            aria-label={t('chat.send')}
            title={t('chat.send')}
            className="pressable inline-flex h-48 w-48 shrink-0 items-center justify-center rounded-pill bg-primary text-white disabled:pointer-events-none disabled:opacity-40"
          >
            <Send size={20} aria-hidden="true" />
          </button>
        </div>
      </div>
    </Modal>
  );
}
