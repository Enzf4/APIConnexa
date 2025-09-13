const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'chave_secreta_padrao_123456789';
const JWT_EXPIRES_IN = '24h';

// Gerar token JWT
const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Verificar token JWT
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error('Token inválido');
    }
};

// Gerar token de recuperação de senha
const generateResetToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
};

module.exports = {
    generateToken,
    verifyToken,
    generateResetToken,
    JWT_SECRET
};
