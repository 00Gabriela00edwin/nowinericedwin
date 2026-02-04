import React from 'react';
import { ShoppingBag, Plus } from 'lucide-react';

const CardCondimento = ({ producto, alAgregar }) => {
  return (
    <div className="card-nowin">
      
      {/* --- CAMBIO AQUÍ: IMAGEN CON ZOOM --- */}
      <div className="img-container" style={{ 
          padding: '5px',        /* Reducimos el espacio (antes era mayor) */
          overflow: 'hidden'     /* Para que si crece mucho no se salga del borde */
      }}>
        <img 
            src={producto.img} 
            alt={producto.title} 
            style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                transform: 'scale(1.35)', /* EL TRUCO: Aumentamos al 135% */
                transition: 'transform 0.3s ease' /* Suavizado */
            }}
        />
      </div>

      {/* --- INFORMACIÓN (SE MANTIENE IGUAL) --- */}
      <div className="card-info">
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