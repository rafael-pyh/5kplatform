# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY backend/prisma ./prisma/

# Instalar dependências
RUN npm install

# Copiar código fonte
# COPY .env .env
COPY . .

# Gerar Prisma Client
RUN npx prisma generate

# Compilar TypeScript (src)
RUN npm run build

# Compilar seed.ts separadamente
RUN npx tsc prisma/seed.ts --outDir dist/prisma --esModuleInterop --skipLibCheck --resolveJsonModule

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY backend/prisma ./prisma/
COPY backend/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Instalar apenas dependências de produção
RUN npm install --omit=dev

# Gerar Prisma Client will be done at startup via entrypoint

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

# Use entrypoint to allow optional auto-migration and seeding
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]