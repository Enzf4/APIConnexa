const { AVATARS_VALIDOS } = require("../utils/constants");

// Middleware para validar avatar
const validarAvatar = (req, res, next) => {
  const { avatar } = req.body;

  if (avatar && !AVATARS_VALIDOS.includes(avatar)) {
    return res.status(400).json({
      success: false,
      message: "Avatar inválido. Escolha entre: " + AVATARS_VALIDOS.join(", "),
    });
  }

  next();
};

module.exports = { validarAvatar };
