import { Router } from "express";
import * as controller from "../controllers/lead.controller";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/lead:
 *   post:
 *     summary: Criar novo lead (Admin)
 *     tags:
 *       - Lead
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Lead criado com sucesso
 *       403:
 *         description: Permissão negada
 *   get:
 *     summary: Listar todos os leads (Admin)
 *     tags:
 *       - Lead
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de leads
 *       403:
 *         description: Permissão negada
 */
// Rotas protegidas (requerem autenticação de administrador)
router.post("/", authenticate, requireAdmin, controller.createLead);
router.get("/", authenticate, requireAdmin, controller.getAllLeads);

/**
 * @swagger
 * /api/lead/my-leads:
 *   get:
 *     summary: Obter meus leads
 *     description: Retorna todos os leads do usuário autenticado
 *     tags:
 *       - Lead
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de meus leads
 *       401:
 *         description: Não autenticado
 */
router.get("/my-leads", authenticate, controller.getMyLeads);

/**
 * @swagger
 * /api/lead/stats:
 *   get:
 *     summary: Obter estatísticas de leads (Admin)
 *     tags:
 *       - Lead
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas dos leads
 */
router.get("/stats", authenticate, requireAdmin, controller.getLeadsStats);

/**
 * @swagger
 * /api/lead/new:
 *   get:
 *     summary: Obter novos leads (Admin)
 *     tags:
 *       - Lead
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de novos leads
 */
router.get("/new", authenticate, requireAdmin, controller.getNewLeads);

/**
 * @swagger
 * /api/lead/owner/{ownerId}:
 *   get:
 *     summary: Obter leads de um proprietário (Admin)
 *     tags:
 *       - Lead
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ownerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de leads do proprietário
 */
router.get("/owner/:ownerId", authenticate, requireAdmin, controller.getLeadsByOwner);

/**
 * @swagger
 * /api/lead/{id}:
 *   get:
 *     summary: Obter lead por ID (Admin)
 *     tags:
 *       - Lead
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dados do lead
 *       404:
 *         description: Lead não encontrado
 *   put:
 *     summary: Atualizar lead (Admin)
 *     tags:
 *       - Lead
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Lead atualizado
 *   delete:
 *     summary: Deletar lead (Admin)
 *     tags:
 *       - Lead
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lead deletado
 */
router.get("/:id", authenticate, requireAdmin, controller.getLeadById);
router.put("/:id", authenticate, requireAdmin, controller.updateLead);
router.delete("/:id", authenticate, requireAdmin, controller.deleteLead);

/**
 * @swagger
 * /api/lead/{id}/status:
 *   patch:
 *     summary: Atualizar status do lead (Admin)
 *     tags:
 *       - Lead
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status atualizado
 */
router.patch("/:id/status", authenticate, requireAdmin, controller.updateLeadStatus);

export default router;