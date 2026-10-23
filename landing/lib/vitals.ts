import type { CheckResult } from './checks';

export type VitalStatus = 'loading' | 'ok' | 'fail';
export type Vital = {
  name: 'health' | 'products' | 'php-check';
  organ: 'Heart' | 'Brain' | 'Nerve';
  descriptor: string;
  status: VitalStatus;
  reading: string;
};

const ORGANS: Pick<Vital, 'name' | 'organ' | 'descriptor'>[] = [
  { name: 'health', organ: 'Heart', descriptor: 'The Python API answers' },
  { name: 'products', organ: 'Brain', descriptor: 'MySQL remembers' },
  { name: 'php-check', organ: 'Nerve', descriptor: 'PHP, reached through Python' },
];

export function toVitals(results: CheckResult[] | null, timedOut = false): Vital[] {
  return ORGANS.map((organ) => {
    const r = results?.find((x) => x.name === organ.name);
    if (!r) {
      return timedOut
        ? { ...organ, status: 'fail', reading: 'FAIL: timed out' }
        : { ...organ, status: 'loading', reading: 'Checking' };
    }
    return r.ok
      ? { ...organ, status: 'ok', reading: `OK (${r.detail})` }
      : { ...organ, status: 'fail', reading: `FAIL: ${r.detail}` };
  });
}
