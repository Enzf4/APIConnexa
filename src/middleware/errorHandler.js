// Middleware global de tratamento de erros
const errorHandler = (err, req, res, next) => {
    console.error('❌ Erro capturado:', err);

    // Erro de validação do Joi
    if (err.isJoi) {
        const errors = err.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
        }));
        
        return res.status(400).json({
            error: 'Dados inválidos',
            details: errors
        });
    }

    // Erro de constraint única do SQLite
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        if (err.message.includes('email')) {
            return res.status(400).json({
                error: 'Email já cadastrado',
                message: 'Este email já está sendo usado por outro usuário'
            });
        }
        
        if (err.message.includes('participantes_grupo')) {
            return res.status(400).json({
                error: 'Usuário já é membro',
                message: 'Você já faz parte deste grupo'
            });
        }
        
        return res.status(400).json({
            error: 'Dados duplicados',
            message: 'Os dados fornecidos já existem no sistema'
        });
    }

    // Erro de foreign key
    if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
        return res.status(400).json({
            error: 'Referência inválida',
            message: 'Os dados fornecidos fazem referência a registros inexistentes'
        });
    }

    // Erro de arquivo não encontrado
    if (err.code === 'ENOENT') {
        return res.status(404).json({
            error: 'Arquivo não encontrado',
            message: 'O arquivo solicitado não existe'
        });
    }

    // Erro de JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'Token inválido',
            message: 'O token fornecido não é válido'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: 'Token expirado',
            message: 'O token fornecido expirou. Faça login novamente'
        });
    }

    // Erro de email
    if (err.code === 'EAUTH' || err.code === 'ECONNECTION') {
        return res.status(500).json({
            error: 'Erro no envio de email',
            message: 'Não foi possível enviar o email. Tente novamente mais tarde'
        });
    }

    // Erro de validação personalizada
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Dados inválidos',
            message: err.message
        });
    }

    // Erro de permissão
    if (err.name === 'PermissionError') {
        return res.status(403).json({
            error: 'Acesso negado',
            message: err.message
        });
    }

    // Erro de recurso não encontrado
    if (err.name === 'NotFoundError') {
        return res.status(404).json({
            error: 'Recurso não encontrado',
            message: err.message
        });
    }

    // Erro genérico do servidor
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' 
        ? 'Erro interno do servidor' 
        : err.message;

    res.status(statusCode).json({
        error: 'Erro interno do servidor',
        message: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

// Middleware para capturar rotas não encontradas
const notFound = (req, res) => {
    res.status(404).json({
        error: 'Rota não encontrada',
        message: `A rota ${req.method} ${req.originalUrl} não existe`,
        availableRoutes: [
            'POST /api/usuarios/cadastro',
            'POST /api/auth/login',
            'POST /api/auth/reset-password',
            'PUT /api/usuarios/perfil',
            'POST /api/grupos',
            'GET /api/grupos/buscar',
            'POST /api/grupos/:id/entrar',
            'DELETE /api/grupos/:id/sair',
            'GET /api/grupos/:id/mensagens',
            'POST /api/grupos/:id/mensagens',
            'GET /api/notificacoes',
            'PUT /api/notificacoes/:id/lida'
        ]
    });
};

module.exports = {
    errorHandler,
    notFound
};
