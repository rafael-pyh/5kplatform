import { Router } from 'express';
import multer from 'multer';
import {
  createKitController,
  listKitsController,
  getKitController,
  updateKitController,
  updateKitItemsController,
  toggleKitStatusController,
  deleteKitController,
  uploadKitImageController,
} from '../controllers/kit.controller';
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
 * GET /api/kits
 * Listar todos os kits ativos
 */
router.get('/', listKitsController);

/**
 * GET /api/kits/:id
 * Obter detalhes de um kit com itens
 */
router.get('/:id', getKitController);

// ============== ROTAS ADMIN ==============

/**
 * POST /api/kits
 * Criar novo kit (ADMIN)
 */
router.post('/', authenticate, checkAdminRole, createKitController);

/**
 * PUT /api/kits/:id
 * Atualizar kit (ADMIN)
 */
router.put('/:id', authenticate, checkAdminRole, updateKitController);

/**
 * PUT /api/kits/:id/items
 * Atualizar itens do kit (ADMIN)
 */
router.put('/:id/items', authenticate, checkAdminRole, updateKitItemsController);

/**
 * PATCH /api/kits/:id/status
 * Ativar/Inativar kit (ADMIN)
 */
router.patch('/:id/status', authenticate, checkAdminRole, toggleKitStatusController);

/**
 * DELETE /api/kits/:id
 * Deletar kit (ADMIN)
 */
router.delete('/:id', authenticate, checkAdminRole, deleteKitController);

/**
 * POST /api/kits/:id/image
 * Fazer upload de imagem do kit (ADMIN)
 */
router.post('/:id/image', authenticate, checkAdminRole, uploadImage.single('image'), uploadKitImageController);

export default router;
