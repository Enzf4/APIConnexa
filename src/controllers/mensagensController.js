const { runQuery, getQuery, allQuery } = require('../config/database');
const { criarNotificacao } = require('../services/notificationService');

// GET /api/grupos/:id/mensagens
const obterMensagens = async (req, res) => {
    try {
        const { id: grupoId } = req.params;
        const { pagina = 1, limite = 50 } = req.query;
        const offset = (pagina - 1) * limite;

        // Verificar se o usuário é membro do grupo
        const participante = await getQuery(
            'SELECT id FROM participantes_grupo WHERE grupo_id = ? AND usuario_id = ?',
            [grupoId, req.user.id]
        );

        if (!participante) {
            return res.status(403).json({
                error: 'Acesso negado',
                message: 'Você precisa ser membro do grupo para ver as mensagens'
            });
        }

        // Buscar mensagens do grupo
        const mensagens = await allQuery(`
            SELECT 
                m.id,
                m.conteudo,
                m.created_at,
                u.id as usuario_id,
                u.nome as usuario_nome,
                u.foto_perfil as usuario_foto,
                u.curso as usuario_curso,
                u.periodo as usuario_periodo
            FROM mensagens m
            INNER JOIN usuarios u ON m.usuario_id = u.id
            WHERE m.grupo_id = ?
            ORDER BY m.created_at DESC
            LIMIT ? OFFSET ?
        `, [grupoId, parseInt(limite), parseInt(offset)]);

        // Contar total de mensagens
        const totalResult = await getQuery(
            'SELECT COUNT(*) as total FROM mensagens WHERE grupo_id = ?',
            [grupoId]
        );

        const total = totalResult.total;
        const totalPaginas = Math.ceil(total / limite);

        res.json({
            mensagens: mensagens.reverse(), // Ordenar cronologicamente (mais antigas primeiro)
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
        console.error('Erro ao obter mensagens:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// POST /api/grupos/:id/mensagens
const enviarMensagem = async (req, res) => {
    try {
        const { id: grupoId } = req.params;
        const { conteudo } = req.body;
        const userId = req.user.id;

        // Verificar se o usuário é membro do grupo
        const participante = await getQuery(
            'SELECT id FROM participantes_grupo WHERE grupo_id = ? AND usuario_id = ?',
            [grupoId, userId]
        );

        if (!participante) {
            return res.status(403).json({
                error: 'Acesso negado',
                message: 'Você precisa ser membro do grupo para enviar mensagens'
            });
        }

        // Verificar se o grupo ainda está ativo
        const grupo = await getQuery(
            'SELECT nome, ativo FROM grupos WHERE id = ?',
            [grupoId]
        );

        if (!grupo || !grupo.ativo) {
            return res.status(400).json({
                error: 'Grupo inativo',
                message: 'Este grupo não está mais ativo'
            });
        }

        // Filtro básico de conteúdo ofensivo
        const conteudoFiltrado = filtrarConteudo(conteudo);
        if (!conteudoFiltrado) {
            return res.status(400).json({
                error: 'Conteúdo inadequado',
                message: 'A mensagem contém conteúdo inadequado'
            });
        }

        // Inserir mensagem no banco
        const resultado = await runQuery(
            'INSERT INTO mensagens (grupo_id, usuario_id, conteudo) VALUES (?, ?, ?)',
            [grupoId, userId, conteudoFiltrado]
        );

        // Buscar dados da mensagem criada
        const mensagem = await getQuery(`
            SELECT 
                m.id,
                m.conteudo,
                m.created_at,
                u.id as usuario_id,
                u.nome as usuario_nome,
                u.foto_perfil as usuario_foto,
                u.curso as usuario_curso,
                u.periodo as usuario_periodo
            FROM mensagens m
            INNER JOIN usuarios u ON m.usuario_id = u.id
            WHERE m.id = ?
        `, [resultado.id]);

        // Buscar dados do usuário que enviou a mensagem
        const usuario = await getQuery(
            'SELECT nome FROM usuarios WHERE id = ?',
            [userId]
        );

        // Notificar outros membros do grupo (exceto o remetente)
        const outrosMembros = await allQuery(
            'SELECT usuario_id FROM participantes_grupo WHERE grupo_id = ? AND usuario_id != ?',
            [grupoId, userId]
        );

        for (const membro of outrosMembros) {
            await criarNotificacao(
                membro.usuario_id,
                'nova_mensagem',
                'Nova mensagem no grupo',
                `${usuario.nome} enviou uma mensagem no grupo "${grupo.nome}"`,
                grupoId
            );
        }

        res.status(201).json({
            message: 'Mensagem enviada com sucesso',
            mensagem
        });

    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// DELETE /api/grupos/:id/mensagens/:mensagemId
const deletarMensagem = async (req, res) => {
    try {
        const { id: grupoId, mensagemId } = req.params;
        const userId = req.user.id;

        // Verificar se a mensagem existe e pertence ao grupo
        const mensagem = await getQuery(
            'SELECT * FROM mensagens WHERE id = ? AND grupo_id = ?',
            [mensagemId, grupoId]
        );

        if (!mensagem) {
            return res.status(404).json({
                error: 'Mensagem não encontrada',
                message: 'Mensagem não encontrada neste grupo'
            });
        }

        // Verificar se o usuário é o autor da mensagem ou admin do grupo
        const participante = await getQuery(
            'SELECT papel FROM participantes_grupo WHERE grupo_id = ? AND usuario_id = ?',
            [grupoId, userId]
        );

        if (!participante) {
            return res.status(403).json({
                error: 'Acesso negado',
                message: 'Você não tem permissão para deletar esta mensagem'
            });
        }

        const podeDeletar = mensagem.usuario_id === userId || participante.papel === 'admin';

        if (!podeDeletar) {
            return res.status(403).json({
                error: 'Acesso negado',
                message: 'Você só pode deletar suas próprias mensagens'
            });
        }

        // Deletar mensagem
        await runQuery(
            'DELETE FROM mensagens WHERE id = ?',
            [mensagemId]
        );

        res.json({
            message: 'Mensagem deletada com sucesso'
        });

    } catch (error) {
        console.error('Erro ao deletar mensagem:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// Função para filtrar conteúdo ofensivo (básica)
const filtrarConteudo = (conteudo) => {
    // Lista básica de palavras inadequadas (pode ser expandida)
    const palavrasInadequadas = [
        'spam', 'lixo', 'idiota', 'burro', 'estúpido'
        // Adicione mais palavras conforme necessário
    ];

    const conteudoLower = conteudo.toLowerCase();
    
    for (const palavra of palavrasInadequadas) {
        if (conteudoLower.includes(palavra)) {
            return null; // Conteúdo inadequado
        }
    }

    // Verificar se a mensagem não está vazia após trim
    if (conteudo.trim().length === 0) {
        return null;
    }

    return conteudo.trim();
};

// GET /api/grupos/:id/mensagens/ultimas
const obterUltimasMensagens = async (req, res) => {
    try {
        const { id: grupoId } = req.params;
        const { limite = 10 } = req.query;

        // Verificar se o usuário é membro do grupo
        const participante = await getQuery(
            'SELECT id FROM participantes_grupo WHERE grupo_id = ? AND usuario_id = ?',
            [grupoId, req.user.id]
        );

        if (!participante) {
            return res.status(403).json({
                error: 'Acesso negado',
                message: 'Você precisa ser membro do grupo para ver as mensagens'
            });
        }

        // Buscar últimas mensagens
        const mensagens = await allQuery(`
            SELECT 
                m.id,
                m.conteudo,
                m.created_at,
                u.id as usuario_id,
                u.nome as usuario_nome,
                u.foto_perfil as usuario_foto
            FROM mensagens m
            INNER JOIN usuarios u ON m.usuario_id = u.id
            WHERE m.grupo_id = ?
            ORDER BY m.created_at DESC
            LIMIT ?
        `, [grupoId, parseInt(limite)]);

        res.json({
            mensagens: mensagens.reverse() // Ordenar cronologicamente
        });

    } catch (error) {
        console.error('Erro ao obter últimas mensagens:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

module.exports = {
    obterMensagens,
    enviarMensagem,
    deletarMensagem,
    obterUltimasMensagens
};
