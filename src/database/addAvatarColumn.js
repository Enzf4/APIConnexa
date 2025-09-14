const { db } = require("../config/database");

// Script para adicionar coluna avatar ao banco existente
const adicionarColunaAvatar = async () => {
  try {
    console.log("🔄 Adicionando coluna avatar ao banco de dados...");

    // Verificar se a coluna já existe
    const tableInfo = await new Promise((resolve, reject) => {
      db.all("PRAGMA table_info(usuarios)", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    const avatarColumnExists = tableInfo.some(
      (column) => column.name === "avatar"
    );

    if (avatarColumnExists) {
      console.log("✅ Coluna avatar já existe no banco de dados");
      return;
    }

    // Adicionar coluna avatar
    await new Promise((resolve, reject) => {
      db.run(
        `
                ALTER TABLE usuarios ADD COLUMN avatar TEXT DEFAULT 'avatar-1'
            `,
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    console.log("✅ Coluna avatar adicionada com sucesso!");

    // Atualizar usuários existentes com avatar padrão
    const usuariosAtualizados = await new Promise((resolve, reject) => {
      db.run(
        `
                UPDATE usuarios 
                SET avatar = 'avatar-1' 
                WHERE avatar IS NULL OR avatar = ''
            `,
        function (err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });

    console.log(
      `✅ ${usuariosAtualizados} usuários atualizados com avatar padrão`
    );
  } catch (error) {
    console.error("❌ Erro ao adicionar coluna avatar:", error);
    throw error;
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  adicionarColunaAvatar()
    .then(() => {
      console.log("🏁 Processo finalizado");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Falha no processo:", error);
      process.exit(1);
    });
}

module.exports = { adicionarColunaAvatar };
