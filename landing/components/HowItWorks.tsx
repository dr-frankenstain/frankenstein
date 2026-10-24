'use client';

import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap';
import s from '../styles/landing.module.css';
import { StepArt } from './StepArt';

const STEPS = [
  { title: 'Pick', text: 'Choose an issue. Each one documents exactly one flaw, tagged by discipline and difficulty.' },
  { title: 'Fork', text: 'Work in your own fork on a solution branch. Nothing you do touches the monster.' },
  { title: 'Fix', text: 'Open a pull request. It will never be merged, and that is the point. It is your answer, on the record.' },
  { title: 'Vote', text: "The community reacts with a thumbs-up. The top-voted pull request is the crowd's best answer." },
] as const;

const parts = (art: Element, name: string) => gsap.utils.toArray<SVGElement>(`[data-a="${name}"]`, art);

// Each diagram starts in its hidden state and returns the timeline that plays it to the final state.
const BUILD: Record<string, (art: Element) => gsap.core.Timeline> = {
  Pick(art) {
    const rows = parts(art, 'row');
    const [sel] = parts(art, 'sel');
    const [cursor] = parts(art, 'cursor');
    gsap.set(rows, { autoAlpha: 0, x: -14 });
    gsap.set(sel, { autoAlpha: 0 });
    gsap.set(cursor, { autoAlpha: 0, x: 60, y: -56 });
    return gsap
      .timeline({ paused: true })
      .to(rows, { autoAlpha: 1, x: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' })
      .to(cursor, { autoAlpha: 1, x: 0, y: 0, duration: 0.8, ease: 'power2.inOut' }, '-=0.1')
      .to(sel, { autoAlpha: 1, duration: 0.25 });
  },
  Fork(art) {
    const [branch] = parts(art, 'branch');
    const [ring] = parts(art, 'ring');
    const dots = parts(art, 'bdot');
    const [label] = parts(art, 'blabel');
    gsap.set(branch, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set([ring, ...dots], { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(label, { autoAlpha: 0 });
    return gsap
      .timeline({ paused: true })
      .to(ring, { scale: 1, duration: 0.35, ease: 'back.out(3)' })
      .to(branch, { strokeDashoffset: 0, duration: 0.9, ease: 'power1.inOut' })
      .to(dots, { scale: 1, duration: 0.3, stagger: 0.12, ease: 'back.out(3)' }, '-=0.3')
      .to(label, { autoAlpha: 1, duration: 0.3 });
  },
  Fix(art) {
    const [diff] = parts(art, 'diff');
    const [merge] = parts(art, 'merge');
    const [strike] = parts(art, 'strike');
    const [stamp] = parts(art, 'stamp');
    gsap.set(diff.children, { autoAlpha: 0, x: -10 });
    gsap.set(strike, { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(stamp, { autoAlpha: 0, scale: 1.8, transformOrigin: '50% 50%' });
    return gsap
      .timeline({ paused: true })
      .to(diff.children, { autoAlpha: 1, x: 0, duration: 0.3, stagger: 0.08, ease: 'power2.out' })
      .to(strike, { scaleX: 1, duration: 0.35, ease: 'power2.out' }, '+=0.15')
      .to(merge, { opacity: 0.55, duration: 0.2 }, '<')
      .to(stamp, { autoAlpha: 1, scale: 1, duration: 0.22, ease: 'power4.in' });
  },
  Vote(art) {
    const bars = parts(art, 'vbar');
    const counts = parts(art, 'count');
    const [top] = parts(art, 'top');
    const tally = counts.map(() => ({ n: 0 }));
    gsap.set(bars, { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(top, { autoAlpha: 0 });
    counts.forEach((c) => (c.textContent = '+0'));
    const tl = gsap.timeline({ paused: true }).to(bars, { scaleX: 1, duration: 1.1, stagger: 0.12, ease: 'power2.out' });
    counts.forEach((c, i) => {
      tl.to(
        tally[i],
        { n: Number(c.dataset.n), duration: 1.1, ease: 'power2.out', onUpdate: () => (c.textContent = `+${Math.round(tally[i].n)}`) },
        0.12 * i,
      );
    });
    return tl.to(top, { autoAlpha: 1, duration: 0.3 });
  },
};

export function HowItWorks() {
  const root = useRef<HTMLDivElement>(null);

  // Sticky stack, desktop only: each step buries the one before it.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        const cards = gsap.utils.toArray<HTMLElement>('[data-card]', root.current);
        cards.slice(0, -1).forEach((card, i) => {
          // Dim with a filter, never opacity: the next card must not show through this one.
          // From an explicit brightness(1): tweening from `none` starts at brightness(0).
          gsap.fromTo(
            card.querySelector('[data-card-inner]'),
            { scale: 1, filter: 'brightness(1)' },
            {
              scale: 0.93,
              filter: 'brightness(0.55)',
              ease: 'none',
              scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top top+=64', scrub: true },
            },
          );
        });
      });

      // Each diagram plays once as its card arrives. Reduced motion keeps the final, static diagram.
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const restore: (() => void)[] = [];
        gsap.utils.toArray<HTMLElement>('[data-card]', root.current).forEach((card) => {
          const art = card.querySelector('[data-art]');
          const build = art && BUILD[art.getAttribute('data-art') ?? ''];
          if (!art || !build) return;
          const tl = build(art);
          ScrollTrigger.create({
            trigger: card,
            start: 'top 70%',
            once: true,
            onEnter: () => tl.play(),
            onRefresh: (self) => {
              if (self.progress > 0 && tl.progress() === 0) tl.play();
            },
          });
          restore.push(() => {
            tl.kill();
            art.querySelectorAll<SVGElement>('[data-a="count"]').forEach((c) => (c.textContent = `+${c.dataset.n}`));
          });
        });
        return () => restore.forEach((fn) => fn());
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className={s.section}>
      <div className={s.wrap}>
        <div className={s.sectionHead}>
          <h2 className={`${s.display} ${s.sectionTitle}`}>Fix it on paper</h2>
          <p>The main branch only gets worse. Your fix is an answer, not a patch.</p>
        </div>
        <div className={s.stack}>
          {STEPS.map((step) => (
            <div key={step.title} className={s.stackCard} data-card>
              <div className={s.stackInner} data-card-inner>
                <div className={s.stackCopy}>
                  <h3 className={`${s.display} ${s.stackTitle}`}>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
                <StepArt step={step.title} />
              </div>
            </div>
          ))}
          <div className={s.stackHold} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
