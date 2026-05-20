// Subtarefas (a checklist das tarefas) — Alexandre

const subtarefasModel = require('../model/subtarefasModel');

// vai buscar as subtarefas de uma tarefa
const listarSubtarefas = async (req, res) => {
    const tarefa_id = req.query.tarefa_id;
    try {
        const lista = await subtarefasModel.listarDaTarefa(tarefa_id);
        return res.send(lista);
    } catch (err) {
        return res.status(500).send('Ocorreu um erro no servidor');
    }
}

// cria uma subtarefa nova (comeca sempre por fazer)
const criarSubtarefa = async (req, res) => {
    const tarefa_id = req.body.tarefa_id;
    const descricao = req.body.descricao;

    // precisamos de saber a que tarefa pertence e o texto
    if (!tarefa_id || !descricao) {
        return res.status(400).send('Faltam campos obrigatorios na subtarefa');
    }

    try {
        const subtarefa = await subtarefasModel.criar(tarefa_id, descricao);
        return res.send(subtarefa);
    } catch (err) {
        return res.status(500).send('Ocorreu um erro no servidor');
    }
}

// muda o "concluida" da subtarefa (e o que faz a percentagem mexer)
const atualizarSubtarefa = async (req, res) => {
    const id = req.params.id;
    const concluida = req.body.concluida;
    try {
        const subtarefa = await subtarefasModel.atualizar(id, concluida);
        return res.send(subtarefa);
    } catch (err) {
        return res.status(500).send('Ocorreu um erro no servidor');
    }
}

// apaga a subtarefa
const apagarSubtarefa = async (req, res) => {
    const id = req.params.id;
    try {
        await subtarefasModel.apagar(id);
        return res.send('Subtarefa apagada');
    } catch (err) {
        return res.status(500).send('Ocorreu um erro no servidor');
    }
}

module.exports = {
    listarSubtarefas,
    criarSubtarefa,
    atualizarSubtarefa,
    apagarSubtarefa
}
