import { Router } from "express";
import * as controller from "../controllers/qrcode.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// Rotas públicas
router.post("/scan/:qrCode", controller.scanQRCode);
router.post("/lead/:qrCode", controller.createLeadFromQR);

// Rotas protegidas
router.get("/scans/:personId", authenticate, controller.getScansByPerson);
router.get("/stats", authenticate, controller.getScansStats);

export default router;