/**
 * Script para corrigir URLs de QR codes no banco de dados
 * Remove URLs completas e deixa apenas o caminho relativo
 * 
 * Uso:
 *   ts-node fix-db-urls.ts
 */

import { Person } from './src/models/Person';
import sequelize from './src/database/sequelize';
import { Op } from 'sequelize';

async function fixDatabaseUrls() {
  try {
    console.log('🔍 Conectando ao banco de dados...');
    await sequelize.authenticate();
    console.log('✅ Conectado!\n');

    // Buscar todas as pessoas com qrCodeUrl
    console.log('🔍 Buscando registros com URLs...');
    const persons = await Person.findAll({
      where: {
        qrCodeUrl: { [Op.ne]: null }
      },
    });

    console.log(`📊 Encontrados ${persons.length} registros\n`);

    let fixedCount = 0;

    for (const person of persons) {
      let needsUpdate = false;
      const updates: any = {};

      // Processar qrCodeUrl
      if (person.qrCodeUrl) {
        const originalUrl = person.qrCodeUrl;
        let cleanUrl = originalUrl;

        // Se é uma URL completa, extrair apenas o caminho
        if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
          try {
            const url = new URL(cleanUrl);
            cleanUrl = url.pathname;
          } catch (error) {
            // URL inválida, ignorada
          }
        }

        // Remove /uploads/ e /api/files/
        cleanUrl = cleanUrl.replace(/^\/uploads\//, '');
        cleanUrl = cleanUrl.replace(/^\/api\/files\//, '');
        cleanUrl = cleanUrl.replace(/^\//, '');

        if (cleanUrl !== originalUrl) {
          updates.qrCodeUrl = cleanUrl;
          needsUpdate = true;
        }
      }

      // Atualizar se necessário
      if (needsUpdate) {
        await person.update(updates);
        fixedCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Concluído! ${fixedCount} registro(s) corrigido(s)`);
    console.log('='.repeat(60));

    await sequelize.close();
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// Executar
fixDatabaseUrls();
