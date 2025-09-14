# 🚀 Connexa API - Plataforma de Grupos de Estudo

API REST desenvolvida em Node.js para uma plataforma de grupos de estudo universitários. Permite que estudantes se conectem, formem grupos de estudo e colaborem através de chat em tempo real.

## ✨ Funcionalidades

- 🔐 **Autenticação JWT** com validação de email institucional
- 👥 **Gestão de Grupos** - Criar, buscar e gerenciar grupos de estudo
- 💬 **Chat em Tempo Real** - Sistema de mensagens para cada grupo
- 🔔 **Notificações** - Sistema completo de notificações
- 📸 **Upload de Fotos** - Perfil de usuário com foto
- 📧 **Sistema de Email** - Confirmação de cadastro e recuperação de senha
- 🔒 **Segurança** - Rate limiting, validação de dados e sanitização

## 🛠️ Stack Tecnológica

- **Node.js 18+** - Runtime JavaScript
- **Express.js** - Framework web
- **SQLite** - Banco de dados
- **JWT** - Autenticação
- **bcrypt** - Hash de senhas
- **Multer** - Upload de arquivos
- **Nodemailer** - Envio de emails
- **Joi** - Validação de dados

## 🚀 Instalação e Execução

### Pré-requisitos

- Node.js 18 ou superior
- npm ou yarn

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd APIConnexa
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
NODE_ENV=development
PORT=3001
JWT_SECRET=sua_chave_secreta_jwt_aqui_123456789
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app_do_gmail
DATABASE_PATH=./src/database/connexa.db
UPLOAD_PATH=./uploads
FRONTEND_URL=http://localhost:3000
```

### 4. Inicialize o banco de dados

```bash
npm run init-db
```

### 5. Execute o servidor

```bash
# Desenvolvimento (com nodemon)
npm run dev

# Produção
npm start
```

### 6. Teste a API

Acesse `http://localhost:3001/health` para verificar se está funcionando.

## 📚 Documentação da API

A documentação completa está disponível em [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

### Endpoints Principais

- **POST** `/api/usuarios/cadastro` - Cadastrar usuário
- **POST** `/api/auth/login` - Fazer login
- **POST** `/api/grupos` - Criar grupo
- **GET** `/api/grupos/buscar` - Buscar grupos
- **POST** `/api/grupos/:id/entrar` - Entrar em grupo
- **GET** `/api/grupos/:id/mensagens` - Ver mensagens
- **POST** `/api/grupos/:id/mensagens` - Enviar mensagem
- **GET** `/api/notificacoes` - Ver notificações

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

- **usuarios** - Dados dos usuários
- **grupos** - Grupos de estudo
- **participantes_grupo** - Relação usuário-grupo
- **mensagens** - Mensagens do chat
- **notificacoes** - Sistema de notificações

## 🔧 Scripts Disponíveis

```bash
npm start          # Inicia o servidor em produção
npm run dev        # Inicia o servidor em desenvolvimento
npm run init-db    # Inicializa o banco de dados
```

## 📁 Estrutura do Projeto

```
src/
├── config/          # Configurações (DB, JWT, Email)
│   ├── database.js
│   ├── jwt.js
│   └── email.js
├── controllers/     # Lógica de negócio
│   ├── authController.js
│   ├── usuariosController.js
│   ├── gruposController.js
│   ├── mensagensController.js
│   └── notificacoesController.js
├── middleware/      # Middlewares
│   ├── auth.js
│   ├── validation.js
│   ├── upload.js
│   └── errorHandler.js
├── routes/          # Definição de rotas
│   ├── auth.js
│   ├── usuarios.js
│   ├── grupos.js
│   └── notificacoes.js
├── services/        # Serviços auxiliares
│   ├── notificationService.js
│   └── fileService.js
├── utils/           # Utilitários
│   ├── constants.js
│   └── helpers.js
├── database/        # Scripts de banco
│   ├── init.js
│   └── connexa.db
├── uploads/         # Arquivos enviados
│   └── profile-pics/
├── app.js           # Configuração do Express
└── server.js        # Ponto de entrada
```

## 🔒 Segurança

- **JWT** para autenticação
- **bcrypt** para hash de senhas
- **Rate limiting** para prevenir spam
- **Validação** rigorosa de dados
- **Sanitização** de inputs
- **CORS** configurado
- **Helmet** para headers de segurança

## 📊 Validações

### Email

- Deve ser institucional (@alunos.unisanta.br ou @edu.alunos.unisanta.br)

### Senha

- Mínimo 8 caracteres
- Pelo menos: 1 minúscula, 1 maiúscula e 1 número

### Upload de Arquivos

- Apenas imagens (JPG, PNG, GIF, WEBP)
- Máximo 5MB

## 🚀 Deploy

### Variáveis de Ambiente para Produção

```env
NODE_ENV=production
PORT=3001
JWT_SECRET=chave_super_secreta_para_producao
EMAIL_USER=seu_email_producao@gmail.com
EMAIL_PASS=sua_senha_app_producao
DATABASE_PATH=/var/lib/connexa/connexa.db
UPLOAD_PATH=/var/lib/connexa/uploads
FRONTEND_URL=https://seu-frontend.com
```

### Comandos de Deploy

```bash
# Instalar dependências
npm install --production

# Inicializar banco
npm run init-db

# Iniciar servidor
npm start
```

## 🧪 Testando a API

### Com curl

```bash
# Cadastrar usuário
curl -X POST http://localhost:3001/api/usuarios/cadastro \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao.silva@alunos.unisanta.br",
    "curso": "Ciência da Computação",
    "periodo": "5º",
    "senha": "MinhaSenh@123"
  }'

# Fazer login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao.silva@alunos.unisanta.br",
    "senha": "MinhaSenh@123"
  }'
```

### Com Postman

Importe a collection disponível em `/docs/postman-collection.json`

## 🐛 Solução de Problemas

### Erro de Conexão com Banco

```bash
# Verificar se o diretório existe
mkdir -p src/database

# Executar inicialização
npm run init-db
```

### Erro de Email

- Verifique as credenciais no `.env`
- Use senha de app do Gmail (não a senha normal)
- Verifique se o 2FA está habilitado

### Erro de Upload

```bash
# Criar diretório de uploads
mkdir -p uploads/profile-pics
```

## 📈 Próximas Funcionalidades

- [ ] WebSocket para chat em tempo real
- [ ] Sistema de convites por email
- [ ] Relatórios de atividade
- [ ] Moderação de conteúdo
- [ ] Integração com calendário
- [ ] Sistema de avaliações
- [ ] API de estatísticas

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Equipe

- **Desenvolvimento:** Equipe Connexa
- **Versão:** 1.0.0
- **Última atualização:** Janeiro 2024

## 📞 Suporte

Para dúvidas ou problemas:

- Abra uma issue no GitHub
- Verifique a documentação da API
- Consulte os logs do servidor

---

**Desenvolvido com ❤️ para a comunidade acadêmica**
