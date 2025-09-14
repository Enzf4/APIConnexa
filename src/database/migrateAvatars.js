const { db } = require("../config/database");
const { AVATARS_VALIDOS, AVATAR_DEFAULT } = require("../utils/constants");

// Script para migrar usuários existentes para o sistema de avatares
const migrarAvatares = async () => {
  try {
    console.log("🔄 Iniciando migração de avatares...");

    // Buscar usuários que não têm avatar definido
    const usuarios = await new Promise((resolve, reject) => {
      db.all(
        `
                SELECT id, nome, email 
                FROM usuarios 
                WHERE avatar IS NULL OR avatar = '' OR avatar = 'avatar-1'
            `,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    console.log(`📊 Encontrados ${usuarios.length} usuários para migrar`);

    let migrados = 0;
    for (const usuario of usuarios) {
      // Atribuir avatar aleatório
      const avatarAleatorio =
        AVATARS_VALIDOS[Math.floor(Math.random() * AVATARS_VALIDOS.length)];

      await new Promise((resolve, reject) => {
        db.run(
          `
                    UPDATE usuarios 
                    SET avatar = ?, foto_perfil = NULL, updated_at = CURRENT_TIMESTAMP 
                    WHERE id = ?
                `,
          [avatarAleatorio, usuario.id],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      migrados++;
      console.log(
        `✅ Usuário ${usuario.nome} (${usuario.email}) migrado para ${avatarAleatorio}`
      );
    }

    console.log(
      `🎉 Migração concluída! ${migrados} usuários migrados com sucesso`
    );

    // Verificar se todos os usuários têm avatar
    const usuariosSemAvatar = await new Promise((resolve, reject) => {
      db.all(
        `
                SELECT COUNT(*) as count 
                FROM usuarios 
                WHERE avatar IS NULL OR avatar = '' OR avatar = 'avatar-1'
            `,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows[0].count);
        }
      );
    });

    if (usuariosSemAvatar > 0) {
      console.log(
        `⚠️  Ainda existem ${usuariosSemAvatar} usuários sem avatar definido`
      );
    } else {
      console.log("✅ Todos os usuários têm avatar definido");
    }
  } catch (error) {
    console.error("❌ Erro na migração:", error);
    throw error;
  }
};

// Executar migração se chamado diretamente
if (require.main === module) {
  migrarAvatares()
    .then(() => {
      console.log("🏁 Migração finalizada");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Falha na migração:", error);
      process.exit(1);
    });
}

module.exports = { migrarAvatares };
