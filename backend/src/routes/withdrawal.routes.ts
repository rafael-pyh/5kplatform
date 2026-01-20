import { Router } from 'express';
import {
  requestWithdrawalController,
  listMyWithdrawalsController,
  listWithdrawalsController,
  getWithdrawalController,
  cancelWithdrawalController,
  approveWithdrawalController,
  rejectWithdrawalController,
  markAsPaidController,
  getStatsController,
} from '../controllers/withdrawal.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { PersonRole } from '../models/Person';

const router = Router();

// Middleware para verificar se é admin
const checkAdminRole = (req: any, res: any, next: any) => {
  if (!req.user || ![PersonRole.ADMIN, PersonRole.SUPER_ADMIN].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Apenas ADMIN ou SUPER_ADMIN podem realizar esta ação',
    });
  }
  next();
};

// ============== ROTAS AUTENTICADAS ==============

/**
 * POST /api/withdrawals/request
 * Solicitar saque de créditos (autenticado)
 */
router.post('/request', authenticate, requestWithdrawalController);

/**
 * GET /api/withdrawals/my
 * Listar saques do usuário logado
 */
router.get('/my', authenticate, listMyWithdrawalsController);

/**
 * GET /api/withdrawals/:id
 * Obter detalhes de um saque
 */
router.get('/:id', authenticate, getWithdrawalController);

/**
 * DELETE /api/withdrawals/:id/cancel
 * Cancelar solicitação de saque (próprio saque)
 */
router.delete('/:id/cancel', authenticate, cancelWithdrawalController);

// ============== ROTAS ADMIN ==============

/**
 * GET /api/withdrawals
 * Listar saques com filtros (ADMIN)
 */
router.get('/', authenticate, checkAdminRole, listWithdrawalsController);

/**
 * POST /api/withdrawals/:id/approve
 * Aprovar saque (ADMIN)
 */
router.post('/:id/approve', authenticate, checkAdminRole, approveWithdrawalController);

/**
 * POST /api/withdrawals/:id/reject
 * Rejeitar saque (ADMIN)
 */
router.post('/:id/reject', authenticate, checkAdminRole, rejectWithdrawalController);

/**
 * POST /api/withdrawals/:id/mark-as-paid
 * Marcar saque como pago (ADMIN)
 */
router.post('/:id/mark-as-paid', authenticate, checkAdminRole, markAsPaidController);

/**
 * GET /api/withdrawals/stats
 * Obter estatísticas (ADMIN)
 */
router.get('/stats', authenticate, checkAdminRole, getStatsController);

export default router;
