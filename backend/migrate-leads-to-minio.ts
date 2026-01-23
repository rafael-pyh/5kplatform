import { Lead } from "./src/models/Lead";
import { Op } from "sequelize";
import { uploadBase64ToS3 } from "./src/services/storage.service";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Script para migrar imagens base64 de leads existentes para o S3
 */
async function migrateLeadImagesToS3() {
  try {
    console.log("🔄 Iniciando migração de imagens de leads para S3...\n");

    // Busca todos os leads com energyBill ou roofPhoto em base64
    const leads = await Lead.findAll({
      where: {
        [Op.or]: [
          { energyBill: { [Op.ne]: null, [Op.notLike]: 'http%' } },
          { roofPhoto: { [Op.ne]: null, [Op.notLike]: 'http%' } }
        ]
      },
      attributes: ["id", "name", "energyBill", "roofPhoto"],
    });

    console.log(`📊 Encontrados ${leads.length} leads com imagens para migrar\n`);

    if (leads.length === 0) {
      console.log("✅ Nenhuma imagem para migrar!");
      process.exit(0);
    }

    let successCount = 0;
    let errorCount = 0;

    // Processa cada lead
    for (const lead of leads) {
      try {
        const updates: any = {};

        if (lead.energyBill && !lead.energyBill.startsWith('http')) {
          // Upload da conta de energia
          const energyBillUrl = await uploadBase64ToS3(lead.energyBill, 'energy-bill.jpg', 'leads');
          updates.energyBill = energyBillUrl;
        }

        if (lead.roofPhoto && !lead.roofPhoto.startsWith('http')) {
          // Upload da foto do telhado
          const roofPhotoUrl = await uploadBase64ToS3(lead.roofPhoto, 'roof-photo.jpg', 'leads');
          updates.roofPhoto = roofPhotoUrl;
        }

        if (Object.keys(updates).length > 0) {
          await lead.update(updates);
          successCount++;
        }
      } catch (error: any) {
        console.error(`❌ Erro ao migrar lead ${lead.id}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n📈 Resumo da Migração:`);
    console.log(`✅ Sucesso: ${successCount}`);
    console.log(`❌ Erros: ${errorCount}`);
    console.log(`📊 Total: ${leads.length}`);

    process.exit(0);
  } catch (error: any) {
    console.error("❌ Erro fatal:", error);
    process.exit(1);
  }
}

migrateLeadImagesToS3();