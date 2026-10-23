import { gsap } from './gsap';
import { jaggedPath, makeBolt, Pt } from './bolt';
import { mulberry32 } from './rng';

export type LightningLayer = {
  strike(from: Pt, to: Pt): void;
  strikeAlong(points: Pt[]): void;
  showStatic(from: Pt, to: Pt): void;
  clear(): void;
  destroy(): void;
};

// The one shared layer: components reach it through this ref instead of owning a canvas each.
export const lightning: { current: LightningLayer | null } = { current: null };

const LIFE = 0.4;
type Live = { paths: Pt[][]; born: number; life: number; thin: boolean };

export function createLightningLayer(canvas: HTMLCanvasElement, opts: { reducedMotion: boolean }): LightningLayer {
  const ctx = canvas.getContext('2d')!;
  const rng = mulberry32(Math.floor(Math.random() * 2 ** 31));
  let live: Live[] = [];
  let still: Pt[][] | null = null;
  let dirty = false;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dirty = true;
    if (still) draw(still, 0.8, false);
  };

  // Two passes (soft wide, bright thin) in the one accent. Alpha only ever decays.
  function draw(paths: Pt[][], alpha: number, thin: boolean) {
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    paths.forEach((path, index) => {
      for (const [width, a] of [[6, 0.1], [1.6, 0.9]]) {
        ctx.beginPath();
        ctx.lineWidth = width * (index || thin ? 0.6 : 1);
        ctx.strokeStyle = `rgba(163,230,53,${a * alpha})`;
        path.forEach((pt, i) => (i ? ctx.lineTo(pt.x, pt.y) : ctx.moveTo(pt.x, pt.y)));
        ctx.stroke();
      }
    });
  }

  const tick = () => {
    if (!live.length) {
      if (dirty && !still) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        dirty = false;
      }
      return;
    }
    const now = gsap.ticker.time;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    live = live.filter((b) => now - b.born < b.life);
    for (const b of live) {
      const k = 1 - (now - b.born) / b.life;
      draw(b.paths, k * k, b.thin);
    }
    if (still) draw(still, 0.8, false);
    dirty = true;
  };

  resize();
  window.addEventListener('resize', resize);
  gsap.ticker.add(tick);

  return {
    strike(from, to) {
      if (opts.reducedMotion) return;
      live.push({ paths: makeBolt(from, to, rng), born: gsap.ticker.time, life: LIFE, thin: false });
    },
    strikeAlong(points) {
      if (opts.reducedMotion || points.length < 2) return;
      const path: Pt[] = [];
      for (let i = 1; i < points.length; i++) {
        path.push(...jaggedPath(points[i - 1], points[i], rng, { roughness: 0.25, minSegment: 2 }));
      }
      live.push({ paths: [path], born: gsap.ticker.time, life: LIFE, thin: true });
    },
    showStatic(from, to) {
      still = makeBolt(from, to, rng);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      draw(still, 0.8, false);
    },
    clear() {
      still = null;
      live = [];
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    },
    destroy() {
      gsap.ticker.remove(tick);
      window.removeEventListener('resize', resize);
      still = null;
      live = [];
    },
  };
}
