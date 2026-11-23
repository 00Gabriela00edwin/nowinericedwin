import { MessageCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import './WhatsAppFloat.css';

const WhatsAppFloat = () => {
  const { pathname } = useLocation();
  const isPublicRoute =
    pathname === '/' ||
    pathname === '/cart' ||
    pathname === '/about' ||
    /^\/producto\/[^/]+$/.test(pathname);

  if (!isPublicRoute) return null;

  const message = 'Hola NOWIN! Quisiera consultar disponibilidad de stock y opciones para compras mayoristas.';

  return (
    <a
      className="whatsapp-float"
      href={`https://wa.me/5493764141598?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Consultar stock y compras mayoristas por WhatsApp"
    >
      <MessageCircle size={22} aria-hidden="true" />
      <span>Consultas</span>
    </a>
  );
};

export default WhatsAppFloat;
