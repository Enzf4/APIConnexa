const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Importar middlewares
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Importar rotas
const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const gruposRoutes = require('./routes/grupos');
const notificacoesRoutes = require('./routes/notificacoes');

const app = express();

// Configuração de CORS
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200
};

// Middlewares de segurança
app.use(helmet({
    contentSecurityPolicy: false, // Simplificar para desenvolvimento
    crossOriginEmbedderPolicy: false
}));

// Middleware de CORS
app.use(cors(corsOptions));

// Middleware de compressão
app.use(compression());

// Middleware de rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por IP por janela
    message: {
        error: 'Muitas requisições',
        message: 'Muitas requisições deste IP, tente novamente em 15 minutos'
    }
});

// Rate limiting específico para login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 tentativas de login por IP por janela
    message: {
        error: 'Muitas tentativas de login',
        message: 'Muitas tentativas de login, tente novamente em 15 minutos'
    }
});

// Rate limiting específico para reset de senha
const resetPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 3, // máximo 3 tentativas de reset por IP por hora
    message: {
        error: 'Muitas tentativas de reset',
        message: 'Muitas tentativas de reset de senha, tente novamente em 1 hora'
    }
});

// Aplicar rate limiting
app.use('/api/', limiter);
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/reset-password', resetPasswordLimiter);

// Middleware para parsing de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Middleware de logging básico
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
    next();
});

// Rota de health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Rota de informações da API
app.get('/api', (req, res) => {
    res.json({
        name: 'Connexa API',
        version: '1.0.0',
        description: 'API REST para plataforma de grupos de estudo universitários',
        documentation: '/api/docs',
        endpoints: {
            auth: '/api/auth',
            usuarios: '/api/usuarios',
            grupos: '/api/grupos',
            notificacoes: '/api/notificacoes'
        },
        status: 'active'
    });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/grupos', gruposRoutes);
app.use('/api/notificacoes', notificacoesRoutes);

// Middleware para rotas não encontradas
app.use('*', notFound);

// Middleware global de tratamento de erros
app.use(errorHandler);

// Middleware para capturar erros não tratados
process.on('uncaughtException', (error) => {
    console.error('❌ Erro não capturado:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promise rejeitada não tratada:', reason);
    process.exit(1);
});

module.exports = app;
