import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X, Home, Info } from 'lucide-react';

const Navbar = ({ cartCount, searchTerm, setSearchTerm }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <nav className="navbar">
        <div className="nav-content">
          
          {/* GRUPO IZQUIERDO: MENÚ + LOGO (JUNTOS) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            
            {/* Botón Menú */}
            <button className="menu-btn" onClick={() => setIsOpen(true)}>
              <Menu size={32} color="white" /> {/* Aumenté un poco el tamaño del icono */}
            </button>

            {/* Logo */}
            <Link to="/" className="logo-container">
              <img src="/img/logo2.png" alt="Nowin" className="nav-logo-img" />
            </Link>
          </div>

          {/* BUSCADOR (CENTRO) */}
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

          {/* CARRITO (DERECHA) */}
          <Link to="/cart" className="cart-widget">
            <ShoppingBag size={28} color="white" />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

        </div>
      </nav>

      {/* --- SIDEBAR (MENÚ LATERAL) --- */}
      {isOpen && <div className="menu-overlay" onClick={() => setIsOpen(false)}></div>}
      
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
           <h3 style={{color:'#FFC400'}}>MENÚ</h3>
           <button onClick={() => setIsOpen(false)} style={{background:'none', border:'none', cursor:'pointer'}}>
             <X size={28} color="white" />
           </button>
        </div>
        
        <div className="sidebar-links">
          <Link to="/" onClick={() => setIsOpen(false)} className="sidebar-item">
             <Home size={20} /> Inicio
          </Link>
          <Link to="/about" onClick={() => setIsOpen(false)} className="sidebar-item">
             <Info size={20} /> Sobre Nosotros
          </Link>
          <Link to="/cart" onClick={() => setIsOpen(false)} className="sidebar-item">
             <ShoppingBag size={20} /> Ver Carrito
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;