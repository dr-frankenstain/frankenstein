export type Pt = { x: number; y: number };

// Midpoint displacement: the same shape of bolt as the approved draft.
export function jaggedPath(
  a: Pt,
  b: Pt,
  rng: () => number,
  opts: { roughness?: number; minSegment?: number } = {},
): Pt[] {
  const roughness = opts.roughness ?? 0.35;
  const minSegment = opts.minSegment ?? 3;
  const out: Pt[] = [a];
  const split = (p: Pt, q: Pt, disp: number) => {
    if (disp < minSegment) {
      out.push(q);
      return;
    }
    const m = { x: (p.x + q.x) / 2 + (rng() - 0.5) * disp, y: (p.y + q.y) / 2 + (rng() - 0.5) * disp };
    split(p, m, disp / 2);
    split(m, q, disp / 2);
  };
  split(a, b, Math.hypot(b.x - a.x, b.y - a.y) * roughness);
  return out;
}

export function makeBolt(a: Pt, b: Pt, rng: () => number, branches = 2): Pt[][] {
  const main = jaggedPath(a, b, rng);
  const paths = [main];
  const span = Math.hypot(b.x - a.x, b.y - a.y);
  for (let i = 0; i < branches; i++) {
    const start = main[Math.floor(main.length * (0.3 + rng() * 0.4))];
    const end = { x: start.x + (rng() - 0.5) * span * 0.5, y: start.y + span * (0.12 + rng() * 0.2) };
    paths.push(jaggedPath(start, end, rng));
  }
  return paths;
}
