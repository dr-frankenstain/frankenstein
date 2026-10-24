// The drawings behind the brain and nerve tiles. Coordinates are in a 300 x 150 view box.
// The brain's outlet and the arm's inlet sit at the same height, on the right and left edges, so a signal
// leaving one tile lines up with the entrance of the next.
export const VIEW = { w: 300, h: 150 };

// `shapes` are the silhouette (an outline or a thick limb segment); `big` marks the brighter hub cells.
export type Shape = { d: string; thick?: number };
export type Graph = { nodes: { x: number; y: number }[]; edges: [number, number][]; outlet: number; shapes?: Shape[]; big?: number[] };

// Generated once from a side-view brain outline (a triangulated mesh, with a brainstem running out along
// the bottom to the right edge) and from a horizontal arm: shoulder at the left, trunk nerve down the
// middle with branches, fanning into the fingers. Node 0 of the brain is the frontal pole, where signals
// enter; the nerve's edges point away from its inlet (node 0).
export const BRAIN: Graph = {
  nodes: [{ x: 30, y: 44 }, { x: 34, y: 58 }, { x: 36, y: 72 }, { x: 40, y: 28 }, { x: 44, y: 84 }, { x: 50, y: 62 }, { x: 50, y: 42 }, { x: 60, y: 92 }, { x: 62, y: 14 }, { x: 66, y: 65 }, { x: 69, y: 46 }, { x: 74, y: 27 }, { x: 77, y: 10 }, { x: 80, y: 96 }, { x: 85, y: 47 }, { x: 89, y: 82 }, { x: 92, y: 6 }, { x: 92, y: 66 }, { x: 98, y: 31 }, { x: 100, y: 94 }, { x: 106, y: 75 }, { x: 108, y: 46 }, { x: 108, y: 4 }, { x: 117, y: 18 }, { x: 120, y: 35 }, { x: 120, y: 98 }, { x: 122, y: 55 }, { x: 124, y: 74 }, { x: 124, y: 3 }, { x: 135, y: 19 }, { x: 136, y: 42 }, { x: 140, y: 96 }, { x: 141, y: 4 }, { x: 143, y: 78 }, { x: 146, y: 60 }, { x: 157, y: 43 }, { x: 158, y: 5 }, { x: 159, y: 25 }, { x: 160, y: 98 }, { x: 168, y: 67 }, { x: 171, y: 85 }, { x: 174, y: 8 }, { x: 174, y: 34 }, { x: 176, y: 102 }, { x: 179, y: 54 }, { x: 187, y: 78 }, { x: 188, y: 108 }, { x: 190, y: 12 }, { x: 196, y: 54 }, { x: 200, y: 34 }, { x: 204, y: 110 }, { x: 206, y: 92 }, { x: 207, y: 70 }, { x: 214, y: 26 }, { x: 214, y: 98 }, { x: 216, y: 106 }, { x: 218, y: 82 }, { x: 226, y: 46 }, { x: 226, y: 66 }, { x: 172, y: 108 }, { x: 176, y: 120 }, { x: 214, y: 120 }, { x: 256, y: 120 }, { x: 300, y: 120 }],
  edges: [[0, 1], [0, 3], [0, 6], [1, 2], [1, 5], [1, 6], [2, 4], [2, 5], [3, 6], [3, 8], [4, 5], [4, 7], [4, 9], [5, 6], [5, 9], [5, 10], [6, 8], [6, 10], [6, 11], [7, 9], [7, 13], [7, 15], [8, 11], [8, 12], [9, 10], [9, 14], [9, 15], [9, 17], [10, 11], [10, 14], [11, 12], [11, 14], [11, 18], [12, 16], [12, 18], [13, 15], [13, 19], [14, 17], [14, 18], [14, 21], [15, 17], [15, 19], [15, 20], [16, 18], [16, 22], [17, 20], [17, 21], [18, 21], [18, 22], [18, 23], [18, 24], [19, 20], [19, 25], [20, 21], [20, 25], [20, 26], [20, 27], [21, 24], [21, 26], [22, 23], [22, 28], [23, 24], [23, 28], [23, 29], [24, 26], [24, 29], [24, 30], [25, 27], [25, 31], [26, 27], [26, 30], [26, 34], [27, 31], [27, 33], [27, 34], [28, 29], [28, 32], [29, 30], [29, 32], [29, 37], [30, 34], [30, 35], [30, 37], [31, 33], [31, 38], [32, 36], [32, 37], [33, 34], [33, 38], [33, 39], [33, 40], [34, 35], [34, 39], [35, 37], [35, 39], [35, 42], [35, 44], [36, 37], [36, 41], [37, 41], [37, 42], [38, 40], [38, 43], [38, 59], [39, 40], [39, 44], [39, 45], [40, 43], [40, 45], [41, 42], [41, 47], [42, 44], [42, 47], [42, 49], [43, 45], [43, 46], [44, 45], [44, 48], [44, 49], [45, 46], [45, 48], [45, 51], [45, 52], [46, 50], [46, 51], [47, 49], [47, 53], [48, 49], [48, 52], [48, 57], [49, 53], [49, 57], [50, 51], [50, 54], [50, 55], [51, 52], [51, 54], [51, 56], [52, 56], [52, 57], [52, 58], [53, 57], [54, 55], [56, 58], [57, 58], [59, 60], [60, 61], [61, 62], [62, 63]],
  outlet: 63,
  big: [6, 9, 20, 26, 27, 34, 35, 39, 40],
  shapes: [{ d: 'M34 58 L30 44 L40 28 L62 14 L92 6 L124 3 L158 5 L190 12 L214 26 L226 46 L226 66 L218 82 L206 92 L214 98 L216 106 L204 110 L188 108 L176 102 L160 98 L140 96 L120 98 L100 94 L80 96 L60 92 L44 84 L36 72 Z' }],
};

export const NERVE: Graph = {
  nodes: [{ x: 0, y: 120 }, { x: 35, y: 114 }, { x: 71, y: 108 }, { x: 116, y: 100 }, { x: 163, y: 92 }, { x: 209, y: 83 }, { x: 234, y: 79 }, { x: 53, y: 98 }, { x: 75, y: 85 }, { x: 72, y: 102 }, { x: 57, y: 123 }, { x: 83, y: 127 }, { x: 74, y: 113 }, { x: 89, y: 93 }, { x: 111, y: 81 }, { x: 107, y: 96 }, { x: 93, y: 115 }, { x: 118, y: 119 }, { x: 109, y: 106 }, { x: 134, y: 86 }, { x: 157, y: 75 }, { x: 153, y: 89 }, { x: 138, y: 106 }, { x: 162, y: 109 }, { x: 154, y: 97 }, { x: 181, y: 79 }, { x: 203, y: 69 }, { x: 199, y: 81 }, { x: 184, y: 97 }, { x: 208, y: 98 }, { x: 201, y: 89 }, { x: 227, y: 72 }, { x: 250, y: 63 }, { x: 246, y: 73 }, { x: 230, y: 87 }, { x: 254, y: 88 }, { x: 247, y: 80 }, { x: 256, y: 63 }, { x: 290, y: 47 }, { x: 257, y: 69 }, { x: 292, y: 57 }, { x: 258, y: 75 }, { x: 293, y: 68 }, { x: 259, y: 80 }, { x: 295, y: 79 }, { x: 260, y: 86 }, { x: 297, y: 90 }, { x: 246, y: 62 }, { x: 259, y: 47 }, { x: 273, y: 34 }],
  edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [1, 7], [7, 8], [7, 9], [1, 10], [10, 11], [10, 12], [2, 13], [13, 14], [13, 15], [2, 16], [16, 17], [16, 18], [3, 19], [19, 20], [19, 21], [3, 22], [22, 23], [22, 24], [4, 25], [25, 26], [25, 27], [4, 28], [28, 29], [28, 30], [5, 31], [31, 32], [31, 33], [5, 34], [34, 35], [34, 36], [6, 37], [37, 38], [6, 39], [39, 40], [6, 41], [41, 42], [6, 43], [43, 44], [6, 45], [45, 46], [6, 47], [47, 48], [48, 49]],
  outlet: -1,
  shapes: [{ d: 'M-5 93 L15 91 L35 88 L55 86 L75 84 L95 82 L115 80 L135 77 L154 75 L174 72 L194 70 L208 68 L233 61 L239 96 L213 98 L200 101 L180 105 L161 110 L141 114 L122 119 L102 123 L83 128 L63 133 L44 138 L24 142 L5 147 Z' }, { d: 'M235 73 L 288 47', thick: 10 }, { d: 'M236 76 L 290 58', thick: 10 }, { d: 'M236 78 L 292 69', thick: 10 }, { d: 'M237 81 L 293 79', thick: 10 }, { d: 'M237 84 L 295 90', thick: 10 }, { d: 'M231 71 L 273 34', thick: 10 }],
};

export const neighborsOf = (g: Graph, i: number): number[] =>
  g.edges.flatMap(([a, b]) => (a === i ? [b] : b === i ? [a] : []));

export const childrenOf = (g: Graph, i: number): number[] => g.edges.filter(([a]) => a === i).map(([, b]) => b);

export const edgeLength = (g: Graph, a: number, b: number): number =>
  Math.hypot(g.nodes[a].x - g.nodes[b].x, g.nodes[a].y - g.nodes[b].y);

// Shortest hop path between two cells.
export function routeBetween(g: Graph, from: number, to: number): number[] {
  const prev = new Map<number, number>([[from, -1]]);
  const queue = [from];
  while (queue.length && !prev.has(to)) {
    const i = queue.shift()!;
    for (const n of neighborsOf(g, i)) if (!prev.has(n)) (prev.set(n, i), queue.push(n));
  }
  const path: number[] = [];
  for (let i = to; i !== -1 && prev.has(i); i = prev.get(i)!) path.unshift(i);
  return path;
}

export const routeToOutlet = (g: Graph, from: number): number[] => routeBetween(g, from, g.outlet);

// The brain tells the nerve tile when a signal leaves through the outlet.
export const brainSignal: EventTarget = typeof EventTarget === 'undefined' ? ({} as EventTarget) : new EventTarget();
