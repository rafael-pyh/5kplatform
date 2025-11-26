# ---------- BUILD STAGE ----------
FROM --platform=linux/amd64 node:20-slim AS builder

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl libssl3

# Dependências
COPY backend/package*.json ./
COPY backend/prisma ./prisma/
RUN npm install

# Código
COPY backend/tsconfig*.json ./
COPY backend/src ./src
COPY backend/prisma ./prisma

# Build
RUN npx prisma generate
RUN npm run build

# Build do seed
RUN npx tsc prisma/seed.ts --outDir dist/prisma
# ------------------------------------------------------------


# ---------- RUNTIME STAGE ----------
FROM --platform=linux/amd64 node:20-slim AS runtime

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl libssl3

COPY backend/package*.json ./

# Apenas dependências de produção
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY backend/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 4000

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

CMD ["node", "dist/server.js"]
