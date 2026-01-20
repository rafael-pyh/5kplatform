import { Request, Response } from 'express';
import {
  getCreditWallet,
  getCreditBalance,
  listTransactions,
  getCreditStats,
  adjustCredits,
  exportLedger,
} from '../services/credit.service';

/**
 * Credit Controller
 * Endpoints para visualizar carteira e histórico de transações
 * Todas as transações são criadas via serviços específicos (order, withdrawal, etc)
 */

/**
 * GET /api/credits/wallet
 * Obter carteira de créditos do usuário logado
 */
export const getWalletController = async (req: Request, res: Response) => {
  try {
    const personId = (req as any).user?.userId;

    if (!personId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

    const wallet = await getCreditWallet(personId);

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Carteira não encontrada',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: wallet.id,
        balance: parseFloat(wallet.balance.toString()),
        lastTransactionAt: wallet.lastTransactionAt,
      },
    });
  } catch (error: any) {
    console.error('Erro ao obter carteira:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /api/credits/balance
 * Obter saldo atual em formato simples
 */
export const getBalanceController = async (req: Request, res: Response) => {
  try {
    const personId = (req as any).user?.userId;

    if (!personId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

    const balance = await getCreditBalance(personId);

    return res.status(200).json({
      success: true,
      data: {
        balance: balance,
      },
    });
  } catch (error: any) {
    console.error('Erro ao obter saldo:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /api/credits/transactions
 * Listar transações do usuário
 */
export const listTransactionsController = async (req: Request, res: Response) => {
  try {
    const personId = (req as any).user?.userId;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!personId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

    const filters: any = {};
    if (req.query.type) filters.type = req.query.type;
    if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
    if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);

    const { total, transactions } = await listTransactions(personId, limit, offset, filters);

    return res.status(200).json({
      success: true,
      pagination: {
        total,
        limit,
        offset,
      },
      data: transactions.map((t) => ({
        id: t.id,
        type: t.type,
        amount: parseFloat(t.amount.toString()),
        description: t.description,
        orderId: t.orderId,
        withdrawalRequestId: t.withdrawalRequestId,
        createdAt: t.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Erro ao listar transações:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /api/credits/stats
 * Obter estatísticas de créditos
 */
export const getStatsController = async (req: Request, res: Response) => {
  try {
    const personId = (req as any).user?.userId;

    if (!personId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

    const stats = await getCreditStats(personId);

    return res.status(200).json({
      success: true,
      data: {
        balance: stats.balance,
        totalEarned: stats.totalEarned,
        totalSpent: stats.totalSpent,
        lastTransaction: stats.lastTransaction,
      },
    });
  } catch (error: any) {
    console.error('Erro ao obter estatísticas:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * POST /api/credits/adjust
 * Fazer ajuste manual de créditos (ADMIN ONLY)
 * Body: { personId, amount, reason }
 */
export const adjustCreditsController = async (req: Request, res: Response) => {
  try {
    const { personId, amount, reason } = req.body;
    const adminId = (req as any).user?.userId;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

    if (!personId || amount === undefined || !reason) {
      return res.status(400).json({
        success: false,
        message: 'personId, amount e reason são obrigatórios',
      });
    }

    const transaction = await adjustCredits(
      personId,
      parseFloat(amount),
      reason,
      adminId
    );

    return res.status(201).json({
      success: true,
      data: {
        id: transaction.id,
        personId: transaction.personId,
        type: transaction.type,
        amount: parseFloat(transaction.amount.toString()),
        description: transaction.description,
        createdAt: transaction.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Erro ao fazer ajuste de créditos:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /api/credits/ledger/export
 * Exportar ledger completo (CSV/JSON)
 * Query: startDate?, endDate?, format? (json|csv)
 */
export const exportLedgerController = async (req: Request, res: Response) => {
  try {
    const personId = (req as any).user?.userId;
    const format = (req.query.format as string) || 'json';

    if (!personId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const ledger = await exportLedger(personId, startDate, endDate);

    if (format === 'csv') {
      // Gerar CSV
      const csv = [
        'ID,Tipo,Valor,Descrição,Data',
        ...ledger.map((t) =>
          `${t.id},${t.type},${t.amount},${t.description || ''
          },${t.createdAt.toISOString()}`
        ),
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="ledger.csv"');
      return res.send(csv);
    }

    // Formato JSON (padrão)
    return res.status(200).json({
      success: true,
      data: ledger.map((t) => ({
        id: t.id,
        type: t.type,
        amount: parseFloat(t.amount.toString()),
        description: t.description,
        createdAt: t.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Erro ao exportar ledger:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /api/credits/wallet/:personId
 * Obter carteira de outro usuário (ADMIN ONLY)
 */
export const getWalletByPersonIdController = async (req: Request, res: Response) => {
  try {
    const { personId } = req.params;

    const wallet = await getCreditWallet(personId);

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Carteira não encontrada',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        personId: wallet.personId,
        personName: wallet.person?.name,
        balance: parseFloat(wallet.balance.toString()),
        lastTransactionAt: wallet.lastTransactionAt,
        createdAt: wallet.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Erro ao obter carteira:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
