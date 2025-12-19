import { Router, Request, Response, NextFunction } from "express";
import { requireSuperAdmin } from "../middlewares/auth.middleware";

const router = Router();

// Endpoints de migração removidos - QR codes agora são salvos exclusivamente como URLs S3

export default router;
