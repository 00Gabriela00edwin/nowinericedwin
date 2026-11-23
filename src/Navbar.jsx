import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X, Home, Info } from 'lucide-react';
import useDialogFocus from './useDialogFocus';

const Navbar = ({ cartCount, searchTerm, setSearchTerm, onCartClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const closeMenu = () => setIsOpen(false);

  useDialogFocus(isOpen, menuRef, closeMenu);

  return (
    <>
      <nav className="navbar">
        <div className="nav-content">
          <div className="nav-brand">
            <button
              ref={menuButtonRef}
              className="menu-btn"
              onClick={() => setIsOpen(true)}
              aria-label="Abrir menú"
              aria-expanded={isOpen}
              aria-controls="primary-menu"
            >
              <Menu size={24} aria-hidden="true" />
            </button>

            <Link to="/" className="logo-container">
              <img
                src="/img/logo2.png"
                alt="Nowin"
                className="nav-logo-img"
                loading="lazy"
                decoding="async"
              />
            </Link>
          </div>

          <div className="search-bar-container" role="search">
            <Search className="search-icon-inside" size={18} aria-hidden="true" />
            <input 
              type="search"
              placeholder="Buscar especias y sales"
              className="search-input"
              aria-label="Buscar productos"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="cart-widget"
            aria-label={`Ver carrito${cartCount > 0 ? `, ${cartCount} productos` : ''}`}
            onClick={onCartClick}
          >
            <ShoppingBag size={24} aria-hidden="true" />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

        </div>
      </nav>

      {/* --- SIDEBAR (MENÚ LATERAL) --- */}
      {isOpen && <button type="button" className="menu-overlay" onClick={closeMenu} aria-label="Cerrar menú"></button>}
      
      {isOpen && <nav
        ref={menuRef}
        id="primary-menu"
        className="sidebar open"
        role="dialog"
        aria-modal="true"
        aria-labelledby="primary-menu-title"
        tabIndex={-1}
      >
        <div className="sidebar-header">
           <h3 id="primary-menu-title" style={{color:'#FFC400'}}>MENÚ</h3>
           <button type="button" onClick={closeMenu} aria-label="Cerrar menú" data-dialog-autofocus style={{background:'none', border:'none', cursor:'pointer'}}>
             <X size={28} color="white" />
           </button>
        </div>
        
        <div className="sidebar-links">
          <Link to="/" onClick={closeMenu} className="sidebar-item">
             <Home size={20} /> Inicio
          </Link>
          <Link to="/about" onClick={closeMenu} className="sidebar-item">
             <Info size={20} /> Sobre Nosotros
          </Link>
          <Link to="/cart" onClick={closeMenu} className="sidebar-item">
             <ShoppingBag size={20} /> Ver Carrito
          </Link>
        </div>
      </nav>}
    </>
  );
};

export default Navbar;