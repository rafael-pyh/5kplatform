import { Router } from "express";
import * as controller from "../controllers/lead.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// Rotas protegidas (requerem autenticação)
router.post("/", authenticate, controller.createLead);
router.get("/", authenticate, controller.getAllLeads);
router.get("/stats", authenticate, controller.getLeadsStats);
router.get("/new", authenticate, controller.getNewLeads);
router.get("/owner/:ownerId", authenticate, controller.getLeadsByOwner);
router.get("/:id", authenticate, controller.getLeadById);
router.put("/:id", authenticate, controller.updateLead);
router.patch("/:id/status", authenticate, controller.updateLeadStatus);
router.delete("/:id", authenticate, controller.deleteLead);

export default router;