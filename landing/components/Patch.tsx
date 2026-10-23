'use client';

import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { gsap, useGSAP } from '../lib/gsap';
import { lightning } from '../lib/lightning';
import { clipPathFor, cutEdge, stitchesFor } from '../lib/patch';
import s from '../styles/landing.module.css';

// The seam overlay reaches past the cut edge so stitches cross it.
const SEAM_PAD = 8;
const SEAM_HEIGHT = 28 + SEAM_PAD * 2;

export function Patch({ id, seed, tilt, children }: { id?: string; seed: number; tilt: 1 | -1; children: ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const seam = useRef<SVGSVGElement>(null);
  const sparked = useRef(false);
  const edge = useMemo(() => cutEdge(seed), [seed]);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = wrap.current!;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const stitches = useMemo(() => (width ? stitchesFor(edge, width) : []), [edge, width]);

  useGSAP(
    () => {
      const el = wrap.current!;
      const lines = gsap.utils.toArray<SVGLineElement>('line', seam.current);
      if (!lines.length) return;
      const mm = gsap.matchMedia();

      // A transformed ancestor breaks pinning, so the settle never leaves a transform behind.
      const rest = () => gsap.set(el, { clearProps: 'transform' });
      const spark = () => {
        if (sparked.current) return;
        sparked.current = true;
        const r = el.getBoundingClientRect();
        lightning.current?.strikeAlong(edge.map((p) => ({ x: r.left + p.x * r.width, y: r.top + p.y })));
      };

      mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        gsap.set(lines, { strokeDashoffset: 1 });
        gsap
          .timeline({
            scrollTrigger: {
              trigger: el,
              start: 'top 92%',
              end: 'top 45%',
              scrub: true,
              onRefresh: (self) => {
                if (self.progress === 1) rest();
              },
              onLeave: () => {
                rest();
                spark();
              },
            },
          })
          .fromTo(
            el,
            { rotation: tilt, y: 24, transformOrigin: tilt > 0 ? '0% 0%' : '100% 0%' },
            { rotation: 0, y: 0, ease: 'none' },
            0,
          )
          .to(lines, { strokeDashoffset: 0, ease: 'none', stagger: { each: 0.4 / lines.length } }, 0);
      });

      mm.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
        gsap.set(lines, { strokeDashoffset: 1 });
        gsap.to(lines, {
          strokeDashoffset: 0,
          duration: 0.8,
          stagger: { each: 0.6 / lines.length },
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        });
      });
    },
    { scope: wrap, dependencies: [stitches.length] },
  );

  return (
    <div ref={wrap} className={s.patch} data-patch>
      <section id={id} className={s.patchBody} style={{ clipPath: clipPathFor(edge) }}>
        {children}
      </section>
      <svg
        ref={seam}
        className={s.seam}
        width={width}
        height={SEAM_HEIGHT}
        viewBox={`0 0 ${width} ${SEAM_HEIGHT}`}
        aria-hidden="true"
        focusable="false"
      >
        {stitches.map((st, i) => (
          <line key={i} x1={st.x1} y1={st.y1 + SEAM_PAD} x2={st.x2} y2={st.y2 + SEAM_PAD} pathLength={1} />
        ))}
      </svg>
    </div>
  );
}
