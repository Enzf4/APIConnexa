const nodemailer = require('nodemailer');

// Configuração do transporter para Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verificar conexão com o email
const verifyEmailConnection = () => {
    transporter.verify((error, success) => {
        if (error) {
            console.error('❌ Erro na configuração do email:', error);
        } else {
            console.log('✅ Servidor de email configurado com sucesso');
        }
    });
};

// Enviar email de confirmação de cadastro
const enviarEmailConfirmacao = async (email, nome) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Bem-vindo à Connexa! Confirme seu cadastro',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4CAF50;">🎉 Bem-vindo à Connexa, ${nome}!</h2>
                <p>Seu cadastro foi realizado com sucesso na nossa plataforma de grupos de estudo.</p>
                <p>Agora você pode:</p>
                <ul>
                    <li>Buscar grupos de estudo na sua área</li>
                    <li>Criar seus próprios grupos</li>
                    <li>Conectar-se com outros estudantes</li>
                </ul>
                <p style="margin-top: 30px;">
                    <a href="${process.env.FRONTEND_URL}/login" 
                       style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                        Acessar Plataforma
                    </a>
                </p>
                <p style="color: #666; font-size: 12px; margin-top: 30px;">
                    Este é um email automático, não responda.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email de confirmação enviado para: ${email}`);
    } catch (error) {
        console.error('❌ Erro ao enviar email:', error);
        throw error;
    }
};

// Enviar email de recuperação de senha
const enviarEmailRecuperacao = async (email, nome, resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Recuperação de Senha - Connexa',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2196F3;">🔐 Recuperação de Senha</h2>
                <p>Olá ${nome},</p>
                <p>Recebemos uma solicitação para redefinir sua senha na Connexa.</p>
                <p>Clique no botão abaixo para criar uma nova senha:</p>
                <p style="margin: 30px 0;">
                    <a href="${resetUrl}" 
                       style="background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
                        Redefinir Senha
                    </a>
                </p>
                <p style="color: #666; font-size: 12px;">
                    Este link expira em 1 hora. Se você não solicitou esta alteração, ignore este email.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email de recuperação enviado para: ${email}`);
    } catch (error) {
        console.error('❌ Erro ao enviar email de recuperação:', error);
        throw error;
    }
};

module.exports = {
    transporter,
    verifyEmailConnection,
    enviarEmailConfirmacao,
    enviarEmailRecuperacao
};
