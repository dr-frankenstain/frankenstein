import { REPO_URL } from '../lib/links';
import s from '../styles/landing.module.css';

export function Nav() {
  return (
    <header className={s.nav}>
      <div className={`${s.wrap} ${s.navInner}`}>
        <a className={s.brand} href="#top">
          Project Frankenstein
        </a>
        <ul className={s.navLinks}>
          <li><a href="#lore">Lore</a></li>
          <li><a href="#anatomy">Anatomy</a></li>
          <li><a href="#how">How it works</a></li>
          <li><a href="#challenges">Challenges</a></li>
        </ul>
        <a className={`${s.btn} ${s.btnGhost} ${s.navCta}`} href={REPO_URL} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
      </div>
    </header>
  );
}
