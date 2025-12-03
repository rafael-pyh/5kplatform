# 🚀 Guia Rápido de Deploy - Fix 502 QR Codes

## O Que Foi Corrigido

✅ **Rota de fallback** `/uploads/*` para compatibilidade com URLs antigas
✅ **Função `getPublicUrl`** remove automaticamente `/uploads/` das URLs
✅ **Script SQL** para limpar URLs antigas do banco de dados
✅ **Documentação completa** sobre MinIO em produção

---

## Deploy Imediato (5 minutos)

### 1. Commit e Push

```bash
git add .
git commit -m "fix: erro 502 qr codes - adiciona fallback /uploads/ e corrige URLs"
git push origin main
```

### 2. Verificar Deploy no Railway

Aguarde o deploy automático e verifique os logs:

```
✅ Build concluído
✅ Deploy em produção
```

### 3. Testar URL

```bash
# Tente acessar no navegador:
https://dependable-generosity-production.up.railway.app/api/files/qrcodes/880d9be5-e135-4c6c-a250-e34a478f0194-QR-1764708094343-o1j5mg0i8.png

# Ou via curl:
curl -I https://dependable-generosity-production.up.railway.app/api/files/qrcodes/880d9be5-e135-4c6c-a250-e34a478f0194-QR-1764708094343-o1j5mg0i8.png
```

### 4. (Opcional) Corrigir URLs no Banco

Se você tiver acesso ao PostgreSQL em produção:

```bash
# Conectar ao banco
psql "sua-connection-string-do-railway"

# Executar script
\i backend/fix-urls.sql
```

---

## Verificações

### ✅ Checklist de Funcionamento

- [ ] Deploy completou sem erros
- [ ] `/health` responde com 200
- [ ] `/api/files/*` responde (404 ou 200, não 502)
- [ ] URLs antigas `/uploads/*` funcionam (fallback)
- [ ] Novos vendedores têm URLs corretas

### 🔍 Como Testar Cada Item

**1. Health Check**
```bash
curl https://dependable-generosity-production.up.railway.app/health
```
Esperado: `{"success":true,"message":"API está funcionando!"}`

**2. Rota de Arquivos**
```bash
curl -I https://dependable-generosity-production.up.railway.app/api/files/qrcodes/test.png
```
Esperado: 404 (arquivo não existe) ou 200 (arquivo existe)
❌ NÃO 502!

**3. Fallback de URLs Antigas**
```bash
curl -I https://dependable-generosity-production.up.railway.app/uploads/qrcodes/test.png
```
Esperado: mesma resposta que `/api/files/`

**4. Criar Vendedor e Verificar URL**
```bash
# Criar vendedor (substitua SEU_TOKEN)
curl -X POST https://dependable-generosity-production.up.railway.app/api/person \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "name": "Teste QR",
    "email": "teste@test.com",
    "phone": "11999999999"
  }'
```

A resposta deve ter:
```json
{
  "success": true,
  "data": {
    "qrCodeUrl": "https://dependable-generosity-production.up.railway.app/api/files/qrcodes/..."
  }
}
```

---

## Problemas e Soluções

### 🐛 Ainda recebo 502

**Possíveis causas:**
1. MinIO não está configurado/acessível
2. Variável `API_URL` não está definida
3. Deploy não completou

**Soluções:**
```bash
# 1. Verificar variáveis de ambiente no Railway
Railway Dashboard > Variables > API_URL

# Deve ter:
API_URL=https://dependable-generosity-production.up.railway.app

# 2. Verificar logs
Railway Dashboard > Deployments > View Logs

# 3. Forçar redeploy
Railway Dashboard > Deployments > Redeploy
```

### 🐛 Imagens não carregam (404)

**Causa:** Arquivo não existe no MinIO

**Opções:**
1. **Temporário:** Aceitar que arquivos antigos se perderam
2. **Permanente:** Configurar Cloudflare R2 (ver `MINIO_PRODUCTION.md`)

### 🐛 URLs no banco ainda estão erradas

**Solução:** Executar script SQL

```sql
-- Conectar ao banco do Railway
psql "postgresql://..."

-- Ver URLs atuais
SELECT id, name, "qrCodeUrl" FROM persons WHERE "qrCodeUrl" LIKE '%/uploads/%';

-- Corrigir
UPDATE persons 
SET "qrCodeUrl" = REGEXP_REPLACE("qrCodeUrl", '^https?://[^/]+/uploads/', '')
WHERE "qrCodeUrl" LIKE '%/uploads/%';

-- Verificar
SELECT id, name, "qrCodeUrl" FROM persons LIMIT 10;
```

---

## Próximos Passos (Não Urgente)

### 1. 📦 Configurar Storage Permanente

**Recomendado:** Cloudflare R2 (10GB grátis)

Ver instruções completas em: `backend/MINIO_PRODUCTION.md`

Resumo:
1. Criar conta no Cloudflare
2. Criar bucket R2
3. Gerar API tokens
4. Atualizar variáveis no Railway
5. Migrar arquivos existentes (opcional)

### 2. 🔒 Atualizar Senha do Admin

Se ainda não fez:
```bash
POST /api/auth/change-password
{
  "oldPassword": "admin123",
  "newPassword": "sua-senha-forte"
}
```

### 3. 📧 Configurar Emails

Verificar se emails de verificação estão sendo enviados:
```bash
Railway Dashboard > Variables > Verificar:
- EMAIL_USER
- EMAIL_PASS (App Password do Gmail)
```

---

## Resumo

### ✅ O que está funcionando agora:

- Backend deployado e rodando
- Rotas de arquivo com fallback
- URLs antigas compatíveis
- URLs novas geradas corretamente

### ⚠️ O que precisa de atenção:

- MinIO não é persistente no Railway
- Arquivos podem ser perdidos em redeploys
- Recomendado migrar para Cloudflare R2

### 📝 Arquivos de Referência:

- `FIX_QRCODE_502.md` - Este guia
- `MINIO_PRODUCTION.md` - Guia completo de storage em produção
- `fix-urls.sql` - Script SQL de migração
- `DEPLOY.md` - Guia geral de deploy

---

## Suporte

Dúvidas? Verifique:
1. Logs do Railway
2. Health check da API
3. Variáveis de ambiente
4. Arquivos de documentação

Tudo funcionando? ✅ Você está pronto para produção!

Precisa de storage permanente? 📦 Veja `MINIO_PRODUCTION.md`
