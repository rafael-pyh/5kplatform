import { CreditWallet } from '../models/CreditWallet';
import { CreditTransaction, CreditTransactionType } from '../models/CreditTransaction';
import { Person } from '../models/Person';
import { Op } from 'sequelize';

/**
 * Credit Service
 * Gerencia carteira de créditos com padrão de ledger
 * Nunca altera saldo diretamente - sempre via CreditTransaction
 * Suporta auditoria completa de todas as transações
 */

export interface CreditTransactionParams {
  personId: string;
  type: CreditTransactionType;
  amount: number; // Positivo ou negativo
  description?: string;
  orderId?: string;
  withdrawalRequestId?: string;
  adjustedByUserId?: string;
}

/**
 * Inicializar carteira de créditos para uma pessoa
 * Chamado na criação de uma nova pessoa
 */
export const initializeCreditWallet = async (personId: string): Promise<CreditWallet> => {
  try {
    // Verificar se já existe
    let wallet = await CreditWallet.findOne({ where: { personId } });
    if (wallet) {
      return wallet;
    }

    // Criar nova carteira
    wallet = await CreditWallet.create({
      personId,
      balance: 0,
    });

    return wallet;
  } catch (error: any) {
    console.error('Erro ao inicializar carteira de créditos:', error);
    throw new Error(`Erro ao inicializar carteira: ${error.message}`);
  }
};

/**
 * Obter saldo atual de créditos de uma pessoa
 */
export const getCreditBalance = async (personId: string): Promise<number> => {
  try {
    const wallet = await CreditWallet.findOne({ where: { personId } });
    return wallet ? parseFloat(wallet.balance.toString()) : 0;
  } catch (error: any) {
    console.error('Erro ao obter saldo de créditos:', error);
    throw new Error(`Erro ao obter saldo: ${error.message}`);
  }
};

/**
 * Obter carteira completa de uma pessoa
 */
export const getCreditWallet = async (personId: string): Promise<CreditWallet | null> => {
  try {
    return await CreditWallet.findOne({
      where: { personId },
      include: [{ association: 'person', attributes: ['id', 'name', 'email'] }],
    });
  } catch (error: any) {
    console.error('Erro ao obter carteira de créditos:', error);
    throw new Error(`Erro ao obter carteira: ${error.message}`);
  }
};

/**
 * Adicionar transação de crédito (ledger)
 * Sempre chama esta função em vez de alterar saldo diretamente
 */
export const addCreditTransaction = async (
  params: CreditTransactionParams
): Promise<CreditTransaction> => {
  try {
    const {
      personId,
      type,
      amount,
      description,
      orderId,
      withdrawalRequestId,
      adjustedByUserId,
    } = params;

    // Validar pessoa
    const person = await Person.findByPk(personId);
    if (!person) {
      throw new Error('Pessoa não encontrada');
    }

    // Garantir que a carteira existe
    let wallet = await CreditWallet.findOne({ where: { personId } });
    if (!wallet) {
      wallet = await initializeCreditWallet(personId);
    }

    // Validar que saldo não fica negativo (exceto para ADJUSTMENT explícito)
    const newBalance = parseFloat(wallet.balance.toString()) + amount;
    if (newBalance < 0 && type !== CreditTransactionType.ADJUSTMENT) {
      throw new Error(`Saldo insuficiente. Disponível: R$ ${wallet.balance.toFixed(2)}`);
    }

    // Criar transação
    const transaction = await CreditTransaction.create({
      personId,
      type,
      amount,
      description,
      orderId,
      withdrawalRequestId,
      adjustedByUserId,
    });

    // Atualizar saldo da carteira
    await wallet.update({
      balance: newBalance,
      lastTransactionAt: new Date(),
    });

    return transaction;
  } catch (error: any) {
    console.error('Erro ao adicionar transação de crédito:', error);
    throw new Error(`Erro ao adicionar transação: ${error.message}`);
  }
};

/**
 * Listar transações de um person com filtros
 */
export const listTransactions = async (
  personId: string,
  limit: number = 50,
  offset: number = 0,
  filters?: {
    type?: CreditTransactionType;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<{ total: number; transactions: CreditTransaction[] }> => {
  try {
    const where: any = { personId };

    if (filters?.type) {
      where.type = filters.type;
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

    const { count, rows } = await CreditTransaction.findAndCountAll({
      where,
      include: [
        { association: 'order' },
        { association: 'withdrawalRequest' },
        { association: 'adjustedBy', attributes: ['id', 'name', 'email'] },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      total: count,
      transactions: rows,
    };
  } catch (error: any) {
    console.error('Erro ao listar transações:', error);
    throw new Error(`Erro ao listar transações: ${error.message}`);
  }
};

/**
 * Obter resumo de créditos (estatísticas)
 */
export const getCreditStats = async (personId: string): Promise<{
  balance: number;
  totalEarned: number;
  totalSpent: number;
  lastTransaction: Date | null;
}> => {
  try {
    const wallet = await CreditWallet.findOne({ where: { personId } });
    if (!wallet) {
      return {
        balance: 0,
        totalEarned: 0,
        totalSpent: 0,
        lastTransaction: null,
      };
    }

    // Calcular totais
    const earnedResult = await CreditTransaction.findOne({
      attributes: [
        [
          (await import('sequelize')).fn(
            'SUM',
            (await import('sequelize')).col('amount')
          ),
          'total',
        ],
      ],
      where: {
        personId,
        amount: { [Op.gt]: 0 },
      },
    }) as any;

    const spentResult = await CreditTransaction.findOne({
      attributes: [
        [
          (await import('sequelize')).fn(
            'SUM',
            (await import('sequelize')).col('amount')
          ),
          'total',
        ],
      ],
      where: {
        personId,
        amount: { [Op.lt]: 0 },
      },
    }) as any;

    return {
      balance: parseFloat(wallet.balance.toString()),
      totalEarned: earnedResult?.get('total') || 0,
      totalSpent: Math.abs(spentResult?.get('total') || 0),
      lastTransaction: wallet.lastTransactionAt || null,
    };
  } catch (error: any) {
    console.error('Erro ao obter estatísticas de crédito:', error);
    throw new Error(`Erro ao obter estatísticas: ${error.message}`);
  }
};

/**
 * Fazer ajuste manual de créditos (ADMIN ONLY)
 * Tipo: ADJUSTMENT
 * Requer aprovação admin
 */
export const adjustCredits = async (
  personId: string,
  amount: number,
  reason: string,
  approvedByUserId: string,
): Promise<CreditTransaction> => {
  try {
    if (amount === 0) {
      throw new Error('Valor do ajuste deve ser diferente de zero');
    }

    const params: CreditTransactionParams = {
      personId,
      type: CreditTransactionType.ADJUSTMENT,
      amount,
      description: reason,
      adjustedByUserId: approvedByUserId,
    };

    return await addCreditTransaction(params);
  } catch (error: any) {
    console.error('Erro ao fazer ajuste de créditos:', error);
    throw new Error(`Erro ao fazer ajuste: ${error.message}`);
  }
};

/**
 * Exportar extrato (ledger) para análise
 */
export const exportLedger = async (
  personId: string,
  startDate?: Date,
  endDate?: Date
): Promise<CreditTransaction[]> => {
  try {
    const where: any = { personId };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt[Op.gte] = startDate;
      }
      if (endDate) {
        where.createdAt[Op.lte] = endDate;
      }
    }

    return await CreditTransaction.findAll({
      where,
      include: [
        { association: 'order' },
        { association: 'withdrawalRequest' },
        { association: 'adjustedBy', attributes: ['id', 'name', 'email'] },
      ],
      order: [['createdAt', 'ASC']],
    });
  } catch (error: any) {
    console.error('Erro ao exportar ledger:', error);
    throw new Error(`Erro ao exportar ledger: ${error.message}`);
  }
};
