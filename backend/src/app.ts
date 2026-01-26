import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import authRoutes from "./routes/auth.routes";
import personRoutes from "./routes/person.routes";
import leadRoutes from "./routes/lead.routes";
import qrcodeRoutes from "./routes/qrcode.routes";
import uploadRoutes from "./routes/upload.routes";
import creativeRoutes from "./routes/creative.routes";
import sellerAuthRoutes from "./routes/seller-auth.routes";
import sellerLeadsRoutes from "./routes/seller-leads.routes";
import sellerRoutes from "./routes/seller.routes";
import registrationRoutes from "./routes/registration.routes";
import manualRegisterRoutes from "./routes/manualRegister.routes";
import approvalRoutes from "./routes/approval.routes";
import migrationRoutes from "./routes/migration.routes";
import emailActivationRouter from "./routes/emailActivation.routes";
import whatsappTemplateRoutes from "./routes/whatsapp-template.routes";
import cacheRoutes from "./routes/cache.routes";
import productRoutes from "./routes/product.routes";
import kitRoutes from "./routes/kit.routes";
import orderRoutes from "./routes/order.routes";
import creditRoutes from "./routes/credit.routes";
import withdrawalRoutes from "./routes/withdrawal.routes";
import { errorHandler } from "./shared/errorHandler";
import { initializeMinIOBucket } from "./services/storage.service";
import { authenticate } from "./middlewares/auth.middleware";
import { swaggerSpec } from "./config/swagger.config";

const app = express();

// Inicializa o bucket do MinIO
initializeMinIOBucket().catch(error => {
  console.error("Erro ao inicializar MinIO:", error);
});

// Configuração de CORS
const corsOptions = {
  origin: [
    'https://5kenergiasolar.up.railway.app',
    'https://5kplatform.vercel.app',
    'http://localhost:3000',
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middlewares globais
app.use(cors(corsOptions));

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Muitas requisições, tente novamente mais tarde."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth attempts per windowMs
  message: {
    success: false,
    message: "Muitas tentativas de autenticação, tente novamente mais tarde."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Limite reduzido para payloads (2MB)
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));



// Rota de health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API está funcionando!",
    timestamp: new Date().toISOString(),
  });
});

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas públicas da API
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/auth", authLimiter, registrationRoutes);
app.use("/api", authLimiter, manualRegisterRoutes);
app.use("/api", authLimiter, emailActivationRouter);

// Middleware de autenticação para todas as rotas /api (exceto as públicas acima)
app.use('/api', authenticate);

// Rotas protegidas da API
app.use("/api/person", personRoutes);
app.use("/api/lead", leadRoutes);
app.use("/api/qrcode", qrcodeRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/creatives", creativeRoutes);

// ============== KIT / SHOP ROUTES ==============
app.use("/api/shop/products", productRoutes);
app.use("/api/shop/kits", kitRoutes);
app.use("/api/shop/orders", orderRoutes);
app.use("/api/shop/credits", creditRoutes);
app.use("/api/shop/withdrawals", withdrawalRoutes);

app.use("/api/seller", sellerAuthRoutes);
app.use("/api/seller", sellerLeadsRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/approval", approvalRoutes);
app.use("/api/admin", migrationRoutes);
app.use("/api/whatsapp-templates", whatsappTemplateRoutes);
// Admin cache management (protected by authenticate + requireAdmin inside routes)
app.use("/api/admin/cache", cacheRoutes);

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