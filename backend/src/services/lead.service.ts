import prisma from "../database/prisma";

// Definir os tipos manualmente até o Prisma Client ser gerado
type LeadStatus = "BOUGHT" | "CANCELLED" | "NEGOTIATION";

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
  return prisma.lead.create({
    data,
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });
};

// Buscar todos os leads (admin)
export const getAllLeads = async (filters?: {
  status?: LeadStatus;
  ownerId?: string;
}) => {
  return prisma.lead.findMany({
    where: {
      status: filters?.status,
      ownerId: filters?.ownerId,
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

// Buscar leads de um vendedor específico (para o vendedor ver)
export const getLeadsByOwner = async (ownerId: string) => {
  return prisma.lead.findMany({
    where: { ownerId },
    select: {
      id: true,
      name: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

// Buscar um lead específico
export const getLeadById = async (id: string) => {
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!lead) {
    throw new Error("Lead não encontrado");
  }

  return lead;
};

// Atualizar um lead
export const updateLead = async (id: string, data: UpdateLeadDto) => {
  return prisma.lead.update({
    where: { id },
    data,
    include: {
      owner: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

// Atualizar apenas o status do lead
export const updateLeadStatus = async (id: string, status: LeadStatus) => {
  return prisma.lead.update({
    where: { id },
    data: { status },
  });
};

// Deletar um lead
export const deleteLead = async (id: string) => {
  return prisma.lead.delete({
    where: { id },
  });
};

// Estatísticas gerais de leads
export const getLeadsStats = async () => {
  const [total, bought, negotiation, cancelled] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "BOUGHT" } }),
    prisma.lead.count({ where: { status: "NEGOTIATION" } }),
    prisma.lead.count({ where: { status: "CANCELLED" } }),
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

  return prisma.lead.findMany({
    where: {
      createdAt: {
        gte: date,
      },
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

// Buscar leads de um vendedor com detalhes completos (para área do vendedor)
export const getSellerLeads = async (sellerId: string, filters?: { status?: LeadStatus }) => {
  return prisma.lead.findMany({
    where: {
      ownerId: sellerId,
      status: filters?.status,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

// Buscar lead específico de um vendedor
export const getSellerLeadById = async (sellerId: string, leadId: string) => {
  const lead = await prisma.lead.findFirst({
    where: {
      id: leadId,
      ownerId: sellerId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!lead) {
    throw new Error("Lead não encontrado");
  }

  return lead;
};

// Estatísticas de leads de um vendedor
export const getSellerLeadsStats = async (sellerId: string) => {
  const [total, bought, negotiation, cancelled] = await Promise.all([
    prisma.lead.count({ where: { ownerId: sellerId } }),
    prisma.lead.count({ where: { ownerId: sellerId, status: "BOUGHT" } }),
    prisma.lead.count({ where: { ownerId: sellerId, status: "NEGOTIATION" } }),
    prisma.lead.count({ where: { ownerId: sellerId, status: "CANCELLED" } }),
  ]);

  return {
    total,
    bought,
    negotiation,
    cancelled,
    conversionRate: total > 0 ? ((bought / total) * 100).toFixed(2) + "%" : "0%",
  };
};