import s from '../styles/landing.module.css';

const FLAWS = [
  "SELECT * FROM users WHERE email = '$_GET[email]'",
  '200 OK {"success": false}',
  'const user: any',
  '@ts-ignore',
  'password == md5($input)',
  'GET /api/delete-item?id=5',
  "JSON.parse(localStorage.getItem('cart'))",
  'setInterval(showNewsletterPopup, 3000)',
  'font-family: Comic Sans MS',
];

export function Marquee() {
  return (
    <div className={s.marquee} aria-label="A few of the flaws living in the monster">
      <div className={s.marqueeTrack}>
        {FLAWS.map((f) => <span key={f}>{f}</span>)}
        {FLAWS.map((f) => <span key={`${f}-copy`} aria-hidden="true">{f}</span>)}
      </div>
    </div>
  );
}
