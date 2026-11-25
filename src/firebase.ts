
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA52lPfWU-cUWGbSLJvBdLVEg1NpTivFIw",
  authDomain: "proyecto3-dawm-3ed0d.firebaseapp.com",
  databaseURL: "https://proyecto3-dawm-3ed0d-default-rtdb.firebaseio.com",
  projectId: "proyecto3-dawm-3ed0d",
  storageBucket: "proyecto3-dawm-3ed0d.firebasestorage.app",
  messagingSenderId: "869094810203",
  appId: "1:869094810203:web:3fe6ba7bd37149dcdd157e"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Obtener conexión con Realtime Database
export const database = getDatabase(app);
