// StepStage · PATTERNS §41 몰입 스텝 오버레이 (존 C5 신설) — BuildProgressBar(하단 진행 바) 대체.
// 구조: fixed inset-0 z-sheet · scrim rgba(10,12,20,0.7)(§41 명세값) + 중앙 리퀴드 글래스 패널
//   (최대 폭 1040px · 높이 84vh 전부 §41 명세값 · 내부 스크롤 scroll-quiet ·
//   blur 허용면 재배정: 구 '지도 위 라인 카드' 슬롯).
// 상단: 스텝 라벨("1 / 3 · …") + 진행 도트 / 하단 중앙 고정 [뒤로](secondary) [다음](primary)
//   페어 — 항상 동일 위치, 첫 스텝 뒤로 = 나가기 확인 Dialog(Modal).
// 스텝 전환: 나가는 콘텐츠 translateX(-24px)+opacity / 들어오는 24px→0+opacity ·
//   280ms(tokens dur) easeInOut · reduced-motion 크로스페이드(StepStage.css 주석 참조).
// Escape = 뒤로 1스텝(첫 스텝은 나가기 확인). 글래스 위 텍스트는 ink 계열 선명색만(§17.4).
import { createPortal } from 'react-dom';
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from '../../tokens';
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import './StepStage.css';

// Dialog(ui)와 동일한 포커스 트랩 문법(모달리티 표면 공통)
const trapTab = (e, root) => {
  const els = root.querySelectorAll(
    'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  if (!els.length) return;
  const first = els[0];
  const last = els[els.length - 1];
  // [V5-3] 포커스가 목록 밖(패널 자체 tabIndex -1 등)이면 처음/끝으로 · Shift+Tab 누출 방지(에이전트 A 제보)
  if (![...els].includes(document.activeElement)) {
    e.preventDefault();
    (e.shiftKey ? last : first).focus();
  } else if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
};

export default function StepStage({
  stepIndex,
  stepCount,
  titleKey,
  stepKey,
  onBack,
  onNext,
  nextDisabled = false,
  reasonKey = null,
  onExit,
  toast = null, // [V22] 상단중앙 오버레이 토스트(레이아웃 높이 미점유 · 초과 안내용)
  nextLabel = null, // [V5-3] 다음 버튼 라벨 노드(기본 common.next · quiz 결과 "추천 N곳 보기")
  exitKey = 'gts.build', // [V5-3] 나가기 확인 카피 접두(exitTitle·exitBody·exitStay·exitLeave)
  children,
}) {
  const { t } = useLang();
  const [exitOpen, setExitOpen] = useState(false);
  // 전환 씬: shown = 현재 스텝, leaving = 나가는 스텝(280ms 유지 후 제거)
  const [shown, setShown] = useState({ key: stepKey, node: children });
  const [leaving, setLeaving] = useState(null);
  const timerRef = useRef(0);
  const panelRef = useRef(null);
  const rootRef = useRef(null); // [V5-3] 스테이지 dialog 루트(겹친 모달 Escape 판별)

  useEffect(() => {
    if (shown.key !== stepKey) {
      clearTimeout(timerRef.current);
      setLeaving(shown);
      setShown({ key: stepKey, node: children });
      timerRef.current = setTimeout(() => setLeaving(null), parseInt(motion.dur, 10));
    } else if (shown.node !== children) {
      // 같은 스텝의 리렌더(선택 변화) 반영 — 전환 아님
      setShown({ key: stepKey, node: children });
    }
  }, [stepKey, children, shown]);
  useEffect(() => () => clearTimeout(timerRef.current), []);

  // 풀스크린 모달리티 · 배경 스크롤 잠금
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  const handleBack = useCallback(() => {
    if (stepIndex === 0) setExitOpen(true);
    else onBack();
  }, [stepIndex, onBack]);

  // Escape = 뒤로 1스텝(§41) · 나가기 확인이 열려 있으면 Modal이 자체 처리
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape' || exitOpen) return;
      // [V5-3] 겹친 모달(나가기 확인 Dialog·Sheet 등) 안의 Escape는 그 모달 몫 · 모달이 닫히며 리스너가 재등록된 뒤
      //   같은 이벤트가 window에 도달해 확인창이 즉시 다시 열리던 문제(에이전트 A 실측 · Dialog·BottomSheet 둘 다 재현)
      const owner = e.target instanceof Element ? e.target.closest('[role="dialog"]') : null;
      if (owner && owner !== rootRef.current) return;
      handleBack();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [exitOpen, handleBack]);

  // §41 전환 수치는 tokens.motion 주입(키프레임은 StepStage.css)
  const stepAnim = (name) => ({ animation: `${name} ${motion.dur} ${motion.easeInOut} both` });

  return createPortal(
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={t(titleKey)}
      className="fixed inset-0 z-sheet grid place-items-center p-16 md:p-24"
      onKeyDown={(e) => {
        if (e.key === 'Tab' && !exitOpen) trapTab(e, panelRef.current);
      }}
    >
      {/* §41 명세값 scrim rgba(10,12,20,0.7) — 명세 인용 한정 허용 */}
      <div aria-hidden="true" className="absolute inset-0" style={{ background: 'rgba(10,12,20,0.7)' }} />

      <div
        ref={panelRef}
        tabIndex={-1}
        // [H2-13] 최대 폭 1120 · §35 문법 머티리얼(0.72 + blur24 saturate180 + 상단 하이라이트 엣지)
        //   — 어두운 scrim(0.7) 위 밝은 화이트 글래스 대비("반투명 회색 모달" 톤 금지)
        style={{
          maxWidth: 1120,
          background: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderTop: '1px solid rgba(255,255,255,0.4)',
        }}
        className="relative flex h-[92dvh] w-full flex-col overflow-hidden rounded-xl shadow-lg lg:h-[90dvh]"
      >
        {/* [V22] 상단중앙 오버레이 토스트 · absolute라 레이아웃 높이 미점유(스크롤 유발 안 함) */}
        {toast && (
          <div className="pointer-events-none absolute inset-x-0 top-12 z-content flex justify-center px-16">
            {toast}
          </div>
        )}
        {/* 상단 · 스텝 라벨 + 진행 도트(§41) · [V22] 폰트·상하 여백 축소(무스크롤 확보) + middot 제거(공백 구분) */}
        <div className="flex flex-col items-center gap-4 px-24 pb-4 pt-8 lg:px-32 lg:pb-12 lg:pt-16">
          <p className="flex items-baseline gap-8 tracking-glass">
            <span className="font-display text-caption font-bold">
              {stepIndex + 1} / {stepCount}
            </span>
            <LangSwap k={titleKey} className="text-caption font-semibold" />
          </p>
          <div aria-hidden="true" className="flex items-center gap-8">
            {Array.from({ length: stepCount }, (_, i) => (
              // 정적 도트 열 · 개수 고정이라 인덱스 키 허용
              // eslint-disable-next-line react/no-array-index-key
              // [V5-3] MOTION quiz 절: 진행 도트 = 색 채움 전환(width 등 레이아웃 속성 미사용)
              <span
                key={i}
                className={`h-8 w-8 rounded-pill transition-colors duration-fast ${i <= stepIndex ? 'bg-primary' : 'bg-line'}`}
              />
            ))}
          </div>
        </div>

        {/* 콘텐츠 · 내부 스크롤 scroll-quiet(§41) — 전환 중엔 나가는 씬을 절대배치로 겹침 · [V22] 하단 패딩 축소(무스크롤) */}
        {/* [V5-3] 짧은 스텝은 패널 세로 중앙(my-auto · 4K 하단 여백 과다 해소) · 넘치면 auto 마진 0 → 위부터 스크롤 */}
        <div className="relative flex flex-1 flex-col overflow-y-auto scroll-quiet px-24 pb-12 lg:px-32">
          {leaving && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex flex-col px-24 pb-12 lg:px-32"
              style={stepAnim('bh-step-out')}
            >
              <div className="my-auto">{leaving.node}</div>
            </div>
          )}
          <div key={shown.key} className="my-auto" style={leaving ? stepAnim('bh-step-in') : undefined}>
            {shown.node}
          </div>
        </div>

        {/* 하단 중앙 고정 버튼 페어(§41) · 항상 동일 위치 · 사유는 aria-live · §18.3 safe-area */}
        <div
          className="flex flex-col items-center gap-16 px-24 pt-16 lg:px-32 lg:pt-24"
          style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom))' }}
        >
          {/* [V13] 안내(사유)와 버튼 사이 16px 여백 확보(gap-16) */}
          <div aria-live="polite" className="min-h-[18px]">
            {nextDisabled && reasonKey && (
              // [V5-3] 사유 = ink(글래스 위 spice 텍스트는 약 2.2:1 · AA 4.5:1 미달)
              <LangSwap k={reasonKey} className="text-caption font-semibold text-ink" />
            )}
          </div>
          {/* [H2-13] Back = white 채움 + primary 텍스트 + shadow.sm(글래스 위 가시성) · 두 버튼 높이 48 */}
          <div className="flex items-center justify-center gap-12">
            <span className="grid rounded-pill bg-white shadow-sm">
              <Button variant="secondary" onClick={handleBack} style={{ height: 48 }}>
                <LangSwap k="common.back" />
              </Button>
            </span>
            <Button disabled={nextDisabled} onClick={onNext} style={{ height: 48 }}>
              {nextLabel ?? <LangSwap k="common.next" />}
            </Button>
          </div>
        </div>
      </div>

      {/* 첫 스텝 뒤로 = 플로우 나가기 확인(§41) */}
      <Modal open={exitOpen} onClose={() => setExitOpen(false)} title={`${exitKey}.exitTitle`}>
        <div className="flex flex-col gap-24">
          <LangSwap k={`${exitKey}.exitBody`} as="p" className="text-body" />
          <div className="flex flex-wrap items-center gap-12">
            <Button onClick={() => setExitOpen(false)}>
              <LangSwap k={`${exitKey}.exitStay`} />
            </Button>
            <Button variant="secondary" onClick={onExit}>
              <LangSwap k={`${exitKey}.exitLeave`} />
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  , document.body);
}
