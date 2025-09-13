const bcrypt = require('bcrypt');
const { generateToken, generateResetToken, verifyToken } = require('../config/jwt');
const { enviarEmailConfirmacao, enviarEmailRecuperacao } = require('../config/email');
const { runQuery, getQuery } = require('../config/database');

// POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, senha } = req.body;

        // Buscar usuário pelo email
        const usuario = await getQuery(
            'SELECT * FROM usuarios WHERE email = ?',
            [email]
        );

        if (!usuario) {
            return res.status(401).json({
                error: 'Credenciais inválidas',
                message: 'Email ou senha incorretos'
            });
        }

        // Verificar senha
        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
        if (!senhaValida) {
            return res.status(401).json({
                error: 'Credenciais inválidas',
                message: 'Email ou senha incorretos'
            });
        }

        // Verificar se email foi confirmado
        if (!usuario.email_confirmado) {
            return res.status(401).json({
                error: 'Email não confirmado',
                message: 'Confirme seu email antes de fazer login'
            });
        }

        // Gerar token JWT
        const token = generateToken({
            id: usuario.id,
            email: usuario.email,
            nome: usuario.nome
        });

        // Retornar dados do usuário (sem senha)
        const { senha_hash, ...usuarioSemSenha } = usuario;

        res.json({
            message: 'Login realizado com sucesso',
            token,
            usuario: usuarioSemSenha
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// POST /api/auth/reset-password
const solicitarResetSenha = async (req, res) => {
    try {
        const { email } = req.body;

        // Buscar usuário pelo email
        const usuario = await getQuery(
            'SELECT * FROM usuarios WHERE email = ?',
            [email]
        );

        if (!usuario) {
            return res.status(404).json({
                error: 'Usuário não encontrado',
                message: 'Nenhum usuário cadastrado com este email'
            });
        }

        // Gerar token de recuperação
        const resetToken = generateResetToken({
            id: usuario.id,
            email: usuario.email
        });

        // Enviar email de recuperação
        await enviarEmailRecuperacao(usuario.email, usuario.nome, resetToken);

        res.json({
            message: 'Email de recuperação enviado com sucesso',
            email: usuario.email
        });

    } catch (error) {
        console.error('Erro ao solicitar reset de senha:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// POST /api/auth/confirm-reset-password
const confirmarResetSenha = async (req, res) => {
    try {
        const { token, nova_senha } = req.body;

        // Verificar token
        const decoded = verifyToken(token);
        
        // Buscar usuário
        const usuario = await getQuery(
            'SELECT * FROM usuarios WHERE id = ? AND email = ?',
            [decoded.id, decoded.email]
        );

        if (!usuario) {
            return res.status(400).json({
                error: 'Token inválido',
                message: 'Token de recuperação inválido ou expirado'
            });
        }

        // Hash da nova senha
        const saltRounds = 10;
        const novaSenhaHash = await bcrypt.hash(nova_senha, saltRounds);

        // Atualizar senha no banco
        await runQuery(
            'UPDATE usuarios SET senha_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [novaSenhaHash, usuario.id]
        );

        res.json({
            message: 'Senha alterada com sucesso',
            email: usuario.email
        });

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({
                error: 'Token expirado',
                message: 'O link de recuperação expirou. Solicite um novo'
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({
                error: 'Token inválido',
                message: 'Token de recuperação inválido'
            });
        }

        console.error('Erro ao confirmar reset de senha:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// POST /api/auth/verify-token
const verificarToken = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                error: 'Token não fornecido',
                valid: false
            });
        }

        const decoded = verifyToken(token);
        
        // Buscar dados atualizados do usuário
        const usuario = await getQuery(
            'SELECT id, nome, email, curso, periodo, foto_perfil, interesses, email_confirmado FROM usuarios WHERE id = ?',
            [decoded.id]
        );

        if (!usuario) {
            return res.status(401).json({
                error: 'Usuário não encontrado',
                valid: false
            });
        }

        res.json({
            valid: true,
            usuario
        });

    } catch (error) {
        res.status(401).json({
            error: 'Token inválido',
            valid: false
        });
    }
};

module.exports = {
    login,
    solicitarResetSenha,
    confirmarResetSenha,
    verificarToken
};
