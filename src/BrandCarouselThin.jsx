import React, { useState } from 'react';
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
  { name: 'Mimen Market', url: '/img/logo30.jpg' },
  { name: 'Súper Vivar', url: '/img/logo31.jpg' },
  { name: 'Granja Isabel', url: '/img/logo32.jpg' },
];

const filas = [
  puntosDeVenta.slice(0, Math.ceil(puntosDeVenta.length / 2)),
  puntosDeVenta.slice(Math.ceil(puntosDeVenta.length / 2)),
];

const BrandCarouselThin = () => {
  const [pausado, setPausado] = useState(false);

  return (
    <section className="retailer-section" aria-labelledby="retailer-title">
      <div className="retailer-section-inner">
        <header className="retailer-heading">
          <p>RED NOWIN</p>
          <h2 id="retailer-title">Nuestros puntos de venta</h2>
          <span>Encontrá productos NOWIN en estos comercios.</span>
          <button type="button" className="retailer-pause" onClick={() => setPausado((actual) => !actual)}>
            {pausado ? 'Reanudar movimiento' : 'Pausar movimiento'}
          </button>
        </header>

        <div className={`retailer-carousel${pausado ? ' retailer-carousel--paused' : ''}`}>
          {filas.map((fila, index) => (
            <div className="retailer-row" role="region" aria-label={`Puntos de venta, fila ${index + 1}`} tabIndex={0} key={index}>
              <div className={`retailer-track${index === 1 ? ' retailer-track--reverse' : ''}`}>
                {[false, true].map((duplicada) => (
                  <ul className="retailer-list" aria-hidden={duplicada || undefined} key={String(duplicada)}>
                    {fila.map((punto) => (
                      <li className="flex w-44 shrink-0 flex-col items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-amber-400/40 hover:bg-white/[0.06]" key={punto.url}>
                        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg bg-white/5 p-2">
                          <img className="h-full w-full object-contain" src={punto.url} alt="" loading="lazy" decoding="async" />
                        </div>
                        <span className="flex min-h-8 items-center text-center text-xs leading-tight text-neutral-300">{punto.name}</span>
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandCarouselThin;
