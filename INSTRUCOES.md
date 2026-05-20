# Migração para Firebase — Salão Érika

Passo a passo para sincronizar os dados entre dispositivos. Estimativa: **30–40 minutos**.

---

## Parte 1 — Criar projeto Firebase (10 min)

1. Vá a **https://console.firebase.google.com** e entre com a sua conta Google.
2. Clique em **"Adicionar projeto"** → nome: `salao-erika` → desativar Google Analytics (não é preciso) → **Criar**.
3. No menu lateral, clique em **Build → Authentication → Get started**.
   - Separador **Sign-in method** → ativar **Email/Password** → **Save**.
4. No menu lateral, clique em **Build → Firestore Database → Create database**.
   - Modo: **Start in production mode**.
   - Localização: **eur3 (europe-west)** (mais perto de Portugal).
   - Clique **Enable**.

---

## Parte 2 — Obter as credenciais (2 min)

1. Clique no ícone **⚙ (engrenagem) → Project settings**.
2. Em **"Your apps"**, clique no ícone **`</>`** (Web).
3. Apelido: `Salão Érika Web` → **Register app**.
4. **Copie o objeto `firebaseConfig`** que aparece. Vai usá-lo no próximo passo.

---

## Parte 3 — Adicionar os ficheiros ao seu projeto (10 min)

1. Descarregue os ficheiros que preparei e coloque-os na pasta do seu projeto (ao lado do `index.html`):
   - `firebase-config.js`
   - `auth.js`
   - `db.js`
   - `migrar-dados.js`
   - `login.html`
   - `app-exemplo.js` (referência — não usar diretamente)
   - `firestore.rules`

2. Abra **`firebase-config.js`** e cole as credenciais que copiou no Passo 2 (substituindo os valores `COLE_AQUI_...`).

3. Abra o seu **`index.html`** e:
   - Cole o conteúdo de `login.html` logo a seguir ao `<body>`.
   - Envolva a sua app principal numa `<div class="app-principal">...</div>` (assim só aparece depois do login).
   - No fim do `<body>`, importe o script principal como **module**:
     ```html
     <script type="module" src="./app.js"></script>
     ```

---

## Parte 4 — Configurar regras de segurança (2 min)

1. No Firebase Console → **Firestore Database → Rules**.
2. Apague o que está lá e cole o conteúdo de `firestore.rules`.
3. Clique **Publish**.

Sem isto, qualquer pessoa pode ler/escrever os seus dados!

---

## Parte 5 — Criar a conta da Érika (1 min)

1. Firebase Console → **Authentication → Users → Add user**.
2. Email (qualquer, ex: `erika@salao.pt`) + Password (mínimo 6 caracteres).
3. **Add user**.

Esta será a conta usada para entrar em qualquer dispositivo.

---

## Parte 6 — Adaptar o seu código (15 min)

Veja `app-exemplo.js`. As mudanças principais são:

**Antes (localStorage):**
```js
const movimentos = JSON.parse(localStorage.getItem("movimentos") || "[]");
movimentos.push(novo);
localStorage.setItem("movimentos", JSON.stringify(movimentos));
```

**Depois (Firestore):**
```js
import { DB } from "./db.js";
await DB.movimentos.adicionar(novo);
// A interface atualiza-se sozinha graças ao observador
```

**Para cada coleção** (movimentos, marcações, clientes, anamneses), substitua:
- `localStorage.getItem(...)` → use o observador `DB.x.observar(...)` que mantém `window.X` sempre atualizado
- `localStorage.setItem(...)` para criar → `await DB.x.adicionar(...)`
- `localStorage.setItem(...)` para editar → `await DB.x.atualizar(id, ...)`
- Apagar item da lista → `await DB.x.apagar(id)`

---

## Parte 7 — Migrar dados antigos (5 min)

Depois de fazer login uma primeira vez:

**Opção A — Migrar do localStorage do telemóvel atual:**
1. No PC, abra o site → F12 (consola) → Console.
2. Faça login.
3. Cole e execute:
   ```js
   const m = await import("./migrar-dados.js");
   await m.migrar();
   ```

**Opção B — Migrar a partir de um backup `.json` que já tem guardado:**
```js
const m = await import("./migrar-dados.js");
// abra um seletor de ficheiros e use:
await m.migrarDeBackup(seuFicheiroJson);
```

---

## Parte 8 — Testar (3 min)

1. Abra a app no PC, faça login, adicione uma marcação de teste.
2. Abra a app no telemóvel, faça login com a mesma conta.
3. A marcação deve aparecer em segundos. ✅

---

## Custos esperados

Para um salão típico (até ~50 marcações/dia, 500 clientes), tudo fica **dentro do plano gratuito Spark**:

- 1 GB de dados (chega para anos de operação)
- 50.000 leituras/dia (vai usar ~500–2.000)
- 20.000 escritas/dia (vai usar ~50–200)

Não precisa de adicionar cartão de crédito.

---

## Manter o backup local

O seu sistema atual de export/import `.json` continua a funcionar como **segunda camada de segurança** — recomendo manter. Exporte de mês a mês para o Google Drive como já faz.

---

## Próximos passos opcionais

- **PWA**: tornar a app instalável no telemóvel (já tem meta tags Apple no HTML — falta o `manifest.json` e service worker).
- **Notificações**: usar Firebase Cloud Messaging para lembretes de marcações no telemóvel.
- **Multi-utilizador**: dar acesso a funcionárias com permissões diferentes (administradora vs colaboradora).

Posso ajudar com qualquer um destes quando quiser.
