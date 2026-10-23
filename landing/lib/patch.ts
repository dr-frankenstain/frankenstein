import { mulberry32 } from './rng';

// x is a fraction of the width (0..1); y is pixels below the patch's top edge (0..depth).
export type EdgePoint = { x: number; y: number };
export type Stitch = { x1: number; y1: number; x2: number; y2: number };

export function cutEdge(seed: number, opts: { depth?: number; steps?: number } = {}): EdgePoint[] {
  const depth = opts.depth ?? 28;
  const steps = opts.steps ?? 14;
  const rng = mulberry32(seed);
  const points: EdgePoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = i === 0 ? 0 : i === steps ? 1 : (i + (rng() - 0.5) * 0.6) / steps;
    points.push({ x, y: rng() * depth });
  }
  return points;
}

export function clipPathFor(edge: EdgePoint[]): string {
  const top = edge.map((p) => `${+(p.x * 100).toFixed(3)}% ${+p.y.toFixed(1)}px`);
  return `polygon(${[...top, '100% 100%', '0% 100%'].join(', ')})`;
}

export function stitchesFor(
  edge: EdgePoint[],
  width: number,
  opts: { spacing?: number; length?: number } = {},
): Stitch[] {
  const spacing = opts.spacing ?? 22;
  const length = opts.length ?? 14;
  const stitches: Stitch[] = [];
  const count = Math.floor(width / spacing);
  for (let k = 0; k < count; k++) {
    const x = (k + 0.5) * spacing;
    const f = x / width;
    let i = 1;
    while (i < edge.length - 1 && f > edge[i].x) i++;
    const p = edge[i - 1];
    const q = edge[i];
    const t = (f - p.x) / (q.x - p.x);
    const y = p.y + t * (q.y - p.y);
    const dx = (q.x - p.x) * width;
    const dy = q.y - p.y;
    const norm = Math.hypot(dx, dy);
    const nx = -dy / norm;
    const ny = dx / norm;
    const h = length / 2;
    stitches.push({ x1: x - nx * h, y1: y - ny * h, x2: x + nx * h, y2: y + ny * h });
  }
  return stitches;
}
