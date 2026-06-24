# TaskFlow — Apresentação do Projeto

**UC00605 — Programar para a web (server-side)**
Formador: Nuno Carapito · Equipa: Bruno, Diogo, Nelson e Alexandre

---

## 1. O que é o TaskFlow (em duas frases)

O TaskFlow é uma aplicação web de **gestão de tarefas em equipa**, no estilo do Trello. Cada utilizador cria conta e faz login, vê os **projetos** onde é membro e, dentro de cada projeto, organiza as **tarefas** num quadro com colunas (Por fazer, Em curso, Concluída), arrastando os cartões para mudar o estado. Cada tarefa pode ter **subtarefas** (checklist com percentagem) e há um **relatório** do projeto.

- **Online:** https://taskflow.algarit.pt
- **Código:** https://github.com/bmmcastro/taskflow
- **Login de demonstração:** `demo@taskflow.pt` / `1234`

---

## 2. Como foi feita (a abordagem)

**Backend em Node.js (Express)** com base de dados **PostgreSQL**, e **frontend em HTML + Bootstrap + JavaScript** que fala com a API por `fetch`.

Seguimos a arquitetura **MVC** (das aulas 7 e 8), separando o código em camadas com responsabilidades diferentes. O caminho de qualquer pedido é sempre o mesmo:

```
Browser  →  index.js  →  routes  →  controllers (try/catch)  →  model  →  PostgreSQL
```

- **routes/** — só dizem qual a função que responde a cada endereço (GET, POST, PATCH, DELETE).
- **controllers/** — a lógica: recebem o pedido, validam os campos e chamam o model. Têm `async/await` com `try/catch` para tratar os erros.
- **model/** — a camada de **persistência**: é a única que fala com a base de dados (os `SELECT`, `INSERT`, `UPDATE`, `DELETE`).
- **utils/db.js** — a ligação ao PostgreSQL (a *pool* de ligações).
- **public/** — o frontend (a *View*).

Dividimos o trabalho **por recurso** (tarefas, utilizadores, projetos, subtarefas) e cada um fez o caminho completo do seu recurso — rota, controller e model — mais a parte do frontend correspondente. Trabalhámos com **Git/GitHub** para juntar tudo.

---

## 3. As fases do projeto

**Fase 1 — Base e configuração (início de maio)**
Arranque do servidor em Express, a ligação à base de dados (`utils/db.js`) e o script `tarefas.sql` com as 5 tabelas. Ficou definida a estrutura em camadas (rotas → controllers → model).

**Fase 2 — Os recursos de contas e projetos (meados de maio)**
O recurso dos **utilizadores** (registo e login, com a password guardada em hash) e o recurso dos **projetos e membros** (criar projetos e juntar/remover pessoas).

**Fase 3 — Tarefas e subtarefas (fim de maio)**
O recurso central das **tarefas** (listar, criar, editar, apagar e mudar o estado) e as **subtarefas** (a checklist de cada tarefa, com percentagem de conclusão).

**Fase 4 — Frontend, quadro e design (final de maio / início de junho)**
A página inicial, a barra de navegação e o **quadro estilo Trello** com arrastar e largar (drag and drop). Depois o logótipo, o **tema claro/escuro** e a conversão em **PWA** (instalável no telemóvel, com manifest e service worker).

**Fase 5 — Relatório, testes, convites e publicação (junho)**
A página de **Estado da API** (testa todos os endpoints sem deixar lixo na base de dados), o **relatório** do projeto com estatísticas e os **convites por email** (o criador convida uma pessoa, que recebe um email com o link para aceitar). Por fim, a **publicação online** no cPanel (`taskflow.algarit.pt`) e os últimos ajustes (responsividade, acessibilidade e segurança).

---

## 4. Quem fez o quê

Cada ficheiro tem, no topo, o nome de quem o fez. A divisão por recurso:

| Pessoa | Recurso | O que inclui |
|--------|---------|--------------|
| **Bruno** | Configuração + **Tarefas** + frontend | arranque do servidor (`index.js`), a ligação à BD (`utils/db.js`) e o `tarefas.sql`; as tarefas (listar, criar, relatório, editar, apagar) em rota+controller+model; a página inicial, a navbar e o quadro Trello no frontend |
| **Diogo** | **Utilizadores** | registo, login, listar, gestão de conta e apagar utilizador (rota+controller+model); os ecrãs de login/registo e "a minha conta" |
| **Nelson** | **Projetos e membros** | criar/listar/apagar projetos e listar/juntar/remover membros (rota+controller+model); o ecrã dos projetos e o relatório |
| **Alexandre** | **Subtarefas** + Estado da API | listar, criar, marcar/desmarcar e apagar subtarefas (rota+controller+model); a página "Estado da API" |

> A funcionalidade dos **convites por email** foi feita pelos quatro em conjunto: o **Bruno** tratou do envio de email (`utils/email.js`, com nodemailer), da tabela `convites` e do ecrã de aceitar; o **Nelson** do endpoint de convidar (no recurso dos projetos) e do botão na janela dos membros; o **Diogo** do model dos convites; e o **Alexandre** do controller de aceitar o convite.

---

## 5. Funcionalidades principais (para demonstrar)

- **Contas e login** — registo, login e gestão de conta, com a password guardada em **hash sha256** (nunca em texto simples).
- **Projetos e equipas** — criar projetos e juntar/remover membros (o criador não pode ser removido).
- **Convites por email** — o criador convida uma pessoa por email; a pessoa recebe o link para aceitar (e registar, se ainda não tiver conta) e fica como membro.
- **Quadro estilo Trello** — 3 colunas por estado, com **arrastar e largar** para mudar o estado; aviso de tarefa atrasada.
- **Subtarefas** — checklist por tarefa com **percentagem de conclusão**.
- **Relatório do projeto** — total, concluídas, por estados e contagem por pessoa, com a **percentagem concluída**.
- **Responsivo e acessível** — funciona no telemóvel, tema claro/escuro, e é uma **PWA** instalável.

---

## 6. Segurança

- **Injeção de SQL:** todas as queries usam *prepared statements* (`$1`, `$2`, …).
- **Passwords:** guardadas com **hash** (sha256, do módulo nativo `crypto`); a API nunca devolve a password.
- **XSS:** o texto do utilizador é escapado no frontend antes de aparecer no ecrã.
- **Validação e autorização:** os campos são verificados no servidor; só o criador pode apagar o projeto.
- **Erros genéricos:** o servidor responde mensagens genéricas, sem revelar detalhes da base de dados.

---

## 7. Tecnologias

Node.js · Express · Cors · pg (PostgreSQL) · HTML · Bootstrap · JavaScript · `crypto` (hash).

---

## 8. Como testar (1 minuto)

1. Abrir **https://taskflow.algarit.pt**
2. Entrar com **`demo@taskflow.pt`** / **`1234`**
3. Abrir o **Projeto Final** → experimentar o quadro (arrastar cartões), as subtarefas, os membros e o relatório.

Para correr no nosso computador: criar uma base de dados `taskflow` no PostgreSQL, correr o `tarefas.sql`, mudar a password em `utils/db.js`, e fazer `npm install` + `npm start`.
