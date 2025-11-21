# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
# Use explicit backend path so Docker builds correctly when context is repo root
COPY ./backend/package*.json ./
COPY ./backend/prisma ./prisma/

# Instalar dependências
RUN npm install

# Copiar código fonte (diretório backend quando o contexto de build é o repo root)
# COPY .env .env
COPY ./backend .

# Gerar Prisma Client
RUN npx prisma generate

# Compilar TypeScript (src)
RUN npm run build

# Compilar seed.ts separadamente
RUN npx tsc prisma/seed.ts --outDir dist/prisma --esModuleInterop --skipLibCheck --resolveJsonModule

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copiar arquivos de dependências para stage de produção
COPY ./backend/package*.json ./
COPY ./backend/prisma ./prisma/

# Instalar apenas dependências de produção
RUN npm install --omit=dev

# Gerar Prisma Client
RUN npx prisma generate

# Copiar build da stage anterior
COPY --from=builder /app/dist ./dist

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Mudar propriedade dos arquivos
RUN chown -R nodejs:nodejs /app

# Usar usuário não-root
USER nodejs

# Expor porta
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando para iniciar (com migrations e seed)
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/prisma/seed.js && npm start"]