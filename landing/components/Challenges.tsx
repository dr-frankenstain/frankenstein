import { challenges, groupChallenges, resolveHref } from '../lib/challenges';
import { ISSUES_URL } from '../lib/links';
import s from '../styles/landing.module.css';

const NUMBER_WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];

export function Challenges() {
  const challengesUrl = process.env.NEXT_PUBLIC_CHALLENGES_URL ?? 'http://localhost:3001';
  const count = challenges.length;
  return (
    <div className={s.section}>
      <div className={`${s.wrap} ${s.challenges}`}>
        <div className={`${s.sectionHead} ${s.challengesHead}`}>
          <h2 className={`${s.display} ${s.sectionTitle}`}>{`${NUMBER_WORDS[count] ?? count} rooms, all on fire`}</h2>
          <p>Every flaw is open as its own issue. Start with any junior one.</p>
          <p className={s.headCta}>
            <a className={`${s.btn} ${s.btnPrimary}`} href={ISSUES_URL}>Browse challenges</a>
          </p>
        </div>
        <div>
          {groupChallenges(challenges).map(({ group, items }) => (
            <div key={group} className={s.group}>
              <h3 className={s.groupTitle}>{group}</h3>
              {items.map((c) => (
                <div key={c.label} className={s.row}>
                  <code>
                    {c.built ? <a href={resolveHref(c, challengesUrl)}>{c.label}</a> : c.label}
                  </code>
                  <span>{c.summary}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
