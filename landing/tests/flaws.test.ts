import { describe, expect, it } from 'vitest';
import { countOnRoute, countOnStack, describeCount } from '../lib/flaws';
import type { Issue } from '../lib/issues';

const issue = (n: number, over: Partial<Issue> = {}): Issue => ({
  number: n,
  title: `Issue ${n}`,
  route: `/r${n}`,
  wrong: '',
  stack: 'Frontend',
  difficulty: 'junior',
  tags: [],
  featured: false,
  url: `https://example.test/${n}`,
  createdAt: '2026-08-31T00:00:00Z',
  ...over,
});

const list = [
  issue(1, { route: '/cart' }),
  issue(2, { route: '/cart' }),
  issue(3, { route: 'GET /api/cart', stack: 'Python API' }),
  issue(4, { route: 'GET /php/lookup', stack: 'PHP service' }),
];

describe('flaw counts', () => {
  it('counts the flaws of one stack', () => {
    expect(countOnStack(list, 'Frontend')).toBe(2);
    expect(countOnStack(list, 'Python API')).toBe(1);
    expect(countOnStack(list, 'Go')).toBe(0);
  });

  it('counts the flaws on exactly one route, not routes that merely contain it', () => {
    expect(countOnRoute(list, '/cart')).toBe(2);
    expect(countOnRoute(list, '/nope')).toBe(0);
  });

  it('words a count with the right plural', () => {
    expect(describeCount(1)).toBe('1 open flaw');
    expect(describeCount(31)).toBe('31 open flaws');
  });
});
