// projetos - model (Nelson)

const { pool } = require('../utils/db');

// projetos onde o user entra (junta projetos com a tabela dos membros)
async function listarDoUtilizador(utilizador_id) {
    const resultado = await pool.query('SELECT projetos.* FROM projetos JOIN projeto_membros ON projetos.id = projeto_membros.projeto_id WHERE projeto_membros.utilizador_id = $1 ORDER BY projetos.id', [utilizador_id]);
    return resultado.rows;
}

// cria o projeto e mete logo o criador na tabela dos membros
async function criar(nome, descricao, utilizador_id) {
    const resultado = await pool.query('INSERT INTO projetos (nome, descricao, criador_id) VALUES ($1, $2, $3) RETURNING *', [nome, descricao, utilizador_id]);
    const projeto = resultado.rows[0];
    await pool.query('INSERT INTO projeto_membros (projeto_id, utilizador_id) VALUES ($1, $2)', [projeto.id, utilizador_id]);
    return projeto;
}

// membros do projeto (o campo "criador" diz quem o criou)
async function listarMembros(projeto_id) {
    const resultado = await pool.query('SELECT utilizadores.id, utilizadores.nome, utilizadores.email, (utilizadores.id = projetos.criador_id) AS criador FROM utilizadores JOIN projeto_membros ON utilizadores.id = projeto_membros.utilizador_id JOIN projetos ON projetos.id = projeto_membros.projeto_id WHERE projeto_membros.projeto_id = $1 ORDER BY criador DESC, utilizadores.nome', [projeto_id]);
    return resultado.rows;
}

// junta a pessoa (o NOT EXISTS evita repetir)
async function juntarMembro(projeto_id, utilizador_id) {
    await pool.query('INSERT INTO projeto_membros (projeto_id, utilizador_id) SELECT $1, $2 WHERE NOT EXISTS (SELECT 1 FROM projeto_membros WHERE projeto_id = $1 AND utilizador_id = $2)', [projeto_id, utilizador_id]);
}

// tira a pessoa do projeto
async function removerMembro(projeto_id, utilizador_id) {
    await pool.query('DELETE FROM projeto_membros WHERE projeto_id = $1 AND utilizador_id = $2', [projeto_id, utilizador_id]);
}

// devolve quem criou o projeto
async function procurarCriador(projeto_id) {
    const resultado = await pool.query('SELECT criador_id FROM projetos WHERE id = $1', [projeto_id]);
    return resultado.rows[0] ? resultado.rows[0].criador_id : null;
}

// devolve o email de quem criou o projeto (para mandar a confirmacao do convite)
async function procurarEmailCriador(projeto_id) {
    const resultado = await pool.query('SELECT utilizadores.email FROM utilizadores JOIN projetos ON projetos.criador_id = utilizadores.id WHERE projetos.id = $1', [projeto_id]);
    return resultado.rows[0] ? resultado.rows[0].email : null;
}

// apaga tudo do projeto: convites, tarefas, membros e o projeto
async function apagar(projeto_id) {
    await pool.query('DELETE FROM convites WHERE projeto_id = $1', [projeto_id]);
    await pool.query('DELETE FROM tarefas WHERE projeto_id = $1', [projeto_id]);
    await pool.query('DELETE FROM projeto_membros WHERE projeto_id = $1', [projeto_id]);
    await pool.query('DELETE FROM projetos WHERE id = $1', [projeto_id]);
}

// ---- convites por email (Nelson) ----

// cria o registo do convite na base de dados
async function criarConvite(projeto_id, criador_id, email_convidado, token) {
    await pool.query('INSERT INTO convites (projeto_id, criador_id, email_convidado, token) VALUES ($1, $2, $3, $4)', [projeto_id, criador_id, email_convidado, token]);
}

// os convites pendentes do projeto (para mostrar na janela dos membros)
async function convitesDoProjeto(projeto_id) {
    const resultado = await pool.query('SELECT email_convidado, data_criacao FROM convites WHERE projeto_id = $1 AND status = $2 ORDER BY data_criacao DESC', [projeto_id, 'pendente']);
    return resultado.rows;
}

module.exports = {
    listarDoUtilizador,
    criar,
    listarMembros,
    juntarMembro,
    removerMembro,
    procurarCriador,
    procurarEmailCriador,
    apagar,
    criarConvite,
    convitesDoProjeto
}
