import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// Rotas públicas
router.post("/register", authController.register);
router.post("/login", authController.login);

// Rotas protegidas (requerem autenticação)
router.get("/users", authenticate, authController.getAllUsers);
router.get("/users/:id", authenticate, authController.getUserById);
router.put("/users/:id", authenticate, authController.updateUser);
router.delete("/users/:id", authenticate, authController.deleteUser);

export default router;