// [V5-3] 집중률 카드 · IA §11.7 우측 카드 = go 화면의 공사 API 근거(관광지 집중률 예측 · /api/kto/congestion).
// matched → 지금 가면 {band}(오늘 값 있을 때만) + 30일 중 가장 한가한 날(날짜 + band) + 출처 캡션 · 그 외 → none 문구.
// id는 두 종류(공사 contentid · 합류 구 venue id) 모두 서버가 받는다 · 도착지 전환 시 재조회
//   (응답은 요청 id와 함께 저장 · id 불일치 = 조회 중 → 이전 도착지 값이 새 도착지에 섞여 보이지 않음).
import { useEffect, useState } from 'react';
import { getCongestion } from '../../data/gts/ktoApi';
import LangSwap from '../../i18n/LangSwap';
import { DateText } from '../gate/fieldOptions';
import CongestionChip from '../gts/CongestionChip';
import Skeleton from '../ui/Skeleton';

// 'YYYYMMDD' → 로컬 Date(시각 없는 날짜 · 문자열 파싱의 UTC 하루 밀림 방지)
const ymdDate = (s) => new Date(Number(s.slice(0, 4)), Number(s.slice(4, 6)) - 1, Number(s.slice(6, 8)));

export default function CrowdCard({ id, className = '' }) {
  const [data, setData] = useState(null); // { id, res }

  useEffect(() => {
    let alive = true;
    getCongestion(id).then((res) => {
      if (alive) setData({ id, res });
    });
    return () => {
      alive = false;
    };
  }, [id]);

  const cur = data?.id === id ? data.res : null; // null = 조회 중

  return (
    <section className={`flex flex-col gap-16 rounded-xl bg-white p-24 shadow-sm ${className}`}>
      <LangSwap k="go.crowd.title" as="h2" className="text-h3 font-semibold" />
      <div aria-live="polite" className="flex flex-col gap-16">
        {!cur && <Skeleton className="h-64" />}
        {cur?.matched && (
          <>
            <dl className="flex flex-col gap-16">
              {cur.today?.band && (
                <div className="flex flex-wrap items-center justify-between gap-8">
                  <LangSwap k="go.crowd.now" as="dt" className="text-body font-semibold" />
                  <dd>
                    {/* 맥락 = 바로 앞 dt(지금 가면) · 칩 자체 스크린리더 라벨 생략 */}
                    <CongestionChip band={cur.today.band} labelKey={null} />
                  </dd>
                </div>
              )}
              <div className="flex flex-col gap-8">
                <LangSwap k="go.crowd.quietest" as="dt" className="text-body font-semibold" />
                <dd className="flex flex-wrap items-center gap-8">
                  <span className="font-display text-body font-bold">
                    <DateText date={ymdDate(cur.quietest.baseYmd)} />
                  </span>
                  <CongestionChip band={cur.quietest.band} labelKey={null} />
                </dd>
              </div>
            </dl>
            <LangSwap k="go.crowd.source" as="p" className="text-caption font-medium text-inkMeta" />
          </>
        )}
        {cur && !cur.matched && <LangSwap k="go.crowd.none" as="p" className="text-body text-inkSec" />}
      </div>
    </section>
  );
}
