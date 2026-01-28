import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import sequelize from "./database/sequelize";
import { env } from "./config/env";
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
  max: env.isDevelopment ? 1000 : 100, // More permissive in development
  message: {
    success: false,
    message: "Muitas requisições, tente novamente mais tarde."
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => env.isDevelopment, // Skip rate limiting in development
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.isDevelopment ? 50 : 10, // More permissive in development
  message: {
    success: false,
    message: "Muitas tentativas de autenticação, tente novamente mais tarde."
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => env.isDevelopment, // Skip rate limiting in development
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
    environment: process.env.NODE_ENV,
  });
});

// Rota de diagnóstico para verificar migrations e schema
app.get("/diagnostics", async (req, res) => {
  try {
    const diagnostics = {
      success: true,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: {
        connected: false,
        error: null as string | null,
        tables: [] as string[],
        orderTable: {
          exists: false,
          kitIdNullable: false,
          productIdNullable: false,
        }
      },
      migrations: {
        status: 'unknown' as string,
        error: null as string | null,
        pending: [] as string[],
        applied: [] as string[]
      }
    };

    // Verificar conexão com banco
    try {
      await sequelize.authenticate();
      diagnostics.database.connected = true;
    } catch (dbError: any) {
      diagnostics.database.error = dbError.message;
    }

    if (diagnostics.database.connected) {
      // Verificar tabelas
      const [tables] = await sequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);
      diagnostics.database.tables = tables.map((t: any) => t.table_name);

      // Verificar tabela Order
      if (diagnostics.database.tables.includes('Order')) {
        diagnostics.database.orderTable.exists = true;

        const [columns] = await sequelize.query(`
          SELECT column_name, is_nullable, data_type
          FROM information_schema.columns
          WHERE table_schema = 'public' 
            AND table_name = 'Order'
            AND column_name IN ('kitId', 'productId')
        `);

        columns.forEach((col: any) => {
          if (col.column_name === 'kitId') {
            diagnostics.database.orderTable.kitIdNullable = col.is_nullable === 'YES';
          }
          if (col.column_name === 'productId') {
            diagnostics.database.orderTable.productIdNullable = col.is_nullable === 'YES';
          }
        });
      }

      // Verificar status das migrations
      try {
        const { execSync } = require('child_process');
        const output = execSync('npx sequelize-cli db:migrate:status', { encoding: 'utf8' });
        diagnostics.migrations.status = 'checked';
        
        // Parse output to get applied/pending migrations
        const lines = output.split('\n');
        lines.forEach((line: string) => {
          if (line.includes('up ')) {
            diagnostics.migrations.applied.push(line.trim());
          } else if (line.includes('down ')) {
            diagnostics.migrations.pending.push(line.trim());
          }
        });
      } catch (migrateError: any) {
        diagnostics.migrations.error = migrateError.message;
      }
    }

    res.json(diagnostics);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Erro ao executar diagnóstico",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
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