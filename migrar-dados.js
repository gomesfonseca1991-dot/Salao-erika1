// ============================================================
// migrar-dados.js
// Migra dados existentes do localStorage para o Firestore.
// Executar UMA ÚNICA VEZ depois de fazer login.
// ============================================================
//
// COMO USAR:
//
// 1. Faça login na app
// 2. Abra a consola do browser (F12 no PC, ou use o método
//    descrito abaixo no telemóvel)
// 3. Importe e execute:
//
//      import("./migrar-dados.js").then(m => m.migrar());
//
// 4. Veja o progresso na consola
// 5. Quando terminar, remova esta importação do código
//
// ============================================================

import { DB } from "./db.js";
import { utilizadorAtual } from "./auth.js";

/**
 * AJUSTE AQUI as chaves do localStorage que a sua app usa.
 * Se não tem a certeza, abra a consola e escreva:
 *   Object.keys(localStorage)
 */
const CHAVES_LOCALSTORAGE = {
  movimentos: "movimentos",   // ou "entradas" + "despesas" separadas
  marcacoes: "marcacoes",
  clientes: "clientes",
  anamneses: "anamneses"
};

export async function migrar() {
  if (!utilizadorAtual()) {
    console.error("❌ Faça login primeiro!");
    return;
  }

  console.log("🚀 A iniciar migração...");
  const relatorio = { movimentos: 0, marcacoes: 0, clientes: 0, anamneses: 0, erros: 0 };

  for (const [colecao, chave] of Object.entries(CHAVES_LOCALSTORAGE)) {
    const dadosRaw = localStorage.getItem(chave);
    if (!dadosRaw) {
      console.log(`⊘ ${colecao}: nada em localStorage["${chave}"]`);
      continue;
    }

    let dados;
    try {
      dados = JSON.parse(dadosRaw);
    } catch {
      console.warn(`⚠ ${colecao}: JSON inválido em "${chave}"`);
      continue;
    }

    if (!Array.isArray(dados)) {
      console.warn(`⚠ ${colecao}: esperava array, encontrei ${typeof dados}`);
      continue;
    }

    console.log(`📦 ${colecao}: a importar ${dados.length} registos...`);

    for (const item of dados) {
      try {
        const id = item.id || crypto.randomUUID();
        const { id: _ignored, ...resto } = item;
        await DB[colecao].importar(String(id), resto);
        relatorio[colecao]++;
      } catch (err) {
        console.error(`  ✗ falhou:`, item, err);
        relatorio.erros++;
      }
    }
  }

  console.log("✅ Migração concluída!");
  console.table(relatorio);
  console.log("👉 Sugestão: faça backup do localStorage antes de o limpar.");
  console.log("   Para limpar mais tarde:  localStorage.clear()");
  return relatorio;
}

/**
 * Migração a partir de um ficheiro de backup .json
 * (o que a sua app já exporta no separador Backup)
 */
export async function migrarDeBackup(ficheiroJson) {
  if (!utilizadorAtual()) {
    console.error("❌ Faça login primeiro!");
    return;
  }

  const texto = await ficheiroJson.text();
  const backup = JSON.parse(texto);

  console.log("📂 A importar do ficheiro de backup...");
  const relatorio = { movimentos: 0, marcacoes: 0, clientes: 0, anamneses: 0 };

  for (const colecao of ["movimentos", "marcacoes", "clientes", "anamneses"]) {
    const lista = backup[colecao] || [];
    for (const item of lista) {
      const id = item.id || crypto.randomUUID();
      const { id: _x, ...resto } = item;
      await DB[colecao].importar(String(id), resto);
      relatorio[colecao]++;
    }
  }

  console.log("✅ Importação do backup concluída!");
  console.table(relatorio);
  return relatorio;
}
