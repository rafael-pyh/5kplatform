import sequelize from "../database/sequelize";
import { Person, PersonRole } from "../models/Person";
import { Lead } from "../models/Lead";
import { QRCodeScan } from "../models/QRCodeScan";
import { generateQRCode, generateQRCodeAndUpload } from "../utils/qr";
import { sendEmailConfirmation, sendVerificationEmail } from "../utils/email";
import { hashPassword } from "../utils/bcrypt";
import crypto from "crypto";
import { Validator } from "../shared/Validator";

export interface CreatePersonDto {
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  pixKey?: string;
  photoBase64?: string;
  city?: string;
  state?: string;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
}

export interface UpdatePersonDto {
  name?: string;
  email?: string;
  phone?: string;
  pixKey?: string;
  password?: string;
  photoBase64?: string;
  active?: boolean;
  city?: string;
  state?: string;
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

  // Gera o QR code e faz upload para S3
  console.log(`[createPerson] Gerando QR code para: ${qrCode}`);
  const qrCodeUrl = await generateQRCodeAndUpload(qrCode);
  console.log(`[createPerson] QR code URL gerado: ${qrCodeUrl}`);

  // Se email foi fornecido, gera token de verificação
  let verificationToken: string | undefined = undefined;
  let tokenExpiry: Date | undefined = undefined;

  if (data.email) {
    verificationToken = crypto.randomBytes(32).toString('hex');
    tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24); // 24 horas
  }

  // Hash da senha se fornecida
  let hashedPassword: string | undefined = undefined;
  if (data.password) {
    hashedPassword = await hashPassword(data.password);
  }

  // Valida foto de perfil (base64) se fornecida
  const MAX_PROFILE_BYTES = 2 * 1024 * 1024; // 2MB
  if (data.photoBase64) {
    Validator.isBase64DataUrl(data.photoBase64, 'Foto de perfil');
    Validator.maxBase64Size(data.photoBase64, MAX_PROFILE_BYTES, 'Foto de perfil');
  }

  // Cria a pessoa no banco (sempre como SELLER)
  // Se foi criado pelo admin (não tem senha), aprova automaticamente
  // Se foi registro público (tem senha), fica pendente
  const person = await Person.create({
    ...data,
    password: hashedPassword,
    qrCode,
    qrCodeUrl, // Salva a URL do QR code do S3
    role: PersonRole.SELLER,
    approvalStatus: !hashedPassword ? 'approved' : 'pending',
    verificationToken,
    tokenExpiry,
  });

  // Envia email baseado no tipo de registro
  if (data.email && verificationToken) {
    try {
      if (hashedPassword) {
        // Registro manual (usuário criou com senha) - envia email de confirmação
        console.log(`📧 [createPerson] Registro MANUAL - Enviando email de confirmação para: ${data.email}`);
        console.log(`📧 [createPerson] Tem senha: SIM (hashedPassword existe)`);
        await sendEmailConfirmation(data.email, data.name, verificationToken);
        console.log(`✅ [createPerson] Email de confirmação enviado com sucesso`);
      } else {
        // Criado pelo admin (sem senha) - envia email para criar senha
        console.log(`📧 [createPerson] Criado por ADMIN - Enviando email para criar senha para: ${data.email}`);
        console.log(`📧 [createPerson] Tem senha: NÃO (sem hashedPassword)`);
        await sendVerificationEmail(data.email, data.name, verificationToken);
        console.log(`✅ [createPerson] Email para criar senha enviado com sucesso`);
      }
    } catch (error) {
      console.error("❌ [createPerson] Erro ao enviar email:", error);
      // Não falha a criação se o email não for enviado
    }
  }

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
  
  // Hash da senha se estiver sendo atualizada
  const updateData: any = { ...data };
  if (data.password) {
    updateData.password = await hashPassword(data.password);
  }
  
  await person.update(updateData);
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
