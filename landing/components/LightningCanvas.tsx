'use client';

import { useRef } from 'react';
import { useGSAP } from '../lib/gsap';
import { createLightningLayer, lightning } from '../lib/lightning';
import s from '../styles/landing.module.css';

export function LightningCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useGSAP(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const layer = createLightningLayer(ref.current!, { reducedMotion });
    lightning.current = layer;
    return () => {
      layer.destroy();
      if (lightning.current === layer) lightning.current = null;
    };
  }, []);

  return <canvas ref={ref} className={s.lightning} aria-hidden="true" />;
}
