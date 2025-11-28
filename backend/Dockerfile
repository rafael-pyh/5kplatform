# Build stage
FROM --platform=linux/amd64 node:20-slim AS builder

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl libssl-dev

# Copiar arquivos de dependências
COPY backend/package*.json ./
COPY backend/prisma ./prisma/

# Instalar dependências
RUN npm install

# Copiar código fonte
# Copiar arquivos do backend (evita copiar o repo root e garante tsconfig correto)
# Copia tsconfig, src e arquivos necessários para build
COPY backend/tsconfig.json ./tsconfig.json
COPY backend/src ./src
COPY backend/prisma ./prisma
COPY backend/prisma/seed.ts prisma/seed.ts
# COPY backend/.env .env
COPY backend/tsconfig.* ./

# Gerar Prisma Client
RUN npx prisma generate

# Compilar TypeScript (src)
RUN npm run build

# Compilar seed.ts separadamente
RUN npx tsc prisma/seed.ts --outDir dist/prisma --esModuleInterop --skipLibCheck --resolveJsonModule

# Production stage
FROM --platform=linux/amd64 node:20-slim AS runtime

WORKDIR /app

# Instalar OpenSSL e netcat (necessários para Prisma e health checks)
RUN apt-get update -y && \
    apt-get install -y openssl libssl-dev netcat-openbsd && \
    rm -rf /var/lib/apt/lists/*

# Copiar arquivos de dependências
COPY backend/package*.json ./
COPY backend/prisma ./prisma/
COPY backend/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Instalar apenas dependências de produção
RUN npm install --omit=dev

# Gerar Prisma Client will be done at startup via entrypoint

# Copiar build da stage anterior
COPY --from=builder /app/dist ./dist

# Criar usuário não-root para segurança
RUN groupadd -g 1001 nodejs && \
    useradd -u 1001 -g nodejs --shell /bin/bash --create-home nodejs

# Mudar propriedade dos arquivos
RUN chown -R nodejs:nodejs /app

# Usar usuário não-root
# USER nodejs

# Expor porta
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use entrypoint to allow optional auto-migration and seeding
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]