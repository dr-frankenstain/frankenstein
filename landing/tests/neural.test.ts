import { describe, expect, it } from 'vitest';
import { BRAIN, NERVE, VIEW, childrenOf, edgeLength, neighborsOf, routeToOutlet } from '../lib/neural';

const inside = (g: { nodes: { x: number; y: number }[] }) =>
  g.nodes.every((n) => n.x >= 0 && n.x <= VIEW.w && n.y >= 0 && n.y <= VIEW.h);

describe('brain graph', () => {
  it('keeps every cell inside the drawing and every edge between real cells', () => {
    expect(inside(BRAIN)).toBe(true);
    expect(BRAIN.edges.every(([a, b]) => BRAIN.nodes[a] && BRAIN.nodes[b] && a !== b)).toBe(true);
  });

  it('has an outlet on the right edge that the first cell can reach', () => {
    expect(BRAIN.nodes[BRAIN.outlet].x).toBe(VIEW.w);
    const route = routeToOutlet(BRAIN, 0);
    expect(route[0]).toBe(0);
    expect(route[route.length - 1]).toBe(BRAIN.outlet);
    route.slice(1).forEach((n, i) => expect(neighborsOf(BRAIN, route[i])).toContain(n));
  });

  it('is one connected network', () => {
    const seen = new Set([0]);
    const queue = [0];
    while (queue.length) for (const n of neighborsOf(BRAIN, queue.shift()!)) if (!seen.has(n)) (seen.add(n), queue.push(n));
    expect(seen.size).toBe(BRAIN.nodes.length);
  });
});

describe('nerve graph', () => {
  it('starts at the left edge, where the brain signal arrives', () => {
    expect(NERVE.nodes[0].x).toBe(0);
    expect(inside(NERVE)).toBe(true);
  });

  it('is a tree from the inlet: every other node has exactly one parent', () => {
    for (let i = 1; i < NERVE.nodes.length; i++) {
      expect(NERVE.edges.filter(([, to]) => to === i)).toHaveLength(1);
    }
    expect(NERVE.edges.filter(([, to]) => to === 0)).toHaveLength(0);
  });

  it('reaches every node from the inlet, branching more than once', () => {
    const seen = new Set([0]);
    const queue = [0];
    while (queue.length) for (const c of childrenOf(NERVE, queue.shift()!)) (seen.add(c), queue.push(c));
    expect(seen.size).toBe(NERVE.nodes.length);
    expect(NERVE.nodes.filter((_, i) => childrenOf(NERVE, i).length > 1).length).toBeGreaterThan(2);
  });

  it('has a positive length for every edge', () => {
    expect(NERVE.edges.every(([a, b]) => edgeLength(NERVE, a, b) > 0)).toBe(true);
  });

  it('draws no silhouette behind the nerves', () => {
    expect(NERVE.shapes).toBeUndefined();
  });

  it('ends in fingers of different lengths, clear of the right edge', () => {
    const tips = NERVE.nodes.filter((n, i) => n.x > 240 && childrenOf(NERVE, i).length === 0);
    expect(tips.length).toBeGreaterThanOrEqual(5);
    expect(new Set(tips.map((n) => n.x)).size).toBeGreaterThanOrEqual(4);
    expect(Math.max(...NERVE.nodes.map((n) => n.x))).toBeLessThanOrEqual(VIEW.w - 16);
  });
});
