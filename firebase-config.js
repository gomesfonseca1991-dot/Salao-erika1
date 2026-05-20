import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  enableIndexedDbPersistence
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDnrXOGM6fXd110utHsLxWaJhwZEB5G-FM",
  authDomain: "salaoerika-2d526.firebaseapp.com",
  projectId: "salaoerika-2d526",
  storageBucket: "salaoerika-2d526.firebasestorage.app",
  messagingSenderId: "429034917079",
  appId: "1:429034917079:web:88bb7932ebadca58d2b492",
  measurementId: "G-GTEQ5R1T94"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === "failed-precondition") {
    console.warn("Multiplos separadores abertos.");
  } else if (err.code === "unimplemented") {
    console.warn("Este browser nao suporta modo offline.");
  }
});

console.log("Firebase inicializado");
