import { Router } from "express";
import * as controller from "../controllers/file.controller";

const router = Router();

// Rota pública para servir arquivos do MinIO via proxy
// Usa wildcard (*) para capturar qualquer caminho de arquivo
router.get("/*", controller.serveFile);

export default router;
