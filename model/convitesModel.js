// convites - model (Nelson)
// o lado de quem e' convidado: ver o convite pelo token e aceita-lo

const { pool } = require('../utils/db');

// vai buscar o convite pelo token (ja com o nome do projeto e de quem convidou)
async function buscarPorToken(token) {
    const resultado = await pool.query('SELECT convites.*, projetos.nome AS projeto_nome, utilizadores.nome AS criador_nome FROM convites JOIN projetos ON projetos.id = convites.projeto_id JOIN utilizadores ON utilizadores.id = convites.criador_id WHERE convites.token = $1', [token]);
    return resultado.rows[0];
}

// ve se o email do convite ja tem conta (para saber se mostra "registar" ou so "aceitar")
async function procurarEmail(email) {
    const resultado = await pool.query('SELECT id, nome, email FROM utilizadores WHERE email = $1', [email]);
    return resultado.rows[0];
}

// mete o convite como aceite
async function marcarAceite(token) {
    await pool.query('UPDATE convites SET status = $1 WHERE token = $2', ['aceite', token]);
}

module.exports = {
    buscarPorToken,
    procurarEmail,
    marcarAceite
};
