import { useEffect } from 'react';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import './CartDrawer.css';

export const FREE_SHIPPING_THRESHOLD = 100000;

const CartDrawer = ({ cart, onClose, addToCart, decreaseQuantity, removeFromCart, onStartCheckout }) => {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const progress = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const amountToFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - total, 0);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="cart-drawer-layer">
      <button className="cart-drawer-backdrop" onClick={onClose} aria-label="Cerrar carrito" />
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title">
        <header className="cart-drawer-header">
          <div>
            <p className="cart-drawer-eyebrow">TU SELECCIÓN</p>
            <h2 id="cart-drawer-title">Mi carrito</h2>
          </div>
          <button className="cart-drawer-close" onClick={onClose} aria-label="Cerrar carrito">
            <X size={22} />
          </button>
        </header>

        <section className="shipping-progress" aria-label="Progreso para envío bonificado">
          <p>
            {amountToFreeShipping > 0
              ? `Te faltan $${amountToFreeShipping.toLocaleString('es-AR')} para el envío bonificado`
              : '¡Alcanzaste el envío bonificado!'}
          </p>
          <div
            className="shipping-progress-track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={FREE_SHIPPING_THRESHOLD}
            aria-valuenow={Math.min(total, FREE_SHIPPING_THRESHOLD)}
            aria-label="Progreso hacia el envío bonificado"
          >
            <span style={{ width: `${progress}%` }} />
          </div>
          <small>Envío bonificado desde ${FREE_SHIPPING_THRESHOLD.toLocaleString('es-AR')}</small>
        </section>

        <div className="cart-drawer-items">
          {cart.length === 0 ? (
            <div className="cart-drawer-empty">
              <ShoppingBag size={36} aria-hidden="true" />
              <p>Tu carrito está vacío.</p>
              <button onClick={onClose}>Seguir explorando</button>
            </div>
          ) : cart.map((item) => (
            <article className="cart-drawer-item" key={item.id}>
              <img src={item.img} alt="" loading="lazy" />
              <div className="cart-drawer-item-info">
                <h3>{item.title}</h3>
                <p>${item.price.toLocaleString('es-AR')}</p>
                <div className="cart-drawer-quantity">
                  <button
                    onClick={() => decreaseQuantity(item.id)}
                    disabled={item.quantity <= 1}
                    aria-label={`Quitar una unidad de ${item.title}`}
                  >
                    <Minus size={15} />
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => addToCart(item)} aria-label={`Agregar una unidad de ${item.title}`}>
                    <Plus size={15} />
                  </button>
                </div>
              </div>
              <button
                className="cart-drawer-remove"
                onClick={() => removeFromCart(item.id)}
                aria-label={`Eliminar ${item.title} del carrito`}
              >
                <Trash2 size={18} />
              </button>
            </article>
          ))}
        </div>

        <footer className="cart-drawer-footer">
          <div className="cart-drawer-total">
            <span>Subtotal</span>
            <strong>${total.toLocaleString('es-AR')}</strong>
          </div>
          <button
            className="cart-drawer-checkout"
            onClick={onStartCheckout}
            disabled={cart.length === 0}
          >
            Continuar con el pedido
          </button>
          <button className="cart-drawer-continue" onClick={onClose}>Seguir comprando</button>
        </footer>
      </aside>
    </div>
  );
};

export default CartDrawer;
