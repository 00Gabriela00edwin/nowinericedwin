import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Search, Plus, Minus, Trash2, ShoppingBag, Instagram, Truck, MapPin, MessageCircle, ArrowDown, Leaf, Store, X } from 'lucide-react';
import Navbar from './Navbar'; 
import CardCondimento from './CardCondimento'; 
import { FREE_SHIPPING_THRESHOLD } from './shipping';
import ProductImage from './ProductImage';
import { normalizeSearchText } from './searchText';
import WhatsAppFloat from './WhatsAppFloat';
import useDialogFocus from './useDialogFocus';
import './App.css';

const BrandCarouselThin = lazy(() => import('./BrandCarouselThin.jsx'));
const ProductoDetalle = lazy(() => import('./ProductoDetalle.jsx'));
const CheckoutForm = lazy(() => import('./CheckoutForm.jsx'));
const CartDrawer = lazy(() => import('./CartDrawer.jsx'));
const BannerMarina = lazy(() => import('./BannerMarina.jsx'));
const AdminDashboard = lazy(() => import('./admin/AdminDashboard.jsx'));

const normalizeProductCategory = (category) => {
  const normalized = String(category || '').trim().toLowerCase();
  if (normalized === 'sales' || normalized === 'sales saborizadas') return 'Sales';
  if (normalized === 'especias' || normalized === 'nuestras especias') return 'Especias';
  if (normalized === 'repostería' || normalized === 'reposteria') return 'Repostería';
  if (normalized === 'mayoristas') return 'Mayoristas';
  if (normalized === 'esenciales') return 'Esenciales';
  return String(category || '').trim();
};

const normalizePublicProduct = (productDoc) => {
  const data = productDoc.data();
  const title = String(data.nombre ?? data.title ?? '').trim();
  const price = Number(data.precio ?? data.price);
  const category = normalizeProductCategory(data.categoria ?? data.category);
  if (!title || !category || !Number.isFinite(price) || price < 0) return null;

  return {
    id: productDoc.id,
    title,
    price,
    category,
    img: data.img || data.imagen || '',
    description: data.description || data.descripcion || '',
    presentacion: data.presentacion || data.presentation || '',
    images: Array.isArray(data.images) ? data.images : [],
    imagenes: Array.isArray(data.imagenes) ? data.imagenes : [],
  };
};

const loadCart = () => {
  if (typeof window === 'undefined') return [];

  try {
    const savedCart = window.localStorage.getItem('nowin_cart');
    if (!savedCart) return [];

    const parsedCart = JSON.parse(savedCart);
    if (!Array.isArray(parsedCart)) {
      console.error('El carrito guardado no tiene un formato válido.');
      return [];
    }

    return parsedCart.filter((item) =>
      item &&
      (typeof item.id === 'string' || typeof item.id === 'number') &&
      typeof item.title === 'string' &&
      Number.isFinite(item.price) &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0
    );
  } catch (error) {
    console.error('No se pudo recuperar el carrito guardado.', error);
    return [];
  }
};



const CATEGORIAS_PRODUCTOS = [
  'Todas',
  'Sales',
  'Especias',
  'Mayoristas',
  'Esenciales',
];

const getProductFormat = (product) =>
  product.category?.toLowerCase().includes('mayorista') ||
  /1\s?(kg|kilo)/i.test(`${product.title} ${product.presentacion || ''}`)
    ? 'wholesale'
    : 'retail';

const Home = ({ productos, agregarAlCarrito, alAbrirProducto, searchTerm, catalogLoading, catalogError }) => {
  const heroImages = [ "/img/carru4.webp", "/img/carru5.webp"];
  const [currentImage, setCurrentImage] = useState(0);
  
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [formatoActivo, setFormatoActivo] = useState('all');
  const [ordenActivo, setOrdenActivo] = useState('recommended');
  const hasSearch = searchTerm.trim().length > 0;


  useEffect(() => {
    const timer = setInterval(() => setCurrentImage((prev) => (prev + 1) % heroImages.length), 4000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const filteredProducts = productos.filter((prod) => {
    if (hasSearch) {
      const searchableText = normalizeSearchText(
        `${prod.title} ${prod.category} ${prod.description || ''}`
      );
      return searchableText.includes(normalizeSearchText(searchTerm));
    }
    return categoriaActiva === 'Todas' ||
      (categoriaActiva === 'Mayoristas'
        ? getProductFormat(prod) === 'wholesale'
        : prod.category === categoriaActiva);
  }).filter((prod) => formatoActivo === 'all' || getProductFormat(prod) === formatoActivo);

  if (ordenActivo === 'price-asc') {
    filteredProducts.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (ordenActivo === 'price-desc') {
    filteredProducts.sort((a, b) => Number(b.price) - Number(a.price));
  } else if (ordenActivo === 'name-asc') {
    filteredProducts.sort((a, b) => a.title.localeCompare(b.title, 'es', { sensitivity: 'base' }));
  }

  const tarjetasCategorias = [
    { id: 'Sales', titulo: 'SALES', img: '/img/canelaportada4.webp', color: '#FFC400' },
    { id: 'Especias', titulo: 'ESPECIAS', img: '/img/especias1.webp', color: '#FFC400' },
    { id: 'Mayoristas', titulo: 'MAYORISTAS', img: '/img/canelaportada1.webp', color: '#FFC400' },
  ];




  return (
    <>
      <header className="hero">
        <div className="hero-carousel">
          {heroImages.map((img, index) => (
            <div key={index} className={`hero-slide ${index === currentImage ? "active" : ""}`} style={{ backgroundImage: `url(${img})` }}></div>
          ))}
          <div className="hero-overlay"></div>
        </div>
        <div className="container hero-content">
          <span className="hero-kicker">ESPECIAS · SALES · CONDIMENTOS</span>
          <h1>SABOR QUE <br /><span style={{color: '#FFC400'}}>TRANSFORMA</span></h1>
          <p>Sabores seleccionados con envíos a todo el país. Venta minorista y mayorista.</p>
          <a className="hero-cta" href="#catalogo">EXPLORAR CATÁLOGO <ArrowDown size={18} aria-hidden="true" /></a>
        </div>
      </header>

      
      <Suspense fallback={null}>
        <BannerMarina />
      </Suspense>

      <section className="store-assurance" aria-label="Información de Nowin">
        <div><Truck size={20} aria-hidden="true" /><span>Envíos a todo el país</span></div>
        <div><Truck size={20} aria-hidden="true" /><span>Bonificado desde <strong>${FREE_SHIPPING_THRESHOLD.toLocaleString('es-AR')}</strong></span></div>
        <div><MapPin size={20} aria-hidden="true" /><span>Base en Posadas, Misiones</span></div>
        <a
          href="https://wa.me/5493764141598?text=Hola%20NOWIN%21%20Quisiera%20consultar%20medios%20de%20pago%20y%20opciones%20mayoristas."
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Consultar medios de pago y opciones mayoristas por WhatsApp"
        >
          <MessageCircle size={20} aria-hidden="true" />
          <span>Medios de pago y mayoristas: consultanos</span>
        </a>
      </section>

      <section id="catalogo" className="container" style={{ padding: '0px 20px', minHeight: '50vh' }}>
        {catalogLoading && <div className="search-empty-state" role="status">Cargando catálogo actualizado...</div>}
        {catalogError && <p className="catalog-error" role="alert">{catalogError}</p>}
        {!catalogLoading && !catalogError && productos.length === 0 && (
          <div className="search-empty-state">
            <h3>Estamos actualizando el catálogo</h3>
            <p>Consultanos por WhatsApp para conocer la disponibilidad de productos.</p>
            <a className="btn-nowin catalog-contact-link" href="https://wa.me/5493764141598" target="_blank" rel="noopener noreferrer">
              Consultar disponibilidad
            </a>
          </div>
        )}

        {!catalogLoading && productos.length > 0 && <>
        {!hasSearch && (
          <div className="category-browser">
            <p className="category-browser-label">Explorá por categoría</p>
            <nav className="category-pills" aria-label="Filtrar productos por categoría">
              {CATEGORIAS_PRODUCTOS.map((categoria) => (
                <button
                  type="button"
                  key={categoria}
                  className={`category-pill${categoriaActiva === categoria ? ' active' : ''}`}
                  aria-pressed={categoriaActiva === categoria}
                  onClick={() => setCategoriaActiva(categoria)}
                >
                  {categoria}
                </button>
              ))}
            </nav>
          </div>
        )}

        {(hasSearch || categoriaActiva !== null) && (
          <div className="catalog-toolbar">
            <p className="catalog-count">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
            </p>
            <div className="catalog-toolbar-controls">
              <label>
                Formato
                <select value={formatoActivo} onChange={(event) => setFormatoActivo(event.target.value)}>
                  <option value="all">Todos</option>
                  <option value="retail">Minorista</option>
                  <option value="wholesale">Mayorista / 1 kg</option>
                </select>
              </label>
              <label>
                Ordenar
                <select value={ordenActivo} onChange={(event) => setOrdenActivo(event.target.value)}>
                  <option value="recommended">Recomendados</option>
                  <option value="price-asc">Precio: menor a mayor</option>
                  <option value="price-desc">Precio: mayor a menor</option>
                  <option value="name-asc">Nombre: A–Z</option>
                </select>
              </label>
            </div>
          </div>
        )}

        {hasSearch ? (
           filteredProducts.length > 0 ? (
            <div>
              <h3 className="search-results-title">
                Resultados para “{searchTerm.trim()}”
              </h3>
              <div className="product-grid">
                {filteredProducts.map(prod => <CardCondimento key={prod.id} producto={prod} alAgregar={agregarAlCarrito} alAbrir={alAbrirProducto} />)}
              </div>
            </div>
          ) : (
            <div className="search-empty-state">
              <Search size={36} aria-hidden="true" />
              <h3>No encontramos productos para “{searchTerm.trim()}”</h3>
              <p>Probá con otro nombre, ingrediente o categoría.</p>
              {formatoActivo !== 'all' && (
                <button type="button" className="catalog-reset-filter" onClick={() => setFormatoActivo('all')}>
                  Ver todos los formatos
                </button>
              )}
            </div>
          )
        ) 
        
: categoriaActiva === null ? (
  <div className="category-tiles">
    {tarjetasCategorias.map((cat, index) => (
      <button
        type="button"
        key={cat.id} 
        onClick={() => setCategoriaActiva(cat.id)}
        className="categoria-gigante animar-entrada"
        style={{ 
          backgroundImage: cat.img
            ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${cat.img})`
            : 'linear-gradient(135deg, #141414, #3d3000)',
          animationDelay: `${index * 0.1}s`
        }}
      >
        <div className="categoria-gigante-contenido">
          <h2 style={{ color: cat.color }}>{cat.titulo}</h2>
          <span className="btn-descubrir-gigante">EXPLORAR LÍNEA</span>
        </div>
      </button>
    ))}
  </div>
)



        : (
          <div>
            <div className="category-header">
              <h2>
                {categoriaActiva === 'Todas' ? 'Todos los productos' : categoriaActiva}
              </h2>
              <button 
                onClick={() => setCategoriaActiva(null)}
                className="back-to-categories"
              >
                &larr; Volver a Categorías
              </button>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="product-grid">
                {filteredProducts.map(prod => (
                  <CardCondimento key={prod.id} producto={prod} alAgregar={agregarAlCarrito} alAbrir={alAbrirProducto} />
                ))}
              </div>
            ) : (
              <div className="search-empty-state">
                <Search size={36} aria-hidden="true" />
                <h3>No hay productos con esos filtros</h3>
                <p>Probá con otro formato o restablecé el filtro.</p>
                <button type="button" className="catalog-reset-filter" onClick={() => setFormatoActivo('all')}>
                  Ver todos los formatos
                </button>
              </div>
            )}
          </div>
        )}
        </>}
      </section>
    </>
  );
};

const About = () => (
  <main className="about-hero" style={{ backgroundImage: 'url(/img/carru1.jpg)' }}>
    <div className="about-overlay">
      <div className="container about-content">
        <p className="about-kicker">NOWIN · POSADAS, MISIONES</p>
        <h1>Sabores con identidad</h1>
        <p className="about-intro">
          Acercamos especias, condimentos y sales saborizadas que celebran la cocina argentina y acompañan tanto a hogares como a comercios gastronómicos.
        </p>

        <div className="about-pillars">
          <article className="about-pillar">
            <Leaf size={24} aria-hidden="true" />
            <h2>Selección de calidad</h2>
            <p>Elegimos cada especia y mezcla cuidando su aroma, frescura y practicidad para la cocina diaria.</p>
          </article>
          <article className="about-pillar">
            <MapPin size={24} aria-hidden="true" />
            <h2>Alcance federal</h2>
            <p>Desde Posadas, Misiones, integramos sabores de distintas regiones con una mirada federal.</p>
          </article>
          <article className="about-pillar">
            <Store size={24} aria-hidden="true" />
            <h2>Soluciones gastronómicas</h2>
            <p>Abastecemos supermercados, carnicerías y comercios con opciones para el uso diario y profesional.</p>
          </article>
        </div>

        <p className="about-highlight">NOWIN es sabor, identidad y compromiso con lo nuestro.</p>
      </div>
    </div>
  </main>
);

const Cart = ({ cart, removeFromCart, addToCart, decreaseQuantity, onStartCheckout }) => {
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  return (
    <div className="container" style={{minHeight: '60vh', padding: '40px 20px'}}>
      <h2 className="cart-title">TU PEDIDO</h2>
      {cart.length === 0 ? (
        <div className="cart-empty">
          <ShoppingBag size={36} aria-hidden="true" />
          <p>Tu carrito está vacío.</p>
          <Link to="/" className="btn-nowin cart-empty-link">Explorar productos</Link>
        </div>
      ) : (
        <div style={{marginTop: '30px'}}>
          {cart.map(item => (
            <div key={item.id} className="cart-item">
              <div style={{display:'flex', alignItems:'center', gap: '15px'}}>
                <ProductImage
                  src={item.img}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  style={{width: '60px', height: '60px', objectFit: 'contain', background: 'white', borderRadius: '4px', padding:'5px'}}
                />
                <div>
                   <h4 style={{margin: '0 0 5px 0', color:'white'}}>{item.title}</h4>
                   <p className="cart-item-price">${item.price.toLocaleString()}</p>
                </div>
              </div>
              <div className="cart-item-controls">
                <div style={{display:'flex', alignItems:'center', background: '#000', borderRadius: '6px', padding: '5px'}}>
                    <button aria-label={`Quitar una unidad de ${item.title}`} onClick={() => decreaseQuantity(item.id)} style={{background:'transparent', border:'none', color:'white', cursor:'pointer'}}><Minus size={16} /></button>
                    <span style={{color:'white', fontWeight:'bold', minWidth:'25px', textAlign:'center'}}>{item.quantity}</span>
                    <button aria-label={`Agregar una unidad de ${item.title}`} onClick={() => addToCart(item)} style={{background:'transparent', border:'none', color:'white', cursor:'pointer'}}><Plus size={16} /></button>
                </div>
                <button aria-label={`Eliminar ${item.title} del carrito`} onClick={() => removeFromCart(item.id)} style={{background:'none', border:'none', color:'#d32f2f', cursor:'pointer'}}><Trash2 size={22} /></button>
              </div>
            </div>
          ))}
          <div className="cart-page-summary">
            <p>El subtotal corresponde solo a productos. El envío se coordina por WhatsApp y está bonificado desde ${FREE_SHIPPING_THRESHOLD.toLocaleString('es-AR')}.</p>
            <h3 className="cart-total">Subtotal de productos: ${total.toLocaleString('es-AR')}</h3>
            <button type="button" onClick={onStartCheckout} className="btn-nowin" style={{maxWidth: '300px', marginLeft: 'auto', fontSize:'1.1rem'}}>FINALIZAR COMPRA</button>
          </div>
        </div>
      )}
    </div>
  );
};


const Footer = () => (
  <footer className="footer-moderno">
    
    <h3 className="footer-titulo">CONTACTO</h3>
    
    <div className="social-icons">
     <a 
  href="https://www.instagram.com/nowin_especias?igsh=MWFxcTVxdmJ4ZWMyOA==" 
  target="_blank" 
  rel="noopener noreferrer" 
  className="social-link"
>
  <Instagram size={28} />
</a>
     
      <a href="https://wa.me/5493764141598" target="_blank" rel="noopener noreferrer" className="social-link whatsapp">
        {/* Tu SVG original intacto */}
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="#25D366">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471.148-.67.396-.197.247-.742.967-.919 1.165-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>
    </div>

    <div className="footer-layout">
      <div className="footer-brand">
        <Link to="/" aria-label="NOWIN, inicio">
          <img src="/img/logo2.png" alt="NOWIN" loading="lazy" decoding="async" />
        </Link>
        <p>Especias, condimentos y sales saborizadas con identidad.</p>
      </div>

      <nav className="footer-column" aria-label="Enlaces rápidos">
        <h2>Explorá</h2>
        <Link to="/">Inicio y catálogo</Link>
        <Link to="/about">Sobre Nowin</Link>
        <Link to="/cart">Mi carrito</Link>
        <button
          type="button"
          className="footer-admin-link"
          onClick={() => {
            const adminWindow = window.open(
              '/admin',
              'NowinAdminWindow',
              'width=1366,height=820,resizable=yes,scrollbars=yes'
            );
            if (adminWindow) adminWindow.opener = null;
          }}
        >
          Admin
        </button>
      </nav>

      <div className="footer-column">
        <h2>Contacto</h2>
        <p><MapPin size={17} aria-hidden="true" /> Posadas, Misiones</p>
        <a href="https://wa.me/5493764141598" target="_blank" rel="noopener noreferrer">
          <MessageCircle size={17} aria-hidden="true" /> WhatsApp
        </a>
      </div>

      <div className="footer-column">
        <h2>Redes</h2>
        <a
          href="https://www.instagram.com/nowin_especias?igsh=MWFxcTVxdmJ4ZWMyOA=="
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Seguir a NOWIN en Instagram"
        >
          <Instagram size={19} aria-hidden="true" /> Instagram
        </a>
      </div>
    </div>

    <hr className="footer-linea-divisoria" />
    <p className="footer-copyright">© {new Date().getFullYear()} NOWIN. Todos los derechos reservados.</p>

   
    
  </footer>
);

const ProductModal = ({ productoId, productos, alAgregar, onClose }) => {
  const dialogRef = useRef(null);
  useDialogFocus(true, dialogRef, onClose, true);

  return (
    <div className="product-modal-overlay" onClick={(event) => {
      event.stopPropagation();
      onClose();
    }}>
      <div
        ref={dialogRef}
        className="product-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Detalle del producto"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="product-modal-header">
          <button type="button" className="product-modal-close" onClick={(event) => {
            event.stopPropagation();
            onClose();
          }} aria-label="Cerrar detalle del producto" data-dialog-autofocus>
            <X size={22} aria-hidden="true" />
          </button>
        </div>
        <Suspense fallback={<div className="product-modal-body" role="status">Cargando producto...</div>}>
          <ProductoDetalle productos={productos} alAgregar={alAgregar} productoId={productoId} modal />
        </Suspense>
      </div>
    </div>
  );
};


function App() {
  const [cart, setCart] = useState(loadCart);
  const [productos, setProductos] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [searchTerm, setSearchTerm] = useState("");
  const [mostrarCheckout, setMostrarCheckout] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [productoAbierto, setProductoAbierto] = useState(null);

  useEffect(() => {
    try {
      window.localStorage.setItem('nowin_cart', JSON.stringify(cart));
    } catch (error) {
      console.error('No se pudo guardar el carrito en este dispositivo.', error);
    }
  }, [cart]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeoutId = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    let active = true;
    let unsubscribe;

    const subscribeProducts = async () => {
      try {
        const { db, collection, onSnapshot, query, where } = await import('./firestoreClient');
        if (!active) return;
        const activeProducts = query(collection(db, 'productos'), where('activo', '==', true));
        unsubscribe = onSnapshot(activeProducts, (snapshot) => {
          if (!active) return;
          let invalidCount = 0;
          const nextProducts = snapshot.docs.map((productDoc) => {
            const product = normalizePublicProduct(productDoc);
            if (!product) invalidCount += 1;
            return product;
          }).filter(Boolean);

          setProductos(nextProducts);
          setCatalogError(invalidCount
            ? `${invalidCount} producto(s) activo(s) tienen nombre, categoría o precio inválido y no se muestran.`
            : '');
          setCatalogLoading(false);
        }, (error) => {
          console.error('No se pudo sincronizar el catálogo de Firestore.', error);
          setCatalogError('No pudimos actualizar el catálogo. Intentá nuevamente más tarde.');
          setCatalogLoading(false);
        });
      } catch (error) {
        console.error('No se pudo iniciar la suscripción al catálogo de Firestore.', error);
        if (active) {
          setCatalogError('No pudimos conectar con el catálogo. Intentá nuevamente más tarde.');
          setCatalogLoading(false);
        }
      }
    };

    subscribeProducts();
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  const addToCart = (prod, quantity = 1) => {
    const cantidad = Number.isInteger(quantity) && quantity > 0 ? quantity : 1;
    setCart(prev => {
      const existe = prev.find(item => item.id === prod.id);
      return existe
        ? prev.map(item => item.id === prod.id ? {...item, quantity: item.quantity + cantidad} : item)
        : [...prev, {...prod, quantity: cantidad}];
    });
    setToast((current) => ({
      id: (current?.id ?? 0) + 1,
      message: `${prod.title}${cantidad > 1 ? ` × ${cantidad}` : ''} agregado al carrito`,
    }));
  };

  const decreaseQuantity = (id) => setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item));
  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));
  const startCheckout = () => {
    setCartDrawerOpen(false);
    setMostrarCheckout(true);
  };

  const procesarCompra = async (datosUsuario) => {
    const { createPendingWebOrder } = await import('./admin/adminData');
    const order = await createPendingWebOrder({ customer: datosUsuario, cart });
    const itemsMessage = order.items.map((item) =>
      `▫️ ${item.nombreProducto} x ${item.cantidad}`
    ).join('\n');
    const mensaje = `Hola Nowin! 🙋 Pedido web pendiente de confirmación #${order.id}:\n\n${itemsMessage}\n\n💰 Subtotal: $${order.totalVendido.toLocaleString('es-AR')}\nCliente: ${datosUsuario.nombre}`;

    window.open(`https://wa.me/5493764141598?text=${encodeURIComponent(mensaje)}`, '_blank');
    setCart([]);
    setMostrarCheckout(false);
  };
  
  return (
    <Router>
      <div className="app-container">
        <PublicOnly>
          <Navbar
            cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
            products={productos}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onCartClick={() => setCartDrawerOpen(true)}
          />
        </PublicOnly>
        <Suspense fallback={<div className="container" role="status" style={{ padding: '80px 20px', textAlign: 'center' }}>Cargando...</div>}>
          <Routes>
            <Route path="/" element={<Home productos={productos} agregarAlCarrito={addToCart} alAbrirProducto={setProductoAbierto} searchTerm={searchTerm} catalogLoading={catalogLoading} catalogError={catalogError} />} />
            <Route path="/cart" element={<Cart cart={cart} removeFromCart={removeFromCart} addToCart={addToCart} decreaseQuantity={decreaseQuantity} onStartCheckout={startCheckout} />} />
            <Route path="/about" element={<About />} />
            <Route path="/producto/:id" element={<ProductoDetalle productos={productos} alAgregar={addToCart} alAbrir={setProductoAbierto} />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </Suspense>
        <PublicOnly>{productoAbierto !== null && (
          <ProductModal productoId={productoAbierto} productos={productos} alAgregar={addToCart} onClose={() => setProductoAbierto(null)} />
        )}</PublicOnly>
        <PublicOnly>{cartDrawerOpen && (
          <Suspense fallback={null}>
            <CartDrawer
              cart={cart}
              onClose={() => setCartDrawerOpen(false)}
              addToCart={addToCart}
              decreaseQuantity={decreaseQuantity}
              removeFromCart={removeFromCart}
              onStartCheckout={startCheckout}
            />
          </Suspense>
        )}</PublicOnly>
        <PublicOnly>{mostrarCheckout && (
          <Suspense fallback={null}>
            <CheckoutForm cart={cart} enviarPedido={procesarCompra} cancelar={() => setMostrarCheckout(false)} />
          </Suspense>
        )}</PublicOnly>
        <PublicOnly>
          {toast && <div className="cart-toast" role="status" aria-live="polite" key={toast.id}>{toast.message}</div>}
          <Suspense fallback={null}>
            <BrandCarouselThin />
            <WhatsAppFloat />
          </Suspense>
          <Footer />
        </PublicOnly>
      </div>
    </Router>
  );
}

const PublicOnly = ({ children }) => {
  const { pathname } = useLocation();
  return pathname === '/admin' ? null : children;
};

export default App;






