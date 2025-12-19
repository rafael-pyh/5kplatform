import { Person } from "./src/models/Person";
import { Op } from "sequelize";
import { s3Client } from "./src/utils/minio";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import * as dotenv from "dotenv";

dotenv.config();

const QRCODE_BUCKET_NAME = process.env.S3_QRCODE_BUCKET || "qrcodes";
const S3_URL = process.env.S3_URL || process.env.S3_ENDPOINT || "https://s3.amazonaws.com";

/**
 * Script para migrar QR codes base64 existentes para o S3
 */
async function migrateQRCodesToS3() {
  try {
    console.log("🔄 Iniciando migração de QR codes para S3...\n");

    // Com S3, os buckets precisam existir antecipadamente
    console.log(`📁 Usando bucket: ${QRCODE_BUCKET_NAME}\n`);

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

        // Faz upload para S3
        const objectName = `qrcodes/${qrCode}.png`;

        const command = new PutObjectCommand({
          Bucket: QRCODE_BUCKET_NAME,
          Key: objectName,
          Body: buffer,
          ContentType: "image/png",
        });

        await s3Client.send(command);

        // Gera URL pública
        const qrCodeUrl = `${S3_URL}/${QRCODE_BUCKET_NAME}/${objectName}`;

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

migrateQRCodesToS3();
