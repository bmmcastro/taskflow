// convites (Nelson) - o lado de quem e' convidado
// mostrar o convite pelo token e aceitar (passa a membro do projeto)

const convitesModel = require('../model/convitesModel');
const projetosModel = require('../model/projetosModel');

// devolve os dados do convite (nome do projeto, quem convidou, se ja tem conta)
const verConvite = async (req, res) => {
    const token = req.params.token;
    try {
        const convite = await convitesModel.buscarPorToken(token);
        if (!convite) {
            return res.status(404).send('Convite nao encontrado');
        }
        const jaTemConta = await convitesModel.procurarEmail(convite.email_convidado);
        return res.send({
            projeto: convite.projeto_nome,
            criador: convite.criador_nome,
            email: convite.email_convidado,
            status: convite.status,
            projeto_id: convite.projeto_id,
            ja_registado: !!jaTemConta
        });
    } catch (err) {
        return res.status(500).send('Ocorreu um erro no servidor');
    }
};

// aceita o convite: o utilizador fica membro do projeto
const aceitarConvite = async (req, res) => {
    const token = req.params.token;
    const utilizador_id = req.body.utilizador_id;
    try {
        const convite = await convitesModel.buscarPorToken(token);
        if (!convite) {
            return res.status(404).send('Convite nao encontrado');
        }
        //se o email do convite nao bater com a conta que esta a aceitar, nao deixamos
        const conta = await convitesModel.procurarEmail(convite.email_convidado);
        if (!conta || Number(conta.id) !== Number(utilizador_id)) {
            return res.status(403).send('Este convite nao e para a tua conta');
        }
        //juntamos a pessoa ao projeto (o NOT EXISTS no model evita repetir) e marcamos como aceite
        await projetosModel.juntarMembro(convite.projeto_id, utilizador_id);
        await convitesModel.marcarAceite(token);
        return res.send({ projeto_id: convite.projeto_id });
    } catch (err) {
        return res.status(500).send('Ocorreu um erro no servidor');
    }
};

module.exports = {
    verConvite,
    aceitarConvite
};
