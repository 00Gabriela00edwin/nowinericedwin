// Importamos las funciones necesarias
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // <--- AGREGADO: Importar Firestore

// Tu configuración (La que me pasaste)
const firebaseConfig = {
  apiKey: "AIzaSyCCjKi1P6vPkF7ogUsCZJrS2tvynNy7z68",
  authDomain: "nowin-86d07.firebaseapp.com",
  projectId: "nowin-86d07",
  storageBucket: "nowin-86d07.firebasestorage.app",
  messagingSenderId: "43022335973",
  appId: "1:43022335973:web:10f2b29f5b26db800df90c",
  measurementId: "G-VMMT5WS2B0"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Inicializar y exportar la Base de Datos
export const db = getFirestore(app); // <--- AGREGADO: Esto es lo que usa tu App.jsx

