import s from '../styles/landing.module.css';

// One small diagram per step. Server-rendered in its final state; HowItWorks animates it.
// The `data-a` attributes are the animation targets.

const ROWS = [
  { tags: ['frontend', 'junior'], bar: 150 },
  { tags: ['python', 'junior'], bar: 120 },
  { tags: ['php', 'junior'], bar: 170 },
  { tags: ['frontend', 'junior'], bar: 100 },
];

function PickArt() {
  return (
    <>
      {ROWS.map((r, i) => (
        <g key={i} data-a="row">
          <rect className={s.artRow} x="12" y={14 + i * 50} width="336" height="40" />
          <circle className={s.artDot} cx="32" cy={34 + i * 50} r="5" />
          <rect className={s.artBar} x="48" y={30 + i * 50} width={r.bar} height="7" />
          <text className={s.artText} x="226" y={38 + i * 50}>{r.tags[0]}</text>
          <text className={s.artText} x="292" y={38 + i * 50}>{r.tags[1]}</text>
        </g>
      ))}
      <rect data-a="sel" className={s.artSel} x="12" y="64" width="336" height="40" />
      <g transform="translate(196 80)">
        <g data-a="cursor">
          <path className={s.artCursor} d="M0 0 L0 17 L4.5 13 L8 20.5 L11 19 L7.5 12 L13 11.5 Z" />
        </g>
      </g>
    </>
  );
}

function ForkArt() {
  return (
    <>
      <line className={s.artMain} x1="16" y1="60" x2="344" y2="60" />
      {[40, 110, 180, 250, 320].map((x) => (
        <circle key={x} className={s.artCommit} cx={x} cy="60" r="5" />
      ))}
      <text className={s.artText} x="16" y="40">main</text>
      <path
        data-a="branch"
        className={s.artBranch}
        d="M110 60 C 140 60, 140 150, 180 150 L 344 150"
        pathLength={1}
      />
      <circle data-a="ring" className={s.artRing} cx="110" cy="60" r="10" />
      {[180, 250, 320].map((x) => (
        <circle key={x} data-a="bdot" className={s.artBdot} cx={x} cy="150" r="5" />
      ))}
      <text data-a="blabel" className={s.artAccent} x="180" y="180">your-fix</text>
    </>
  );
}

function FixArt() {
  return (
    <>
      <rect className={s.artCard} x="12" y="12" width="336" height="196" />
      <text className={s.artTextStrong} x="28" y="38">Pull request</text>
      <text className={s.artText} x="296" y="38">open</text>
      <line className={s.artRule} x1="12" y1="50" x2="348" y2="50" />
      <g data-a="diff">
        <text className={s.artText} x="28" y="74">-</text>
        <rect className={s.artBarMuted} x="44" y="67" width="190" height="7" />
        <text className={s.artAccent} x="28" y="96">+</text>
        <rect className={s.artBarAccent} x="44" y="89" width="150" height="7" />
        <text className={s.artAccent} x="28" y="118">+</text>
        <rect className={s.artBarAccent} x="44" y="111" width="210" height="7" />
      </g>
      <g data-a="merge">
        <rect className={s.artBtn} x="28" y="158" width="96" height="28" />
        <text className={s.artText} x="52" y="176">Merge</text>
        <line data-a="strike" className={s.artStrike} x1="22" y1="172" x2="130" y2="172" />
      </g>
      <g transform="translate(262 150) rotate(-8)">
        <g data-a="stamp">
          <rect className={s.artStamp} x="-70" y="-20" width="140" height="40" />
          <text className={s.artStampText} x="0" y="5" textAnchor="middle">NEVER MERGED</text>
        </g>
      </g>
    </>
  );
}

const VOTES = [
  { label: 'PR 1', count: 12, share: 0.38 },
  { label: 'PR 2', count: 31, share: 1 },
  { label: 'PR 3', count: 7, share: 0.22 },
];

function VoteArt() {
  return (
    <>
      {VOTES.map((v, i) => {
        const top = v.share === 1;
        return (
          <g key={v.label}>
            <text className={top ? s.artTextStrong : s.artText} x="16" y={44 + i * 62}>{v.label}</text>
            <rect className={s.artTrack} x="72" y={32 + i * 62} width="220" height="16" />
            <rect
              data-a="vbar"
              className={top ? s.artBarAccent : s.artBarMuted}
              x="72"
              y={32 + i * 62}
              width={220 * v.share}
              height="16"
            />
            <text data-a="count" data-n={v.count} className={top ? s.artAccent : s.artText} x="304" y={44 + i * 62}>
              {`+${v.count}`}
            </text>
            {top && (
              <text data-a="top" className={s.artAccent} x="72" y={22 + i * 62}>TOP VOTED</text>
            )}
          </g>
        );
      })}
    </>
  );
}

export function StepArt({ step }: { step: 'Pick' | 'Fork' | 'Fix' | 'Vote' }) {
  return (
    <svg className={s.art} viewBox="0 0 360 220" aria-hidden="true" focusable="false" data-art={step}>
      {step === 'Pick' && <PickArt />}
      {step === 'Fork' && <ForkArt />}
      {step === 'Fix' && <FixArt />}
      {step === 'Vote' && <VoteArt />}
    </svg>
  );
}
