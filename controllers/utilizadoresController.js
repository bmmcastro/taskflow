// Utilizadores - feito pelo Diogo
// Aqui tratamos do registo, do login e da gestao da conta.

const crypto = require('crypto');
const utilizadoresModel = require('../model/utilizadoresModel');

// Em vez de guardar a password tal e qual, transformamo-la num hash.
// Assim, mesmo que alguem veja a base de dados, nao fica a saber a password.
function encriptar(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Devolve a lista de utilizadores (precisamos dela para escolher membros para um projeto).
const listarUtilizadores = async (req, res) => {
    try {
        const utilizadores = await utilizadoresModel.listarTodos();
        return res.send(utilizadores);
    } catch (err) {
        return res.status(500).send('Ocorreu um erro no servidor');
    }
}

// Cria uma conta nova. So gravamos a password depois de a encriptar.
const registar = async (req, res) => {
    const nome = req.body.nome;
    const email = req.body.email;
    const password = req.body.password;

    // Confirmamos que veio tudo preenchido antes de gravar.
    if (!nome || !email || !password) {
        return res.status(400).send('Faltam campos obrigatorios');
    }

    try {
        const utilizador = await utilizadoresModel.criar(nome, email, encriptar(password));
        return res.send(utilizador);
    } catch (err) {
        return res.status(500).send('Ocorreu um erro no servidor');
    }
}

// Login: procuramos um utilizador com este email e com esta password (ja encriptada).
const login = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
        return res.status(400).send('Falta o email ou a password');
    }

    try {
        const utilizador = await utilizadoresModel.procurarParaLogin(email, encriptar(password));
        // Se encontrou alguem, os dados estao certos; senao, devolvemos erro de login.
        if (utilizador) {
            return res.send({ mensagem: 'Login feito com sucesso', utilizador: utilizador });
        } else {
            return res.status(401).send('Email ou password errados');
        }
    } catch (err) {
        return res.status(500).send('Ocorreu um erro no servidor');
    }
}

// Atualizar a conta. A password e' opcional: se vier vazia, mantemos a antiga.
const atualizarUtilizador = async (req, res) => {
    const id = req.params.id;
    const nome = req.body.nome;
    const email = req.body.email;
    const password = req.body.password;

    if (!nome || !email) {
        return res.status(400).send('O nome e o email sao obrigatorios');
    }

    try {
        let utilizador;
        if (password) {
            // O utilizador escreveu uma password nova, por isso tambem a atualizamos (encriptada).
            utilizador = await utilizadoresModel.atualizarComPassword(id, nome, email, encriptar(password));
        } else {
            utilizador = await utilizadoresModel.atualizar(id, nome, email);
        }
        return res.send(utilizador);
    } catch (err) {
        return res.status(500).send('Ocorreu um erro no servidor');
    }
}

// Apagar um utilizador.
const apagarUtilizador = async (req, res) => {
    const id = req.params.id;
    try {
        await utilizadoresModel.apagar(id);
        return res.send('Utilizador apagado');
    } catch (err) {
        return res.status(500).send('Ocorreu um erro no servidor');
    }
}

module.exports = {
    listarUtilizadores,
    registar,
    login,
    atualizarUtilizador,
    apagarUtilizador
}
