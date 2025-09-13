const express = require('express');
const router = express.Router();
const { validate, schemas } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const { uploadProfilePic, handleUploadError } = require('../middleware/upload');
const usuariosController = require('../controllers/usuariosController');

// POST /api/usuarios/cadastro
router.post('/cadastro',
    validate(schemas.cadastroUsuario),
    usuariosController.cadastrarUsuario
);

// GET /api/usuarios/perfil
router.get('/perfil',
    authenticateToken,
    usuariosController.obterPerfil
);

// PUT /api/usuarios/perfil
router.put('/perfil',
    authenticateToken,
    uploadProfilePic,
    handleUploadError,
    validate(schemas.atualizarPerfil),
    usuariosController.atualizarPerfil
);

// GET /api/usuarios/grupos
router.get('/grupos',
    authenticateToken,
    usuariosController.obterGruposUsuario
);

// DELETE /api/usuarios/conta
router.delete('/conta',
    authenticateToken,
    usuariosController.deletarConta
);

module.exports = router;
