# 🔐 Configuração de Variáveis de Ambiente

## Como configurar o .env para Docker

### Passo 1: Criar arquivo .env

```bash
# No backend, copie o exemplo
cd backend
cp .env.example .env
```

### Passo 2: Editar o .env com suas credenciais

```bash
# Edite o arquivo
nano .env  # ou use seu editor preferido
```

Preencha com suas credenciais reais:

```env
# Email (App Password do Gmail)
EMAIL_USER=seuemail@gmail.com
EMAIL_PASS=xxxxxxxxxxxxxxxx  # Senha de 16 dígitos sem espaços
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# JWT
JWT_SECRET=uma-chave-super-secreta-aleatoria-aqui
JWT_EXPIRES_IN=7d

# MinIO
MINIO_ROOT_USER=minio
MINIO_ROOT_PASSWORD=minio123
MINIO_USE_SSL=false

# API (para gerar URLs públicas dos arquivos)
API_URL=http://localhost:4000  # Em produção: https://your-api.com

# Frontend
FRONTEND_URL=http://localhost:3000
```

### Passo 3: Docker Compose vai ler automaticamente

O arquivo `docker-compose.yaml` está configurado para ler o `.env`:

```yaml
api:
  env_file:
    - ./backend/.env  # ← Lê todas as variáveis do .env
  environment:
    # Apenas overrides específicos do Docker
    NODE_ENV: production
    DATABASE_URL: postgresql://...
```

### Passo 4: Iniciar os containers

```bash
# Build e start
docker-compose build
docker-compose up -d

# Ver logs para confirmar
docker-compose logs -f api
```

## ✅ Vantagens desta configuração:

1. ✅ **Segurança**: Credenciais não aparecem no `docker-compose.yaml`
2. ✅ **Simplicidade**: Um único arquivo `.env` para todas as variáveis
3. ✅ **Git Safe**: `.env` está no `.gitignore`, não será commitado
4. ✅ **Flexível**: Fácil trocar entre dev/prod

## 🔒 Segurança:

- ❌ **NUNCA** commite o arquivo `.env`
- ❌ **NUNCA** coloque credenciais no `docker-compose.yaml`
- ✅ **SEMPRE** use `.env.example` como template (sem credenciais reais)
- ✅ **SEMPRE** verifique que `.env` está no `.gitignore`

## 📋 Checklist:

```bash
# Verificar se .env está no .gitignore
cat backend/.gitignore | grep "^.env"

# Verificar se .env não está sendo rastreado
git status backend/.env
# Deve mostrar: "Untracked" ou nada

# Verificar se variáveis estão carregadas no container
docker-compose exec api env | grep EMAIL
```

## 🚨 Troubleshooting:

**Emails não estão sendo enviados?**
```bash
# Verificar se as variáveis foram carregadas
docker-compose exec api printenv | grep EMAIL

# Se não aparecer, rebuild:
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

**Variáveis antigas ainda aparecem?**
```bash
# Parar tudo e limpar
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 📝 Desenvolvimento vs Produção:

**Desenvolvimento:**
```bash
# Usa docker-compose.dev.yaml
docker-compose -f docker-compose.dev.yaml up -d
```

**Produção:**
```bash
# Usa docker-compose.yaml
docker-compose up -d
```

Ambos leem o mesmo `backend/.env`! 🎉
