import { Anatomy } from '../components/Anatomy';
import { Challenges } from '../components/Challenges';
import { FinalCta } from '../components/FinalCta';
import { Footer } from '../components/Footer';
import { Hero } from '../components/Hero';
import { HowItWorks } from '../components/HowItWorks';
import { Lore } from '../components/Lore';
import { LightningCanvas } from '../components/LightningCanvas';
import { Marquee } from '../components/Marquee';
import { Nav } from '../components/Nav';
import { VitalSigns } from '../components/VitalSigns';
import s from '../styles/landing.module.css';

export default function Page() {
  return (
    <div className={s.root}>
      <LightningCanvas />
      <Nav />
      <main id="top">
        <Hero />
        <Marquee />
        <section id="vitals"><VitalSigns /></section>
        <section id="lore"><Lore /></section>
        <section id="anatomy"><Anatomy /></section>
        <section id="how"><HowItWorks /></section>
        <section id="challenges"><Challenges /></section>
        <section><FinalCta /></section>
      </main>
      <Footer />
    </div>
  );
}
