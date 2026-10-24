import { describe, expect, it } from 'vitest';
import { parseIssue, type RawIssue } from '../lib/issues';

const body = (discipline: string, route: string, wrong: string, difficulty = 'junior') =>
  `### Discipline\n${discipline}\n\n### Difficulty\n${difficulty}\n\n### Affected page / route / endpoint / service\n${route}\n\n### What's wrong\n${wrong}\n\n### Confirm\n- [x] This is a challenge to be solved via a (never-merged) PR — not a request to fix \`main\`.`;

const raw = (over: Partial<RawIssue> = {}): RawIssue => ({
  number: 72,
  title: '[frontend] /signup has zero client-side validation',
  body: body('frontend', '/signup', 'Empty fields all submit straight to the server.'),
  labels: [{ name: 'frontend' }, { name: 'design' }, { name: 'junior' }, { name: 'challenge' }, { name: 'good-first-challenge' }],
  html_url: 'https://github.com/dr-frankenstain/frankenstein/issues/72',
  created_at: '2026-08-31T08:24:41Z',
  ...over,
});

describe('parseIssue', () => {
  it('reads the issue form into display fields', () => {
    const i = parseIssue(raw())!;
    expect(i.number).toBe(72);
    expect(i.title).toBe('has zero client-side validation');
    expect(i.route).toBe('/signup');
    expect(i.wrong).toBe('Empty fields all submit straight to the server.');
    expect(i.stack).toBe('Frontend');
    expect(i.difficulty).toBe('junior');
    expect(i.url).toBe('https://github.com/dr-frankenstain/frankenstein/issues/72');
  });

  it('keeps only meaningful labels as tags', () => {
    const i = parseIssue(raw())!;
    expect(i.tags).toEqual(['design', 'good-first-challenge']);
    expect(i.featured).toBe(true);
  });

  it('is not featured without the good-first-challenge label', () => {
    const i = parseIssue(raw({ labels: ['frontend', 'junior', 'challenge'] }))!;
    expect(i.featured).toBe(false);
    expect(i.tags).toEqual([]);
  });

  it('maps disciplines to stack names', () => {
    expect(parseIssue(raw({ body: body('python', 'GET /api/config', 'x') }))!.stack).toBe('Python API');
    expect(parseIssue(raw({ body: body('php', 'GET /php/lookup', 'x') }))!.stack).toBe('PHP service');
    expect(parseIssue(raw({ body: body('go', 'booking', 'x') }))!.stack).toBe('Go');
  });

  it('shows the first route and drops a trailing parenthetical', () => {
    const i = parseIssue(raw({ body: body('python', 'POST /api/orders (and other write endpoints)', 'x') }))!;
    expect(i.route).toBe('POST /api/orders');
    const j = parseIssue(raw({ body: body('python', 'POST /api/orders, POST /api/signup', 'x') }))!;
    expect(j.route).toBe('POST /api/orders');
  });

  it('skips pull requests and issues that are not challenges', () => {
    expect(parseIssue(raw({ pull_request: {} }))).toBeNull();
    expect(parseIssue(raw({ labels: ['bug'] }))).toBeNull();
  });

  it('survives a body that is not the issue form', () => {
    const i = parseIssue(raw({ body: null, title: '[php] Something is off' }))!;
    expect(i.title).toBe('Something is off');
    expect(i.route).toBe('');
    expect(i.wrong).toBe('');
    expect(i.stack).toBe('PHP service');
  });

  it('replaces em-dashes, which the page never shows', () => {
    const i = parseIssue(raw({ title: '[python] GET /api/delete-item deletes data — any crawler can wipe it', body: body('python', 'x', 'A read — and a delete.') }))!;
    expect(i.title).toBe('GET /api/delete-item deletes data - any crawler can wipe it');
    expect(i.wrong).toBe('A read - and a delete.');
  });

  it('drops the route from the title, since the route has its own column', () => {
    const lead = parseIssue(raw({ title: '[php] GET /php/lookup builds SQL by concatenating $_GET', body: body('php', 'GET /php/lookup', 'x') }))!;
    expect(lead.title).toBe('builds SQL by concatenating $_GET');
    const trail = parseIssue(raw({ title: '[frontend] Newsletter popup reappears on /deals', body: body('frontend', '/deals', 'x') }))!;
    expect(trail.title).toBe('Newsletter popup reappears');
    const mid = parseIssue(raw({ title: '[frontend] Trailing space breaks /search', body: body('frontend', '/search', 'x') }))!;
    expect(mid.title).toBe('Trailing space breaks /search');
  });

  it('keeps the whole title when removing the route would leave nothing', () => {
    const i = parseIssue(raw({ title: '[frontend] /signup', body: body('frontend', '/signup', 'x') }))!;
    expect(i.title).toBe('/signup');
  });
});
