//Tarefas - model (Bruno)
//so trata da base de dados

const { pool } = require('../utils/db');

//tarefas do projeto, ja com a contagem das subtarefas (para a percentagem)
async function listarDoProjeto(projeto_id) {
    const resultado = await pool.query('SELECT t.*, (SELECT COUNT(*) FROM subtarefas s WHERE s.tarefa_id = t.id) AS total_sub, (SELECT COUNT(*) FROM subtarefas s WHERE s.tarefa_id = t.id AND s.concluida = true) AS concluidas_sub FROM tarefas t WHERE t.projeto_id = $1 ORDER BY t.id', [projeto_id]);
    return resultado.rows;
}

//mete a tarefa nova e devolve-a
async function criar(titulo, descricao, criador, responsavel, status, data_conclusao, link, projeto_id) {
    const resultado = await pool.query('INSERT INTO tarefas (titulo, descricao, criador, responsavel, status, data_conclusao, link, projeto_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *', [titulo, descricao, criador, responsavel, status, data_conclusao, link, projeto_id]);
    return resultado.rows[0];
}

//so as tarefas do projeto (para o relatorio)
async function listarParaRelatorio(projeto_id) {
    const resultado = await pool.query('SELECT * FROM tarefas WHERE projeto_id = $1', [projeto_id]);
    return resultado.rows;
}

//atualiza a tarefa
async function atualizar(id, titulo, descricao, responsavel, status, data_conclusao, link) {
    const resultado = await pool.query('UPDATE tarefas SET titulo = $1, descricao = $2, responsavel = $3, status = $4, data_conclusao = $5, link = $6 WHERE id = $7 RETURNING *', [titulo, descricao, responsavel, status, data_conclusao, link, id]);
    return resultado.rows[0];
}

//apaga a tarefa
async function apagar(id) {
    await pool.query('DELETE FROM tarefas WHERE id = $1', [id]);
}

module.exports = {
    listarDoProjeto,
    criar,
    listarParaRelatorio,
    atualizar,
    apagar
}
