# ⚠️ IMPORTANTE: MinIO em Produção no Railway

## Problema Detectado

O Railway **não suporta volumes persistentes** facilmente. Isso significa que usar MinIO como container no Railway pode causar **perda de dados** a cada redeploy.

## Soluções Recomendadas

### Opção 1: 🌟 Usar Cloudflare R2 (Recomendado)

Cloudflare R2 é compatível com S3 e tem **10 GB gratuitos por mês**.

#### 1. Criar Bucket no Cloudflare R2

1. Acesse [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Vá em **R2** > **Create Bucket**
3. Nome do bucket: `5kplatform-uploads`

#### 2. Gerar Credenciais

1. Em R2, vá em **Settings** > **API Tokens**
2. Clique em **Create API Token**
3. Copie:
   - `Access Key ID`
   - `Secret Access Key`
   - `Endpoint URL` (exemplo: `https://xxxxx.r2.cloudflarestorage.com`)

#### 3. Atualizar Variáveis de Ambiente no Railway

```env
# Remova MINIO_ENDPOINT e MINIO_PORT
# Adicione:
MINIO_ENDPOINT=xxxxx.r2.cloudflarestorage.com
MINIO_PORT=443
MINIO_ROOT_USER=<seu-access-key-id>
MINIO_ROOT_PASSWORD=<seu-secret-access-key>
MINIO_USE_SSL=true
API_URL=https://dependable-generosity-production.up.railway.app
```

#### 4. Atualizar `minio.ts`

```typescript
export const minioClient = new Client({
  endPoint: env.MINIO_ENDPOINT,
  port: env.MINIO_PORT,
  useSSL: env.MINIO_USE_SSL === true,
  accessKey: env.MINIO_ROOT_USER,
  secretKey: env.MINIO_ROOT_PASSWORD,
  // Adicionar para R2:
  region: 'auto',
  pathStyle: true,
});
```

---

### Opção 2: 💰 AWS S3 (Pago)

Similar ao R2, mas usando AWS:

```env
MINIO_ENDPOINT=s3.amazonaws.com
MINIO_PORT=443
MINIO_ROOT_USER=<aws-access-key>
MINIO_ROOT_PASSWORD=<aws-secret-key>
MINIO_USE_SSL=true
```

---

### Opção 3: 🐳 MinIO Self-Hosted

Se você tem um servidor próprio:

1. Instale MinIO no seu servidor
2. Configure DNS apontando para o servidor
3. Configure SSL com Let's Encrypt
4. Use as credenciais do seu MinIO

```env
MINIO_ENDPOINT=minio.seudominio.com
MINIO_PORT=443
MINIO_ROOT_USER=<seu-user>
MINIO_ROOT_PASSWORD=<sua-senha>
MINIO_USE_SSL=true
```

---

## Status Atual

### ⚠️ Arquivos Existentes

Se você já tem arquivos no MinIO do Railway, eles estão **temporários** e podem ser perdidos a qualquer momento.

### ✅ Solução Temporária Implementada

O código agora tem:
- Rota de fallback `/uploads/*` → `/api/files/*`
- Limpeza automática de URLs antigas
- URLs geradas corretamente mesmo com dados antigos

### 🔄 Migração Recomendada

1. **Configurar Cloudflare R2** (gratuito)
2. **Migrar arquivos existentes:**

```typescript
// Script de migração (executar uma vez)
import { minioClient } from './src/utils/minio';

const migrateToR2 = async () => {
  const oldClient = new Client({
    endPoint: 'old-railway-minio.com',
    // ... old credentials
  });

  const newClient = new Client({
    endPoint: 'xxxxx.r2.cloudflarestorage.com',
    // ... new R2 credentials
  });

  // Listar e copiar arquivos
  const stream = oldClient.listObjects('uploads', '', true);
  
  for await (const obj of stream) {
    const data = await oldClient.getObject('uploads', obj.name);
    await newClient.putObject('uploads', obj.name, data);
    console.log(`Migrado: ${obj.name}`);
  }
};

migrateToR2();
```

---

## Como Testar Agora

### 1. Verificar se Backend está funcionando

```bash
curl https://dependable-generosity-production.up.railway.app/health
```

### 2. Testar rota de arquivo (mesmo sem MinIO configurado)

```bash
curl -I https://dependable-generosity-production.up.railway.app/api/files/qrcodes/test.png
```

Se retornar **404** = Backend OK, arquivo não existe (normal)
Se retornar **502** = Problema de configuração

### 3. Criar novo vendedor e verificar QR Code

Use a API para criar um vendedor:

```bash
curl -X POST https://dependable-generosity-production.up.railway.app/api/person \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste",
    "email": "teste@test.com",
    "phone": "11999999999"
  }'
```

A resposta deve incluir `qrCodeUrl` com a URL correta.

---

## Próximos Passos

1. ✅ **Imediato:** Deploy do código corrigido (já feito)
2. 🔜 **Curto prazo:** Configurar Cloudflare R2
3. 🔜 **Médio prazo:** Migrar arquivos existentes para R2

---

## Checklist de Deploy

- [ ] Code corrigido deployado no Railway
- [ ] Variável `API_URL` configurada
- [ ] Health check OK
- [ ] URLs de teste funcionando (404 esperado, não 502)
- [ ] Cloudflare R2 configurado (próximo passo)
- [ ] Arquivos migrados para R2 (se aplicável)

---

## Contato com Railway

Se precisar de suporte sobre volumes persistentes:
- [Railway Discord](https://discord.gg/railway)
- [Railway Docs - Volumes](https://docs.railway.app/reference/volumes)

**Nota:** Railway tem suporte beta para volumes, mas não é recomendado para produção ainda.
