const { runQuery, getQuery, allQuery } = require('../config/database');

// GET /api/notificacoes
const obterNotificacoes = async (req, res) => {
    try {
        const userId = req.user.id;
        const { lida, pagina = 1, limite = 20 } = req.query;
        const offset = (pagina - 1) * limite;

        // Construir query base
        let whereConditions = ['n.usuario_id = ?'];
        let params = [userId];

        // Filtrar por status de leitura
        if (lida !== undefined) {
            whereConditions.push('n.lida = ?');
            params.push(lida === 'true' ? 1 : 0);
        }

        const whereClause = whereConditions.join(' AND ');

        // Buscar notificações
        const notificacoes = await allQuery(`
            SELECT 
                n.id,
                n.tipo,
                n.titulo,
                n.conteudo,
                n.lida,
                n.grupo_id,
                n.created_at,
                g.nome as grupo_nome
            FROM notificacoes n
            LEFT JOIN grupos g ON n.grupo_id = g.id
            WHERE ${whereClause}
            ORDER BY n.created_at DESC
            LIMIT ? OFFSET ?
        `, [...params, parseInt(limite), parseInt(offset)]);

        // Contar total de notificações
        const totalResult = await getQuery(`
            SELECT COUNT(*) as total 
            FROM notificacoes n 
            WHERE ${whereClause}
        `, params);

        const total = totalResult.total;
        const totalPaginas = Math.ceil(total / limite);

        // Contar notificações não lidas
        const naoLidasResult = await getQuery(
            'SELECT COUNT(*) as total FROM notificacoes WHERE usuario_id = ? AND lida = FALSE',
            [userId]
        );

        res.json({
            notificacoes,
            paginacao: {
                pagina: parseInt(pagina),
                limite: parseInt(limite),
                total,
                totalPaginas,
                temProxima: pagina < totalPaginas,
                temAnterior: pagina > 1
            },
            estatisticas: {
                totalNaoLidas: naoLidasResult.total
            }
        });

    } catch (error) {
        console.error('Erro ao obter notificações:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// PUT /api/notificacoes/:id/lida
const marcarComoLida = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Verificar se a notificação existe e pertence ao usuário
        const notificacao = await getQuery(
            'SELECT * FROM notificacoes WHERE id = ? AND usuario_id = ?',
            [id, userId]
        );

        if (!notificacao) {
            return res.status(404).json({
                error: 'Notificação não encontrada',
                message: 'Notificação não encontrada ou não pertence a você'
            });
        }

        // Marcar como lida
        await runQuery(
            'UPDATE notificacoes SET lida = TRUE WHERE id = ?',
            [id]
        );

        res.json({
            message: 'Notificação marcada como lida'
        });

    } catch (error) {
        console.error('Erro ao marcar notificação como lida:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// PUT /api/notificacoes/marcar-todas-lidas
const marcarTodasComoLidas = async (req, res) => {
    try {
        const userId = req.user.id;

        // Marcar todas as notificações do usuário como lidas
        const resultado = await runQuery(
            'UPDATE notificacoes SET lida = TRUE WHERE usuario_id = ? AND lida = FALSE',
            [userId]
        );

        res.json({
            message: `${resultado.changes} notificações marcadas como lidas`
        });

    } catch (error) {
        console.error('Erro ao marcar todas as notificações como lidas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// DELETE /api/notificacoes/:id
const deletarNotificacao = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Verificar se a notificação existe e pertence ao usuário
        const notificacao = await getQuery(
            'SELECT * FROM notificacoes WHERE id = ? AND usuario_id = ?',
            [id, userId]
        );

        if (!notificacao) {
            return res.status(404).json({
                error: 'Notificação não encontrada',
                message: 'Notificação não encontrada ou não pertence a você'
            });
        }

        // Deletar notificação
        await runQuery(
            'DELETE FROM notificacoes WHERE id = ?',
            [id]
        );

        res.json({
            message: 'Notificação deletada com sucesso'
        });

    } catch (error) {
        console.error('Erro ao deletar notificação:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// DELETE /api/notificacoes/limpar-todas
const limparTodasNotificacoes = async (req, res) => {
    try {
        const userId = req.user.id;

        // Deletar todas as notificações do usuário
        const resultado = await runQuery(
            'DELETE FROM notificacoes WHERE usuario_id = ?',
            [userId]
        );

        res.json({
            message: `${resultado.changes} notificações deletadas`
        });

    } catch (error) {
        console.error('Erro ao limpar todas as notificações:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// GET /api/notificacoes/estatisticas
const obterEstatisticas = async (req, res) => {
    try {
        const userId = req.user.id;

        // Buscar estatísticas das notificações
        const estatisticas = await getQuery(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN lida = FALSE THEN 1 ELSE 0 END) as naoLidas,
                SUM(CASE WHEN lida = TRUE THEN 1 ELSE 0 END) as lidas,
                SUM(CASE WHEN tipo = 'novo_membro' THEN 1 ELSE 0 END) as novosMembros,
                SUM(CASE WHEN tipo = 'nova_mensagem' THEN 1 ELSE 0 END) as novasMensagens,
                SUM(CASE WHEN tipo = 'alteracao_grupo' THEN 1 ELSE 0 END) as alteracoesGrupo
            FROM notificacoes 
            WHERE usuario_id = ?
        `, [userId]);

        res.json({
            estatisticas
        });

    } catch (error) {
        console.error('Erro ao obter estatísticas das notificações:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// GET /api/notificacoes/por-tipo
const obterNotificacoesPorTipo = async (req, res) => {
    try {
        const userId = req.user.id;
        const { tipo } = req.params;
        const { pagina = 1, limite = 20 } = req.query;
        const offset = (pagina - 1) * limite;

        // Verificar se o tipo é válido
        const tiposValidos = ['novo_membro', 'nova_mensagem', 'alteracao_grupo'];
        if (!tiposValidos.includes(tipo)) {
            return res.status(400).json({
                error: 'Tipo inválido',
                message: 'Tipo deve ser: novo_membro, nova_mensagem ou alteracao_grupo'
            });
        }

        // Buscar notificações por tipo
        const notificacoes = await allQuery(`
            SELECT 
                n.id,
                n.tipo,
                n.titulo,
                n.conteudo,
                n.lida,
                n.grupo_id,
                n.created_at,
                g.nome as grupo_nome
            FROM notificacoes n
            LEFT JOIN grupos g ON n.grupo_id = g.id
            WHERE n.usuario_id = ? AND n.tipo = ?
            ORDER BY n.created_at DESC
            LIMIT ? OFFSET ?
        `, [userId, tipo, parseInt(limite), parseInt(offset)]);

        // Contar total
        const totalResult = await getQuery(
            'SELECT COUNT(*) as total FROM notificacoes WHERE usuario_id = ? AND tipo = ?',
            [userId, tipo]
        );

        const total = totalResult.total;
        const totalPaginas = Math.ceil(total / limite);

        res.json({
            notificacoes,
            tipo,
            paginacao: {
                pagina: parseInt(pagina),
                limite: parseInt(limite),
                total,
                totalPaginas,
                temProxima: pagina < totalPaginas,
                temAnterior: pagina > 1
            }
        });

    } catch (error) {
        console.error('Erro ao obter notificações por tipo:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

module.exports = {
    obterNotificacoes,
    marcarComoLida,
    marcarTodasComoLidas,
    deletarNotificacao,
    limparTodasNotificacoes,
    obterEstatisticas,
    obterNotificacoesPorTipo
};
