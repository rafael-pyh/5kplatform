import sequelize from "../database/sequelize";
import { Lead, LeadStatus } from "../models/Lead";
import { Person } from "../models/Person";
import { Op } from "sequelize";
import { sendApprovalOrRejectionEmail } from "../utils/email";
import { env } from "../config/env";

export interface CreateLeadDto {
  name: string;
  email?: string;
  phone?: string;
  energyBill?: string;
  roofPhoto?: string;
  ownerId: string;
}

export interface UpdateLeadDto {
  name?: string;
  email?: string;
  phone?: string;
  energyBill?: string;
  roofPhoto?: string;
  status?: LeadStatus;
  notes?: string;
}

// Criar um novo lead (usado pelo formulário público)
export const createLead = async (data: CreateLeadDto) => {
  const lead = await Lead.create(data as any);
  await lead.reload({
    include: [{
      model: Person,
      as: 'owner',
      attributes: ['id', 'name', 'email', 'phone'],
    }],
  });
  return lead;
};

// Buscar todos os leads (admin)
export const getAllLeads = async (filters?: {
  status?: LeadStatus;
  ownerId?: string;
}) => {
  const where: any = {};
  if (filters?.status) where.status = filters.status;
  if (filters?.ownerId) where.ownerId = filters.ownerId;

  return Lead.findAll({
    where,
    include: [{
      model: Person,
      as: 'owner',
      attributes: ['id', 'name'],
    }],
    order: [['createdAt', 'DESC']],
  });
};

// Buscar leads de um vendedor específico (para o vendedor ver)
export const getLeadsByOwner = async (ownerId: string) => {
  return Lead.findAll({
    where: { ownerId },
    attributes: ['id', 'name', 'status', 'createdAt'],
    order: [['createdAt', 'DESC']],
  });
};

// Buscar um lead específico
export const getLeadById = async (id: string) => {
  const lead = await Lead.findByPk(id, {
    include: [{
      model: Person,
      as: 'owner',
      attributes: ['id', 'name', 'email', 'phone'],
    }],
  });

  if (!lead) {
    throw new Error("Lead não encontrado");
  }

  return lead;
};

// Atualizar um lead
export const updateLead = async (id: string, data: UpdateLeadDto) => {
  const lead = await Lead.findByPk(id);
  if (!lead) throw new Error("Lead não encontrado");
  
  await lead.update(data);
  await lead.reload({
    include: [{
      model: Person,
      as: 'owner',
      attributes: ['id', 'name'],
    }],
  });
  
  return lead;
};

// Atualizar apenas o status do lead
export const updateLeadStatus = async (id: string, status: LeadStatus) => {
  const lead = await Lead.findByPk(id, {
    include: [{
      model: Person,
      as: 'owner',
      attributes: ['id', 'name', 'email'],
    }],
  });
  if (!lead) throw new Error("Lead não encontrado");

  const previousStatus = lead.status;

  await lead.update({ status });

  // Recarrega para garantir owner atualizado
  await lead.reload({
    include: [{
      model: Person,
      as: 'owner',
      attributes: ['id', 'name', 'email'],
    }],
  });

  // Se o status mudou para BOUGHT, notifica o vendedor (caso tenha email)
  try {
    if (previousStatus !== LeadStatus.BOUGHT && status === LeadStatus.BOUGHT) {
      const owner = (lead as any).owner as Person | undefined;
      if (owner && owner.email) {
        const subject = '🎉 Cliente Finalizou Compra - 5K Energia Solar';
        const message = `O cliente ${lead.name} finalizou a compra.`;
        const buttonText = 'Ver no Painel';
        const buttonUrl = `${env.FRONTEND_URL}/seller/dashboard`;

        await sendApprovalOrRejectionEmail(owner.email, owner.name, subject, message, buttonText, buttonUrl);
      }
    }
  } catch (err) {
    console.error('Erro ao enviar email de notificação de compra:', err);
  }

  return lead;
};

// Deletar um lead
export const deleteLead = async (id: string) => {
  const lead = await Lead.findByPk(id);
  if (!lead) throw new Error("Lead não encontrado");
  
  await lead.destroy();
  return lead;
};

// Estatísticas gerais de leads
export const getLeadsStats = async () => {
  const [total, bought, negotiation, cancelled] = await Promise.all([
    Lead.count(),
    Lead.count({ where: { status: LeadStatus.BOUGHT } }),
    Lead.count({ where: { status: LeadStatus.NEGOTIATION } }),
    Lead.count({ where: { status: LeadStatus.CANCELLED } }),
  ]);

  return {
    total,
    bought,
    negotiation,
    cancelled,
    conversionRate: total > 0 ? ((bought / total) * 100).toFixed(2) + "%" : "0%",
  };
};

// Novos leads (últimos 7 dias)
export const getNewLeads = async (days: number = 7) => {
  const date = new Date();
  date.setDate(date.getDate() - days);

  return Lead.findAll({
    where: {
      createdAt: {
        [Op.gte]: date,
      },
    },
    include: [{
      model: Person,
      as: 'owner',
      attributes: ['id', 'name'],
    }],
    order: [['createdAt', 'DESC']],
  });
};

// Buscar leads de um vendedor com detalhes completos (para área do vendedor)
export const getSellerLeads = async (sellerId: string, filters?: { status?: LeadStatus }) => {
  const where: any = { ownerId: sellerId };
  if (filters?.status) where.status = filters.status;

  return Lead.findAll({
    where,
    attributes: ['id', 'name', 'email', 'phone', 'status', 'createdAt', 'updatedAt'],
    order: [['createdAt', 'DESC']],
  });
};

// Buscar lead específico de um vendedor
export const getSellerLeadById = async (sellerId: string, leadId: string) => {
  const lead = await Lead.findOne({
    where: {
      id: leadId,
      ownerId: sellerId,
    },
    attributes: ['id', 'name', 'email', 'phone', 'status', 'createdAt', 'updatedAt'],
  });

  if (!lead) {
    throw new Error("Lead não encontrado");
  }

  return lead;
};

// Estatísticas de leads de um vendedor
export const getSellerLeadsStats = async (sellerId: string) => {
  const [total, bought, negotiation, cancelled] = await Promise.all([
    Lead.count({ where: { ownerId: sellerId } }),
    Lead.count({ where: { ownerId: sellerId, status: LeadStatus.BOUGHT } }),
    Lead.count({ where: { ownerId: sellerId, status: LeadStatus.NEGOTIATION } }),
    Lead.count({ where: { ownerId: sellerId, status: LeadStatus.CANCELLED } }),
  ]);

  return {
    total,
    bought,
    negotiation,
    cancelled,
    conversionRate: total > 0 ? ((bought / total) * 100).toFixed(2) + "%" : "0%",
  };
};
