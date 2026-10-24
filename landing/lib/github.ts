import { parseIssue, type Issue, type RawIssue } from './issues';
import { REPO_SLUG } from './links';

type Fetch = (url: string, init?: RequestInit) => Promise<Response>;

const PER_PAGE = 100;
const MAX_PAGES = 5;

// Open issues of the repo as challenges, or null when GitHub cannot be reached (the page then falls back).
export async function loadIssues(fetchFn: Fetch = fetch as Fetch, token?: string): Promise<Issue[] | null> {
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const out: Issue[] = [];
  try {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const url = `https://api.github.com/repos/${REPO_SLUG}/issues?state=open&per_page=${PER_PAGE}&page=${page}`;
      const res = await fetchFn(url, { headers, next: { revalidate: 1800 } } as RequestInit);
      if (!res.ok) return null;
      const rows = (await res.json()) as RawIssue[];
      for (const row of rows) {
        const issue = parseIssue(row);
        if (issue) out.push(issue);
      }
      if (rows.length < PER_PAGE) break;
    }
  } catch {
    return null;
  }
  return out.length > 0 ? out : null;
}
