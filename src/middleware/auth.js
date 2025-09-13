const { verifyToken } = require('../config/jwt');

// Middleware de autenticação JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
        return res.status(401).json({ 
            error: 'Token de acesso não fornecido',
            message: 'É necessário fazer login para acessar este recurso'
        });
    }
    
    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ 
            error: 'Token inválido ou expirado',
            message: 'Faça login novamente para continuar'
        });
    }
};

// Middleware opcional de autenticação (não falha se não houver token)
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
        try {
            const decoded = verifyToken(token);
            req.user = decoded;
        } catch (error) {
            // Token inválido, mas continua sem usuário
            req.user = null;
        }
    }
    
    next();
};

// Middleware para verificar se o usuário é admin do grupo
const checkGroupAdmin = async (req, res, next) => {
    try {
        const { id: grupoId } = req.params;
        const userId = req.user.id;
        
        const { getQuery } = require('../config/database');
        
        const participante = await getQuery(
            'SELECT papel FROM participantes_grupo WHERE grupo_id = ? AND usuario_id = ?',
            [grupoId, userId]
        );
        
        if (!participante || participante.papel !== 'admin') {
            return res.status(403).json({
                error: 'Acesso negado',
                message: 'Apenas administradores do grupo podem realizar esta ação'
            });
        }
        
        next();
    } catch (error) {
        console.error('Erro ao verificar admin do grupo:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// Middleware para verificar se o usuário é membro do grupo
const checkGroupMember = async (req, res, next) => {
    try {
        const { id: grupoId } = req.params;
        const userId = req.user.id;
        
        const { getQuery } = require('../config/database');
        
        const participante = await getQuery(
            'SELECT papel FROM participantes_grupo WHERE grupo_id = ? AND usuario_id = ?',
            [grupoId, userId]
        );
        
        if (!participante) {
            return res.status(403).json({
                error: 'Acesso negado',
                message: 'Você precisa ser membro do grupo para acessar este recurso'
            });
        }
        
        req.user.papel = participante.papel;
        next();
    } catch (error) {
        console.error('Erro ao verificar membro do grupo:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

module.exports = {
    authenticateToken,
    optionalAuth,
    checkGroupAdmin,
    checkGroupMember
};
