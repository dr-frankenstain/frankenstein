import { Footer } from '../components/Footer';
import { Hero } from '../components/Hero';
import { Marquee } from '../components/Marquee';
import { Nav } from '../components/Nav';
import s from '../styles/landing.module.css';

export default function Page() {
  return (
    <div className={s.root}>
      <Nav />
      <main id="top">
        <Hero />
        <Marquee />
      </main>
      <Footer />
    </div>
  );
}
