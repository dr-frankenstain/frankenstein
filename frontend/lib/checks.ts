export type CheckResult = { name: string; ok: boolean; detail: string };

type Check = { name: string; path: string; describe: (body: unknown) => string };

const CHECKS: Check[] = [
  { name: 'health', path: '/health', describe: () => 'API is up' },
  {
    name: 'products',
    path: '/api/products',
    describe: (body) => (Array.isArray(body) ? `${body.length} products from MySQL` : 'unexpected response'),
  },
  { name: 'php-check', path: '/api/php-check', describe: () => 'Python reached the PHP service' },
];

async function runCheck(apiBase: string, check: Check): Promise<CheckResult> {
  try {
    const res = await fetch(apiBase + check.path);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return { name: check.name, ok: true, detail: check.describe(await res.json()) };
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return { name: check.name, ok: false, detail };
  }
}

// Every check handles its own failure, so one dead dependency never hides the others.
export async function runChecks(apiBase: string): Promise<CheckResult[]> {
  return Promise.all(CHECKS.map((check) => runCheck(apiBase, check)));
}
