import { Router } from "express";
import * as sellerAuthController from "../controllers/seller-auth.controller";
import { authenticate, requireSeller } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/seller/login:
 *   post:
 *     summary: Login de vendedor
 *     description: Autentica um vendedor e retorna um token JWT
 *     tags:
 *       - Seller
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login bem-sucedido
 *       401:
 *         description: Email ou senha inválido
 */
// Rotas públicas
router.post("/login", sellerAuthController.sellerLogin);

/**
 * @swagger
 * /api/seller/verify/{token}:
 *   get:
 *     summary: Verificar email do vendedor
 *     tags:
 *       - Seller
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verificado com sucesso
 *       400:
 *         description: Token inválido ou expirado
 */
router.get("/verify/:token", sellerAuthController.verifyEmailToken);

/**
 * @swagger
 * /api/seller/set-password:
 *   post:
 *     summary: Definir senha do vendedor
 *     tags:
 *       - Seller
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Senha definida com sucesso
 *       400:
 *         description: Token inválido
 */
router.post("/set-password", sellerAuthController.setPassword);

/**
 * @swagger
 * /api/seller/forgot-password:
 *   post:
 *     summary: Solicitar reset de senha
 *     tags:
 *       - Seller
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Email enviado com sucesso
 */
router.post("/forgot-password", sellerAuthController.requestPasswordReset);

/**
 * @swagger
 * /api/seller/reset-password:
 *   post:
 *     summary: Resetar senha do vendedor
 *     tags:
 *       - Seller
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Senha resetada com sucesso
 */
router.post("/reset-password", sellerAuthController.resetPassword);

/**
 * @swagger
 * /api/seller/resend-verification-email:
 *   post:
 *     summary: Reenviar email de verificação
 *     tags:
 *       - Seller
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Email reenviado com sucesso
 */
router.post("/resend-verification-email", sellerAuthController.resendVerificationEmail);

/**
 * @swagger
 * /api/seller/profile:
 *   get:
 *     summary: Obter perfil do vendedor
 *     description: Retorna os dados do perfil do vendedor autenticado
 *     tags:
 *       - Seller
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do perfil
 *       401:
 *         description: Não autenticado
 */
// Rotas protegidas (requerem autenticação de vendedor)
router.get("/profile", authenticate, requireSeller, sellerAuthController.getSellerProfile);

export default router;
