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
// CONFIGURAÇÃO DE CORS COMPLETA E SEGURA
// ==========================================

const allowedOrigins = [
  // URLs de desenvolvimento
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://localhost:5173", // Vite

  // URLs de produção
  "https://connexa-ebon.vercel.app", // Seu frontend na Vercel

  // URL do .env (se definida)
  process.env.FRONTEND_URL,
].filter(Boolean); // Remove valores undefined/null

// Adicionar URLs adicionais do .env se definidas
if (process.env.ADDITIONAL_ORIGINS) {
  const additionalUrls = process.env.ADDITIONAL_ORIGINS.split(",").map((url) =>
    url.trim()
  );
  allowedOrigins.push(...additionalUrls);
}

console.log("🌐 CORS configurado para as seguintes origens:", allowedOrigins);

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requisições sem origin (mobile apps, Postman, etc)
    if (!origin) {
      console.log("📱 Requisição sem origin permitida");
      return callback(null, true);
    }

    // Verificar se a origem está na lista permitida
    if (allowedOrigins.includes(origin)) {
      console.log(`✅ CORS permitido para: ${origin}`);
      callback(null, true);
    } else {
      console.log(`❌ CORS bloqueado para: ${origin}`);
      console.log(`📋 Origens permitidas:`, allowedOrigins);
      callback(new Error(`Origem ${origin} não permitida pelo CORS`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Cache-Control",
    "X-Access-Token",
  ],
  exposedHeaders: ["Authorization", "X-Total-Count"],
  optionsSuccessStatus: 200,
  maxAge: 86400, // Cache preflight por 24h
};

// ==========================================
// MIDDLEWARES DE SEGURANÇA
// ==========================================

app.use(
  helmet({
    contentSecurityPolicy: false, // Simplificar para desenvolvimento
    crossOriginEmbedderPolicy: false,
  })
);

// Middleware de CORS (IMPORTANTE: aplicar ANTES das rotas)
app.use(
  cors({
    origin: true, // Permite QUALQUER origem
    credentials: true,
  })
);

// Middleware de compressão
app.use(compression());

// ==========================================
// MIDDLEWARE DE DEBUG CORS (opcional - remover em produção)
// ==========================================

app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    console.log(
      `🔍 Preflight request de: ${req.headers.origin || "sem origin"}`
    );
  }
  next();
});

// ==========================================
// RATE LIMITING
// ==========================================

// Middleware de rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 120, // máximo 120 requests por IP por minuto
  message: {
    error: "Muitas requisições",
    message: "Muitas requisições deste IP, tente novamente em 1 minuto",
  },
  standardHeaders: true, // Retorna rate limit info nos headers
  legacyHeaders: false,
});

// Rate limiting específico para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas de login por IP por janela
  message: {
    error: "Muitas tentativas de login",
    message: "Muitas tentativas de login, tente novamente em 15 minutos",
  },
  skipSuccessfulRequests: true, // Não contar requests bem-sucedidos
});

// Rate limiting específico para reset de senha
const resetPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // máximo 3 tentativas de reset por IP por hora
  message: {
    error: "Muitas tentativas de reset",
    message: "Muitas tentativas de reset de senha, tente novamente em 1 hora",
  },
});

// Aplicar rate limiting
app.use("/api/", limiter);
app.use("/api/auth/login", loginLimiter);
app.use("/api/auth/reset-password", resetPasswordLimiter);

// ==========================================
// MIDDLEWARES DE PARSING E ARQUIVOS
// ==========================================

// Middleware para parsing de JSON
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Middleware para servir arquivos estáticos
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ==========================================
// MIDDLEWARE DE LOGGING
// ==========================================

// Middleware de logging básico
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

// Rota de health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    corsOrigins: allowedOrigins.length,
  });
});

// Rota de informações da API
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
    corsEnabled: true,
    allowedOrigins: allowedOrigins.length,
  });
});

// ==========================================
// ROTAS DA API
// ==========================================

// Rotas da API
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/grupos", gruposRoutes);
app.use("/api/notificacoes", notificacoesRoutes);

// ==========================================
// MIDDLEWARE DE ERRO E 404
// ==========================================

// Middleware para rotas não encontradas
app.use("*", notFound);

// Middleware global de tratamento de erros
app.use(errorHandler);

// ==========================================
// TRATAMENTO DE ERROS NÃO CAPTURADOS
// ==========================================

// Middleware para capturar erros não tratados
process.on("uncaughtException", (error) => {
  console.error("❌ Erro não capturado:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Promise rejeitada não tratada:", reason);
  process.exit(1);
});

module.exports = app;
