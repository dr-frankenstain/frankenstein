export type RawIssue = {
  number: number;
  title: string;
  body: string | null;
  labels: (string | { name: string })[];
  html_url: string;
  created_at: string;
  pull_request?: unknown;
};

export type Issue = {
  number: number | null;
  title: string;
  route: string;
  wrong: string;
  stack: string;
  difficulty: string;
  tags: string[];
  featured: boolean;
  url: string;
  createdAt: string;
};

export const FEATURED_LABEL = 'good-first-challenge';

const STACK_NAMES: Record<string, string> = { frontend: 'Frontend', python: 'Python API', php: 'PHP service' };

export function stackName(discipline: string): string {
  const key = discipline.trim().toLowerCase();
  return STACK_NAMES[key] ?? (key ? key[0].toUpperCase() + key.slice(1) : 'Other');
}

// The issue form renders as "### Heading\nvalue" blocks.
function sections(body: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const block of body.split(/^### /m).slice(1)) {
    const nl = block.indexOf('\n');
    if (nl < 0) continue;
    out[block.slice(0, nl).trim().toLowerCase()] = block.slice(nl + 1).trim();
  }
  return out;
}

function cleanRoute(value: string): string {
  return value.split(',')[0].replace(/\s*\([^)]*\)\s*$/, '').trim();
}

// The page never shows an em-dash.
const plain = (text: string) => text.replace(/\s*—\s*/g, ' - ');

// The route has its own column, so the title does not repeat it at the start or as a trailing "on <route>".
function withoutRoute(title: string, route: string): string {
  if (!route) return title;
  let out = title;
  if (out.startsWith(`${route} `)) out = out.slice(route.length + 1);
  else if (out.endsWith(` on ${route}`)) out = out.slice(0, -(route.length + 4));
  return out.trim() || title;
}

export function parseIssue(raw: RawIssue): Issue | null {
  if (raw.pull_request) return null;
  const labels = raw.labels.map((l) => (typeof l === 'string' ? l : l.name));
  if (!labels.includes('challenge')) return null;

  const form = sections(raw.body ?? '');
  const prefix = /^\[([^\]]+)\]\s*/.exec(raw.title);
  const discipline = (form['discipline'] ?? prefix?.[1] ?? '').split('\n')[0].trim().toLowerCase();
  const difficulty = (form['difficulty'] ?? '').split('\n')[0].trim().toLowerCase();
  const hidden = new Set(['challenge', discipline, difficulty, 'junior', 'mid', 'senior', ...Object.keys(STACK_NAMES)]);

  const route = plain(cleanRoute(form['affected page / route / endpoint / service'] ?? ''));
  return {
    number: raw.number,
    title: withoutRoute(plain(raw.title.replace(/^\[[^\]]+\]\s*/, '')), route),
    route,
    wrong: plain(form["what's wrong"] ?? ''),
    stack: stackName(discipline),
    difficulty,
    tags: labels.filter((l) => !hidden.has(l)),
    featured: labels.includes(FEATURED_LABEL),
    url: raw.html_url,
    createdAt: raw.created_at,
  };
}
