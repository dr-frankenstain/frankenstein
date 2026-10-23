'use client';

import { useEffect } from 'react';
import { ScrollTrigger } from '../lib/gsap';

// Pins and patch ranges depend on layout, which settles after fonts and images load.
export function ScrollRefresh() {
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    document.fonts?.ready.then(refresh);
    return () => window.removeEventListener('load', refresh);
  }, []);
  return null;
}
