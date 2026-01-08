import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/authorize.middleware';
import * as registrationController from '../controllers/registration.controller';

const router = Router();

// ==================== ROTAS DE REGISTRO ====================

/**
 * POST /auth/register/affiliate
 * Cadastro PÚBLICO para afiliados
 * 
 * Qualquer pessoa pode se registrar como afiliado
 * Cria automaticamente com role AFFILIATE
 * Login imediato
 */
router.post('/affiliate', registrationController.registerAffiliate);

/**
 * POST /admin/seller
 * Cadastro ADMINISTRATIVO de vendedor
 * 
 * Apenas ADMIN/SUPER_ADMIN podem criar vendedores
 * Cria com role SELLER por padrão
 * Gera senha temporária
 */
router.post(
  '/seller',
  authenticate,
  requireAdmin,
  registrationController.createSellerAsAdmin
);

/**
 * POST /admin/seller/:id/convert
 * Converte AFFILIATE em SELLER/ADMIN
 * 
 * Apenas ADMIN/SUPER_ADMIN podem fazer
 * registration_type permanece PUBLIC (marca origem como afiliado)
 */
router.post(
  '/seller/:id/convert',
  authenticate,
  requireAdmin,
  registrationController.convertAffiliateToSeller
);

export default router;
