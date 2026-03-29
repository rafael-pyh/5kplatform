import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar novo usuário
 *     description: Cria uma nova conta de usuário
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *       400:
 *         description: Email já existe ou dados inválidos
 *       500:
 *         description: Erro interno do servidor
 */
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar novo usuário
 *     description: Cria uma nova conta de usuário
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *       400:
 *         description: Email já existe ou dados inválidos
 *       500:
 *         description: Erro interno do servidor
 */
// Rotas públicas
router.post("/register", authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login do usuário
 *     description: Autentica um usuário e retorna um token JWT
 *     tags:
 *       - Authentication
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
 *         description: Login bem-sucedido, retorna token JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Email ou senha inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Solicitar reset de senha
 *     description: Envia um email com link para resetar a senha
 *     tags:
 *       - Authentication
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
 *       404:
 *         description: Usuário não encontrado
 */
router.post("/forgot-password", authController.requestPasswordReset);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Resetar senha
 *     description: Reseta a senha do usuário com token de reset
 *     tags:
 *       - Authentication
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
 *       400:
 *         description: Token inválido ou expirado
 */
router.post("/reset-password", authController.resetPassword);

/**
 * @swagger
 * /api/auth/confirm-email:
 *   post:
 *     summary: Confirmar email
 *     description: Confirma o email do usuário
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email confirmado com sucesso
 *       400:
 *         description: Token inválido ou expirado
 */
router.post("/confirm-email", authController.confirmEmail);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obter dados do usuário autenticado
 *     description: Retorna os dados do usuário atualmente autenticado
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 email:
 *                   type: string
 *                 name:
 *                   type: string
 *       401:
 *         description: Não autenticado
 */
router.get("/me", authenticate, authController.getCurrentUser);

/**
 * @swagger
 * /api/auth/users:
 *   get:
 *     summary: Listar todos os usuários (Admin)
 *     description: Retorna lista de todos os usuários. Requer permissão de admin
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Permissão negada (requer admin)
 */
// Rotas protegidas (requerem autenticação de administrador)
router.get("/users", authenticate, requireAdmin, authController.getAllUsers);

/**
 * @swagger
 * /api/auth/users/{id}:
 *   get:
 *     summary: Obter usuário por ID (Admin)
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Dados do usuário
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Permissão negada
 *       404:
 *         description: Usuário não encontrado
 *   put:
 *     summary: Atualizar usuário (Admin)
 *     tags:
 *       - Authentication
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
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuário atualizado
 *       403:
 *         description: Permissão negada
 *   delete:
 *     summary: Deletar usuário (Admin)
 *     tags:
 *       - Authentication
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
 *         description: Usuário deletado
 *       403:
 *         description: Permissão negada
 */
router.get("/users/:id", authenticate, requireAdmin, authController.getUserById);
router.put("/users/:id", authenticate, requireAdmin, authController.updateUser);
router.delete("/users/:id", authenticate, requireAdmin, authController.deleteUser);

export default router;