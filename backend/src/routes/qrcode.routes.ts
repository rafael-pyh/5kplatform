import { Router } from "express";
import * as controller from "../controllers/qrcode.controller";
import { authenticate, requireAdmin, requireSeller } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/qrcode/scan/{qrCode}:
 *   post:
 *     summary: Escanear QR Code
 *     description: Registra um scan de QR Code
 *     tags:
 *       - QRCode
 *     parameters:
 *       - in: path
 *         name: qrCode
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               location:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: QR Code escaneado com sucesso
 *       404:
 *         description: QR Code não encontrado
 */
// Rotas públicas
router.post("/scan/:qrCode", controller.scanQRCode);

/**
 * @swagger
 * /api/qrcode/lead/{qrCode}:
 *   post:
 *     summary: Criar lead a partir de QR Code
 *     tags:
 *       - QRCode
 *     parameters:
 *       - in: path
 *         name: qrCode
 *         required: true
 *         schema:
 *           type: string
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
 *     responses:
 *       201:
 *         description: Lead criado com sucesso
 */
router.post("/lead/:qrCode", controller.createLeadFromQR);

/**
 * @swagger
 * /api/qrcode/my-scans:
 *   get:
 *     summary: Obter meus scans
 *     description: Retorna todos os QR Codes escaneados pelo vendedor
 *     tags:
 *       - QRCode
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de scans
 *       401:
 *         description: Não autenticado
 */
// Rotas para vendedores autenticados
router.get("/my-scans", authenticate, requireSeller, controller.getMyScans);

/**
 * @swagger
 * /api/qrcode/scans/{personId}:
 *   get:
 *     summary: Obter scans de uma pessoa (Admin)
 *     tags:
 *       - QRCode
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: personId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de scans da pessoa
 */
// Rotas protegidas (requerem autenticação de administrador)
router.get("/scans/:personId", authenticate, requireAdmin, controller.getScansByPerson);

/**
 * @swagger
 * /api/qrcode/stats:
 *   get:
 *     summary: Obter estatísticas de scans (Admin)
 *     tags:
 *       - QRCode
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas dos scans
 */
router.get("/stats", authenticate, requireAdmin, controller.getScansStats);

/**
 * @swagger
 * /api/qrcode/image/{personId}:
 *   get:
 *     summary: Servir imagem de QR Code
 *     tags:
 *       - QRCode
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: personId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Imagem do QR Code
 */
// Rota para servir QR Code via proxy (autenticada)
router.get("/image/:personId", authenticate, controller.serveQRCode);

export default router;