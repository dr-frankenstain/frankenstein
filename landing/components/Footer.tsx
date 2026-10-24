import { REPO_URL } from '../lib/links';
import s from '../styles/landing.module.css';

export function Footer() {
  return (
    <footer className={s.footer}>
      <div className={`${s.wrap} ${s.footerInner}`}>
        <span>Intentionally vulnerable. Fake data only. Do not use it for anything real.</span>
        <nav className={s.footerNav}>
          <a href="#lore">Lore</a>
          <a href="#challenges">Challenges</a>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer">GitHub</a>
        </nav>
      </div>
    </footer>
  );
}
