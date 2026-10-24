import { describe, expect, it } from 'vitest';
import type { CheckResult } from '../lib/checks';
import { mergeResult, toVitals } from '../lib/vitals';

const ok = (name: string, detail = 'fine'): CheckResult => ({ name, ok: true, detail });
const bad = (name: string, detail = 'HTTP 500'): CheckResult => ({ name, ok: false, detail });

describe('toVitals', () => {
  it('turns null results into three loading vitals reading "Checking"', () => {
    const v = toVitals(null);
    expect(v.map((x) => [x.organ, x.status, x.reading])).toEqual([
      ['Heart', 'loading', 'Checking'],
      ['Brain', 'loading', 'Checking'],
      ['Nerve', 'loading', 'Checking'],
    ]);
  });

  it('reads an ok result as "OK (detail)"', () => {
    const v = toVitals([ok('health', 'API is up'), ok('products'), ok('php-check')]);
    expect(v[0]).toMatchObject({ status: 'ok', reading: 'OK (API is up)' });
  });

  it('reads a failed result as "FAIL: detail"', () => {
    const v = toVitals([bad('health', 'Failed to fetch'), ok('products'), ok('php-check')]);
    expect(v[0]).toMatchObject({ status: 'fail', reading: 'FAIL: Failed to fetch' });
  });

  it('leaves the other vitals ok when one fails', () => {
    const v = toVitals([ok('health'), bad('products'), ok('php-check')]);
    expect(v.map((x) => x.status)).toEqual(['ok', 'fail', 'ok']);
  });

  it('orders Heart, Brain, Nerve whatever the input order', () => {
    const v = toVitals([ok('php-check'), ok('health'), ok('products')]);
    expect(v.map((x) => [x.name, x.organ, x.descriptor])).toEqual([
      ['health', 'Heart', 'The Python API answers'],
      ['products', 'Brain', 'MySQL remembers'],
      ['php-check', 'Nerve', 'PHP, reached through Python'],
    ]);
  });

  it('keeps a missing result loading', () => {
    const v = toVitals([ok('health')]);
    expect(v.map((x) => x.status)).toEqual(['ok', 'loading', 'loading']);
  });

  it('fails everything with "FAIL: timed out" when null results time out', () => {
    const v = toVitals(null, true);
    expect(v.map((x) => [x.status, x.reading])).toEqual([
      ['fail', 'FAIL: timed out'],
      ['fail', 'FAIL: timed out'],
      ['fail', 'FAIL: timed out'],
    ]);
  });

  it('fails a missing result when timed out', () => {
    const v = toVitals([ok('health')], true);
    expect(v.map((x) => x.status)).toEqual(['ok', 'fail', 'fail']);
  });
});

describe('mergeResult', () => {
  it('adds a first result to an empty state', () => {
    expect(mergeResult(null, ok('health'))).toEqual([ok('health')]);
  });

  it('keeps earlier results and adds the new one', () => {
    expect(mergeResult([ok('health')], bad('products'))).toEqual([ok('health'), bad('products')]);
  });

  it('replaces an earlier result with the same name', () => {
    expect(mergeResult([bad('health')], ok('health'))).toEqual([ok('health')]);
  });

  it('lets one slow check leave the others readable when the watchdog fires', () => {
    const partial = mergeResult(mergeResult(null, ok('health')), ok('php-check'));
    const v = toVitals(partial, true);
    expect(v.map((x) => x.status)).toEqual(['ok', 'fail', 'ok']);
    expect(v[1].reading).toBe('FAIL: timed out');
  });
});
