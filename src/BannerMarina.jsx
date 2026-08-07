import React from 'react';
import './BannerMarina.css';

const BannerMarina = () => {
  return (
    <div className="marina-banner">
      <div className="marina-wrapper">
        
        {/* TEXTOS ARRIBA */}
        <div className="marina-info">
          <span className="badge-marina">NUEVO LANZAMIENTO</span>
          <h2 className="marina-titulo">SAL MARINA</h2>
          <p className="marina-desc">
            Descubrí la pureza en cada cristal. Un toque gourmet, natural y crujiente, ideal para realzar los sabores más exclusivos de tu cocina.
          </p>
        </div>

        {/* PRODUCTO GIGANTE EN EL MEDIO */}
        <div className="marina-imagen-container">
          <img 
            src="/img/salmarina.png" 
            alt="Nueva Sal Marina Nowin" 
            className="img-marina-flotante" 
          />
        </div>

        {/* BOTÓN ABAJO */}
        <button 
          className="btn-marina" 
          onClick={() => window.open('https://wa.me/5493764141598?text=Hola NOWIN! Quiero probar el nuevo lanzamiento de Sal Marina', '_blank')}
        >
          PROBAR AHORA
        </button>

      </div>
    </div>
  );
};

export default BannerMarina;