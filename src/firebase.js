
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; 
import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyCCjKi1P6vPkF7ogUsCZJrS2tvynNy7z68",
  authDomain: "nowin-86d07.firebaseapp.com",
  projectId: "nowin-86d07",
  storageBucket: "nowin-86d07.firebasestorage.app",
  messagingSenderId: "43022335973",
  appId: "1:43022335973:web:10f2b29f5b26db800df90c",
  measurementId: "G-VMMT5WS2B0"
};

export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


export const db = getFirestore(app); 
export const auth = getAuth(app);





