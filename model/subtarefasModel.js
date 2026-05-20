// Subtarefas - model — Alexandre
// e' aqui que mexemos mesmo na tabela das subtarefas

const { pool } = require('../utils/db');

// todas as subtarefas de uma tarefa, por ordem
async function listarDaTarefa(tarefa_id) {
    const resultado = await pool.query('SELECT * FROM subtarefas WHERE tarefa_id = $1 ORDER BY id', [tarefa_id]);
    return resultado.rows;
}

// cria a subtarefa — o concluida fica logo a false
async function criar(tarefa_id, descricao) {
    const resultado = await pool.query('INSERT INTO subtarefas (tarefa_id, descricao, concluida) VALUES ($1, $2, false) RETURNING *', [tarefa_id, descricao]);
    return resultado.rows[0];
}

// liga/desliga o concluida
async function atualizar(id, concluida) {
    const resultado = await pool.query('UPDATE subtarefas SET concluida = $1 WHERE id = $2 RETURNING *', [concluida, id]);
    return resultado.rows[0];
}

// apaga a subtarefa
async function apagar(id) {
    await pool.query('DELETE FROM subtarefas WHERE id = $1', [id]);
}

module.exports = {
    listarDaTarefa,
    criar,
    atualizar,
    apagar
}
