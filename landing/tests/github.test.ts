import { describe, expect, it } from 'vitest';
import { loadIssues } from '../lib/github';
import type { RawIssue } from '../lib/issues';

const raw = (n: number, extra: Partial<RawIssue> = {}): RawIssue => ({
  number: n,
  title: `[php] Issue ${n}`,
  body: `### Discipline\nphp\n\n### Difficulty\njunior\n\n### Affected page / route / endpoint / service\nGET /php/x\n\n### What's wrong\nBad ${n}.`,
  labels: ['php', 'junior', 'challenge'],
  html_url: `https://github.com/o/r/issues/${n}`,
  created_at: '2026-08-31T00:00:00Z',
  ...extra,
});

const reply = (rows: RawIssue[], status = 200) => Promise.resolve(new Response(JSON.stringify(rows), { status }));

describe('loadIssues', () => {
  it('parses challenge issues and skips pull requests', async () => {
    const out = await loadIssues(() => reply([raw(1), raw(2, { pull_request: {} })]));
    expect(out?.map((i) => i.number)).toEqual([1]);
  });

  it('follows pages until one comes back short', async () => {
    const pages: string[] = [];
    const out = await loadIssues((url) => {
      pages.push(String(url));
      const page = Number(new URL(String(url)).searchParams.get('page'));
      return reply(page === 1 ? Array.from({ length: 100 }, (_, i) => raw(i + 1)) : [raw(101)]);
    });
    expect(pages).toHaveLength(2);
    expect(out).toHaveLength(101);
  });

  it('returns null when GitHub errors, so the page can fall back', async () => {
    expect(await loadIssues(() => reply([], 403))).toBeNull();
    expect(await loadIssues(() => Promise.reject(new Error('offline')))).toBeNull();
  });

  it('returns null when there are no challenge issues at all', async () => {
    expect(await loadIssues(() => reply([]))).toBeNull();
  });

  it('sends the token only when one is given', async () => {
    const seen: (HeadersInit | undefined)[] = [];
    const spy = (_: unknown, init?: RequestInit) => {
      seen.push(init?.headers);
      return reply([raw(1)]);
    };
    await loadIssues(spy, 'secret');
    await loadIssues(spy);
    expect((seen[0] as Record<string, string>).Authorization).toBe('Bearer secret');
    expect((seen[1] as Record<string, string>).Authorization).toBeUndefined();
  });
});
