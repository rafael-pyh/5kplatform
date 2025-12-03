# 🔧 Como Corrigir URLs do Banco de Dados

## Problema

URLs no banco de dados estão armazenadas como URLs completas:
```
https://5kplatform-production.up.railway.app/uploads/qrcodes/xxx.png
```

Mas deveriam estar como caminhos relativos:
```
qrcodes/xxx.png
```

Isso causa URLs malformadas como:
```
http://localhost:8080/api/files/https://5kplatform-production.up.railway.app/uploads/qrcodes/xxx.png
```

---

## Solução 1: Script Node.js (Recomendado)

### Local

```bash
cd backend

# Executar o script
npx ts-node fix-db-urls.ts
```

### Railway (Produção)

```bash
# Conectar ao Railway
railway login

# Abrir shell no container
railway run

# Dentro do container:
node dist/fix-db-urls.js
```

**Nota:** O script precisa ser compilado para produção. Adicione no `package.json`:

```json
{
  "scripts": {
    "fix-urls": "ts-node fix-db-urls.ts"
  }
}
```

Então rode:
```bash
npm run fix-urls
```

---

## Solução 2: SQL Direto

### Conectar ao PostgreSQL

```bash
# Railway: copiar connection string
railway variables | grep DATABASE_URL

# Conectar
psql "postgresql://user:pass@host:port/db"
```

### Executar Script

```sql
-- Ver URLs problemáticas
SELECT id, name, "qrCodeUrl" 
FROM persons 
WHERE "qrCodeUrl" LIKE 'http%' 
   OR "qrCodeUrl" LIKE '%/uploads/%'
LIMIT 10;

-- Corrigir qrCodeUrl
UPDATE persons 
SET "qrCodeUrl" = REGEXP_REPLACE(
  REGEXP_REPLACE(
    REGEXP_REPLACE("qrCodeUrl", '^https?://[^/]+/api/files/', ''),
    '^https?://[^/]+/uploads/', 
    ''
  ),
  '^/?(uploads/|api/files/)', 
  ''
)
WHERE "qrCodeUrl" IS NOT NULL
  AND (
    "qrCodeUrl" LIKE '%/uploads/%' 
    OR "qrCodeUrl" LIKE '%/api/files/%'
    OR "qrCodeUrl" LIKE 'http%'
  );

-- Corrigir photoUrl
UPDATE persons 
SET "photoUrl" = REGEXP_REPLACE(
  REGEXP_REPLACE(
    REGEXP_REPLACE("photoUrl", '^https?://[^/]+/api/files/', ''),
    '^https?://[^/]+/uploads/', 
    ''
  ),
  '^/?(uploads/|api/files/)', 
  ''
)
WHERE "photoUrl" IS NOT NULL
  AND (
    "photoUrl" LIKE '%/uploads/%' 
    OR "photoUrl" LIKE '%/api/files/%'
    OR "photoUrl" LIKE 'http%'
  );

-- Verificar resultado
SELECT id, name, "qrCodeUrl", "photoUrl"
FROM persons 
WHERE "qrCodeUrl" IS NOT NULL 
LIMIT 10;
```

---

## Solução 3: Via API (Temporário)

A correção no código já resolve o problema para novas requisições. O `getPublicUrl` agora:

1. ✅ Detecta se é URL completa
2. ✅ Extrai apenas o caminho do arquivo
3. ✅ Remove `/uploads/` e `/api/files/`
4. ✅ Constrói URL correta

Então mesmo com URLs antigas no banco, a API retornará URLs corretas.

---

## Teste

Após executar qualquer solução acima, teste:

```bash
# Listar vendedores
curl http://localhost:4000/api/person

# Verificar URLs
# Deve retornar:
{
  "qrCodeUrl": "http://localhost:4000/api/files/qrcodes/xxx.png"
}

# NÃO deve retornar:
{
  "qrCodeUrl": "http://localhost:4000/api/files/https://xxx/uploads/qrcodes/xxx.png"
}
```

---

## Recomendação

**Para Desenvolvimento:**
```bash
cd backend
npm run fix-urls
```

**Para Produção:**
1. Deploy do código corrigido primeiro
2. Aguardar deploy
3. Executar SQL no banco de produção
4. Testar API

---

## Checklist

- [ ] Código atualizado e deployado
- [ ] Script executado ou SQL rodado
- [ ] URLs testadas via API
- [ ] Frontend recarregado (limpar cache)
- [ ] QR codes carregando corretamente
