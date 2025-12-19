import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import personRoutes from "./routes/person.routes";
import leadRoutes from "./routes/lead.routes";
import qrcodeRoutes from "./routes/qrcode.routes";
import uploadRoutes from "./routes/upload.routes";
import creativeRoutes from "./routes/creative.routes";
import sellerAuthRoutes from "./routes/seller-auth.routes";
import sellerLeadsRoutes from "./routes/seller-leads.routes";
import manualRegisterRoutes from "./routes/manualRegister.routes";
import approvalRoutes from "./routes/approval.routes";
import migrationRoutes from "./routes/migration.routes";
import { errorHandler } from "./shared/errorHandler";
import { initializeMinIOBucket } from "./services/storage.service";

const app = express();

// Inicializa o bucket do MinIO
initializeMinIOBucket().catch(error => {
  console.error("Erro ao inicializar MinIO:", error);
});

// Middlewares globais
app.use(cors());
// Aumenta limite para suportar imagens base64 (10MB)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rota de health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API está funcionando!",
    timestamp: new Date().toISOString(),
  });
});

// Rotas da API
app.use("/api/auth", authRoutes);
app.use("/api/person", personRoutes);
app.use("/api/lead", leadRoutes);
app.use("/api/qrcode", qrcodeRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/creatives", creativeRoutes);
app.use("/api/seller", sellerAuthRoutes);
app.use("/api/seller", sellerLeadsRoutes);
app.use("/api", manualRegisterRoutes);
app.use("/api/approval", approvalRoutes);
app.use("/api/admin", authenticate, migrationRoutes);

// Rota 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Rota não encontrada",
  });
});

// ==================== GLOBAL ERROR HANDLER (must be last middleware) ====================
app.use(errorHandler);

export default app;