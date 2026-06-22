# TaskFlow — Documentação do Projeto

Aplicação de gestão de tarefas em equipa (estilo Trello).
Tem um **frontend** (a parte que se vê no browser) e um **backend/API** em Node.js com Express e base de dados PostgreSQL.

Cada utilizador faz login, vê os **projetos** onde é membro, e dentro de cada projeto cria e gere **tarefas**. Também pode juntar outras pessoas ao projeto.

**Equipa:** Bruno, Diogo, Nelson e Alexandre
**Formador:** Nuno Carapito

---

## 1. Como está organizado o projeto

```
taskflow/
├── index.js                       -> arranca o servidor e liga tudo
├── package.json                   -> as bibliotecas que usamos (express, cors, pg)
├── tarefas.sql                    -> o script para criar as tabelas
├── utils/
│   └── db.js                      -> a ligação à base de dados (a pool)
├── routes/
│   ├── tarefas.js                 -> os caminhos das tarefas
│   ├── projetos.js                -> os caminhos dos projetos e membros
│   ├── utilizadores.js            -> os caminhos do registo e do login
│   └── subtarefas.js              -> os caminhos das subtarefas (checklist)
├── controllers/                   -> a logica (recebem o pedido e usam try/catch)
│   ├── tarefasController.js
│   ├── projetosController.js
│   ├── utilizadoresController.js
│   └── subtarefasController.js
├── model/                         -> a persistencia (as queries a base de dados)
│   ├── tarefasModel.js
│   ├── projetosModel.js
│   ├── utilizadoresModel.js
│   └── subtarefasModel.js
└── public/                        -> o frontend (a View)
    ├── index.html
    └── app.js
```

### A ideia do MVC (das aulas 7 e 8)

O pedido do utilizador segue sempre o mesmo caminho:

```
Browser  ->  index.js  ->  routes  ->  controllers  ->  model  ->  base de dados
```

- **index.js** liga o servidor e diz que cada grupo de caminhos vai para um ficheiro de rotas.
- **routes** só dizem "este endereço chama esta função".
- **controllers** têm a lógica. Usam `async/await` com `try { ... } catch { ... }` para tratar os erros, e chamam o **model**.
- **model** é a camada de **persistência**: é onde estão mesmo as queries à base de dados (SELECT, INSERT, UPDATE, DELETE).
- **utils/db.js** faz a ligação à base de dados (a *pool*), que o model usa.
- **public** é a **View** (o que se vê no browser).

---

## 2. As tabelas da base de dados

- **utilizadores** — `id`, `nome`, `email`, `password`
- **projetos** — `id`, `nome`, `descricao`, `criador_id` (quem criou o projeto)
- **projeto_membros** — junta os utilizadores aos projetos (`projeto_id`, `utilizador_id`)
- **tarefas** — `id`, `titulo`, `descricao`, `criador`, `responsavel`, `status`, `data_criacao`, `data_conclusao`, `link`, `projeto_id`
- **subtarefas** — `id`, `tarefa_id`, `descricao`, `concluida` (a checklist de cada tarefa)

Uma tarefa pertence a um projeto (`projeto_id`). Um projeto pode ter vários membros (tabela `projeto_membros`).

---

## 3. Divisão do trabalho (quem fez o quê)

Organizámos por **recurso**: cada pessoa fez o caminho completo do seu recurso — a **rota**, o **controller** e o **model** — e a parte do frontend correspondente. Cada ficheiro está identificado, no topo, com o nome de quem o fez.

| Pessoa | Responsável por | O que inclui |
|--------|-----------------|--------------|
| **Bruno** | Configuração + **Tarefas** + frontend | `index.js`, `utils/db.js`, `tarefas.sql`; tarefas (listar, criar, relatório, atualizar, apagar) em rota+controller+model; o quadro estilo Trello e a página inicial no frontend |
| **Diogo** | **Utilizadores** | registar, login, listar, gestão de conta e apagar utilizador (rota+controller+model); ecrãs de login/registo e "a minha conta" |
| **Nelson** | **Projetos e membros** | criar/listar/apagar projetos e listar/juntar/remover membros (rota+controller+model); ecrã dos projetos e o relatório |
| **Alexandre** | **Subtarefas** | listar, criar, marcar/desmarcar e apagar subtarefas (rota+controller+model); e a página "Estado da API" |

> O trabalho foi dividido de forma equilibrada por recurso, entre os quatro elementos da equipa.

---

## 4. Explicação ficheiro a ficheiro

### index.js (Bruno)
Importa o express, o cors e a ligação à base de dados. Cria a app, mete os middlewares (o `express.json` para ler o body em JSON e o nosso middleware que põe a `pool` dentro do `req`). Serve o frontend (a pasta `public`) e liga cada grupo de caminhos ao seu ficheiro de rotas. No fim arranca o servidor.

### utils/db.js (Bruno)
Cria a `pool` de ligações ao PostgreSQL com os dados de acesso (host, port, database, user, password). Faz `pool.connect()` para confirmar que a ligação funciona e exporta a `pool` para os outros ficheiros a usarem.

### routes/ (todos)
Cada ficheiro de rotas importa as funções do controller respetivo e diz qual o método (GET, POST, PATCH, DELETE) e o caminho que chama cada função.

### controllers/ (todos)
É onde estão as funções com as queries. Cada função recebe o `req` e o `res`, faz a query com `req.pool.query(...)` e devolve a resposta com `.then()` (sucesso) ou `.catch()` (erro), como aprendemos na Aula 8.

### public/index.html e public/app.js (todos)
O `index.html` tem o aspeto da página (feito com Bootstrap). O `app.js` fala com a API usando `fetch` e atualiza o ecrã. Usa modais do Bootstrap para os formulários e mensagens (em vez das janelas do browser) e tem um botão para mudar entre tema claro e escuro.

---

## 5. Os endereços da API

| Método | Endereço | O que faz |
|--------|----------|-----------|
| POST   | /utilizadores/registo | Regista um utilizador |
| POST   | /utilizadores/login | Faz login |
| GET    | /utilizadores | Lista os utilizadores |
| PATCH  | /utilizadores/:id | Atualiza a conta (nome, email, password) |
| DELETE | /utilizadores/:id | Apaga um utilizador |
| GET    | /projetos?utilizador_id=1 | Projetos de um utilizador |
| POST   | /projetos | Cria um projeto |
| GET    | /projetos/:id/membros | Membros de um projeto |
| POST   | /projetos/:id/membros | Junta um membro |
| DELETE | /projetos/:id/membros/:utilizadorId | Remove um membro (menos o criador) |
| DELETE | /projetos/:id | Apaga um projeto e as suas tarefas |
| GET    | /tarefas?projeto_id=1 | Tarefas de um projeto |
| POST   | /tarefas | Cria uma tarefa |
| GET    | /tarefas/relatorio?projeto_id=1 | Estatísticas do projeto |
| PATCH  | /tarefas/:id | Atualiza uma tarefa |
| DELETE | /tarefas/:id | Apaga uma tarefa |
| GET    | /subtarefas?tarefa_id=1 | Lista as subtarefas de uma tarefa |
| POST   | /subtarefas | Cria uma subtarefa |
| PATCH  | /subtarefas/:id | Marca/desmarca uma subtarefa |
| DELETE | /subtarefas/:id | Apaga uma subtarefa |

---

## 6. Como correr no nosso computador

O `tarefas.sql` deixa a base de dados pronta num só passo: cria as 5 tabelas e mete logo os dados de exemplo (utilizadores, o "Projeto Final" com membros, tarefas e subtarefas).

1. Ter o PostgreSQL instalado e criar uma base de dados chamada `taskflow`.
2. Correr o `tarefas.sql` dentro dessa base de dados:
   - no **pgAdmin**: botão direito na base `taskflow` → Query Tool → colar o `tarefas.sql` → F5;
   - ou no terminal: `psql -U postgres -d taskflow -f tarefas.sql`.
3. Em `utils/db.js` mudar a `password` para a do nosso PostgreSQL (por defeito está `a-tua-password`).
4. Abrir o terminal na pasta do projeto e correr:
   ```
   npm install
   npm start
   ```
5. Abrir o browser em **http://localhost:3000** e entrar com a conta de demonstração **`demo@taskflow.pt`** / **`1234`** (ou criar a tua em **Registar**). As contas da equipa (`bruno@taskflow.pt`, `diogo@taskflow.pt`, `nelson@taskflow.pt`, `alexandre@taskflow.pt`) usam a password `1234`.

---

## 7. PWA e logótipo

- O `public/logo.svg` é o nosso logótipo (sol + ondas do Algarve, o visto das tarefas e os parênteses `< >` de "programar para a web").
- A app é uma **PWA**: tem o `manifest.json`, o `sw.js` (service worker) e os ícones, por isso pode ser **instalada** no telemóvel ou no PC (no Chrome/Edge aparece o botão de instalar). A PWA só funciona em `https` ou em `localhost`.

## 8. Extras da app

- **Quadro estilo Trello**: as tarefas aparecem em 3 colunas (Por fazer, Em curso, Concluída) e podem ser **arrastadas** entre colunas para mudar o estado. Cartões com prazo passado mostram "⚠️ Atrasada".
- **Subtarefas (checklist)**: cada tarefa pode ter subtarefas; ao marcá-las como concluídas, o cartão mostra a **percentagem de conclusão** (barra de progresso).
- **Tarefas com link/anexo**: cada tarefa pode ter um link (ex: Google Drive, Figma) que aparece no cartão.
- **A minha conta** (botão 👤 na barra): cada utilizador pode mudar o nome, o email e a password.
- **Estado da API** (botão ⚙️ na barra): uma página que testa **todas** as rotas/controllers a sério. Cria um utilizador, um projeto e uma tarefa de teste, faz todas as operações (criar, listar, editar, apagar) e no fim apaga tudo, mostrando ✅ ou ❌ em cada endereço — sem deixar lixo na base de dados.
- **Barra de cima fixa** (fica sempre visível ao fazer scroll) e **rodapé** sempre em baixo.

---

## 9. Segurança

Cuidados que tivemos para a aplicação ser mais segura (com a matéria das aulas):

- **Injeção de SQL:** todas as queries usam *prepared statements* (`$1`, `$2`, …), por isso o que o utilizador escreve nunca é colado diretamente no SQL.
- **Passwords:** são guardadas com **hash** (sha256, do módulo nativo `crypto`), nunca em texto simples. As respostas da API também nunca devolvem a password.
- **XSS:** o texto do utilizador é "escapado" (função `escapar`) antes de aparecer no ecrã, e os links só são aceites se começarem por `http`.
- **Validação no servidor:** os campos obrigatórios são verificados nos controllers (não confiamos só no frontend).
- **Autorização:** só o criador pode apagar o projeto, e o criador não pode ser removido dos membros.
- **Erros:** o servidor responde com uma mensagem genérica em vez do erro técnico, para não revelar detalhes da base de dados.
