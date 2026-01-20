import { Router } from 'express';
import multer from 'multer';
import {
  createProductController,
  listProductsController,
  getProductController,
  updateProductController,
  toggleProductStatusController,
  addProductImageController,
  removeProductImageController,
  reorderProductImagesController,
  deleteProductController,
} from '../controllers/product.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { PersonRole } from '../models/Person';

const router = Router();

// Configurar multer para uploads de imagens
const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'));
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

// ============== ROTAS PÚBLICAS ==============

/**
 * GET /api/products
 * Listar todos os produtos
 */
router.get('/', listProductsController);

/**
 * GET /api/products/:id
 * Obter detalhes de um produto
 */
router.get('/:id', getProductController);

// ============== ROTAS ADMIN ==============

/**
 * POST /api/products
 * Criar novo produto (ADMIN)
 */
router.post('/', authenticate, checkAdminRole, createProductController);

/**
 * PUT /api/products/:id
 * Atualizar produto (ADMIN)
 */
router.put('/:id', authenticate, checkAdminRole, updateProductController);

/**
 * PATCH /api/products/:id/status
 * Ativar/Inativar produto (ADMIN)
 */
router.patch('/:id/status', authenticate, checkAdminRole, toggleProductStatusController);

/**
 * DELETE /api/products/:id
 * Deletar produto (ADMIN)
 */
router.delete('/:id', authenticate, checkAdminRole, deleteProductController);

/**
 * POST /api/products/:id/images
 * Adicionar imagem ao produto (ADMIN)
 */
router.post('/:id/images', authenticate, checkAdminRole, uploadImage.single('image'), addProductImageController);

/**
 * DELETE /api/products/:productId/images/:imageId
 * Remover imagem do produto (ADMIN)
 */
router.delete('/:productId/images/:imageId', authenticate, checkAdminRole, removeProductImageController);

/**
 * POST /api/products/:id/images/reorder
 * Reordenar imagens (ADMIN)
 */
router.post('/:id/images/reorder', authenticate, checkAdminRole, reorderProductImagesController);

export default router;
