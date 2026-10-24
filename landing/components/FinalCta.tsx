import { ISSUES_URL } from '../lib/links';
import s from '../styles/landing.module.css';

export function FinalCta() {
  return (
    <div className={`${s.section} ${s.final}`}>
      <div className={s.wrap}>
        <h2 className={`${s.display} ${s.finalTitle}`}>It stays broken. You can still win.</h2>
        <div className={s.cta}>
          <a className={`${s.btn} ${s.btnPrimary}`} href={ISSUES_URL} target="_blank" rel="noopener noreferrer">Browse challenges</a>
        </div>
      </div>
    </div>
  );
}
