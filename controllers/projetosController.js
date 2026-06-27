// projetos e membros (Nelson)

const crypto = require('crypto');
const projetosModel = require('../model/projetosModel');
const { enviarEmail } = require('../utils/email');

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

// o criador convida uma pessoa por email para o projeto
const convidar = async (req, res) => {
    const projeto_id = req.params.id;
    const email_convidado = (req.body.email || '').trim().toLowerCase();
    const criador_id = req.body.criador_id;

    //so o criador e que pode convidar
    const criador = await projetosModel.procurarCriador(projeto_id);
    if (String(criador) !== String(criador_id)) {
        return res.status(403).send('So o criador pode convidar');
    }

    //validar o email (tem de ter @ e um ponto)
    if (!email_convidado || email_convidado.indexOf('@') === -1 || email_convidado.indexOf('.') === -1) {
        return res.status(400).send('Email invalido');
    }

    try {
        //token unico para o convite (para o link de aceitar)
        const token = crypto.randomBytes(24).toString('hex');
        await projetosModel.criarConvite(projeto_id, criador_id, email_convidado, token);

        //so mandamos os emails de verdade (enviar_email pode ser false para os testes da API)
        if (req.body.enviar_email !== false) {
            //o endereco de aceitar (no servidor e https://taskflow.algarit.pt)
            const base = 'https://taskflow.algarit.pt';
            const link = base + '/#convite/' + token;

            //email para a pessoa convidada
            await enviarEmail(
                email_convidado,
                'Foste convidado para um projeto no TaskFlow',
                'Ola!\n\nFoste convidado para um projeto no TaskFlow. Para aceitar, abre este link:\n' + link + '\n\nSe ainda nao tens conta, o link ajuda-te a registar.\n\nEquipa TaskFlow'
            );

            //email para o criador a confirmar que convidou
            const dono = await projetosModel.procurarEmailCriador(projeto_id);
            if (dono) {
                await enviarEmail(
                    dono,
                    'Convite enviado no TaskFlow',
                    'Ola!\n\nConvidaste ' + email_convidado + ' para o teu projeto no TaskFlow.\nQuando a pessoa aceitar, fica automaticamente como membro.\n\nEquipa TaskFlow'
                );
            }
        }

        //devolvemos o token (assim o criador pode copiar o link a mao e a pagina de testes consegue encadear)
        return res.send({ mensagem: 'Convite enviado', token: token, projeto_id: Number(projeto_id) });
    } catch (err) {
        return res.status(500).send('Ocorreu um erro no servidor');
    }
};

// os convites pendentes do projeto (para mostrar na janela dos membros)
const listarConvites = async (req, res) => {
    const projeto_id = req.params.id;
    try {
        const lista = await projetosModel.convitesDoProjeto(projeto_id);
        return res.send(lista);
    } catch (err) {
        return res.status(500).send('Ocorreu um erro no servidor');
    }
};

module.exports = {
    listarProjetos,
    criarProjeto,
    listarMembros,
    juntarMembro,
    removerMembro,
    apagarProjeto,
    convidar,
    listarConvites
}
