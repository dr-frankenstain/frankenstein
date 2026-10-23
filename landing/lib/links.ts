export const REPO_URL = 'https://github.com/dr-frankenstain/frankenstein';
export const ISSUES_URL = `${REPO_URL}/issues`;

export function issueSearchUrl(query: string): string {
  return `${ISSUES_URL}?q=${encodeURIComponent(`is:issue ${query}`)}`;
}
