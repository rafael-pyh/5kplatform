import { Request, Response } from 'express';
import {
  requestWithdrawal,
  listWithdrawals,
  getWithdrawalById,
  listPersonWithdrawals,
  cancelWithdrawal,
  approveWithdrawal,
  rejectWithdrawal,
  markWithdrawalAsPaid,
  getWithdrawalStats,
} from '../services/withdrawal.service';
import { WithdrawalStatus } from '../models/WithdrawalRequest';

/**
 * Withdrawal Controller
 * Endpoints para gerenciar saques de créditos
 * Fluxo: PENDING → APPROVED → PAID ou REJECTED
 */

/**
 * POST /api/withdrawals/request
 * Solicitar saque de créditos
 * Body: { amount, bankAccountInfo?, notes? }
 */
export const requestWithdrawalController = async (req: Request, res: Response) => {
  try {
    const { amount, bankAccountInfo, notes } = req.body;
    const personId = (req as any).user?.userId;

    if (!personId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Valor do saque é obrigatório',
      });
    }

    const withdrawal = await requestWithdrawal({
      personId,
      amount: parseFloat(amount),
      bankAccountInfo,
      notes,
    });

    return res.status(201).json({
      success: true,
      data: {
        id: withdrawal.id,
        amount: parseFloat(withdrawal.amount.toString()),
        status: withdrawal.status,
        createdAt: withdrawal.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Erro ao solicitar saque:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /api/withdrawals/my
 * Listar saques do usuário logado
 */
export const listMyWithdrawalsController = async (req: Request, res: Response) => {
  try {
    const personId = (req as any).user?.userId;

    if (!personId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

    const withdrawals = await listPersonWithdrawals(personId);

    return res.status(200).json({
      success: true,
      data: withdrawals.map((w) => ({
        id: w.id,
        amount: parseFloat(w.amount.toString()),
        status: w.status,
        createdAt: w.createdAt,
        approvedAt: w.approvedAt,
        paidAt: w.paidAt,
        rejectionReason: w.rejectionReason,
      })),
    });
  } catch (error: any) {
    console.error('Erro ao listar saques:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /api/withdrawals
 * Listar saques com filtros (ADMIN ONLY)
 */
export const listWithdrawalsController = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const filters: any = {};
    if (req.query.personId) filters.personId = req.query.personId;
    if (req.query.status) filters.status = req.query.status;
    if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
    if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);

    const { total, withdrawals } = await listWithdrawals(limit, offset, filters);

    return res.status(200).json({
      success: true,
      pagination: {
        total,
        limit,
        offset,
      },
      data: withdrawals.map((w) => ({
        id: w.id,
        personName: w.person?.name,
        personEmail: w.person?.email,
        amount: parseFloat(w.amount.toString()),
        status: w.status,
        bankAccountInfo: w.bankAccountInfo,
        approvedAt: w.approvedAt,
        approvedByName: w.approvedBy?.name,
        paidAt: w.paidAt,
        createdAt: w.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Erro ao listar saques:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /api/withdrawals/:id
 * Obter detalhes de um saque
 */
export const getWithdrawalController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const personId = (req as any).user?.userId;
    const userRole = (req as any).user?.role;

    const withdrawal = await getWithdrawalById(id);

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Saque não encontrado',
      });
    }

    // Verificar permissão (SELLER só pode ver seus próprios)
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN' && withdrawal.personId !== personId) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para visualizar este saque',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: withdrawal.id,
        person: {
          id: withdrawal.person?.id,
          name: withdrawal.person?.name,
          email: withdrawal.person?.email,
          pixKey: withdrawal.person?.pixKey,
        },
        amount: parseFloat(withdrawal.amount.toString()),
        status: withdrawal.status,
        bankAccountInfo: withdrawal.bankAccountInfo,
        notes: withdrawal.notes,
        approvedBy: withdrawal.approvedBy ? {
          id: withdrawal.approvedBy.id,
          name: withdrawal.approvedBy.name,
        } : null,
        approvedAt: withdrawal.approvedAt,
        rejectedBy: withdrawal.rejectedBy ? {
          id: withdrawal.rejectedBy.id,
          name: withdrawal.rejectedBy.name,
        } : null,
        rejectedAt: withdrawal.rejectedAt,
        rejectionReason: withdrawal.rejectionReason,
        paidAt: withdrawal.paidAt,
        createdAt: withdrawal.createdAt,
        updatedAt: withdrawal.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Erro ao obter saque:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * DELETE /api/withdrawals/:id/cancel
 * Cancelar solicitação de saque (PERSON ONLY - seu próprio saque)
 */
export const cancelWithdrawalController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const personId = (req as any).user?.userId;

    if (!personId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

    await cancelWithdrawal(id, personId);

    return res.status(200).json({
      success: true,
      message: 'Saque cancelado com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao cancelar saque:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * POST /api/withdrawals/:id/approve
 * Aprovar saque (ADMIN ONLY)
 */
export const approveWithdrawalController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = (req as any).user?.userId;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

    const withdrawal = await approveWithdrawal(id, adminId);

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Saque não encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: withdrawal.id,
        status: withdrawal.status,
        amount: parseFloat(withdrawal.amount.toString()),
        approvedAt: withdrawal.approvedAt,
      },
    });
  } catch (error: any) {
    console.error('Erro ao aprovar saque:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * POST /api/withdrawals/:id/reject
 * Rejeitar saque (ADMIN ONLY)
 * Body: { rejectionReason }
 */
export const rejectWithdrawalController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const adminId = (req as any).user?.userId;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Motivo da rejeição é obrigatório',
      });
    }

    const withdrawal = await rejectWithdrawal(id, adminId, rejectionReason);

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Saque não encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: withdrawal.id,
        status: withdrawal.status,
        rejectionReason: withdrawal.rejectionReason,
      },
    });
  } catch (error: any) {
    console.error('Erro ao rejeitar saque:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * POST /api/withdrawals/:id/mark-as-paid
 * Marcar saque como pago (ADMIN ONLY)
 */
export const markAsPaidController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const withdrawal = await markWithdrawalAsPaid(id);

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Saque não encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: withdrawal.id,
        status: withdrawal.status,
        paidAt: withdrawal.paidAt,
      },
    });
  } catch (error: any) {
    console.error('Erro ao marcar saque como pago:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /api/withdrawals/stats
 * Obter estatísticas de saques (ADMIN ONLY)
 */
export const getStatsController = async (req: Request, res: Response) => {
  try {
    const personId = req.query.personId as string;
    const stats = await getWithdrawalStats(personId);

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Erro ao obter estatísticas:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
