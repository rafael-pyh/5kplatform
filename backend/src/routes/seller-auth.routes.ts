import { Router } from "express";
import * as sellerAuthController from "../controllers/seller-auth.controller";
import { authenticate, requireSeller } from "../middlewares/auth.middleware";

const router = Router();

// Rotas públicas
router.post("/login", sellerAuthController.sellerLogin);
router.get("/verify/:token", sellerAuthController.verifyEmailToken);
router.post("/set-password", sellerAuthController.setPassword);
router.post("/forgot-password", sellerAuthController.requestPasswordReset);
router.post("/reset-password", sellerAuthController.resetPassword);

// Rotas protegidas (requerem autenticação de vendedor)
router.get("/profile", authenticate, requireSeller, sellerAuthController.getSellerProfile);

export default router;
