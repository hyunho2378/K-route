// VenueDetail · [V2] 장소 상세 확장 카드 — 포트폴리오 FLIP 인터랙션 이식.
// FLIP: 트리거 시 원본 카드 getBoundingClientRect 측정 → fixed inset-0 오버레이(z-sheet) 위에서
//   승격 카드가 transform(translate+scale)만으로 이동. 기준 지오메트리(left/top/width/height)는
//   마운트 시 1회 정적 세팅 — 트랜지션 대상은 transform·opacity 뿐(width|height|left|top 트랜지션 0건).
//   1단계 center: scale = min(vw*0.62/w, vh*0.82/h) · 520ms cubic-bezier(0.16,1,0.3,1)
//   2단계 docked(연속 재생): 좌측 도킹 scale = min(vw*0.34/w, vh*0.8/h) · 560ms 동일 이징
//   우측 패널(폭 50%): 블록 스태거 opacity 0→1 + translateY(20→0) 360ms · 블록당 70ms 계단.
// 닫기 3경로(X·스크림·Escape) = 역재생 복귀 후 오버레이 해제. CSS 트랜지션이라 인터럽트 시 현재값 재개.
// 모바일(<lg): 중앙 확대(520ms)까지만 → 풀스크린 시트 크로스페이드(fixed inset-0 · 상단 40dvh 면 ·
//   세로 스크롤 scroll-quiet · safe-area · 닫기 상단 우측 상시 · CTA 풀폭 §16.8 모바일 시트 예외).
// reduced-motion·키보드 개시(e.detail 0): 전 트랜지션 none 즉시 상태 전환(§17.1).
// z 순서: StepStage(z-sheet)와 동급이지만 늦게 마운트된 body 포털(뒤 형제)이라 위에 그려진다.
// Escape 는 window 캡처 단계 + stopPropagation — StepStage '뒤로 1스텝' 리스너 발화 차단.
// blur 신규 사용 0(스크림 + 솔리드 white 패널 — 예산 불변).
// 카드 사진 자산 없음(§9.4 빈 박스 금지) → 승격 카드 = surface 면 + 장소명 타이포(명세의 무이미지 분기).
// [V5-3] K-Route 스팟(kind 'kto'|'venue' · IA §11.5) 개정:
//   이미지 = spotImages 후보 체인(히어로·승격 카드 동일 · onError면 다음 · 소진/없음 = 텍스트만).
//   열릴 때(언어 바뀌면 재호출) getSpotDetail → kind 'kto' 본문 = 공사 원문(detailCommon2 소개 · detailIntro2 이용 안내 · 출처)
//   / kind 'venue' 본문 = 기존 스토리·정보 블록(VENUE_DETAILS · venues.js story·link) · 두 kind 공통 = odii 오디오 해설(있으면).
//   상단 블록 = 이름 + K배지·집중률 Chip + 추천 사유 · 리뷰 블록(목업 후기·별점) 전면 제거.
import { createPortal } from 'react-dom';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { VENUE_DETAILS } from '../../data/gts/venueDetails';
import { venues } from '../../data/gts/venues';
import { getSpotDetail } from '../../data/gts/ktoApi';
import { ktoHref, ktoText, spotImages } from '../../data/gts/spots';
import LangSwap from '../../i18n/LangSwap';
import { useLang } from '../../i18n/LangContext';
import Button from '../ui/Button';
import Skeleton from '../ui/Skeleton';
import CongestionChip from './CongestionChip';
import KBadge from './KBadge';
import TriText from './TriText';
import { colors, motion } from '../../tokens';
import './VenueDetail.css';

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'; // 지시 명세값(포트폴리오 이징) — 토큰 외 인용 한정
const CENTER_MS = 520;
const DOCK_MS = 560;

// StepStage·Dialog 와 동일한 포커스 트랩 문법(모달리티 표면 공통)
const trapTab = (e, root) => {
  const els = root.querySelectorAll(
    'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  if (!els.length) return;
  const first = els[0];
  const last = els[els.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
};

// detailIntro2 필드명 접미사는 콘텐츠 유형마다 다르다(관광지 usetime · 문화시설 usetimeculture · 레포츠 usetimeleports ·
//   쇼핑 opentime · 음식점 opentimefood …) → 이름 패턴에 맞는 첫 비어있지 않은 값
//   [P3-A] 값 가공 = ktoText 하나("<br>\n" 겹줄바꿈은 ktoText가 처리 · 로컬 합치기 중복 제거)
const introVal = (intro, re) => {
  const k = Object.keys(intro).find((key) => re.test(key) && ktoText(intro[key]));
  return k ? ktoText(intro[k]) : '';
};

// 이용 안내 행 [라벨 키(gts.detail.*), 값] · 값 있는 것만
const ktoInfo = (common, intro) =>
  [
    ['address', [common.addr1, common.addr2].map(ktoText).filter(Boolean).join(' ')],
    ['contact', ktoText(common.tel) || introVal(intro, /^infocenter/)],
    ['hours', introVal(intro, /^(usetime|opentime)/)],
    ['closed', introVal(intro, /^restdate/)],
    ['fee', introVal(intro, /^usefee/)],
    ['menu', [...new Set([ktoText(intro.firstmenu), ktoText(intro.treatmenu)].filter(Boolean))].join(' · ')],
    ['parking', introVal(intro, /^parking(?!fee)/)], // parkingfee(주차 요금)는 제외 · 주차 가능 여부 필드
  ].filter(([, v]) => v);

// 정보 행 · 라벨 96px + 값(원문 줄바꿈 유지)
function InfoRow({ labelKey, children }) {
  return (
    <div className="grid grid-cols-[96px_1fr] gap-12">
      <LangSwap k={labelKey} className="text-small font-semibold" />
      <span className="whitespace-pre-line text-small font-medium text-inkSec">{children}</span>
    </div>
  );
}

// 스태거 블록 · order×70ms 계단(명세 60~90 구간) — still 이면 애니메이션 스타일 미부여(즉시)
function Block({ order, still, className = '', children }) {
  return (
    <div
      className={className}
      style={still ? undefined : { animation: `bh-venue-block 360ms ${motion.easeOut} ${order * 70}ms both` }}
    >
      {children}
    </div>
  );
}

export default function VenueDetail({ venue, originRect, instant = false, isSelected, onToggle, onClose }) {
  const { t, lang } = useLang();
  // 언마운트까지 불변인 환경 판정(오버레이는 단명 표면 · 열림 중 리사이즈 재계산은 범위 밖)
  const still = useMemo(
    () => instant || window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [instant],
  );
  const isDesktop = useMemo(() => window.matchMedia('(min-width: 1024px)').matches, []);
  // enter(원위치) → center(중앙 확대) → open(도킹/시트) → closing(역재생)
  const [phase, setPhase] = useState(still ? 'open' : 'enter');
  const [capFull, setCapFull] = useState(false);
  // [V5-3] 이미지 후보 인덱스(spotImages) · 히어로·승격 카드 공유 · 소진이면 히어로 생략(텍스트만) · §9.4 빈 박스 금지
  const [imgAt, setImgAt] = useState(0);
  const imgSrc = spotImages(venue)[imgAt];
  const hasImage = !!imgSrc;
  // 두 img(히어로·승격 카드)가 같은 후보로 동시에 실패해도 한 칸만 전진
  const failImg = (at) => () => setImgAt((i) => (i === at ? i + 1 : i));
  // [V5-3] 상세 조회 결과 · null = 로딩 · item 없음 = 실패({ source:'fallback' })
  const [info, setInfo] = useState(null);
  const rootRef = useRef(null);
  const timers = useRef([]);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));

  const isKto = venue.kind === 'kto';
  const d = VENUE_DETAILS[venue.id]; // 문서 미커버(목업 + 실장소 5곳) → mock 공통 상세 한 벌
  const keyBase = d ? `venues.v.${venue.id}` : 'venues.v.mock';
  const local = isKto ? null : venues.find((v) => v.id === venue.id); // kind 'venue' = venues.js 항목(story·link)

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // [V5-3] 열릴 때 + 언어 전환 시 재조회(공사 원문은 언어별 항목 · odii도 언어별 테마)
  useEffect(() => {
    let alive = true;
    setInfo(null);
    getSpotDetail(venue.id, lang).then((r) => {
      if (alive) setInfo(r);
    });
    return () => {
      alive = false;
    };
  }, [venue.id, lang]);

  // 시퀀스: 다음 프레임 center → 520ms 후 open(도킹 560ms / 시트 크로스페이드)
  useEffect(() => {
    if (still) return undefined;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setPhase('center'));
    });
    later(() => setPhase('open'), CENTER_MS + 40);
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [still]);

  useEffect(() => {
    rootRef.current?.focus();
  }, []);

  const close = useCallback(() => {
    if (still) {
      onClose();
      return;
    }
    setPhase('closing');
    later(onClose, CENTER_MS + 40);
  }, [still, onClose]);

  // Escape · 캡처 단계 + stopPropagation — StepStage(버블 단계)의 '뒤로 1스텝' 발화 차단
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      close();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [close]);

  // FLIP 지오메트리 · 원본 rect 기준 translate+scale 목표값(명세 수식)
  const geo = useMemo(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const { width: w, height: h } = originRect;
    const cx = originRect.left + w / 2;
    const cy = originRect.top + h / 2;
    return {
      center: { x: vw / 2 - cx, y: vh / 2 - cy, s: Math.min((vw * 0.62) / w, (vh * 0.82) / h) },
      dock: { x: vw * 0.25 - cx, y: vh / 2 - cy, s: Math.min((vw * 0.34) / w, (vh * 0.8) / h) },
    };
  }, [originRect]);

  const target =
    phase === 'center' || (phase === 'open' && !isDesktop)
      ? geo.center
      : phase === 'open'
        ? geo.dock
        : null; // enter·closing = 원위치
  const cardTransform = target
    ? `translate(${target.x}px, ${target.y}px) scale(${target.s})`
    : 'translate(0px, 0px) scale(1)';
  const scrimOn = phase === 'center' || phase === 'open';

  const handleSelect = () => {
    if (onToggle()) close();
    else setCapFull(true); // 정원 초과 거절(§9.4 자동 해제 금지) — 열림 유지 + 사유 고지
  };

  // [V5-3] kind 'kto' 본문 = 공사 원문 · 로딩(스켈레톤) / 실패(안내) / 소개 · 이용 안내 · 출처 캡션
  //   장문 본문이라 t() 직접 렌더 허용 영역(PATTERNS §1)
  const ktoBody = () => {
    if (!info) {
      return (
        <Block order={1} still={still} className="flex flex-col gap-12">
          <p role="status" className="text-small font-medium text-inkSec">
            {t('gts.detail.loading')}
          </p>
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-1/2" />
        </Block>
      );
    }
    if (!info.detail) {
      return (
        <Block order={1} still={still}>
          <p role="status" className="text-body text-inkSec">
            {t('gts.detail.error')}
          </p>
        </Block>
      );
    }
    const common = info.detail.common ?? {};
    const about = ktoText(common.overview);
    const rows = ktoInfo(common, info.detail.intro ?? {});
    const href = ktoHref(common.homepage);
    return (
      <>
        {about && (
          <Block order={1} still={still} className="flex flex-col gap-12">
            <LangSwap k="gts.detail.about" as="h3" className="text-h3 font-semibold" />
            <p className="whitespace-pre-line text-body">{about}</p>
          </Block>
        )}
        {(rows.length > 0 || href) && (
          <Block order={2} still={still} className="flex flex-col gap-12">
            <LangSwap k="gts.detail.info" as="h3" className="text-h3 font-semibold" />
            {rows.map(([key, value]) => (
              <InfoRow key={key} labelKey={`gts.detail.${key}`}>
                {value}
              </InfoRow>
            ))}
            {href && (
              <InfoRow labelKey="gts.detail.homepage">
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all font-semibold text-primary underline underline-offset-2"
                >
                  {href}
                </a>
              </InfoRow>
            )}
          </Block>
        )}
        <Block order={3} still={still}>
          <LangSwap k="gts.detail.source" className="text-caption font-medium text-inkMeta" />
        </Block>
      </>
    );
  };

  // kind 'venue' 본문 = 기존 스토리·정보 블록 · [V13] 신규 실장소는 인라인 story(2문장) + link(주소/시간 미제공이라 info 없음)
  const venueBody = () =>
    local?.story ? (
      <Block order={1} still={still} className="flex flex-col gap-12">
        <LangSwap k="venues.detail.story" as="h3" className="text-h3 font-semibold" />
        <TriText text={local.story} className="text-body" />
        {local.link && (
          <a
            href={local.link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit text-small font-semibold text-primary underline underline-offset-2"
          >
            {t('venues.detail.viewOnline')}
          </a>
        )}
      </Block>
    ) : d ? (
      <>
        <Block order={1} still={still} className="flex flex-col gap-12">
          <LangSwap k="venues.detail.story" as="h3" className="text-h3 font-semibold" />
          {Array.from({ length: d.paragraphs }, (_, i) => (
            <LangSwap key={`p${i + 1}`} k={`${keyBase}.p${i + 1}`} as="p" className="text-body" />
          ))}
        </Block>
        <Block order={2} still={still} className="flex flex-col gap-12">
          <LangSwap k="venues.detail.infoTitle" as="h3" className="text-h3 font-semibold" />
          {['address', 'hours', 'price', 'tip'].map((f) => (
            <div key={f} className="grid grid-cols-[96px_1fr] gap-12">
              <LangSwap k={`venues.detail.${f}`} className="text-small font-semibold" />
              <LangSwap k={`${keyBase}.${f}`} className="text-small font-medium text-inkSec" />
            </div>
          ))}
        </Block>
      </>
    ) : (
      // 목업 공통 상세 · storeInfo·guestReviews 미표기(문서 규칙)
      <Block order={1} still={still}>
        <LangSwap k={`${keyBase}.body`} as="p" className="text-body" />
      </Block>
    );

  // [V5-3] odii 오디오 해설(두 kind 공통) · 첫 이야기 · 음원 없으면(en 다수) 원고만
  //   [P3-A] 서버가 장소명 완전일치 테마만 붙인다 → 없으면 블록 자체 비렌더(테마명 병기로 다른 장소 해설을 설명하지 않는다)
  const story = info?.audio?.stories?.[0];
  const audioBlock = story ? (
    <Block order={4} still={still} className="flex flex-col gap-12">
      <LangSwap k="gts.detail.audio" as="h3" className="text-h3 font-semibold" />
      <p className="text-body font-semibold">{story.audioTitle}</p>
      {story.audioUrl && (
        <audio controls preload="none" src={story.audioUrl} aria-label={story.audioTitle} className="w-full" />
      )}
      <p className="whitespace-pre-line text-body">{ktoText(story.script)}</p>
      <LangSwap k="gts.detail.audioBy" className="text-caption font-medium text-inkMeta" />
    </Block>
  ) : null;

  // 상단 블록(이름 · 한 줄 소개 · K배지·집중률 · 추천 사유) → 본문(kind별) → 오디오 해설 · 순서 고정
  const blocks = (pad) => (
    <div className={`flex flex-col gap-32 ${pad}`}>
      <Block order={0} still={still} className="flex flex-col gap-8">
        <TriText text={venue.name} className="font-display text-h2 font-bold tracking-display" />
        {isKto || local?.story ? (
          venue.oneLine?.en && <TriText text={venue.oneLine} className="text-small font-medium text-inkSec" />
        ) : (
          <LangSwap k={`${keyBase}.hero`} className="text-small font-medium text-inkSec" />
        )}
        {/* [V5-3] K배지(SOURCE 조건 충족분만) · 집중률 Chip(band 있을 때만) · 둘 다 없으면 빈 행 */}
        <div className="flex flex-wrap items-center gap-8">
          <KBadge spot={venue} />
          <CongestionChip band={venue.congestionBand} />
        </div>
        {/* 추천 사유 · LLM 문장(제출 언어) 우선 → 없으면 사전 폴백(quiz.reason.*) */}
        {venue.reason ? (
          <p className="text-small text-inkSec">{venue.reason}</p>
        ) : (
          venue.reasonKey && <LangSwap k={venue.reasonKey} as="p" className="text-small text-inkSec" />
        )}
      </Block>
      {isKto ? ktoBody() : venueBody()}
      {audioBlock}
    </div>
  );

  // 블록 ⑤ 하단 고정 CTA — 패널 선택 ↔ 그리드 선택 동기(성공 시 닫기)
  const cta = (pad, fullWidth) => (
    <Block order={4} still={still} className={`flex flex-col gap-8 bg-white ${pad}`}>
      <div aria-live="polite">
        {/* [V5-3] 정원 초과 안내 = ink(흰 면 위 spice 텍스트 약 3.4:1 · AA 미달) */}
        {capFull && <LangSwap k="gts.build.capFull" className="text-caption font-semibold text-ink" />}
      </div>
      <span className={fullWidth ? 'grid' : 'flex'}>
        <Button variant={isSelected ? 'secondary' : 'primary'} onClick={handleSelect}>
          <LangSwap k={isSelected ? 'venues.detail.selected' : 'venues.detail.select'} />
        </Button>
      </span>
    </Block>
  );

  // [V20] 히어로 이미지 배너 · 상단 꽉 채움(object-cover) + 하단 그라데이션 · 이름은 아래 블록에서 1회 표기.
  //   [V5-3] 후보 체인 소진/없음이면 null → 히어로 생략(텍스트만).
  const heroBanner = (heightClass) =>
    hasImage ? (
      <div className={`relative w-full shrink-0 overflow-hidden ${heightClass}`}>
        <img
          src={imgSrc}
          alt={venue.name.en}
          loading="lazy"
          onError={failImg(imgAt)}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
      </div>
    ) : null;

  const closeBtn = (extraClass, style) => (
    <button
      type="button"
      aria-label={t('venues.detail.close')}
      title={t('venues.detail.close')}
      onClick={close}
      className={`pressable inline-flex h-44 w-44 items-center justify-center rounded-pill ${extraClass}`}
      style={style}
    >
      <X size={20} aria-hidden="true" />
    </button>
  );

  return createPortal(
    <div
      ref={rootRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={venue.name[lang] ?? venue.name.en}
      className="fixed inset-0 z-sheet"
      onKeyDown={(e) => {
        if (e.key === 'Tab') trapTab(e, rootRef.current);
      }}
    >
      {/* 스크림 opacity 0→1 520ms(명세) · 클릭 = 닫기 */}
      <div
        aria-hidden="true"
        onClick={close}
        className="absolute inset-0"
        style={{
          background: colors.scrim,
          opacity: scrimOn ? 1 : 0,
          transition: still ? 'none' : `opacity ${CENTER_MS}ms ${EASE}`,
        }}
      />

      {/* 승격 카드 · 기준 지오메트리는 정적, 이동은 transform 만(FLIP) */}
      <div
        aria-hidden="true"
        className={`overflow-hidden rounded-lg shadow-lg ${hasImage ? 'bg-ink' : 'bg-surface'}`}
        style={{
          position: 'fixed',
          left: originRect.left,
          top: originRect.top,
          width: originRect.width,
          height: originRect.height,
          transform: cardTransform,
          opacity: !isDesktop && phase === 'open' ? 0 : 1, // 모바일: 시트 크로스페이드
          transition: still
            ? 'none'
            : `transform ${phase === 'open' && isDesktop ? DOCK_MS : CENTER_MS}ms ${EASE}, opacity 360ms ${motion.easeOut}`,
        }}
      >
        {/* [V20] 승격 카드도 앞면과 동일 이미지(FLIP 연속성) · 없으면 surface+이름 */}
        {hasImage ? (
          <>
            <img src={imgSrc} alt="" loading="lazy" onError={failImg(imgAt)} className="absolute inset-0 h-full w-full object-cover" />
            {/* [V5-3] 가운데 흰 이름 · 균일 ink 60%(흰 사진 최악 기준 흰 글자 4.5:1) */}
            <span aria-hidden="true" className="absolute inset-0 bg-ink/60" />
            <div className="absolute inset-0 flex items-center justify-center p-16">
              <TriText text={venue.name} className="text-center font-display text-body font-bold text-white" />
            </div>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center p-16">
            <TriText text={venue.name} className="text-center font-display text-body font-bold" />
          </div>
        )}
      </div>

      {/* 데스크탑 · 우측 상세 패널(폭 50% · radius 좌측만 xl · shadow.lg · 내부 스크롤) */}
      {isDesktop && (phase === 'open' || phase === 'closing') && (
        <div
          className="absolute inset-y-0 right-0 flex w-1/2 flex-col rounded-l-xl bg-white shadow-lg"
          style={
            phase === 'closing'
              ? { opacity: 0, transition: still ? 'none' : `opacity 200ms ${motion.easeOut}` }
              : undefined
          }
        >
          <div className="absolute right-16 top-16 z-content">
            {closeBtn('bg-white text-inkSec shadow-sm hover:text-ink')}
          </div>
          {/* [V20] 상단 히어로 이미지(있을 때만) → 아래 상단 블록/본문/오디오. 없으면 히어로 생략(텍스트만) */}
          <div className="flex-1 overflow-y-auto scroll-quiet">
            {heroBanner('h-[240px]')}
            {blocks(`px-32 pb-24 lg:px-40 ${hasImage ? 'pt-24' : 'pt-40'}`)}
          </div>
          {cta('px-32 pb-24 pt-12 lg:px-40', false)}
        </div>
      )}

      {/* 모바일 · 풀스크린 시트(fixed inset-0 + 내부 스크롤 · 40dvh 면 · safe-area · 닫기 상시) */}
      {!isDesktop && (phase === 'open' || phase === 'closing') && (
        <div
          className="absolute inset-0 flex flex-col bg-white"
          style={
            phase === 'closing'
              ? { opacity: 0, transition: still ? 'none' : `opacity 360ms ${motion.easeOut}` }
              : still
                ? undefined
                : { animation: `bh-venue-fade 360ms ${motion.easeOut} both` }
          }
        >
          {/* [V20] 상단 히어로 이미지(있을 때만 40dvh) → 아래 상단 블록/본문/오디오. 없으면 히어로 생략(텍스트만) */}
          <div className="flex-1 overflow-y-auto scroll-quiet">
            {heroBanner('h-[40dvh]')}
            {blocks('px-16 py-24')}
          </div>
          {/* §18.3 safe-area — CTA 바 하단 여백 */}
          <div style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>{cta('px-16 pt-12', true)}</div>
          <div className="absolute right-16" style={{ top: 'max(16px, env(safe-area-inset-top))' }}>
            {closeBtn('bg-white text-inkSec shadow-md hover:text-ink')}
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}
