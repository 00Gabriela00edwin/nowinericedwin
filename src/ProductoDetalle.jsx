import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, ArrowLeft } from 'lucide-react';

const ProductoDetalle = ({ productos, alAgregar }) => {
  // Extraemos el ID de la URL
  const { id } = useParams();
  
  // Buscamos el producto en tu lista
  const producto = productos.find((p) => p.id.toString() === id);

  // Si alguien pone un ID que no existe, mostramos esto:
  if (!producto) {
    return (
      <div className="detalle-no-encontrado">
        <h2>Producto no encontrado</h2>
        <Link to="/">Volver al inicio</Link>
      </div>
    );
  }

  return (
    <div className="detalle-container">
      <div className="detalle-volver">
        <Link to="/" className="btn-volver">
          <ArrowLeft size={20} /> Volver a los productos
        </Link>
      </div>

      <div className="detalle-grid">
        {/* Columna Izquierda: Imagen */}
        <div className="detalle-imagen-caja">
          <img src={producto.img} alt={producto.title} />
        </div>

        {/* Columna Derecha: Información y Descripción */}
        <div className="detalle-info">
          <span className="detalle-categoria">{producto.category}</span>
          <h1 className="detalle-titulo">{producto.title}</h1>
          <p className="detalle-precio">${producto.price.toLocaleString()}</p>
          
          {/* Aquí va la descripción larga de tu producto */}
          <div className="detalle-descripcion">
            <h3>Descripción del producto</h3>
            <p>
              {producto.description || "Este es un condimento de la más alta calidad, seleccionado cuidadosamente para realzar el sabor de tus comidas. Ideal para uso diario o profesional en gastronomía."}
            </p>
          </div>

          <button className="btn-agregar-detalle" onClick={() => alAgregar(producto)}>
            <Plus size={20} /> AGREGAR AL CARRITO
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductoDetalle;