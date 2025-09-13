const express = require('express');
const router = express.Router();
const { validate, schemas } = require('../middleware/validation');
const authController = require('../controllers/authController');

// POST /api/auth/login
router.post('/login', 
    validate(schemas.login),
    authController.login
);

// POST /api/auth/reset-password
router.post('/reset-password',
    validate(schemas.recuperarSenha),
    authController.solicitarResetSenha
);

// POST /api/auth/confirm-reset-password
router.post('/confirm-reset-password',
    validate(schemas.resetSenha),
    authController.confirmarResetSenha
);

// POST /api/auth/verify-token
router.post('/verify-token',
    authController.verificarToken
);

module.exports = router;
