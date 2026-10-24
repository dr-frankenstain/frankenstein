import { challenges, fallbackIssues } from './challenges';
import { loadIssues } from './github';
import type { Issue } from './issues';

// Server only. The open issues from GitHub, or the registry when GitHub cannot be reached.
// Next shares the underlying fetch between components rendering the same page.
export async function loadAllIssues(): Promise<Issue[]> {
  return (await loadIssues(undefined, process.env.GITHUB_TOKEN)) ?? fallbackIssues(challenges);
}
