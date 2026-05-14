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

// apaga tudo do projeto: tarefas, membros e o projeto
async function apagar(projeto_id) {
    await pool.query('DELETE FROM tarefas WHERE projeto_id = $1', [projeto_id]);
    await pool.query('DELETE FROM projeto_membros WHERE projeto_id = $1', [projeto_id]);
    await pool.query('DELETE FROM projetos WHERE id = $1', [projeto_id]);
}

module.exports = {
    listarDoUtilizador,
    criar,
    listarMembros,
    juntarMembro,
    removerMembro,
    procurarCriador,
    apagar
}
