//Tarefas - Bruno
//recebe os pedidos das tarefas e chama o model

const tarefasModel = require('../model/tarefasModel');

//devolve as tarefas do projeto
const listarTarefas = async (req, res) => {
    const projeto_id = req.query.projeto_id;
    try {
        const lista = await tarefasModel.listarDoProjeto(projeto_id);
        return res.send(lista);
    } catch (err) {
        return res.status(500).send('Ocorreu um erro no servidor');
    }
}

//cria uma tarefa nova no projeto
const criarTarefa = async (req, res) => {
    const titulo = req.body.titulo;
    const descricao = req.body.descricao;
    const criador = req.body.criador;
    const responsavel = req.body.responsavel;
    const status = req.body.status;
    const data_conclusao = req.body.data_conclusao;
    const link = req.body.link;
    const projeto_id = req.body.projeto_id;

    //sem estes campos nem vale a pena ir a base de dados
    if (!titulo || !responsavel || !data_conclusao || !projeto_id) {
        return res.status(400).send('Faltam campos obrigatorios na tarefa');
    }

    try {
        const tarefa = await tarefasModel.criar(titulo, descricao, criador, responsavel, status, data_conclusao, link, projeto_id);
        return res.send(tarefa);
    } catch (err) {
        return res.status(500).send('Ocorreu um erro no servidor');
    }
}

//faz as contas do relatorio: total, concluidas e por pessoa
const relatorio = async (req, res) => {
    const projeto_id = req.query.projeto_id;
    try {
        const tarefas = await tarefasModel.listarParaRelatorio(projeto_id);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        let total = tarefas.length;
        let concluidas = 0;
        let emCurso = 0;
        let porFazer = 0;
        let atrasadas = 0;
        const porPessoa = {};

        tarefas.forEach(t => {
            if (t.status === 'Concluída') {
                concluidas++;
            } else if (t.status === 'Em curso') {
                emCurso++;
            } else {
                porFazer++;
            }
            //tarefa atrasada: ainda nao esta concluida e ja passou o prazo
            if (t.status !== 'Concluída' && t.data_conclusao && new Date(t.data_conclusao) < hoje) {
                atrasadas++;
            }
            porPessoa[t.responsavel] = (porPessoa[t.responsavel] || 0) + 1;
        });

        //percentagem do projeto que ja esta concluida
        const percentagem = total > 0 ? Math.round((concluidas / total) * 100) : 0;

        return res.send({ total, concluidas, emCurso, porFazer, atrasadas, percentagem, porPessoa });
    } catch (err) {
        return res.status(500).send('Ocorreu um erro no servidor');
    }
}

//guarda as alteracoes da tarefa
const atualizarTarefa = async (req, res) => {
    const id = req.params.id;
    const titulo = req.body.titulo;
    const descricao = req.body.descricao;
    const responsavel = req.body.responsavel;
    const status = req.body.status;
    const data_conclusao = req.body.data_conclusao;
    const link = req.body.link;

    if (!titulo || !responsavel || !data_conclusao) {
        return res.status(400).send('Faltam campos obrigatorios na tarefa');
    }

    try {
        const tarefa = await tarefasModel.atualizar(id, titulo, descricao, responsavel, status, data_conclusao, link);
        return res.send(tarefa);
    } catch (err) {
        return res.status(500).send('Ocorreu um erro no servidor');
    }
}

//apaga a tarefa pelo id
const apagarTarefa = async (req, res) => {
    const id = req.params.id;
    try {
        await tarefasModel.apagar(id);
        return res.send('Tarefa apagada com sucesso');
    } catch (err) {
        return res.status(500).send('Ocorreu um erro no servidor');
    }
}

module.exports = {
    listarTarefas,
    criarTarefa,
    relatorio,
    atualizarTarefa,
    apagarTarefa
}
