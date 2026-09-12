// [V10] 프로필 · /profile(로그인 필수 · App에서 RequireAuth로 감쌈).
//   섹션: ①내 정보(사진·이름·이메일) ②예약 내역 ③예약 취소(48h 분기 · [V7] 환불 문구 재사용)
//         ④내 여정(동선 미니맵) ⑤비밀번호 변경(구글 계정은 숨김) ⑥언어 설정.
//   사진 = Vercel Blob 서버 경유 업로드(AuthContext.uploadAvatar) · 5MB·이미지 선검증 후 헤더 아바타 반영.
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../i18n/LangContext';
import LangSwap from '../i18n/LangSwap';
import { pwValid } from '../lib/authRules';
import { cancelGtsBooking, getMyBookings } from '../data/gts/api';
import { venues } from '../data/gts/venues';
import ItineraryMap from '../components/gts/ItineraryMap';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Money from '../components/ui/Money'; // [V12] 통화 환산 표시
import Modal from '../components/ui/Modal';
import PwChecklist from '../components/ui/PwChecklist';
import Skeleton from '../components/ui/Skeleton';
import Container from '../components/layout/Container';

// [V6] 막국수 중복 정리로 제거된 구 id → 유지 id(구 예약 동선도 그려지게) · Ticket과 동일 매핑
const LEGACY_VENUE_ID = { 'makguksu-museum': 'chuncheon-makguksu-museum' };
const resolveVenues = (itinerary) =>
  (itinerary || []).map((id) => venues.find((v) => v.id === (LEGACY_VENUE_ID[id] ?? id))).filter(Boolean);

const LANGS = ['en', 'ko', 'th'];

// 섹션 카드 공통(제목 + 본문)
function Card({ titleKey, children }) {
  return (
    <section className="flex flex-col gap-16 rounded-xl bg-white p-24 shadow-sm">
      <LangSwap k={titleKey} as="h2" className="text-h3 font-semibold" />
      {children}
    </section>
  );
}

// 라벨 위 입력(프로필 폼 공용) · placeholder = `${labelKey}Ph`
function ProfileField({ id, labelKey, type = 'text', value, onChange, autoComplete }) {
  const { t } = useLang();
  return (
    <label htmlFor={id} className="flex flex-col gap-4 text-left">
      <LangSwap k={labelKey} as="span" className="text-caption font-semibold uppercase tracking-eyebrow text-inkMeta" />
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={t(`${labelKey}Ph`)}
        className="h-48 rounded-md bg-surface px-16 text-body focus:ring-2 focus:ring-primary"
      />
    </label>
  );
}

function Row({ labelKey, children }) {
  return (
    <div className="flex items-baseline justify-between gap-12">
      <LangSwap k={labelKey} className="text-caption font-medium uppercase tracking-eyebrow text-inkMeta" />
      <span className="text-small font-semibold">{children}</span>
    </div>
  );
}

// ── ① 내 정보 + 사진 업로드 ──
function InfoSection({ user }) {
  const { uploadAvatar } = useAuth();
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [errKey, setErrKey] = useState(null);

  const onPick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // 같은 파일 재선택 허용
    if (!file) return;
    setErrKey(null);
    setBusy(true);
    const res = await uploadAvatar(file);
    setBusy(false);
    if (!res.ok) {
      setErrKey(
        res.error === 'too_large'
          ? 'profile.avatarErrSize'
          : res.error === 'unsupported_type'
            ? 'profile.avatarErrType'
            : 'profile.avatarErrUpload',
      );
    }
  };

  return (
    <Card titleKey="profile.infoTitle">
      <div className="flex flex-col items-start gap-24 sm:flex-row sm:items-center">
        <Avatar user={user} size={96} />
        <div className="flex flex-col gap-8">
          <Row labelKey="profile.nameLabel">{user.name}</Row>
          <Row labelKey={user.email ? 'profile.emailLabel' : 'profile.idLabel'}>
            {user.email || `@${user.username}`}
          </Row>
          <div className="flex flex-col items-start gap-4 pt-4">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
            <Button variant="secondary" onClick={() => fileRef.current?.click()} disabled={busy} aria-busy={busy}>
              <LangSwap k={busy ? 'profile.avatarUploading' : 'profile.avatarCta'} />
            </Button>
            <LangSwap k="profile.avatarHint" className="text-caption font-medium text-inkMeta" />
            {errKey && <LangSwap k={errKey} as="p" role="alert" className="text-small font-medium text-spice" />}
          </div>
        </div>
      </div>
    </Card>
  );
}

// ── ②③ 예약 카드(+ 취소 확인 모달) ──
function ReservationCard({ b, onCancelled }) {
  const { t } = useLang();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errKey, setErrKey] = useState(null);
  const cancelled = b.status === 'cancelled';
  const amount = b.totalAmount ?? b.total ?? 0;

  const doCancel = async () => {
    setBusy(true);
    setErrKey(null);
    const res = await cancelGtsBooking(b.code);
    setBusy(false);
    if (res.ok) {
      setConfirmOpen(false);
      onCancelled(b.code);
    } else {
      setErrKey(res.error === 'too_late' ? 'profile.cancelTooLate' : 'profile.cancelError');
    }
  };

  return (
    <article className="flex flex-col gap-12 rounded-lg bg-surface p-16">
      <div className="flex items-start justify-between gap-12">
        <div className="flex flex-col gap-4">
          <span className="font-display text-body font-bold">{b.code}</span>
          <span className="text-small text-inkSec">{b.travelDate || t('profile.dateNone')}</span>
        </div>
        <span
          className={`rounded-pill px-12 py-4 text-caption font-semibold ${
            cancelled ? 'bg-line text-inkMeta' : 'bg-green/10 text-green'
          }`}
        >
          <LangSwap k={cancelled ? 'profile.statusCancelled' : 'profile.statusConfirmed'} />
        </span>
      </div>
      <dl className="flex flex-col gap-4">
        <Row labelKey="profile.passLabel">{b.passType ? t(`gts.pass.names.${b.passType}`) : '—'}</Row>
        <Row labelKey="profile.amountLabel"><Money krw={amount} /></Row>
      </dl>
      <div className="flex flex-wrap items-center gap-12">
        <Button as={Link} to={`/ticket/${b.code}`} variant="secondary">
          <LangSwap k="profile.ticketCta" />
        </Button>
        {!cancelled &&
          (b.cancellable ? (
            <Button variant="ghost" onClick={() => setConfirmOpen(true)}>
              <LangSwap k="profile.cancelCta" />
            </Button>
          ) : (
            <span className="text-caption font-medium text-inkMeta">
              <LangSwap k="profile.cancelLocked" />
            </span>
          ))}
      </div>

      {/* 취소 확인 · [V7] 환불 규정 문구 재사용(신규 창작 금지) */}
      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <div className="flex flex-col gap-16">
          <LangSwap k="profile.cancelConfirmTitle" as="h2" className="text-h3 font-semibold" />
          <div className="flex flex-col gap-8 rounded-lg bg-surface p-16">
            <LangSwap k="gts.checkout.refundTitle" as="h3" className="text-small font-semibold" />
            <LangSwap k="gts.checkout.refundBody" as="p" className="text-small text-inkSec" />
          </div>
          {errKey && <LangSwap k={errKey} as="p" role="alert" className="text-small font-medium text-spice" />}
          <div className="flex justify-end gap-12">
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              <LangSwap k="profile.cancelKeep" />
            </Button>
            <Button onClick={doCancel} disabled={busy} aria-busy={busy}>
              <LangSwap k="profile.cancelConfirm" />
            </Button>
          </div>
        </div>
      </Modal>
    </article>
  );
}

function ReservationsSection({ bookings, onCancelled }) {
  if (bookings === null) {
    return (
      <Card titleKey="profile.reservationsTitle">
        <Skeleton className="h-64 w-full" />
      </Card>
    );
  }
  if (!bookings.length) {
    return (
      <Card titleKey="profile.reservationsTitle">
        <div className="flex flex-col items-start gap-12">
          <LangSwap k="profile.reservationsEmpty" as="p" className="text-small text-inkSec" />
          <Button as={Link} to="/gts" variant="secondary">
            <LangSwap k="profile.reservationsEmptyCta" />
          </Button>
        </div>
      </Card>
    );
  }
  return (
    <Card titleKey="profile.reservationsTitle">
      <div className="flex flex-col gap-16">
        {bookings.map((b) => (
          <ReservationCard key={b.code} b={b} onCancelled={onCancelled} />
        ))}
      </div>
    </Card>
  );
}

// ── ④ 내 여정 미니맵 ──
function JourneysSection({ bookings }) {
  const { t } = useLang();
  const withVenues = bookings
    .map((b) => ({ b, entries: resolveVenues(b.itinerary) }))
    .filter((x) => x.entries.length);
  return (
    <Card titleKey="profile.journeysTitle">
      {withVenues.length === 0 ? (
        <LangSwap k="profile.journeysEmpty" as="p" className="text-small text-inkSec" />
      ) : (
        <div className="grid gap-16 md:grid-cols-2">
          {withVenues.map(({ b, entries }) => (
            <div key={b.code} className="flex flex-col gap-8">
              <span className="text-caption font-semibold text-inkMeta">
                {b.code} · {b.travelDate || t('profile.dateNone')}
              </span>
              <div className="relative aspect-video overflow-hidden rounded-lg shadow-sm">
                <ItineraryMap venues={entries} />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ── ⑤ 비밀번호 변경(구글 계정은 상위에서 숨김) ──
function PasswordSection() {
  const { changePassword } = useAuth();
  const [cur, setCur] = useState('');
  const [nw, setNw] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null); // { ok?: boolean, key }

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!pwValid(nw)) {
      setMsg({ key: 'profile.pwErrRule' });
      return;
    }
    setBusy(true);
    const res = await changePassword(cur, nw);
    setBusy(false);
    if (res.ok) {
      setMsg({ ok: true, key: 'profile.pwSuccess' });
      setCur('');
      setNw('');
    } else {
      setMsg({
        key:
          res.error === 'wrong_current'
            ? 'profile.pwErrWrong'
            : res.error === 'bad_pin'
              ? 'profile.pwErrRule'
              : 'profile.pwErrGeneric',
      });
    }
  };

  return (
    <Card titleKey="profile.pwTitle">
      <form onSubmit={submit} className="flex flex-col gap-16">
        <ProfileField id="pw-cur" labelKey="profile.pwCurrent" type="password" value={cur} onChange={setCur} autoComplete="current-password" />
        <div className="flex flex-col gap-8">
          <ProfileField id="pw-new" labelKey="profile.pwNew" type="password" value={nw} onChange={setNw} autoComplete="new-password" />
          <PwChecklist pin={nw} />
        </div>
        {msg && (
          <LangSwap k={msg.key} className={`text-small font-medium ${msg.ok ? 'text-green' : 'text-spice'}`} />
        )}
        <div className="flex">
          <Button as="button" type="submit" disabled={busy || !pwValid(nw)}>
            <LangSwap k="profile.pwSubmit" />
          </Button>
        </div>
      </form>
    </Card>
  );
}

// ── ⑥ 언어 설정 ──
function LanguageSection() {
  const { lang, setLang, t } = useLang();
  return (
    <Card titleKey="profile.langTitle">
      <div role="group" aria-label={t('common.language')} className="flex items-center gap-8">
        {LANGS.map((code) => (
          <button
            key={code}
            type="button"
            aria-pressed={lang === code}
            onClick={() => setLang(code)}
            className={`inline-flex min-h-44 items-center rounded-pill px-16 text-small font-semibold transition-colors duration-fast ${
              lang === code ? 'bg-primary text-white' : 'bg-surface text-inkSec hover:text-ink'
            }`}
          >
            {t(`common.lang.${code}`)}
          </button>
        ))}
      </div>
    </Card>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState(null); // null = 로딩

  useEffect(() => {
    let alive = true;
    getMyBookings().then((bs) => {
      if (alive) setBookings(bs);
    });
    return () => {
      alive = false;
    };
  }, []);

  const onCancelled = (code) =>
    setBookings((bs) => bs.map((b) => (b.code === code ? { ...b, status: 'cancelled', cancellable: false } : b)));

  if (!user) return null; // RequireAuth가 보장하지만 방어적

  return (
    <Container>
      <div className="mx-auto flex w-full max-w-[760px] flex-col gap-24 pb-128 pt-96 lg:pb-64">
        <LangSwap k="profile.title" as="h1" className="text-h2 font-semibold" />
        <InfoSection user={user} />
        <ReservationsSection bookings={bookings} onCancelled={onCancelled} />
        <JourneysSection bookings={bookings ?? []} />
        {user.hasPassword && <PasswordSection />}
        <LanguageSection />
      </div>
    </Container>
  );
}
