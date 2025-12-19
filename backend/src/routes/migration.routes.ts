import { Router, Request, Response, NextFunction } from "express";
import { Person } from "../models/Person";
import { s3Client } from "../utils/minio";
import { requireSuperAdmin } from "../middlewares/auth.middleware";
import { ResponseBuilder } from "../shared/ResponseBuilder";
import { Op } from "sequelize";
import { PutObjectCommand } from "@aws-sdk/client-s3";

const router = Router();

const QRCODE_BUCKET_NAME = process.env.S3_QRCODE_BUCKET || "qrcodes";
const S3_URL = process.env.S3_URL || process.env.S3_ENDPOINT || "https://s3.amazonaws.com";

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
      console.log("🔄 Iniciando migração de QR codes para S3...\n");

      // Com S3, os buckets precisam existir antecipadamente
      // Apenas fazemos o upload
      console.log(`📁 Usando bucket: ${QRCODE_BUCKET_NAME}\n`);

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

/**
 * POST /admin/regenerate-qrcode-base64
 * Regenera qrCodeBase64 para pessoas antigas que têm qrCode mas não têm qrCodeBase64
 */
router.post(
  "/regenerate-qrcode-base64",
  requireSuperAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("🔄 Iniciando regeneração de QR codes base64...\n");

      // Busca todas as pessoas que têm qrCode mas qrCodeBase64 é null
      const people = await Person.findAll({
        where: {
          qrCode: {
            [Op.ne]: null,
          },
          qrCodeBase64: {
            [Op.is]: null,
          },
        },
        attributes: ["id", "name", "qrCode"],
        raw: true,
      });

      console.log(`📊 Encontradas ${people.length} pessoas para regenerar QR codes base64\n`);

      if (people.length === 0) {
        return ResponseBuilder.success(res, {
          message: "Nenhum QR code para regenerar",
          successCount: 0,
          errorCount: 0,
          total: 0,
        });
      }

      const { getQRCodeBase64ByCode } = await import("../utils/qr");

      let successCount = 0;
      let errorCount = 0;
      const results = [];

      for (const person of people) {
        try {
          const qrCode = (person as any).qrCode;
          console.log(`🔄 Regenerando QR code base64 para: ${(person as any).name} (${qrCode})`);

          // Gera o base64 do QR code
          const qrCodeBase64 = await getQRCodeBase64ByCode(qrCode);
          console.log(`✅ Base64 gerado: ${qrCodeBase64.substring(0, 50)}...`);

          // Atualiza a pessoa com o novo base64
          await Person.update(
            { qrCodeBase64 },
            { where: { id: (person as any).id } }
          );

          successCount++;
          console.log(
            `✅ ${(person as any).name} (${qrCode}) - Base64 regenerado e salvo`
          );

          results.push({
            name: (person as any).name,
            qrCode,
            status: "success",
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

      console.log(`\n📈 Resumo da Regeneração:`);
      console.log(`✅ Sucesso: ${successCount}`);
      console.log(`❌ Erros: ${errorCount}`);
      console.log(`📊 Total: ${people.length}`);

      return ResponseBuilder.success(res, {
        message: "Regeneração de QR codes base64 concluída",
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
