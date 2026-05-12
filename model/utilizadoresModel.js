// Utilizadores - model (Diogo)
// Esta camada e' a unica que fala diretamente com a base de dados.

const { pool } = require('../utils/db');

// Vai buscar todos os utilizadores, mas sem a password (so o que precisamos de mostrar).
async function listarTodos() {
    const resultado = await pool.query('SELECT id, nome, email FROM utilizadores ORDER BY nome');
    return resultado.rows;
}

// Insere um utilizador novo e devolve os dados dele (outra vez sem a password).
async function criar(nome, email, password) {
    const resultado = await pool.query('INSERT INTO utilizadores (nome, email, password) VALUES ($1, $2, $3) RETURNING id, nome, email', [nome, email, password]);
    return resultado.rows[0];
}

// Procura um utilizador com este email e esta password. Se nao existir, devolve undefined.
async function procurarParaLogin(email, password) {
    const resultado = await pool.query('SELECT id, nome, email FROM utilizadores WHERE email = $1 AND password = $2', [email, password]);
    return resultado.rows[0];
}

// Atualiza so o nome e o email.
async function atualizar(id, nome, email) {
    const resultado = await pool.query('UPDATE utilizadores SET nome = $1, email = $2 WHERE id = $3 RETURNING id, nome, email', [nome, email, id]);
    return resultado.rows[0];
}

// Atualiza tambem a password (usado quando o utilizador escreve uma nova).
async function atualizarComPassword(id, nome, email, password) {
    const resultado = await pool.query('UPDATE utilizadores SET nome = $1, email = $2, password = $3 WHERE id = $4 RETURNING id, nome, email', [nome, email, password, id]);
    return resultado.rows[0];
}

// Apaga o utilizador. Primeiro tiramos-lhe a marca de criador e as participacoes em projetos,
// porque senao as chaves estrangeiras nao deixam apagar.
async function apagar(id) {
    await pool.query('UPDATE projetos SET criador_id = NULL WHERE criador_id = $1', [id]);
    await pool.query('DELETE FROM projeto_membros WHERE utilizador_id = $1', [id]);
    await pool.query('DELETE FROM utilizadores WHERE id = $1', [id]);
}

module.exports = {
    listarTodos,
    criar,
    procurarParaLogin,
    atualizar,
    atualizarComPassword,
    apagar
}
