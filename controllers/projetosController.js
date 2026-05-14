// projetos e membros (Nelson)

const projetosModel = require('../model/projetosModel');

// projetos onde o user e membro
const listarProjetos = async (req, res) => {
    const utilizador_id = req.query.utilizador_id;
    try {
        const lista = await projetosModel.listarDoUtilizador(utilizador_id);
        return res.send(lista);
    } catch (err) {
        return res.status(500).send('Ocorreu um erro no servidor');
    }
}

// cria o projeto (e mete logo o criador como membro)
const criarProjeto = async (req, res) => {
    const nome = req.body.nome;
    const descricao = req.body.descricao;
    const utilizador_id = req.body.utilizador_id;

    if (!nome || !utilizador_id) {
        return res.status(400).send('Falta o nome do projeto');
    }

    try {
        const projeto = await projetosModel.criar(nome, descricao, utilizador_id);
        return res.send(projeto);
    } catch (err) {
        return res.status(500).send('Ocorreu um erro no servidor');
    }
}

// lista os membros do projeto
const listarMembros = async (req, res) => {
    const projeto_id = req.params.id;
    try {
        const membros = await projetosModel.listarMembros(projeto_id);
        return res.send(membros);
    } catch (err) {
        return res.status(500).send('Ocorreu um erro no servidor');
    }
}

// junta uma pessoa ao projeto
const juntarMembro = async (req, res) => {
    const projeto_id = req.params.id;
    const utilizador_id = req.body.utilizador_id;

    if (!utilizador_id) {
        return res.status(400).send('Falta o utilizador a juntar');
    }

    try {
        await projetosModel.juntarMembro(projeto_id, utilizador_id);
        return res.send('Membro adicionado ao projeto');
    } catch (err) {
        return res.status(500).send('Ocorreu um erro no servidor');
    }
}

// tira um membro. o criador nao se pode tirar
const removerMembro = async (req, res) => {
    const projeto_id = req.params.id;
    const utilizador_id = req.params.utilizadorId;

    try {
        const criador = await projetosModel.procurarCriador(projeto_id);
        if (String(criador) === String(utilizador_id)) {
            return res.status(400).send('Nao se pode remover o criador do projeto');
        }
        await projetosModel.removerMembro(projeto_id, utilizador_id);
        return res.send('Membro removido do projeto');
    } catch (err) {
        return res.status(500).send('Ocorreu um erro no servidor');
    }
}

// apaga o projeto. so o criador e que pode
const apagarProjeto = async (req, res) => {
    const id = req.params.id;
    const utilizador_id = req.query.utilizador_id;

    try {
        const criador = await projetosModel.procurarCriador(id);
        if (String(criador) !== String(utilizador_id)) {
            return res.status(403).send('So o criador pode apagar o projeto');
        }
        await projetosModel.apagar(id);
        return res.send('Projeto apagado com sucesso');
    } catch (err) {
        return res.status(500).send('Ocorreu um erro no servidor');
    }
}

module.exports = {
    listarProjetos,
    criarProjeto,
    listarMembros,
    juntarMembro,
    removerMembro,
    apagarProjeto
}
