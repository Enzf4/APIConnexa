const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Criar diretório de uploads se não existir
const uploadDir = process.env.UPLOAD_PATH || './uploads';
const profilePicsDir = path.join(uploadDir, 'profile-pics');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(profilePicsDir)) {
    fs.mkdirSync(profilePicsDir, { recursive: true });
}

// Configuração do multer para upload de fotos de perfil
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, profilePicsDir);
    },
    filename: (req, file, cb) => {
        // Gerar nome único para o arquivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `profile-${req.user.id}-${uniqueSuffix}${ext}`);
    }
});

// Filtro para tipos de arquivo permitidos
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Apenas imagens são permitidas (JPEG, JPG, PNG, GIF, WEBP)'));
    }
};

// Configuração do multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB máximo
        files: 1 // Apenas 1 arquivo por vez
    }
});

// Middleware para upload de foto de perfil
const uploadProfilePic = upload.single('foto_perfil');

// Middleware de tratamento de erros do multer
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'Arquivo muito grande',
                message: 'A foto deve ter no máximo 5MB'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                error: 'Muitos arquivos',
                message: 'Apenas uma foto por vez é permitida'
            });
        }
    }
    
    if (error.message.includes('Apenas imagens são permitidas')) {
        return res.status(400).json({
            error: 'Tipo de arquivo inválido',
            message: 'Apenas imagens são permitidas (JPEG, JPG, PNG, GIF, WEBP)'
        });
    }
    
    next(error);
};

// Função para deletar arquivo antigo
const deleteOldFile = (filePath) => {
    if (filePath && fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
            console.log(`✅ Arquivo antigo deletado: ${filePath}`);
        } catch (error) {
            console.error(`❌ Erro ao deletar arquivo: ${error.message}`);
        }
    }
};

// Função para obter URL pública do arquivo
const getFileUrl = (filename) => {
    if (!filename) return null;
    return `/uploads/profile-pics/${filename}`;
};

module.exports = {
    uploadProfilePic,
    handleUploadError,
    deleteOldFile,
    getFileUrl
};
