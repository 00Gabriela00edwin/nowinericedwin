import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X, Home, Info } from 'lucide-react';
import useDialogFocus from './useDialogFocus';
import { normalizeSearchText } from './searchText';

const Navbar = ({ cartCount, products = [], searchTerm, setSearchTerm, onCartClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const closeMenu = () => setIsOpen(false);
  const searchQuery = normalizeSearchText(searchTerm);
  const suggestions = useMemo(() => {
    if (searchQuery.length < 2) return [];

    return products
      .map((product, index) => {
        const title = normalizeSearchText(product.title);
        const category = normalizeSearchText(product.category);
        const description = normalizeSearchText(product.description);
        const relevance = title.startsWith(searchQuery)
          ? 0
          : title.includes(searchQuery)
          ? 1
          : category.includes(searchQuery)
          ? 2
          : description.includes(searchQuery)
          ? 3
          : null;

        return { product, index, relevance };
      })
      .filter((result) => result.relevance !== null)
      .sort((first, second) => first.relevance - second.relevance || first.index - second.index)
      .slice(0, 5)
      .map((result) => result.product);
  }, [products, searchQuery]);

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
              aria-autocomplete="list"
              aria-expanded={searchFocused && suggestions.length > 0}
              aria-controls="product-search-suggestions"
              value={searchTerm}
              onFocus={() => setSearchFocused(true)}
              onChange={(e) => setSearchTerm(e.target.value)}
              onBlur={(e) => {
                if (!e.currentTarget.parentElement?.contains(e.relatedTarget)) setSearchFocused(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setSearchFocused(false);
              }}
            />
            {searchFocused && suggestions.length > 0 && (
              <div className="search-suggestions" id="product-search-suggestions" role="group" aria-label="Sugerencias de productos">
                {suggestions.map((product) => (
                  <Link
                    className="search-suggestion"
                    key={product.id}
                    to={`/producto/${product.id}`}
                    onClick={() => {
                      setSearchTerm('');
                      setSearchFocused(false);
                    }}
                  >
                    <span>{product.title}</span>
                    <small>{product.category} · ${Number(product.price || 0).toLocaleString('es-AR')}</small>
                  </Link>
                ))}
              </div>
            )}
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