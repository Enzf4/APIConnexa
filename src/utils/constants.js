// Constantes da aplicação

// Status de usuário
const USUARIO_STATUS = {
    ATIVO: 'ativo',
    INATIVO: 'inativo',
    BLOQUEADO: 'bloqueado'
};

// Papéis de usuário em grupos
const PAPEIS_GRUPO = {
    ADMIN: 'admin',
    MEMBRO: 'membro'
};

// Tipos de notificação
const TIPOS_NOTIFICACAO = {
    NOVO_MEMBRO: 'novo_membro',
    NOVA_MENSAGEM: 'nova_mensagem',
    ALTERACAO_GRUPO: 'alteracao_grupo'
};

// Status de notificação
const STATUS_NOTIFICACAO = {
    LIDA: true,
    NAO_LIDA: false
};

// Tipos de local de grupo
const TIPOS_LOCAL = {
    ONLINE: 'online',
    PRESENCIAL: 'presencial'
};

// Status de grupo
const STATUS_GRUPO = {
    ATIVO: true,
    INATIVO: false
};

// Limites da aplicação
const LIMITES = {
    MAX_GRUPOS_POR_USUARIO: 5,
    MAX_PARTICIPANTES_GRUPO: 50,
    MIN_PARTICIPANTES_GRUPO: 2,
    MAX_TAMANHO_ARQUIVO: 5 * 1024 * 1024, // 5MB
    MAX_MENSAGEM_LENGTH: 1000,
    MAX_NOME_GRUPO: 100,
    MAX_OBJETIVO_GRUPO: 500,
    MAX_INTERESSES_USUARIO: 500,
    MAX_NOTIFICACOES_POR_PAGINA: 50,
    MAX_MENSAGENS_POR_PAGINA: 100
};

// Tipos de arquivo permitidos
const TIPOS_ARQUIVO_PERMITIDOS = {
    IMAGENS: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    DOCUMENTOS: ['pdf', 'doc', 'docx', 'txt'],
    APENAS_IMAGENS: ['jpg', 'jpeg', 'png', 'gif', 'webp']
};

// Códigos de erro personalizados
const CODIGOS_ERRO = {
    USUARIO_NAO_ENCONTRADO: 'USUARIO_NAO_ENCONTRADO',
    GRUPO_NAO_ENCONTRADO: 'GRUPO_NAO_ENCONTRADO',
    MENSAGEM_NAO_ENCONTRADA: 'MENSAGEM_NAO_ENCONTRADA',
    NOTIFICACAO_NAO_ENCONTRADA: 'NOTIFICACAO_NAO_ENCONTRADA',
    EMAIL_JA_CADASTRADO: 'EMAIL_JA_CADASTRADO',
    USUARIO_JA_MEMBRO: 'USUARIO_JA_MEMBRO',
    GRUPO_LOTADO: 'GRUPO_LOTADO',
    ACESSO_NEGADO: 'ACESSO_NEGADO',
    TOKEN_INVALIDO: 'TOKEN_INVALIDO',
    TOKEN_EXPIRADO: 'TOKEN_EXPIRADO',
    SENHA_INCORRETA: 'SENHA_INCORRETA',
    EMAIL_NAO_CONFIRMADO: 'EMAIL_NAO_CONFIRMADO',
    DADOS_INVALIDOS: 'DADOS_INVALIDOS',
    ARQUIVO_MUITO_GRANDE: 'ARQUIVO_MUITO_GRANDE',
    TIPO_ARQUIVO_INVALIDO: 'TIPO_ARQUIVO_INVALIDO',
    CONTEUDO_INADEQUADO: 'CONTEUDO_INADEQUADO'
};

// Mensagens de erro padrão
const MENSAGENS_ERRO = {
    [CODIGOS_ERRO.USUARIO_NAO_ENCONTRADO]: 'Usuário não encontrado',
    [CODIGOS_ERRO.GRUPO_NAO_ENCONTRADO]: 'Grupo não encontrado',
    [CODIGOS_ERRO.MENSAGEM_NAO_ENCONTRADA]: 'Mensagem não encontrada',
    [CODIGOS_ERRO.NOTIFICACAO_NAO_ENCONTRADA]: 'Notificação não encontrada',
    [CODIGOS_ERRO.EMAIL_JA_CADASTRADO]: 'Email já cadastrado',
    [CODIGOS_ERRO.USUARIO_JA_MEMBRO]: 'Usuário já é membro do grupo',
    [CODIGOS_ERRO.GRUPO_LOTADO]: 'Grupo lotado',
    [CODIGOS_ERRO.ACESSO_NEGADO]: 'Acesso negado',
    [CODIGOS_ERRO.TOKEN_INVALIDO]: 'Token inválido',
    [CODIGOS_ERRO.TOKEN_EXPIRADO]: 'Token expirado',
    [CODIGOS_ERRO.SENHA_INCORRETA]: 'Senha incorreta',
    [CODIGOS_ERRO.EMAIL_NAO_CONFIRMADO]: 'Email não confirmado',
    [CODIGOS_ERRO.DADOS_INVALIDOS]: 'Dados inválidos',
    [CODIGOS_ERRO.ARQUIVO_MUITO_GRANDE]: 'Arquivo muito grande',
    [CODIGOS_ERRO.TIPO_ARQUIVO_INVALIDO]: 'Tipo de arquivo inválido',
    [CODIGOS_ERRO.CONTEUDO_INADEQUADO]: 'Conteúdo inadequado'
};

// Configurações de paginação padrão
const PAGINACAO_PADRAO = {
    PAGINA: 1,
    LIMITE: 10,
    LIMITE_MAXIMO: 100
};

// Configurações de JWT
const JWT_CONFIG = {
    EXPIRES_IN: '24h',
    RESET_EXPIRES_IN: '1h'
};

// Configurações de email
const EMAIL_CONFIG = {
    FROM_NAME: 'Connexa',
    SUBJECTS: {
        CONFIRMACAO_CADASTRO: 'Bem-vindo à Connexa! Confirme seu cadastro',
        RECUPERACAO_SENHA: 'Recuperação de Senha - Connexa',
        NOVA_MENSAGEM: 'Nova mensagem no grupo',
        NOVO_MEMBRO: 'Novo membro no grupo',
        ALTERACAO_GRUPO: 'Alteração no grupo'
    }
};

// Configurações de upload
const UPLOAD_CONFIG = {
    PROFILE_PICS_DIR: 'profile-pics',
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['jpg', 'jpeg', 'png', 'gif', 'webp']
};

// Configurações de cache
const CACHE_CONFIG = {
    TTL: 300, // 5 minutos
    MAX_ITEMS: 1000
};

// Configurações de rate limiting
const RATE_LIMIT_CONFIG = {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutos
    MAX_REQUESTS: 100, // 100 requests por janela
    LOGIN_MAX_REQUESTS: 5, // 5 tentativas de login por janela
    RESET_PASSWORD_MAX_REQUESTS: 3 // 3 tentativas de reset por janela
};

// Configurações de validação
const VALIDACAO_CONFIG = {
    SENHA_MIN_LENGTH: 8,
    NOME_MIN_LENGTH: 2,
    NOME_MAX_LENGTH: 100,
    EMAIL_MAX_LENGTH: 255,
    CURSO_MAX_LENGTH: 100,
    PERIODO_MAX_LENGTH: 20,
    INTERESSES_MAX_LENGTH: 500,
    GRUPO_NOME_MIN_LENGTH: 3,
    GRUPO_NOME_MAX_LENGTH: 100,
    GRUPO_OBJETIVO_MIN_LENGTH: 10,
    GRUPO_OBJETIVO_MAX_LENGTH: 500,
    MENSAGEM_MAX_LENGTH: 1000
};

module.exports = {
    USUARIO_STATUS,
    PAPEIS_GRUPO,
    TIPOS_NOTIFICACAO,
    STATUS_NOTIFICACAO,
    TIPOS_LOCAL,
    STATUS_GRUPO,
    LIMITES,
    TIPOS_ARQUIVO_PERMITIDOS,
    CODIGOS_ERRO,
    MENSAGENS_ERRO,
    PAGINACAO_PADRAO,
    JWT_CONFIG,
    EMAIL_CONFIG,
    UPLOAD_CONFIG,
    CACHE_CONFIG,
    RATE_LIMIT_CONFIG,
    VALIDACAO_CONFIG
};
