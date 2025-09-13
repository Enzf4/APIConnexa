const { runQuery, getQuery, allQuery } = require('../config/database');
const { criarNotificacao } = require('../services/notificationService');

// POST /api/grupos
const criarGrupo = async (req, res) => {
    try {
        const { nome, materia, objetivo, local, limite_participantes } = req.body;
        const criadorId = req.user.id;

        // Verificar se o usuário já tem muitos grupos ativos
        const gruposAtivos = await getQuery(
            'SELECT COUNT(*) as total FROM grupos WHERE criador_id = ? AND ativo = TRUE',
            [criadorId]
        );

        if (gruposAtivos.total >= 5) {
            return res.status(400).json({
                error: 'Limite de grupos atingido',
                message: 'Você pode criar no máximo 5 grupos ativos'
            });
        }

        // Criar grupo
        const resultado = await runQuery(
            `INSERT INTO grupos (nome, materia, objetivo, local, limite_participantes, criador_id) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [nome, materia, objetivo, local, limite_participantes, criadorId]
        );

        // Adicionar criador como admin do grupo
        await runQuery(
            'INSERT INTO participantes_grupo (grupo_id, usuario_id, papel) VALUES (?, ?, ?)',
            [resultado.id, criadorId, 'admin']
        );

        // Buscar dados completos do grupo criado
        const grupo = await getQuery(
            `SELECT g.*, u.nome as criador_nome 
             FROM grupos g 
             INNER JOIN usuarios u ON g.criador_id = u.id 
             WHERE g.id = ?`,
            [resultado.id]
        );

        res.status(201).json({
            message: 'Grupo criado com sucesso',
            grupo
        });

    } catch (error) {
        console.error('Erro ao criar grupo:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// GET /api/grupos/buscar
const buscarGrupos = async (req, res) => {
    try {
        const { materia, local, texto, pagina = 1, limite = 10 } = req.query;
        const offset = (pagina - 1) * limite;

        // Construir query de busca
        let whereConditions = ['g.ativo = TRUE', 'g.participantes_atual < g.limite_participantes'];
        let params = [];

        if (materia && materia !== 'todos') {
            whereConditions.push('g.materia LIKE ?');
            params.push(`%${materia}%`);
        }

        if (local && local !== 'todos') {
            whereConditions.push('g.local = ?');
            params.push(local);
        }

        if (texto) {
            whereConditions.push('(g.nome LIKE ? OR g.objetivo LIKE ?)');
            params.push(`%${texto}%`, `%${texto}%`);
        }

        const whereClause = whereConditions.join(' AND ');

        // Buscar grupos
        const grupos = await allQuery(`
            SELECT 
                g.id,
                g.nome,
                g.materia,
                g.objetivo,
                g.local,
                g.limite_participantes,
                g.participantes_atual,
                g.created_at,
                u.nome as criador_nome,
                u.curso as criador_curso,
                u.periodo as criador_periodo
            FROM grupos g
            INNER JOIN usuarios u ON g.criador_id = u.id
            WHERE ${whereClause}
            ORDER BY g.created_at DESC
            LIMIT ? OFFSET ?
        `, [...params, parseInt(limite), parseInt(offset)]);

        // Contar total de grupos para paginação
        const totalResult = await getQuery(`
            SELECT COUNT(*) as total 
            FROM grupos g 
            WHERE ${whereClause}
        `, params);

        const total = totalResult.total;
        const totalPaginas = Math.ceil(total / limite);

        res.json({
            grupos,
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
        console.error('Erro ao buscar grupos:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// GET /api/grupos/:id
const obterGrupo = async (req, res) => {
    try {
        const { id } = req.params;

        const grupo = await getQuery(`
            SELECT 
                g.*,
                u.nome as criador_nome,
                u.curso as criador_curso,
                u.periodo as criador_periodo,
                u.foto_perfil as criador_foto
            FROM grupos g
            INNER JOIN usuarios u ON g.criador_id = u.id
            WHERE g.id = ? AND g.ativo = TRUE
        `, [id]);

        if (!grupo) {
            return res.status(404).json({
                error: 'Grupo não encontrado',
                message: 'Grupo não encontrado ou inativo'
            });
        }

        // Buscar participantes do grupo
        const participantes = await allQuery(`
            SELECT 
                u.id,
                u.nome,
                u.curso,
                u.periodo,
                u.foto_perfil,
                pg.papel,
                pg.data_entrada
            FROM participantes_grupo pg
            INNER JOIN usuarios u ON pg.usuario_id = u.id
            WHERE pg.grupo_id = ?
            ORDER BY pg.papel DESC, pg.data_entrada ASC
        `, [id]);

        res.json({
            grupo,
            participantes
        });

    } catch (error) {
        console.error('Erro ao obter grupo:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// POST /api/grupos/:id/entrar
const entrarGrupo = async (req, res) => {
    try {
        const { id: grupoId } = req.params;
        const userId = req.user.id;

        // Verificar se o grupo existe e está ativo
        const grupo = await getQuery(
            'SELECT * FROM grupos WHERE id = ? AND ativo = TRUE',
            [grupoId]
        );

        if (!grupo) {
            return res.status(404).json({
                error: 'Grupo não encontrado',
                message: 'Grupo não encontrado ou inativo'
            });
        }

        // Verificar se ainda há vagas
        if (grupo.participantes_atual >= grupo.limite_participantes) {
            return res.status(400).json({
                error: 'Grupo lotado',
                message: 'Este grupo já atingiu o limite de participantes'
            });
        }

        // Verificar se o usuário já é membro
        const participanteExistente = await getQuery(
            'SELECT id FROM participantes_grupo WHERE grupo_id = ? AND usuario_id = ?',
            [grupoId, userId]
        );

        if (participanteExistente) {
            return res.status(400).json({
                error: 'Usuário já é membro',
                message: 'Você já faz parte deste grupo'
            });
        }

        // Adicionar usuário ao grupo
        await runQuery(
            'INSERT INTO participantes_grupo (grupo_id, usuario_id, papel) VALUES (?, ?, ?)',
            [grupoId, userId, 'membro']
        );

        // Atualizar contador de participantes
        await runQuery(
            'UPDATE grupos SET participantes_atual = participantes_atual + 1 WHERE id = ?',
            [grupoId]
        );

        // Buscar dados do usuário para notificação
        const usuario = await getQuery(
            'SELECT nome, curso, periodo FROM usuarios WHERE id = ?',
            [userId]
        );

        // Notificar o criador do grupo
        await criarNotificacao(
            grupo.criador_id,
            'novo_membro',
            'Novo membro no grupo',
            `${usuario.nome} (${usuario.curso} - ${usuario.periodo}) entrou no grupo "${grupo.nome}"`,
            grupoId
        );

        res.json({
            message: 'Você entrou no grupo com sucesso'
        });

    } catch (error) {
        console.error('Erro ao entrar no grupo:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// DELETE /api/grupos/:id/sair
const sairGrupo = async (req, res) => {
    try {
        const { id: grupoId } = req.params;
        const userId = req.user.id;

        // Verificar se o usuário é membro do grupo
        const participante = await getQuery(
            'SELECT papel FROM participantes_grupo WHERE grupo_id = ? AND usuario_id = ?',
            [grupoId, userId]
        );

        if (!participante) {
            return res.status(400).json({
                error: 'Usuário não é membro',
                message: 'Você não faz parte deste grupo'
            });
        }

        // Verificar se é o criador (admin)
        if (participante.papel === 'admin') {
            return res.status(400).json({
                error: 'Ação não permitida',
                message: 'O criador do grupo não pode sair. Transfira a administração ou delete o grupo'
            });
        }

        // Remover usuário do grupo
        await runQuery(
            'DELETE FROM participantes_grupo WHERE grupo_id = ? AND usuario_id = ?',
            [grupoId, userId]
        );

        // Atualizar contador de participantes
        await runQuery(
            'UPDATE grupos SET participantes_atual = participantes_atual - 1 WHERE id = ?',
            [grupoId]
        );

        // Buscar dados do grupo e usuário para notificação
        const grupo = await getQuery('SELECT nome, criador_id FROM grupos WHERE id = ?', [grupoId]);
        const usuario = await getQuery('SELECT nome FROM usuarios WHERE id = ?', [userId]);

        // Notificar o criador do grupo
        await criarNotificacao(
            grupo.criador_id,
            'alteracao_grupo',
            'Membro saiu do grupo',
            `${usuario.nome} saiu do grupo "${grupo.nome}"`,
            grupoId
        );

        res.json({
            message: 'Você saiu do grupo com sucesso'
        });

    } catch (error) {
        console.error('Erro ao sair do grupo:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// DELETE /api/grupos/:id
const deletarGrupo = async (req, res) => {
    try {
        const { id: grupoId } = req.params;
        const userId = req.user.id;

        // Verificar se o usuário é o criador do grupo
        const grupo = await getQuery(
            'SELECT * FROM grupos WHERE id = ? AND criador_id = ?',
            [grupoId, userId]
        );

        if (!grupo) {
            return res.status(404).json({
                error: 'Grupo não encontrado',
                message: 'Grupo não encontrado ou você não tem permissão para deletá-lo'
            });
        }

        // Marcar grupo como inativo
        await runQuery(
            'UPDATE grupos SET ativo = FALSE WHERE id = ?',
            [grupoId]
        );

        // Notificar todos os membros
        const membros = await allQuery(
            'SELECT usuario_id FROM participantes_grupo WHERE grupo_id = ? AND usuario_id != ?',
            [grupoId, userId]
        );

        for (const membro of membros) {
            await criarNotificacao(
                membro.usuario_id,
                'alteracao_grupo',
                'Grupo deletado',
                `O grupo "${grupo.nome}" foi deletado pelo administrador`,
                null
            );
        }

        res.json({
            message: 'Grupo deletado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao deletar grupo:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// GET /api/grupos/:id/participantes
const obterParticipantes = async (req, res) => {
    try {
        const { id: grupoId } = req.params;

        const participantes = await allQuery(`
            SELECT 
                u.id,
                u.nome,
                u.curso,
                u.periodo,
                u.foto_perfil,
                pg.papel,
                pg.data_entrada
            FROM participantes_grupo pg
            INNER JOIN usuarios u ON pg.usuario_id = u.id
            WHERE pg.grupo_id = ?
            ORDER BY pg.papel DESC, pg.data_entrada ASC
        `, [grupoId]);

        res.json({
            participantes
        });

    } catch (error) {
        console.error('Erro ao obter participantes:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

module.exports = {
    criarGrupo,
    buscarGrupos,
    obterGrupo,
    entrarGrupo,
    sairGrupo,
    deletarGrupo,
    obterParticipantes
};
