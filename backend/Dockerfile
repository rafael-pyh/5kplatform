# Build stage
FROM --platform=linux/amd64 node:20-slim AS builder

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl libssl-dev

# Copiar arquivos de dependências
COPY backend/package*.json ./

# Instalar dependências
RUN npm install

# Copiar Prisma schema e migrations
COPY backend/prisma ./prisma/

# Gerar Prisma Client (não precisa de DATABASE_URL para generate)
RUN npx prisma generate --schema=./prisma/schema.prisma

# Copiar código fonte
COPY backend/tsconfig.json ./tsconfig.json
COPY backend/src ./src

# Compilar TypeScript
RUN npm run build

# Compilar seed.ts separadamente se existir
RUN if [ -f "prisma/seed.ts" ]; then \
      npx tsc prisma/seed.ts --outDir dist/prisma --esModuleInterop --skipLibCheck --resolveJsonModule; \
    fi

# Production stage
FROM --platform=linux/amd64 node:20-slim AS runtime

WORKDIR /app

# Instalar OpenSSL e netcat
RUN apt-get update -y && \
    apt-get install -y openssl libssl-dev netcat-openbsd && \
    rm -rf /var/lib/apt/lists/*

# Copiar package.json e Prisma config
COPY backend/package*.json ./
COPY backend/prisma.config.js ./

# Instalar apenas dependências de produção
RUN npm install --omit=dev

# Copiar Prisma schema (necessário para migrations e generate)
COPY backend/prisma ./prisma/

# Copiar build da stage anterior
COPY --from=builder /app/dist ./dist

# Copiar Prisma Client gerado (importante!)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copiar entrypoint
COPY backend/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Criar usuário não-root
RUN groupadd -g 1001 nodejs && \
    useradd -u 1001 -g nodejs --shell /bin/bash --create-home nodejs && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expor porta
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Usar entrypoint
CMD ["/usr/local/bin/docker-entrypoint.sh"]