import type { Issue } from './issues';

// A link elsewhere on the page asks the challenge board to narrow itself, then the anchor scrolls to it.
export const FILTER_EVENT = 'frankenstein:filter';
export type BoardFilter = { stack?: string; query?: string };

export const countOnStack = (issues: Issue[], stack: string): number => issues.filter((i) => i.stack === stack).length;

export const countOnRoute = (issues: Issue[], route: string): number => issues.filter((i) => i.route === route).length;

export const describeCount = (n: number): string => `${n} open flaw${n === 1 ? '' : 's'}`;
