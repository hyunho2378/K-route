// [V5-6] NFC 성지 스탬프 · /stamp/:spotId/:t(스티커 URL · RequireAuth) · IA §11.10 개정(URL 태그 최소 데모)
//   토큰은 경로에 둔다: RequireAuth 는 로그인 뒤 경로(pathname)만 되돌려 주므로 쿼리에 두면 구글 로그인 후 사라진다
//   열리면 서버에 1회 기록 → SuccessStamp(갈래 아이콘) · 갈래별 배지 · 남은 갈래의 장소 · 완주 시 인증서 PNG(§43 canvas 다운로드 문법)
//   찍을 수 있는 곳·배지 규칙은 서버 stampService(SOURCE_SPOTS 앵커 · grade 강함)가 정한다 · 화면은 결과만 그린다
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BadgeCheck, Download } from 'lucide-react';
import Container from '../components/layout/Container';
import Button from '../components/ui/Button';
import { LoadingLogoCenter } from '../components/ui/LoadingLogo';
import SuccessStamp from '../components/booking/SuccessStamp';
import { useAuth } from '../context/AuthContext';
import { postStamp } from '../data/gts/ktoApi';
import { resolveSpot } from '../data/gts/spots';
import { LINE_FACE, lineMeta, lineOfKType } from '../data/gts/lineSystem';
import { LINE_ICONS } from '../data/gts/quizQuestions';
import LangSwap from '../i18n/LangSwap';
import { useLang } from '../i18n/LangContext';
import { colors, fonts, motion } from '../tokens';

// [V5-9] 갈래(kType) → K-콘텐츠 라인은 lineSystem 단일 출처로 파생한다.
//   구 로컬 표는 kanime 을 lake(파랑)·클래퍼보드로 둬서 라인 체계(anime = potato · 팔레트)와 어긋나 있었다.
//   찍을 수 있는 갈래는 서버 stampService 가 정한다(SOURCE 앵커 grade 강함 = 현재 kfood · kanime).
const LOCALE = { en: 'en-US', ko: 'ko-KR', th: 'th-TH' };

// 완주 인증서 · DOM 캡처 라이브러리 금지 · canvas 직접 렌더(PATTERNS §7 · §43) · 사용자 언어로 그린다
function certificate({ t, lang, name, badges }) {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');
  const body = lang === 'th' ? fonts.thai : fonts.body;
  ctx.fillStyle = colors.primary;
  ctx.fillRect(0, 0, 1200, 630);
  ctx.fillStyle = colors.bg;
  ctx.font = `600 36px ${fonts.display}`;
  ctx.fillText('K-ROUTE CHUNCHEON', 80, 120);
  ctx.font = `700 56px ${body}`;
  ctx.fillText(t('gts.stamp.certTitle'), 80, 230);
  ctx.font = `700 72px ${body}`;
  ctx.fillText(name, 80, 350);
  ctx.font = `400 36px ${body}`;
  ctx.fillText(t('gts.stamp.certBody'), 80, 410);
  ctx.font = `600 36px ${body}`;
  ctx.fillText(badges.map((k) => t(`gts.spot.kbadge.${k}`)).join('   '), 80, 500);
  ctx.font = `400 28px ${body}`;
  ctx.fillText(new Intl.DateTimeFormat(LOCALE[lang], { dateStyle: 'long', timeZone: 'Asia/Seoul' }).format(new Date()), 80, 560);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

export default function GtsStamp() {
  const { spotId, t: tag } = useParams();
  const { user } = useAuth();
  const { t, lang } = useLang();
  const [res, setRes] = useState(null); // null = 기록 중 · stamps 없음 = 실패({ source:'fallback' })
  const sent = useRef(''); // 같은 태그를 두 번 보내지 않는다(StrictMode 이중 effect · 서버는 멱등이지만 added 표시가 흔들린다)

  useEffect(() => {
    const key = `${spotId}/${tag}`;
    if (sent.current === key) return;
    sent.current = key;
    setRes(null);
    postStamp(spotId, tag).then(setRes);
  }, [spotId, tag]);

  if (!res) return <LoadingLogoCenter className="min-h-screen" />;

  const ok = Array.isArray(res.stamps);
  const here = ok && res.stamps.find((s) => s.spotId === spotId);
  // [V5-9] 이 스탬프가 속한 K-콘텐츠 라인 · 라인이 없으면(대상 아님) 스탬프 면을 그리지 않는다
  const line = here ? lineOfKType(here.kType) : null;
  const Mark = line ? LINE_ICONS[line] : null;
  const nameOf = (id) => {
    const s = resolveSpot(id);
    return s?.name?.[lang] ?? s?.name?.en ?? id;
  };
  // 아직 배지가 없는 갈래의 장소만 안내한다(갈래마다 한 곳이면 배지가 나온다)
  const remaining = ok ? (res.spots ?? []).filter((s) => !res.badges.includes(s.kType)) : [];

  const saveCert = async () => {
    const blob = await certificate({ t, lang, name: user?.name || user?.username || '', badges: res.badges });
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kroute-stamp-certificate.png';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Container>
      <div className="mx-auto flex max-w-dialog flex-col items-center gap-32 pb-96 pt-96 text-center">
        <LangSwap k="gts.stamp.eyebrow" className="text-caption font-medium uppercase tracking-eyebrow text-inkMeta" />

        {line ? (
          <SuccessStamp line={{ id: lineMeta(line).colorToken }} mark={<Mark size={48} aria-hidden="true" />}>
            <h1 className="text-h2 font-bold tracking-tight">{nameOf(spotId)}</h1>
            <LangSwap k={res.added ? 'gts.stamp.added' : 'gts.stamp.already'} as="p" className="mt-8 text-body text-inkSec" />
          </SuccessStamp>
        ) : (
          <LangSwap k="gts.stamp.bad" as="p" className="text-body text-ink" />
        )}

        {ok && (
          <section className="flex w-full flex-col gap-16">
            <div className="flex items-baseline justify-center gap-8">
              <LangSwap k="gts.stamp.progress" className="text-small font-medium text-inkSec" />
              <span className="font-display text-h3 font-bold">
                {res.badges.length} / {res.kinds.length}
              </span>
            </div>
            {/* [V5-9] 노선 완주 진행바 · 채움은 transform만(MOTION.md · width 금지) ·
                분모는 서버가 정한 실제 갈래 수다(찍을 수 없는 라인을 세어 영영 안 차는 막대를 만들지 않는다) */}
            <span aria-hidden="true" className="flex h-8 w-full overflow-hidden rounded-pill bg-line">
              <span
                className="block h-full w-full origin-left rounded-pill bg-primary"
                style={{
                  transform: `scaleX(${res.kinds.length ? res.badges.length / res.kinds.length : 0})`,
                  transition: `transform ${motion.dur} ${motion.easeOut}`,
                }}
              />
            </span>

            <ul className="flex flex-wrap justify-center gap-8" aria-label={t('gts.stamp.badges')}>
              {res.kinds.map((k) => {
                const got = res.badges.includes(k);
                return (
                  <li
                    key={k}
                    // [V5-9] 획득한 배지는 그 갈래가 속한 라인 색 면(LINE_FACE = 대비 규칙 포함)
                    className={`inline-flex min-h-44 items-center gap-8 rounded-pill px-16 text-small font-semibold ${
                      got ? LINE_FACE[lineOfKType(k)] ?? 'bg-primary text-white' : 'bg-surface text-inkSec'
                    }`}
                  >
                    {got && <BadgeCheck size={16} aria-hidden="true" />}
                    <LangSwap k={`gts.spot.kbadge.${k}`} />
                  </li>
                );
              })}
            </ul>

            {res.complete ? (
              <div className="flex flex-col items-center gap-16">
                <LangSwap k="gts.stamp.complete" as="p" className="text-h3 font-semibold" />
                <Button onClick={saveCert}>
                  <Download size={20} aria-hidden="true" />
                  <LangSwap k="gts.stamp.certificate" />
                </Button>
              </div>
            ) : (
              remaining.length > 0 && (
                <div className="flex flex-col gap-8">
                  <LangSwap k="gts.stamp.next" as="p" className="text-small text-inkSec" />
                  <p className="text-body font-semibold">{remaining.map((s) => nameOf(s.id)).join(', ')}</p>
                </div>
              )
            )}

            <Link
              to="/gts/route"
              className="mx-auto inline-flex min-h-44 w-fit items-center text-small font-semibold text-primary underline underline-offset-4 transition-colors duration-fast hover:text-ink"
            >
              <LangSwap k="gts.stamp.toRoute" />
            </Link>
          </section>
        )}
      </div>
    </Container>
  );
}
