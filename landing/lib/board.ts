import type { Issue } from './issues';

export type SortKey = 'stack' | 'newest' | 'oldest' | 'route' | 'tags';

export type BoardState = {
  query: string;
  stack: string | null;
  tags: string[];
  sort: SortKey;
  showAll: boolean;
};

export const defaultBoard: BoardState = { query: '', stack: null, tags: [], sort: 'stack', showAll: false };

export const SORTS: { key: SortKey; label: string }[] = [
  { key: 'stack', label: 'Stack' },
  { key: 'newest', label: 'Newest' },
  { key: 'oldest', label: 'Oldest' },
  { key: 'route', label: 'Route' },
  { key: 'tags', label: 'Most tagged' },
];

const STACK_ORDER = ['Frontend', 'Python API', 'PHP service'];
const rank = (stack: string) => {
  const i = STACK_ORDER.indexOf(stack);
  return i < 0 ? STACK_ORDER.length : i;
};
const num = (i: Issue) => i.number ?? 0;

const COMPARE: Record<SortKey, (a: Issue, b: Issue) => number> = {
  stack: (a, b) => rank(a.stack) - rank(b.stack) || a.stack.localeCompare(b.stack) || num(a) - num(b),
  newest: (a, b) => num(b) - num(a),
  oldest: (a, b) => num(a) - num(b),
  route: (a, b) => a.route.localeCompare(b.route, 'en') || num(a) - num(b),
  tags: (a, b) => b.tags.length - a.tags.length || num(a) - num(b),
};

// Narrowing by query, stack or tag searches every issue; otherwise the board shows the featured ones.
export function isNarrowed(s: BoardState): boolean {
  return s.query.trim() !== '' || s.stack !== null || s.tags.length > 0;
}

const haystack = (i: Issue) => [i.title, i.route, i.wrong, i.stack, i.difficulty, ...i.tags].join(' ').toLowerCase();

export function visibleIssues(all: Issue[], s: BoardState): Issue[] {
  const words = s.query.toLowerCase().split(/\s+/).filter(Boolean);
  const pool = s.showAll || isNarrowed(s) ? all : all.filter((i) => i.featured);
  return pool
    .filter((i) => s.stack === null || i.stack === s.stack)
    .filter((i) => s.tags.every((t) => i.tags.includes(t)))
    .filter((i) => {
      const h = haystack(i);
      return words.every((w) => h.includes(w));
    })
    .sort(COMPARE[s.sort]);
}

export function tagsOf(all: Issue[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const i of all) for (const t of i.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function stacksOf(all: Issue[]): { stack: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const i of all) counts.set(i.stack, (counts.get(i.stack) ?? 0) + 1);
  return [...counts]
    .map(([stack, count]) => ({ stack, count }))
    .sort((a, b) => rank(a.stack) - rank(b.stack) || a.stack.localeCompare(b.stack));
}
