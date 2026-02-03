import React from 'react';
import { ShoppingBag, Plus } from 'lucide-react';

const CardCondimento = ({ producto, alAgregar }) => {
  return (
    <div className="card-nowin">
      {/* Contenedor de Imagen */}
      <div className="img-container">
        {/* Aquí usamos la imagen que viene de la base de datos o local */}
        <img src={producto.img} alt={producto.title} />
      </div>

      {/* Información */}
      <div className="card-info">
        {/* Usamos el color de etiqueta como categoría si existe, sino genérico */}
        <span className="card-category" style={{ color: producto.colorEtiqueta || '#FFC400' }}>
          {producto.category || 'Condimento Premium'}
        </span>
        
        <h3 className="card-title">{producto.title}</h3>
        
        <div className="card-price">
          ${producto.price.toLocaleString()}
        </div>

        <button 
          className="btn-nowin"
          onClick={() => alAgregar(producto)}
        >
          <Plus size={20} strokeWidth={3} />
          AGREGAR
        </button>
      </div>
    </div>
  );
};

export default CardCondimento;