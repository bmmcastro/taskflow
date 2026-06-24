# TaskFlow

Aplicação web de gestão de tarefas em equipa, estilo Trello. Cada utilizador faz login, vê os projetos onde é membro e organiza as tarefas num quadro com colunas (arrastando os cartões para mudar o estado). Cada tarefa pode ter subtarefas (checklist) e há um relatório do projeto.

Projeto final da UC **UC00605 — Programar para a web (server-side)**.
Formador: Nuno Carapito.

Online: https://taskflow.algarit.pt
Código: https://github.com/bmmcastro/taskflow
Login de demonstração: `demo@taskflow.pt` / `1234`

## Equipa e divisão do trabalho

Dividimos por recurso — cada um fez a rota, o controller e o model do seu recurso, mais a parte do frontend correspondente. Cada ficheiro tem, no topo, o nome de quem o fez.

| Pessoa | Responsável por |
|--------|-----------------|
| Bruno | Configuração e base de dados, recurso das **Tarefas** e o frontend (página inicial e quadro Trello) |
| Diogo | **Utilizadores**: registo, login e gestão de conta |
| Nelson | **Projetos e membros** e o relatório do projeto |
| Alexandre | **Subtarefas** (checklist) e a página "Estado da API" |

A funcionalidade dos **convites por email** foi feita pelos quatro em conjunto (envio de email, endpoint de convidar, model e controller de aceitar, e o ecrã de aceitação).

## Como está organizado (MVC)

```
Browser  ->  index.js  ->  routes  ->  controllers  ->  model  ->  base de dados
```

- `routes/` — dizem qual a função que responde a cada endereço
- `controllers/` — a lógica, com `async/await` e `try/catch`
- `model/` — a persistência (as queries à base de dados)
- `utils/db.js` — a ligação ao PostgreSQL (a pool)
- `public/` — o frontend (HTML, Bootstrap e JavaScript)

## Tecnologias

Node.js, Express, Cors, pg, PostgreSQL, HTML, Bootstrap e JavaScript e nodemailer (envio de emails).

## Como testar a app (passo a passo)

O ficheiro **`tarefas.sql`** deixa a base de dados pronta num só passo: cria as 5 tabelas e mete logo os dados de exemplo (5 utilizadores, o projeto "Projeto Final" com membros, 10 tarefas e as respetivas subtarefas). Por isso, depois de montar a BD, a app já vem com conteúdo para testar.

**1. Base de dados (uma vez só)**
- Instalar o PostgreSQL e criar uma base de dados chamada `taskflow`.
- Correr o `tarefas.sql` dentro dessa base:
  - no **pgAdmin**: botão direito na base `taskflow` → Query Tool → colar o `tarefas.sql` → F5;
  - ou no terminal: `psql -U postgres -d taskflow -f tarefas.sql`.

**2. Ligação à base de dados**
- Abrir `utils/db.js` e mudar a `password` para a do seu PostgreSQL (por defeito está `a-tua-password`).

**3. Arrancar com o servidor**
- No terminal, dentro da pasta do projeto:
  ```
  npm install
  npm start
  ```

**4. Abrir no browser**
- Ir a http://localhost:3000 e entrar com a conta de demonstração **`demo@taskflow.pt`** / **`1234`**
  (ou criar uma conta nova em **Registar**).

Depois de entrar: abrir o "Projeto Final" e testar o quadro (arrastar cartões entre colunas), as subtarefas (checklist), os membros e o relatório do projeto. As contas da equipa (`bruno@taskflow.pt`, `diogo@taskflow.pt`, `nelson@taskflow.pt`, `alexandre@taskflow.pt`) usam a password `1234`.

