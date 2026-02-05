import React from 'react';
import { Plus } from 'lucide-react'; 

const CardCondimento = ({ producto, alAgregar }) => {
  return (
    <div className="card-condimento">
      <div className="card-header">
        <img 
            src={producto.img} 
            alt={producto.title} 
            className="card-img"
            style={{ transition: 'transform 0.3s' }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        />
      </div>
      <div className="card-body">
        <div>
          <div className="card-category">{producto.category}</div>
          <h3 className="card-title">{producto.title}</h3>
        </div>
        <div>
          <div className="card-price">${producto.price.toLocaleString()}</div>
          <button className="btn-agregar" onClick={() => alAgregar(producto)}>
            <Plus size={18} /> AGREGAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardCondimento;
