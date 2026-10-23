import s from '../styles/landing.module.css';

const PANELS = [
  { year: '2014', title: 'A PHP monolith', text: "The founder's cousin built it. It worked, mostly, and nobody wrote anything down." },
  { year: '2019', title: 'Half a rewrite', text: 'A new team ported the backend to Python on half a budget. Payments and PDFs stayed behind in the old PHP service.' },
  { year: '2021', title: 'Go and Redis, bolted on', text: 'To survive a big on-sale, someone wired a Go service straight into the old PHP, around the new API. That team is gone too.' },
  { year: '2023', title: 'A new face', text: 'A contractor rewrote the frontend in Next.js, then left mid-project.' },
];

export function Lore() {
  return (
    <div className={s.lore}>
      <div className={s.loreTrack}>
        <article className={`${s.lorePanel} ${s.loreIntro}`}>
          <h2 className={`${s.display} ${s.loreHeading}`}>How the monster got built</h2>
          <p>Nobody planned this. It accumulated.</p>
        </article>
        {PANELS.map((p) => (
          <article key={p.year} className={s.lorePanel}>
            <div className={s.loreYear}>{p.year}</div>
            <h3 className={`${s.display} ${s.loreTitle}`}>{p.title}</h3>
            <p>{p.text}</p>
          </article>
        ))}
        <article className={`${s.lorePanel} ${s.loreLast}`}>
          <div className={s.loreYear}>Nobody has the full picture.<br />Now it&apos;s your turn.</div>
        </article>
      </div>
    </div>
  );
}
