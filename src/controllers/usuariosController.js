const bcrypt = require('bcrypt');
const { generateToken } = require('../config/jwt');
const { enviarEmailConfirmacao } = require('../config/email');
const { runQuery, getQuery } = require('../config/database');
const { deleteOldFile, getFileUrl } = require('../middleware/upload');

// POST /api/usuarios/cadastro
const cadastrarUsuario = async (req, res) => {
    try {
        const { nome, email, curso, periodo, senha, interesses } = req.body;

        // Verificar se email já existe
        const usuarioExistente = await getQuery(
            'SELECT id FROM usuarios WHERE email = ?',
            [email]
        );

        if (usuarioExistente) {
            return res.status(400).json({
                error: 'Email já cadastrado',
                message: 'Este email já está sendo usado por outro usuário'
            });
        }

        // Hash da senha
        const saltRounds = 10;
        const senhaHash = await bcrypt.hash(senha, saltRounds);

        // Inserir usuário no banco
        const resultado = await runQuery(
            `INSERT INTO usuarios (nome, email, curso, periodo, senha_hash, interesses, email_confirmado) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [nome, email, curso, periodo, senhaHash, interesses || '', true] // email_confirmado = true para simplificar
        );

        // Buscar dados do usuário criado
        const novoUsuario = await getQuery(
            'SELECT id, nome, email, curso, periodo, foto_perfil, interesses, email_confirmado, created_at FROM usuarios WHERE id = ?',
            [resultado.id]
        );

        // Enviar email de confirmação
        try {
            await enviarEmailConfirmacao(email, nome);
        } catch (emailError) {
            console.error('Erro ao enviar email de confirmação:', emailError);
            // Não falhar o cadastro por causa do email
        }

        // Gerar token JWT
        const token = generateToken({
            id: novoUsuario.id,
            email: novoUsuario.email,
            nome: novoUsuario.nome
        });

        res.status(201).json({
            message: 'Usuário cadastrado com sucesso',
            token,
            usuario: novoUsuario
        });

    } catch (error) {
        console.error('Erro no cadastro:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// PUT /api/usuarios/perfil
const atualizarPerfil = async (req, res) => {
    try {
        const userId = req.user.id;
        const { nome, curso, periodo, interesses } = req.body;
        
        // Verificar se o usuário existe
        const usuario = await getQuery(
            'SELECT * FROM usuarios WHERE id = ?',
            [userId]
        );

        if (!usuario) {
            return res.status(404).json({
                error: 'Usuário não encontrado',
                message: 'Usuário não encontrado no sistema'
            });
        }

        // Preparar dados para atualização
        const dadosAtualizacao = {};
        if (nome) dadosAtualizacao.nome = nome;
        if (curso) dadosAtualizacao.curso = curso;
        if (periodo) dadosAtualizacao.periodo = periodo;
        if (interesses !== undefined) dadosAtualizacao.interesses = interesses;

        // Se há upload de foto
        if (req.file) {
            // Deletar foto antiga se existir
            if (usuario.foto_perfil) {
                const caminhoAntigo = usuario.foto_perfil.replace('/uploads/profile-pics/', '');
                deleteOldFile(`./uploads/profile-pics/${caminhoAntigo}`);
            }
            
            // Atualizar caminho da nova foto
            dadosAtualizacao.foto_perfil = getFileUrl(req.file.filename);
        }

        // Construir query de atualização
        const campos = Object.keys(dadosAtualizacao);
        if (campos.length === 0) {
            return res.status(400).json({
                error: 'Nenhum dado para atualizar',
                message: 'Forneça pelo menos um campo para atualizar'
            });
        }

        const setClause = campos.map(campo => `${campo} = ?`).join(', ');
        const valores = campos.map(campo => dadosAtualizacao[campo]);
        valores.push(userId);

        await runQuery(
            `UPDATE usuarios SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            valores
        );

        // Buscar dados atualizados
        const usuarioAtualizado = await getQuery(
            'SELECT id, nome, email, curso, periodo, foto_perfil, interesses, email_confirmado, created_at, updated_at FROM usuarios WHERE id = ?',
            [userId]
        );

        res.json({
            message: 'Perfil atualizado com sucesso',
            usuario: usuarioAtualizado
        });

    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// GET /api/usuarios/perfil
const obterPerfil = async (req, res) => {
    try {
        const userId = req.user.id;

        const usuario = await getQuery(
            'SELECT id, nome, email, curso, periodo, foto_perfil, interesses, email_confirmado, created_at, updated_at FROM usuarios WHERE id = ?',
            [userId]
        );

        if (!usuario) {
            return res.status(404).json({
                error: 'Usuário não encontrado',
                message: 'Usuário não encontrado no sistema'
            });
        }

        res.json({
            usuario
        });

    } catch (error) {
        console.error('Erro ao obter perfil:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// GET /api/usuarios/grupos
const obterGruposUsuario = async (req, res) => {
    try {
        const userId = req.user.id;

        const grupos = await getQuery(`
            SELECT 
                g.id,
                g.nome,
                g.materia,
                g.objetivo,
                g.local,
                g.limite_participantes,
                g.participantes_atual,
                g.ativo,
                g.created_at,
                pg.papel,
                pg.data_entrada
            FROM grupos g
            INNER JOIN participantes_grupo pg ON g.id = pg.grupo_id
            WHERE pg.usuario_id = ? AND g.ativo = TRUE
            ORDER BY pg.data_entrada DESC
        `, [userId]);

        res.json({
            grupos
        });

    } catch (error) {
        console.error('Erro ao obter grupos do usuário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// DELETE /api/usuarios/conta
const deletarConta = async (req, res) => {
    try {
        const userId = req.user.id;
        const { senha } = req.body;

        // Verificar senha antes de deletar
        const usuario = await getQuery(
            'SELECT senha_hash FROM usuarios WHERE id = ?',
            [userId]
        );

        if (!usuario) {
            return res.status(404).json({
                error: 'Usuário não encontrado'
            });
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
        if (!senhaValida) {
            return res.status(401).json({
                error: 'Senha incorreta',
                message: 'A senha fornecida está incorreta'
            });
        }

        // Deletar foto de perfil se existir
        const usuarioCompleto = await getQuery(
            'SELECT foto_perfil FROM usuarios WHERE id = ?',
            [userId]
        );

        if (usuarioCompleto.foto_perfil) {
            const caminhoFoto = usuarioCompleto.foto_perfil.replace('/uploads/profile-pics/', '');
            deleteOldFile(`./uploads/profile-pics/${caminhoFoto}`);
        }

        // Deletar usuário (cascade vai deletar participações e mensagens)
        await runQuery('DELETE FROM usuarios WHERE id = ?', [userId]);

        res.json({
            message: 'Conta deletada com sucesso'
        });

    } catch (error) {
        console.error('Erro ao deletar conta:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

module.exports = {
    cadastrarUsuario,
    atualizarPerfil,
    obterPerfil,
    obterGruposUsuario,
    deletarConta
};
