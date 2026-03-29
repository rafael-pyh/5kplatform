import { Router } from 'express';
import multer from 'multer';
import {
  adminUploadCreative,
  listCreatives,
  getCreative,
  getCreativesByTypeController,
  searchCreatives,
  adminUpdateCreative,
  adminDeactivateCreative,
  adminDeleteCreative,
  adminGetStats,
  adminSetQRCodePosition,
  getQRCodePositionController,
} from '../controllers/creative.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { PersonRole } from '../models/Person';

const router = Router();

// Configurar multer para uploads
const upload = multer({
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
  console.log('[Creative Routes] checkAdminRole - req.user:', req.user);
  
  if (!req.user) {
    console.log('[Creative Routes] ERRO: req.user is null/undefined');
    return res.status(401).json({
      success: false,
      message: 'Não autenticado',
    });
  }

  if (![PersonRole.ADMIN, PersonRole.SUPER_ADMIN].includes(req.user.role)) {
    console.log('[Creative Routes] ERRO: role is not admin -', req.user.role);
    return res.status(403).json({
      success: false,
      message: 'Apenas ADMIN ou SUPER_ADMIN podem realizar esta ação',
    });
  }

  next();
};

// ============== ROTAS PÚBLICAS ==============

/**
 * @swagger
 * /api/creatives:
 *   get:
 *     summary: Listar todos os criativos ativos
 *     description: Retorna lista de todos os criativos ativos
 *     tags:
 *       - Creatives
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de criativos
 *   post:
 *     summary: Criar novo criativo (Admin)
 *     tags:
 *       - Creatives
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Criativo criado com sucesso
 *       403:
 *         description: Permissão negada
 */
router.get('/', listCreatives);

/**
 * @swagger
 * /api/creatives/type/{type}:
 *   get:
 *     summary: Buscar criativos por tipo
 *     tags:
 *       - Creatives
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Criativos do tipo especificado
 */
router.get('/type/:type', getCreativesByTypeController);

/**
 * @swagger
 * /api/creatives/search/tags:
 *   get:
 *     summary: Buscar criativos por tags
 *     tags:
 *       - Creatives
 *     parameters:
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Tags separadas por vírgula
 *     responses:
 *       200:
 *         description: Criativos com as tags especificadas
 */
router.get('/search/tags', searchCreatives);

// ============== ROTAS ADMIN ==============

/**
 * POST /api/creatives - Criar um novo criativo (via API, imagem já no MinIO)
 * ADMIN/SUPER_ADMIN only
 * Body: { name, imageUrl, description?, tags?, type? }
 */
router.post('/', authenticate, checkAdminRole, adminUploadCreative);

/**
 * POST /api/creatives/admin/upload - Fazer upload de um novo criativo
 * ADMIN/SUPER_ADMIN only
 */
router.post(
  '/admin/upload',
  authenticate,
  checkAdminRole,
  upload.single('file'),
  adminUploadCreative
);

/**
 * PUT /api/creatives/admin/:id - Atualizar criativo
 * ADMIN/SUPER_ADMIN only
 */
router.put('/admin/:id', authenticate, checkAdminRole, adminUpdateCreative);

/**
 * DELETE /api/creatives/admin/:id/deactivate - Desativar criativo
 * ADMIN/SUPER_ADMIN only
 */
router.delete(
  '/admin/:id/deactivate',
  authenticate,
  checkAdminRole,
  adminDeactivateCreative
);

/**
 * DELETE /api/creatives/admin/:id - Deletar criativo permanentemente
 * ADMIN/SUPER_ADMIN only
 */
router.delete('/admin/:id', authenticate, checkAdminRole, adminDeleteCreative);

/**
 * GET /api/creatives/admin/stats - Obter estatísticas de criativos
 * ADMIN/SUPER_ADMIN only
 */
router.get('/admin/stats', authenticate, checkAdminRole, adminGetStats);

/**
 * POST /api/creatives/:id/qr-position - Definir posição do QR code
 * ADMIN/SUPER_ADMIN only
 * Body: { boxCenterXRatio, boxCenterYRatio, boxSizeRatio }
 */
router.post(
  '/:id/qr-position',
  authenticate,
  checkAdminRole,
  adminSetQRCodePosition
);

/**
 * GET /api/creatives/:id/qr-position - Obter posição do QR code
 * PUBLIC
 */
router.get('/:id/qr-position', getQRCodePositionController);

/**
 * GET /api/creatives/:id - Obter detalhes de um criativo
 * IMPORTANTE: Deve vir por ÚLTIMO para não conflitar com rotas mais específicas
 */
router.get('/:id', getCreative);

export default router;
