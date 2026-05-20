// ============================================================
// db.js
// Camada de base de dados — substitui o localStorage por Firestore
// com sincronização automática entre dispositivos
// ============================================================
//
// COMO USAR no seu app.js:
//
//   import { DB } from "./db.js";
//
//   // Guardar
//   await DB.movimentos.adicionar({ tipo: "entrada", valor: 25, ... });
//
//   // Ouvir mudanças em tempo real (atualiza ecrã automaticamente)
//   DB.movimentos.observar((lista) => {
//     console.log("Movimentos atualizados:", lista);
//     renderizarMovimentos(lista);
//   });
//
//   // Listar uma vez
//   const clientes = await DB.clientes.listar();
//
//   // Atualizar
//   await DB.clientes.atualizar(id, { telefone: "912345678" });
//
//   // Apagar
//   await DB.marcacoes.apagar(id);
//
// ============================================================

import { db, auth } from "./firebase-config.js";
import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ------------------------------------------------------------
// Caminho base: cada utilizador tem os seus dados isolados em
// /utilizadores/{uid}/{coleccao}/{docId}
// ------------------------------------------------------------
function caminhoColecao(nome) {
  const user = auth.currentUser;
  if (!user) throw new Error("Sem sessão iniciada.");
  return collection(db, "utilizadores", user.uid, nome);
}

// ------------------------------------------------------------
// Fábrica que cria um conjunto de operações para uma coleção
// ------------------------------------------------------------
function criarRepositorio(nomeColecao, campoOrdenacao = "criadoEm") {
  return {
    /**
     * Adiciona um novo documento. Retorna o ID gerado.
     */
    async adicionar(dados) {
      const ref = await addDoc(caminhoColecao(nomeColecao), {
        ...dados,
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp()
      });
      return ref.id;
    },

    /**
     * Atualiza um documento existente
     */
    async atualizar(id, dados) {
      const ref = doc(caminhoColecao(nomeColecao), id);
      await updateDoc(ref, {
        ...dados,
        atualizadoEm: serverTimestamp()
      });
    },

    /**
     * Apaga um documento
     */
    async apagar(id) {
      const ref = doc(caminhoColecao(nomeColecao), id);
      await deleteDoc(ref);
    },

    /**
     * Vai buscar um documento por ID
     */
    async obter(id) {
      const ref = doc(caminhoColecao(nomeColecao), id);
      const snap = await getDoc(ref);
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    },

    /**
     * Lista todos os documentos (uma única vez)
     */
    async listar() {
      const q = query(caminhoColecao(nomeColecao), orderBy(campoOrdenacao, "desc"));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },

    /**
     * Observa a coleção em tempo real. Sempre que algo muda
     * (neste ou noutro dispositivo), o callback é chamado.
     * Retorna uma função para cancelar a observação.
     */
    observar(callback) {
      const q = query(caminhoColecao(nomeColecao), orderBy(campoOrdenacao, "desc"));
      return onSnapshot(q, (snap) => {
        const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        callback(lista);
      });
    },

    /**
     * Importa um documento mantendo o ID original (usado na migração)
     */
    async importar(id, dados) {
      const ref = doc(caminhoColecao(nomeColecao), id);
      await setDoc(ref, {
        ...dados,
        criadoEm: dados.criadoEm || serverTimestamp(),
        atualizadoEm: serverTimestamp()
      });
    }
  };
}

// ------------------------------------------------------------
// Exporta as quatro coleções principais do salão
// ------------------------------------------------------------
export const DB = {
  movimentos: criarRepositorio("movimentos", "data"),
  marcacoes: criarRepositorio("marcacoes", "data"),
  clientes: criarRepositorio("clientes", "nome"),
  anamneses: criarRepositorio("anamneses", "criadoEm")
};
