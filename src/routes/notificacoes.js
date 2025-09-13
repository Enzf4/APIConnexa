const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const notificacoesController = require('../controllers/notificacoesController');

// GET /api/notificacoes
router.get('/',
    authenticateToken,
    notificacoesController.obterNotificacoes
);

// PUT /api/notificacoes/:id/lida
router.put('/:id/lida',
    authenticateToken,
    notificacoesController.marcarComoLida
);

// PUT /api/notificacoes/marcar-todas-lidas
router.put('/marcar-todas-lidas',
    authenticateToken,
    notificacoesController.marcarTodasComoLidas
);

// DELETE /api/notificacoes/:id
router.delete('/:id',
    authenticateToken,
    notificacoesController.deletarNotificacao
);

// DELETE /api/notificacoes/limpar-todas
router.delete('/limpar-todas',
    authenticateToken,
    notificacoesController.limparTodasNotificacoes
);

// GET /api/notificacoes/estatisticas
router.get('/estatisticas',
    authenticateToken,
    notificacoesController.obterEstatisticas
);

// GET /api/notificacoes/por-tipo/:tipo
router.get('/por-tipo/:tipo',
    authenticateToken,
    notificacoesController.obterNotificacoesPorTipo
);

module.exports = router;
