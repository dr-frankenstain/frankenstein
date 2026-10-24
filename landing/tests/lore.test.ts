import { describe, expect, it } from 'vitest';
import { FLAWS, LINKS, PARTS, YEARS, linksFor, partsFor } from '../lib/lore';

describe('lore architecture', () => {
  it('only ever adds parts, one era at a time', () => {
    const counts = YEARS.map((y) => partsFor(y).length);
    expect(counts).toEqual([2, 3, 5, 6, 6]);
    for (let i = 1; i < YEARS.length; i++) expect(counts[i]).toBeGreaterThanOrEqual(counts[i - 1]);
  });

  it('introduces Go and Redis in 2021 and the Next.js face in 2023', () => {
    const born = (id: string) => PARTS.find((p) => p.id === id)!.year;
    expect([born('php'), born('python'), born('go'), born('redis'), born('next')]).toEqual([2014, 2019, 2021, 2021, 2023]);
  });

  it('never links to a part that does not exist yet', () => {
    const ends: Record<string, [string, string]> = {
      'php-db': ['php', 'db'], 'php-python': ['php', 'python'], 'python-db': ['python', 'db'], 'php-go': ['php', 'go'],
      'php-redis': ['php', 'redis'], 'next-python': ['next', 'python'], 'next-php': ['next', 'php'],
    };
    for (const l of LINKS) {
      const [a, b] = ends[l.id];
      const year = (id: string) => PARTS.find((p) => p.id === id)!.year;
      expect(l.year).toBeGreaterThanOrEqual(Math.max(year(a), year(b)));
    }
    expect(Object.keys(ends).sort()).toEqual(LINKS.map((l) => l.id).sort());
    expect(linksFor(2014).map((l) => l.id)).toEqual(['php-db']);
  });

  it('puts a flaw marker on every part', () => {
    expect(FLAWS).toHaveLength(PARTS.length);
  });
});
