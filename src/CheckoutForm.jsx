import React, { useRef, useState } from 'react';
import { ShoppingBag, X } from 'lucide-react';
import useDialogFocus from './useDialogFocus';

const CheckoutForm = ({ enviarPedido, cancelar, cart = [] }) => {
  const modalRef = useRef(null);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    direccion: ''
  });
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  useDialogFocus(true, modalRef, cancelar);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nombre = formData.nombre.trim();
    const telefono = formData.telefono.trim();
    const telefonoNumeros = telefono.replace(/\D/g, '');
    const direccion = formData.direccion.trim();

    if (nombre.length < 3) {
      setFormError('Ingresá tu nombre y apellido.');
      return;
    }

    if (telefonoNumeros.length < 8 || telefonoNumeros.length > 15) {
      setFormError('Ingresá un teléfono válido para contactarte por WhatsApp.');
      return;
    }

    if (direccion.length < 5) {
      setFormError('Ingresá una dirección de envío válida.');
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    try {
      await enviarPedido({ nombre, telefono, direccion });
    } catch (error) {
      console.error('No se pudo iniciar el pedido por WhatsApp.', error);
      setFormError('No pudimos iniciar el pedido. Revisá tus datos e intentá nuevamente.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div ref={modalRef} className="modal-content" role="dialog" aria-modal="true" aria-labelledby="checkout-title" tabIndex={-1}>
    
        <button className="close-btn" onClick={cancelar} type="button" aria-label="Cerrar formulario">
          <X size={24} />
        </button>

        <h2 id="checkout-title" className="checkout-title">Finalizar pedido</h2>
        <p className="checkout-lead">
            Completa tus datos para coordinar el envío.
        </p>

        <section className="checkout-summary" aria-label="Resumen del pedido">
          <div className="checkout-summary-heading">
            <ShoppingBag size={18} aria-hidden="true" />
            <h3>Tu pedido</h3>
          </div>
          <ul>
            {cart.map((item) => (
              <li key={item.id}>
                <span>{item.title} <small>× {item.quantity}</small></span>
                <strong>${(item.price * item.quantity).toLocaleString('es-AR')}</strong>
              </li>
            ))}
          </ul>
          <div className="checkout-summary-shipping">
            <span>Envío</span>
            <strong>A coordinar</strong>
          </div>
          <div className="checkout-summary-total">
            <span>Subtotal de productos</span>
            <strong>${subtotal.toLocaleString('es-AR')}</strong>
          </div>
          <p>El subtotal corresponde solo a los productos. El envío se coordina al confirmar por WhatsApp.</p>
        </section>

        <form onSubmit={handleSubmit} aria-busy={isSubmitting}>
          <div className="form-group checkout-field">
            <label htmlFor="checkout-name">Nombre y apellido</label>
            <input
              id="checkout-name"
              type="text"
              name="nombre"
              aria-label="Nombre y apellido"
              autoComplete="name"
              minLength={3}
              required
              data-dialog-autofocus
              value={formData.nombre}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group checkout-field">
            <label htmlFor="checkout-phone">Teléfono de WhatsApp</label>
            <input
              id="checkout-phone"
              type="tel"
              name="telefono"
              aria-label="Teléfono de WhatsApp"
              autoComplete="tel"
              inputMode="tel"
              required
              value={formData.telefono}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group checkout-field">
            <label htmlFor="checkout-address">Dirección de envío</label>
            <input
              id="checkout-address"
              type="text"
              name="direccion"
              aria-label="Dirección de envío"
              autoComplete="street-address"
              minLength={5}
              required
              value={formData.direccion}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          {formError && <p className="checkout-error" role="alert">{formError}</p>}

          <div className="modal-actions">
            
            <button type="button" onClick={cancelar} className="btn-cancelar">
              Cancelar
            </button>
            
            <button type="submit" className="btn-confirmar" disabled={isSubmitting}>
              {isSubmitting ? 'Preparando pedido...' : 'Enviar a WhatsApp'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutForm;