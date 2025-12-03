# 🔧 Fix para Erro 502 nos QR Codes

## Problema Identificado

URLs dos QR codes estavam sendo acessadas como `/uploads/qrcodes/...` mas a rota correta é `/api/files/qrcodes/...`.

## Soluções Implementadas

### 1. ✅ Correção no `minio.ts`
- Função `getPublicUrl` agora remove automaticamente `/uploads/` das URLs
- Garante compatibilidade com URLs antigas do banco de dados

### 2. ✅ Rota de Fallback
- Adicionada rota `/uploads/*` que serve arquivos via proxy
- URLs antigas continuam funcionando

### 3. ✅ Script SQL de Migração
- Remove `/uploads/` de URLs antigas no banco de dados
- Corrige URLs completas do MinIO antigo

## Deploy em Produção no Railway

### Passo 1: Fazer Deploy do Código Atualizado

```bash
# Commitar as alterações
git add .
git commit -m "fix: corrige erro 502 nos QR codes - adiciona fallback /uploads/"
git push origin main
```

O Railway vai detectar automaticamente e fazer o deploy.

### Passo 2: Verificar Variável de Ambiente

No Railway, certifique-se que a variável `API_URL` está configurada:

```
API_URL=https://dependable-generosity-production.up.railway.app
```

### Passo 3: Executar Script SQL (Opcional mas Recomendado)

Conecte ao banco de dados PostgreSQL em produção e execute:

```bash
# No Railway, vá em PostgreSQL > Connect > Copy Connection String
# Exemplo: postgresql://user:pass@host:port/db

# Conectar ao banco
psql "postgresql://user:pass@host:port/db"

# Executar o script
\i backend/fix-urls.sql
```

Ou copie o conteúdo de `backend/fix-urls.sql` e execute no console do Railway.

### Passo 4: Reiniciar o Backend (se necessário)

Se o deploy não aconteceu automaticamente:

```bash
# No Railway CLI
railway up

# Ou use o dashboard do Railway:
# Deploy > Redeploy
```

## Testes

### 1. Testar URL Nova (preferencial)
```
https://dependable-generosity-production.up.railway.app/api/files/qrcodes/880d9be5-e135-4c6c-a250-e34a478f0194-QR-1764708094343-o1j5mg0i8.png
```

### 2. Testar URL Antiga (fallback)
```
https://dependable-generosity-production.up.railway.app/uploads/qrcodes/880d9be5-e135-4c6c-a250-e34a478f0194-QR-1764708094343-o1j5mg0i8.png
```

Ambas devem funcionar agora! ✅

## Verificações

### API Health Check
```bash
curl https://dependable-generosity-production.up.railway.app/health
```

### Verificar Pessoa com QR Code
```bash
curl https://dependable-generosity-production.up.railway.app/api/person/{id}
```

A resposta deve ter:
```json
{
  "qrCodeUrl": "https://dependable-generosity-production.up.railway.app/api/files/qrcodes/..."
}
```

## Rollback (se necessário)

Se algo der errado, você pode reverter:

```bash
git revert HEAD
git push origin main
```

## Notas Importantes

1. ✅ **URLs antigas continuam funcionando** - graças à rota de fallback `/uploads/`
2. ✅ **URLs novas são geradas corretamente** - sem `/uploads/` no path
3. ✅ **Sem breaking changes** - compatibilidade total com código antigo
4. ✅ **MinIO continua interno** - backend é o único que acessa

## Problemas Comuns

### "MinIO não está acessível"
- Verifique se o MinIO está rodando (se usando Docker)
- Em produção no Railway, pode ser que precise configurar MinIO como serviço separado

### "Ainda recebo 502"
- Limpe cache do navegador
- Verifique logs do Railway: `railway logs`
- Confirme que `API_URL` está configurada

### "Imagens não carregam"
- Verifique se os arquivos realmente existem no MinIO
- Use Railway console para verificar: `railway run ls uploads/qrcodes/`

## Monitoramento

### Logs do Backend
```bash
railway logs -t backend
```

### Verificar Erros
```bash
railway logs --filter error
```
