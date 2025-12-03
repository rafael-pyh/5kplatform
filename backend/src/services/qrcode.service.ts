import sequelize from "../database/sequelize";
import { QRCodeScan } from "../models/QRCodeScan";
import { Person } from "../models/Person";
import { Op } from "sequelize";
import { minioClient } from "../utils/minio"; // Certifique-se de que o utilitário MinIO está configurado

export interface QRCodeScanData {
  personId: string;
  ipAddress?: string;
  userAgent?: string;
}

// Registrar uma visualização do QR Code
export const registerScan = async (data: QRCodeScanData) => {
  // Registra o scan
  const scan = await QRCodeScan.create(data as any);

  // Incrementa o contador de scans da pessoa
  await Person.increment('scanCount', {
    where: { id: data.personId },
  });

  return scan;
};

// Buscar histórico de scans de um vendedor
export const getScansByPerson = async (personId: string) => {
  return QRCodeScan.findAll({
    where: { personId },
    order: [['scannedAt', 'DESC']],
    limit: 100,
  });
};

// Estatísticas de scans
export const getScansStats = async (personId?: string) => {
  const where: any = personId ? { personId } : {};

  const [total, today, thisWeek, thisMonth] = await Promise.all([
    QRCodeScan.count({ where }),
    QRCodeScan.count({
      where: {
        ...where,
        scannedAt: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    QRCodeScan.count({
      where: {
        ...where,
        scannedAt: {
          [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    QRCodeScan.count({
      where: {
        ...where,
        scannedAt: {
          [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),
  ]);

  return {
    total,
    today,
    thisWeek,
    thisMonth,
  };
};

// Função para obter o stream do QR Code no bucket
export const getQRCodeStream = async (qrCodePath: string) => {
  // qrCodePath já é o caminho direto no bucket (ex: "qrcodes/uuid-QR-123.png")
  const bucketName = "uploads";
  
  // Retorna o stream do objeto
  return minioClient.getObject(bucketName, qrCodePath);
};

// Função para gerar QR Code como base64
export const getQRCodeBase64 = async (qrCode: string): Promise<string> => {
  const { getQRCodeBase64ByCode } = await import("../utils/qr");
  return getQRCodeBase64ByCode(qrCode);
};
