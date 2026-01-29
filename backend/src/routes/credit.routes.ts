import { Router } from 'express';
import {
  getWalletController,
  getBalanceController,
  listTransactionsController,
  getStatsController,
  adjustCreditsController,
  exportLedgerController,
  listCommissionsController,
  getWalletByPersonIdController,
} from '../controllers/credit.controller';
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
 * GET /api/credits/wallet
 * Obter carteira do usuário logado
 */
router.get('/wallet', authenticate, getWalletController);

/**
 * GET /api/credits/balance
 * Obter saldo atual
 */
router.get('/balance', authenticate, getBalanceController);

/**
 * GET /api/credits/transactions
 * Listar transações do usuário
 */
router.get('/transactions', authenticate, listTransactionsController);

/**
 * GET /api/credits/commissions?leadId=...&personId?
 */
router.get('/commissions', authenticate, listCommissionsController);

/**
 * GET /api/credits/stats
 * Obter estatísticas de créditos
 */
router.get('/stats', authenticate, getStatsController);

/**
 * GET /api/credits/ledger/export
 * Exportar ledger (JSON ou CSV)
 */
router.get('/ledger/export', authenticate, exportLedgerController);

// ============== ROTAS ADMIN ==============

/**
 * POST /api/credits/adjust
 * Fazer ajuste manual de créditos (ADMIN)
 */
router.post('/adjust', authenticate, checkAdminRole, adjustCreditsController);

/**
 * GET /api/credits/wallet/:personId
 * Obter carteira de outro usuário (ADMIN)
 */
router.get('/wallet/:personId', authenticate, checkAdminRole, getWalletByPersonIdController);

export default router;
