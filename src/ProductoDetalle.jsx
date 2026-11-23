import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, Minus, ArrowLeft } from 'lucide-react';
import CardCondimento from './CardCondimento';

const ProductoDetalle = ({ productos, alAgregar }) => {
  const { id } = useParams();
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    setCantidad(1);
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
  const descripcion = producto.description || 'Consultanos para recibir más información sobre este producto.';
  const atributos = [
    { etiqueta: 'Presentación', valor: presentacion },
    { etiqueta: 'Ingredientes', valor: ingredientes },
    { etiqueta: 'Ideal para', valor: usos },
  ].filter((atributo) => atributo.valor);
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
          <img src={producto.img} alt={`Presentación de ${producto.title}`} loading="lazy" decoding="async" />
        </div>

        <div className="detalle-info">
          <span className="detalle-categoria">{producto.category}</span>
          <h1 className="detalle-titulo">{producto.title}</h1>
          <p className="detalle-precio">${producto.price.toLocaleString()}</p>

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
        </div>
      </div>
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