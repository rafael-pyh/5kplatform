import sequelize from "../database/sequelize";
import { Person, PersonRole } from "../models/Person";
import { Lead } from "../models/Lead";
import { QRCodeScan } from "../models/QRCodeScan";
import { generateQRCode, generateQRCodeAndUpload } from "../utils/qr";
import { sendEmailConfirmation, sendVerificationEmail } from "../utils/email";
import { hashPassword } from "../utils/bcrypt";
import { uploadBase64ToS3 } from "./storage.service";
import crypto from "crypto";
import { Validator } from "../shared/Validator";
import { ConflictError } from "../shared/errors";

export interface CreatePersonDto {
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  pixKey?: string;
  photoBase64?: string;
  city?: string;
  state?: string;
  cpf?: string;
  birthDate?: Date | string;
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
  cpf?: string;
  birthDate?: Date | string;
}

export const createPerson = async (data: CreatePersonDto) => {

  // Validações básicas e limites de tamanho para evitar payloads excessivos
  if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
    throw new Error('Nome é obrigatório');
  }
  Validator.maxLength(data.name, 100, 'Nome');
  if (data.email) {
    Validator.email(data.email);
    Validator.maxLength(data.email, 254, 'Email');
  }
  if (data.phone) {
    // mantém apenas dígitos — mas limita o tamanho
    if (typeof data.phone === 'string') Validator.maxLength(data.phone, 11, 'Telefone');
  }
  if (data.pixKey) {
    Validator.maxLength(data.pixKey, 77, 'Chave Pix');
  }
  if (data.city) {
    Validator.maxLength(data.city, 100, 'Cidade');
  }
  if (data.password) {
    Validator.maxLength(data.password, 128, 'Senha');
    Validator.minLength(data.password, 8, 'Senha');
  }

  // Verifica se email já existe
  if (data.email) {
    const existingPerson = await Person.findOne({
      where: { email: data.email },
    });

    if (existingPerson) {
      throw new ConflictError("Usuário já existe. Faça login para continuar.");
    }
  }

  // Gera o código único do QR
  const qrCode = generateQRCode();

  // Gera o QR code e faz upload para S3
  const qrCodeUrl = await generateQRCodeAndUpload(qrCode);

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

  // Faz upload da foto base64 para S3 se fornecida
  let photoUrl: string | undefined = undefined;
  if (data.photoBase64) {
    if (typeof data.photoBase64 !== 'string' || data.photoBase64.trim() === '') {
      throw new Error('Foto de perfil deve ser uma imagem válida em base64');
    }
    
    try {
      // Gera nome do arquivo baseado no email ou timestamp
      const fileName = data.email 
        ? `${data.email.replace('@', '_').replace(/\./g, '_')}.jpg`
        : `profile_${Date.now()}.jpg`;
      
      photoUrl = await uploadBase64ToS3(data.photoBase64, fileName, 'profile-photos');
    } catch (uploadError) {
      throw uploadError;
    }
  }

  // Cria a pessoa no banco (sempre como SELLER)
  // Se foi criado pelo admin (não tem senha), aprova automaticamente
  // Se foi registro público (tem senha), fica pendente
  const person = await Person.create({
    name: data.name,
    email: data.email,
    phone: data.phone,
    pixKey: data.pixKey,
    photoBase64: photoUrl, // Salva apenas a URL do S3, não o base64
    city: data.city,
    state: data.state,
    cpf: data.cpf || null,
    birthDate: data.birthDate || null,
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
        await sendEmailConfirmation(data.email, data.name, verificationToken);
      } else {
        // Criado pelo admin (sem senha) - envia email para criar senha
        await sendVerificationEmail(data.email, data.name, verificationToken);
      }
    } catch (error) {
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
  const where: any = { role: [PersonRole.SELLER, PersonRole.AFFILIATE] };
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
  
  // Faz upload de photoBase64 para S3 se fornecido
  if (data.photoBase64) {
    try {
      const fileName = person.email 
        ? `${person.email.replace('@', '_').replace(/\./g, '_')}.jpg`
        : `profile_${person.id}.jpg`;
      
      const photoUrl = await uploadBase64ToS3(data.photoBase64, fileName, 'profile-photos');
      updateData.photoBase64 = photoUrl; // Salva apenas a URL, não o base64
    } catch (error) {
      throw error;
    }
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

export const activate = async (id: string) => {
  // Reativa um vendedor desativado
  const person = await Person.findByPk(id);
  if (!person) throw new Error("Vendedor não encontrado");
  
  await person.update({ active: true });
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
