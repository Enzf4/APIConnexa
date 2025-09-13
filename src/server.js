const app = require('./app');
const { initDatabase } = require('./database/init');
const { verifyEmailConnection } = require('./config/email');

const PORT = process.env.PORT || 3001;

// Função para inicializar o servidor
const iniciarServidor = async () => {
    try {
        console.log('🚀 Iniciando servidor Connexa...');
        
        // Inicializar banco de dados
        await initDatabase();
        
        // Verificar conexão com email (opcional)
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            verifyEmailConnection();
        } else {
            console.log('⚠️  Configuração de email não encontrada - funcionalidades de email desabilitadas');
        }
        
        // Iniciar servidor
        app.listen(PORT, () => {
            console.log('✅ Servidor iniciado com sucesso!');
            console.log(`🌐 Servidor rodando em: http://localhost:${PORT}`);
            console.log(`📚 API disponível em: http://localhost:${PORT}/api`);
            console.log(`🏥 Health check: http://localhost:${PORT}/health`);
            console.log(`📖 Documentação: http://localhost:${PORT}/api`);
            console.log('');
            console.log('🔧 Variáveis de ambiente:');
            console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
            console.log(`   PORT: ${PORT}`);
            console.log(`   DATABASE_PATH: ${process.env.DATABASE_PATH || './src/database/connexa.db'}`);
            console.log(`   UPLOAD_PATH: ${process.env.UPLOAD_PATH || './uploads'}`);
            console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
            console.log('');
            console.log('📋 Endpoints disponíveis:');
            console.log('   POST /api/usuarios/cadastro - Cadastrar usuário');
            console.log('   POST /api/auth/login - Fazer login');
            console.log('   POST /api/auth/reset-password - Solicitar reset de senha');
            console.log('   PUT /api/usuarios/perfil - Atualizar perfil');
            console.log('   POST /api/grupos - Criar grupo');
            console.log('   GET /api/grupos/buscar - Buscar grupos');
            console.log('   POST /api/grupos/:id/entrar - Entrar em grupo');
            console.log('   GET /api/grupos/:id/mensagens - Ver mensagens');
            console.log('   POST /api/grupos/:id/mensagens - Enviar mensagem');
            console.log('   GET /api/notificacoes - Ver notificações');
            console.log('');
            console.log('🎉 Servidor pronto para receber requisições!');
        });
        
    } catch (error) {
        console.error('❌ Erro ao iniciar servidor:', error);
        process.exit(1);
    }
};

// Inicializar servidor
iniciarServidor();

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM recebido. Encerrando servidor graciosamente...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT recebido. Encerrando servidor graciosamente...');
    process.exit(0);
});
