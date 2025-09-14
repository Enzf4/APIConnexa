const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config();

// Importar middlewares
const { errorHandler, notFound } = require("./middleware/errorHandler");

// Importar rotas
const authRoutes = require("./routes/auth");
const usuariosRoutes = require("./routes/usuarios");
const gruposRoutes = require("./routes/grupos");
const notificacoesRoutes = require("./routes/notificacoes");

const app = express();

// ==========================================
// CORS - PERMITE ABSOLUTAMENTE TUDO
// ==========================================

app.use(cors());

// FORÇA BRUTA - Headers manuais para garantir
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// ==========================================
// MIDDLEWARES DE SEGURANÇA
// ==========================================

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(compression());

// ==========================================
// RATE LIMITING
// ==========================================

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  message: {
    error: "Muitas requisições",
    message: "Muitas requisições deste IP, tente novamente em 1 minuto",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: "Muitas tentativas de login",
    message: "Muitas tentativas de login, tente novamente em 15 minutos",
  },
  skipSuccessfulRequests: true,
});

const resetPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    error: "Muitas tentativas de reset",
    message: "Muitas tentativas de reset de senha, tente novamente em 1 hora",
  },
});

app.use("/api/", limiter);
app.use("/api/auth/login", loginLimiter);
app.use("/api/auth/reset-password", resetPasswordLimiter);

// ==========================================
// MIDDLEWARES DE PARSING E ARQUIVOS
// ==========================================

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ==========================================
// MIDDLEWARE DE LOGGING
// ==========================================

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(
    `[${timestamp}] ${req.method} ${req.originalUrl} - IP: ${
      req.ip
    } - Origin: ${req.headers.origin || "N/A"}`
  );
  next();
});

// ==========================================
// ROTAS DE SISTEMA
// ==========================================

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    cors: "PERMITE TUDO",
    origin: req.headers.origin || "none",
  });
});

app.get("/api", (req, res) => {
  res.json({
    name: "Connexa API",
    version: "1.0.0",
    description: "API REST para plataforma de grupos de estudo universitários",
    documentation: "/api/docs",
    endpoints: {
      auth: "/api/auth",
      usuarios: "/api/usuarios",
      grupos: "/api/grupos",
      notificacoes: "/api/notificacoes",
    },
    status: "active",
    cors: "PERMITE TUDO",
    requestOrigin: req.headers.origin || "none",
  });
});

// ==========================================
// ROTAS DA API
// ==========================================

app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/grupos", gruposRoutes);
app.use("/api/notificacoes", notificacoesRoutes);

// ==========================================
// MIDDLEWARE DE ERRO E 404
// ==========================================

app.use("*", notFound);
app.use(errorHandler);

// ==========================================
// TRATAMENTO DE ERROS NÃO CAPTURADOS
// ==========================================

process.on("uncaughtException", (error) => {
  console.error("❌ Erro não capturado:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Promise rejeitada não tratada:", reason);
  process.exit(1);
});

module.exports = app;
