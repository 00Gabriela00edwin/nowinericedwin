import React, { useState, useEffect } from 'react';
import BrandCarouselThin from './BrandCarouselThin.jsx';
import ProductoDetalle from './ProductoDetalle';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { db } from './firebase'; 
import { collection, getDocs, addDoc } from 'firebase/firestore'; 
import { Search, Plus, Minus, Trash2, ShoppingBag, Instagram, Facebook } from 'lucide-react';
import Navbar from './Navbar'; 
import CheckoutForm from './CheckoutForm'; 
import CardCondimento from './CardCondimento'; 
import './App.css';
import MundialCountdown from './MundialCountdown';



export const PRODUCTOS_DEMO = [
  // --- CATEGORÍA: SALES SABORIZADAS & ESENCIALES ---
  { 
    id: 1, 
    title: "Sal con Ajo", 
    price: 3500, 
    category: "Sales Saborizadas", 
    img: "/img/salconajo.png", 
    description: "Es el resultado de mezclar de ajo seco molido y sal de mesa Es el sustituto del ajo fresco en el caso de la sal de ajo Nowin es el aderezo final en carnes pescados y mariscos a plancha o incluso utilizarlo en seco de la misma manera que utilizaríamos la sal Usos sugeridos : Carnes, Pescados ,Mariscos a la plancha Como reemplazo del ajo fresco Uso en seco como sal común." 
  },
  { 
    id: 2, 
    title: "Pimienta Molida", 
    price: 4200, 
    category: "Esenciales", 
    img: "/img/pimientamolida.png", 
    description: "Disponible molida o en grano.Aroma penetrante.Picor equilibrado.Tamaño homogéneo (en grano).Diferencial NOWIN:Selección de calidad que asegura potencia constante en cada uso." 
  },
  { 
    id: 3, 
    title: "Condimento Arroz", 
    price: 3100, 
    category: "Esenciales", 
    img: "/img/condimentoarroz.png", 
    description: "Mezcla equilibrada de especias.Color atractivo y natural.Aroma suave y armonioso.Distribución homogénea de ingredientes.Diferencial NOWIN:Fórmula pensada para transformar un arroz común en una preparación especial con solo una pizca." 
  },
  { 
    id: 4, 
    title: "Sal de Campo", 
    price: 3800, 
    category: "Sales Saborizadas", 
    img: "/img/saldecampo.png", 
    description: "Mezcla artesanal de sal entrefina con especias seleccionadas, inspirada en la tradición del campo argentino Ingredientes destacados:Ají molido,Orégano,Comino,Sal entrefina" 
  },
  { 
    id: 5, 
    title: "Orégano", 
    price: 2500, 
    category: "Esenciales", 
    img: "/img/oregano.png", 
    description: "Hojas secas seleccionadas.Corte uniforme y baja presencia de tallos.Aroma herbal intenso.Color verde natural (indicador de frescura).Diferencial NOWIN:Mayor potencia aromática y mejor rendimiento por uso Selección cuidada para garantizar sabor auténtico en cada plato" 
  },
  { 
    id: 6, 
    title: "Sal Ahumada", 
    price: 4500, 
    category: "Sales Saborizadas", 
    img: "/img/salahumada.png", 
    description: "Sabor ahumado sin fuego Permite lograr efecto “a la parrilla” sin necesidad de brasas ni humo real.Aroma natural de madera quemada Los aromas se elaboran a partir de madera quemada, logrando un perfil auténtico Lista para usar Ideal para dar toque final a:Hamburguesas (sabor como hechas a las brasas) Carnes Salmón marinado Verduras grilladas Mezcla especiada equilibrada,No es solo sal ahumada: incluye hierbas que potencian el sabor." 
  },
  { 
    id: 7, 
    title: "Sal Cebolla y Ajo", 
    price: 3600, 
    category: "Sales Saborizadas", 
    img: "/img/salcebollayajo.png", 
    description: "Descubrí el sabor que no puede faltar en la cocina argentina. Nuestra Sal Especiada Cebolla y Ajo Argentinisima combina sal de calidad con cebolla y ajo deshidratados, logrando el equilibrio perfecto entre intensidad y aroma Ideal para realzar carnes, milanesas, papas al horno, verduras grilladas, pollo, pastas y, por supuesto, el infaltable asado. Una pizca es suficiente para transformar cualquier plato en una experiencia llena de sabor casero y tradición." 
  },
  { 
    id: 8, 
    title: "Sal Picante", 
    price: 4500, 
    category: "Sales Saborizadas", 
    img: "/img/salpicante.png", 
    description: "DiferencialPicor suave y equilibradoPotencia el sabor sin taparlo Versátil: combina con casi cualquier comida Acompañamiento que no puede faltar “El toque picante ideal para pastas, pescados y mariscos" 
  },
  { 
    id: 9, 
    title: "Sal con Romero y Tomillo", 
    price: 3600, 
    category: "Sales Saborizadas", 
    img: "/img/salconromeroytomillo.png", 
    description: "Mezcla de sal con hierbas aromáticas seleccionadas, que aporta un sabor intenso y equilibrado, inspirado en aromas mediterráneos Hierbas destacadas Romero Tomillo" 
  },
  { 
    id: 10, 
    title: "Polvo para hornear", 
    price: 4200, 
    category: "Esenciales", 
    img: "/img/polvoparahornear.png", 
    description: "xxxxxxxxxxxxxxxxxxxxxxxxx." 
  },
  { 
    id: 11, 
    title: "Pimentón", 
    price: 4200, 
    category: "Esenciales", 
    img: "/img/pimenton.png", 
    description: "xxxxxxxxxxxxxxxxxxxxxxxxx." 
  },
  { 
    id: 12, 
    title: "Perejil", 
    price: 4200, 
    category: "Esenciales", 
    img: "/img/perejil.png", 
    description: "xxxxxxxxxxxxxxxxxxxxxxxxx." 
  },
  { 
    id: 13, 
    title: "Mix de Especias", 
    price: 4200, 
    category: "Esenciales", 
    img: "/img/mixdeespecias.png", 
    description: "xxxxxxxxxxxxxxxxxxxxxxxxx." 
  },
  { 
    id: 14, 
    title: "Adobo para Pizzas", 
    price: 4200, 
    category: "Esenciales", 
    img: "/img/adoboparapizzas.png", 
    description: "xxxxxxxxxxxxxxxxxxxxxxxxx." 
  },
  { 
    id: 15, 
    title: "Ajo granulado", 
    price: 4200, 
    category: "Esenciales", 
    img: "/img/ajogranulado.png", 
    description: "xxxxxxxxxxxxxxxxxxxxxxxxx." 
  },
  { 
    id: 16, 
    title: "Sal Mundial", 
    price: 3600, 
    category: "Sales Saborizadas", 
    img: "/img/salmundial.png", 
    description: "Mezcla de sal con hierbas aromáticas seleccionadas, que aporta un sabor intenso y equilibrado, inspirado en aromas mediterráneos Hierbas destacadas Romero Tomillo" 
  },
  { 
    id: 17, 
    title: "Canela", 
    price: 4200, 
    category: "Esenciales", 
    img: "/img/canela.png", 
    description: "xxxxxxxxxxxxxxxxxxxxxxxxx." 
  },
  { 
    id: 18, 
    title: "Clavo de olor", 
    price: 4200, 
    category: "Esenciales", 
    img: "/img/clavodeolor.png", 
    description: "xxxxxxxxxxxxxxxxxxxxxxxxx." 
  },
  { 
    id: 19, 
    title: "Laurel", 
    price: 4200, 
    category: "Esenciales", 
    img: "/img/laurel.png", 
    description: "xxxxxxxxxxxxxxxxxxxxxxxxx." 
  },

  // --- CATEGORÍA: NUESTRAS ESPECIAS ---
  { 
    id: 20, 
    title: "Ají Triturado", 
    price: 1500, 
    category: "Nuestras Especias", 
    img: "/img/1aji.png", 
    description: "Ají triturado de gran sabor, ideal para darle un toque picante a tus pizzas, guisos y empanadas." 
  },
  { 
    id: 21, 
    title: "Ajo Granulado", 
    price: 1800, 
    category: "Nuestras Especias", 
    img: "/img/2ajogranuladoo.png", 
    description: "Ajo deshidratado y granulado. Sabor intenso y práctico para condimentar carnes y salsas al instante." 
  },
  { 
    id: 22, 
    title: "Condimento para Arroz", 
    price: 1200, 
    category: "Nuestras Especias", 
    img: "/img/3arrozcondimento.png", 
    description: "Mezcla equilibrada para resaltar el sabor y darle el color perfecto a tus arroces y paellas." 
  },
  { 
    id: 23, 
    title: "Canela Molida", 
    price: 1900, 
    category: "Nuestras Especias", 
    img: "/img/3canela.png", 
    description: "Canela de aroma dulce y profundo. El condimento estrella para tu repostería e infusiones." 
  },
  { 
    id: 24, 
    title: "Cebolla Crispy", 
    price: 2500, 
    category: "Nuestras Especias", 
    img: "/img/4cebollacrispy.png", 
    description: "Cebolla frita crocante. Perfecta para agregar textura y sabor a hamburguesas, panchos y ensaladas." 
  },
  { 
    id: 25, 
    title: "Cebolla en Polvo", 
    price: 1600, 
    category: "Nuestras Especias", 
    img: "/img/5cebollaenpolvo.png", 
    description: "Todo el sabor de la cebolla en una textura fina, ideal para salsas, cremas y marinados." 
  },
  { 
    id: 26, 
    title: "Chimichurri", 
    price: 1400, 
    category: "Nuestras Especias", 
    img: "/img/6chimi.png", 
    description: "Blend de hierbas tradicionales para preparar el mejor aderezo de tus asados y carnes a la parrilla." 
  },
  
  { 
    id: 28, 
    title: "Coriandro Molido", 
    price: 1500, 
    category: "Nuestras Especias", 
    img: "/img/8coriandro.png", 
    description: "Semillas de cilantro molidas. Aporta notas cítricas y frescas a tus embutidos y guisos." 
  },
  { 
    id: 29, 
    title: "Cúrcuma", 
    price: 1700, 
    category: "Nuestras Especias", 
    img: "/img/9curcumamolida.png", 
    description: "Color y salud en tus platos. Ideal para arroces, vegetales asados y recetas de la cocina oriental." 
  },
  { 
    id: 30, 
    title: "Laurel en Hojas", 
    price: 1300, 
    category: "Nuestras Especias", 
    img: "/img/10laurelenhojas.png", 
    description: "Hojas de laurel secas de alta calidad. El aroma fundamental para tucos, sopas y estofados." 
  },
  { 
    id: 31, 
    title: "Orégano", 
    price: 1400, 
    category: "Nuestras Especias", 
    img: "/img/10oreganoo.png", 
    description: "Hojas seleccionadas de aroma intenso. El compañero inseparable de la pizza y las salsas rojas." 
  },
  { 
    id: 32, 
    title: "Perejil Deshidratado", 
    price: 1200, 
    category: "Nuestras Especias", 
    img: "/img/11perejil.png", 
    description: "Perejil de color vibrante y sabor fresco, listo para usar en cualquier preparación culinaria." 
  },
  { 
    id: 33, 
    title: "Perejil Selección", 
    price: 1200, 
    category: "Nuestras Especias", 
    img: "/img/12perejill.png", 
    description: "Variedad de perejil deshidratado ideal para realzar el sabor final de tus platos favoritos." 
  },
  { 
    id: 34, 
    title: "Romero", 
    price: 1600, 
    category: "Nuestras Especias", 
    img: "/img/13romero.png", 
    description: "Hierba aromática de sabor boscoso. La pareja perfecta para papas al horno, pollo y carnes rojas." 
  },
  { 
    id: 35, 
    title: "Provenzal", 
    price: 1400, 
    category: "Nuestras Especias", 
    img: "/img/14provenzal.png", 
    description: "El equilibrio exacto entre ajo y perejil. Un clásico para milanesas, papas fritas y revueltos." 
  },
  { 
    id: 36, 
    title: "Condimento para Pizza", 
    price: 1300, 
    category: "Nuestras Especias", 
    img: "/img/15pizza.png", 
    description: "Mezcla artesanal de especias diseñada para darle el auténtico sabor de pizzería a tus masas." 
  },
  { 
    id: 37, 
    title: "Pimentón Selección", 
    price: 1500, 
    category: "Nuestras Especias", 
    img: "/img/16pimentonn.png", 
    description: "Pimentón de color intenso y sabor dulce, ideal para empanadas, tucos y platos regionales." 
  },
  { 
    id: 38, 
    title: "Pimentón Ahumado", 
    price: 1800, 
    category: "Nuestras Especias", 
    img: "/img/17pimentonn.png", 
    description: "Aporta un toque ahumado sofisticado y un color profundo a guisos, carnes y salsas." 
  },
  { 
    id: 39, 
    title: "Tomillo", 
    price: 1600, 
    category: "Nuestras Especias", 
    img: "/img/18tomillo.png", 
    description: "Hierba delicada y muy aromática. Excelente para marinar aves, pescados y aromatizar aceites." 
  },

  // --- CATEGORÍA: MAYORISTAS ---
  { 
    id: 40, 
    title: "Adobo para Pizza (1 Kg)", 
    price: 8500, 
    category: "Mayoristas", 
    img: "/img/1kilo/adobodepizza.png", 
    description: "El clásico adobo pimentero ideal para pizzas y salsas, en formato económico de 1 kilo." 
  },
  { 
    id: 41, 
    title: "Ajo Granulado (1 Kg)", 
    price: 12000, 
    category: "Mayoristas", 
    img: "/img/1kilo/ajogranulado.png", 
    description: "Ajo deshidratado granulado de alta pureza. Excelente rendimiento para cocinas profesionales." 
  },
  { 
    id: 42, 
    title: "Canela (1 Kg)", 
    price: 14500, 
    category: "Mayoristas", 
    img: "/img/1kilo/canela.png", 
    description: "Canela molida de aroma intenso y dulzor natural. Ideal para repostería y cafetería." 
  },
  { 
    id: 43, 
    title: "Chimichurri (1 Kg)", 
    price: 9000, 
    category: "Mayoristas", 
    img: "/img/1kilo/chimichurri.png", 
    description: "La mezcla tradicional argentina para carnes y asados. Listo para hidratar y usar." 
  },
  { 
    id: 44, 
    title: "Coco Rallado (1 Kg)", 
    price: 11000, 
    category: "Mayoristas", 
    img: "/img/1kilo/cocorayado.png", 
    description: "Coco rallado de alta calidad, blanco y aromático. Perfecto para postres y alfajores." 
  },
  { 
    id: 45, 
    title: "Mix de Especias (1 Kg)", 
    price: 9500, 
    category: "Mayoristas", 
    img: "/img/1kilo/mixexpecias.png", 
    description: "Combinación exclusiva de especias seleccionadas para realzar cualquier preparación." 
  },
  { 
    id: 46, 
    title: "Orégano (1 Kg)", 
    price: 8000, 
    category: "Mayoristas", 
    img: "/img/1kilo/oregano.png", 
    description: "Hojas de orégano seleccionadas. Sabor y aroma inconfundibles en gran formato." 
  },
  { 
    id: 47, 
    title: "Pimentón (1 Kg)", 


    price: 10500, 
    category: "Mayoristas", 
    img: "/img/1kilo/pimenton.png", 
    description: "Pimentón dulce de color rojo intenso. Aporta sabor y color vibrante a tus comidas." 
  },
  { 
    id: 48, 
    title: "Polvo de Hornear (1 Kg)", 
    price: 7500, 
    category: "Mayoristas", 
    img: "/img/1kilo/polvoparahornear.png", 
    description: "Leudante químico de acción justa para masas, tortas y bizcochuelos perfectos." 
  },
  { 
    id: 49, 
    title: "Provenzal (1 Kg)", 
    price: 9800, 
    category: "Mayoristas", 
    img: "/img/1kilo/provensal.png", 
    description: "Clásica mezcla de ajo y perejil deshidratados. Práctica y llena de sabor." 
  }
];



const Home = ({ productos, agregarAlCarrito, searchTerm }) => {
  const heroImages = [ "/img/carru4.jpg", "/img/carru5.jpg"];
  const [currentImage, setCurrentImage] = useState(0);
  
  const [categoriaActiva, setCategoriaActiva] = useState(null);

const [countdown, setCountdown] = useState({ d: 0, h: 0, m: 0, s: 0 });
  
  useEffect(() => {
    const meta = new Date("2026-06-10T00:00:00").getTime(); 
    const x = setInterval(() => {
      const ahora = new Date().getTime();
      const resto = meta - ahora;
      if (resto < 0) {
        clearInterval(x);
      } else {
        setCountdown({
          d: Math.floor(resto / (1000 * 60 * 60 * 24)),
          h: Math.floor((resto % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          m: Math.floor((resto % (1000 * 60 * 60)) / (1000 * 60)),
          s: Math.floor((resto % (1000 * 60)) / 1000)
        });
      }
    }, 1000);
    return () => clearInterval(x);
  }, []);



  useEffect(() => {
    const timer = setInterval(() => setCurrentImage((prev) => (prev + 1) % heroImages.length), 4000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const filteredProducts = productos.filter(prod => {
    if (searchTerm !== "") {
      return prod.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             prod.category.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return prod.category === categoriaActiva;
  });

  const tarjetasCategorias = [
    { id: 'Sales Saborizadas', titulo: 'SALES SABORIZADAS', img: '/img/canelaportada4.jpg', color: '#FFC400' },
    { id: 'Esenciales', titulo: 'ESENCIALES', img: '/img/canelaportada5.jpg', color: '#FFC400' },
    { id: 'Mayoristas', titulo: 'MAYORISTAS', img: '/img/canelaportada1.jpg', color: '#FFC400' },
    { id: 'Nuestras Especias', titulo: 'NUESTRAS ESPECIAS', img: '/img/especias1.jpg', color: '#FFC400' },


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
          <h1>SABOR QUE <br /><span style={{color: '#FFC400'}}>TRANSFORMA</span></h1>
        </div>
      </header>
      <MundialCountdown />
      
      <section className="container" style={{ padding: '0px 20px', minHeight: '50vh' }}>
        
        {/* ESCENARIO 1: EL CLIENTE ESTÁ BUSCANDO ALGO */}
        {searchTerm !== "" ? (
           filteredProducts.length > 0 ? (
            <div>
              <h3 style={{ marginBottom: '20px', color: '#888' }}>Resultados para "{searchTerm}":</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '20px' }}>
                {filteredProducts.map(prod => <CardCondimento key={prod.id} producto={prod} alAgregar={agregarAlCarrito} />)}
              </div>
            </div>
          ) : (
            <div style={{textAlign: 'center', padding: '50px', color: '#888'}}>
              <Search size={40} style={{marginBottom:'20px', opacity: 0.5}}/>
              <h3>No encontramos condimentos para "{searchTerm}"</h3>
            </div>
          )
        ) 
        
/* --- ESCENARIO 2: CATEGORÍAS GIGANTES CON ANIMACIÓN --- */
: categoriaActiva === null ? (
  <div style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', marginTop: '-40px' }}>
    {tarjetasCategorias.map((cat, index) => (
      <div 
        key={cat.id} 
        onClick={() => setCategoriaActiva(cat.id)}
        className="categoria-gigante animar-entrada" // <-- Agregamos la clase aquí
        style={{ 
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${cat.img})`,
          animationDelay: `${index * 0.2}s` // <-- Esto hace que aparezcan en "escalera" (0.2s, 0.4s, 0.6s)
        }}
      >
        <div className="categoria-gigante-contenido">
          <h2 style={{ color: cat.color }}>{cat.titulo}</h2>
          <div className="btn-descubrir-gigante">EXPLORAR LÍNEA</div>
        </div>
      </div>
    ))}
  </div>
)



        /* ESCENARIO 3: EL CLIENTE ELIGIÓ UNA CATEGORÍA */
        : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #333', paddingBottom: '20px' }}>
              <h2 style={{ color: '#FFC400', margin: 0, textTransform: 'uppercase' }}>{categoriaActiva}</h2>
              <button 
                onClick={() => setCategoriaActiva(null)}
                style={{ background: 'transparent', border: '1px solid #FFC400', color: ' #ffc40000;', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer' }}
              >
                &larr; Volver a Categorías
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '20px' }}>
              {filteredProducts.map(prod => (
                <CardCondimento key={prod.id} producto={prod} alAgregar={agregarAlCarrito} />
              ))}
            </div>
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
        <h1>Sobre Nowin</h1>
        <div className="about-text-body">
          <p>
NOWIN es una empresa argentina que trabaja de manera federal, integrando y potenciando los mejores sabores de cada región del país. Nacimos con la idea de acercar condimentos y sales de calidad, respetando la identidad, el aroma y la tradición que hacen única a la cocina argentina.
Seleccionamos cuidadosamente nuestras especias, mezclas y sales, buscando equilibrio entre sabor, frescura y practicidad. En NOWIN creemos en el emprendimiento nacional, en el crecimiento sostenido y en el trabajo ordenado. Apostamos a una producción responsable, a relaciones comerciales duraderas y a una mejora continua que nos permita llevar a cada mesa un producto confiable y auténtico.bastecemos supermercados, carnicerías y comercios gastronómicos, ofreciendo productos pensados tanto para el uso diario como para el profesional.
          </p>
          <p className="highlight-text">
            NOWIN es sabor, identidad y compromiso con lo nuestro.
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
                   <p style={{margin: 0, color: '#ffc40000'}}>${item.price}</p>
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
          <Route path="/producto/:id" element={<ProductoDetalle productos={productos} alAgregar={addToCart} />} />
        </Routes>
        {mostrarCheckout && <CheckoutForm enviarPedido={procesarCompra} cancelar={() => setMostrarCheckout(false)} />}
        <Footer />
        <BrandCarouselThin />


{/* --- TU FIRMA --- */}
      <div style={{ backgroundColor: '#000000', width: '100%', padding: '15px 0' }}>
        <p style={{
          fontSize: '0.6rem',
          letterSpacing: '2px',
          color: '#a0a0a0', /* Gris clarito para "Desarrollo Web por" */
          textAlign: 'center',
          paddingRight: '30px',
          margin: 0
        }}>
          Desarrollo Web por <span style={{ color: '#a0a0a0#', fontWeight: 'bold' }}>GABRIELA EDWIN</span>
        </p>
      </div>
      </div>
    </Router>
  );
}

export default App;






