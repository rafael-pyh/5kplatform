import { Order, OrderStatus } from '../models/Order';
import { PaymentProof } from '../models/PaymentProof';
import { Kit } from '../models/Kit';
import { Person } from '../models/Person';
import { uploadFileToMinIO } from './storage.service';
import { Op } from 'sequelize';
import { CreditTransactionType } from '../models/CreditTransaction';

// Tipo para parâmetros de transação de crédito (mesmo do credit.service)
interface CreditTransactionParams {
  personId: string;
  type: CreditTransactionType;
  amount: number;
  description?: string;
  orderId?: string;
  withdrawalRequestId?: string;
  adjustedByUserId?: string;
}

/**
 * Order Service
 * Gerencia fluxo de pedidos: criação, comprovantes, aprovação
 * Validações importantes:
 * - Pedido não pode ser aprovado sem comprovante (a menos que pague com créditos)
 * - Sempre gerar código único e legível
 *
 * NOTA: credit.service é importado dinamicamente para evitar circular imports
 */

/**
 * Obter módulo de créditos (lazy import para evitar circular dependency)
 */
async function getCreditServiceModule() {
  // @ts-ignore - import dinâmico
  const { addCreditTransaction, getCreditBalance } = await import('./credit.service');
  return { addCreditTransaction, getCreditBalance };
}

/**
 * Gerar código único de pedido
 * Formato: YYYY-MM-DD-XXXX (ex: 2025-01-20-A1B2)
 * X = caracteres aleatórios (letras maiúsculas + números)
 */
const generateOrderCode = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  // Gerar 4 caracteres aleatórios (letras maiúsculas + números)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `${year}-${month}-${day}-${randomPart}`;
};

interface CreateOrderInput {
  personId: string;
  kitId: string;
  useCredit?: boolean;
  notes?: string;
}

/**
 * Criar novo pedido
 * Status inicial: PENDING_PAYMENT ou PAID (se usar créditos)
 */
export const createOrder = async (input: CreateOrderInput): Promise<Order> => {
  try {
    const { personId, kitId, useCredit = false, notes } = input;

    // Validar pessoa
    const person = await Person.findByPk(personId);
    if (!person) {
      throw new Error('Pessoa não encontrada');
    }

    // Validar kit
    const kit = await Kit.findByPk(kitId, {
      include: ['items'],
    });
    if (!kit) {
      throw new Error('Kit não encontrado');
    }

    if (!kit.active) {
      throw new Error('Kit não está ativo');
    }

    // Se usar créditos, verificar se tem saldo suficiente
    if (useCredit) {
      const { getCreditBalance } = await getCreditServiceModule();
      const balance = await getCreditBalance(personId);
      if (balance < kit.price) {
        throw new Error(
          `Saldo insuficiente. Disponível: R$ ${balance.toFixed(2)}, Necessário: R$ ${kit.price.toFixed(2)}`
        );
      }
    }

    // Gerar código único
    let orderCode = generateOrderCode();
    let exists = await Order.findOne({ where: { orderCode } });
    while (exists) {
      orderCode = generateOrderCode();
      exists = await Order.findOne({ where: { orderCode } });
    }

    // Criar pedido
    const initialStatus = useCredit ? OrderStatus.PAID : OrderStatus.PENDING_PAYMENT;

    const order = await Order.create({
      orderCode,
      personId,
      kitId,
      totalPrice: kit.price,
      status: initialStatus,
      usesCredit: useCredit,
      notes,
    });

    // Se usar créditos, criar transação imediatamente
    if (useCredit) {
      const { addCreditTransaction } = await getCreditServiceModule();
      const params: CreditTransactionParams = {
        personId,
        type: CreditTransactionType.KIT_PURCHASE,
        amount: -kit.price,
        description: `Compra de kit ${kit.name} (Pedido: ${orderCode})`,
        orderId: order.id,
      };
      await addCreditTransaction(params);
    }

    return order;
  } catch (error: any) {
    console.error('Erro ao criar pedido:', error);
    throw new Error(`Erro ao criar pedido: ${error.message}`);
  }
};

/**
 * Listar pedidos com filtros
 */
export const listOrders = async (
  limit: number = 50,
  offset: number = 0,
  filters?: {
    personId?: string;
    status?: OrderStatus;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<{ total: number; orders: Order[] }> => {
  try {
    const where: any = {};

    if (filters?.personId) {
      where.personId = filters.personId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters?.startDate) {
        where.createdAt[Op.gte] = filters.startDate;
      }
      if (filters?.endDate) {
        where.createdAt[Op.lte] = filters.endDate;
      }
    }

    const { count, rows } = await Order.findAndCountAll({
      where: Object.keys(where).length > 0 ? where : undefined,
      include: [
        { association: 'person', attributes: ['id', 'name', 'email'] },
        {
          association: 'kit',
          include: [{ association: 'items', include: ['product'] }],
        },
        { association: 'paymentProofs' },
        { association: 'approvedBy', attributes: ['id', 'name', 'email'] },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      total: count,
      orders: rows,
    };
  } catch (error: any) {
    console.error('Erro ao listar pedidos:', error);
    throw new Error(`Erro ao listar pedidos: ${error.message}`);
  }
};

/**
 * Buscar pedido por ID
 */
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    return await Order.findByPk(orderId, {
      include: [
        { association: 'person', attributes: ['id', 'name', 'email', 'pixKey'] },
        {
          association: 'kit',
          include: [{ association: 'items', include: ['product'] }],
        },
        { association: 'paymentProofs' },
        { association: 'approvedBy', attributes: ['id', 'name', 'email'] },
      ],
    });
  } catch (error: any) {
    console.error('Erro ao buscar pedido:', error);
    throw new Error(`Erro ao buscar pedido: ${error.message}`);
  }
};

/**
 * Buscar pedido por código
 */
export const getOrderByCode = async (orderCode: string): Promise<Order | null> => {
  try {
    return await Order.findOne({
      where: { orderCode },
      include: [
        { association: 'person', attributes: ['id', 'name', 'email', 'pixKey'] },
        {
          association: 'kit',
          include: [{ association: 'items', include: ['product'] }],
        },
        { association: 'paymentProofs' },
        { association: 'approvedBy', attributes: ['id', 'name', 'email'] },
      ],
    });
  } catch (error: any) {
    console.error('Erro ao buscar pedido:', error);
    throw new Error(`Erro ao buscar pedido: ${error.message}`);
  }
};

/**
 * Fazer upload de comprovante de pagamento
 * Suporta imagem (PNG, JPEG, GIF, WebP) ou PDF
 */
export const uploadPaymentProof = async (
  orderId: string,
  file: Express.Multer.File,
): Promise<PaymentProof> => {
  try {
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    if (order.usesCredit) {
      throw new Error('Pedido pago com créditos não requer comprovante');
    }

    // Validar tipo de arquivo
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
    ];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new Error('Apenas imagens (PNG, JPEG, GIF, WebP) ou PDF são permitidos');
    }

    // Fazer upload para MinIO
    const fileUrl = await uploadFileToMinIO(
      file,
      file.originalname,
      'payment-proofs',
    );

    // Determinar tipo
    const fileType = file.mimetype === 'application/pdf' ? 'pdf' : 'image';

    // Criar registro
    const proof = await PaymentProof.create({
      orderId,
      fileUrl,
      fileType,
      originalFileName: file.originalname,
      fileSize: file.size,
    });

    // Atualizar status do pedido
    await order.update({
      status: OrderStatus.PENDING_APPROVAL,
    });

    return proof;
  } catch (error: any) {
    console.error('Erro ao fazer upload de comprovante:', error);
    throw new Error(`Erro ao fazer upload de comprovante: ${error.message}`);
  }
};

/**
 * Aprovar pedido (ADMIN ONLY)
 * Validações:
 * - Pedido não pode ser aprovado sem comprovante (a menos que pague com créditos)
 * - Pedido deve estar em PENDING_APPROVAL ou PAID
 */
export const approveOrder = async (
  orderId: string,
  approvedByUserId: string,
): Promise<Order | null> => {
  try {
    const order = await Order.findByPk(orderId, {
      include: ['paymentProofs'],
    });
    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    // Validar status
    if (![OrderStatus.PENDING_APPROVAL, OrderStatus.PAID].includes(order.status)) {
      throw new Error(
        `Pedido com status ${order.status} não pode ser aprovado`
      );
    }

    // Se não usa créditos, deve ter comprovante
    if (!order.usesCredit && (!order.paymentProofs || order.paymentProofs.length === 0)) {
      throw new Error('Comprovante de pagamento é obrigatório para aprovar este pedido');
    }

    // Atualizar pedido
    await order.update({
      status: OrderStatus.APPROVED,
      approvedByUserId,
      approvedAt: new Date(),
    });

    return order;
  } catch (error: any) {
    console.error('Erro ao aprovar pedido:', error);
    throw new Error(`Erro ao aprovar pedido: ${error.message}`);
  }
};

/**
 * Rejeitar pedido (ADMIN ONLY)
 */
export const rejectOrder = async (
  orderId: string,
  rejectedByUserId: string,
  rejectionReason: string,
): Promise<Order | null> => {
  try {
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    // Validar status
    if (![OrderStatus.PENDING_APPROVAL, OrderStatus.PENDING_PAYMENT].includes(order.status)) {
      throw new Error(
        `Pedido com status ${order.status} não pode ser rejeitado`
      );
    }

    // Se foi pago com créditos, reverter transação
    if (order.usesCredit && order.status === OrderStatus.PAID) {
      const { addCreditTransaction } = await getCreditServiceModule();
      const params: CreditTransactionParams = {
        personId: order.personId,
        type: CreditTransactionType.ADJUSTMENT,
        amount: order.totalPrice, // Reverter (positivo)
        description: `Reembolso de créditos - Pedido rejeitado (${order.orderCode})`,
        orderId,
      };
      await addCreditTransaction(params);
    }

    // Atualizar pedido
    await order.update({
      status: OrderStatus.REJECTED,
      rejectionReason,
    });

    return order;
  } catch (error: any) {
    console.error('Erro ao rejeitar pedido:', error);
    throw new Error(`Erro ao rejeitar pedido: ${error.message}`);
  }
};

/**
 * Listar comprovantes de um pedido
 */
export const listPaymentProofs = async (orderId: string): Promise<PaymentProof[]> => {
  try {
    return await PaymentProof.findAll({
      where: { orderId },
      order: [['createdAt', 'DESC']],
    });
  } catch (error: any) {
    console.error('Erro ao listar comprovantes:', error);
    throw new Error(`Erro ao listar comprovantes: ${error.message}`);
  }
};

/**
 * Remover comprovante de pagamento
 */
export const removePaymentProof = async (proofId: string): Promise<void> => {
  try {
    const proof = await PaymentProof.findByPk(proofId);
    if (!proof) {
      throw new Error('Comprovante não encontrado');
    }

    const order = await Order.findByPk(proof.orderId);
    if (order && order.status === OrderStatus.APPROVED) {
      throw new Error('Não é possível remover comprovante de pedido aprovado');
    }

    // Deletar arquivo do MinIO
    try {
      const { deleteFileFromMinIO } = await import('./storage.service');
      await deleteFileFromMinIO(proof.fileUrl);
    } catch (err) {
      console.warn('Erro ao deletar arquivo:', err);
    }

    await proof.destroy();
  } catch (error: any) {
    console.error('Erro ao remover comprovante:', error);
    throw new Error(`Erro ao remover comprovante: ${error.message}`);
  }
};
