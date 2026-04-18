import React from 'react';
import './BrandCarouselThin.css';

const BrandCarouselThin = () => {
  const logos = [
    { name: 'Cliente 1', url: '/img/clientes1.png' },
    { name: 'Cliente 2', url: '/img/clientes2.png' },
    { name: 'Cliente 3', url: '/img/clientes3.png' },
    { name: 'Cliente 4', url: '/img/clientes4.png' },
    { name: 'Cliente 5', url: '/img/clientes5.png' },
    { name: 'Cliente 6', url: '/img/clientes6.png' },
    { name: 'Cliente 7', url: '/img/clientes7.png' },
    { name: 'Cliente 8', url: '/img/cliente8.png' },

  ];

  // Triplicamos los logos para que el carrusel sea infinito y no se vea el salto
  const doubleLogos = [...logos, ...logos, ...logos];

  return (
    <div className="carousel-container">
      {/* Título de clientes */}
      <h4 className="carousel-title"> NUESTROS PUNTOS DE VENTA:</h4>
      
      <div className="thin-marquee">
        <div className="marquee-content">
          {doubleLogos.map((logo, index) => (
            <div className="marquee-item" key={index}>
              <img src={logo.url} alt={logo.name} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandCarouselThin;