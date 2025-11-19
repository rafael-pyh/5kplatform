import { Router } from "express";
import * as sellerLeadsController from "../controllers/seller-leads.controller";
import { authenticate, requireSeller } from "../middlewares/auth.middleware";

const router = Router();

// Rotas protegidas (requerem autenticação de vendedor)
router.get("/my-leads", authenticate, requireSeller, sellerLeadsController.getMyLeads);
router.get("/my-leads/:id", authenticate, requireSeller, sellerLeadsController.getMyLeadById);
router.get("/my-stats", authenticate, requireSeller, sellerLeadsController.getMyStats);

export default router;
