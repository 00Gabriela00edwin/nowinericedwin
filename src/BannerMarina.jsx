import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import ProductImage from './ProductImage';
import './BannerMarina.css';

const BannerMarina = () => {
  const sceneRef = useRef(null);
  const videoRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  const message = encodeURIComponent('Hola NOWIN! Quiero consultar por la Sal Marina y su disponibilidad.');

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setMotionAllowed(!preference.matches);
    updatePreference();
    preference.addEventListener('change', updatePreference);
    return () => preference.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    const updateVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', updateVisibility);
    return () => document.removeEventListener('visibilitychange', updateVisibility);
  }, []);

  useEffect(() => {
    if (!window.IntersectionObserver) {
      console.error('No se puede observar la visibilidad del video de Sal Rosa.');
      setVideoError(true);
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.1 });
    observer.observe(sceneRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !visible || !motionAllowed || !pageVisible) return undefined;
    let active = true;
    const play = () => {
      video.play().catch((error) => {
        if (error.name === 'AbortError') {
          if (active) console.warn('Se interrumpió la reproducción del video de Sal Rosa.', error);
          return;
        }
        console.error('No se pudo reproducir el video de Sal Rosa.', error);
        setVideoError(true);
      });
    };
    play();
    window.addEventListener('focus', play);
    return () => {
      active = false;
      window.removeEventListener('focus', play);
      video.pause();
    };
  }, [visible, motionAllowed, pageVisible, videoError]);

  return (
    <section className="marina-section" aria-labelledby="marina-title">
      <div className="marina-banner">
        <div className="marina-watermark" aria-hidden="true">SAL ROSA</div>
        <div className="marina-wrapper">
          <div className="marina-info">
            <h2 className="marina-titulo" id="marina-title">SAL MARINA</h2>
            <p className="marina-desc">
              Descubrí la pureza en cada cristal. Un toque gourmet, natural y crujiente, ideal para realzar los sabores más exclusivos de tu cocina.
            </p>
            <a
              className="btn-marina"
              href={`https://wa.me/5493764141598?text=${message}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              CONSULTAR POR WHATSAPP <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          </div>

          <div className="marina-imagen-container">
            <div ref={sceneRef} className="marina-scene">
              <div className="marina-glow" aria-hidden="true" />
              {videoError ? (
                <ProductImage src="/img/salrosa.png" useWebp={false} alt="Sal Marina Rosa Nowin" className="img-marina-flotante" />
              ) : (
                <video
                  ref={videoRef}
                  className="marina-video"
                  src={visible && motionAllowed && pageVisible ? '/videos/sal-rosa.mp4' : undefined}
                  poster="/img/salrosa.png"
                  aria-label="Video de Sal Rosa"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  onError={() => {
                    console.error('No se pudo cargar el video de Sal Rosa.');
                    setVideoError(true);
                  }}
                >
                  Tu navegador no admite video.
                </video>
              )}
            </div>
            {videoError && <p role="status">No se pudo reproducir el video de Sal Rosa.</p>}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BannerMarina;
