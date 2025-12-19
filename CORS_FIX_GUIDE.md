# 🔧 Diagnóstico de Problema de Imagens (CORS + URLs Incorretas)

## Problema Identificado

As imagens do S3 (QR codes, fotos, criativos) não estão carregando em produção. Erros observados:

```
❌ CORS policy: No 'Access-Control-Allow-Origin' header
❌ 404 Not Found
❌ URL duplicada: 5k-storage/5k-storage/qrcodes/...
```

## Causas Raízes

### 1. **URLs Incorretas** ❌
A função `buildPublicUrl()` estava construindo URLs malformadas para Backblaze B2:
- **Antes**: `https://5k-storage.s3.us-east-005.backblazeb2.com/qrcodes/QR-...`
- **Depois**: `https://f005.backblazeb2.com/file/5k-storage/qrcodes/QR-...`

A estrutura correta para Backblaze B2 é:
```
https://f{REGION_NUMBER}.backblazeb2.com/file/{BUCKET_NAME}/{KEY}
```

### 2. **CORS Não Configurado** 🔐
Backblaze B2 requer configuração explícita de CORS rules para aceitar requests do frontend.

## Soluções Implementadas

### ✅ 1. Corrigir Construção de URLs
Arquivo: `backend/src/services/storage.service.ts`

- Extrair número do region (ex: `us-east-005` → `005`)
- Construir URL correta: `https://f005.backblazeb2.com/file/{bucket}/{key}`
- Suporte a S3_URL quando configurado explicitamente

### ✅ 2. Adicionar Logs Detalhados
Logs de debug em `buildPublicUrl()` para diagnosticar:
- Endpoint sendo usado
- Region sendo extraído
- URL final construída

### ✅ 3. Script de Configuração CORS
Arquivo: `backend/setup-b2-cors.ts`

```bash
# Executar uma vez para configurar CORS
cd backend
npx ts-node setup-b2-cors.ts
```

**O que faz:**
- Autentica com Backblaze B2 usando credenciais do `.env`
- Encontra o bucket configurado
- Adiciona CORS rules para permitir GET requests do frontend
- Configura origins permitidas:
  - `https://5kplatform.vercel.app` (produção)
  - `http://localhost:3000` (desenvolvimento local)

## Como Testar

### 1. **Verificar Ambiente**
```bash
# Verificar variáveis necessárias
echo $S3_ENDPOINT      # https://s3.us-east-005.backblazeb2.com
echo $S3_REGION        # us-east-005
echo $S3_BUCKET        # 5k-storage
echo $S3_ACCESS_KEY    # Chave de acesso B2
echo $S3_SECRET_KEY    # Chave secreta B2
```

### 2. **Executar Script de CORS**
```bash
cd backend
npx ts-node setup-b2-cors.ts
```

Saída esperada:
```
✅ Autenticado com sucesso
✅ Bucket encontrado
✅ CORS configurado com sucesso!
✨ Backblaze B2 está pronto para servir arquivos com CORS!
```

### 3. **Testar no Desenvolvimento**
```bash
cd backend
npm run build
npm run dev
```

Criar um novo vendedor e verificar:
1. QR code faz upload sem erros
2. URL construída corretamente nos logs:
   ```
   [buildPublicUrl] URL final (B2): https://f005.backblazeb2.com/file/5k-storage/qrcodes/QR-...
   ```
3. No frontend, imagem carrega sem erros CORS

### 4. **Deploy em Produção**
```bash
git push
# Aguardar deployment em Railway

# Configurar CORS em produção
npx ts-node setup-b2-cors.ts
```

## Checklist de Verificação

- [ ] `.env` possui `S3_REGION=us-east-005` (não us-east-004)
- [ ] `S3_ENDPOINT` = `https://s3.us-east-005.backblazeb2.com`
- [ ] `S3_BUCKET` = `5k-storage`
- [ ] Credenciais B2 (`S3_ACCESS_KEY`, `S3_SECRET_KEY`) são válidas
- [ ] Script `setup-b2-cors.ts` foi executado
- [ ] Novo vendedor cria QR code sem erros
- [ ] QR code exibe no frontend sem erros CORS
- [ ] Fotos de perfil fazem upload e exibem
- [ ] Criativos carregam imagens do S3

## Estrutura de URL Esperada

```
Backblaze B2 (Produção):
  https://f005.backblazeb2.com/file/5k-storage/qrcodes/QR-1766175993056-d7wcb2i7c.png
  https://f005.backblazeb2.com/file/5k-storage/uploads/1766175993056-photo.jpg

AWS S3:
  https://5k-storage.s3.us-east-1.amazonaws.com/qrcodes/QR-...
  https://5k-storage.s3.us-east-1.amazonaws.com/uploads/...
```

## Links Úteis

- [Backblaze B2 CORS Documentation](https://www.backblaze.com/b2/docs/cors.html)
- [AWS SDK S3 Documentation](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/s3-examples.html)
- [Railway Environment Variables](https://docs.railway.app/guides/variables)
