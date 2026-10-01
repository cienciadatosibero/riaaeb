// frontend/src/Home.jsx
import { useEffect } from 'react';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import About from './components/About.jsx';
import Investigaciones from './components/Investigaciones.jsx';
import Publicaciones from './components/Publicaciones.jsx';
import News from './components/News.jsx';
import Investigadores from './components/Investigadores.jsx';
import Instituciones from './components/Instituciones.jsx';
import CTABanner from './components/CTABanner.jsx';
import Footer from './components/Footer.jsx';
import Reveal from './components/ui/Reveal.jsx';
import SiteBackground from './components/ui/SiteBackground.jsx';

export default function Home() {
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      // pequeño retraso para que las secciones ya estén montadas
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, []);

  return (
    <>
      <SiteBackground />
      <Header />
      <main>
        <Hero />
        <Reveal><About /></Reveal>
        <Reveal><Investigaciones /></Reveal>
        <Reveal><Publicaciones /></Reveal>
        <Reveal><News /></Reveal>
        <Reveal><Investigadores /></Reveal>
        <Reveal><Instituciones /></Reveal>
        <Reveal><CTABanner /></Reveal>
      </main>
      <Footer />
    </>
  );
}
