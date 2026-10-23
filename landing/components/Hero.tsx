'use client';

import { forwardRef } from 'react';
import s from '../styles/landing.module.css';

export const Hero = forwardRef<HTMLElement>(function Hero(_props, ref) {
  return (
    <section ref={ref} className={s.hero}>
      <div className={`${s.wrap} ${s.heroGrid}`}>
        <div className={s.heroCopy}>
          <h1 className={`${s.display} ${s.headline}`}>
            <span className={s.line}><span>Alive, and</span></span>
            <span className={s.line}><span className={s.broken}>broken on purpose.</span></span>
          </h1>
          <p className={s.sub}>A real web app stitched from every bad decision in production. Fix a flaw. The best answer wins.</p>
          <div className={s.cta}>
            <a className={`${s.btn} ${s.btnPrimary}`} href="#challenges">Browse challenges</a>
            <a className={`${s.btn} ${s.btnGhost}`} href="#lore">Read the lore</a>
          </div>
        </div>
      </div>
    </section>
  );
});
