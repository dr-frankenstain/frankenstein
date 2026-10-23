import { describe, expect, it } from 'vitest';
import { jaggedPath, makeBolt, Pt } from '../lib/bolt';
import { clipPathFor, cutEdge, stitchesFor } from '../lib/patch';
import { mulberry32 } from '../lib/rng';

const a: Pt = { x: 0, y: 0 };
const b: Pt = { x: 300, y: 400 };

describe('mulberry32', () => {
  it('is deterministic and in range', () => {
    const r1 = mulberry32(7);
    const r2 = mulberry32(7);
    for (let i = 0; i < 50; i++) {
      const v = r1();
      expect(v).toBe(r2());
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('bolt', () => {
  it('jaggedPath starts at a and ends at b', () => {
    const p = jaggedPath(a, b, mulberry32(1));
    expect(p[0]).toEqual(a);
    expect(p[p.length - 1]).toEqual(b);
    expect(p.length).toBeGreaterThan(4);
  });

  it('jaggedPath is deterministic per seed and differs across seeds', () => {
    expect(jaggedPath(a, b, mulberry32(1))).toEqual(jaggedPath(a, b, mulberry32(1)));
    expect(jaggedPath(a, b, mulberry32(1))).not.toEqual(jaggedPath(a, b, mulberry32(2)));
  });

  it('makeBolt returns a main path plus N branches that start on the main path', () => {
    const paths = makeBolt(a, b, mulberry32(3), 3);
    expect(paths).toHaveLength(4);
    for (const branch of paths.slice(1)) {
      expect(paths[0]).toContainEqual(branch[0]);
    }
    expect(makeBolt(a, b, mulberry32(3))).toHaveLength(3);
  });
});

describe('cutEdge', () => {
  it('is deterministic and stays inside 0..depth', () => {
    const e = cutEdge(11);
    expect(e).toEqual(cutEdge(11));
    expect(e).not.toEqual(cutEdge(12));
    for (const p of e) {
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(28);
    }
    for (const p of cutEdge(5, { depth: 10 })) expect(p.y).toBeLessThanOrEqual(10);
  });

  it('spans x 0 to 1 strictly increasing', () => {
    const e = cutEdge(23);
    expect(e[0].x).toBe(0);
    expect(e[e.length - 1].x).toBe(1);
    for (let i = 1; i < e.length; i++) expect(e[i].x).toBeGreaterThan(e[i - 1].x);
  });

  it('clipPathFor opens with polygon( and closes through 100% 100%, 0% 100%', () => {
    const c = clipPathFor(cutEdge(23));
    expect(c.startsWith('polygon(0% ')).toBe(true);
    expect(c.endsWith('100% 100%, 0% 100%)')).toBe(true);
  });
});

describe('stitchesFor', () => {
  const edge = cutEdge(37);
  const width = 1000;
  const stitches = stitchesFor(edge, width);

  const edgeY = (x: number) => {
    const f = x / width;
    for (let i = 1; i < edge.length; i++) {
      if (f <= edge[i].x) {
        const t = (f - edge[i - 1].x) / (edge[i].x - edge[i - 1].x);
        return edge[i - 1].y + t * (edge[i].y - edge[i - 1].y);
      }
    }
    return edge[edge.length - 1].y;
  };

  it('yields about width/spacing stitches', () => {
    expect(Math.abs(stitches.length - width / 22)).toBeLessThanOrEqual(2);
  });

  it('puts every stitch midpoint on the edge polyline', () => {
    for (const s of stitches) {
      const mx = (s.x1 + s.x2) / 2;
      const my = (s.y1 + s.y2) / 2;
      expect(Math.abs(my - edgeY(mx))).toBeLessThan(0.5);
    }
  });

  it('makes every stitch perpendicular to the edge segment it crosses', () => {
    for (const s of stitches) {
      const mx = (s.x1 + s.x2) / 2 / width;
      let i = 1;
      while (i < edge.length - 1 && mx > edge[i].x) i++;
      const dx = (edge[i].x - edge[i - 1].x) * width;
      const dy = edge[i].y - edge[i - 1].y;
      const sx = s.x2 - s.x1;
      const sy = s.y2 - s.y1;
      const dot = (dx * sx + dy * sy) / (Math.hypot(dx, dy) * Math.hypot(sx, sy));
      expect(Math.abs(dot)).toBeLessThan(1e-6);
    }
  });

  it('gives every stitch the requested length', () => {
    for (const s of stitches) expect(Math.hypot(s.x2 - s.x1, s.y2 - s.y1)).toBeCloseTo(14, 6);
    for (const s of stitchesFor(edge, width, { length: 20 })) {
      expect(Math.hypot(s.x2 - s.x1, s.y2 - s.y1)).toBeCloseTo(20, 6);
    }
  });
});
