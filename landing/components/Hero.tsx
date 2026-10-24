'use client';

import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap';
import { lightning } from '../lib/lightning';
import s from '../styles/landing.module.css';

const SUB_AND_CTA = '[data-hero="sub"], [data-hero="cta"]';

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const mm = gsap.matchMedia();
      let pointer: { x: number; y: number; t: number } | null = null;

      const aim = () => {
        const r = el.getBoundingClientRect();
        const fresh = pointer && performance.now() - pointer.t < 2500;
        return {
          from: { x: window.innerWidth * (0.62 + Math.random() * 0.3), y: 0 },
          to: fresh
            ? { x: pointer!.x, y: pointer!.y }
            : { x: window.innerWidth * (0.55 + Math.random() * 0.38), y: r.top + r.height * (0.35 + Math.random() * 0.5) },
        };
      };
      const strike = () => {
        const { from, to } = aim();
        lightning.current?.strike(from, to);
      };

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const onMove = (e: PointerEvent) => (pointer = { x: e.clientX, y: e.clientY, t: performance.now() });
        el.addEventListener('pointermove', onMove, { passive: true });

        // Hidden pre-intro state is set here, before paint, and only when motion is allowed.
        const lines = gsap.utils.toArray<HTMLElement>('[data-hero="line"] > span', el);
        gsap.set(lines, { yPercent: 110 });
        gsap.set(SUB_AND_CTA, { opacity: 0, y: 18 });

        let introDone = false;
        let inView = true;
        let next: gsap.core.Tween | null = null;
        const schedule = () => {
          next?.kill();
          next = null;
          if (!introDone || !inView) return;
          next = gsap.delayedCall(1.1 + Math.random() * 1.7, () => {
            strike();
            schedule();
          });
        };

        const tl = gsap.timeline({
          delay: 0.3,
          onComplete: () => {
            introDone = true;
            window.clearTimeout(failsafe);
            schedule();
          },
        });
        tl.add(strike)
          .to(lines, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.12 }, '<')
          .to(SUB_AND_CTA, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1 }, '-=0.4');
        // If the intro has not finished by 3s of wall-clock time, show everything. This must not
        // ride GSAP's own clock: a stalled ticker or a paused global timeline would stall it too.
        const failsafe = window.setTimeout(() => tl.progress(1), 3000);

        const trigger = ScrollTrigger.create({
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => {
            inView = self.isActive;
            schedule();
          },
        });

        return () => {
          el.removeEventListener('pointermove', onMove);
          trigger.kill();
          window.clearTimeout(failsafe);
          next?.kill();
          tl.kill();
        };
      });

      mm.add('(prefers-reduced-motion: reduce)', () => {
        const showStill = () => {
          const r = el.getBoundingClientRect();
          lightning.current?.showStatic(
            { x: window.innerWidth * 0.78, y: 0 },
            { x: window.innerWidth * 0.62, y: r.top + r.height * 0.55 },
          );
        };
        showStill();
        const trigger = ScrollTrigger.create({
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => (self.isActive ? showStill() : lightning.current?.clear()),
        });
        return () => {
          trigger.kill();
          lightning.current?.clear();
        };
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className={s.hero}>
      <div className={`${s.wrap} ${s.heroGrid}`}>
        <div className={s.heroCopy}>
          <h1 className={`${s.display} ${s.headline}`}>
            <span className={s.line} data-hero="line"><span>Alive, and</span></span>
            <span className={s.line} data-hero="line"><span className={s.broken}>broken on purpose.</span></span>
          </h1>
          <p className={s.sub} data-hero="sub">A real web app stitched from every bad decision in production. Fix a flaw. The best answer wins.</p>
          <div className={s.cta} data-hero="cta">
            <a className={`${s.btn} ${s.btnPrimary}`} href="#challenges">Browse challenges</a>
            <a className={`${s.btn} ${s.btnGhost}`} href="#lore">Read the lore</a>
          </div>
        </div>
      </div>
    </section>
  );
}
