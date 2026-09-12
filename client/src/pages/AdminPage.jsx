// [V1] 관리자 대시보드 /admin — 헤더 링크 없음(직접 URL 진입만).
// 참조 패턴: DAH(RequireAdmin 가드 + 좌 사이드바 AdminLayout · 비관리자 UI 미렌더) +
//   civic(폴링 훅 useApi(path, { poll }) + 수동 reload — WebSocket·SSE 금지 · 15s + 새로고침).
// 비관리자·비로그인 = 404 위장(NotFound 렌더 · 관리자 존재 노출 금지). 서버측은 401/403 이중 차단.
// 문자열: 관리자 내부 도구라 3언어 대상 아님 — 영어 단일 하드카피 허용(지시 [3] 명시 예외).
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, RefreshCw } from 'lucide-react';
import Container from '../components/layout/Container';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { colors, motion } from '../tokens';
import { venues } from '../data/gts/venues';
import NotFound from './NotFound';

// [V6] 예약 picks(venue id) → 이름. 관리자 도구는 영어 단일이라 name.en 사용, 없으면 id 폴백.
const VENUE_NAME = Object.fromEntries(venues.map((v) => [v.id, v.name.en]));
const venueName = (id) => VENUE_NAME[id] ?? id;

// [V6] 표시 순서 · 아래 계정은 목록 맨 아래로(내부·지인 테스터 · 데이터는 그대로 노출 · 요청 반영). 그 외는 서버 최신순.
const DEMOTE_EMAILS = ['hlee10@schools.nyc.gov', 'fudai.t@sgs.tu.ac.th', 'mnx.ts04@gmail.com'];
const isDemoted = (email) => DEMOTE_EMAILS.includes(String(email ?? '').toLowerCase());

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

// civic 방식 폴링 훅 · poll ms 간격 자동 + 수동 reload — 실패 시 마지막 데이터 유지
function useApi(path, { poll } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loadedAt, setLoadedAt] = useState(null);

  const reload = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}${path}`, { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
      setError(null);
      setLoadedAt(new Date());
    } catch (e) {
      setError(e.message);
    }
  }, [path]);

  useEffect(() => {
    reload();
    if (!poll) return undefined;
    const id = setInterval(reload, poll);
    return () => clearInterval(id);
  }, [reload, poll]);

  return { data, error, reload, loadedAt };
}

const fmtSec = (ms) => (ms == null ? '-' : `${(ms / 1000).toFixed(1)}s`);
const fmtTime = (iso) => new Date(iso).toLocaleTimeString('en-GB');
// [V6] 참가자 Started/Ended = 날짜 + 시각(여러 날에 걸친 데이터라 시각만으론 순서가 안 읽힘 · 요청 반영).
const fmtDateTime = (iso) => {
  if (!iso) return '-';
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

// [V6] Duration = Ended − Started(벽시계). 60초 미만은 초, 그 이상은 분·초.
const fmtDur = (ms) => {
  if (ms == null) return '-';
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
};
// [V6] 이벤트가 2개 미만이면 머문 시간을 알 수 없음(0으로 오도하지 않음).
const rowDuration = (p) => {
  if ((p.event_count ?? 0) < 2 || !p.last_at || !p.started_at) return 'unknown';
  return fmtDur(new Date(p.last_at) - new Date(p.started_at));
};

const payloadSummary = (step, payload = {}) => {
  if (step === 'setup') return `party ${payload.party} · ${payload.vehicle}${payload.luggage ? ' · luggage' : ''}`;
  if (step === 'meal_plan') return payload.plan ?? '';
  if (step === 'meals' || step === 'picks') return (payload.selections ?? []).map((s) => s.name).join(', ');
  if (step === 'route_confirm') return (payload.order ?? []).map((s) => s.name).join(' > ');
  if (step === 'pay_method') return payload.method ?? '';
  if (step === 'complete') return `code ${payload.code ?? ''}`;
  if (step === 'log_template') return `from log ${payload.code ?? ''}`; // [V3]
  if (step === 'login') return payload.email ?? (payload.username ? `@${payload.username}` : '');
  return '';
};

// [V6] 대시보드 재구성 · 컬럼: Email · Name · Started · Status (Ended·Completed 제거 · 요청).
//   Status = Reserved(Ended 존재 + Duration 표기) / Planning(Ended 미표기 + Duration unknown).
//   중간 단계 컬럼은 화면에서 빼고(데이터는 보존) 행 클릭 시 전체 이벤트 타임라인 확장.
const COLS = 'grid-cols-[1.4fr_1fr_112px_88px_24px]';
// Ended(last_at) 존재 + Duration 산출 가능 = Reserved · 그 외(로그인만 등) = Planning.
const rowStatus = (p) => (rowDuration(p) !== 'unknown' ? 'Reserved' : 'Planning');

function ParticipantRow({ p }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`grid min-h-44 ${COLS} items-center gap-12 px-16 py-8 text-left text-small transition-colors duration-fast hover:bg-surface`}
      >
        {/* [V6] Email / Name 열 분리 · [V12] email null 계정은 @username + "ID" 회색 배지 */}
        <span className="flex min-w-0 items-center gap-8">
          {p.email ? (
            <span className="min-w-0 truncate font-semibold text-ink">{p.email}</span>
          ) : p.username ? (
            <>
              <span className="min-w-0 truncate font-semibold text-ink">{`@${p.username}`}</span>
              <span className="shrink-0 rounded-pill bg-line px-8 py-2 text-caption font-semibold text-inkMeta">ID</span>
            </>
          ) : (
            <span className="text-ink">—</span>
          )}
        </span>
        <span className="min-w-0 truncate text-inkSec">
          {p.name ?? (p.username ? `@${p.username}` : '—')}
        </span>
        <span className="font-display text-caption text-inkSec">{fmtDateTime(p.started_at)}</span>
        {/* [V6] Duration → Status(Reserved/Planning) */}
        <span className={`font-display font-semibold ${rowStatus(p) === 'Reserved' ? 'text-green' : 'text-inkMeta'}`}>
          {rowStatus(p)}
        </span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={`text-inkMeta transition-transform duration-fast ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <ol className="relative mx-16 mb-16 flex flex-col border-l-0 pl-24">
          <span aria-hidden="true" className="absolute bottom-8 left-8 top-8 w-2 rounded-pill bg-line" />
          {/* [V6] 이벤트 없이 완주(예약만 있음, 트래킹 누락) 또는 로그인만 */}
          {!(p.steps ?? []).length &&
            (p.booking_picks?.length ? (
              <li className="relative flex items-baseline gap-12 py-8">
                <span aria-hidden="true" className="absolute -left-20 top-1/2 h-12 w-12 -translate-y-1/2 rounded-pill bg-primary shadow-sm" />
                <span className="w-96 shrink-0 font-display text-caption font-bold text-primary">
                  booked {p.booking_code ?? ''}
                </span>
                <span className="min-w-0 flex-1 text-small text-ink">{p.booking_picks.map(venueName).join(' > ')}</span>
                <span className="shrink-0 font-display text-caption font-semibold text-inkMeta">no tracking</span>
              </li>
            ) : (
              <li className="py-8 text-caption text-inkMeta">Logged in — no journey steps recorded.</li>
            ))}
          {(p.steps ?? []).map((s, i) => (
            // 이벤트 배열 항목 · 순번 키 허용(불변 목록)
            // eslint-disable-next-line react/no-array-index-key
            <li key={i} className="relative flex items-baseline gap-12 py-8">
              <span aria-hidden="true" className="absolute -left-20 top-1/2 h-12 w-12 -translate-y-1/2 rounded-pill bg-primary shadow-sm" />
              <span className="w-96 shrink-0 font-display text-caption font-bold text-primary">{s.step}</span>
              <span className="min-w-0 flex-1 text-small text-ink">{payloadSummary(s.step, s.payload)}</span>
              <span className="shrink-0 font-display text-caption font-semibold text-inkSec">{fmtSec(s.durationMs)}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function Overview() {
  const { data, error, loadedAt } = useApi('/api/admin/participants', { poll: 15000 });
  const raw = data?.participants ?? [];
  // [V6] 지정 계정(DEMOTE_EMAILS)은 맨 아래로 · 나머지는 서버 최신순 유지(요청)
  const rows = [...raw.filter((r) => !isDemoted(r.email)), ...raw.filter((r) => isDemoted(r.email))];
  const excludedCount = data?.excludedCount ?? 0;
  const completed = rows.filter((r) => r.completed).length;
  // [V6] 평균 체류 = 이벤트 2개 이상 유저의 (Ended − Started) 평균(1개 이하는 머문 시간 불명이라 제외).
  const dwellers = rows.filter((r) => (r.event_count ?? 0) >= 2 && r.last_at && r.started_at);
  const avgDwellMs = dwellers.length
    ? dwellers.reduce((a, r) => a + (new Date(r.last_at) - new Date(r.started_at)), 0) / dwellers.length
    : null;

  const stats = [
    { label: 'Participants', value: rows.length },
    { label: 'Completed', value: completed },
    { label: 'Completion rate', value: rows.length ? `${Math.round((completed / rows.length) * 100)}%` : '-' },
    { label: 'Avg dwell (2+ events)', value: avgDwellMs != null ? fmtDur(avgDwellMs) : '-' },
  ];

  return (
    <div className="flex flex-col gap-24">
      <div className="grid grid-cols-2 gap-16 lg:grid-cols-4">
        {stats.map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-4 rounded-lg bg-white p-24 shadow-sm">
            <span className="text-caption font-semibold uppercase tracking-eyebrow text-inkMeta">{label}</span>
            <span className="font-display text-h2 font-bold text-ink">{value}</span>
          </div>
        ))}
      </div>
      {error && <p className="text-small font-medium text-spice">Load failed: {error}</p>}
      {/* [V6] 참가자별 여정 표(최신 활동순 · 행 클릭 = 전체 타임라인 확장) */}
      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <div className={`grid min-w-[760px] ${COLS} gap-12 px-16 py-12 text-caption font-semibold uppercase tracking-eyebrow text-inkMeta`}>
          <span>Email / ID</span>
          <span>Name</span>
          <span>Started</span>
          <span>Status</span>
          <span />
        </div>
        <div className="flex min-w-[760px] flex-col divide-y divide-line">
          {rows.map((p) => (
            <ParticipantRow key={p.id} p={p} />
          ))}
          {!rows.length && <p className="px-16 py-24 text-small text-inkSec">No participants yet.</p>}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-8">
        {loadedAt && (
          <p className="text-caption text-inkMeta">Updated {loadedAt.toLocaleTimeString('en-GB')} · polls every 15s</p>
        )}
        {/* [V6] 팀 내부 계정은 통계에서 제외(행 삭제 아님) · 제외 수 고지 */}
        {excludedCount > 0 && (
          <p className="text-caption text-inkMeta">
            {excludedCount} internal account{excludedCount === 1 ? '' : 's'} excluded from stats
          </p>
        )}
      </div>
    </div>
  );
}

function LiveTimeline() {
  const { data, error, loadedAt } = useApi('/api/admin/events', { poll: 15000 });
  const [seen, setSeen] = useState(() => new Set());
  const freshIds = useRef(new Set());

  const events = data?.events ?? [];
  useEffect(() => {
    if (!events.length) return;
    const next = new Set(seen);
    freshIds.current = new Set();
    events.forEach((e) => {
      if (!next.has(e.id)) {
        if (seen.size) freshIds.current.add(e.id); // 첫 로드는 하이라이트 없음
        next.add(e.id);
      }
    });
    if (next.size !== seen.size) setSeen(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]);

  return (
    <div className="flex flex-col gap-16">
      {error && <p className="text-small font-medium text-spice">Load failed: {error}</p>}
      <ol className="flex flex-col divide-y divide-line rounded-lg bg-white shadow-sm">
        {events.map((e) => (
          <li
            key={e.id}
            className="flex flex-wrap items-baseline gap-x-12 gap-y-4 px-16 py-12 text-small"
            style={
              freshIds.current.has(e.id)
                ? {
                    // 새 이벤트 유입 하이라이트 1회(§17 예산 내 · surface → white 배경 전환)
                    animation: `bh-admin-flash 1200ms ${motion.easeOut} 1`,
                  }
                : undefined
            }
          >
            <span className="font-display font-semibold text-inkSec">{fmtTime(e.created_at)}</span>
            <span className="font-semibold text-ink">{e.email}</span>
            <span className="font-display font-bold text-primary">{e.step}</span>
            <span className="min-w-0 flex-1 text-inkSec">{payloadSummary(e.step, e.payload)}</span>
            <span className="font-display text-caption font-semibold text-inkMeta">+{fmtSec(e.duration_ms)}</span>
          </li>
        ))}
        {!events.length && <p className="px-16 py-24 text-small text-inkSec">No events yet.</p>}
      </ol>
      {loadedAt && (
        <p className="text-caption text-inkMeta">Updated {loadedAt.toLocaleTimeString('en-GB')} · polls every 15s</p>
      )}
      {/* [V5-8] 하드코딩 #F5F6FA → tokens.colors.surface(같은 값 · 테마 단일 진실) */}
      <style>{`@keyframes bh-admin-flash { from { background: ${colors.surface}; } to { background: transparent; } }`}</style>
    </div>
  );
}

// [V11] User Management 2차 게이트 모달 · env ADMIN_2FA_PIN 검증(서버) · 통과 시 /admin/users 이동.
//   실패 5회 시 서버가 10분 잠금(423 locked) — 카운트다운 표기. 관리자 도구라 영어 하드카피.
function TwoFaModal({ open, onClose }) {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (lockedUntil <= Date.now()) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [lockedUntil]);
  const locked = lockedUntil > now;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/2fa`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pin.trim() }), // [V12] 전송 전 trim(서버와 동일 방어)
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        onClose();
        navigate('/admin/users');
        return;
      }
      if (data.error === 'locked') {
        setLockedUntil(data.lockedUntil || 0);
        setNow(Date.now());
        setMsg('Too many attempts.');
      } else if (data.error === 'invalid_pin') {
        // [V16] 서버는 일반 오류(401 invalid_pin) · 남은 시도 횟수만 표시
        setMsg(`Incorrect PIN. ${data.remaining} attempt${data.remaining === 1 ? '' : 's'} left.`);
      } else if (data.error === 'not_configured') {
        // [V16] env 미설정(503) — 서버 구성 문제
        setMsg('Admin 2FA is not configured on the server.');
      } else {
        setMsg('Verification failed.');
      }
    } catch {
      setMsg('Network error.');
    } finally {
      setBusy(false);
      setPin('');
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col gap-16">
        <h2 className="text-h3 font-semibold">User Management access</h2>
        <p className="text-small text-inkSec">Enter the admin 2FA PIN to continue.</p>
        <form onSubmit={submit} className="flex flex-col gap-12">
          <input
            type="password"
            inputMode="numeric"
            autoComplete="off"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="2FA PIN"
            disabled={locked}
            className="h-48 rounded-md bg-surface px-16 text-body focus:ring-2 focus:ring-primary"
          />
          {msg && (
            <p className="text-small font-medium text-spice">
              {msg}
              {locked && ` Locked, try again in ${Math.max(0, Math.ceil((lockedUntil - now) / 1000))}s.`}
            </p>
          )}
          <div className="grid">
            <Button as="button" type="submit" disabled={busy || locked || !pin}>
              Verify
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

// DAH RequireAdmin 문법: 비로그인·비관리자 = NotFound 렌더(404 위장 · UI 미렌더)
function RequireAdmin({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (!user?.isAdmin) return <NotFound />;
  return children;
}

export default function AdminPage() {
  const [tab, setTab] = useState('overview');
  const [reloadKey, setReloadKey] = useState(0);
  const [twoFaOpen, setTwoFaOpen] = useState(false); // [V11] User Management 2차 게이트

  return (
    <RequireAdmin>
      <Container>
        <div className="flex flex-col gap-24 pb-64 pt-96">
          <div className="flex flex-wrap items-center justify-between gap-16">
            <h1 className="font-display text-h1 font-bold tracking-display">Validation dashboard</h1>
            <div className="flex items-center gap-8">
              {/* [V11] 2차 게이트 → 통과 시 /admin/users */}
              <Button variant="secondary" onClick={() => setTwoFaOpen(true)}>
                User Management
              </Button>
              <Button variant="secondary" onClick={() => setReloadKey((k) => k + 1)}>
                <RefreshCw size={16} aria-hidden="true" />
                Refresh
              </Button>
            </div>
          </div>
          <TwoFaModal open={twoFaOpen} onClose={() => setTwoFaOpen(false)} />
          {/* DAH AdminLayout 구도 · 좌 사이드바 + 우 콘텐츠 */}
          <div className="flex flex-col gap-24 lg:grid lg:grid-cols-[200px_1fr] lg:items-start">
            <nav className="flex gap-8 lg:flex-col">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'timeline', label: 'Live timeline' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`pressable flex min-h-44 items-center rounded-md px-16 text-small font-semibold ${
                    tab === id ? 'bg-primary text-white' : 'bg-white text-ink shadow-sm hover:bg-surface'
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>
            {/* reloadKey로 훅 리마운트 = 수동 새로고침(civic reload 문법) */}
            <div key={reloadKey}>{tab === 'overview' ? <Overview /> : <LiveTimeline />}</div>
          </div>
        </div>
      </Container>
    </RequireAdmin>
  );
}
