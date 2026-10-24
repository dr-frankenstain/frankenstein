// The drawings behind the brain and nerve tiles. Coordinates are in a 300 x 90 view box.
export const VIEW = { w: 300, h: 90 };

export type Graph = { nodes: { x: number; y: number }[]; edges: [number, number][]; outlet: number };

// Brain cells passing signals between each other. Node 0 is where signals enter; `outlet` sits on the
// right edge, next to the nerve tile.
export const BRAIN: Graph = {
  nodes: [
    { x: 14, y: 46 }, { x: 56, y: 18 }, { x: 60, y: 70 }, { x: 104, y: 40 }, { x: 112, y: 78 },
    { x: 150, y: 14 }, { x: 156, y: 56 }, { x: 204, y: 30 }, { x: 212, y: 74 }, { x: 256, y: 48 },
    { x: 300, y: 46 },
  ],
  edges: [
    [0, 1], [0, 2], [1, 3], [2, 3], [2, 4], [3, 5], [3, 6], [4, 6], [5, 7], [6, 7], [6, 8], [7, 9], [8, 9], [9, 10], [1, 5],
  ],
  outlet: 10,
};

// A nerve fanning out from the inlet on the left edge, where the brain's signal arrives.
// Edges point away from the inlet.
export const NERVE: Graph = {
  nodes: [
    { x: 0, y: 46 }, { x: 34, y: 46 }, { x: 70, y: 46 }, { x: 104, y: 22 }, { x: 108, y: 46 },
    { x: 104, y: 70 }, { x: 148, y: 10 }, { x: 150, y: 32 }, { x: 154, y: 52 }, { x: 148, y: 80 },
    { x: 198, y: 18 }, { x: 206, y: 40 }, { x: 200, y: 62 }, { x: 194, y: 84 }, { x: 250, y: 8 },
    { x: 246, y: 28 }, { x: 262, y: 46 }, { x: 256, y: 68 }, { x: 244, y: 84 }, { x: 292, y: 22 },
    { x: 296, y: 56 },
  ],
  edges: [
    [0, 1], [1, 2], [2, 3], [2, 4], [2, 5], [3, 6], [3, 7], [4, 8], [5, 9], [7, 10], [8, 11], [8, 12],
    [9, 13], [10, 14], [10, 15], [11, 16], [12, 17], [13, 18], [15, 19], [16, 20],
  ],
  outlet: -1,
};

export const neighborsOf = (g: Graph, i: number): number[] =>
  g.edges.flatMap(([a, b]) => (a === i ? [b] : b === i ? [a] : []));

export const childrenOf = (g: Graph, i: number): number[] => g.edges.filter(([a]) => a === i).map(([, b]) => b);

export const edgeLength = (g: Graph, a: number, b: number): number =>
  Math.hypot(g.nodes[a].x - g.nodes[b].x, g.nodes[a].y - g.nodes[b].y);

// Shortest hop path from `from` to the outlet.
export function routeToOutlet(g: Graph, from: number): number[] {
  const prev = new Map<number, number>([[from, -1]]);
  const queue = [from];
  while (queue.length) {
    const i = queue.shift()!;
    if (i === g.outlet) break;
    for (const n of neighborsOf(g, i)) if (!prev.has(n)) (prev.set(n, i), queue.push(n));
  }
  const path: number[] = [];
  for (let i = g.outlet; i !== -1 && prev.has(i); i = prev.get(i)!) path.unshift(i);
  return path;
}

// The brain tells the nerve tile when a signal leaves through the outlet.
export const brainSignal: EventTarget = typeof EventTarget === 'undefined' ? ({} as EventTarget) : new EventTarget();
