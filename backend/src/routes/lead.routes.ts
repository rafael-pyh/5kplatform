import { Router } from "express";
import * as controller from "../controllers/lead.controller";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";

const router = Router();

// Rotas protegidas (requerem autenticação de administrador)
router.post("/", authenticate, requireAdmin, controller.createLead);
router.get("/", authenticate, requireAdmin, controller.getAllLeads);
router.get("/stats", authenticate, requireAdmin, controller.getLeadsStats);
router.get("/new", authenticate, requireAdmin, controller.getNewLeads);
router.get("/owner/:ownerId", authenticate, requireAdmin, controller.getLeadsByOwner);
router.get("/:id", authenticate, requireAdmin, controller.getLeadById);
router.put("/:id", authenticate, requireAdmin, controller.updateLead);
router.patch("/:id/status", authenticate, requireAdmin, controller.updateLeadStatus);
router.delete("/:id", authenticate, requireAdmin, controller.deleteLead);

export default router;