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
    price: 3000, 
    category: "Sales Saborizadas", 
    img: "/img/salconajo.png", 
    description: "Es el resultado de mezclar de ajo seco molido y sal de mesa Es el sustituto del ajo fresco en el caso de la sal de ajo Nowin es el aderezo final en carnes pescados y mariscos a plancha o incluso utilizarlo en seco de la misma manera que utilizaríamos la sal Usos sugeridos : Carnes, Pescados ,Mariscos a la plancha Como reemplazo del ajo fresco Uso en seco como sal común." 
  },
  { 
    id: 2, 
    title: "Pimienta Molida", 
    price: 1800, 
    category: "Esenciales", 
    img: "/img/pimientamolida.png", 
    description: "Disponible molida o en grano.Aroma penetrante.Picor equilibrado.Tamaño homogéneo (en grano).Diferencial NOWIN:Selección de calidad que asegura potencia constante en cada uso." 
  },
  { 
    id: 3, 
    title: "Condimento Arroz", 
    price: 1800, 
    category: "Esenciales", 
    img: "/img/condimentoarroz.png", 
    description: "Mezcla equilibrada de especias.Color atractivo y natural.Aroma suave y armonioso.Distribución homogénea de ingredientes.Diferencial NOWIN:Fórmula pensada para transformar un arroz común en una preparación especial con solo una pizca." 
  },
  { 
    id: 4, 
    title: "Sal de Campo", 
    price: 3000, 
    category: "Sales Saborizadas", 
    img: "/img/saldecampo.png", 
    description: "Mezcla artesanal de sal entrefina con especias seleccionadas, inspirada en la tradición del campo argentino Ingredientes destacados:Ají molido,Orégano,Comino,Sal entrefina" 
  },
  { 
    id: 5, 
    title: "Orégano", 
    price: 1800, 
    category: "Esenciales", 
    img: "/img/oregano.png", 
    description: "Hojas secas seleccionadas.Corte uniforme y baja presencia de tallos.Aroma herbal intenso.Color verde natural (indicador de frescura).Diferencial NOWIN:Mayor potencia aromática y mejor rendimiento por uso Selección cuidada para garantizar sabor auténtico en cada plato" 
  },
  { 
    id: 6, 
    title: "Sal Ahumada", 
    price: 3000, 
    category: "Sales Saborizadas", 
    img: "/img/salahumada.png", 
    description: "Sabor ahumado sin fuego Permite lograr efecto “a la parrilla” sin necesidad de brasas ni humo real.Aroma natural de madera quemada Los aromas se elaboran a partir de madera quemada, logrando un perfil auténtico Lista para usar Ideal para dar toque final a:Hamburguesas (sabor como hechas a las brasas) Carnes Salmón marinado Verduras grilladas Mezcla especiada equilibrada,No es solo sal ahumada: incluye hierbas que potencian el sabor." 
  },
  { 
    id: 7, 
    title: "Sal Cebolla y Ajo", 
    price: 3000, 
    category: "Sales Saborizadas", 
    img: "/img/salcebollayajo.png", 
    description: "Descubrí el sabor que no puede faltar en la cocina argentina. Nuestra Sal Especiada Cebolla y Ajo Argentinisima combina sal de calidad con cebolla y ajo deshidratados, logrando el equilibrio perfecto entre intensidad y aroma Ideal para realzar carnes, milanesas, papas al horno, verduras grilladas, pollo, pastas y, por supuesto, el infaltable asado. Una pizca es suficiente para transformar cualquier plato en una experiencia llena de sabor casero y tradición." 
  },
  { 
    id: 8, 
    title: "Sal Picante", 
    price: 3000, 
    category: "Sales Saborizadas", 
    img: "/img/salpicante.png", 
    description: "DiferencialPicor suave y equilibradoPotencia el sabor sin taparlo Versátil: combina con casi cualquier comida Acompañamiento que no puede faltar “El toque picante ideal para pastas, pescados y mariscos" 
  },
  { 
    id: 9, 
    title: "Sal con Romero y Tomillo", 
    price: 3000, 
    category: "Sales Saborizadas", 
    img: "/img/salconromeroytomillo.png", 
    description: "Mezcla de sal con hierbas aromáticas seleccionadas, que aporta un sabor intenso y equilibrado, inspirado en aromas mediterráneos Hierbas destacadas Romero Tomillo" 
  },
  { 
    id: 10, 
    title: "Polvo para hornear", 
    price: 1800, 
    category: "Esenciales", 
    img: "/img/polvoparahornear.png", 
    description: "Nuestro polvo de hornear artesanal está elaborado bajo procesos tradicionales, buscando el equilibrio perfecto entre pureza y rendimiento. A diferencia de las versiones comerciales masivas, prescindimos de conservantes artificiales y el exceso de aluminio, logrando una gasificación constante y uniforme que respeta el sabor original de tus preparaciones." 
  },
  { 
    id: 11, 
    title: "Pimentón", 
    price: 1800, 
    category: "Esenciales", 
    img: "/img/pimenton.png", 
    description: "Nuestro pimentón artesanal nace de pimientos seleccionados en su punto óptimo de maduración. Secados lentamente y molidos en piedra, este proceso preserva los aceites esenciales y el aroma vibrante que se pierde en las moliendas industriales de alta fricción. Es el alma de los guisos, el toque final de las carnes y el secreto de un buen adobo.." 
  },
  { 
    id: 12, 
    title: "Perejil", 
    price: 1800, 
    category: "Esenciales", 
    img: "/img/perejil.png", 
    description: "Perejil fresco y aromático, ideal para realzar salsas, guisos y marinados. Su sabor refrescante aporta un toque especial a cualquier preparación Es perejil 100% natural, cultivado sin químicos y secado lentamente a la sombra. Este proceso artesanal garantiza que conserve su color verde brillante y todo su aroma original, algo que el perejil industrial pierde al ser procesado con calor ."
  },
  { 
    id: 13, 
    title: "Mix de Especias", 
    price: 1800, 
    category: "Esenciales", 
    img: "/img/mixdeespecias.png", 
    description: "Combinación exclusiva de especias seleccionadas para realzar cualquier preparación." 
  },
  { 
    id: 14, 
    title: "Adobo para Pizzas", 
    price: 1800, 
    category: "Esenciales", 
    img: "/img/adoboparapizzas.png", 
    description: " Proporción justa de especias que potencia salsas y rellenos sin opacar otros sabores. Versatilidad: ideal para pizzas, pastas, guisos y marinados. Diferencial NOWIN: Selección de ingredientes de alta calidad, procesados para conservar su aroma y sabor, garantizando un resultado superior en cada uso." 
  },
  { 
    id: 15, 
    title: "Ajo granulado", 
    price: 2000, 
    category: "Esenciales", 
    img: "/img/ajogranulado.png", 
    description: "Granulación equilibrada que permite mejor distribución y mayor rendimiento en carnes y adobos. Sabor intenso y duradero, ideal para realzar el sabor sin necesidad de usar ajo fresco. Versatilidad en la cocina: perfecto para salsas, marinados, guisos y preparaciones al horno. Diferencial NOWIN: Selección de granos de ajo de alta calidad, procesados para conservar su aroma y sabor, garantizando un resultado superior en cada uso." 
  },
  { 
    id: 16, 
    title: "Sal Mundial", 
    price: 4500, 
    category: "Sales Saborizadas", 
    img: "/img/salmundial.png", 
    description: "Mezcla de sal con hierbas aromáticas seleccionadas, que aporta un sabor intenso y equilibrado, inspirado en aromas mediterráneos Hierbas destacadas Romero Tomillllo"
  },
  { 
    id: 17, 
    title: "Canela", 
    price: 1800, 
    category: "Esenciales", 
    img: "/img/canela.png", 
    description: "Alta intensidad aromática y frescura garantizada, lo que permite utilizar menor cantidad para lograr mayor sabor. Versatilidad en la cocina: ideal para preparaciones dulces como postres, infusiones y repostería, pero también para platos salados como guisos y curries. Diferencial NOWIN: Selección de canela de alta calidad, procesada para conservar su aroma y sabor, asegurando un resultado superior en cada uso." 
  },
  { 
    id: 18, 
    title: "Clavo de olor", 
    price: 1800, 
    category: "Esenciales", 
    img: "/img/clavodeolor.png", 
    description: " El clavo de olor NOWIN es una especia de aroma intenso y sabor cálido, ideal para realzar tanto preparaciones dulces como saladas. Seleccionamos clavos enteros de excelente calidad, conservando su frescura y potencia natural. Perfecto para infusiones, guisos, postres y marinados, el clavo de olor NOWIN es el toque secreto que transforma tus recetas en experiencias inolvidables."

  },
  { 
    id: 19, 
    title: "Laurel", 
    price: 1800, 
    category: "Esenciales", 
    img: "/img/laurel.png", 
    description: "  El laurel es una hierba aromática muy utilizada en la cocina por su sabor intenso y característico. Se emplea principalmente para condimentar guisos, sopas, carnes y salsas, aportando un aroma profundo que realza las preparaciones, Sus hojas se utilizan enteras durante la cocción para liberar su sabor de forma gradual, y se retiran antes de servir. Además, el laurel es valorado por sus propiedades digestivas y su aporte natural al equilibrio de los platos" 

  },


  // --- CATEGORÍA: NUESTRAS ESPECIAS ---
  { 
    id: 20, 
    title: "Ají Triturado", 
    price: 10100, 
    category: "Nuestras Especias", 
    img: "/img/1aji.png", 
    description: "Ají triturado de gran sabor, ideal para darle un toque picante a tus pizzas, guisos y empanadas." 
  },
  { 
    id: 21, 
    title: "Ajo Granulado", 
    price: 14000, 
    category: "Nuestras Especias", 
    img: "/img/2ajogranuladoo.png", 
    description: "Ajo deshidratado y granulado. Sabor intenso y práctico para condimentar carnes y salsas al instante." 
  },
  { 
    id: 22, 
    title: "Condimento para Arroz", 
    price: 7200, 
    category: "Nuestras Especias", 
    img: "/img/3arrozcondimento.png", 
    description: "Mezcla equilibrada para resaltar el sabor y darle el color perfecto a tus arroces y paellas." 
  },
  { 
    id: 23, 
    title: "Canela Molida", 
    price: 9200, 
    category: "Nuestras Especias", 
    img: "/img/3canela.png", 
    description: "Canela de aroma dulce y profundo. El condimento estrella para tu repostería e infusiones." 
  },
  { 
    id: 24, 
    title: "Cebolla Crispy", 
    price: 6300, 
    category: "Nuestras Especias", 
    img: "/img/4cebollacrispy.png", 
    description: "Cebolla frita crocante. Perfecta para agregar textura y sabor a hamburguesas, panchos y ensaladas." 
  },
  { 
    id: 25, 
    title: "Cebolla en Polvo", 
    price: 8700, 
    category: "Nuestras Especias", 
    img: "/img/5cebollaenpolvo.png", 
    description: "Todo el sabor de la cebolla en una textura fina, ideal para salsas, cremas y marinados." 
  },
  { 
    id: 26, 
    title: "Chimichurri", 
    price: 6800, 
    category: "Nuestras Especias", 
    img: "/img/6chimi.png", 
    description: "Blend de hierbas tradicionales para preparar el mejor aderezo de tus asados y carnes a la parrilla." 
  },
  
  { 
    id: 28, 
    title: "Coriandro Molido", 
    price: 5600, 
    category: "Nuestras Especias", 
    img: "/img/8coriandro.png", 
    description: "Semillas de cilantro molidas. Aporta notas cítricas y frescas a tus embutidos y guisos." 
  },
  { 
    id: 29, 
    title: "Cúrcuma", 
    price: 9000, 
    category: "Nuestras Especias", 
    img: "/img/9curcumamolida.png", 
    description: "Color y salud en tus platos. Ideal para arroces, vegetales asados y recetas de la cocina oriental." 
  },
  { 
    id: 30, 
    title: "Laurel en Hojas", 
    price: 9200, 
    category: "Nuestras Especias", 
    img: "/img/10laurelenhojas.png", 
    description: "Hojas de laurel secas de alta calidad. El aroma fundamental para tucos, sopas y estofados." 
  },
  { 
    id: 31, 
    title: "Orégano", 
    price: 8500, 
    category: "Nuestras Especias", 
    img: "/img/10oreganoo.png", 
    description: "Hojas seleccionadas de aroma intenso. El compañero inseparable de la pizza y las salsas rojas." 
  },
 
  { 
    id: 33, 
    title: "Perejil Selección", 
    price: 9500, 
    category: "Nuestras Especias", 
    img: "/img/12perejill.png", 
    description: "Variedad de perejil deshidratado ideal para realzar el sabor final de tus platos favoritos." 
  },
  { 
    id: 34, 
    title: "Romero", 
    price: 8100, 
    category: "Nuestras Especias", 
    img: "/img/13romero.png", 
    description: "Hierba aromática de sabor boscoso. La pareja perfecta para papas al horno, pollo y carnes rojas." 
  },
  { 
    id: 35, 
    title: "Provenzal", 
    price: 8500, 
    category: "Nuestras Especias", 
    img: "/img/14provenzal.png", 
    description: "El equilibrio exacto entre ajo y perejil. Un clásico para milanesas, papas fritas y revueltos." 
  },
  { 
    id: 36, 
    title: "Condimento para Pizza", 
    price: 7200, 
    category: "Nuestras Especias", 
    img: "/img/15pizza.png", 
    description: "Mezcla artesanal de especias diseñada para darle el auténtico sabor de pizzería a tus masas." 
  },
  { 
    id: 37, 
    title: "Pimentón Selección", 
    price: 9200, 
    category: "Nuestras Especias", 
    img: "/img/16pimentonn.png", 
    description: "Pimentón de color intenso y sabor dulce, ideal para empanadas, tucos y platos regionales." 
  },
  { 
    id: 38, 
    title: "Pimentón Ahumado", 
    price: 9500, 
    category: "Nuestras Especias", 
    img: "/img/17pimentonn.png", 
    description: "Aporta un toque ahumado sofisticado y un color profundo a guisos, carnes y salsas." 
  },
  { 
    id: 39, 
    title: "Tomillo", 
    price: 8600, 
    category: "Nuestras Especias", 
    img: "/img/18tomillo.png", 
    description: "Hierba delicada y muy aromática. Excelente para marinar aves, pescados y aromatizar aceites." 
  },

  // --- CATEGORÍA: MAYORISTAS ---
  { 
    id: 40, 
    title: "Adobo para Pizza (1 Kg)", 
    price: 6800, 
    category: "Mayoristas", 
    img: "/img/1kilo/adobodepizza.png", 
    description: "El clásico adobo pimentero ideal para pizzas y salsas, en formato económico de 1 kilo." 
  },
  { 
    id: 41, 
    title: "Ajo Granulado (1 Kg)", 
    price: 14200, 
    category: "Mayoristas", 
    img: "/img/1kilo/ajogranulado.png", 
    description: "Ajo deshidratado granulado de alta pureza. Excelente rendimiento para cocinas profesionales." 
  },
  { 
    id: 42, 
    title: "Canela (1 Kg)", 
    price: 9200, 
    category: "Mayoristas", 
    img: "/img/1kilo/canela.png", 
    description: "Canela molida de aroma intenso y dulzor natural. Ideal para repostería y cafetería." 
  },
  { 
    id: 43, 
    title: "Chimichurri (1 Kg)", 
    price: 6800, 
    category: "Mayoristas", 
    img: "/img/1kilo/chimichurri.png", 
    description: "La mezcla tradicional argentina para carnes y asados. Listo para hidratar y usar." 
  },
  { 
    id: 44, 
    title: "Coco Rallado (1 Kg)", 
    price: 14200, 
    category: "Mayoristas", 
    img: "/img/1kilo/cocorayado.png", 
    description: "Coco rallado de alta calidad, blanco y aromático. Perfecto para postres y alfajores." 
  },
  { 
    id: 45, 
    title: "Mix de Especias (1 Kg)", 
    price: 7300, 
    category: "Mayoristas", 
    img: "/img/1kilo/mixexpecias.png", 
    description: "Combinación exclusiva de especias seleccionadas para realzar cualquier preparación." 
  },
  { 
    id: 46, 
    title: "Orégano (1 Kg)", 
    price: 8500, 
    category: "Mayoristas", 
    img: "/img/1kilo/oregano.png", 
    description: "Hojas de orégano seleccionadas. Sabor y aroma inconfundibles en gran formato." 
  },
  { 
    id: 47, 
    title: "Pimentón (1 Kg)", 
    price: 9200, 
    category: "Mayoristas", 
    img: "/img/1kilo/pimenton.png", 
    description: "Pimentón dulce de color rojo intenso. Aporta sabor y color vibrante a tus comidas." 
  },
  { 
    id: 48, 
    title: "Polvo de Hornear (1 Kg)", 
    price: 6000, 
    category: "Mayoristas", 
    img: "/img/1kilo/polvoparahornear.png", 
    description: "Leudante químico de acción justa para masas, tortas y bizcochuelos perfectos." 
  },
  { 
    id: 49, 
    title: "Provenzal (1 Kg)", 
    price: 8500, 
    category: "Mayoristas", 
    img: "/img/1kilo/provensal.png", 
    description: "Clásica mezcla de ajo y perejil deshidratados. Práctica y llena de sabor." 
  },

  { 
    id: 50, 
    title: "Chimichurri", 
    price: 2500, 
    category: "Esenciales", 
    img: "/img/chimichurri2.png", 
    description: " Descubrí el equilibrio perfecto entre tradición y frescura. Nuestro preparado de especias está diseñado para quienes buscan el sabor auténtico del campo en su mesa. Solo necesitás hidratarlo con aceite y vinagre para obtener una salsa con cuerpo, aroma intenso y el picor justoo que caracteriza al verdadero chimichurri argentino. Ideal para acompañar tus asados, carnes a la parrilla, milanesas o incluso como aderezo para verduras grilladas. Con nuestro chimichurri, cada bocado se convierte en una experiencia llena de sabor y tradición." 
  },

    { 
    id: 51, 
    title: "Coco Rallado", 
    price: 2500, 
    category: "Esenciales", 
    img: "/img/cocorayado2.png", 
    description: "Nuestro Coco Rallado se destaca por su textura ligera y su aroma intenso y natural. Es el ingrediente esencial para quienes buscan calidad profesional en su cocina, aportando ese sabor dulce y exótico característico del fruto recién procesado. Ideal para la elaboración de postres, alfajores, tortas y cualquier preparación que requiera un toque de coco auténtico. Con nuestro Coco Rallado, cada receta se transforma en una experiencia culinaria llena de sabor y aroma tropical."
  },
    { 
    id: 52, 
    title: "PROVENZAL", 
    price: 2500, 
    category: "Esenciales", 
    img: "/img/provenzal2.png", 
    description: "Nuestra mezcla Provenzal es la combinación perfecta de ajo deshidratado y perejil seleccionado. Logramos el equilibrio justo para que tus comidas tengan ese toque casero y aromático en segundos, sin necesidad de picar vegetales frescos cada vez. Ideal para milanesas, revueltos y cualquier plato que quieras realzar con un sabor tradicional y delicioso. Con nuestra Provenzal, cada preparación se convierte en una experiencia llena de sabor y aroma casero, ¡el secreto para darle vida a tus recetas favoritas!" 

  },

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
NOWIN es una empresa argentina con base en Posadas, Misiones, que trabaja de manera federal, integrando y potenciando los mejores sabores de cada región del país.
Nacimos con la idea de acercar condimentos y sales condimentadas de calidad, respetando la identidad, el aroma y la tradición que hacen única a la cocina argentina. Seleccionamos cuidadosamente cada especia, mezcla y sal, logrando un equilibrio entre sabor, frescura y practicidad.
En NOWIN creemos,en el crecimiento sostenido y en el trabajo ordenado como base de un proyecto sólido. Nos inspira un enfoque donde el desarrollo no se basa solo en vender más, sino en construir una estructura firme, eficiente y preparada para crecer en el tiempo.
Apostamos a una producción responsable, a relaciones comerciales duraderas y a la mejora continua, con el objetivo de ofrecer productos confiables y auténticos en cada etapa.
Abastecemos supermercados, carnicerías y comercios gastronómicos, desarrollando soluciones pensadas tanto para el uso diario como para el ámbito profesional.
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
  <footer className="footer-moderno">
    
    <h3 className="footer-titulo">CONTACTO</h3>
    
    <div className="social-icons">
      <a href="https://instagram.com" className="social-link">
        <Instagram size={28} />
      </a>
      <a href="https://facebook.com" className="social-link">
        <Facebook size={28} />
      </a>
      <a href="https://wa.me/5493764141598" target="_blank" rel="noopener noreferrer" className="social-link whatsapp">
        {/* Tu SVG original intacto */}
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="#25D366">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471.148-.67.396-.197.247-.742.967-.919 1.165-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>
    </div>

    <hr className="footer-linea-divisoria" />

   
    
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
      </div>
    </Router>
  );
}

export default App;






