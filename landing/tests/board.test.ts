import { describe, expect, it } from 'vitest';
import { defaultBoard, stacksOf, tagsOf, visibleIssues, type BoardState } from '../lib/board';
import type { Issue } from '../lib/issues';

const issue = (n: number, over: Partial<Issue> = {}): Issue => ({
  number: n,
  title: `Issue ${n}`,
  route: `/r${n}`,
  wrong: `Wrong ${n}`,
  stack: 'Frontend',
  difficulty: 'junior',
  tags: [],
  featured: false,
  url: `https://example.test/${n}`,
  createdAt: '2026-08-31T00:00:00Z',
  ...over,
});

const list: Issue[] = [
  issue(1, { stack: 'PHP service', route: 'GET /php/lookup', title: 'SQL built by concatenation', tags: ['security', 'good-first-challenge'], featured: true }),
  issue(2, { stack: 'Python API', route: 'GET /api/config', title: 'Config leaks secrets', tags: ['security'] }),
  issue(3, { stack: 'Frontend', route: '/search', title: 'Search is case-sensitive', wrong: 'Compares with === so iPhone works, iphone does not', tags: ['good-first-challenge'], featured: true }),
  issue(4, { stack: 'Frontend', route: '/signup', title: 'No validation', tags: ['design', 'security', 'good-first-challenge'], featured: true }),
  issue(5, { stack: 'Python API', route: 'POST /api/orders', title: 'Trusts the client' }),
];

const ids = (s: Partial<BoardState>) => visibleIssues(list, { ...defaultBoard, ...s }).map((i) => i.number);

describe('visibleIssues', () => {
  it('starts with the featured issues, grouped by stack order', () => {
    expect(ids({})).toEqual([3, 4, 1]);
  });

  it('shows everything when asked', () => {
    expect(ids({ showAll: true })).toEqual([3, 4, 2, 5, 1]);
  });

  it('searches every issue, not just the featured ones', () => {
    expect(ids({ query: 'trusts' })).toEqual([5]);
  });

  it('searches the what-is-wrong text, stack and tags too', () => {
    expect(ids({ query: 'iphone' })).toEqual([3]);
    expect(ids({ query: 'php service' })).toEqual([1]);
    expect(ids({ query: 'design' })).toEqual([4]);
  });

  it('requires every word of the query to match', () => {
    expect(ids({ query: 'config secrets' })).toEqual([2]);
    expect(ids({ query: 'config trusts' })).toEqual([]);
  });

  it('filters by stack across all issues', () => {
    expect(ids({ stack: 'Python API' })).toEqual([2, 5]);
  });

  it('filters by tags, all of them required', () => {
    expect(ids({ tags: ['security'] })).toEqual([4, 2, 1]);
    expect(ids({ tags: ['security', 'design'] })).toEqual([4]);
  });

  it('sorts newest and oldest by issue number', () => {
    expect(ids({ showAll: true, sort: 'newest' })).toEqual([5, 4, 3, 2, 1]);
    expect(ids({ showAll: true, sort: 'oldest' })).toEqual([1, 2, 3, 4, 5]);
  });

  it('sorts by route, A to Z', () => {
    expect(ids({ showAll: true, sort: 'route' })).toEqual([3, 4, 2, 1, 5]);
  });

  it('sorts the most tagged first', () => {
    expect(ids({ showAll: true, sort: 'tags' })).toEqual([4, 1, 2, 3, 5]);
  });

  it('does not mutate its input', () => {
    const copy = [...list];
    visibleIssues(list, { ...defaultBoard, showAll: true, sort: 'newest' });
    expect(list).toEqual(copy);
  });
});

describe('facets', () => {
  it('counts tags, most common first, ties alphabetical', () => {
    expect(tagsOf(list)).toEqual([
      { tag: 'good-first-challenge', count: 3 },
      { tag: 'security', count: 3 },
      { tag: 'design', count: 1 },
    ]);
  });

  it('lists stacks in display order with counts', () => {
    expect(stacksOf(list)).toEqual([
      { stack: 'Frontend', count: 2 },
      { stack: 'Python API', count: 2 },
      { stack: 'PHP service', count: 1 },
    ]);
  });
});
