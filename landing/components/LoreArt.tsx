import { FLAWS, linksFor, partsFor, type Year } from '../lib/lore';
import s from '../styles/landing.module.css';

// The stack as it stood that year. Server-rendered in its final state; Lore animates the `data-new` pieces.
export function LoreArt({ year }: { year: Year }) {
  return (
    <svg className={s.loreArt} viewBox="0 0 200 140" aria-hidden="true" focusable="false" data-lore-art={year}>
      {linksFor(year).map((l) => (
        <path key={l.id} d={l.d} pathLength={1} className={l.year === year ? s.loreLinkHot : s.loreLink} data-new={l.year === year ? '' : undefined} data-kind="link" />
      ))}
      {partsFor(year).map((p) => {
        const hot = p.year === year;
        return (
          <g key={p.id} data-new={hot ? '' : undefined} data-kind="part">
            <rect className={hot ? s.loreBoxHot : s.loreBox} x={p.x} y={p.y} width={p.w} height={p.h} />
            <text className={hot ? s.loreLabelHot : s.loreLabel} x={p.x + 6} y={p.y + 14}>
              {p.label}
            </text>
          </g>
        );
      })}
      {year === 2026 && (
        <>
          {FLAWS.map((f, i) => (
            <circle key={i} className={s.loreFlaw} cx={f.x} cy={f.y} r="3" data-new="" data-kind="flaw" />
          ))}
          <text className={s.loreLabelHot} x="194" y="137" textAnchor="end" data-new="" data-kind="flaw">
            every flaw, filed
          </text>
        </>
      )}
    </svg>
  );
}
