import React from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom'; // <-- NUEVO: Importamos Link

const CardCondimento = ({ producto, alAgregar }) => {
  return (
    <div className="card-condimento">
     <div className="card-header">
        {/* Le damos flex y 100% al Link para que ocupe el header correctamente */}
        <Link 
          to={`/producto/${producto.id}`} 
          style={{ display: 'flex', width: '100%', height: '100%', justifyContent: 'center' }}
        >
          <img
            src={producto.img}
            alt={producto.title}
            className="card-img"
            style={{
              transition: 'transform 0.3s',
              width: '100%',
              height: '100%', /* <-- CAMBIAMOS EL 700px POR 100% */
              objectFit: 'contain' /* Contain respeta la proporción sin cortar tu producto */
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.6)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1.6)'}
          />
        </Link>
      </div>
      <div className="card-body">
        <div>
          <div className="card-category">{producto.category}</div>
          {/* <-- NUEVO: Envolvemos el título en el Link (con estilos para que no se ponga azul/subrayado) */}
          <Link to={`/producto/${producto.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <h3 className="card-title">{producto.title}</h3>
          </Link>
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