import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import './WhatsAppFloat.css';

const WhatsAppFloat = () => {
  const { pathname } = useLocation();
  const [retailerSectionVisible, setRetailerSectionVisible] = useState(false);
  const isPublicRoute =
    pathname === '/' ||
    pathname === '/cart' ||
    pathname === '/about' ||
    /^\/producto\/[^/]+$/.test(pathname);

  useEffect(() => {
    if (!isPublicRoute || typeof IntersectionObserver === 'undefined') return undefined;

    const retailerSection = document.querySelector('.retailer-section');
    if (!retailerSection) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      setRetailerSectionVisible(entry.isIntersecting);
    });
    observer.observe(retailerSection);

    return () => observer.disconnect();
  }, [isPublicRoute]);

  if (!isPublicRoute) return null;

  const message = 'Hola NOWIN! Quisiera consultar disponibilidad, envíos, medios de pago y opciones mayoristas.';

  return (
    <a
      className={`whatsapp-float${retailerSectionVisible ? ' whatsapp-float-hidden' : ''}`}
      href={`https://wa.me/5493764141598?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Consultar disponibilidad, envíos, medios de pago y compras mayoristas por WhatsApp"
      aria-hidden={retailerSectionVisible}
      tabIndex={retailerSectionVisible ? -1 : undefined}
    >
      <MessageCircle size={22} aria-hidden="true" />
      <span>Consultas</span>
    </a>
  );
};

export default WhatsAppFloat;
