# TaskFlow — Relatório do Projeto

**Disciplina:** UC00605 - Programar para a web, na vertente servidor (server-side)
**Formador:** Nuno Carapito
**Equipa:** Bruno, Diogo, Nelson e Alexandre

---

## O projeto

O TaskFlow é uma aplicação de gestão de tarefas em equipa, no estilo do Trello.
Tem registo e login, projetos com membros, um quadro de tarefas com colunas por estado
(arrastar para mudar o estado), subtarefas com percentagem de conclusão, relatórios e
tema claro/escuro.

Foi feito em **Node.js (Express)** com base de dados **PostgreSQL** no backend, e
**HTML + Bootstrap + JavaScript** no frontend, seguindo a estrutura **MVC**: cada pedido
passa pelas **rotas**, vai ao **controller** (com try/catch) e este chama o **model**
(a camada de persistência que faz as queries). A *View* é o frontend.

Dividimos o trabalho por **recurso**: cada um fez a rota, o controller e o model do seu
recurso, mais a parte do frontend correspondente.

---

## O que cada um fez

### Bruno 
- Configuração inicial (`index.js`, ligação à base de dados em `utils/db.js`) e todo o script SQL.
- **Tarefas** (rota + controller + model): listar, criar, relatório, atualizar e apagar.
- No frontend: a página inicial e o quadro estilo Trello (arrastar e largar).
- **Convites** (com a equipa): o envio de email (`utils/email.js`, com nodemailer), a tabela `convites` e o ecrã de aceitar o convite.

### Diogo
- **Utilizadores** (rota + controller + model): registar, login, listar, gestão de conta e apagar.
- No frontend: os ecrãs de login/registo e a janela "A minha conta".
- **Convites** (com a equipa): o model dos convites (ir buscar pelo token e ver se o email já tem conta).

### Nelson
- **Projetos e membros** (rota + controller + model): criar, listar e apagar projetos; listar, juntar e remover membros (o criador não pode ser removido).
- No frontend: o ecrã dos projetos e o relatório.
- **Convites** (com a equipa): o endpoint de convidar por email (no recurso dos projetos) e o botão na janela dos membros.

### Alexandre
- **Subtarefas** (rota + controller + model): listar, criar, marcar/desmarcar e apagar.
- A página **"Estado da API"** que testa todas as rotas.
- **Convites** (com a equipa): o controller de aceitar o convite (ver pelo token + aceitar, ficando a pessoa como membro).

---

## Tecnologias usadas

Node.js, Express, Cors, Pg (PostgreSQL), HTML, Bootstrap e JavaScript.

A divisão completa, função a função, está no ficheiro `DOCUMENTACAO.md`.
