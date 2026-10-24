'use client';

import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap';
import type { Year } from '../lib/lore';
import s from '../styles/landing.module.css';
import { LoreArt } from './LoreArt';

const PANELS: { year: Year; title: string; text: string }[] = [
  { year: 2014, title: 'A PHP monolith', text: "The founder's cousin built it. It worked, mostly, and nobody wrote anything down." },
  { year: 2019, title: 'Half a rewrite', text: 'A new team ported the backend to Python on half a budget. Payments and PDFs stayed behind in the old PHP service.' },
  { year: 2021, title: 'Go and Redis, bolted on', text: 'To survive a big on-sale, someone wired a Go service straight into the old PHP, around the new API. That team is gone too.' },
  { year: 2023, title: 'A new face', text: 'A contractor rewrote the frontend in Next.js, then left mid-project.' },
  { year: 2026, title: 'Open for repair', text: 'The repository goes public. Dr. Frankenstein files every known flaw as an issue, and keeps adding new ones.' },
];

// Fractions of the pan distance spent standing still on the first and last panel.
const HOLD_START = 0.2;
const HOLD_END = 0.35;

// Each panel's drawing starts with its new pieces hidden and plays them once, as the panel arrives.
function prepareArt(panel: Element): () => void {
  const pieces = gsap.utils.toArray<SVGElement>('[data-new]', panel);
  const parts = pieces.filter((p) => p.dataset.kind === 'part');
  const links = pieces.filter((p) => p.dataset.kind === 'link');
  const flaws = pieces.filter((p) => p.dataset.kind === 'flaw');
  gsap.set(parts, { autoAlpha: 0, scale: 0.85, transformOrigin: '50% 50%' });
  gsap.set(links, { strokeDasharray: 1, strokeDashoffset: 1 });
  gsap.set(flaws, { autoAlpha: 0, scale: 0, transformOrigin: '50% 50%' });
  const tl = gsap
    .timeline({ paused: true })
    .to(parts, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(2)', stagger: 0.12 })
    .to(links, { strokeDashoffset: 0, duration: 0.6, ease: 'power1.inOut', stagger: 0.1 }, '<0.2')
    .to(flaws, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'back.out(3)', stagger: 0.12 });
  return () => tl.play();
}

export function Lore() {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  // Pinned horizontal pan, desktop only: the story is a sequence of years.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        // Without JS the track scrolls sideways by hand; the pan takes over only while this runs.
        const el = root.current!;
        el.setAttribute('data-pinned', '');
        const distance = () => track.current!.scrollWidth - window.innerWidth;
        const panels = gsap.utils.toArray<HTMLElement>('[data-lore-panel]', el);
        const plays = new Map<Element, () => void>(panels.map((p) => [p, prepareArt(p)]));
        const arrived = () => {
          for (const [panel, play] of plays) {
            if (panel.getBoundingClientRect().left < window.innerWidth * 0.7) {
              play();
              plays.delete(panel);
            }
          }
        };
        // The pan holds on the first and last panel: extra scroll distance with the track at rest.
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: root.current,
              start: 'top top',
              end: () => `+=${distance() * (1 + HOLD_START + HOLD_END)}`,
              pin: true,
              scrub: 1,
              invalidateOnRefresh: true,
              onUpdate: arrived,
              onRefresh: arrived,
            },
          })
          .to({}, { duration: HOLD_START })
          .to(track.current, { x: () => -distance(), duration: 1 })
          .to({}, { duration: HOLD_END });
        return () => el.removeAttribute('data-pinned');
      });

      // Mobile: the panels stack vertically, so each drawing plays as its panel scrolls in.
      mm.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray<HTMLElement>('[data-lore-panel]', root.current).forEach((panel) => {
          const play = prepareArt(panel);
          ScrollTrigger.create({ trigger: panel, start: 'top 80%', once: true, onEnter: play });
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className={s.lore}>
      <div ref={track} className={s.loreTrack}>
        <article className={`${s.lorePanel} ${s.loreIntro}`}>
          <h2 className={`${s.display} ${s.loreHeading}`}>How the monster got built</h2>
          <p>Nobody planned this. It accumulated.</p>
        </article>
        {PANELS.map((p) => (
          <article key={p.year} className={`${s.lorePanel} ${s.loreWithArt}`} data-lore-panel>
            <div>
              <div className={s.loreYear}>{p.year}</div>
              <h3 className={`${s.display} ${s.loreTitle}`}>{p.title}</h3>
              <p>{p.text}</p>
            </div>
            <LoreArt year={p.year} />
          </article>
        ))}
        <article className={`${s.lorePanel} ${s.loreLast}`}>
          <div className={s.loreYear}>Nobody has the full picture.<br />Now it&apos;s your turn.</div>
        </article>
      </div>
    </div>
  );
}
