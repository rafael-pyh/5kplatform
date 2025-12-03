import { Router } from "express";
import * as controller from "../controllers/qrcode.controller";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";

const router = Router();

// Rotas públicas
router.post("/scan/:qrCode", controller.scanQRCode);
router.post("/lead/:qrCode", controller.createLeadFromQR);

// Rotas protegidas (requerem autenticação de administrador)
router.get("/scans/:personId", authenticate, requireAdmin, controller.getScansByPerson);
router.get("/stats", authenticate, requireAdmin, controller.getScansStats);
// Nova rota para servir QR Code
router.get("/serve/:personId", authenticate, requireAdmin, controller.serveQRCode);

export default router;