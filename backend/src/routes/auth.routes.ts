import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";

const router = Router();

// Rotas públicas
router.post("/register", authController.register);
router.post("/login", authController.login);

// Rotas protegidas (requerem autenticação)
router.get("/users", authenticate, authController.getAllUsers);
router.get("/users/:id", authenticate, authController.getUserById);
router.put("/users/:id", authenticate, authController.updateUser);
router.delete("/users/:id", authenticate, authController.deleteUser);

// Rota para admin criar outros usuários admin (requer ser admin)
router.post("/admin/users", authenticate, requireAdmin, authController.createAdminUser);

export default router;