import localFont from 'next/font/local';

export const display = localFont({
  src: [
    { path: '../node_modules/@fontsource/big-shoulders-display/files/big-shoulders-display-latin-800-normal.woff2', weight: '800' },
    { path: '../node_modules/@fontsource/big-shoulders-display/files/big-shoulders-display-latin-900-normal.woff2', weight: '900' },
  ],
  variable: '--font-display',
  display: 'swap',
});

export const body = localFont({
  src: [
    { path: '../node_modules/@fontsource/geist-sans/files/geist-sans-latin-400-normal.woff2', weight: '400' },
    { path: '../node_modules/@fontsource/geist-sans/files/geist-sans-latin-500-normal.woff2', weight: '500' },
    { path: '../node_modules/@fontsource/geist-sans/files/geist-sans-latin-600-normal.woff2', weight: '600' },
  ],
  variable: '--font-body',
  display: 'swap',
});

export const mono = localFont({
  src: [
    { path: '../node_modules/@fontsource/geist-mono/files/geist-mono-latin-400-normal.woff2', weight: '400' },
    { path: '../node_modules/@fontsource/geist-mono/files/geist-mono-latin-500-normal.woff2', weight: '500' },
  ],
  variable: '--font-mono',
  display: 'swap',
});
