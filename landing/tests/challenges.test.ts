import { describe, expect, it } from 'vitest';
import { challenges, fallbackIssues, groupChallenges, liveHref, resolveHref } from '../lib/challenges';
import { issueSearchUrl } from '../lib/links';

describe('challenge registry', () => {
  it('has the 11 junior rooms', () => {
    const by = (g: string) => challenges.filter((c) => c.group === g).map((c) => c.label);
    expect(by('Frontend')).toEqual(['/product', '/profile', '/cart', '/signup', '/search', '/deals']);
    expect(by('Python API')).toEqual(['POST /api/orders', 'GET /api/delete-item', 'GET /api/config']);
    expect(by('PHP service')).toEqual(['GET /php/lookup', 'POST /php/login']);
    expect(challenges).toHaveLength(11);
    expect(challenges[0].summary).toBe('Inline styles on every element');
  });

  it('starts with every room unbuilt', () => {
    expect(challenges.every((c) => c.built === false)).toBe(true);
  });

  it('points backend rooms at an issue search for the label', () => {
    for (const c of challenges.filter((x) => x.group !== 'Frontend')) {
      expect(c.href).toBe(issueSearchUrl(c.label));
    }
  });

  it('resolves frontend hrefs against the challenges url and drops a trailing slash', () => {
    const product = challenges.find((c) => c.label === '/product')!;
    expect(resolveHref(product, 'http://localhost:3001/')).toBe('http://localhost:3001/product');
    expect(resolveHref(product, 'http://localhost:3001')).toBe('http://localhost:3001/product');
    const orders = challenges.find((c) => c.label === 'POST /api/orders')!;
    expect(resolveHref(orders, 'http://localhost:3001')).toBe(orders.href);
  });

  it('groups in registry order and drops empty groups', () => {
    const groups = groupChallenges(challenges);
    expect(groups.map((g) => g.group)).toEqual(['Frontend', 'Python API', 'PHP service']);
    expect(groupChallenges(challenges.filter((c) => c.group === 'PHP service')).map((g) => g.group)).toEqual(['PHP service']);
  });

  it('never uses an em-dash', () => {
    expect(challenges.some((c) => (c.summary + c.label).includes('—'))).toBe(false);
  });

  it('falls back to one featured issue per room when GitHub is unreachable', () => {
    const issues = fallbackIssues(challenges);
    expect(issues).toHaveLength(11);
    expect(issues.every((i) => i.featured && i.number === null)).toBe(true);
    expect(issues[0]).toMatchObject({ route: '/product', title: 'Inline styles on every element', stack: 'Frontend' });
    expect(issues[6]).toMatchObject({ route: 'POST /api/orders', stack: 'Python API', url: issueSearchUrl('POST /api/orders') });
  });

  it('links a frontend issue to its live page only once that room is built', () => {
    const issue = fallbackIssues(challenges)[0];
    expect(liveHref(issue, challenges, 'http://localhost:3001')).toBeNull();
    const built = challenges.map((c) => (c.label === '/product' ? { ...c, built: true } : c));
    expect(liveHref(issue, built, 'http://localhost:3001/')).toBe('http://localhost:3001/product');
    const backend = fallbackIssues(built)[6];
    expect(liveHref(backend, built, 'http://localhost:3001')).toBeNull();
  });
});
