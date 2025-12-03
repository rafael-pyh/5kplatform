# 🚀 Guia de Deploy - 5K Platform Backend

## ✅ Configuração Completa para Deploy no Railway

Este projeto está configurado para fazer deploy automático com:
- ✅ Sincronização automática do schema do banco (Prisma DB Push)
- ✅ Criação automática do Super Admin
- ✅ Health checks
- ✅ Restart automático em caso de falha

---

## 📋 Pré-requisitos

1. **Banco de dados PostgreSQL** no Railway
2. **Variável de ambiente `DATABASE_URL`** configurada no Railway
3. **Branch `dev`** ou `main` conectada ao Railway

---

## 🔧 Configurações do Railway

### Variáveis de Ambiente Necessárias

```env
DATABASE_URL=postgresql://user:password@host:5432/database
NODE_ENV=production
PORT=4000
JWT_SECRET=seu-jwt-secret-aqui
API_URL=https://your-api.railway.app
FRONTEND_URL=https://seu-frontend.com
MINIO_ENDPOINT=seu-minio-endpoint
MINIO_ROOT_USER=minio
MINIO_ROOT_PASSWORD=minio123
MINIO_USE_SSL=true
```

⚠️ **IMPORTANTE:** Configure `API_URL` com a URL do seu serviço no Railway para que os arquivos sejam servidos corretamente via proxy.

---

## 📦 O que Acontece no Deploy

### 1. **Build Stage** (Dockerfile)
- Instala dependências
- Compila TypeScript (`src/` → `dist/`)
- Compila seed (`prisma/seed.ts` → `dist/prisma/seed.js`)
- Gera Prisma Client

### 2. **Runtime Stage** (Dockerfile)
- Cria imagem otimizada apenas com dependências de produção
- Instala OpenSSL e netcat (necessários para Prisma)
- Configura health checks

### 3. **Startup** (docker-entrypoint.sh)
```bash
1. ⏳ Aguarda banco de dados ficar disponível
2. 🔄 Gera Prisma Client
3. 🔧 Sincroniza schema com banco (prisma db push)
4. 🌱 Executa seed (cria Super Admin)
5. 🚀 Inicia aplicação
```

---

## 👤 Credenciais do Super Admin

Após o deploy bem-sucedido, você pode fazer login com:

- **Email:** `admin@5kenergia.com`
- **Senha:** `admin123`

⚠️ **IMPORTANTE:** Altere a senha após o primeiro login!

---

## 🔍 Verificando o Deploy

### Logs do Entrypoint
Você deve ver no Railway:
```
📌 Entrypoint iniciado...
⏳ Aguardando banco de dados...
✅ Banco de dados disponível!
🔄 Gerando Prisma Client...
🔧 Sincronizando schema com banco de dados (db push)...
✅ Schema sincronizado com sucesso!
🌱 Executando seed...
✅ Super Admin criado: admin@5kenergia.com
📧 Email: admin@5kenergia.com
🔑 Senha: admin123
✅ Seed concluído!
🚀 Iniciando aplicação...
```

### Health Check
O container tem um health check configurado:
- Endpoint: `http://localhost:4000/health`
- Intervalo: 30s
- Timeout: 3s
- Start period: 40s

---

## 🐛 Troubleshooting

### ❌ "Timeout: Banco não respondeu"
- Verifique se a variável `DATABASE_URL` está correta
- Verifique se o banco PostgreSQL está rodando no Railway

### ❌ "Erro ao sincronizar schema"
- Verifique se há conflitos no schema
- Verifique logs do Prisma para detalhes

### ❌ "Seed falhou"
- O seed pode falhar se o admin já existir (isso é OK)
- Verifique se o bcrypt está instalado nas dependências

### ❌ "P2032: Error converting field id"
- Isso significa que o banco tem uma tabela com schema incompatível
- **Solução:** Delete o serviço no Railway e recrie do zero

---

## 🔄 Redeployando do Zero

Se precisar fazer deploy limpo:

1. **No Railway:**
   - Delete o serviço backend
   - Delete o banco de dados (se necessário)
   - Recrie o banco PostgreSQL
   - Recrie o serviço backend

2. **Configure as variáveis de ambiente**

3. **Faça o deploy:**
   ```bash
   git push origin dev
   ```

4. **Aguarde os logs:**
   - O entrypoint vai criar tudo automaticamente
   - Super Admin será criado
   - Aplicação estará pronta

---

## 📝 Arquivos Importantes

- `Dockerfile` - Build e runtime da aplicação
- `docker-entrypoint.sh` - Script de inicialização
- `prisma/schema.prisma` - Schema do banco
- `prisma/seed.ts` - Seed do banco (cria Super Admin)
- `railway.toml` - Configurações do Railway

---

## ✨ Próximos Passos Após Deploy

1. ✅ Teste o login com as credenciais do Super Admin
2. ✅ Altere a senha do admin
3. ✅ Configure o frontend para apontar para a API
4. ✅ Teste criação de vendedores e leads
5. ✅ Configure o MinIO (se necessário)

---

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs no Railway
2. Verifique se todas as variáveis de ambiente estão configuradas
3. Verifique se o banco de dados está acessível
4. Se necessário, delete tudo e recrie do zero
