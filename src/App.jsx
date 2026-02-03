import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
// Importamos los nuevos iconos: Search y Phone (para WhatsApp)
import { ShoppingBag, Instagram, Facebook, Trash2, Search, Phone, Menu } from 'lucide-react';
import './App.css';
import CardCondimento from './CardCondimento';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

// --- TUS DATOS (Ya corregidos con las fotos) ---
const PRODUCTOS_DEMO = [
  { id: 1, title: "Sal con Ajo", price: 3500, category: "Saborizados", img: "/img/salconajo.jpg", colorEtiqueta: "#FFD700" },
  { id: 2, title: "Pimienta Molida", price: 4200, category: "Esenciales", img: "/img/pimienta.jpg", colorEtiqueta: "#F5F5F5" },
  { id: 3, title: "Condimento Arroz", price: 3100, category: "Mezclas", img: "/img/condimentodearroz.jpg", colorEtiqueta: "#FF9800" },
  { id: 4, title: "Sal de Campo", price: 3800, category: "Especiales", img: "/img/saldecampo.jpg", colorEtiqueta: "#9E9E9E" },
  { id: 5, title: "Orégano", price: 2500, category: "Hierbas", img: "/img/oregano.jpg", colorEtiqueta: "#4CAF50" },
  { id: 6, title: "Sal Ahumada", price: 4500, category: "Gourmet", img: "/img/salaumada.jpg", colorEtiqueta: "#3E2723" },
  { id: 7, title: "Sal Cebolla y Ajo", price: 3600, category: "Saborizados", img: "/img/salcebollayajo.jpg", colorEtiqueta: "#FFB74D" }
];

// --- NAVBAR ACTUALIZADO (Buscador + Enlaces) ---
const Navbar = ({ cartCount, searchTerm, setSearchTerm }) => (
  <nav className="navbar">
    <div className="nav-content">
      {/* --- AQUÍ ESTÁ EL CAMBIO: LOGO IMAGEN --- */}
      <Link to="/" className="logo-container">
        {/* Asegúrate de que el nombre del archivo sea correcto en tu carpeta public/img */}
        <img src="/img/logo2.png" alt="Nowin" className="nav-logo-img" />
      </Link>
      {/* Barra de Búsqueda Central */}
      <div className="search-bar-container">
        <Search className="search-icon-inside" size={18} />
        <input 
          type="text" 
          placeholder="Buscar condimentos..." 
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Enlaces y Carrito a la derecha */}
      <div className="nav-links">
        <Link to="/about" className="nav-link-text">Sobre Nosotros</Link>
        
        <Link to="/cart" className="cart-icon-container">
          <ShoppingBag size={28} />
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </Link>
      </div>
    </div>
  </nav>
);

const Footer = () => (
  <footer className="footer">
    {/* SECCIÓN DEL LOGO */}
    
    
    {/* SECCIÓN TÍTULO CONTACTO (Corregido) */}
    <h3 style={{
        color: '#ffffff',           /* Blanco */
        textTransform: 'uppercase', /* Transforma a mayúsculas automáticamente */
        letterSpacing: '2px',       /* Espaciado elegante */
        fontSize: '1rem',           
        marginTop: '30px',
        marginBottom: '15px',
        fontStyle: 'normal',        /* Sin cursiva (letra recta) */
        fontWeight: 'bold'
    }}>
        CONTACTO
    </h3>
    
    {/* REDES SOCIALES */}
    <div className="social-icons">
      <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
        <Instagram size={24} />
      </a>
      <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
        <Facebook size={24} />
      </a>
{/* Reemplaza la línea <Phone ... /> por esto: */}

<a href="https://wa.me/5493764141598" target="_blank" rel="noopener noreferrer" className="social-link whatsapp">
  {/* LOGO OFICIAL DE WHATSAPP (SVG) */}
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="28" 
    height="28" 
    viewBox="0 0 24 24" 
    fill="#25D366" /* Color verde oficial */
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471.148-.67.396-.197.247-.742.967-.919 1.165-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
</a>

  
    </div>

    {/* COPYRIGHT */}
    <div style={{marginTop: '30px', borderTop: '1px solid #333', paddingTop: '20px'}}>
       <p style={{fontSize: '0.9rem', opacity: 0.7}}>
         © {new Date().getFullYear()} Nowin Argentina. Todos los derechos reservados.
       </p>
    </div>
  </footer>
);

// --- Busca el componente Home y reemplázalo por esto ---

const Home = ({ productos, agregarAlCarrito, searchTerm }) => {
  // 1. Configuración de las imágenes del carrusel
  const heroImages = [
    "/img/carru1.jpg",  // Foto 1
    "/img/carru2.jpg",   // Foto 2 (Cámbialas por fotos horizontales lindas)
    "/img/carru3.jpg",     // Foto 3
     "/img/carru4.jpg",  // Foto 1
    "/img/carru5.jpg",   // Foto 2 (Cámbialas por fotos horizontales lindas)
    "/img/carru6.jpg"     // Foto 3

  ];

  // 2. Estado para saber cuál foto mostrar
  const [currentImage, setCurrentImage] = React.useState(0);

  // 3. Efecto para cambiar la foto cada 3 segundos
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 4000); // Cambia cada 4000 milisegundos (4 segundos)
    return () => clearInterval(timer);
  }, [heroImages.length]);

  // Lógica de filtrado (se mantiene igual)
  const filteredProducts = productos.filter(prod => 
    prod.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prod.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <header className="hero">
        {/* --- INICIO DEL CARRUSEL DE FONDO --- */}
        <div className="hero-carousel">
          {heroImages.map((img, index) => (
            <div
              key={index}
              className={`hero-slide ${index === currentImage ? "active" : ""}`}
              style={{ backgroundImage: `url(${img})` }}
            />
          ))}
          {/* Capa oscura para que se lea el texto encima de las fotos */}
          <div className="hero-overlay"></div>
        </div>
        {/* --- FIN DEL CARRUSEL --- */}

        <div className="container hero-content">
          <h1>SABOR QUE <br /><span style={{color: '#FFC400'}}>TRANSFORMA</span></h1>
          <p>Esa pizca de sabor que tu cocina necesita.</p>
        </div>
      </header>
      
      <section className="container">
        {filteredProducts.length > 0 ? (
          <div className="grid-condimentos">
            {filteredProducts.map(prod => (
              <CardCondimento key={prod.id} producto={prod} alAgregar={agregarAlCarrito} />
            ))}
          </div>
        ) : (
          <div style={{textAlign: 'center', padding: '50px', color: '#888'}}>
            <Search size={40} style={{marginBottom:'20px', opacity: 0.5}}/>
            <h3>No encontramos condimentos para "{searchTerm}"</h3>
          </div>
        )}
      </section>
    </>
  );
};














// --- PÁGINA SOBRE NOSOTROS (Nueva) ---
const About = () => (
  <div className="container" style={{paddingTop: '60px', minHeight: '50vh', textAlign: 'center'}}>
    <h1 style={{fontSize: '3rem', color: '#FFC400'}}>SOBRE NOWIN</h1>
    <div style={{maxWidth: '700px', margin: '30px auto', lineHeight: '1.8', color: '#0a0909'}}>
      <p>En Nowin creemos que la cocina no necesita ser complicada para ser deliciosa. Somos apasionados por encontrar esa "pizca" exacta que transforma un plato de todos los días en una experiencia memorable.</p>
      <p>Nuestros condimentos son seleccionados cuidadosamente, respetando la calidad y el origen, para llevar a tu mesa el auténtico sabor argentino con un toque gourmet.</p>
      <br />
     
    </div>
  </div>
);
// Componente Cart (MODIFICADO PARA TIPOGRAFÍA)
const Cart = ({ cart, removeFromCart }) => {
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  return (
    <div className="container" style={{minHeight: '60vh', padding: '40px 20px'}}>
      
      {/* CAMBIO 1: Aquí aplicamos la clase para la letra grande */}
      <h2 className="cart-title">TU PEDIDO</h2>
      
      {cart.length === 0 ? (
        <p style={{color:'#ccc'}}>Tu carrito está vacío. <Link to="/" style={{color: '#FFC400', textDecoration:'none', fontWeight:'bold'}}>Ver productos</Link></p>
      ) : (
        <div style={{marginTop: '30px'}}>
          {cart.map(item => (
            <div key={item.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#161616', padding: '15px', marginBottom: '10px', borderRadius: '8px', border:'1px solid #333'}}>
              <div style={{display:'flex', alignItems:'center', gap: '15px'}}>
                <img src={item.img} alt="" style={{width: '60px', height: '60px', objectFit: 'contain', background: 'white', borderRadius: '4px', padding:'5px'}} />
                <div>
                  <h4 style={{margin: '0 0 5px 0', color:'white'}}>{item.title}</h4>
                  <p style={{margin: 0, color: '#FFC400'}}>${item.price}</p>
                </div>
              </div>
              <div style={{display:'flex', alignItems:'center', gap: '20px'}}>
                <div style={{background: '#000', padding: '8px 12px', borderRadius: '6px', color:'white', fontWeight:'bold'}}>x{item.quantity}</div>
                <button onClick={() => removeFromCart(item.id)} style={{background:'none', border:'none', color:'#d32f2f', cursor:'pointer', padding:'5px'}}><Trash2 size={22} /></button>
              </div>
            </div>
          ))}
          
          <div style={{marginTop: '40px', textAlign: 'right', borderTop:'1px solid #333', paddingTop:'20px'}}>
            
            {/* CAMBIO 2: Aquí aplicamos la clase para el precio gigante */}
            <h3 className="cart-total">${total.toLocaleString()}</h3>
            
            <button className="btn-nowin" style={{maxWidth: '300px', marginLeft: 'auto', fontSize:'1.1rem'}}>FINALIZAR COMPRA</button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- APP PRINCIPAL ---
function App() {
  const [cart, setCart] = useState([]);
  const [productos, setProductos] = useState(PRODUCTOS_DEMO);
  const [searchTerm, setSearchTerm] = useState(""); // Nuevo estado para la búsqueda

  // Carga de Firebase (opcional, si falla usa los DEMO)
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "condimentos"));
        if (!querySnapshot.empty) {
          const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setProductos(docs);
        }
      } catch (error) { console.log("Usando datos locales"); }
    };
    fetchProductos();
  }, []);

  const addToCart = (prod) => {
    setCart(prev => {
      const existe = prev.find(item => item.id === prod.id);
      return existe ? prev.map(item => item.id === prod.id ? {...item, quantity: item.quantity + 1} : item) : [...prev, {...prod, quantity: 1}];
    });
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));

  return (
    <div className="app-container">
      {/* Pasamos el estado de búsqueda y la función para actualizarlo al Navbar */}
      <Navbar 
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)} 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      
      <Routes>
        {/* Pasamos el término de búsqueda al Home para que filtre */}
        <Route path="/" element={<Home productos={productos} agregarAlCarrito={addToCart} searchTerm={searchTerm} />} />
        <Route path="/cart" element={<Cart cart={cart} removeFromCart={removeFromCart} />} />
        {/* Nueva ruta */}
        <Route path="/about" element={<About />} />
      </Routes>
      
      <Footer />
      
    </div>
  );
}



export default App;
