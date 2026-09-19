// 티켓 · IA §2.7 + §10.7 + PATTERNS §43 (존 C5 개편).
// GTS 모드(§43): lg+ 2컬럼 — 좌 = 예약 상세(예약번호 / 일정 타임라인 §28 문법 / 인원·차량 /
//   하차 지점 원문 / 결제 수단 / 환불 규정 요약 = legal.terms §3 키 재사용 / 이용 안내 3줄),
//   우 = 티켓 카드 sticky top-24 · 폭 320px(1/3 축소). 티켓 카드 = primary 단색 면 + white
//   텍스트 + shadow.md · 보더 0 · navy 폐지 · 코드 Kanit Bold · GTS 일정 요약.
// "이미지 저장" = §7 canvas 재사용하되 navigator.share 경유 완전 제거 → toBlob →
//   a[download="gts-ticket-{code}.png"] 즉시 다운로드(Download 아이콘).
// 스탬프: 티켓 진입 시 1회 재생(신규 예약 직후만 · 재방문 무재생) — sessionStorage 금지,
//   모듈 레벨 in-memory Set. 구 라인 예약 티켓 분기는 보존(§43).
// 미존재 bookingId는 EmptyState 렌더(라우트 이동 아님 · ROUTES §3).
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Download } from 'lucide-react';
import { getBooking, getLine, getMeetingPoints, getStops } from '../data/api';
import { getGtsBooking } from '../data/gts/api';
import { getSpots } from '../data/gts/ktoApi';
import { resolveSpot, toSpot } from '../data/gts/spots';
import { venues } from '../data/gts/venues';
import SuccessStamp from '../components/booking/SuccessStamp';
import ItineraryMap from '../components/gts/ItineraryMap';
import TriText from '../components/gts/TriText';
import VisitTimeline from '../components/gts/VisitTimeline';
import { payMethodLabel } from '../components/pay/payMethods';
// stories 데이터 · api.js에 접근자가 없어 직접 import(질문 목록 보고, 완료 보고 §5)
import stories from '../data/stories';
import { colors, fonts, lineColors } from '../tokens';
import Container from '../components/layout/Container';
import Button from '../components/ui/Button';
import Money from '../components/ui/Money'; // [V12] 통화 환산 표시
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton'; // [V5-3] 공사 id 해석 전 지도 자리
import { LoadingLogoCenter } from '../components/ui/LoadingLogo'; // [V13] 로딩 로고
import { useLang } from '../i18n/LangContext';
import LangSwap from '../i18n/LangSwap';

// 라인 컬러 정적 클래스 매핑(토큰 클래스만) · 구 라인 티켓 분기 전용
const STRIPE = {
  potato: 'bg-yellow',
  dakgalbi: 'bg-spice',
  lake: 'bg-primary',
};

// §43 스탬프 1회 재생 · in-memory(웹스토리지 금지) — 세션 내 예약별 최초 진입만 기록
const stampPlayed = new Set();
// 스탬프 연출 총 유지 시간 · 드롭(durSheet 360ms) + 정착 여유(명세 밖 결정 · 완료 보고 참조)
const STAMP_HOLD_MS = 1400;

// 티켓 카드 → PNG · DOM 캡처 라이브러리 금지, canvas 직접 렌더(PATTERNS §7).
// 색은 전부 tokens(colors/lineColors)에서만. 숫자는 캔버스 드로잉 좌표(레이아웃 아님).
function drawTicketPng(line, booking) {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = colors.navy; // 구 라인 티켓 분기 보존 · navy 면(§43 primary 개편은 GTS 한정)
  ctx.fillRect(0, 0, 1200, 630);
  ctx.fillStyle = lineColors[line.id];
  ctx.fillRect(0, 0, 1200, 24); // 라인 컬러 스트라이프
  ctx.fillStyle = colors.bg; // 어두운 면 위 흰 텍스트(토큰 bg=순백)
  ctx.font = `600 40px ${fonts.display}`;
  ctx.fillText('K-ROUTE', 80, 140);
  ctx.font = `500 44px ${fonts.display}`;
  ctx.fillText(line.name_en, 80, 220);
  ctx.font = `700 180px ${fonts.display}`;
  ctx.fillText(booking.code, 80, 420); // 예약 코드 6자 · Kanit Bold 큰 숫자
  ctx.font = `400 44px ${fonts.display}`;
  ctx.fillText(`${booking.date} · ${booking.time}`, 80, 520);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

// §43 GTS 티켓 canvas · primary 단색 면 + white 텍스트 + 코드 Kanit Bold + 일정 요약
function drawGtsTicketPng(gts, entries) {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = colors.primary; // §43 primary 단색 면(navy 폐지 · 보더 0)
  ctx.fillRect(0, 0, 1200, 630);
  ctx.fillStyle = colors.bg;
  ctx.font = `600 40px ${fonts.display}`;
  ctx.fillText('K-ROUTE', 80, 120);
  ctx.font = `700 180px ${fonts.display}`;
  ctx.fillText(gts.code, 80, 320); // 코드 Kanit Bold(§43)
  // [V3] 여행 날짜 관통 표기
  if (gts.travelDate) {
    ctx.font = `500 40px ${fonts.display}`;
    ctx.fillText(gts.travelDate, 80, 384);
  }
  ctx.font = `400 36px ${fonts.display}`;
  entries.slice(0, 4).forEach((venue, i) => {
    ctx.fillText(`${i + 1}. ${venue.name.en}`, 80, 440 + i * 48); // GTS 일정 요약(§43)
  });
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

// §43 다운로드 직행 · navigator.share 경유 완전 제거 — toBlob → a[download] 즉시 저장
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}

function TicketRow({ labelKey, children }) {
  return (
    <div className="flex flex-col gap-4">
      <LangSwap
        k={labelKey}
        as="dt"
        className="text-caption font-medium uppercase tracking-eyebrow text-white"
      />
      <dd className="text-body font-semibold text-white">{children}</dd>
    </div>
  );
}

// 좌측 상세 패널 행(§43) · checkout Row 문법 준용
function DetailRow({ labelKey, children }) {
  return (
    <div className="flex items-baseline justify-between gap-16 py-12">
      <LangSwap
        k={labelKey}
        as="dt"
        className="shrink-0 text-caption font-medium uppercase tracking-eyebrow text-inkMeta"
      />
      <dd className="flex min-w-0 items-baseline justify-end gap-8 text-right text-body">
        {children}
      </dd>
    </div>
  );
}

// §43 GTS 티켓 · lg+ 2컬럼(좌 상세 / 우 sticky 320px 카드) — max-w-dialog 페이지 래퍼 해소(§10.4)
// [V7] 구 예약 호환 · [V6] 막국수 중복 정리로 제거된 구 id → 유지 id 매핑(구 티켓 3곳 전부 표시)
const LEGACY_VENUE_ID = { 'makguksu-museum': 'chuncheon-makguksu-museum' };

function GtsTicket({ gts }) {
  // [V5-3] K-Route 코스는 공사 contentid를 담는다 → venues.js에 없는 id가 있으면 하이브리드 풀(/api/kto/spots)로 해석
  //   (티켓은 /gts 밖이라 GtsContext가 초기화된 상태 · 구 예약처럼 venue id만이면 호출 없이 기존과 동일)
  const [pool, setPool] = useState(null); // null = 조회 전
  const needsPool = gts.itinerary.some((id) => !venues.some((v) => v.id === (LEGACY_VENUE_ID[id] ?? id)));
  useEffect(() => {
    if (!needsPool) return undefined;
    let alive = true;
    getSpots('en').then((r) => {
      if (alive) setPool((r.items ?? []).map(toSpot));
    });
    return () => {
      alive = false;
    };
  }, [needsPool]);
  // 참조 고정(ItineraryMap은 venues 참조가 바뀌면 지도를 다시 만든다) · 공사 id가 섞인 예약은 풀이 올 때까지 일정 보류
  //   (검증 2026-09-11: venue 2곳이 먼저 1·2번으로 그려진 뒤 공사 스팟이 1번으로 끼어드는 순번 튐 · 풀 실패면 [] → venue만)
  const entries = useMemo(
    () =>
      needsPool && !pool
        ? []
        : gts.itinerary.map((id) => resolveSpot(LEGACY_VENUE_ID[id] ?? id, pool ?? [])).filter(Boolean),
    [gts.itinerary, needsPool, pool],
  );
  // [V7] 장소별 시각 표기 렌더 중단(타임테이블 제거) — 순서·장소명만. 시간 필드 모델은 보존(롤백 대비).
  const payLabel = payMethodLabel(gts.payMethod);

  const save = async () => {
    const blob = await drawGtsTicketPng(gts, entries);
    downloadBlob(blob, `k-route-ticket-${gts.code}.png`); // §43 파일명 계약
  };

  return (
    <Container>
      <div className="flex flex-col gap-32 pb-128 pt-96 lg:pb-64">
        <LangSwap k="ticket.title" as="h1" className="text-h2 font-semibold" />

        {/* §43 명세값: 우측 티켓 컬럼 폭 320px(1/3 축소) — grid 템플릿 인용 */}
        <div className="flex flex-col gap-24 lg:grid lg:grid-cols-[1fr_320px] lg:items-start lg:gap-24">
          {/* 좌 = 예약 상세(§43 순서 고정) */}
          <div className="flex flex-col gap-24">
            <section className="flex flex-col rounded-xl bg-white px-24 py-8 shadow-sm">
              <LangSwap k="gts.ticket.detailsTitle" as="h2" className="pt-16 text-h3 font-semibold" />
              <dl className="flex flex-col divide-y divide-line">
                <DetailRow labelKey="ticket.codeLabel">
                  <span className="font-display font-bold">{gts.code}</span>
                </DetailRow>
                {/* [V3] 여행 날짜 · 예약 저장값 관통 */}
                {gts.travelDate && (
                  <DetailRow labelKey="gts.checkout.dateLabel">
                    <span className="font-display font-semibold">{gts.travelDate}</span>
                  </DetailRow>
                )}
                <DetailRow labelKey="gts.checkout.partyLabel">
                  <span className="font-display font-semibold">{gts.party}</span>
                </DetailRow>
                <DetailRow labelKey="gts.checkout.vehicleLabel">
                  <LangSwap k={`gts.vehicle.${gts.vehicleType}`} className="font-semibold" />
                </DetailRow>
                <DetailRow labelKey="gts.checkout.luggageLabel">
                  <LangSwap
                    k={gts.luggage ? 'gts.checkout.luggageYes' : 'gts.checkout.luggageNo'}
                    className="font-semibold"
                  />
                </DetailRow>
                <DetailRow labelKey="gts.ticket.dropoffLabel">
                  {/* 하차 지점 · 원문 그대로 · [V5] 미입력이면 "Not specified"(3언어) */}
                  {gts.dropoffText ? (
                    <span className="break-words font-semibold">{gts.dropoffText}</span>
                  ) : (
                    <LangSwap k="gts.ticket.dropoffNone" className="font-semibold text-inkMeta" />
                  )}
                </DetailRow>
                {/* [V5] 결제 수단 항상 표기 · 미선택이면 "Not selected" */}
                <DetailRow labelKey="gts.ticket.payMethodLabel">
                  {payLabel ? (
                    <span className="font-semibold">{payLabel}</span>
                  ) : (
                    <LangSwap k="gts.ticket.payNone" className="font-semibold text-inkMeta" />
                  )}
                </DetailRow>
              </dl>
            </section>

            {/* [V3] 동선 미니맵 · 라인 상시 렌더(mockCoords — 어떤 조합에도 그린다) */}
            <div className="relative aspect-video overflow-hidden rounded-xl shadow-sm">
              {/* [V5-3] 일정 해석 전(공사 id 풀 조회 중)은 같은 자리 스켈레톤 · ItineraryMap은 좌표 1개 이상 필요 */}
              {entries.length ? <ItineraryMap venues={entries} /> : <Skeleton className="absolute inset-0" />}
            </div>

            {/* 일정 타임라인 · §28 문법(VisitTimeline 공유) */}
            <section className="flex flex-col gap-12 rounded-xl bg-white p-24 shadow-sm">
              <LangSwap k="gts.ticket.orderTitle" as="h2" className="text-h3 font-semibold" />
              <VisitTimeline
                items={entries.map((venue) => ({
                  id: venue.id,
                  name: venue.name,
                  oneLine: venue.oneLine,
                }))}
              />
            </section>

            {/* 환불 규정 요약 · legal.terms §3 키 재사용(신규 창작 금지 · §43) */}
            <section className="flex flex-col gap-12 rounded-xl bg-white p-24 shadow-sm">
              <LangSwap k="legal.terms.s3h" as="h2" className="text-h3 font-semibold" />
              <LangSwap k="legal.terms.s3" as="p" className="text-small text-inkSec" />
            </section>

            {/* 이용 안내 3줄(신규 키 · §43) */}
            <section className="flex flex-col gap-12 rounded-xl bg-white p-24 shadow-sm">
              <LangSwap k="gts.ticket.guideTitle" as="h2" className="text-h3 font-semibold" />
              <ul className="flex flex-col gap-8">
                {['guide1', 'guide2', 'guide3'].map((key) => (
                  <li key={key} className="flex items-start gap-8">
                    <span aria-hidden="true" className="mt-8 h-4 w-4 shrink-0 rounded-pill bg-primary" />
                    <LangSwap k={`gts.ticket.${key}`} className="text-small text-inkSec" />
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* 우 = 티켓 카드 · primary 단색 면 + white 텍스트 + shadow.md · 보더 0(§43) */}
          <aside className="flex flex-col gap-16 lg:sticky lg:top-24">
            <article className="flex flex-col gap-24 overflow-hidden rounded-lg bg-primary p-24 shadow-md">
              <span className="font-display text-small font-semibold uppercase tracking-eyebrow text-white">
                K-Route
              </span>
              <div className="flex flex-col gap-4">
                <LangSwap
                  k="ticket.codeLabel"
                  as="p"
                  className="text-caption font-medium uppercase tracking-eyebrow text-white"
                />
                {/* 코드 Kanit Bold(§43) */}
                <p className="font-display text-h1 font-bold tracking-display text-white">{gts.code}</p>
                {/* [V3] 여행 날짜 */}
                {gts.travelDate && (
                  <p className="font-display text-small font-semibold text-white">{gts.travelDate}</p>
                )}
              </div>
              {/* GTS 일정 요약(§43 · 라인 없음) */}
              <div className="flex flex-col gap-8">
                <LangSwap
                  k="gts.ticket.orderTitle"
                  as="p"
                  className="text-caption font-medium uppercase tracking-eyebrow text-white"
                />
                <ol className="flex flex-col gap-8">
                  {entries.map((venue, i) => (
                    <li key={venue.id} className="flex items-center gap-12">
                      <span
                        aria-hidden="true"
                        className="flex h-24 w-24 shrink-0 items-center justify-center rounded-pill bg-white font-display text-caption font-bold text-ink"
                      >
                        {i + 1}
                      </span>
                      <TriText text={venue.name} className="min-w-0 text-small font-semibold text-white" />
                    </li>
                  ))}
                </ol>
              </div>
              <div className="flex flex-col gap-16">
                {/* primary 면 위 디바이더 · 면 요소(white)로 표현(무보더 원칙) */}
                <div aria-hidden="true" className="h-px w-full bg-white" />
                {/* [V7] 분리 내역 · 이용권(이름·시간)/짐 보관(있을 때만)/최종 금액 — 구 예약(passType null)은 "Not specified" */}
                <div className="flex flex-col gap-8">
                  <div className="flex items-baseline justify-between gap-12">
                    {gts.passType ? (
                      <LangSwap k={`gts.pass.names.${gts.passType}`} className="text-small font-medium text-white" />
                    ) : (
                      <span className="flex items-baseline gap-8">
                        <LangSwap k="gts.ticket.passLabel" className="text-small font-medium text-white" />
                        <LangSwap k="gts.ticket.passNone" className="text-caption font-medium text-white" />
                      </span>
                    )}
                    {gts.passType && gts.passAmount != null && (
                      <Money
                        krw={gts.passAmount}
                        className="text-right font-display text-small font-semibold text-white"
                        convClassName="text-white/70"
                      />
                    )}
                  </div>
                  {gts.luggageAmount > 0 && (
                    <div className="flex items-baseline justify-between gap-12">
                      <LangSwap k="gts.fare.luggage" className="text-small font-medium text-white" />
                      <Money
                        krw={gts.luggageAmount}
                        className="text-right font-display text-small font-semibold text-white"
                        convClassName="text-white/70"
                      />
                    </div>
                  )}
                  <div className="flex items-baseline justify-between">
                    <LangSwap k="gts.fare.total" className="text-small font-medium text-white" />
                    <Money
                      krw={gts.totalAmount ?? gts.total}
                      className="text-right font-display text-h3 font-bold text-white"
                      convClassName="text-caption font-medium text-white/70"
                    />
                  </div>
                </div>
              </div>
            </article>
            {/* §43 이미지 저장 = 즉시 다운로드(공유 시트 경유 금지) · lg+ 인라인(모바일은 하단 고정 바) */}
            <div className="hidden lg:flex">
              <Button onClick={save}>
                <LangSwap k="gts.ticket.saveCta" />
                <Download size={16} aria-hidden="true" />
              </Button>
            </div>
          </aside>
        </div>
      </div>

      {/* §18.2 모바일 하단 고정 CTA 바 · [V17] Dock 폐지로 bottom-0 + safe-area(구 bottom-80 = Dock 위) */}
      <div
        className="fixed inset-x-0 bottom-0 z-content px-16 pb-[max(12px,env(safe-area-inset-bottom))] md:px-24 lg:hidden"
      >
        <div className="mx-auto max-w-dialog rounded-lg bg-white p-12 shadow-md">
          <Button onClick={save} style={{ width: '100%' }}>
            <LangSwap k="gts.ticket.saveCta" />
            <Download size={16} aria-hidden="true" />
          </Button>
        </div>
      </div>
    </Container>
  );
}

export default function Ticket() {
  const { bookingId } = useParams();
  const [state, setState] = useState({ loading: true, booking: null, line: null, meetingPoint: null, story: null, gts: null });
  const { lang, t } = useLang();
  // v3.2 §8.3.3 빈 이미지 박스 0 · 클립 썸네일 로드 실패 시 박스 비렌더
  const [thumbFailed, setThumbFailed] = useState(false);
  // §43 스탬프 오버레이 · 신규 예약 첫 진입만 1회 재생(in-memory)
  const [stampOn, setStampOn] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      // GTS 예약 우선 조회(§33 별도 목 창구) · 발견 시 GTS 모드
      const gts = await getGtsBooking(bookingId);
      if (gts) {
        if (alive) setState({ loading: false, booking: null, line: null, meetingPoint: null, story: null, gts });
        return;
      }
      const booking = await getBooking(bookingId);
      if (!booking) {
        if (alive) setState({ loading: false, booking: null, line: null, meetingPoint: null, story: null, gts: null });
        return;
      }
      const [line, points, stops] = await Promise.all([
        getLine(booking.lineId),
        getMeetingPoints(),
        getStops(booking.lineId),
      ]);
      const storyId = stops.find((s) => s.story_id)?.story_id ?? null;
      const story = stories.find((s) => s.id === storyId) ?? null;
      if (alive) {
        setState({ loading: false, booking, line, meetingPoint: points[0], story, gts: null });
      }
    })();
    return () => {
      alive = false;
    };
  }, [bookingId]);

  const { loading, booking, line, meetingPoint, story, gts } = state;

  // §43 스탬프 1회 재생 · 세션 내 최초 진입(= 신규 예약 직후)만, 재방문 무재생
  useEffect(() => {
    if (!gts || stampPlayed.has(gts.id)) return undefined;
    stampPlayed.add(gts.id);
    setStampOn(true);
    const tm = setTimeout(() => setStampOn(false), STAMP_HOLD_MS);
    return () => clearTimeout(tm);
  }, [gts]);

  if (loading) {
    return (
      <Container>
        <div className="pb-64 pt-96">
          <LoadingLogoCenter className="min-h-[50vh]" />
        </div>
      </Container>
    );
  }

  // GTS 모드(§43) · 라인 티켓 로직과 분기(기존 로직 보존)
  if (gts) {
    return (
      <>
        <GtsTicket gts={gts} />
        {/* §43 스탬프 드롭 오버레이 · 탭/클릭으로 스킵 가능(사용자 통제 §16.10) */}
        {stampOn && (
          <button
            type="button"
            aria-label={t('common.close')}
            onClick={() => setStampOn(false)}
            className="fixed inset-0 z-dialog grid w-full place-items-center bg-scrim"
          >
            {/* GTS는 라인이 없어 lake(=primary 면) 어댑터 객체로 이니셜 표기(§33 선례) · [V5-18-1] 'K-Route' → 'K' */}
            <SuccessStamp line={{ id: 'lake', name_en: 'K-Route' }} />
          </button>
        )}
      </>
    );
  }

  // 미존재 예약 · EmptyState 렌더(404 라우트 이동 아님, ROUTES §3)
  if (!booking) {
    return (
      <Container>
        {/* PLACEHOLDER · unDraw 단색(빈결과) SVG 저장 대기(PROGRESS 준비물) */}
        <EmptyState
          illustration="empty.svg"
          titleKey="ticket.notFound.title"
          bodyKey="ticket.notFound.body"
          cta={{ labelKey: 'ticket.notFound.cta', to: '/loop' }}
        />
      </Container>
    );
  }

  return (
    <Container>
      {/* 구 라인 예약 티켓 분기 · §43 계약에 따라 보존(신규 생성 경로 없음 · 레이아웃 유지) */}
      <div className="mx-auto flex w-full max-w-dialog flex-col gap-32 pb-64 pt-96">
        <LangSwap k="ticket.title" as="h1" className="text-h2 font-semibold" />

        {/* navy 티켓 카드 · 강대비 면(DESIGN §2) — 구 분기 한정 잔존 */}
        <article className="overflow-hidden rounded-lg bg-navy">
          <div aria-hidden="true" className={`h-8 ${STRIPE[line.id]}`} />
          <div className="flex flex-col gap-24 p-24 lg:p-32">
            <div className="flex items-baseline justify-between gap-16">
              <span className="font-display text-small font-semibold uppercase tracking-eyebrow text-white">
                K-Route
              </span>
              {/* 라인명 겹침(시프트 0) · 데이터 필드(th 없음)는 en 폴백: lang!=='ko'(v3.1 규칙) */}
              <span className="grid text-small font-medium text-white">
                <span aria-hidden={lang === 'ko'} className={`col-start-1 row-start-1 truncate ${lang !== 'ko' ? '' : 'invisible'}`}>{line.name_en}</span>
                <span aria-hidden={lang !== 'ko'} className={`col-start-1 row-start-1 truncate ${lang === 'ko' ? '' : 'invisible'}`}>{line.name_ko}</span>
              </span>
            </div>
            <div className="flex flex-col gap-4">
              <LangSwap
                k="ticket.codeLabel"
                as="p"
                className="text-caption font-medium uppercase tracking-eyebrow text-white"
              />
              {/* 예약 코드 6자 · Kanit Bold 큰 숫자(IA §2.7) */}
              <p className="font-display text-h1 font-bold tracking-display text-white">
                {booking.code}
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-16">
              <TicketRow labelKey="booking.summary.departure">
                <span className="font-display">
                  {booking.date} · {booking.time}
                </span>
              </TicketRow>
              <TicketRow labelKey="booking.summary.meeting">
                <span className="flex flex-wrap items-baseline gap-8">
                  {/* 미팅포인트명 겹침(시프트 0) · 데이터 필드는 en 폴백: lang!=='ko'(v3.1 규칙) */}
                  <span className="grid">
                    <span aria-hidden={lang === 'ko'} className={`col-start-1 row-start-1 ${lang !== 'ko' ? '' : 'invisible'}`}>{meetingPoint.name_en}</span>
                    <span aria-hidden={lang !== 'ko'} className={`col-start-1 row-start-1 ${lang === 'ko' ? '' : 'invisible'}`}>{meetingPoint.name_ko}</span>
                  </span>
                  <Link
                    to="/loop"
                    className="text-small font-medium text-white underline underline-offset-4"
                  >
                    <LangSwap k="ticket.viewMap" />
                  </Link>
                </span>
              </TicketRow>
              <TicketRow labelKey="booking.summary.party">
                <span className="flex items-baseline gap-8">
                  <LangSwap k="booking.adults" className="text-caption font-medium" />
                  <span className="font-display">{booking.adults}</span>
                  <LangSwap k="booking.children" className="text-caption font-medium" />
                  <span className="font-display">{booking.children}</span>
                </span>
              </TicketRow>
              <TicketRow labelKey="booking.summary.host">
                {/* 호스트 이름 PLACEHOLDER · 확정 전(lines.js) */}
                {line.host_name}
              </TicketRow>
            </dl>
            {/* navy 위 수평 디바이더 · v3.1 무보더(border 속성 미사용, 면 요소로 표현).
                line 토큰은 잉크 계열이라 navy 위 시인 불가 · white 사용 */}
            <div className="flex flex-col gap-16">
              <div aria-hidden="true" className="h-px w-full bg-white" />
              <div className="flex items-baseline justify-between">
                <LangSwap k="booking.total" className="text-small font-medium text-white" />
                <span className="font-display text-h3 font-bold text-white">
                  {'₩'}
                  {booking.total.toLocaleString('en-US')}
                </span>
              </div>
            </div>
          </div>
        </article>

        {/* §43 공유 시트 경유 제거 · 즉시 다운로드로 통일(구 분기 포함) */}
        <Button
          onClick={async () => {
            const blob = await drawTicketPng(line, booking);
            downloadBlob(blob, `k-route-ticket-${booking.code}.png`);
          }}
        >
          <LangSwap k="gts.ticket.saveCta" />
          <Download size={16} aria-hidden="true" />
        </Button>

        {/* 차내 클립 1개 · "What you'll watch on board"(IA §2.7) */}
        {story && (
          <section className="flex flex-col gap-12">
            <LangSwap k="ticket.watch" as="h2" className="text-h3 font-semibold" />
            {/* v3.1 무보더 · 카드 shadow.sm + radius 카드 스케일 lg(DESIGN §7) */}
            <div className="flex items-center gap-16 rounded-lg bg-white p-16 shadow-sm">
              {/* 썸네일 없음·로드 실패 시 비렌더(빈 이미지 박스 0 · §8.3.3) */}
              {story.thumb && !thumbFailed && (
                <img
                  src={story.thumb}
                  alt=""
                  loading="lazy"
                  onError={() => setThumbFailed(true)}
                  className="h-64 w-96 shrink-0 rounded-md bg-surface object-cover"
                />
              )}
              <div className="flex min-w-0 flex-col gap-4">
                <p className="truncate text-body font-semibold">
                  {lang === 'ko' ? story.title_ko : story.title_en}
                </p>
                <p className="line-clamp-2 text-small font-medium text-inkSec">
                  {lang === 'ko' ? story.summary_ko : story.summary_en}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* CJM Revisit · 남은 라인이 곧 재방문 이유(IA §2.7) · radius 카드 스케일 lg(v3.1) */}
        <div className="flex flex-col items-center gap-12 rounded-lg bg-surface p-24 text-center">
          <LangSwap k="ticket.linesLeft" as="p" className="text-body font-semibold" />
          <Button variant="ghost" as={Link} to="/loop">
            <LangSwap k="ticket.linesLeftCta" />
          </Button>
        </div>
      </div>
    </Container>
  );
}
