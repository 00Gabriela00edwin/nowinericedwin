import React, { useState } from 'react'; // 1. Importar useState
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X } from 'lucide-react'; // 2. Importar iconos Menu y X

const Navbar = ({ cartCount, searchTerm, setSearchTerm }) => {
  // 3. Estado para controlar si el menú está abierto (true) o cerrado (false)
  const [isOpen, setIsOpen] = useState(false);

  // Función para cerrar el menú cuando hacen click en un enlace
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="navbar">
      <div className="nav-content">
        
        {/* LOGO */}
        <Link to="/" className="logo-container" onClick={closeMenu}>
          <img src="/img/logo2.png" alt="Nowin" className="nav-logo-img" />
        </Link>

        {/* BARRA DE BÚSQUEDA (La ocultamos en menú abierto en móviles si quieres, o la dejamos) */}
        <div className="search-bar-container">
          <Search className="search-icon-inside" size={18} />
          <input 
            type="text" 
            placeholder="Buscar..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* BOTÓN HAMBURGUESA (Solo visible en celular gracias al CSS) */}
        <div className="mobile-menu-icon" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </div>

        {/* ENLACES DE NAVEGACIÓN */}
        {/* Agregamos la clase 'active' si isOpen es true */}
        <div className={`nav-links ${isOpen ? 'active' : ''}`}>
          
          <Link to="/about" className="nav-link-text" onClick={closeMenu}>
            Sobre Nosotros
          </Link>
          
          <Link to="/cart" className="cart-icon-container" onClick={closeMenu}>
            <ShoppingBag size={28} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            {/* Texto opcional para el menú móvil */}
            <span className="mobile-text">Mi Carrito</span> 
          </Link>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;