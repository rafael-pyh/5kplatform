import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";

const router = Router();

// Rotas públicas
router.post("/register", authController.register);
router.post("/login", authController.login);

// Nova rota para confirmar email
router.post("/confirm-email", authController.confirmEmail);

// Rotas protegidas (requerem autenticação de administrador)
router.get("/users", authenticate, requireAdmin, authController.getAllUsers);
router.get("/users/:id", authenticate, requireAdmin, authController.getUserById);
router.put("/users/:id", authenticate, requireAdmin, authController.updateUser);
router.delete("/users/:id", authenticate, requireAdmin, authController.deleteUser);
router.get("/me", authenticate, authController.getCurrentUser);

// Rota para admin criar outros usuários admin (requer ser admin)
router.post("/admin/users", authenticate, requireAdmin, authController.createAdminUser);

export default router;