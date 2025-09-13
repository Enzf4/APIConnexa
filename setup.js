#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Configurando projeto Connexa API...\n');

// Verificar se Node.js está instalado
try {
    const nodeVersion = process.version;
    console.log(`✅ Node.js ${nodeVersion} detectado`);
    
    // Verificar versão mínima
    const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
    if (majorVersion < 18) {
        console.log('❌ Node.js 18+ é necessário. Versão atual:', nodeVersion);
        process.exit(1);
    }
} catch (error) {
    console.log('❌ Node.js não encontrado. Instale Node.js 18+ primeiro.');
    process.exit(1);
}

// Criar arquivo .env se não existir
const envPath = '.env';
const envExamplePath = 'env.example';

if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envPath);
        console.log('✅ Arquivo .env criado a partir do env.example');
    } else {
        // Criar .env básico
        const envContent = `NODE_ENV=development
PORT=3001
JWT_SECRET=sua_chave_secreta_jwt_aqui_123456789
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app_do_gmail
DATABASE_PATH=./src/database/connexa.db
UPLOAD_PATH=./uploads
FRONTEND_URL=http://localhost:3000`;
        
        fs.writeFileSync(envPath, envContent);
        console.log('✅ Arquivo .env criado com configurações básicas');
    }
} else {
    console.log('✅ Arquivo .env já existe');
}

// Criar diretórios necessários
const directories = [
    'src/database',
    'uploads',
    'uploads/profile-pics',
    'docs'
];

directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Diretório criado: ${dir}`);
    } else {
        console.log(`✅ Diretório já existe: ${dir}`);
    }
});

// Instalar dependências
console.log('\n📦 Instalando dependências...');
try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependências instaladas com sucesso');
} catch (error) {
    console.log('❌ Erro ao instalar dependências:', error.message);
    process.exit(1);
}

// Inicializar banco de dados
console.log('\n🗄️ Inicializando banco de dados...');
try {
    execSync('npm run init-db', { stdio: 'inherit' });
    console.log('✅ Banco de dados inicializado com sucesso');
} catch (error) {
    console.log('❌ Erro ao inicializar banco de dados:', error.message);
    process.exit(1);
}

console.log('\n🎉 Configuração concluída com sucesso!');
console.log('\n📋 Próximos passos:');
console.log('1. Edite o arquivo .env com suas configurações');
console.log('2. Configure suas credenciais de email (opcional)');
console.log('3. Execute: npm run dev');
console.log('4. Acesse: http://localhost:3001/health');
console.log('5. Consulte a documentação em API_DOCUMENTATION.md');
console.log('\n🔧 Comandos úteis:');
console.log('  npm run dev     - Iniciar em desenvolvimento');
console.log('  npm start       - Iniciar em produção');
console.log('  npm run init-db - Reinicializar banco de dados');
console.log('\n📚 Documentação:');
console.log('  README.md - Guia geral do projeto');
console.log('  API_DOCUMENTATION.md - Documentação completa da API');
console.log('  docs/postman-collection.json - Collection do Postman');
console.log('\n✨ Boa sorte com seu projeto Connexa!');
