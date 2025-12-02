import sequelize from "../database/sequelize";
import { Person, PersonRole } from "../models/Person";
import { Lead } from "../models/Lead";
import { QRCodeScan } from "../models/QRCodeScan";
import { generateQRCode, generateQRCodeImage } from "../utils/qr";
import { sendVerificationEmail } from "../utils/email";
import crypto from "crypto";

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
  // Verifica se email já existe
  if (data.email) {
    const existingPerson = await Person.findOne({
      where: { email: data.email },
    });

    if (existingPerson) {
      throw new Error(`Email ${data.email} já está cadastrado no sistema`);
    }
  }

  // Gera o código único do QR
  const qrCode = generateQRCode();

  // Se email foi fornecido, gera token de verificação
  let verificationToken: string | undefined = undefined;
  let tokenExpiry: Date | undefined = undefined;

  if (data.email) {
    verificationToken = crypto.randomBytes(32).toString('hex');
    tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24); // 24 horas
  }

  // Cria a pessoa no banco (sempre como SELLER)
  const person = await Person.create({
    ...data,
    qrCode,
    role: PersonRole.SELLER,
    verificationToken,
    tokenExpiry,
  });

  // Envia email de verificação se email foi fornecido
  if (data.email && verificationToken) {
    try {
      await sendVerificationEmail(data.email, data.name, verificationToken);
      console.log(`Email de verificação enviado para ${data.email}`);
    } catch (error) {
      console.error("Erro ao enviar email de verificação:", error);
      // Não falha a criação se o email não for enviado
    }
  }

  // Gera a imagem do QR Code e faz upload
  try {
    const qrCodeUrl = await generateQRCodeImage(qrCode, person.id);
    
    // Atualiza com a URL do QR Code
    await person.update({ qrCodeUrl });
    await person.reload({
      include: [
        {
          model: Lead,
          as: 'leads',
          limit: 5,
          order: [['createdAt', 'DESC']],
        },
      ],
    });
    
    return person;
  } catch (error) {
    // Se falhar ao gerar o QR, retorna a pessoa mesmo assim
    console.error("Erro ao gerar QR Code:", error);
    return person;
  }
};

export const getAll = async (activeOnly: boolean = false) => {
  const where: any = { role: PersonRole.SELLER };
  if (activeOnly) where.active = true;

  return Person.findAll({
    where,
    include: [
      {
        model: Lead,
        as: 'leads',
        attributes: [],
      },
      {
        model: QRCodeScan,
        as: 'qrCodeScans',
        attributes: [],
      },
    ],
    attributes: {
      include: [
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('leads.id'))), 'leadsCount'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('qrCodeScans.id'))), 'scansCount'],
      ],
    },
    group: ['Person.id'],
    order: [['createdAt', 'DESC']],
    subQuery: false,
  });
};

export const getById = async (id: string) => {
  const person = await Person.findByPk(id, {
    include: [
      {
        model: Lead,
        as: 'leads',
        order: [['createdAt', 'DESC']],
      },
      {
        model: QRCodeScan,
        as: 'qrCodeScans',
        limit: 50,
        order: [['scannedAt', 'DESC']],
      },
    ],
  });

  if (!person) {
    throw new Error("Vendedor não encontrado");
  }

  return person;
};

export const getByQRCode = async (qrCode: string) => {
  const person = await Person.findOne({
    where: { qrCode },
    attributes: ['id', 'name', 'qrCode', 'active'],
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
  const person = await Person.findByPk(id);
  if (!person) throw new Error("Vendedor não encontrado");
  
  await person.update(data);
  await person.reload();
  
  return person;
};

export const deleteById = async (id: string) => {
  // Soft delete - apenas desativa
  const person = await Person.findByPk(id);
  if (!person) throw new Error("Vendedor não encontrado");
  
  await person.update({ active: false });
  return person;
};

export const hardDeleteById = async (id: string) => {
  // Hard delete - remove permanentemente
  const person = await Person.findByPk(id);
  if (!person) throw new Error("Vendedor não encontrado");
  
  await person.destroy();
  return person;
};

// Estatísticas do vendedor
export const getPersonStats = async (id: string) => {
  const person = await Person.findByPk(id, {
    include: [
      {
        model: Lead,
        as: 'leads',
        attributes: ['status'],
      },
      {
        model: QRCodeScan,
        as: 'qrCodeScans',
        attributes: [],
      },
    ],
  });

  if (!person) {
    throw new Error("Vendedor não encontrado");
  }

  const leads = person.leads || [];
  const leadsCount = {
    total: leads.length,
    bought: leads.filter((l: any) => l.status === "BOUGHT").length,
    negotiation: leads.filter((l: any) => l.status === "NEGOTIATION").length,
    cancelled: leads.filter((l: any) => l.status === "CANCELLED").length,
  };

  const scanCount = await QRCodeScan.count({ where: { personId: id } });

  return {
    id: person.id,
    name: person.name,
    scanCount,
    leads: leadsCount,
    conversionRate:
      leadsCount.total > 0
        ? ((leadsCount.bought / leadsCount.total) * 100).toFixed(2) + "%"
        : "0%",
  };
};
