import { Router } from "express";
import * as controller from "../controllers/person.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// Rotas públicas
router.get("/qr/:qrCode", controller.getByQRCode);

// Rotas protegidas (requerem autenticação)
router.post("/", authenticate, controller.createPerson);
router.get("/", authenticate, controller.getAll);
router.get("/:id", authenticate, controller.getById);
router.get("/:id/stats", authenticate, controller.getStats);
router.put("/:id", authenticate, controller.updateById);
router.delete("/:id", authenticate, controller.deleteById);
router.delete("/:id/hard", authenticate, controller.hardDeleteById);

export default router;