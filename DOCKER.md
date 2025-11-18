# 🐳 Guia Docker - 5K Platform

## 📋 O que foi configurado

### ✅ Dockerfile Multi-stage
- **Build stage**: Compila TypeScript e gera Prisma Client
- **Production stage**: Imagem otimizada apenas com código compilado
- **Security**: Usuário não-root
- **Health check**: Verifica se a API está funcionando
- **Auto-migration**: Executa migrações automaticamente ao iniciar

### ✅ Docker Compose
Serviços configurados:
- **api** - Backend Node.js (porta 4000)
- **web** - Frontend (porta 3000)
- **postgres** - Banco de dados PostgreSQL 16 (porta 5432)
- **minio** - Storage S3-compatible (portas 9000 e 9001)
- **pgadmin** - Interface web para gerenciar PostgreSQL (porta 5050)

## 🚀 Como Usar

### 1. Iniciar todos os serviços

```bash
# Na raiz do projeto (onde está o docker-compose.yaml)
docker-compose up -d
```

Este comando irá:
- ✅ Criar rede isolada
- ✅ Criar volumes persistentes
- ✅ Baixar imagens necessárias
- ✅ Construir imagem do backend
- ✅ Iniciar PostgreSQL
- ✅ Iniciar MinIO
- ✅ Executar migrações automaticamente
- ✅ Iniciar API
- ✅ Iniciar Frontend (quando pronto)

### 2. Verificar status dos containers

```bash
docker-compose ps
```

### 3. Ver logs

```bash
# Todos os serviços
docker-compose logs -f

# Apenas a API
docker-compose logs -f api

# Apenas o banco
docker-compose logs -f postgres
```

### 4. Executar seed (dados iniciais)

```bash
docker-compose exec api npm run prisma:seed
```

### 5. Acessar os serviços

- **API**: http://localhost:4000
- **API Health**: http://localhost:4000/health
- **Frontend**: http://localhost:3000
- **MinIO Console**: http://localhost:9001 (user: minio / pass: minio123)
- **PgAdmin**: http://localhost:5050 (email: admin@5kplatform.com / pass: admin123)

### 6. Parar todos os serviços

```bash
docker-compose down
```

### 7. Parar e remover volumes (⚠️ apaga dados)

```bash
docker-compose down -v
```

## 🔧 Comandos Úteis

### Reconstruir containers

```bash
# Reconstruir sem cache
docker-compose build --no-cache

# Reconstruir e iniciar
docker-compose up -d --build
```

### Acessar shell do container

```bash
# Shell da API
docker-compose exec api sh

# Shell do Postgres
docker-compose exec postgres psql -U postgres -d 5kplatform
```

### Executar comandos no container da API

```bash
# Gerar Prisma Client
docker-compose exec api npx prisma generate

# Ver migrações
docker-compose exec api npx prisma migrate status

# Criar migração
docker-compose exec api npx prisma migrate dev --name nome_da_migracao

# Abrir Prisma Studio
docker-compose exec api npx prisma studio
```

### Ver uso de recursos

```bash
docker stats
```

### Limpar sistema Docker

```bash
# Remover containers parados
docker container prune

# Remover imagens não usadas
docker image prune

# Limpar tudo (⚠️ cuidado)
docker system prune -a
```

## 📊 Estrutura dos Volumes

```
volumes:
  postgres_data    # Dados do PostgreSQL
  minio_data      # Arquivos do MinIO
  pgadmin_data    # Configurações do PgAdmin
```

Os dados são persistidos mesmo se você parar os containers.

## 🔐 Configuração do PgAdmin

Ao acessar http://localhost:5050:

1. **Login**:
   - Email: `admin@5kplatform.com`
   - Senha: `admin123`

2. **Adicionar Server**:
   - Name: `5K Platform`
   - Host: `postgres` (nome do container)
   - Port: `5432`
   - Database: `5kplatform`
   - Username: `postgres`
   - Password: `postgres`

## 🔍 Troubleshooting

### API não inicia

```bash
# Ver logs detalhados
docker-compose logs api

# Verificar se o Postgres está rodando
docker-compose ps postgres

# Verificar health do Postgres
docker-compose exec postgres pg_isready -U postgres
```

### Erro de migração

```bash
# Entrar no container
docker-compose exec api sh

# Executar migração manualmente
npx prisma migrate deploy

# Ver status
npx prisma migrate status
```

### Resetar banco de dados

```bash
# Parar tudo
docker-compose down

# Remover volume do Postgres
docker volume rm 5kplatform_postgres_data

# Iniciar novamente
docker-compose up -d

# Executar seed
docker-compose exec api npm run prisma:seed
```

### MinIO não aceita uploads

```bash
# Verificar logs do MinIO
docker-compose logs minio

# Recriar bucket
docker-compose exec api node -e "
const { ensureBucket } = require('./dist/utils/minio');
ensureBucket();
"
```

### Porta já em uso

```bash
# Windows - Ver processos na porta
netstat -ano | findstr :4000

# Matar processo (substitua PID)
taskkill /PID <PID> /F

# Ou altere a porta no docker-compose.yaml
ports:
  - "4001:4000"  # Usar porta 4001 no host
```

## 🔄 Workflow de Desenvolvimento

### Desenvolvimento com hot-reload

Para desenvolvimento, você pode usar volumes montados:

```yaml
# Adicione isso ao serviço api no docker-compose.yaml
volumes:
  - ./backend:/app
  - /app/node_modules
```

Então use:
```bash
docker-compose up -d
docker-compose exec api npm run dev
```

### Build de produção

O Dockerfile já está otimizado para produção:
```bash
docker-compose up -d --build
```

## 📈 Monitoramento

### Health checks configurados

```bash
# API
curl http://localhost:4000/health

# Postgres
docker-compose exec postgres pg_isready

# MinIO
curl http://localhost:9000/minio/health/live
```

### Métricas

```bash
# CPU, memória, rede de todos containers
docker stats

# Específico da API
docker stats 5kplatform_api
```

## 🚀 Deploy

### Variáveis de ambiente em produção

Crie um arquivo `.env.production`:

```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=super-secret-change-in-production
MINIO_ROOT_USER=production-user
MINIO_ROOT_PASSWORD=production-strong-password
```

Use:
```bash
docker-compose --env-file .env.production up -d
```

## ✅ Checklist de Inicialização

- [ ] Docker e Docker Compose instalados
- [ ] Portas 3000, 4000, 5432, 9000, 9001, 5050 disponíveis
- [ ] Executar `docker-compose up -d`
- [ ] Aguardar todos os health checks passarem
- [ ] Executar seed: `docker-compose exec api npm run prisma:seed`
- [ ] Acessar http://localhost:4000/health
- [ ] Fazer login: POST http://localhost:4000/api/auth/login

## 🎉 Pronto!

Seu ambiente Docker está configurado e pronto para uso!

```bash
# Comando completo para iniciar tudo
docker-compose up -d && \
  sleep 10 && \
  docker-compose exec api npm run prisma:seed && \
  echo "✅ Tudo pronto! API: http://localhost:4000"
```