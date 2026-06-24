//envio de emails (Bruno) - usado para os convites dos projetos
//usamos o nodemailer com a conta de email do TaskFlow no servidor

const nodemailer = require('nodemailer');

//a conta que envia os emails (no cPanel: taskflow@algarit.pt)
const transporter = nodemailer.createTransport({
    host: 'mail.algarit.pt',
    port: 465,
    secure: true,
    auth: {
        user: 'taskflow@algarit.pt',
        pass: 'a-tua-password-do-email'
    },
    tls: {
        rejectUnauthorized: false
    }
});

//envia um email. se alguma coisa correr mal nao rebenta a app (so devolve false)
async function enviarEmail(para, assunto, texto) {
    try {
        await transporter.sendMail({
            from: 'TaskFlow <taskflow@algarit.pt>',
            to: para,
            subject: assunto,
            text: texto
        });
        return true;
    } catch (err) {
        console.error('Nao deu para enviar o email:', err.message);
        return false;
    }
}

module.exports = {
    enviarEmail
};
