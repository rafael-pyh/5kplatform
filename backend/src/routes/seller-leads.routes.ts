import { Router } from "express";
import * as sellerLeadsController from "../controllers/seller-leads.controller";
import { authenticate, requireSeller } from "../middlewares/auth.middleware";

const router = Router();

// Rotas protegidas (requerem autenticação de vendedor)
router.get("/my-leads", authenticate, requireSeller, sellerLeadsController.getMyLeads);
router.get("/my-leads/:id", authenticate, requireSeller, sellerLeadsController.getMyLeadById);
router.get("/my-stats", authenticate, requireSeller, sellerLeadsController.getMyStats);

// DEBUG ENDPOINTS (temporary for diagnosis - remove in production)
router.get("/test-logging", authenticate, sellerLeadsController.testLogging);
router.get("/debug/stats", authenticate, requireSeller, sellerLeadsController.debugStats);
router.get("/debug/logs", authenticate, sellerLeadsController.debugLogs);

export default router;
