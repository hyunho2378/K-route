// DEPRECATED v4(IA §9.0) — 구 City Lines·Bag Delivery 잠정 퇴역: 라우트에서 제거됨. 삭제 금지, 재활용 예정.
// Bag Delivery(/hands-free) · v3.1 최상위 페이지(IA §2.3) + v3.2 존 B2(§8.4).
// 헤드라인 섹션(h1 + Optional 배지 + 서브 + 선택 사항 카피 + 3단계 미니 스트립) → lg+ 1fr_380px 2컬럼
// (좌 설명·단계·FAQ 3개 / 우 폼 카드).
// v3.2: 날짜 = CalendarField(§19 · 리스트 옵션 폐지), Optional 배지는 StatusBadge 문법(신규 status 키 아님).
// 폼: Stepper 수하물 / FieldSelect 터미널 / CalendarField 날짜 / 주소·이메일
// → 개당 요금 합계(DRAFT) → 확정 버튼에서만 LoginGate(Guest-first, ROUTES §3)
// → createHandsFree → 접수 코드 화면.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, Loader2, Luggage, MapPin, Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../i18n/LangContext';
import LangSwap from '../i18n/LangSwap';
import Container from '../components/layout/Container';
import Button from '../components/ui/Button';
import FieldSelect from '../components/ui/FieldSelect';
import LoginGate from '../components/ui/LoginGate';
import Stepper from '../components/ui/Stepper';
import CalendarField from '../components/gate/CalendarField';
import { buildTerminalOptions, localDateId } from '../components/gate/fieldOptions';
import { createHandsFree } from '../data/api';

const PRICE_PER_BAG = 25000; // DRAFT · 5일차 BM 검토 확정(IA §4)

// 3단계 미니 스트립 · IA §2.3.1(Drop at airport / We carry to Chuncheon / Meet it at your stay)
const STEPS = [
  { id: 'drop', icon: Luggage },
  { id: 'carry', icon: Truck },
  { id: 'meet', icon: MapPin },
];

const FAQ = ['1', '2', '3'];

export default function HandsFree() {
  const { t } = useLang();
  const { user } = useAuth();
  const [bags, setBags] = useState(1);
  const [terminal, setTerminal] = useState('t1');
  const [date, setDate] = useState(localDateId(new Date()));
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [gateOpen, setGateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState(null);

  const total = bags * PRICE_PER_BAG;

  const validate = () => {
    const next = {};
    if (!date) next.date = true;
    if (!address.trim()) next.address = true;
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = true;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submitOrder = async () => {
    setSubmitting(true);
    // api.js는 전부 async · await 계약(PROGRESS 인수인계 노트)
    const result = await createHandsFree({ terminal, date, bags, address, email, total });
    setOrder(result);
    setSubmitting(false);
  };

  const confirm = (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (user) submitOrder();
    else setGateOpen(true);
  };

  return (
    // v3.2 모바일 상단 헤더 80px 신설 → 모바일 상단 패딩 pt-96(lg 기존 유지)
    <div className="pb-64 pt-96 lg:pt-128">
      <Container>
        {/* 접수 상태 변경 알림 영역 · DESIGN §14 aria-live polite */}
        <div aria-live="polite">
          {order ? (
            <div className="flex flex-col items-center gap-16 rounded-lg bg-white p-32 text-center shadow-sm">
              <BadgeCheck size={48} aria-hidden="true" className="text-primary" />
              {/* v3.2 §16.2: h1급 타이틀 = 700 */}
              <LangSwap k="handsfree.success.title" as="h1" className="text-h2 font-bold" />
              <LangSwap
                k="handsfree.success.codeLabel"
                as="p"
                className="text-caption font-medium uppercase tracking-eyebrow text-inkMeta"
              />
              <p className="font-display text-h1 font-bold tracking-display">{order.code}</p>
              <LangSwap k="handsfree.success.body" as="p" className="text-small text-inkSec" />
              <Button as={Link} to="/">
                <LangSwap k="handsfree.success.home" />
              </Button>
            </div>
          ) : (
            <>
              {/* 헤드라인 섹션 · IA §2.3.1 */}
              <LangSwap
                k="nav.handsfree"
                as="p"
                className="text-caption font-medium uppercase tracking-eyebrow text-inkMeta"
              />
              {/* 헤드라인 옆 Optional 배지 · StatusBadge 문법(pill + caption 500, §8.4) */}
              <div className="mt-8 flex flex-wrap items-center gap-12">
                <LangSwap k="handsfree.title" as="h1" className="text-h1 font-bold tracking-display" />
                <LangSwap
                  k="handsfree.optional.badge"
                  className="inline-flex items-center rounded-pill bg-surface px-12 py-4 text-caption font-medium text-ink"
                />
              </div>
              {/* 기존 수하물 딜리버리 사업자 제휴 · 춘천 구간 예약 레이어(정직 표기, IA §2.3) */}
              <LangSwap k="handsfree.intro" as="p" className="mt-16 text-body text-inkSec" />
              {/* 선택 사항 명시 카피 · IA §8.4 고정 문장 */}
              <LangSwap k="handsfree.optional.note" as="p" className="mt-8 text-body text-inkSec" />
              <ul className="mt-24 flex flex-wrap gap-x-32 gap-y-12">
                {STEPS.map(({ id, icon: Icon }) => (
                  <li key={id} className="flex min-h-44 items-center gap-8">
                    <Icon size={20} aria-hidden="true" className="text-primary" />
                    <LangSwap k={`handsfree.steps.${id}.label`} className="text-small font-medium" />
                  </li>
                ))}
              </ul>

              {/* lg+ 2컬럼 1fr_380px · 380px = IA §2.3 명세값(브래킷 허용 예외) */}
              <div className="mt-48 grid gap-32 lg:grid-cols-[1fr_380px] lg:gap-48">
                {/* 우측(모바일 상단) 폼 카드 · 패널 radius xl(v3.1 스케일) */}
                <aside className="lg:col-start-2 lg:row-start-1">
                  <form
                    noValidate
                    onSubmit={confirm}
                    className="flex flex-col gap-24 rounded-xl bg-white p-24 shadow-md"
                  >
                    <Stepper value={bags} min={1} onChange={setBags} label="handsfree.form.bags" />

                    <FieldSelect
                      label="gate.form.terminal"
                      value={terminal}
                      placeholder="gate.form.placeholders.terminal"
                      options={buildTerminalOptions(t)}
                      onChange={setTerminal}
                    />

                    {/* v3.2: 날짜 = CalendarField(§19) · 네이티브 date·리스트 옵션 미사용 */}
                    <div className={errors.date ? 'rounded-md ring-2 ring-spice' : ''}>
                      <CalendarField
                        label="gate.form.date"
                        value={date}
                        placeholder="gate.form.placeholders.date"
                        onChange={(id) => {
                          setDate(id);
                          setErrors((prev) => ({ ...prev, date: false }));
                        }}
                      />
                    </div>
                    {errors.date && (
                      <p id="handsfree-date-error" role="alert" className="text-small text-spice">
                        {t('handsfree.form.errors.date')}
                      </p>
                    )}

                    <label className="flex flex-col gap-8">
                      <LangSwap k="handsfree.form.address" className="text-small font-medium" />
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => {
                          setAddress(e.target.value);
                          setErrors((prev) => ({ ...prev, address: false }));
                        }}
                        aria-invalid={Boolean(errors.address)}
                        aria-describedby={errors.address ? 'handsfree-address-error' : undefined}
                        className={`h-48 rounded-md bg-surface px-16 text-body focus:ring-2 focus:ring-primary ${
                          errors.address ? 'ring-2 ring-spice' : ''
                        }`}
                      />
                      {errors.address && (
                        <p id="handsfree-address-error" role="alert" className="text-small text-spice">
                          {t('handsfree.form.errors.address')}
                        </p>
                      )}
                    </label>

                    <label className="flex flex-col gap-8">
                      <LangSwap k="handsfree.form.email" className="text-small font-medium" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setErrors((prev) => ({ ...prev, email: false }));
                        }}
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={errors.email ? 'handsfree-email-error' : undefined}
                        className={`h-48 rounded-md bg-surface px-16 text-body focus:ring-2 focus:ring-primary ${
                          errors.email ? 'ring-2 ring-spice' : ''
                        }`}
                      />
                      {errors.email && (
                        <p id="handsfree-email-error" role="alert" className="text-small text-spice">
                          {t('handsfree.form.errors.email')}
                        </p>
                      )}
                    </label>

                    {/* 내부 구획 디바이더 · colors.line 1px 수평(§16) */}
                    <hr className="border-line" />
                    <div className="flex flex-col gap-8">
                      <p className="flex items-baseline justify-between text-small text-inkSec">
                        <LangSwap k="handsfree.form.perBag" />
                        <span className="font-display font-semibold">
                          {t('common.currency')}
                          {PRICE_PER_BAG.toLocaleString('en-US')}
                        </span>
                      </p>
                      <p className="flex items-baseline justify-between">
                        <LangSwap k="handsfree.form.total" className="text-small font-medium" />
                        <span className="font-display text-h2 font-bold">
                          {t('common.currency')}
                          {total.toLocaleString('en-US')}
                        </span>
                      </p>
                    </div>

                    <Button type="submit" disabled={submitting} aria-busy={submitting}>
                      <LangSwap k="handsfree.form.submit" />
                      {submitting && (
                        <Loader2
                          size={16}
                          aria-hidden="true"
                          className="animate-spin motion-reduce:animate-none"
                        />
                      )}
                    </Button>
                  </form>
                </aside>

                {/* 좌측 설명 · 단계 · FAQ (IA §2.3.1 레이아웃) */}
                <div className="lg:col-start-1 lg:row-start-1">
                  {/* v3.2 §16.2: h2 = 700 */}
                  <LangSwap k="handsfree.detail.title" as="h2" className="text-h2 font-bold" />
                  <LangSwap k="handsfree.detail.body" as="p" className="mt-16 text-body text-inkSec" />

                  <ol className="mt-32 flex flex-col gap-24">
                    {STEPS.map(({ id, icon: Icon }) => (
                      <li key={id} className="flex gap-16">
                        <span
                          aria-hidden="true"
                          className="flex h-48 w-48 shrink-0 items-center justify-center rounded-pill bg-surface"
                        >
                          <Icon size={24} className="text-primary" />
                        </span>
                        <span className="flex flex-col gap-4">
                          {/* v3.2 §16.2: h3 = 600 */}
                          <LangSwap k={`handsfree.steps.${id}.label`} as="h3" className="text-h3 font-semibold" />
                          <LangSwap k={`handsfree.steps.${id}.body`} as="p" className="text-small text-inkSec" />
                        </span>
                      </li>
                    ))}
                  </ol>

                  <LangSwap k="handsfree.faq.title" as="h2" className="mt-48 text-h2 font-bold" />
                  <dl className="mt-16 flex flex-col gap-24">
                    {FAQ.map((n) => (
                      <div key={n}>
                        <LangSwap k={`handsfree.faq.q${n}`} as="dt" className="text-body font-medium" />
                        <LangSwap k={`handsfree.faq.a${n}`} as="dd" className="mt-4 text-small text-inkSec" />
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </>
          )}
        </div>
      </Container>

      <LoginGate open={gateOpen} onClose={() => setGateOpen(false)} onSuccess={submitOrder} />
    </div>
  );
}
