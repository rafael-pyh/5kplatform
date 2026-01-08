import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import {
  requireRole,
  requireInternalSeller,
  requireOwnerOrAdmin,
  requireAdmin,
  requireSuperAdmin
} from '../middlewares/authorize.middleware';
import * as sellerController from '../controllers/seller.controller';
import { PersonRole } from '../models/Person';

const router = Router();

// ==================== ROTAS DE SELLER (CRUD) ====================

/**
 * GET /seller/:id
 * Retorna dados do vendedor (diferenciados por role)
 * - AFFILIATE: apenas dados públicos
 * - SELLER+: dados completos
 */
router.get('/:id', authenticate, sellerController.getSellerById);

/**
 * GET /seller
 * Lista vendedores (SELLER+ apenas, nega AFFILIATE)
 */
router.get(
  '/',
  authenticate,
  requireInternalSeller,
  sellerController.listSellers
);

/**
 * PUT /seller/:id
 * Atualiza vendedor (dono ou ADMIN)
 */
router.put(
  '/:id',
  authenticate,
  requireOwnerOrAdmin,
  sellerController.updateSeller
);

/**
 * DELETE /seller/:id
 * Deleta vendedor (apenas ADMIN/SUPER_ADMIN)
 */
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  sellerController.deleteSeller
);

/**
 * PUT /seller/:id/role
 * Altera role do usuário (apenas SUPER_ADMIN)
 * - SELLER → AFFILIATE, ADMIN
 * - AFFILIATE → SELLER, ADMIN (mas não ADMIN, exceto SUPER_ADMIN)
 */
router.put(
  '/:id/role',
  authenticate,
  requireSuperAdmin,
  sellerController.changeSellerRole
);

export default router;
