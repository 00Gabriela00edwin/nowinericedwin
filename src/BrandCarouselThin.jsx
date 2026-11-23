import React from 'react';
import './BrandCarouselThin.css';

const puntosDeVenta = [
  { name: 'Estación de Carnes', url: '/img/clientes1.webp', emphasize: true },
  { name: 'La Industria del Pollo', url: '/img/clientes2.webp' },
  { name: 'Super Carnes', url: '/img/clientes3.webp' },
  { name: 'Carnicería El Corral', url: '/img/clientes4.webp' },
  { name: 'Vanto Carnicería', url: '/img/clientes5.webp' },
  { name: 'Multi Express', url: '/img/clientes6.webp' },
  { name: 'Punto de venta de carnes', url: '/img/clientes7.webp', emphasize: true },
  { name: 'La Ruta de la Carne', url: '/img/cliente8.webp' },
  { name: 'Supermercado Maludi', url: '/img/clientes9.webp' },
  { name: 'Locos x la Carne', url: '/img/cliente10.webp' },
];

const BrandCarouselThin = () => (
  <section className="retailer-section" aria-labelledby="retailer-title">
    <div className="retailer-section-inner">
      <header className="retailer-heading">
        <p>RED NOWIN</p>
        <h2 id="retailer-title">Nuestros puntos de venta</h2>
        <span>Encontrá productos NOWIN en estos comercios.</span>
      </header>

      <ul className="retailer-grid">
        {puntosDeVenta.map((punto) => (
          <li className="retailer-logo-item" key={punto.url}>
            <img
              className={punto.emphasize ? 'retailer-logo-emphasized' : undefined}
              src={punto.url}
              alt=""
              loading="lazy"
              decoding="async"
            />
            <span className="retailer-logo-caption">{punto.name}</span>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default BrandCarouselThin;
