import prisma from "../database/prisma";
import { generateQRCode, generateQRCodeImage } from "../utils/qr";

export interface CreatePersonDto {
  name: string;
  email?: string;
  phone?: string;
  pixKey?: string;
  photoUrl?: string;
}

export interface UpdatePersonDto {
  name?: string;
  email?: string;
  phone?: string;
  pixKey?: string;
  photoUrl?: string;
  active?: boolean;
}

export const createPerson = async (data: CreatePersonDto) => {
  // Gera o código único do QR
  const qrCode = generateQRCode();

  // Cria a pessoa no banco
  const person = await prisma.person.create({
    data: {
      ...data,
      qrCode,
    },
  });

  // Gera a imagem do QR Code e faz upload
  try {
    const qrCodeUrl = await generateQRCodeImage(qrCode, person.id);
    
    // Atualiza com a URL do QR Code
    return await prisma.person.update({
      where: { id: person.id },
      data: { qrCodeUrl },
      include: {
        leads: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        _count: {
          select: { leads: true, qrCodeScans: true },
        },
      },
    });
  } catch (error) {
    // Se falhar ao gerar o QR, retorna a pessoa mesmo assim
    console.error("Erro ao gerar QR Code:", error);
    return person;
  }
};

export const getAll = async (activeOnly: boolean = false) => {
  return prisma.person.findMany({
    where: activeOnly ? { active: true } : undefined,
    include: {
      _count: {
        select: {
          leads: true,
          qrCodeScans: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getById = async (id: string) => {
  const person = await prisma.person.findUnique({
    where: { id },
    include: {
      leads: {
        orderBy: { createdAt: "desc" },
      },
      qrCodeScans: {
        orderBy: { scannedAt: "desc" },
        take: 50,
      },
      _count: {
        select: {
          leads: true,
          qrCodeScans: true,
        },
      },
    },
  });

  if (!person) {
    throw new Error("Vendedor não encontrado");
  }

  return person;
};

export const getByQRCode = async (qrCode: string) => {
  const person = await prisma.person.findUnique({
    where: { qrCode },
    select: {
      id: true,
      name: true,
      qrCode: true,
      active: true,
    },
  });

  if (!person) {
    throw new Error("QR Code inválido");
  }

  if (!person.active) {
    throw new Error("Vendedor desativado");
  }

  return person;
};

export const updateById = async (id: string, data: UpdatePersonDto) => {
  return prisma.person.update({
    where: { id },
    data,
    include: {
      _count: {
        select: {
          leads: true,
          qrCodeScans: true,
        },
      },
    },
  });
};

export const deleteById = async (id: string) => {
  // Soft delete - apenas desativa
  return prisma.person.update({
    where: { id },
    data: { active: false },
  });
};

export const hardDeleteById = async (id: string) => {
  // Hard delete - remove permanentemente
  return prisma.person.delete({
    where: { id },
  });
};

// Estatísticas do vendedor
export const getPersonStats = async (id: string) => {
  const person = await prisma.person.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          leads: true,
          qrCodeScans: true,
        },
      },
      leads: {
        select: {
          status: true,
        },
      },
    },
  });

  if (!person) {
    throw new Error("Vendedor não encontrado");
  }

  const leadsCount = {
    total: person._count.leads,
    bought: person.leads.filter((l: any) => l.status === "BOUGHT").length,
    negotiation: person.leads.filter((l: any) => l.status === "NEGOTIATION").length,
    cancelled: person.leads.filter((l: any) => l.status === "CANCELLED").length,
  };

  return {
    id: person.id,
    name: person.name,
    scanCount: person._count.qrCodeScans,
    leads: leadsCount,
    conversionRate:
      leadsCount.total > 0
        ? ((leadsCount.bought / leadsCount.total) * 100).toFixed(2) + "%"
        : "0%",
  };
};