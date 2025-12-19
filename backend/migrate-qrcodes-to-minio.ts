import { Person } from "./src/models/Person";
import { Op } from "sequelize";
import minioClient from "./src/utils/minio";
import * as dotenv from "dotenv";

dotenv.config();

const QRCODE_BUCKET_NAME = process.env.MINIO_QRCODE_BUCKET || "qrcodes";
const MINIO_URL = process.env.MINIO_URL || "http://localhost:9000";

/**
 * Script para migrar QR codes base64 existentes para o Minio
 */
async function migrateQRCodesToMinio() {
  try {
    console.log("🔄 Iniciando migração de QR codes para Minio...\n");

    // Garante que o bucket existe
    const bucketExists = await minioClient.bucketExists(QRCODE_BUCKET_NAME);
    if (!bucketExists) {
      await minioClient.makeBucket(QRCODE_BUCKET_NAME, "us-east-1");
      console.log(`✅ Bucket '${QRCODE_BUCKET_NAME}' criado\n`);
    } else {
      console.log(`✅ Bucket '${QRCODE_BUCKET_NAME}' já existe\n`);
    }

    // Busca todas as pessoas com qrCodeBase64 mas sem qrCodeUrl
    const people = await Person.findAll({
      where: {
        qrCodeBase64: {
          [Op.ne]: null,
        },
      },
      attributes: ["id", "name", "qrCode", "qrCodeBase64"],
    });

    console.log(`📊 Encontradas ${people.length} pessoas com QR codes para migrar\n`);

    if (people.length === 0) {
      console.log("✅ Nenhum QR code para migrar!");
      process.exit(0);
    }

    let successCount = 0;
    let errorCount = 0;

    // Processa cada pessoa
    for (const person of people) {
      try {
        const qrCodeBase64 = (person as any).qrCodeBase64 as string;
        const qrCode = (person as any).qrCode;

        if (!qrCodeBase64 || !qrCode) {
          console.log(`⚠️  Pulando ${person.name} - qrCodeBase64 ou qrCode vazio`);
          continue;
        }

        // Converte base64 para buffer
        const base64Data = qrCodeBase64.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");

        // Faz upload para Minio
        const objectName = `qrcodes/${qrCode}.png`;

        await minioClient.putObject(
          QRCODE_BUCKET_NAME,
          objectName,
          buffer,
          buffer.length,
          {
            "Content-Type": "image/png",
          }
        );

        // Gera URL pública
        const qrCodeUrl = `${MINIO_URL}/${QRCODE_BUCKET_NAME}/${objectName}`;

        // Atualiza a pessoa no banco
        await person.update({ qrCodeUrl });

        successCount++;
        console.log(`✅ ${person.name} (${qrCode}) - URL: ${qrCodeUrl}`);
      } catch (error: any) {
        errorCount++;
        console.error(
          `❌ Erro ao processar ${person.name}:`,
          error.message
        );
      }
    }

    console.log(`\n📈 Resumo da Migração:`);
    console.log(`✅ Sucesso: ${successCount}`);
    console.log(`❌ Erros: ${errorCount}`);
    console.log(`📊 Total: ${people.length}`);

    process.exit(0);
  } catch (error: any) {
    console.error("❌ Erro fatal:", error);
    process.exit(1);
  }
}

migrateQRCodesToMinio();
