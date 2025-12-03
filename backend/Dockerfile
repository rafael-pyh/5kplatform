# Build stage
FROM --platform=linux/amd64 node:20-slim AS builder

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl libssl-dev

# Copiar arquivos de dependências
COPY backend/package*.json ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY backend/tsconfig.json ./tsconfig.json
COPY backend/src ./src

# Compilar TypeScript
RUN npm run build

# Production stage
FROM --platform=linux/amd64 node:20-slim AS runtime

WORKDIR /app

# Instalar PostgreSQL client e netcat
RUN apt-get update -y && \
    apt-get install -y postgresql-client netcat-openbsd && \
    rm -rf /var/lib/apt/lists/*

# Copiar package.json
COPY backend/package*.json ./

# Instalar apenas dependências de produção
RUN npm install --omit=dev

# Copiar Sequelize config e migrations
COPY backend/config ./config
COPY backend/.sequelizerc ./
COPY backend/src/migrations ./src/migrations
COPY backend/src/seeders ./src/seeders

# Copiar build da stage anterior
COPY --from=builder /app/dist ./dist

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