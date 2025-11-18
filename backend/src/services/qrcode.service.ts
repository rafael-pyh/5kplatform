import prisma from "../database/prisma";

export interface QRCodeScanData {
  personId: string;
  ipAddress?: string;
  userAgent?: string;
}

// Registrar uma visualização do QR Code
export const registerScan = async (data: QRCodeScanData) => {
  // Registra o scan
  const scan = await prisma.qRCodeScan.create({
    data: {
      personId: data.personId,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    },
  });

  // Incrementa o contador de scans da pessoa
  await prisma.person.update({
    where: { id: data.personId },
    data: {
      scanCount: {
        increment: 1,
      },
    },
  });

  return scan;
};

// Buscar histórico de scans de um vendedor
export const getScansByPerson = async (personId: string) => {
  return prisma.qRCodeScan.findMany({
    where: { personId },
    orderBy: { scannedAt: "desc" },
    take: 100,
  });
};

// Estatísticas de scans
export const getScansStats = async (personId?: string) => {
  const where = personId ? { personId } : {};

  const [total, today, thisWeek, thisMonth] = await Promise.all([
    prisma.qRCodeScan.count({ where }),
    prisma.qRCodeScan.count({
      where: {
        ...where,
        scannedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.qRCodeScan.count({
      where: {
        ...where,
        scannedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.qRCodeScan.count({
      where: {
        ...where,
        scannedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
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