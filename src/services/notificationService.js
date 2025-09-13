const { runQuery } = require('../config/database');

// Criar uma nova notificação
const criarNotificacao = async (usuarioId, tipo, titulo, conteudo, grupoId = null) => {
    try {
        const resultado = await runQuery(
            'INSERT INTO notificacoes (usuario_id, tipo, titulo, conteudo, grupo_id) VALUES (?, ?, ?, ?, ?)',
            [usuarioId, tipo, titulo, conteudo, grupoId]
        );

        console.log(`✅ Notificação criada: ${titulo} para usuário ${usuarioId}`);
        return resultado.id;

    } catch (error) {
        console.error('❌ Erro ao criar notificação:', error);
        throw error;
    }
};

// Criar notificação para múltiplos usuários
const criarNotificacaoMultipla = async (usuarioIds, tipo, titulo, conteudo, grupoId = null) => {
    try {
        const promises = usuarioIds.map(usuarioId => 
            criarNotificacao(usuarioId, tipo, titulo, conteudo, grupoId)
        );

        await Promise.all(promises);
        console.log(`✅ Notificações criadas para ${usuarioIds.length} usuários`);

    } catch (error) {
        console.error('❌ Erro ao criar notificações múltiplas:', error);
        throw error;
    }
};

// Notificar novo membro no grupo
const notificarNovoMembro = async (grupoId, nomeUsuario, curso, periodo, nomeGrupo) => {
    try {
        // Buscar criador do grupo
        const grupo = await require('../config/database').getQuery(
            'SELECT criador_id FROM grupos WHERE id = ?',
            [grupoId]
        );

        if (grupo) {
            await criarNotificacao(
                grupo.criador_id,
                'novo_membro',
                'Novo membro no grupo',
                `${nomeUsuario} (${curso} - ${periodo}) entrou no grupo "${nomeGrupo}"`,
                grupoId
            );
        }

    } catch (error) {
        console.error('❌ Erro ao notificar novo membro:', error);
    }
};

// Notificar nova mensagem no grupo
const notificarNovaMensagem = async (grupoId, nomeUsuario, nomeGrupo, conteudoMensagem) => {
    try {
        // Buscar todos os membros exceto o remetente
        const membros = await require('../config/database').allQuery(
            'SELECT usuario_id FROM participantes_grupo WHERE grupo_id = ?',
            [grupoId]
        );

        const titulo = 'Nova mensagem no grupo';
        const conteudo = `${nomeUsuario} enviou uma mensagem no grupo "${nomeGrupo}": "${conteudoMensagem.substring(0, 50)}${conteudoMensagem.length > 50 ? '...' : ''}"`;

        const promises = membros.map(membro => 
            criarNotificacao(membro.usuario_id, 'nova_mensagem', titulo, conteudo, grupoId)
        );

        await Promise.all(promises);

    } catch (error) {
        console.error('❌ Erro ao notificar nova mensagem:', error);
    }
};

// Notificar alteração no grupo
const notificarAlteracaoGrupo = async (grupoId, tipoAlteracao, detalhes) => {
    try {
        // Buscar todos os membros do grupo
        const membros = await require('../config/database').allQuery(
            'SELECT usuario_id FROM participantes_grupo WHERE grupo_id = ?',
            [grupoId]
        );

        const titulo = 'Alteração no grupo';
        const conteudo = `O grupo foi alterado: ${detalhes}`;

        const promises = membros.map(membro => 
            criarNotificacao(membro.usuario_id, 'alteracao_grupo', titulo, conteudo, grupoId)
        );

        await Promise.all(promises);

    } catch (error) {
        console.error('❌ Erro ao notificar alteração no grupo:', error);
    }
};

// Notificar saída de membro
const notificarSaidaMembro = async (grupoId, nomeUsuario, nomeGrupo) => {
    try {
        // Buscar criador do grupo
        const grupo = await require('../config/database').getQuery(
            'SELECT criador_id FROM grupos WHERE id = ?',
            [grupoId]
        );

        if (grupo) {
            await criarNotificacao(
                grupo.criador_id,
                'alteracao_grupo',
                'Membro saiu do grupo',
                `${nomeUsuario} saiu do grupo "${nomeGrupo}"`,
                grupoId
            );
        }

    } catch (error) {
        console.error('❌ Erro ao notificar saída de membro:', error);
    }
};

// Notificar grupo deletado
const notificarGrupoDeletado = async (grupoId, nomeGrupo, nomeCriador) => {
    try {
        // Buscar todos os membros exceto o criador
        const membros = await require('../config/database').allQuery(
            'SELECT usuario_id FROM participantes_grupo WHERE grupo_id = ?',
            [grupoId]
        );

        const titulo = 'Grupo deletado';
        const conteudo = `O grupo "${nomeGrupo}" foi deletado por ${nomeCriador}`;

        const promises = membros.map(membro => 
            criarNotificacao(membro.usuario_id, 'alteracao_grupo', titulo, conteudo, null)
        );

        await Promise.all(promises);

    } catch (error) {
        console.error('❌ Erro ao notificar grupo deletado:', error);
    }
};

// Limpar notificações antigas (mais de 30 dias)
const limparNotificacoesAntigas = async () => {
    try {
        const resultado = await runQuery(
            'DELETE FROM notificacoes WHERE created_at < datetime("now", "-30 days")',
            []
        );

        console.log(`✅ ${resultado.changes} notificações antigas removidas`);
        return resultado.changes;

    } catch (error) {
        console.error('❌ Erro ao limpar notificações antigas:', error);
        throw error;
    }
};

module.exports = {
    criarNotificacao,
    criarNotificacaoMultipla,
    notificarNovoMembro,
    notificarNovaMensagem,
    notificarAlteracaoGrupo,
    notificarSaidaMembro,
    notificarGrupoDeletado,
    limparNotificacoesAntigas
};
