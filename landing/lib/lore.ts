// The architecture as it stood in each year of the lore. A part or link appears in `year` and stays.
export type Year = 2014 | 2019 | 2021 | 2023 | 2026;
export const YEARS: Year[] = [2014, 2019, 2021, 2023, 2026];

export type Part = { id: string; label: string; year: Year; x: number; y: number; w: number; h: number };
export type Link = { id: string; year: Year; d: string };

export const PARTS: Part[] = [
  { id: 'php', label: 'PHP', year: 2014, x: 10, y: 50, w: 60, h: 40 },
  { id: 'db', label: 'MySQL', year: 2014, x: 150, y: 104, w: 40, h: 26 },
  { id: 'python', label: 'Python', year: 2019, x: 80, y: 50, w: 60, h: 40 },
  { id: 'go', label: 'Go', year: 2021, x: 10, y: 104, w: 40, h: 26 },
  { id: 'redis', label: 'Redis', year: 2021, x: 60, y: 104, w: 50, h: 26 },
  { id: 'next', label: 'Next.js', year: 2023, x: 10, y: 8, w: 180, h: 24 },
];

export const LINKS: Link[] = [
  { id: 'php-db', year: 2014, d: 'M40 90 V97 H170 V104' },
  { id: 'php-python', year: 2019, d: 'M70 70 H80' },
  { id: 'python-db', year: 2019, d: 'M110 90 V97' },
  { id: 'php-go', year: 2021, d: 'M24 90 V104' },
  { id: 'php-redis', year: 2021, d: 'M56 90 L72 104' },
  { id: 'next-python', year: 2023, d: 'M110 32 V50' },
  { id: 'next-php', year: 2023, d: 'M40 32 V50' },
];

// 2026: every part carries a flaw marker, one per corner of the box.
export const FLAWS: { x: number; y: number }[] = PARTS.map((p) => ({ x: p.x + p.w - 6, y: p.y + 6 }));

export const partsFor = (year: Year) => PARTS.filter((p) => p.year <= year);
export const linksFor = (year: Year) => LINKS.filter((l) => l.year <= year);
