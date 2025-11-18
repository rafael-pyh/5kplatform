import { Router } from "express";
import multer from "multer";
import * as controller from "../controllers/upload.controller";
import { authenticate } from "../middlewares/auth.middleware";

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

// Rotas protegidas
router.post(
  "/profile",
  authenticate,
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

export default router;