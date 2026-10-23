import { issueSearchUrl } from './links';

export type ChallengeGroup = 'Frontend' | 'Python API' | 'PHP service';

export type Challenge = {
  label: string;
  group: ChallengeGroup;
  summary: string;
  href: string;
  built: boolean;
};

export const challengeGroups: ChallengeGroup[] = ['Frontend', 'Python API', 'PHP service'];

const page = (label: string, summary: string): Challenge => ({ label, group: 'Frontend', summary, href: label, built: false });
const endpoint = (group: ChallengeGroup, label: string, summary: string): Challenge => ({
  label,
  group,
  summary,
  href: issueSearchUrl(label),
  built: false,
});

// Phase 2 flips `built` as each room ships.
export const challenges: Challenge[] = [
  page('/product', 'Inline styles on every element'),
  page('/profile', 'TypeScript, but everything is any'),
  page('/cart', 'localStorage as the source of truth'),
  page('/signup', 'A form that validates nothing'),
  page('/search', 'Exact, case-sensitive matches only'),
  page('/deals', 'A popup you cannot close'),
  endpoint('Python API', 'POST /api/orders', 'Trusts whatever the client sends'),
  endpoint('Python API', 'GET /api/delete-item', 'Deletes data on a GET request'),
  endpoint('Python API', 'GET /api/config', 'Hands out its own secrets'),
  endpoint('PHP service', 'GET /php/lookup', 'SQL built by string concatenation'),
  endpoint('PHP service', 'POST /php/login', 'Plaintext and MD5 passwords'),
];

export function groupChallenges(list: Challenge[]): { group: ChallengeGroup; items: Challenge[] }[] {
  return challengeGroups
    .map((group) => ({ group, items: list.filter((c) => c.group === group) }))
    .filter((g) => g.items.length > 0);
}

// Frontend rooms live on the legacy app's origin; backend rooms already carry an absolute URL.
export function resolveHref(c: Challenge, challengesUrl: string): string {
  return c.group === 'Frontend' ? challengesUrl.replace(/\/+$/, '') + c.href : c.href;
}
