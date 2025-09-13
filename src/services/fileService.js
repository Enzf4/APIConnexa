const fs = require('fs');
const path = require('path');

// Função para validar tipo de arquivo
const validarTipoArquivo = (filename, tiposPermitidos = ['jpg', 'jpeg', 'png', 'gif', 'webp']) => {
    const ext = path.extname(filename).toLowerCase().substring(1);
    return tiposPermitidos.includes(ext);
};

// Função para validar tamanho do arquivo
const validarTamanhoArquivo = (fileSize, tamanhoMaximo = 5 * 1024 * 1024) => { // 5MB
    return fileSize <= tamanhoMaximo;
};

// Função para gerar nome único de arquivo
const gerarNomeUnico = (originalName, prefixo = '') => {
    const ext = path.extname(originalName);
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    return `${prefixo}${timestamp}-${random}${ext}`;
};

// Função para criar diretório se não existir
const criarDiretorio = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`✅ Diretório criado: ${dirPath}`);
    }
};

// Função para deletar arquivo
const deletarArquivo = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`✅ Arquivo deletado: ${filePath}`);
            return true;
        }
        return false;
    } catch (error) {
        console.error(`❌ Erro ao deletar arquivo ${filePath}:`, error);
        return false;
    }
};

// Função para obter URL pública do arquivo
const obterUrlPublica = (filename, basePath = '/uploads') => {
    if (!filename) return null;
    return `${basePath}/${filename}`;
};

// Função para obter caminho completo do arquivo
const obterCaminhoCompleto = (filename, baseDir) => {
    return path.join(baseDir, filename);
};

// Função para verificar se arquivo existe
const arquivoExiste = (filePath) => {
    return fs.existsSync(filePath);
};

// Função para obter informações do arquivo
const obterInfoArquivo = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) {
            return null;
        }

        const stats = fs.statSync(filePath);
        return {
            tamanho: stats.size,
            criado: stats.birthtime,
            modificado: stats.mtime,
            extensao: path.extname(filePath),
            nome: path.basename(filePath)
        };
    } catch (error) {
        console.error(`❌ Erro ao obter informações do arquivo ${filePath}:`, error);
        return null;
    }
};

// Função para limpar arquivos órfãos (não referenciados no banco)
const limparArquivosOrfaos = async (diretorio, tabelaReferencia, campoArquivo) => {
    try {
        const { allQuery } = require('../config/database');
        
        // Buscar todos os arquivos referenciados no banco
        const arquivosReferenciados = await allQuery(
            `SELECT DISTINCT ${campoArquivo} FROM ${tabelaReferencia} WHERE ${campoArquivo} IS NOT NULL AND ${campoArquivo} != ''`
        );

        const arquivosNoBanco = new Set(
            arquivosReferenciados.map(arquivo => 
                path.basename(arquivo[campoArquivo])
            )
        );

        // Listar arquivos no diretório
        const arquivosNoDiretorio = fs.readdirSync(diretorio);
        let arquivosRemovidos = 0;

        for (const arquivo of arquivosNoDiretorio) {
            if (!arquivosNoBanco.has(arquivo)) {
                const caminhoCompleto = path.join(diretorio, arquivo);
                if (deletarArquivo(caminhoCompleto)) {
                    arquivosRemovidos++;
                }
            }
        }

        console.log(`✅ ${arquivosRemovidos} arquivos órfãos removidos`);
        return arquivosRemovidos;

    } catch (error) {
        console.error('❌ Erro ao limpar arquivos órfãos:', error);
        throw error;
    }
};

// Função para compactar imagem (básica - apenas redimensionar)
const compactarImagem = async (inputPath, outputPath, maxWidth = 800, maxHeight = 600) => {
    try {
        // Esta é uma implementação básica
        // Em produção, use bibliotecas como 'sharp' ou 'jimp'
        console.log(`📷 Compactação de imagem: ${inputPath} -> ${outputPath}`);
        
        // Por enquanto, apenas copia o arquivo
        fs.copyFileSync(inputPath, outputPath);
        
        return true;
    } catch (error) {
        console.error('❌ Erro ao compactar imagem:', error);
        return false;
    }
};

// Função para validar e processar upload de foto de perfil
const processarFotoPerfil = (file, userId) => {
    const uploadDir = process.env.UPLOAD_PATH || './uploads';
    const profilePicsDir = path.join(uploadDir, 'profile-pics');
    
    // Criar diretório se não existir
    criarDiretorio(profilePicsDir);
    
    // Validar tipo de arquivo
    if (!validarTipoArquivo(file.originalname)) {
        throw new Error('Tipo de arquivo não permitido. Use JPG, PNG, GIF ou WEBP.');
    }
    
    // Validar tamanho
    if (!validarTamanhoArquivo(file.size)) {
        throw new Error('Arquivo muito grande. Máximo 5MB.');
    }
    
    // Gerar nome único
    const nomeUnico = gerarNomeUnico(file.originalname, `profile-${userId}-`);
    
    // Caminho completo do arquivo
    const caminhoCompleto = path.join(profilePicsDir, nomeUnico);
    
    return {
        nomeUnico,
        caminhoCompleto,
        urlPublica: obterUrlPublica(`profile-pics/${nomeUnico}`)
    };
};

module.exports = {
    validarTipoArquivo,
    validarTamanhoArquivo,
    gerarNomeUnico,
    criarDiretorio,
    deletarArquivo,
    obterUrlPublica,
    obterCaminhoCompleto,
    arquivoExiste,
    obterInfoArquivo,
    limparArquivosOrfaos,
    compactarImagem,
    processarFotoPerfil
};
