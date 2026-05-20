// ============================================================
// app-exemplo.js
// Exemplo de como adaptar a sua app atual para usar Firestore.
// Use isto como referência para substituir o localStorage.
// ============================================================

import { DB } from "./db.js";
import { aoMudarLogin, sair, utilizadorAtual } from "./auth.js";

// ------------------------------------------------------------
// 1. Esperar pelo login antes de carregar dados
// ------------------------------------------------------------
window.addEventListener("utilizadorPronto", () => {
  console.log("✓ Sessão iniciada, a carregar dados...");
  iniciarSincronizacao();
});

// ------------------------------------------------------------
// 2. Observar cada coleção em tempo real
// ------------------------------------------------------------
let unsubMovimentos, unsubMarcacoes, unsubClientes;

function iniciarSincronizacao() {
  // Cancelar observadores antigos (se houver)
  unsubMovimentos?.();
  unsubMarcacoes?.();
  unsubClientes?.();

  // Movimentos (entradas + despesas)
  unsubMovimentos = DB.movimentos.observar((lista) => {
    window.MOVIMENTOS = lista;
    renderizarInicio();
    renderizarRelatorios();
    renderizarFecho();
  });

  // Marcações
  unsubMarcacoes = DB.marcacoes.observar((lista) => {
    window.MARCACOES = lista;
    renderizarMarcacoes();
    renderizarMarcacoesHoje();
  });

  // Clientes
  unsubClientes = DB.clientes.observar((lista) => {
    window.CLIENTES = lista;
    renderizarClientes();
  });
}

// ------------------------------------------------------------
// 3. Exemplos: SUBSTITUIR as funções antigas pelas novas
// ------------------------------------------------------------

// ---- ANTES (localStorage) ----
//
//   function adicionarEntrada(dados) {
//     const lista = JSON.parse(localStorage.getItem("movimentos") || "[]");
//     dados.id = Date.now();
//     lista.push(dados);
//     localStorage.setItem("movimentos", JSON.stringify(lista));
//     renderizar();
//   }

// ---- DEPOIS (Firestore) ----
export async function adicionarEntrada(dados) {
  await DB.movimentos.adicionar({
    tipo: "entrada",
    metodo: dados.metodo,        // "dinheiro" ou "mbway"
    valor: Number(dados.valor),
    descricao: dados.descricao,
    cliente: dados.cliente || null,
    data: dados.data,            // "2026-05-20"
    hora: dados.hora             // "14:30"
  });
  // Nota: NÃO é preciso chamar renderizar() — o observador faz isso automaticamente
}

export async function adicionarDespesa(dados) {
  await DB.movimentos.adicionar({
    tipo: "despesa",
    metodo: dados.metodo,
    valor: Number(dados.valor),
    descricao: dados.descricao,
    categoria: dados.categoria,
    data: dados.data,
    hora: dados.hora
  });
}

export async function adicionarMarcacao(dados) {
  await DB.marcacoes.adicionar({
    nomeCliente: dados.nomeCliente,
    telefone: dados.telefone,
    servico: dados.servico,
    data: dados.data,
    hora: dados.hora,
    notas: dados.notas || "",
    lembrete: dados.lembrete || "nenhum"
  });
}

export async function adicionarCliente(dados) {
  await DB.clientes.adicionar({
    nome: dados.nome,
    telefone: dados.telefone,
    email: dados.email || "",
    notas: dados.notas || ""
  });
}

export async function eliminarMovimento(id) {
  if (!confirm("Eliminar este movimento?")) return;
  await DB.movimentos.apagar(id);
}

export async function eliminarMarcacao(id) {
  if (!confirm("Eliminar esta marcação?")) return;
  await DB.marcacoes.apagar(id);
}

export async function atualizarCliente(id, novosDados) {
  await DB.clientes.atualizar(id, novosDados);
}

// ------------------------------------------------------------
// 4. Anamnese — guardar ficha completa
// ------------------------------------------------------------
export async function guardarAnamnese(dadosFicha) {
  const id = await DB.anamneses.adicionar(dadosFicha);
  alert("Ficha guardada!");
  return id;
}

// ------------------------------------------------------------
// 5. Botão de sair (adicionar no menu)
// ------------------------------------------------------------
export async function fazerLogout() {
  if (confirm("Terminar sessão?")) {
    await sair();
    location.reload();
  }
}

// ------------------------------------------------------------
// Funções "renderizar" — mantenha as suas, só leiam de
// window.MOVIMENTOS, window.MARCACOES, window.CLIENTES
// ------------------------------------------------------------
function renderizarInicio()         { /* sua lógica aqui */ }
function renderizarMarcacoes()      { /* sua lógica aqui */ }
function renderizarMarcacoesHoje()  { /* sua lógica aqui */ }
function renderizarClientes()       { /* sua lógica aqui */ }
function renderizarRelatorios()     { /* sua lógica aqui */ }
function renderizarFecho()          { /* sua lógica aqui */ }
