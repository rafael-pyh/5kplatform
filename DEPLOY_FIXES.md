# 🚀 Deploy Completo - Correções Aplicadas

## 📋 Resumo das Correções

### 1. ✅ Erro 502 - QR Codes não carregam
**Problema:** URLs acessadas como `/uploads/qrcodes/...` retornavam 502

**Solução:**
- Rota de fallback `/uploads/*` → `/api/files/*`
- Limpeza automática de URLs antigas
- Script SQL para corrigir banco de dados

### 2. ✅ Erro Circular JSON
**Problema:** `TypeError: Converting circular structure to JSON`

**Solução:**
- Conversão automática de objetos Sequelize para JSON puro
- Aplicado em todos os controllers (person, lead, auth, qrcode, seller-leads)

---

## 🚀 Deploy Rápido (5 minutos)

### 1. Commit e Push

```bash
git add .
git commit -m "fix: resolve 502 qr codes + circular JSON errors"
git push origin main
```

### 2. Railway Fará Deploy Automático

Aguarde nos logs do Railway:
- ✅ Build iniciado
- ✅ Testes passando
- ✅ Deploy em produção

### 3. Verificar Variáveis de Ambiente

No Railway Dashboard, confirme:
```env
API_URL=https://dependable-generosity-production.up.railway.app
DATABASE_URL=postgresql://...
MINIO_ENDPOINT=...
MINIO_PORT=...
MINIO_USE_SSL=...
```

---

## ✅ Testes de Verificação

### 1. Health Check
```bash
curl https://dependable-generosity-production.up.railway.app/health
```

**Esperado:**
```json
{
  "success": true,
  "message": "API está funcionando!",
  "timestamp": "..."
}
```

### 2. Listar Vendedores (testava erro circular)
```bash
curl https://dependable-generosity-production.up.railway.app/api/person
```

**Esperado:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "...",
      "email": "...",
      "qrCodeUrl": "https://.../api/files/qrcodes/...",
      "leadsCount": 0,
      "scansCount": 0
    }
  ]
}
```

### 3. Acessar QR Code (testava erro 502)
```bash
# URL nova (preferencial)
curl -I https://dependable-generosity-production.up.railway.app/api/files/qrcodes/880d9be5-e135-4c6c-a250-e34a478f0194-QR-1764708094343-o1j5mg0i8.png

# URL antiga (fallback)
curl -I https://dependable-generosity-production.up.railway.app/uploads/qrcodes/880d9be5-e135-4c6c-a250-e34a478f0194-QR-1764708094343-o1j5mg0i8.png
```

**Esperado:**
- Status: `200 OK` ou `404 Not Found`
- ❌ NÃO `502 Bad Gateway`

### 4. Detalhes de Vendedor com Relacionamentos
```bash
curl https://dependable-generosity-production.up.railway.app/api/person/{id}
```

**Esperado:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "...",
    "qrCodeUrl": "https://.../api/files/qrcodes/...",
    "leads": [...],
    "qrCodeScans": [...]
  }
}
```

### 5. Listar Leads
```bash
curl https://dependable-generosity-production.up.railway.app/api/lead
```

**Esperado:**
```json
{
  "success": true,
  "data": [...]
}
```

---

## 🗄️ Corrigir URLs Antigas no Banco (Opcional)

Se tiver acesso ao PostgreSQL:

```bash
# Conectar ao banco
psql "sua-connection-string-do-railway"

# Ver URLs problemáticas
SELECT id, name, "qrCodeUrl" 
FROM persons 
WHERE "qrCodeUrl" LIKE '%/uploads/%' OR "qrCodeUrl" LIKE 'http%';

# Corrigir
UPDATE persons 
SET "qrCodeUrl" = REGEXP_REPLACE(
  REGEXP_REPLACE("qrCodeUrl", '^https?://[^/]+/uploads/', ''),
  '^/uploads/', 
  ''
)
WHERE "qrCodeUrl" IS NOT NULL
  AND ("qrCodeUrl" LIKE '%/uploads/%' OR "qrCodeUrl" LIKE 'http%');

# Verificar
SELECT id, name, "qrCodeUrl" 
FROM persons 
WHERE "qrCodeUrl" IS NOT NULL 
LIMIT 10;
```

---

## 📦 Arquivos Modificados

### Principais
- `backend/src/utils/minio.ts` - Limpeza de URLs
- `backend/src/app.ts` - Rota de fallback `/uploads/`
- `backend/src/controllers/person.controller.ts` - Conversão JSON
- `backend/src/controllers/lead.controller.ts` - Conversão JSON
- `backend/src/controllers/auth.controller.ts` - Conversão JSON
- `backend/src/controllers/qrcode.controller.ts` - Conversão JSON
- `backend/src/controllers/seller-leads.controller.ts` - Conversão JSON

### Documentação
- `backend/fix-urls.sql` - Script SQL de migração
- `backend/FIX_QRCODE_502.md` - Detalhes do fix 502
- `backend/FIX_CIRCULAR_JSON.md` - Detalhes do fix JSON
- `backend/MINIO_PRODUCTION.md` - Guia MinIO em produção
- `QUICK_DEPLOY_FIX.md` - Este guia

---

## 🐛 Troubleshooting

### Ainda recebo erro 502

**Verificar:**
1. Deploy completou sem erros?
2. `API_URL` está definida no Railway?
3. MinIO está acessível?

**Logs:**
```bash
# No Railway Dashboard
Deployments > View Logs

# Procurar por:
- "MinIO"
- "502"
- "Error"
```

### Ainda recebo erro circular JSON

**Verificar:**
1. Código foi compilado?
2. Deploy usou o código novo?

**Forçar redeploy:**
```bash
# Railway Dashboard
Deployments > Redeploy
```

### URLs no frontend ainda estão erradas

**Causa:** Cache do navegador ou frontend desatualizado

**Solução:**
1. Limpar cache: `Ctrl + Shift + R` (Chrome/Edge)
2. Verificar versão do frontend
3. Redeployar frontend se necessário

### Imagens antigas não aparecem (404)

**Esperado:** Arquivos antigos podem ter sido perdidos

**Soluções:**
1. **Temporário:** Aceitar que arquivos antigos foram perdidos
2. **Permanente:** Configurar Cloudflare R2 (ver `MINIO_PRODUCTION.md`)

---

## 📊 Checklist Final

### Backend
- [ ] Código commitado e enviado
- [ ] Deploy completou no Railway
- [ ] Health check retorna 200
- [ ] Listar vendedores funciona (sem erro circular)
- [ ] Listar leads funciona
- [ ] URLs de QR code corretas
- [ ] Fallback `/uploads/` funciona

### Banco de Dados
- [ ] Variável `DATABASE_URL` configurada
- [ ] Tabelas criadas (migrations)
- [ ] (Opcional) URLs antigas corrigidas

### Storage
- [ ] MinIO acessível ou alternativa configurada
- [ ] Novos uploads funcionando
- [ ] (Futuro) Migrar para Cloudflare R2

### Frontend
- [ ] Conectado à API correta
- [ ] Dashboard carregando vendedores
- [ ] Imagens de QR code aparecem
- [ ] Formulário de lead funciona

---

## 🎯 Status Atual

### ✅ Funcionando
- API rodando em produção
- Rotas de proxy de arquivos
- Fallback de URLs antigas
- Serialização JSON corrigida
- Relacionamentos Sequelize funcionando

### ⚠️ Requer Atenção
- MinIO temporário (pode perder dados)
- Recomendado: migrar para Cloudflare R2
- Arquivos antigos podem estar perdidos

### 📅 Próximos Passos
1. ✅ Deploy e testes - **AGORA**
2. 🔜 Configurar Cloudflare R2 - **Esta semana**
3. 🔜 Migrar arquivos existentes - **Esta semana**
4. 🔜 Atualizar senha admin - **Hoje**

---

## 📚 Documentação Adicional

- `FIX_QRCODE_502.md` - Detalhes técnicos do fix 502
- `FIX_CIRCULAR_JSON.md` - Detalhes técnicos do fix JSON
- `MINIO_PRODUCTION.md` - Guia completo de storage
- `DEPLOY.md` - Guia geral de deploy
- `fix-urls.sql` - Script SQL de migração

---

## ✨ Conclusão

Todas as correções críticas foram aplicadas e testadas localmente. Após o deploy:

1. ✅ Erro 502 nos QR codes será resolvido
2. ✅ Erro de JSON circular será resolvido
3. ✅ URLs antigas continuarão funcionando (fallback)
4. ✅ Novas URLs serão geradas corretamente

**Pronto para produção!** 🚀
