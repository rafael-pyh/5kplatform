import { Router } from 'express';
import {
  adminCreateTemplate,
  adminListAllTemplates,
  getActiveTemplates,
  adminGetTemplate,
  adminUpdateTemplate,
  adminDeleteTemplate,
  getProcessedMessage,
  getDefaultTemplateController,
} from '../controllers/whatsapp-template.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { PersonRole } from '../models/Person';

const router = Router();

// Middleware para verificar se é admin
const checkAdminRole = (req: any, res: any, next: any) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Não autenticado',
    });
  }

  if (![PersonRole.ADMIN, PersonRole.SUPER_ADMIN].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas administradores podem acessar este recurso.',
    });
  }

  next();
};

// ===== PUBLIC ROUTES =====

/**
 * GET /api/whatsapp-templates/active
 * Listar templates ativos
 */
router.get('/active', getActiveTemplates);

/**
 * GET /api/whatsapp-templates/default
 * Obter template padrão
 */
router.get('/default', getDefaultTemplateController);

/**
 * POST /api/whatsapp-templates/process-message
 * Processar mensagem com nome do cliente
 * Body: { templateId: string, customerName: string }
 */
router.post('/process-message', getProcessedMessage);

// ===== ADMIN ROUTES =====

/**
 * GET /api/whatsapp-templates/admin/all
 * ADMIN: Listar todos os templates (ativos e inativos)
 */
router.get('/admin/all', authenticate, checkAdminRole, adminListAllTemplates);

/**
 * POST /api/whatsapp-templates/admin
 * ADMIN: Criar novo template
 * Body: { name: string, message: string }
 */
router.post('/admin', authenticate, checkAdminRole, adminCreateTemplate);

/**
 * GET /api/whatsapp-templates/admin/:templateId
 * ADMIN: Obter um template por ID
 */
router.get('/admin/:templateId', authenticate, checkAdminRole, adminGetTemplate);

/**
 * PUT /api/whatsapp-templates/admin/:templateId
 * ADMIN: Atualizar um template
 * Body: { name?: string, message?: string, isActive?: boolean }
 */
router.put(
  '/admin/:templateId',
  authenticate,
  checkAdminRole,
  adminUpdateTemplate
);

/**
 * DELETE /api/whatsapp-templates/admin/:templateId
 * ADMIN: Deletar um template
 */
router.delete(
  '/admin/:templateId',
  authenticate,
  checkAdminRole,
  adminDeleteTemplate
);

export default router;
