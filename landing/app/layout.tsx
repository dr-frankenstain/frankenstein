import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { body, display, mono } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'Frankenstein',
  description: 'A real web app stitched from every bad decision in production. Fix a flaw. The best answer wins.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
