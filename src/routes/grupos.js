const express = require('express');
const router = express.Router();
const { validate, schemas } = require('../middleware/validation');
const { authenticateToken, checkGroupAdmin, checkGroupMember } = require('../middleware/auth');
const gruposController = require('../controllers/gruposController');
const mensagensController = require('../controllers/mensagensController');

// POST /api/grupos
router.post('/',
    authenticateToken,
    validate(schemas.criarGrupo),
    gruposController.criarGrupo
);

// GET /api/grupos/buscar
router.get('/buscar',
    validate(schemas.buscarGrupos),
    gruposController.buscarGrupos
);

// GET /api/grupos/:id
router.get('/:id',
    gruposController.obterGrupo
);

// POST /api/grupos/:id/entrar
router.post('/:id/entrar',
    authenticateToken,
    gruposController.entrarGrupo
);

// DELETE /api/grupos/:id/sair
router.delete('/:id/sair',
    authenticateToken,
    gruposController.sairGrupo
);

// DELETE /api/grupos/:id
router.delete('/:id',
    authenticateToken,
    checkGroupAdmin,
    gruposController.deletarGrupo
);

// GET /api/grupos/:id/participantes
router.get('/:id/participantes',
    authenticateToken,
    checkGroupMember,
    gruposController.obterParticipantes
);

// GET /api/grupos/:id/mensagens
router.get('/:id/mensagens',
    authenticateToken,
    checkGroupMember,
    mensagensController.obterMensagens
);

// POST /api/grupos/:id/mensagens
router.post('/:id/mensagens',
    authenticateToken,
    checkGroupMember,
    validate(schemas.novaMensagem),
    mensagensController.enviarMensagem
);

// GET /api/grupos/:id/mensagens/ultimas
router.get('/:id/mensagens/ultimas',
    authenticateToken,
    checkGroupMember,
    mensagensController.obterUltimasMensagens
);

// DELETE /api/grupos/:id/mensagens/:mensagemId
router.delete('/:id/mensagens/:mensagemId',
    authenticateToken,
    checkGroupMember,
    mensagensController.deletarMensagem
);

module.exports = router;
