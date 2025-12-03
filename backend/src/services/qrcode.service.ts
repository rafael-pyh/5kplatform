import sequelize from "../database/sequelize";
import { QRCodeScan } from "../models/QRCodeScan";
import { Person } from "../models/Person";
import { Op } from "sequelize";

export interface QRCodeScanData {
  personId: string;
  ipAddress?: string;
  userAgent?: string;
}

// Registrar uma visualização do QR Code
export const registerScan = async (data: QRCodeScanData) => {
  // Registra o scan com scannedAt explícito
  const scan = await QRCodeScan.create({
    ...data,
    scannedAt: new Date(),
  } as any);

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

// Função para gerar QR Code como base64
export const getQRCodeBase64 = async (qrCode: string): Promise<string> => {
  const { getQRCodeBase64ByCode } = await import("../utils/qr");
  return getQRCodeBase64ByCode(qrCode);
};
