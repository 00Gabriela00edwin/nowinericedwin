import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { db } from './firebase'; 
import { collection, getDocs, addDoc } from 'firebase/firestore'; 
import { Search, Plus, Minus, Trash2, ShoppingBag, Instagram, Facebook } from 'lucide-react';

import Navbar from './Navbar'; 
import CheckoutForm from './CheckoutForm'; 
import CardCondimento from './CardCondimento'; 

import './App.css';

const PRODUCTOS_DEMO = [
  { id: 1, title: "Sal con Ajo", price: 3500, category: "Saborizados", img: "/img/salconajo.png" },
  { id: 2, title: "Pimienta Molida", price: 4200, category: "Esenciales", img: "/img/pimienta.png" },
  { id: 3, title: "Condimento Arroz", price: 3100, category: "Mezclas", img: "/img/condimento dearroz.png" },
  { id: 4, title: "Sal de Campo", price: 3800, category: "Especiales", img: "/img/saldecampo.png" },
  { id: 5, title: "Orégano", price: 2500, category: "Hierbas", img: "/img/oregano.png" },
  { id: 6, title: "Sal Ahumada", price: 4500, category: "Gourmet", img: "/img/salaumada.png" },
  { id: 7, title: "Sal Cebolla y Ajo", price: 3600, category: "Saborizados", img: "/img/salcebollayajo.png" }
];

const Home = ({ productos, agregarAlCarrito, searchTerm }) => {
  const heroImages = ["/img/carru1.jpg", "/img/carru2.jpg", "/img/carru3.jpg", "/img/carru4.jpg", "/img/carru5.jpg", "/img/carru6.jpg"];
  const [currentImage, setCurrentImage] = React.useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentImage((prev) => (prev + 1) % heroImages.length), 4000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const filteredProducts = productos.filter(prod => 
    prod.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prod.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <header className="hero">
        <div className="hero-carousel">
          {heroImages.map((img, index) => (
            <div key={index} className={`hero-slide ${index === currentImage ? "active" : ""}`} style={{ backgroundImage: `url(${img})` }} />
          ))}
          <div className="hero-overlay"></div>
        </div>
        <div className="container hero-content">
          <h1>SABOR QUE <br /><span style={{color: '#FFC400'}}>TRANSFORMA</span></h1>
          <p>Esa pizca de sabor que tu cocina necesita.</p>
        </div>
      </header>
      
      <section className="container">
        {filteredProducts.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '20px',
            padding: '20px 0',
            width: '100%'
          }}>
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

const About = () => (
  <div className="about-hero" style={{ backgroundImage: 'url(/img/carru1.jpg)' }}>
    <div className="about-overlay">
      <div className="container about-content">
        <h1>Tradición Familiar</h1>
        <div className="about-text-body">
          <p>
            Detrás de <strong>Nowin</strong> hay una familia y una obsesión: el sabor auténtico. 
            Lo que nos hace diferentes es nuestro proceso. Mantenemos un espíritu puramente 
            <strong>artesanal</strong>, cuidando cada ingrediente como si fuera para nuestra propia mesa.
          </p>
          <p>
            Nuestra receta es única, un secreto familiar que hemos guardado y perfeccionado con el tiempo. 
            No fabricamos simples condimentos, creamos experiencias caseras para que tú puedas cocinar 
            platos increíbles sin complicaciones. 
          </p>
          <p className="highlight-text">
            Llevamos la esencia de lo artesanal directo a tu cocina.
          </p>
        </div>
      </div>
    </div>
  </div>
);

const Cart = ({ cart, removeFromCart, addToCart, decreaseQuantity, onStartCheckout }) => {
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  return (
    <div className="container" style={{minHeight: '60vh', padding: '40px 20px'}}>
      <h2 className="cart-title">TU PEDIDO</h2>
      {cart.length === 0 ? (
        <p style={{color:'#ccc'}}>Tu carrito está vacío.</p>
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
                <div style={{display:'flex', alignItems:'center', background: '#000', borderRadius: '6px', padding: '5px'}}>
                    <button onClick={() => decreaseQuantity(item.id)} style={{background:'transparent', border:'none', color:'white', cursor:'pointer'}}><Minus size={16} /></button>
                    <span style={{color:'white', fontWeight:'bold', minWidth:'25px', textAlign:'center'}}>{item.quantity}</span>
                    <button onClick={() => addToCart(item)} style={{background:'transparent', border:'none', color:'white', cursor:'pointer'}}><Plus size={16} /></button>
                </div>
                <button onClick={() => removeFromCart(item.id)} style={{background:'none', border:'none', color:'#d32f2f', cursor:'pointer'}}><Trash2 size={22} /></button>
              </div>
            </div>
          ))}
          <div style={{marginTop: '40px', textAlign: 'right', borderTop:'1px solid #333', paddingTop:'20px'}}>
            <h3 className="cart-total">${total.toLocaleString()}</h3>
            <button onClick={onStartCheckout} className="btn-nowin" style={{maxWidth: '300px', marginLeft: 'auto', fontSize:'1.1rem'}}>FINALIZAR COMPRA</button>
          </div>
        </div>
      )}
    </div>
  );
};

const Footer = () => (
  <footer className="footer">
    <h3 style={{ color: '#ffffff', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1rem', marginTop: '30px', marginBottom: '15px', fontWeight: 'bold' }}>CONTACTO</h3>
    <div className="social-icons">
      <a href="https://instagram.com" className="social-link"><Instagram size={24} /></a>
      <a href="https://facebook.com" className="social-link"><Facebook size={24} /></a>
      <a href="https://wa.me/5493764141598" target="_blank" rel="noopener noreferrer" className="social-link whatsapp">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="#25D366">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471.148-.67.396-.197.247-.742.967-.919 1.165-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>
    </div>
    <div style={{marginTop: '30px', borderTop: '1px solid #333', paddingTop: '20px'}}>
       <p style={{fontSize: '0.9rem', opacity: 0.7}}>© {new Date().getFullYear()} Nowin Argentina.</p>
    </div>
  </footer>
);

function App() {
  const [cart, setCart] = useState([]);
  const [productos, setProductos] = useState(PRODUCTOS_DEMO);
  const [searchTerm, setSearchTerm] = useState("");
  const [mostrarCheckout, setMostrarCheckout] = useState(false);

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

  const decreaseQuantity = (id) => setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item));
  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));

  const procesarCompra = async (datosUsuario) => {
    const totalPrecio = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    try {
      await addDoc(collection(db, "ordenes"), { comprador: datosUsuario, items: cart, total: totalPrecio, fecha: new Date() });
    } catch (e) { console.error("Error", e); }

    let mensaje = `Hola Nowin! 👋 Pedido:\n\n`;
    cart.forEach(item => { mensaje += `▪️ ${item.title} x ${item.quantity}\n`; });
    mensaje += `\n💰 Total: $${totalPrecio.toLocaleString()}\nCliente: ${datosUsuario.nombre}`;
    window.open(`https://wa.me/5493764141598?text=${encodeURIComponent(mensaje)}`, '_blank');
    setCart([]); setMostrarCheckout(false);
  };

  return (
    <Router>
      <div className="app-container">
        <Navbar cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <Routes>
          <Route path="/" element={<Home productos={productos} agregarAlCarrito={addToCart} searchTerm={searchTerm} />} />
          <Route path="/cart" element={<Cart cart={cart} removeFromCart={removeFromCart} addToCart={addToCart} decreaseQuantity={decreaseQuantity} onStartCheckout={() => setMostrarCheckout(true)} />} />
          <Route path="/about" element={<About />} />
        </Routes>
        {mostrarCheckout && <CheckoutForm enviarPedido={procesarCompra} cancelar={() => setMostrarCheckout(false)} />}
        <Footer />
      </div>
    </Router>
  );
}

export default App;