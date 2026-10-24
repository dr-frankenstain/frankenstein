import { Anatomy } from '../components/Anatomy';
import { Challenges } from '../components/Challenges';
import { FinalCta } from '../components/FinalCta';
import { Footer } from '../components/Footer';
import { Hero } from '../components/Hero';
import { HowItWorks } from '../components/HowItWorks';
import { LightningCanvas } from '../components/LightningCanvas';
import { Lore } from '../components/Lore';
import { Marquee } from '../components/Marquee';
import { Nav } from '../components/Nav';
import { Patch } from '../components/Patch';
import { ScrollRefresh } from '../components/ScrollRefresh';
import { VitalSigns } from '../components/VitalSigns';
import s from '../styles/landing.module.css';

// The challenge list comes from GitHub issues; refresh it on a timer instead of on every request.
export const revalidate = 1800;

export default function Page() {
  return (
    <div className={s.root}>
      <LightningCanvas />
      <ScrollRefresh />
      <Nav />
      <main id="top">
        <Hero />
        <Marquee />
        <Patch id="vitals" seed={11} tilt={1}><VitalSigns /></Patch>
        <Patch id="lore" seed={23} tilt={0}><Lore /></Patch>
        <Patch id="anatomy" seed={37} tilt={1}><Anatomy /></Patch>
        <Patch id="how" seed={41} tilt={-1}><HowItWorks /></Patch>
        <Patch id="challenges" seed={59} tilt={1}><Challenges /></Patch>
        <Patch seed={73} tilt={-1}><FinalCta /></Patch>
      </main>
      <Footer />
    </div>
  );
}
