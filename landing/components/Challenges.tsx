import { challenges, fallbackIssues, liveHref } from '../lib/challenges';
import { loadIssues } from '../lib/github';
import { ISSUES_URL } from '../lib/links';
import s from '../styles/landing.module.css';
import { ChallengeBoard } from './ChallengeBoard';

const NUMBER_WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];

// Server component: the issues come from GitHub (refreshed on a timer), with the registry as the fallback.
export async function Challenges() {
  const challengesUrl = process.env.NEXT_PUBLIC_CHALLENGES_URL ?? 'http://localhost:3001';
  const fetched = await loadIssues(undefined, process.env.GITHUB_TOKEN);
  const issues = fetched ?? fallbackIssues(challenges);
  const live: Record<string, string> = {};
  for (const issue of issues) {
    const href = liveHref(issue, challenges, challengesUrl);
    if (href) live[issue.url] = href;
  }
  const count = issues.length;
  return (
    <div className={s.section}>
      <div className={`${s.wrap} ${s.challenges}`}>
        <div className={`${s.sectionHead} ${s.challengesHead}`}>
          <h2 className={`${s.display} ${s.sectionTitle}`}>{`${NUMBER_WORDS[count] ?? count} flaws, all on fire`}</h2>
          <p>Every flaw is open as its own issue. These are the best places to start.</p>
          <p className={s.headCta}>
            <a className={`${s.btn} ${s.btnPrimary}`} href={ISSUES_URL} target="_blank" rel="noopener noreferrer">Browse challenges</a>
          </p>
        </div>
        <ChallengeBoard issues={issues} live={live} />
      </div>
    </div>
  );
}
