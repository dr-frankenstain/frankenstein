'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '../lib/gsap';
import { BRAIN, NERVE, VIEW, brainSignal, childrenOf, edgeLength, neighborsOf, routeBetween, type Graph } from '../lib/neural';
import s from '../styles/landing.module.css';

const ACCENT = '#a3e635';
const NODE = '#0f1311';
const EDGE = '#6c746e';
const POOL = 16;
const SPEED = 110; // view-box units per second

function Drawing({ graph, svg }: { graph: Graph; svg: React.RefObject<SVGSVGElement | null> }) {
  return (
    <svg ref={svg} className={s.neural} viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} aria-hidden="true" focusable="false">
      {graph.shapes?.map((sh, i) =>
        sh.thick ? (
          <path key={`s${i}`} className={s.neuralDigit} d={sh.d} strokeWidth={sh.thick} />
        ) : (
          <path key={`s${i}`} className={s.neuralShape} d={sh.d} />
        ),
      )}
      {graph.edges.map(([a, b], i) => (
        <line
          key={i}
          data-e={`${a}-${b}`}
          className={s.neuralEdge}
          x1={graph.nodes[a].x}
          y1={graph.nodes[a].y}
          x2={graph.nodes[b].x}
          y2={graph.nodes[b].y}
        />
      ))}
      {graph.nodes.map((n, i) => {
        const hub = graph.big?.includes(i);
        return (
          <circle
            key={i}
            data-n={i}
            className={i === graph.outlet ? s.neuralOutlet : hub ? s.neuralHub : s.neuralNode}
            cx={n.x}
            cy={n.y}
            r={i === graph.outlet ? 3 : hub ? 3.4 : 2.2}
          />
        );
      })}
      {Array.from({ length: POOL }, (_, i) => (
        <circle key={i} data-p className={s.neuralPulse} r="2.5" cx="0" cy="0" opacity="0" />
      ))}
    </svg>
  );
}

// Shared machinery: a pool of pulses that travel along edges, and nodes that flash when one arrives.
// Everything is created inside one gsap context, so cleanup reverts it all at once.
function useSignals(svg: React.RefObject<SVGSVGElement | null>, graph: Graph, active: boolean, extra: unknown, start: (api: Api) => () => void) {
  useGSAP(
    () => {
      if (!active) return;
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const el = svg.current!;
        const ctx = gsap.context(() => {}, el);
        const nodes = gsap.utils.toArray<SVGCircleElement>('[data-n]', el);
        const free = gsap.utils.toArray<SVGCircleElement>('[data-p]', el);
        const edgeOf = (a: number, b: number) =>
          el.querySelector<SVGLineElement>(`[data-e="${a}-${b}"]`) ?? el.querySelector<SVGLineElement>(`[data-e="${b}-${a}"]`);
        let visible = true;

        const api: Api = {
          visible: () => visible,
          run: (fn) => ctx.add(fn) as void,
          flash: (i) => {
            gsap.fromTo(nodes[i], { fill: ACCENT, scale: 2, transformOrigin: '50% 50%' }, { fill: NODE, scale: 1, duration: 0.7, ease: 'power2.out', overwrite: 'auto' });
          },
          // Returns false when the pool is empty (the signal is simply dropped).
          send: (a, b, done) => {
            const p = free.pop();
            if (!p) return false;
            const from = graph.nodes[a];
            const to = graph.nodes[b];
            gsap.set(p, { attr: { cx: from.x, cy: from.y }, opacity: 1 });
            const edge = edgeOf(a, b);
            if (edge) gsap.fromTo(edge, { stroke: ACCENT }, { stroke: EDGE, duration: 1, ease: 'power1.out', overwrite: 'auto' });
            gsap.to(p, {
              attr: { cx: to.x, cy: to.y },
              duration: edgeLength(graph, a, b) / SPEED,
              ease: 'none',
              onComplete: () => {
                gsap.set(p, { opacity: 0 });
                free.push(p);
                done();
              },
            });
            return true;
          },
        };

        const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
        io.observe(el);
        const stop = start(api);
        return () => {
          stop();
          io.disconnect();
          ctx.revert();
        };
      });
    },
    { scope: svg, dependencies: [active, extra] },
  );
}

type Api = {
  visible: () => boolean;
  run: (fn: () => void) => void;
  flash: (i: number) => void;
  send: (a: number, b: number, done: () => void) => boolean;
};

// Brain cells pass signals to each other at random; now and then one leaves through the outlet, toward the nerve.
export function BrainArt({ active }: { active: boolean }) {
  const svg = useRef<SVGSVGElement>(null);
  useSignals(svg, BRAIN, active, null, (api) => {
    let alive = true;
    let timer: gsap.core.Tween | null = null;

    const cascade = (at: number, from: number, depth: number) => {
      api.flash(at);
      if (at === BRAIN.outlet) brainSignal.dispatchEvent(new Event('fire'));
      if (depth <= 0) return;
      const options = neighborsOf(BRAIN, at).filter((n) => n !== from);
      const next = options.length ? options : neighborsOf(BRAIN, at);
      const fanout = Math.random() < 0.4 ? 2 : 1;
      [...next].sort(() => Math.random() - 0.5).slice(0, fanout).forEach((n) => api.send(at, n, () => api.run(() => cascade(n, at, depth - 1))));
    };

    // A deliberate path from the entrance to the outlet, hop by hop.
    const route = (path: number[], i = 0) => {
      api.flash(path[i]);
      if (i === path.length - 1) return brainSignal.dispatchEvent(new Event('fire'));
      api.send(path[i], path[i + 1], () => api.run(() => route(path, i + 1)));
    };

    let n = 0;
    const tick = () => {
      if (!alive) return;
      if (api.visible()) {
        if (n++ % 3 === 0) route(entranceRoute());
        else cascade(Math.floor(Math.random() * BRAIN.nodes.length), -1, 3);
      }
      timer = gsap.delayedCall(0.7 + Math.random() * 0.9, () => api.run(tick));
    };
    // Pass through a random cell on the way, so the signal does not always take the same path.
    const entranceRoute = (): number[] => {
      const via = Math.floor(Math.random() * (BRAIN.nodes.length - 6));
      return [...routeBetween(BRAIN, 0, via), ...routeBetween(BRAIN, via, BRAIN.outlet).slice(1)];
    };
    api.run(tick);
    return () => {
      alive = false;
      timer?.kill();
    };
  });
  return <Drawing graph={BRAIN} svg={svg} />;
}

// A signal from the brain tile enters on the left and spreads along every branch of the nerve.
export function NerveArt({ active, brainActive }: { active: boolean; brainActive: boolean }) {
  const svg = useRef<SVGSVGElement>(null);
  useSignals(svg, NERVE, active, brainActive, (api) => {
    let alive = true;
    let running = false;
    let timer: gsap.core.Tween | null = null;

    let pending = 0;
    const spread = (at: number) => {
      api.flash(at);
      for (const child of childrenOf(NERVE, at)) {
        pending++;
        const sent = api.send(at, child, () => {
          pending--;
          api.run(() => spread(child));
          if (pending === 0) running = false;
        });
        if (!sent) pending--;
      }
      if (pending === 0) running = false;
    };

    const wave = () => {
      if (!alive || running || !api.visible()) return;
      running = true;
      api.run(() => spread(0));
    };

    const onFire = () => setTimeout(() => alive && wave(), 120);
    brainSignal.addEventListener('fire', onFire);

    // With no live brain to signal, the nerve fires on its own now and then.
    const idle = () => {
      if (!alive) return;
      if (!brainActive) wave();
      timer = gsap.delayedCall(4.5, () => api.run(idle));
    };
    api.run(idle);

    return () => {
      alive = false;
      timer?.kill();
      brainSignal.removeEventListener('fire', onFire);
    };
  });
  return <Drawing graph={NERVE} svg={svg} />;
}
