'use client';

import { useEffect, useRef, useState } from 'react';
import { defaultBoard, isNarrowed, SORTS, stacksOf, tagsOf, visibleIssues, type BoardState, type SortKey } from '../lib/board';
import { FILTER_EVENT, type BoardFilter } from '../lib/flaws';
import { ScrollTrigger } from '../lib/gsap';
import type { Issue } from '../lib/issues';
import s from '../styles/landing.module.css';

const tagLabel = (tag: string) => tag.replace(/-challenge$/, '').replace(/-/g, ' ');

export function ChallengeBoard({ issues, live }: { issues: Issue[]; live: Record<string, string> }) {
  const [board, setBoard] = useState<BoardState>(defaultBoard);
  const set = (patch: Partial<BoardState>) => setBoard((b) => ({ ...b, ...patch }));

  const shown = visibleIssues(issues, board);
  const narrowed = isNarrowed(board);
  const featuredCount = issues.filter((i) => i.featured).length;
  const stacks = stacksOf(issues);
  const tags = tagsOf(issues);

  // Links elsewhere on the page (the anatomy) can narrow the board before scrolling to it.
  useEffect(() => {
    const onFilter = (e: Event) => {
      const { stack = null, query = '' } = (e as CustomEvent<BoardFilter>).detail;
      setBoard((b) => ({ ...b, stack, query, tags: [], showAll: false }));
    };
    window.addEventListener(FILTER_EVENT, onFilter);
    return () => window.removeEventListener(FILTER_EVENT, onFilter);
  }, []);

  // The list changes height, and the patches below it were measured against the old height.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    ScrollTrigger.refresh();
  }, [shown.length, board.sort]);

  const groups =
    board.sort === 'stack'
      ? stacks.map(({ stack }) => ({ title: stack, items: shown.filter((i) => i.stack === stack) })).filter((g) => g.items.length > 0)
      : [{ title: '', items: shown }];

  const clear = () => set({ query: '', stack: null, tags: [], showAll: false });
  const toggleTag = (tag: string) =>
    set({ tags: board.tags.includes(tag) ? board.tags.filter((t) => t !== tag) : [...board.tags, tag] });

  return (
    <div className={s.board}>
      <div className={s.controls}>
        <input
          type="search"
          className={s.search}
          aria-label="Search flaws"
          placeholder="Search flaws, routes, tags"
          value={board.query}
          onChange={(e) => set({ query: e.target.value })}
        />
        <div className={s.chips} role="group" aria-label="Filter by stack">
          <span className={s.chipLabel}>Stack</span>
          <button type="button" className={s.chip} aria-pressed={board.stack === null} onClick={() => set({ stack: null })}>
            All
          </button>
          {stacks.map(({ stack, count }) => (
            <button
              key={stack}
              type="button"
              className={s.chip}
              aria-pressed={board.stack === stack}
              onClick={() => set({ stack: board.stack === stack ? null : stack })}
            >
              {stack}
              <small>{count}</small>
            </button>
          ))}
        </div>
        {tags.length > 0 && (
          <div className={s.chips} role="group" aria-label="Filter by tag">
            <span className={s.chipLabel}>Tag</span>
            {tags.map(({ tag, count }) => (
              <button key={tag} type="button" className={s.chip} aria-pressed={board.tags.includes(tag)} onClick={() => toggleTag(tag)}>
                {tagLabel(tag)}
                <small>{count}</small>
              </button>
            ))}
          </div>
        )}
        <div className={s.status}>
          <span role="status" aria-live="polite">
            {narrowed || board.showAll ? `${shown.length} of ${issues.length} flaws` : `${shown.length} of ${issues.length} flaws, the best ones to start with`}
          </span>
          <label className={s.sortLabel}>
            Sort
            <select className={s.sortSelect} value={board.sort} onChange={(e) => set({ sort: e.target.value as SortKey })}>
              {SORTS.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {shown.length === 0 ? (
        <p className={s.empty}>
          Nothing in the monster matches that.{' '}
          <button type="button" className={s.linkBtn} onClick={clear}>
            Clear the search
          </button>
        </p>
      ) : (
        groups.map(({ title, items }) => (
          <div key={title || 'all'} className={s.group}>
            {title && <h3 className={s.groupTitle}>{title}</h3>}
            {items.map((i) => (
              <details key={i.url} className={s.issue}>
                <summary className={s.row}>
                  <code>{i.route || i.stack}</code>
                  <span>{i.title}</span>
                </summary>
                <div className={s.issueBody}>
                  {i.wrong && <p>{i.wrong}</p>}
                  <p className={s.issueLinks}>
                    <a href={i.url} target="_blank" rel="noopener noreferrer">{i.number ? `Open issue #${i.number}` : 'Find the issue'}</a>
                    {live[i.url] && <a href={live[i.url]}>Visit the page</a>}
                  </p>
                </div>
              </details>
            ))}
          </div>
        ))
      )}

      {!narrowed && !board.showAll && issues.length > featuredCount && (
        <p className={s.more}>
          <button type="button" className={`${s.btn} ${s.btnGhost}`} onClick={() => set({ showAll: true })}>
            {`Show all ${issues.length} flaws`}
          </button>
        </p>
      )}
      {!narrowed && board.showAll && featuredCount > 0 && featuredCount < issues.length && (
        <p className={s.more}>
          <button type="button" className={`${s.btn} ${s.btnGhost}`} onClick={() => set({ showAll: false })}>
            Back to the best ones
          </button>
        </p>
      )}
    </div>
  );
}
