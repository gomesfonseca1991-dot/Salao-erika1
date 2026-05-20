// ============================================================
// auth.js
// Autenticação — só a Érika (e quem ela autorizar) pode entrar
// ============================================================

import { auth } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Manter sessão iniciada mesmo após fechar o browser
setPersistence(auth, browserLocalPersistence);

/**
 * Entrar com email e password
 */
export async function entrar(email, password) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return { ok: true, user: cred.user };
  } catch (err) {
    return { ok: false, erro: traduzirErro(err.code) };
  }
}

/**
 * Criar conta (use apenas uma vez para criar a conta da Érika)
 */
export async function criarConta(email, password) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    return { ok: true, user: cred.user };
  } catch (err) {
    return { ok: false, erro: traduzirErro(err.code) };
  }
}

/**
 * Sair
 */
export async function sair() {
  await signOut(auth);
}

/**
 * Observa o estado de login. Recebe uma função que é chamada
 * sempre que o utilizador entra ou sai.
 */
export function aoMudarLogin(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Retorna o utilizador atual (ou null)
 */
export function utilizadorAtual() {
  return auth.currentUser;
}

function traduzirErro(code) {
  const mapa = {
    "auth/invalid-email": "Email inválido.",
    "auth/user-not-found": "Conta não encontrada.",
    "auth/wrong-password": "Password incorreta.",
    "auth/invalid-credential": "Email ou password incorretos.",
    "auth/email-already-in-use": "Este email já está registado.",
    "auth/weak-password": "A password deve ter pelo menos 6 caracteres.",
    "auth/network-request-failed": "Sem ligação à internet.",
    "auth/too-many-requests": "Demasiadas tentativas. Aguarde uns minutos."
  };
  return mapa[code] || "Erro: " + code;
}
