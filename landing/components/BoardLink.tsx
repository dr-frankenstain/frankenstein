'use client';

import type { ReactNode } from 'react';
import { FILTER_EVENT, type BoardFilter } from '../lib/flaws';
import s from '../styles/landing.module.css';

// An anchor to the challenge board that also narrows it. Without JavaScript it is a plain anchor.
export function BoardLink({ filter, children }: { filter: BoardFilter; children: ReactNode }) {
  return (
    <a
      className={s.flawLink}
      href="#challenges"
      onClick={() => window.dispatchEvent(new CustomEvent<BoardFilter>(FILTER_EVENT, { detail: filter }))}
    >
      {children}
    </a>
  );
}
