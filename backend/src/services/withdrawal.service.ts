import { WithdrawalRequest, WithdrawalStatus } from '../models/WithdrawalRequest';
import { Person } from '../models/Person';
import { Op } from 'sequelize';
import { getCreditBalance, addCreditTransaction, CreditTransactionParams } from './credit.service';
import { CreditTransactionType } from '../models/CreditTransaction';

/**
 * Withdrawal Service
 * Gerencia solicitações de saque de créditos
 * Fluxo 100% manual: PENDING → APPROVED → PAID
 * Inclui auditoria completa
 */

interface CreateWithdrawalInput {
  personId: string;
  amount: number;
  bankAccountInfo?: string;
  notes?: string;
}

/**
 * Solicitar saque de créditos
 * Valida saldo suficiente
 * Status inicial: PENDING
 */
export const requestWithdrawal = async (
  input: CreateWithdrawalInput
): Promise<WithdrawalRequest> => {
  try {
    const { personId, amount, bankAccountInfo, notes } = input;

    if (amount <= 0) {
      throw new Error('Valor do saque deve ser maior que zero');
    }

    // Validar pessoa
    const person = await Person.findByPk(personId);
    if (!person) {
      throw new Error('Pessoa não encontrada');
    }

    // Validar saldo
    const balance = await getCreditBalance(personId);
    if (balance < amount) {
      throw new Error(
        `Saldo insuficiente. Disponível: R$ ${balance.toFixed(2)}, Solicitado: R$ ${amount.toFixed(2)}`
      );
    }

    // Validar dados bancários se fornecidos
    if (bankAccountInfo && bankAccountInfo.trim() === '') {
      throw new Error('Dados bancários não podem estar vazios');
    }

    // Criar solicitação
    const withdrawal = await WithdrawalRequest.create({
      personId,
      amount,
      bankAccountInfo,
      notes,
      status: WithdrawalStatus.PENDING,
    });

    return withdrawal;
  } catch (error: any) {
    console.error('Erro ao solicitar saque:', error);
    throw new Error(`Erro ao solicitar saque: ${error.message}`);
  }
};

/**
 * Listar solicitações de saque com filtros
 */
export const listWithdrawals = async (
  limit: number = 50,
  offset: number = 0,
  filters?: {
    personId?: string;
    status?: WithdrawalStatus;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<{ total: number; withdrawals: WithdrawalRequest[] }> => {
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

    const { count, rows } = await WithdrawalRequest.findAndCountAll({
      where: Object.keys(where).length > 0 ? where : undefined,
      include: [
        { association: 'person', attributes: ['id', 'name', 'email', 'pixKey'] },
        { association: 'approvedBy', attributes: ['id', 'name', 'email'] },
        { association: 'rejectedBy', attributes: ['id', 'name', 'email'] },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      total: count,
      withdrawals: rows,
    };
  } catch (error: any) {
    console.error('Erro ao listar saques:', error);
    throw new Error(`Erro ao listar saques: ${error.message}`);
  }
};

/**
 * Obter solicitação de saque por ID
 */
export const getWithdrawalById = async (
  withdrawalId: string
): Promise<WithdrawalRequest | null> => {
  try {
    return await WithdrawalRequest.findByPk(withdrawalId, {
      include: [
        { association: 'person', attributes: ['id', 'name', 'email', 'pixKey'] },
        { association: 'approvedBy', attributes: ['id', 'name', 'email'] },
        { association: 'rejectedBy', attributes: ['id', 'name', 'email'] },
        { association: 'transactions' },
      ],
    });
  } catch (error: any) {
    console.error('Erro ao buscar saque:', error);
    throw new Error(`Erro ao buscar saque: ${error.message}`);
  }
};

/**
 * Listar saques pendentes de uma pessoa
 */
export const listPersonWithdrawals = async (personId: string): Promise<WithdrawalRequest[]> => {
  try {
    return await WithdrawalRequest.findAll({
      where: { personId },
      order: [['createdAt', 'DESC']],
    });
  } catch (error: any) {
    console.error('Erro ao listar saques da pessoa:', error);
    throw new Error(`Erro ao listar saques: ${error.message}`);
  }
};

/**
 * Cancelar solicitação de saque (PERSON ONLY - seu próprio saque)
 * Apenas se ainda estiver PENDING
 */
export const cancelWithdrawal = async (
  withdrawalId: string,
  personId: string
): Promise<WithdrawalRequest | null> => {
  try {
    const withdrawal = await WithdrawalRequest.findByPk(withdrawalId);
    if (!withdrawal) {
      throw new Error('Solicitação de saque não encontrada');
    }

    // Verificar propriedade
    if (withdrawal.personId !== personId) {
      throw new Error('Você não tem permissão para cancelar este saque');
    }

    // Validar status
    if (withdrawal.status !== WithdrawalStatus.PENDING) {
      throw new Error(`Saque com status ${withdrawal.status} não pode ser cancelado`);
    }

    // Deletar
    await withdrawal.destroy();
    return null;
  } catch (error: any) {
    console.error('Erro ao cancelar saque:', error);
    throw new Error(`Erro ao cancelar saque: ${error.message}`);
  }
};

/**
 * Aprovar solicitação de saque (ADMIN ONLY)
 * Transita de PENDING → APPROVED
 * Cria CreditTransaction para rastreabilidade
 */
export const approveWithdrawal = async (
  withdrawalId: string,
  approvedByUserId: string
): Promise<WithdrawalRequest | null> => {
  try {
    const withdrawal = await WithdrawalRequest.findByPk(withdrawalId);
    if (!withdrawal) {
      throw new Error('Solicitação de saque não encontrada');
    }

    // Validar status
    if (withdrawal.status !== WithdrawalStatus.PENDING) {
      throw new Error(
        `Saque com status ${withdrawal.status} não pode ser aprovado`
      );
    }

    // Atualizar status
    await withdrawal.update({
      status: WithdrawalStatus.APPROVED,
      approvedByUserId,
      approvedAt: new Date(),
    });

    // Criar transação de auditoria
    const params: CreditTransactionParams = {
      personId: withdrawal.personId,
      type: CreditTransactionType.WITHDRAW_REQUEST,
      amount: -withdrawal.amount, // Débito
      description: `Saque aprovado - R$ ${withdrawal.amount.toFixed(2)}`,
      withdrawalRequestId: withdrawal.id,
      adjustedByUserId: approvedByUserId,
    };
    await addCreditTransaction(params);

    return withdrawal;
  } catch (error: any) {
    console.error('Erro ao aprovar saque:', error);
    throw new Error(`Erro ao aprovar saque: ${error.message}`);
  }
};

/**
 * Rejeitar solicitação de saque (ADMIN ONLY)
 * Transita de PENDING → REJECTED
 * Permite que a pessoa solicite novamente
 */
export const rejectWithdrawal = async (
  withdrawalId: string,
  rejectedByUserId: string,
  rejectionReason: string
): Promise<WithdrawalRequest | null> => {
  try {
    const withdrawal = await WithdrawalRequest.findByPk(withdrawalId);
    if (!withdrawal) {
      throw new Error('Solicitação de saque não encontrada');
    }

    // Validar status
    if (withdrawal.status !== WithdrawalStatus.PENDING) {
      throw new Error(
        `Saque com status ${withdrawal.status} não pode ser rejeitado`
      );
    }

    // Atualizar status
    await withdrawal.update({
      status: WithdrawalStatus.REJECTED,
      rejectedByUserId,
      rejectedAt: new Date(),
      rejectionReason,
    });

    return withdrawal;
  } catch (error: any) {
    console.error('Erro ao rejeitar saque:', error);
    throw new Error(`Erro ao rejeitar saque: ${error.message}`);
  }
};

/**
 * Marcar saque como pago (ADMIN ONLY)
 * Transita de APPROVED → PAID
 * Finaliza o saque
 */
export const markWithdrawalAsPaid = async (
  withdrawalId: string
): Promise<WithdrawalRequest | null> => {
  try {
    const withdrawal = await WithdrawalRequest.findByPk(withdrawalId);
    if (!withdrawal) {
      throw new Error('Solicitação de saque não encontrada');
    }

    // Validar status
    if (withdrawal.status !== WithdrawalStatus.APPROVED) {
      throw new Error(
        `Saque com status ${withdrawal.status} não pode ser marcado como pago`
      );
    }

    // Atualizar status
    await withdrawal.update({
      status: WithdrawalStatus.PAID,
      paidAt: new Date(),
    });

    return withdrawal;
  } catch (error: any) {
    console.error('Erro ao marcar saque como pago:', error);
    throw new Error(`Erro ao marcar saque como pago: ${error.message}`);
  }
};

/**
 * Obter estatísticas de saques
 */
export const getWithdrawalStats = async (personId?: string): Promise<{
  totalRequests: number;
  pendingAmount: number;
  approvedAmount: number;
  paidAmount: number;
  rejectedCount: number;
}> => {
  try {
    const where = personId ? { personId } : {};

    const pending = await WithdrawalRequest.sum('amount', {
      where: { ...where, status: WithdrawalStatus.PENDING },
    }) || 0;

    const approved = await WithdrawalRequest.sum('amount', {
      where: { ...where, status: WithdrawalStatus.APPROVED },
    }) || 0;

    const paid = await WithdrawalRequest.sum('amount', {
      where: { ...where, status: WithdrawalStatus.PAID },
    }) || 0;

    const totalCount = await WithdrawalRequest.count({ where });
    const rejectedCount = await WithdrawalRequest.count({
      where: { ...where, status: WithdrawalStatus.REJECTED },
    });

    return {
      totalRequests: totalCount,
      pendingAmount: pending,
      approvedAmount: approved,
      paidAmount: paid,
      rejectedCount,
    };
  } catch (error: any) {
    console.error('Erro ao obter estatísticas de saque:', error);
    throw new Error(`Erro ao obter estatísticas: ${error.message}`);
  }
};
