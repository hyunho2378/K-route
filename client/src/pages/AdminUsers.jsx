// [V11] User Management /admin/users — 2차 게이트 통과 후 접근(직접 URL 진입 시 게이트 미통과면 대시보드로).
//   전체 사용자 테이블(이름·이메일·가입일·예약 수·마지막 활동) + 행 클릭 상세(예약 목록·동선 미니맵·journey 타임라인).
//   폴링 10초. 이 페이지의 조회는 서버에서 SELECT만 — journey_events에 아무 것도 쓰지 않는다(지시 [1]).
//   관리자 도구라 영어 단일 하드카피(AdminPage 예외 준용).
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Container from '../components/layout/Container';
import ItineraryMap from '../components/gts/ItineraryMap';
import Skeleton from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';
import NotFound from './NotFound';
import {
  API_BASE,
  useAdminApi,
  resolveVenues,
  fmtSec,
  fmtDateTime,
  payloadSummary,
} from '../lib/adminShared';

// 비로그인·비관리자 = 404 위장(AdminPage와 동일 문법)
function RequireAdmin({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (!user?.isAdmin) return <NotFound />;
  return children;
}

// 2차 게이트 통과 확인 · 미통과(만료 포함)면 대시보드로 되돌림
function TwoFaGate({ children }) {
  const navigate = useNavigate();
  const [ok, setOk] = useState(false);
  useEffect(() => {
    let alive = true;
    fetch(`${API_BASE}/api/admin/2fa/status`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        if (d.verified) setOk(true);
        else navigate('/admin', { replace: true });
      })
      .catch(() => alive && navigate('/admin', { replace: true }));
    return () => {
      alive = false;
    };
  }, [navigate]);
  return ok ? children : null;
}

const money = (n) => (n == null ? '-' : `₩${Number(n).toLocaleString('en-US')}`);

function BookingBlock({ b }) {
  const entries = resolveVenues(b.picks);
  return (
    <div className="flex flex-col gap-8 rounded-lg bg-surface p-16">
      <div className="flex flex-wrap items-baseline justify-between gap-8">
        <span className="font-display text-small font-bold">{b.code}</span>
        <span
          className={`rounded-pill px-8 py-2 text-caption font-semibold ${
            b.status === 'cancelled' ? 'bg-line text-inkMeta' : 'bg-green/10 text-green'
          }`}
        >
          {b.status}
        </span>
      </div>
      <div className="flex flex-wrap gap-x-16 gap-y-2 text-caption text-inkSec">
        <span>{b.travel_date || 'no date'}</span>
        <span>party {b.party}</span>
        <span>{b.pass_type || 'no pass'}</span>
        <span>{money(b.total_amount ?? b.total)}</span>
      </div>
      {/* 선택 동선 미니맵(2곳 이상일 때) */}
      {entries.length >= 2 && (
        <div className="relative aspect-video overflow-hidden rounded-md shadow-sm">
          <ItineraryMap venues={entries} />
        </div>
      )}
      {entries.length > 0 && (
        <p className="text-caption text-inkSec">{entries.map((v) => v.name.en).join(' > ')}</p>
      )}
    </div>
  );
}

function UserDetail({ id }) {
  const { data } = useAdminApi(`/api/admin/users/${id}`, { poll: 10000 });
  // [V5-8] raw 로딩 문구 → 공용 Skeleton(로딩 표면 일원화 · 레이아웃 이동 축소)
  if (!data) return <Skeleton className="h-64 w-full" />;
  const { user, bookings, events } = data;
  return (
    <div className="flex flex-col gap-16">
      <div>
        <p className="font-display text-h3 font-bold">{user.name}</p>
        <p className="text-small text-inkSec">
          {user.email || `@${user.username}`} · joined {user.joined}
        </p>
      </div>
      <section className="flex flex-col gap-8">
        <h3 className="text-caption font-semibold uppercase tracking-eyebrow text-inkMeta">
          Bookings ({bookings.length})
        </h3>
        {bookings.length ? (
          bookings.map((b) => <BookingBlock key={b.code} b={b} />)
        ) : (
          <p className="text-small text-inkSec">No bookings.</p>
        )}
      </section>
      <section className="flex flex-col gap-4">
        <h3 className="text-caption font-semibold uppercase tracking-eyebrow text-inkMeta">
          Journey timeline ({events.length})
        </h3>
        <ol className="flex flex-col divide-y divide-line rounded-lg bg-white shadow-sm">
          {events.map((e) => (
            <li key={e.id} className="flex flex-wrap items-baseline gap-x-12 gap-y-2 px-16 py-8 text-small">
              <span className="font-display text-caption font-semibold text-inkSec">{fmtDateTime(e.created_at)}</span>
              <span className="font-display font-bold text-primary">{e.step}</span>
              <span className="min-w-0 flex-1 text-inkSec">{payloadSummary(e.step, e.payload)}</span>
              <span className="font-display text-caption font-semibold text-inkMeta">+{fmtSec(e.duration_ms)}</span>
            </li>
          ))}
          {!events.length && <p className="px-16 py-16 text-small text-inkSec">No events.</p>}
        </ol>
      </section>
    </div>
  );
}

const COLS = 'grid-cols-[1.2fr_1.6fr_92px_64px_110px]';

function UsersView() {
  const { data, error, status, loadedAt } = useAdminApi('/api/admin/users', { poll: 10000 });
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  // 2차 게이트 만료(403) 감지 시 대시보드로
  useEffect(() => {
    if (status === 403) navigate('/admin', { replace: true });
  }, [status, navigate]);
  const users = data?.users ?? [];

  return (
    <Container>
      <div className="flex flex-col gap-24 pb-64 pt-96">
        <div className="flex flex-wrap items-center justify-between gap-16">
          <div className="flex items-center gap-12">
            <Link to="/admin" className="inline-flex min-h-44 items-center gap-4 text-small font-semibold text-primary">
              <ChevronLeft size={16} aria-hidden="true" /> Dashboard
            </Link>
            <h1 className="font-display text-h1 font-bold tracking-display">User management</h1>
          </div>
          {loadedAt && (
            <p className="text-caption text-inkMeta">
              Updated {loadedAt.toLocaleTimeString('en-GB')} · polls every 10s
            </p>
          )}
        </div>
        {error && <p className="text-small font-medium text-spice">Load failed: {error}</p>}
        <div className="flex flex-col gap-24 lg:grid lg:grid-cols-[1.3fr_1fr] lg:items-start">
          <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
            <div className={`grid min-w-[620px] ${COLS} gap-12 px-16 py-12 text-caption font-semibold uppercase tracking-eyebrow text-inkMeta`}>
              <span>Name</span>
              <span>Email / ID</span>
              <span>Joined</span>
              <span>Books</span>
              <span>Last activity</span>
            </div>
            <div className="flex min-w-[620px] flex-col divide-y divide-line">
              {users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setSelected(u.id)}
                  className={`grid ${COLS} items-center gap-12 px-16 py-8 text-left text-small transition-colors duration-fast hover:bg-surface ${
                    selected === u.id ? 'bg-surface' : ''
                  }`}
                >
                  <span className="min-w-0 truncate font-semibold text-ink">{u.name}</span>
                  {/* [V12] email null 계정은 @username + "ID" 회색 배지 */}
                  <span className="flex min-w-0 items-center gap-8 text-inkSec">
                    {u.email ? (
                      <span className="min-w-0 truncate">{u.email}</span>
                    ) : (
                      <>
                        <span className="min-w-0 truncate">{`@${u.username}`}</span>
                        <span className="shrink-0 rounded-pill bg-line px-8 py-2 text-caption font-semibold text-inkMeta">ID</span>
                      </>
                    )}
                  </span>
                  <span className="font-display text-caption text-inkSec">{u.joined}</span>
                  <span className="font-display font-semibold">{u.booking_count}</span>
                  <span className="font-display text-caption text-inkSec">{fmtDateTime(u.last_at)}</span>
                </button>
              ))}
              {!users.length && <p className="px-16 py-24 text-small text-inkSec">No users.</p>}
            </div>
          </div>
          <div className="rounded-lg bg-white p-16 shadow-sm lg:sticky lg:top-24">
            {selected ? (
              <UserDetail key={selected} id={selected} />
            ) : (
              <p className="text-small text-inkSec">Select a user to see bookings and journey.</p>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}

export default function AdminUsers() {
  return (
    <RequireAdmin>
      <TwoFaGate>
        <UsersView />
      </TwoFaGate>
    </RequireAdmin>
  );
}
