const Joi = require("joi");
const { AVATARS_VALIDOS } = require("../utils/constants");

// Validação de email institucional
const validarEmailInstitucional = (email) => {
  const dominiosValidos = ["@alunos.unisanta.br", "@edu.alunos.unisanta.br"];
  return dominiosValidos.some((dominio) => email.endsWith(dominio));
};

// Validação de senha forte
const validarSenha = (senha) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return regex.test(senha);
};

// Middleware de validação genérico
const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(400).json({
        error: "Dados inválidos",
        details: errors,
      });
    }

    req[property] = value;
    next();
  };
};

// Schemas de validação
const schemas = {
  // Cadastro de usuário
  cadastroUsuario: Joi.object({
    nome: Joi.string().min(2).max(100).required().messages({
      "string.min": "Nome deve ter pelo menos 2 caracteres",
      "string.max": "Nome deve ter no máximo 100 caracteres",
      "any.required": "Nome é obrigatório",
    }),
    email: Joi.string()
      .email()
      .required()
      .custom((value, helpers) => {
        if (!validarEmailInstitucional(value)) {
          return helpers.error("email.institucional");
        }
        return value;
      })
      .messages({
        "string.email": "Email deve ter um formato válido",
        "email.institucional":
          "Email deve ser institucional (@alunos.unisanta.br ou @edu.alunos.unisanta.br)",
        "any.required": "Email é obrigatório",
      }),
    curso: Joi.string().min(2).max(100).required().messages({
      "string.min": "Curso deve ter pelo menos 2 caracteres",
      "string.max": "Curso deve ter no máximo 100 caracteres",
      "any.required": "Curso é obrigatório",
    }),
    periodo: Joi.string().min(1).max(20).required().messages({
      "string.min": "Período é obrigatório",
      "string.max": "Período deve ter no máximo 20 caracteres",
      "any.required": "Período é obrigatório",
    }),
    senha: Joi.string()
      .min(8)
      .required()
      .custom((value, helpers) => {
        if (!validarSenha(value)) {
          return helpers.error("password.weak");
        }
        return value;
      })
      .messages({
        "string.min": "Senha deve ter pelo menos 8 caracteres",
        "password.weak":
          "Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número",
        "any.required": "Senha é obrigatória",
      }),
    interesses: Joi.string().max(500).optional().messages({
      "string.max": "Interesses devem ter no máximo 500 caracteres",
    }),
    avatar: Joi.string()
      .valid(...AVATARS_VALIDOS)
      .optional()
      .messages({
        "any.only": `Avatar deve ser um dos valores válidos: ${AVATARS_VALIDOS.join(
          ", "
        )}`,
      }),
  }),

  // Login
  login: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Email deve ter um formato válido",
      "any.required": "Email é obrigatório",
    }),
    senha: Joi.string().required().messages({
      "any.required": "Senha é obrigatória",
    }),
  }),

  // Atualização de perfil
  atualizarPerfil: Joi.object({
    nome: Joi.string().min(2).max(100).optional(),
    curso: Joi.string().min(2).max(100).optional(),
    periodo: Joi.string().min(1).max(20).optional(),
    interesses: Joi.string().max(500).optional(),
    avatar: Joi.string()
      .valid(...AVATARS_VALIDOS)
      .optional()
      .messages({
        "any.only": `Avatar deve ser um dos valores válidos: ${AVATARS_VALIDOS.join(
          ", "
        )}`,
      }),
  }),

  // Criação de grupo
  criarGrupo: Joi.object({
    nome: Joi.string().min(3).max(100).required().messages({
      "string.min": "Nome do grupo deve ter pelo menos 3 caracteres",
      "string.max": "Nome do grupo deve ter no máximo 100 caracteres",
      "any.required": "Nome do grupo é obrigatório",
    }),
    materia: Joi.string().min(2).max(100).required().messages({
      "string.min": "Matéria deve ter pelo menos 2 caracteres",
      "string.max": "Matéria deve ter no máximo 100 caracteres",
      "any.required": "Matéria é obrigatória",
    }),
    objetivo: Joi.string().min(10).max(500).required().messages({
      "string.min": "Objetivo deve ter pelo menos 10 caracteres",
      "string.max": "Objetivo deve ter no máximo 500 caracteres",
      "any.required": "Objetivo é obrigatório",
    }),
    local: Joi.string().valid("online", "presencial").required().messages({
      "any.only": 'Local deve ser "online" ou "presencial"',
      "any.required": "Local é obrigatório",
    }),
    limite_participantes: Joi.number()
      .integer()
      .min(2)
      .max(50)
      .required()
      .messages({
        "number.min": "Limite deve ser pelo menos 2 participantes",
        "number.max": "Limite deve ser no máximo 50 participantes",
        "any.required": "Limite de participantes é obrigatório",
      }),
  }),

  // Busca de grupos
  buscarGrupos: Joi.object({
    materia: Joi.string().max(100).optional(),
    local: Joi.string().valid("online", "presencial", "todos").optional(),
    texto: Joi.string().max(200).optional(),
    pagina: Joi.number().integer().min(1).default(1),
    limite: Joi.number().integer().min(1).max(50).default(10),
  }),

  // Nova mensagem
  novaMensagem: Joi.object({
    conteudo: Joi.string().min(1).max(1000).required().messages({
      "string.min": "Mensagem não pode estar vazia",
      "string.max": "Mensagem deve ter no máximo 1000 caracteres",
      "any.required": "Conteúdo da mensagem é obrigatório",
    }),
  }),

  // Recuperação de senha
  recuperarSenha: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Email deve ter um formato válido",
      "any.required": "Email é obrigatório",
    }),
  }),

  // Reset de senha
  resetSenha: Joi.object({
    token: Joi.string().required(),
    nova_senha: Joi.string()
      .min(8)
      .required()
      .custom((value, helpers) => {
        if (!validarSenha(value)) {
          return helpers.error("password.weak");
        }
        return value;
      })
      .messages({
        "string.min": "Nova senha deve ter pelo menos 8 caracteres",
        "password.weak":
          "Nova senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número",
        "any.required": "Nova senha é obrigatória",
      }),
  }),
};

module.exports = {
  validate,
  schemas,
  validarEmailInstitucional,
  validarSenha,
};
