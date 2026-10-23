'use client';

import { useEffect, useState } from 'react';
import { CheckResult, runChecks } from '../lib/checks';
import { toVitals, Vital } from '../lib/vitals';
import s from '../styles/landing.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
const WATCHDOG_MS = 8000;

const BEAT = '0,20 40,20 52,20 58,6 66,34 74,12 80,20 120,20 132,20 138,6 146,34 154,12 160,20 200,20';
const FLAT = '0,20 200,20';

const TILE_STATE: Record<Vital['status'], string> = { loading: s.tileLoading, ok: s.tileOk, fail: s.tileFail };

export function VitalSigns() {
  const [results, setResults] = useState<CheckResult[] | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    let live = true;
    runChecks(API_BASE).then((r) => {
      if (live) setResults(r);
    });
    // A hung request must not leave the tiles on "Checking" forever.
    const watchdog = setTimeout(() => {
      if (live) setTimedOut(true);
    }, WATCHDOG_MS);
    return () => {
      live = false;
      clearTimeout(watchdog);
    };
  }, []);

  return (
    <div className={s.section}>
      <div className={s.wrap}>
        <div className={s.sectionHead}>
          <h2 className={`${s.display} ${s.sectionTitle}`}>Proof of life</h2>
          <p>These readings come from the stack running right now.</p>
        </div>
        <div className={s.tiles}>
          {toVitals(results, timedOut).map((v) => (
            <article key={v.name} className={`${s.tile} ${TILE_STATE[v.status]}`} data-testid={`check-${v.name}`}>
              <span className={s.organ}>{v.organ}</span>
              <h3 className={`${s.display} ${s.tileTitle}`}>{v.descriptor}</h3>
              <svg className={s.beat} viewBox="0 0 200 40" aria-hidden="true" focusable="false">
                <polyline points={v.organ === 'Heart' && v.status === 'ok' ? BEAT : FLAT} />
              </svg>
              <p className={s.reading}>{v.reading}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
