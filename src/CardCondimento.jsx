import React from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom'; // <-- NUEVO: Importamos Link
import ProductImage from './ProductImage';

const CardCondimento = ({ producto, alAgregar, alAbrir }) => {
  const esMayorista =
    producto.category?.toLowerCase().includes('mayorista') ||
    /1\s?(kg|kilo)/i.test(producto.title);

  const abrirDesdeEnlace = (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    alAbrir(producto.id);
  };

  return (
    <div
      className="card-condimento"
      onClick={(event) => {
        if (!event.target.closest('a, button')) alAbrir(producto.id);
      }}
    >
     <div className="card-header">
        {esMayorista && <span className="wholesale-badge">FORMATO 1 KG</span>}
        {/* Le damos flex y 100% al Link para que ocupe el header correctamente */}
        <Link 
          to={`/producto/${producto.id}`} 
          state={{ scrollToProduct: true }}
          onClick={abrirDesdeEnlace}
          style={{ display: 'flex', width: '100%', height: '100%', justifyContent: 'center' }}
        >
          <ProductImage
            src={producto.img}
            alt={producto.title}
            loading="lazy"
            decoding="async"
            className="card-img"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </Link>
      </div>
      <div className="card-body">
        <div>
          <div className="card-category">{producto.category}</div>
          {/* <-- NUEVO: Envolvemos el título en el Link (con estilos para que no se ponga azul/subrayado) */}
          <Link to={`/producto/${producto.id}`} state={{ scrollToProduct: true }} onClick={abrirDesdeEnlace} style={{ textDecoration: 'none', color: 'inherit' }}>
            <h3 className="card-title">{producto.title}</h3>
          </Link>
        </div>
        <div>
          <div className="card-price">${producto.price.toLocaleString('es-AR')}</div>
          <button className="btn-agregar" onClick={() => alAgregar(producto)} aria-label={`Agregar ${producto.title} al carrito`}>
            <Plus size={18} aria-hidden="true" /> Agregar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardCondimento;
