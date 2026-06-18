-- equipa taskflow - script da base de dados
-- Bruno - criar todas as tabelas no pgAdmin (base de dados: taskflow)

-- apagamos primeiro as tabelas que dependem das outras
-- assim podemos correr este script as vezes que quisermos sem dar erro
DROP TABLE IF EXISTS subtarefas;
DROP TABLE IF EXISTS tarefas;
DROP TABLE IF EXISTS projeto_membros;
DROP TABLE IF EXISTS projetos;
DROP TABLE IF EXISTS utilizadores;


-- tabela dos utilizadores (para o registo e o login)
CREATE TABLE utilizadores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL
);


-- tabela dos projetos
CREATE TABLE projetos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255),
    criador_id INTEGER REFERENCES utilizadores(id)
);


-- tabela que junta os utilizadores aos projetos (os membros de cada projeto)
CREATE TABLE projeto_membros (
    id SERIAL PRIMARY KEY,
    projeto_id INTEGER REFERENCES projetos(id),
    utilizador_id INTEGER REFERENCES utilizadores(id)
);


-- tabela das tarefas (cada tarefa pertence a um projeto)
CREATE TABLE tarefas (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descricao VARCHAR(255),
    criador VARCHAR(50),
    responsavel VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Por fazer',
    data_criacao DATE DEFAULT CURRENT_DATE,
    data_conclusao DATE,
    link VARCHAR(255),
    projeto_id INTEGER REFERENCES projetos(id)
);


-- tabela das subtarefas (a checklist de cada tarefa)
-- o ON DELETE CASCADE faz com que sejam apagadas quando a tarefa e' apagada
CREATE TABLE subtarefas (
    id SERIAL PRIMARY KEY,
    tarefa_id INTEGER REFERENCES tarefas(id) ON DELETE CASCADE,
    descricao VARCHAR(255) NOT NULL,
    concluida BOOLEAN DEFAULT false
);


-- ===== dados de exemplo para podermos testar =====

-- contas da equipa (as passwords sao guardadas com hash sha256, nunca em texto simples)
INSERT INTO utilizadores (nome, email, password) VALUES ('Bruno', 'bruno@taskflow.pt', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92');
INSERT INTO utilizadores (nome, email, password) VALUES ('Diogo', 'diogo@taskflow.pt', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92');
INSERT INTO utilizadores (nome, email, password) VALUES ('Nelson', 'nelson@taskflow.pt', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92');
INSERT INTO utilizadores (nome, email, password) VALUES ('Alexandre', 'alexandre@taskflow.pt', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92');
-- conta de demonstracao para experimentar a app (demo@taskflow.pt / 1234)
INSERT INTO utilizadores (nome, email, password) VALUES ('Demo', 'demo@taskflow.pt', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4');

-- um projeto de exemplo
INSERT INTO projetos (nome, descricao, criador_id) VALUES ('Projeto Final', 'O nosso trabalho de fim de curso', 1);

-- juntar a equipa e a conta demo ao projeto (id 1) como membros
INSERT INTO projeto_membros (projeto_id, utilizador_id) VALUES (1, 1);
INSERT INTO projeto_membros (projeto_id, utilizador_id) VALUES (1, 2);
INSERT INTO projeto_membros (projeto_id, utilizador_id) VALUES (1, 3);
INSERT INTO projeto_membros (projeto_id, utilizador_id) VALUES (1, 4);
INSERT INTO projeto_membros (projeto_id, utilizador_id) VALUES (1, 5);

-- as tarefas reais do projeto, com o responsavel a dizer quem fez mesmo cada parte
-- dividido por recurso: tarefas, utilizadores, projetos e subtarefas
INSERT INTO tarefas (titulo, descricao, criador, responsavel, status, data_conclusao, projeto_id)
VALUES ('Configuracao e base de dados', 'arranque do servidor, ligacao ao PostgreSQL e estrutura MVC', 'bruno', 'bruno', 'Concluída', '2026-05-12', 1);
INSERT INTO tarefas (titulo, descricao, criador, responsavel, status, data_conclusao, projeto_id)
VALUES ('Recurso das tarefas (API)', 'rota, controller e model das tarefas: listar, criar, editar e apagar', 'bruno', 'bruno', 'Concluída', '2026-05-20', 1);
INSERT INTO tarefas (titulo, descricao, criador, responsavel, status, data_conclusao, projeto_id)
VALUES ('Utilizadores: registo e login', 'criar conta, entrar e gerir a conta (rota, controller e model)', 'bruno', 'diogo', 'Concluída', '2026-05-18', 1);
INSERT INTO tarefas (titulo, descricao, criador, responsavel, status, data_conclusao, projeto_id)
VALUES ('Projetos e membros', 'criar projetos e gerir quem pertence a cada um', 'bruno', 'nelson', 'Concluída', '2026-05-22', 1);
INSERT INTO tarefas (titulo, descricao, criador, responsavel, status, data_conclusao, projeto_id)
VALUES ('Relatorio do projeto', 'estatisticas e contagem de tarefas por pessoa', 'bruno', 'nelson', 'Concluída', '2026-05-28', 1);
INSERT INTO tarefas (titulo, descricao, criador, responsavel, status, data_conclusao, projeto_id)
VALUES ('Subtarefas (checklist)', 'rota, controller e model das subtarefas, com percentagem', 'bruno', 'alexandre', 'Concluída', '2026-05-26', 1);
INSERT INTO tarefas (titulo, descricao, criador, responsavel, status, data_conclusao, projeto_id)
VALUES ('Frontend: pagina inicial e quadro Trello', 'ecra inicial, navbar sempre visivel e quadro com colunas e arrastar', 'bruno', 'bruno', 'Concluída', '2026-06-01', 1);
INSERT INTO tarefas (titulo, descricao, criador, responsavel, status, data_conclusao, projeto_id)
VALUES ('Pagina Estado da API', 'pagina que testa todos os endpoints e mostra ok/erro sem deixar lixo', 'bruno', 'alexandre', 'Concluída', '2026-06-03', 1);
INSERT INTO tarefas (titulo, descricao, criador, responsavel, status, data_conclusao, projeto_id)
VALUES ('Design, tema e PWA', 'logotipo, tema claro/escuro, responsivo e app instalavel', 'bruno', 'bruno', 'Em curso', '2026-06-12', 1);
INSERT INTO tarefas (titulo, descricao, criador, responsavel, status, data_conclusao, projeto_id)
VALUES ('Publicar no cPanel', 'por o projeto online em taskflow.algarit.pt', 'bruno', 'bruno', 'Por fazer', '2026-06-20', 1);


-- subtarefas (checklist) de cada tarefa

-- tarefa 1: Configuracao e base de dados - bruno (concluida)
INSERT INTO subtarefas (tarefa_id, descricao, concluida) VALUES (1, 'Criar as tabelas no pgAdmin', true);
INSERT INTO subtarefas (tarefa_id, descricao, concluida) VALUES (1, 'Ligacao a base de dados (pool)', true);
INSERT INTO subtarefas (tarefa_id, descricao, concluida) VALUES (1, 'Separar em routes, controllers e model (MVC)', true);

-- tarefa 2: Recurso das tarefas - bruno (concluida)
INSERT INTO subtarefas (tarefa_id, descricao, concluida) VALUES (2, 'Listar e criar tarefas', true);
INSERT INTO subtarefas (tarefa_id, descricao, concluida) VALUES (2, 'Editar e mudar o estado', true);
INSERT INTO subtarefas (tarefa_id, descricao, concluida) VALUES (2, 'Apagar tarefa', true);

-- tarefa 3: Utilizadores - diogo (concluida)
INSERT INTO subtarefas (tarefa_id, descricao, concluida) VALUES (3, 'Tabela utilizadores', true);
INSERT INTO subtarefas (tarefa_id, descricao, concluida) VALUES (3, 'Endpoint de registo', true);
INSERT INTO subtarefas (tarefa_id, descricao, concluida) VALUES (3, 'Endpoint de login', true);
INSERT INTO subtarefas (tarefa_id, descricao, concluida) VALUES (3, 'Ecra de login, registo e a minha conta', true);

-- tarefa 4: Projetos e membros - nelson (concluida)
INSERT INTO subtarefas (tarefa_id, descricao, concluida) VALUES (4, 'Criar e listar projetos', true);
INSERT INTO subtarefas (tarefa_id, descricao, concluida) VALUES (4, 'Juntar membros ao projeto', true);
INSERT INTO subtarefas (tarefa_id, descricao, concluida) VALUES (4, 'Remover membros (menos o criador)', true);

-- tarefa 5: Relatorio - nelson (concluida)
INSERT INTO subtarefas (tarefa_id, descricao, concluida) VALUES (5, 'Contar tarefas e concluidas', true);
INSERT INTO subtarefas (tarefa_id, descricao, concluida) VALUES (5, 'Contagem por pessoa', true);
INSERT INTO subtarefas (tarefa_id, descricao, concluida) VALUES (5, 'Mostrar o relatorio num modal', true);

-- tarefa 6: Subtarefas - alexandre (concluida)
INSERT INTO subtarefas (tarefa_id, descricao, concluida) VALUES (6, 'Tabela subtarefas', true);
INSERT INTO subtarefas (tarefa_id, descricao, concluida) VALUES (6, 'Marcar e desmarcar como concluida', true);
INSERT INTO subtarefas (tarefa_id, descricao, concluida) VALUES (6, 'Percentagem na carta da tarefa', true);

-- tarefa 7: Frontend pagina inicial e quadro Trello - bruno (concluida)
INSERT INTO subtarefas (tarefa_id, descricao, concluida) VALUES (7, 'Navbar sempre visivel e pagina inicial', true);
INSERT INTO subtarefas (tarefa_id, descricao, concluida) VALUES (7, 'Tres colunas por estado', true);
INSERT INTO subtarefas (tarefa_id, descricao, concluida) VALUES (7, 'Arrastar e largar os cartoes', true);
INSERT INTO subtarefas (tarefa_id, descricao, concluida) VALUES (7, 'Aviso de tarefa atrasada', true);

-- tarefa 8: Pagina Estado da API - alexandre (concluida)
INSERT INTO subtarefas (tarefa_id, descricao, concluida) VALUES (8, 'Testar os GET de todos os recursos', true);
INSERT INTO subtarefas (tarefa_id, descricao, concluida) VALUES (8, 'Testar criar, editar e apagar', true);
INSERT INTO subtarefas (tarefa_id, descricao, concluida) VALUES (8, 'Apagar os dados de teste no fim', true);
INSERT INTO subtarefas (tarefa_id, descricao, concluida) VALUES (8, 'Visualizacao do estado na pagina Sobre', true);

-- tarefa 9: Design, tema e PWA - bruno (em curso)
INSERT INTO subtarefas (tarefa_id, descricao, concluida) VALUES (9, 'Tema claro e escuro', true);
INSERT INTO subtarefas (tarefa_id, descricao, concluida) VALUES (9, 'Logotipo do TaskFlow', true);
INSERT INTO subtarefas (tarefa_id, descricao, concluida) VALUES (9, 'Manifest e service worker (PWA)', true);
INSERT INTO subtarefas (tarefa_id, descricao, concluida) VALUES (9, 'Icones da PWA em PNG', false);

-- tarefa 10: Publicar no cPanel - bruno (por fazer)
INSERT INTO subtarefas (tarefa_id, descricao, concluida) VALUES (10, 'Criar a base de dados no cPanel', false);
INSERT INTO subtarefas (tarefa_id, descricao, concluida) VALUES (10, 'Correr o script SQL', false);
INSERT INTO subtarefas (tarefa_id, descricao, concluida) VALUES (10, 'Configurar a aplicacao Node.js', false);
INSERT INTO subtarefas (tarefa_id, descricao, concluida) VALUES (10, 'Ativar o SSL (https)', false);
