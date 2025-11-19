import { Router } from "express";
import * as controller from "../controllers/person.controller";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";

const router = Router();

// Rotas públicas
router.get("/qr/:qrCode", controller.getByQRCode);

// Rotas protegidas (requerem autenticação de administrador)
router.post("/", authenticate, requireAdmin, controller.createPerson);
router.get("/", authenticate, requireAdmin, controller.getAll);
router.get("/:id", authenticate, requireAdmin, controller.getById);
router.get("/:id/stats", authenticate, requireAdmin, controller.getStats);
router.put("/:id", authenticate, requireAdmin, controller.updateById);
router.delete("/:id", authenticate, requireAdmin, controller.deleteById);
router.delete("/:id/hard", authenticate, requireAdmin, controller.hardDeleteById);

export default router;