import { Router } from "express";
import multer from "multer";
import * as controller from "../controllers/upload.controller";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";

const router = Router();

// Configuração do multer para upload em memória
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Aceita apenas imagens e PDFs
    const allowedMimes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Tipo de arquivo não permitido"));
    }
  },
});

/**
 * @swagger
 * /api/upload/profile:
 *   post:
 *     summary: Upload de foto de perfil (Admin)
 *     description: Faz upload da foto de perfil de um usuário
 *     tags:
 *       - Upload
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Upload realizado com sucesso
 *       413:
 *         description: Arquivo muito grande (máx 5MB)
 * 
 * @swagger
 * /api/upload/energy-bill:
 *   post:
 *     summary: Upload de conta de energia
 *     description: Faz upload da conta de energia para um lead
 *     tags:
 *       - Upload
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Upload realizado com sucesso
 * 
 * @swagger
 * /api/upload/roof-photo:
 *   post:
 *     summary: Upload de foto do telhado
 *     tags:
 *       - Upload
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Upload realizado com sucesso
 * 
 * @swagger
 * /api/upload/poster:
 *   post:
 *     summary: Upload de poster para QR Code
 *     tags:
 *       - Upload
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Upload realizado com sucesso
 */
// Rotas protegidas (requerem autenticação de administrador)
router.post(
  "/profile",
  authenticate,
  requireAdmin,
  upload.single("file"),
  controller.uploadProfilePhoto
);

// Rotas públicas (para formulário de lead)
router.post(
  "/energy-bill",
  upload.single("file"),
  controller.uploadEnergyBill
);

router.post(
  "/roof-photo",
  upload.single("file"),
  controller.uploadRoofPhoto
);

// Upload de poster para QR Code Modal
router.post(
  "/poster",
  authenticate,
  upload.single("file"),
  controller.uploadPoster
);

export default router;