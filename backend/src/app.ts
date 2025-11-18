import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import personRoutes from "./routes/person.routes";
import leadRoutes from "./routes/lead.routes";
import qrcodeRoutes from "./routes/qrcode.routes";
import uploadRoutes from "./routes/upload.routes";

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Rota 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Rota não encontrada",
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Erro:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Erro interno do servidor",
  });
});

export default app;