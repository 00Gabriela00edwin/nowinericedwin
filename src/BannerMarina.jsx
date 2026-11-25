import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import ProductImage from './ProductImage';
import './BannerMarina.css';

const BannerMarina = () => {
  const message = encodeURIComponent('Hola NOWIN! Quiero consultar por la Sal Marina y su disponibilidad.');

  return (
    <section className="marina-section" aria-labelledby="marina-title">
      <div className="marina-banner">
        <div className="marina-wrapper">
          <div className="marina-info">
            <span className="badge-marina"><span aria-hidden="true" /> NUEVO LANZAMIENTO</span>
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
            <ProductImage
              src="/img/salrosa.png"
              useWebp={false}
              alt="Sal Marina Nowin"
              loading="lazy"
              decoding="async"
              className="img-marina-flotante"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BannerMarina;