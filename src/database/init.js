const { db } = require('../config/database');

// Script de inicialização do banco de dados
const initDatabase = async () => {
    try {
        console.log('🚀 Inicializando banco de dados...');

        // Criar tabela de usuários
        await new Promise((resolve, reject) => {
            db.run(`
                CREATE TABLE IF NOT EXISTS usuarios (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nome TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    curso TEXT NOT NULL,
                    periodo TEXT NOT NULL,
                    senha_hash TEXT NOT NULL,
                    foto_perfil TEXT,
                    interesses TEXT,
                    email_confirmado BOOLEAN DEFAULT FALSE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // Criar tabela de grupos
        await new Promise((resolve, reject) => {
            db.run(`
                CREATE TABLE IF NOT EXISTS grupos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nome TEXT NOT NULL,
                    materia TEXT NOT NULL,
                    objetivo TEXT NOT NULL,
                    local TEXT NOT NULL,
                    limite_participantes INTEGER NOT NULL,
                    participantes_atual INTEGER DEFAULT 1,
                    criador_id INTEGER NOT NULL,
                    ativo BOOLEAN DEFAULT TRUE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (criador_id) REFERENCES usuarios(id)
                )
            `, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // Criar tabela de participantes do grupo
        await new Promise((resolve, reject) => {
            db.run(`
                CREATE TABLE IF NOT EXISTS participantes_grupo (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    grupo_id INTEGER NOT NULL,
                    usuario_id INTEGER NOT NULL,
                    papel TEXT DEFAULT 'membro',
                    data_entrada DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (grupo_id) REFERENCES grupos(id),
                    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
                    UNIQUE(grupo_id, usuario_id)
                )
            `, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // Criar tabela de mensagens
        await new Promise((resolve, reject) => {
            db.run(`
                CREATE TABLE IF NOT EXISTS mensagens (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    grupo_id INTEGER NOT NULL,
                    usuario_id INTEGER NOT NULL,
                    conteudo TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (grupo_id) REFERENCES grupos(id),
                    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
                )
            `, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // Criar tabela de notificações
        await new Promise((resolve, reject) => {
            db.run(`
                CREATE TABLE IF NOT EXISTS notificacoes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    usuario_id INTEGER NOT NULL,
                    tipo TEXT NOT NULL,
                    titulo TEXT NOT NULL,
                    conteudo TEXT NOT NULL,
                    lida BOOLEAN DEFAULT FALSE,
                    grupo_id INTEGER,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
                    FOREIGN KEY (grupo_id) REFERENCES grupos(id)
                )
            `, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // Criar índices para melhor performance
        const indices = [
            'CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email)',
            'CREATE INDEX IF NOT EXISTS idx_grupos_materia ON grupos(materia)',
            'CREATE INDEX IF NOT EXISTS idx_grupos_ativo ON grupos(ativo)',
            'CREATE INDEX IF NOT EXISTS idx_participantes_grupo ON participantes_grupo(grupo_id)',
            'CREATE INDEX IF NOT EXISTS idx_participantes_usuario ON participantes_grupo(usuario_id)',
            'CREATE INDEX IF NOT EXISTS idx_mensagens_grupo ON mensagens(grupo_id)',
            'CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario ON notificacoes(usuario_id)',
            'CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON notificacoes(lida)'
        ];

        for (const indice of indices) {
            await new Promise((resolve, reject) => {
                db.run(indice, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        }

        console.log('✅ Banco de dados inicializado com sucesso!');
        console.log('📊 Tabelas criadas: usuarios, grupos, participantes_grupo, mensagens, notificacoes');
        console.log('🔍 Índices criados para otimização de consultas');

    } catch (error) {
        console.error('❌ Erro ao inicializar banco de dados:', error);
        process.exit(1);
    }
};

// Executar se chamado diretamente
if (require.main === module) {
    initDatabase().then(() => {
        process.exit(0);
    });
}

module.exports = { initDatabase };
