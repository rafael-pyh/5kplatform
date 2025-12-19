import { Router, Request, Response, NextFunction } from "express";
import { Person } from "../models/Person";
import minioClient from "../utils/minio";
import { requireSuperAdmin } from "../middlewares/auth.middleware";
import { ResponseBuilder } from "../shared/ResponseBuilder";
import { Op } from "sequelize";

const router = Router();

const QRCODE_BUCKET_NAME = process.env.MINIO_QRCODE_BUCKET || "qrcodes";
const MINIO_URL = process.env.MINIO_URL || "http://localhost:9000";

/**
 * POST /admin/migrate-qrcodes
 * Migra QR codes base64 existentes para o Minio
 * Apenas admins podem executar
 */
router.post(
  "/migrate-qrcodes",
  requireSuperAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("🔄 Iniciando migração de QR codes para Minio...\n");

      // Garante que o bucket existe
      const bucketExists = await minioClient.bucketExists(QRCODE_BUCKET_NAME);
      if (!bucketExists) {
        await minioClient.makeBucket(QRCODE_BUCKET_NAME, "us-east-1");
        console.log(`✅ Bucket '${QRCODE_BUCKET_NAME}' criado\n`);
      }

      // Busca todas as pessoas com qrCodeBase64 mas sem qrCodeUrl (ou com qrCodeUrl vazio)
      const people = await Person.findAll({
        where: {
          qrCodeBase64: {
            [Op.ne]: null,
          },
        },
        attributes: ["id", "name", "qrCode", "qrCodeBase64"],
        raw: true,
      });

      console.log(`📊 Encontradas ${people.length} pessoas com QR codes para migrar\n`);

      if (people.length === 0) {
        return ResponseBuilder.success(res, {
          message: "Nenhum QR code para migrar",
          successCount: 0,
          errorCount: 0,
          total: 0,
        });
      }

      let successCount = 0;
      let errorCount = 0;
      const results: any[] = [];

      // Processa cada pessoa
      for (const person of people) {
        try {
          const qrCodeBase64 = (person as any).qrCodeBase64 as string;
          const qrCode = (person as any).qrCode;

          if (!qrCodeBase64 || !qrCode) {
            console.log(`⚠️  Pulando ${(person as any).name} - qrCodeBase64 ou qrCode vazio`);
            results.push({
              name: (person as any).name,
              qrCode,
              status: "skipped",
              reason: "qrCodeBase64 ou qrCode vazio",
            });
            continue;
          }

          // Converte base64 para buffer
          const base64Data = qrCodeBase64.replace(
            /^data:image\/\w+;base64,/,
            ""
          );
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
          await Person.update({ qrCodeUrl }, { where: { id: (person as any).id } });

          successCount++;
          console.log(
            `✅ ${(person as any).name} (${qrCode}) - URL: ${qrCodeUrl}`
          );

          results.push({
            name: (person as any).name,
            qrCode,
            status: "success",
            qrCodeUrl,
          });
        } catch (error: any) {
          errorCount++;
          console.error(
            `❌ Erro ao processar ${(person as any).name}:`,
            error.message
          );

          results.push({
            name: (person as any).name,
            qrCode: (person as any).qrCode,
            status: "error",
            error: error.message,
          });
        }
      }

      console.log(`\n📈 Resumo da Migração:`);
      console.log(`✅ Sucesso: ${successCount}`);
      console.log(`❌ Erros: ${errorCount}`);
      console.log(`📊 Total: ${people.length}`);

      return ResponseBuilder.success(res, {
        message: "Migração de QR codes concluída",
        successCount,
        errorCount,
        total: people.length,
        results,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
