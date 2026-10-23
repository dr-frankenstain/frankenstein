import { useEffect, useState } from 'react';
import { challenges } from '../lib/challenges';
import { CheckResult, runChecks } from '../lib/checks';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export default function Home() {
  const [results, setResults] = useState<CheckResult[] | null>(null);

  useEffect(() => {
    runChecks(API_BASE).then(setResults);
  }, []);

  return (
    <main style={{ fontFamily: 'sans-serif', maxWidth: 640, margin: '2rem auto' }}>
      <h1>🧟 Frankenstein</h1>
      <p>A web app that is intentionally, gloriously terrible. It is alive. Mostly.</p>

      <h2>Backend status</h2>
      {results === null ? (
        <p>Checking…</p>
      ) : (
        <ul>
          {results.map((r) => (
            <li key={r.name} data-testid={`check-${r.name}`}>
              {r.name}: {r.ok ? `OK (${r.detail})` : `FAIL: ${r.detail}`}
            </li>
          ))}
        </ul>
      )}

      <h2>Challenges</h2>
      {challenges.length === 0 ? (
        <p>No challenges yet</p>
      ) : (
        <ul>
          {challenges.map((c) => (
            <li key={c.route}>
              <a href={c.route}>{c.title}</a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
