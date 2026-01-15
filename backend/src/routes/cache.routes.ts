import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/authorize.middleware';
import * as cacheController from '../controllers/cache.controller';

const router = Router();

// Invalida apenas entradas de Lead
router.post('/invalidate/lead', authenticate, requireAdmin, cacheController.invalidateLeadCache);

// Limpa todo o cache em memória
router.post('/clear', authenticate, requireAdmin, cacheController.clearAllCache);

export default router;
