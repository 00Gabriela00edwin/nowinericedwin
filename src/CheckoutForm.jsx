import React, { useState } from 'react';
import { X } from 'lucide-react'; 

const CheckoutForm = ({ enviarPedido, cancelar }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    direccion: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    enviarPedido(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
    
        <button className="close-btn" onClick={cancelar} type="button">
          <X size={24} />
        </button>

        <h2 style={{color: '#FFC400', marginBottom: '10px', marginTop:'0'}}>Finalizar Compra</h2>
        <p style={{marginBottom: '20px', color: '#666', fontSize:'0.95rem'}}>
            Completa tus datos para coordinar el envío.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="nombre"
              placeholder="Nombre y Apellido"
              required
              value={formData.nombre}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <input
              type="tel"
              name="telefono"
              placeholder="Teléfono (WhatsApp)"
              required
              value={formData.telefono}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              name="direccion"
              placeholder="Dirección de envío"
              required
              value={formData.direccion}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="modal-actions">
            
            <button type="button" onClick={cancelar} className="btn-cancelar">
              Cancelar
            </button>
            
            <button type="submit" className="btn-confirmar">
              Enviar a WhatsApp
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutForm;