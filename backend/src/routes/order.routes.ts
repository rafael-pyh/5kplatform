import { Router } from 'express';
import multer from 'multer';
import {
  createOrderController,
  listOrdersController,
  getOrderController,
  getOrderByCodeController,
  uploadPaymentProofController,
  listPaymentProofsController,
  removePaymentProofController,
  approveOrderController,
  rejectOrderController,
} from '../controllers/order.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { PersonRole } from '../models/Person';

const router = Router();

// Configurar multer para uploads de comprovantes
const uploadProof = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens ou PDF são permitidos'));
    }
  },
});

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
 * POST /api/orders
 * Criar novo pedido (autenticado)
 */
router.post('/', authenticate, createOrderController);

/**
 * GET /api/orders
 * Listar pedidos (ADMIN vê todos, SELLER vê seus)
 */
router.get('/', authenticate, listOrdersController);

/**
 * GET /api/orders/code/:orderCode
 * Buscar pedido por código
 */
router.get('/code/:orderCode', getOrderByCodeController);

/**
 * GET /api/orders/:id
 * Obter detalhes de um pedido
 */
router.get('/:id', authenticate, getOrderController);

/**
 * POST /api/orders/:id/payment-proofs
 * Fazer upload de comprovante de pagamento
 */
router.post(
  '/:id/payment-proofs',
  authenticate,
  uploadProof.single('proof'),
  uploadPaymentProofController
);

/**
 * GET /api/orders/:id/payment-proofs
 * Listar comprovantes de um pedido
 */
router.get('/:id/payment-proofs', authenticate, listPaymentProofsController);

/**
 * DELETE /api/orders/:orderId/payment-proofs/:proofId
 * Remover comprovante
 */
router.delete('/:orderId/payment-proofs/:proofId', authenticate, removePaymentProofController);

// ============== ROTAS ADMIN ==============

/**
 * POST /api/orders/:id/approve
 * Aprovar pedido (ADMIN)
 */
router.post('/:id/approve', authenticate, checkAdminRole, approveOrderController);

/**
 * POST /api/orders/:id/reject
 * Rejeitar pedido (ADMIN)
 */
router.post('/:id/reject', authenticate, checkAdminRole, rejectOrderController);

export default router;
