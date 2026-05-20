// ============================================================
// firebase-config.js
// Configuração do Firebase para o Salão Érika
// ============================================================
// SUBSTITUA os valores abaixo pelos da sua conta Firebase.
// Onde encontrar: console.firebase.google.com → seu projeto →
// ⚙ Definições → Geral → "As suas apps" → Configuração SDK
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  enableIndexedDbPersistence
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "COLE_AQUI_A_SUA_API_KEY",
  authDomain: "salao-erika.firebaseapp.com",
  projectId: "salao-erika",
  storageBucket: "salao-erika.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Ativar funcionamento offline (sincroniza quando voltar a ter rede)
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === "failed-precondition") {
    console.warn("Múltiplos separadores abertos — offline ativo apenas num.");
  } else if (err.code === "unimplemented") {
    console.warn("Este browser não suporta modo offline.");
  }
});

console.log("✓ Firebase inicializado");
