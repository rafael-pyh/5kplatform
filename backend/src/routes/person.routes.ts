import { Router } from "express";
import * as controller from "../controllers/person.controller";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/person/qr/{qrCode}:
 *   get:
 *     summary: Obter pessoa por QR Code
 *     description: Busca uma pessoa pelo seu código QR
 *     tags:
 *       - Person
 *     parameters:
 *       - in: path
 *         name: qrCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Código QR da pessoa
 *     responses:
 *       200:
 *         description: Dados da pessoa encontrada
 *       404:
 *         description: Pessoa não encontrada
 */
// Rotas públicas
router.get("/qr/:qrCode", controller.getByQRCode);

/**
 * @swagger
 * /api/person/states:
 *   get:
 *     summary: Listar estados
 *     description: Retorna lista de todos os estados
 *     tags:
 *       - Person
 *     responses:
 *       200:
 *         description: Lista de estados
 */
router.get("/states", controller.getStates);

/**
 * @swagger
 * /api/person:
 *   post:
 *     summary: Criar nova pessoa (Admin)
 *     tags:
 *       - Person
 *     security:
 *       - bearerAuth: []
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
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pessoa criada com sucesso
 *       403:
 *         description: Permissão negada
 *   get:
 *     summary: Listar todas as pessoas (Admin)
 *     tags:
 *       - Person
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pessoas
 *       403:
 *         description: Permissão negada
 */
// Rotas protegidas (requerem autenticação de administrador)
router.post("/", authenticate, requireAdmin, controller.createPerson);
router.get("/", authenticate, requireAdmin, controller.getAll);

/**
 * @swagger
 * /api/person/{id}:
 *   get:
 *     summary: Obter pessoa por ID (Admin)
 *     tags:
 *       - Person
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
 *         description: Dados da pessoa
 *       404:
 *         description: Pessoa não encontrada
 *   put:
 *     summary: Atualizar pessoa
 *     tags:
 *       - Person
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
 *         description: Pessoa atualizada
 *   delete:
 *     summary: Deletar pessoa (Admin)
 *     tags:
 *       - Person
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
 *         description: Pessoa deletada
 */
router.get("/:id", authenticate, requireAdmin, controller.getById);

/**
 * @swagger
 * /api/person/{id}/admin-details:
 *   get:
 *     summary: Obter detalhes completos da pessoa para admin (incluindo saldo)
 *     tags:
 *       - Person
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dados completos da pessoa incluindo saldo
 *       403:
 *         description: Permissão negada
 *       404:
 *         description: Pessoa não encontrada
 */
router.get("/:id/admin-details", authenticate, requireAdmin, controller.getPersonDetailsForAdmin);
router.put("/:id", authenticate, controller.updateById);
router.delete("/:id", authenticate, requireAdmin, controller.deleteById);

/**
 * @swagger
 * /api/person/{id}/stats:
 *   get:
 *     summary: Obter estatísticas da pessoa (Admin)
 *     tags:
 *       - Person
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
 *         description: Estatísticas da pessoa
 */
router.get("/:id/stats", authenticate, requireAdmin, controller.getStats);
router.delete("/:id/hard", authenticate, requireAdmin, controller.hardDeleteById);
router.put("/:id/activate", authenticate, requireAdmin, controller.activate);

export default router;