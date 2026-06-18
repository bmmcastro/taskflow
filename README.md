# TaskFlow

Aplicação web de gestão de tarefas em equipa, estilo Trello. Cada utilizador faz login, vê os projetos onde é membro e organiza as tarefas num quadro com colunas (arrastando os cartões para mudar o estado). Cada tarefa pode ter subtarefas (checklist) e há um relatório do projeto.

Projeto final da UC **UC00605 — Programar para a web (server-side)**.
Formador: Nuno Carapito.

Online: https://taskflow.algarit.pt

## Equipa e divisão do trabalho

Dividimos por recurso — cada um fez a rota, o controller e o model do seu recurso, mais a parte do frontend correspondente. Cada ficheiro tem, no topo, o nome de quem o fez.

| Pessoa | Responsável por |
|--------|-----------------|
| Bruno | Configuração e base de dados, recurso das **Tarefas** e o frontend (página inicial e quadro Trello) |
| Diogo | **Utilizadores**: registo, login e gestão de conta |
| Nelson | **Projetos e membros** e o relatório do projeto |
| Alexandre | **Subtarefas** (checklist) e a página "Estado da API" |

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

Node.js, Express, Cors, pg, PostgreSQL, HTML, Bootstrap e JavaScript.

## Como correr

1. Instalar o PostgreSQL e criar uma base de dados chamada `taskflow`.
2. Correr o `tarefas.sql` para criar as tabelas e os dados de exemplo.
3. Em `utils/db.js` mudar a `password` para a do nosso PostgreSQL.
4. No terminal, dentro da pasta do projeto:
   ```
   npm install
   npm start
   ```
5. Abrir o browser em http://localhost:3000 e entrar com a conta de demonstração `demo@taskflow.pt` / `1234` (ou criar a tua em **Registar**).
