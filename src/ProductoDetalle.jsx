import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, Minus, ArrowLeft, MessageCircle, Star, Truck } from 'lucide-react';
import CardCondimento from './CardCondimento';
import ProductImage from './ProductImage';
import { FREE_SHIPPING_THRESHOLD } from './shipping';

const ProductoDetalle = ({ productos, alAgregar }) => {
  const { id } = useParams();
  const [cantidad, setCantidad] = useState(1);
  const [imagenActiva, setImagenActiva] = useState(0);

  useEffect(() => {
    setCantidad(1);
    setImagenActiva(0);
  }, [id]);

  const producto = productos.find((p) => p.id.toString() === id);

  if (!producto) {
    return (
      <div className="detalle-no-encontrado">
        <h2>Producto no encontrado</h2>
        <Link to="/">Volver al inicio</Link>
      </div>
    );
  }

  const presentacionExplicita = String(producto.title ?? '').match(/\b\d+(?:[.,]\d+)?\s?(?:kg|kilos?|g|gr|ml|l)\b/i)?.[0];
  const esMayorista = producto.category?.toLowerCase().includes('mayorista');
  const presentacion = producto.presentacion || producto.presentation || presentacionExplicita || (esMayorista ? 'Formato mayorista' : null);
  const ingredientes = producto.ingredientes || producto.ingredients;
  const usos = producto.idealPara || producto.usos || producto.uses;
  const origen = producto.origen || producto.origin || producto.procedencia;
  const pesoNeto = producto.pesoNeto || producto.netWeight || producto.peso;
  const alergenos = producto.alergenos || producto.allergens;
  const conservacion = producto.conservacion || producto.storage;
  const descripcion = producto.description || 'Consultanos para recibir más información sobre este producto.';
  const imagenes = [...new Set([
    producto.img,
    ...(Array.isArray(producto.images) ? producto.images : []),
    ...(Array.isArray(producto.imagenes) ? producto.imagenes : []),
  ].filter((imagen) => typeof imagen === 'string' && imagen.trim()))];
  const imagenPrincipal = imagenes[imagenActiva] || producto.img;
  const pesoFuente = [pesoNeto, presentacion, presentacionExplicita].find((valor) =>
    /(\d+(?:[.,]\d+)?)\s*(kg|kilos?|gr|g)\b/i.test(String(valor || ''))
  );
  const pesoMatch = String(pesoFuente || '').match(/(\d+(?:[.,]\d+)?)\s*(kg|kilos?|gr|g)\b/i);
  const pesoEnUnidad = pesoMatch ? Number(pesoMatch[1].replace(',', '.')) : 0;
  const pesoEnKilos = pesoMatch && /^(?:g|gr)$/i.test(pesoMatch[2]) ? pesoEnUnidad / 1000 : pesoEnUnidad;
  const precioPorKilo = esMayorista && pesoEnKilos > 0 ? Math.round(Number(producto.price) / pesoEnKilos) : null;
  const atributos = [
    { etiqueta: 'Presentación', valor: presentacion },
    { etiqueta: 'Ingredientes', valor: ingredientes },
    { etiqueta: 'Ideal para', valor: usos },
    { etiqueta: 'Origen', valor: origen },
    { etiqueta: 'Peso neto', valor: pesoNeto },
    { etiqueta: 'Alérgenos', valor: alergenos },
    { etiqueta: 'Conservación', valor: conservacion },
  ].filter((atributo) => atributo.valor);
  const reseñasVerificadas = (Array.isArray(producto.reviews) ? producto.reviews : []).filter((reseña) =>
    reseña &&
    (reseña.verifiedPurchase === true || reseña.verified === true) &&
    Number(reseña.rating) >= 1 &&
    Number(reseña.rating) <= 5 &&
    String(reseña.text || reseña.comment || '').trim()
  );
  const calificacionPromedio = reseñasVerificadas.length
    ? reseñasVerificadas.reduce((total, reseña) => total + Number(reseña.rating), 0) / reseñasVerificadas.length
    : 0;
  const mensajeMayorista = encodeURIComponent(`Hola NOWIN! Quiero consultar disponibilidad y condiciones mayoristas para ${producto.title}.`);
  const productosRelacionados = productos
    .filter((item) => item.id !== producto.id && item.category === producto.category)
    .slice(0, 4);

  return (
    <div className="detalle-container">
      <div className="detalle-volver">
        <Link to="/" className="btn-volver">
          <ArrowLeft size={20} /> Volver a los productos
        </Link>
      </div>

      <div className="detalle-grid">
        <div className="detalle-imagen-caja">
          <div className="detalle-galeria">
            <div className="detalle-galeria-principal">
              <ProductImage src={imagenPrincipal} alt={`Presentación de ${producto.title}`} loading="lazy" decoding="async" />
            </div>
            {imagenes.length > 1 && (
              <div className="detalle-galeria-miniaturas" aria-label="Más imágenes del producto">
                {imagenes.map((imagen, index) => (
                  <button
                    type="button"
                    className="detalle-galeria-miniatura"
                    key={imagen}
                    aria-label={`Ver imagen ${index + 1} de ${imagenes.length}`}
                    aria-pressed={imagenActiva === index}
                    onClick={() => setImagenActiva(index)}
                  >
                    <ProductImage src={imagen} alt="" loading="lazy" decoding="async" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="detalle-info">
          <span className="detalle-categoria">{producto.category}</span>
          <h1 className="detalle-titulo">{producto.title}</h1>
          <div className="detalle-precio-bloque">
            <p className="detalle-precio">${producto.price.toLocaleString('es-AR')}</p>
            {precioPorKilo && <p className="detalle-precio-unidad">${precioPorKilo.toLocaleString('es-AR')} / kg</p>}
          </div>
          <p className="detalle-envio">
            <Truck size={18} aria-hidden="true" />
            <span>Envío a coordinar por WhatsApp. Bonificado desde ${FREE_SHIPPING_THRESHOLD.toLocaleString('es-AR')}.</span>
          </p>

          {atributos.length > 0 && (
            <dl className="detalle-atributos">
              {atributos.map(({ etiqueta, valor }) => (
                <div className="detalle-atributo" key={etiqueta}>
                  <dt>{etiqueta}</dt>
                  <dd>{Array.isArray(valor) ? valor.join(', ') : valor}</dd>
                </div>
              ))}
            </dl>
          )}

          <section className="detalle-descripcion">
            <h2>Descripción y usos sugeridos</h2>
            <p>{descripcion}</p>
          </section>

          <div className="detalle-compra">
            <div className="detalle-cantidad" role="group" aria-label="Seleccionar cantidad">
              <button
                type="button"
                onClick={() => setCantidad((actual) => Math.max(1, actual - 1))}
                disabled={cantidad <= 1}
                aria-label="Restar una unidad"
              >
                <Minus size={18} />
              </button>
              <span aria-live="polite">{cantidad}</span>
              <button
                type="button"
                onClick={() => setCantidad((actual) => Math.min(99, actual + 1))}
                disabled={cantidad >= 99}
                aria-label="Sumar una unidad"
              >
                <Plus size={18} />
              </button>
            </div>

            <button
              type="button"
              className="btn-agregar-detalle"
              onClick={() => {
                alAgregar(producto, cantidad);
                setCantidad(1);
              }}
            >
              <Plus size={20} /> AGREGAR AL PEDIDO
            </button>
          </div>
          {esMayorista && (
            <a
              className="btn-consulta-mayorista"
              href={`https://wa.me/5493764141598?text=${mensajeMayorista}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={18} aria-hidden="true" /> Consultar condiciones mayoristas
            </a>
          )}
        </div>
      </div>
      {reseñasVerificadas.length > 0 && (
        <section className="detalle-resenas" aria-labelledby="resenas-title">
          <div className="detalle-resenas-heading">
            <div>
              <p>EXPERIENCIAS REALES</p>
              <h2 id="resenas-title">Opiniones verificadas</h2>
            </div>
            <span>{calificacionPromedio.toFixed(1)} / 5 · {reseñasVerificadas.length} reseñas</span>
          </div>
          <div className="detalle-resenas-lista">
            {reseñasVerificadas.map((reseña, index) => {
              const puntuacion = Number(reseña.rating);
              return (
                <article className="detalle-resena" key={`${reseña.author || reseña.name || 'cliente'}-${index}`}>
                  <div className="detalle-resena-meta">
                    <strong>{reseña.author || reseña.name || 'Cliente'}</strong>
                    <span className="detalle-resena-estrellas" aria-label={`${puntuacion} de 5 estrellas`}>
                      {Array.from({ length: 5 }, (_, estrella) => (
                        <Star key={estrella} size={15} fill={estrella < Math.round(puntuacion) ? 'currentColor' : 'none'} aria-hidden="true" />
                      ))}
                    </span>
                  </div>
                  <p>{reseña.text || reseña.comment}</p>
                </article>
              );
            })}
          </div>
        </section>
      )}
      {productosRelacionados.length > 0 && (
        <section className="detalle-relacionados" aria-labelledby="relacionados-title">
          <div className="detalle-relacionados-heading">
            <div>
              <p>SEGUÍ EXPLORANDO</p>
              <h2 id="relacionados-title">También te puede interesar</h2>
            </div>
            <span>{producto.category}</span>
          </div>
          <div className="product-grid">
            {productosRelacionados.map((item) => (
              <CardCondimento key={item.id} producto={item} alAgregar={alAgregar} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductoDetalle;