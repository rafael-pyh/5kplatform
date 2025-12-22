# ⚠️ Configuração do S3 para Produção (Railway)

## Problema Identificado

A rota `/api/image-proxy` está retornando 404 em produção porque:

1. ✅ A rota foi criada e compilada corretamente
2. ❌ O deploy anterior em Vercel não incluiu o arquivo (resolve com novo push)
3. ❌ O `S3_REGION` em produção está **errado**: `us-east-004` em vez de `us-east-005`
4. ❌ O `S3_URL` **não está configurado** em Railway

## Ações Necessárias

### 1. Atualizar Variáveis de Ambiente em Railway

Acesse: https://railway.app → seu projeto → Variables

**Configurar/Corrigir estas variáveis:**

```env
# ✅ OBRIGATÓRIO - Correto para Backblaze B2
S3_ENDPOINT=https://s3.us-east-005.backblazeb2.com
S3_REGION=us-east-005
S3_BUCKET=5k-storage

# ✅ NOVO - Variável que resolve tudo
S3_URL=https://f005.backblazeb2.com/file/5k-storage

# ✅ Credenciais (já configuradas, verificar)
S3_ACCESS_KEY=<sua-chave>
S3_SECRET_KEY=<sua-secreta>
```

**⚠️ IMPORTANTE**: Se o `S3_REGION` está como `us-east-004`, TROCAR PARA `us-east-005`

### 2. Verificar Dados no Backblaze B2

Acesse sua conta Backblaze B2 → bucket `5k-storage`:

**Deve mostrar:**
```
URL amigável: https://f005.backblazeb2.com/file/5k-storage/...
S3 URL: https://5k-storage.s3.us-east-005.backblazeb2.com/...
```

Se mostrar `f004` ou `us-east-004`, significa que você está usando a **region errada do B2**.

**Solução**: Contate Backblaze support ou crie bucket em `us-east-005`

### 3. Deploy em Vercel

Após atualizar variáveis em Railway:

```bash
# Backend será redployado automaticamente via Railway
# Frontend precisa de novo push:

git push origin dev
# Aguardar deploy automático em Vercel
```

### 4. Teste em Produção

Após deploy:

```
https://5kplatform.vercel.app
├─ Dashboard → Vendedores
├─ Clicar em QR code de um vendedor
└─ Verificar que QR code carrega SEM erros
```

**O que deve aparecer nos logs do navegador:**

✅ SEM ERROS:
```
[proxyImageUrl] Convertendo para proxy: /api/image-proxy?url=...
(imagem carrega com sucesso)
```

❌ COM ERRO (significa que ainda há problema):
```
GET /api/image-proxy?url=... 404
[useQRCodeWithVendor] Erro ao adicionar nome ao QR code
```

## Diagnóstico de Problemas

### Problema: `/api/image-proxy` retorna 404

**Causa**: Deploy antigo de Vercel não tinha o arquivo

**Solução**:
```bash
cd frontend/5k-energia-solar
rm -rf .next .vercel
git push origin dev
# Aguardar novo deploy
```

### Problema: QR code gerado com URL `f004` ou `us-east-004`

**Causa**: Variável de environment `S3_REGION` ou `S3_ENDPOINT` está errada em Railway

**Solução**:
1. Railway → Variables
2. Trocar `S3_REGION=us-east-004` para `S3_REGION=us-east-005`
3. Salvar e aguardar redeploy automático

### Problema: Continua retornando 404 depois de tudo

**Diagnóstico**:
1. Abrir DevTools → Network → clicar em request `/api/image-proxy`
2. Ver response headers
3. Se houver erro 404 do Vercel, significa que a rota não foi encontrada no build

**Solução**:
```bash
cd frontend/5k-energia-solar
npm run build
# Se compilar sem erros, fazer push novamente
git push origin dev
```

## Arquivos Modificados Recentemente

```
be044b8 fix: Improve image proxy and URL building for Backblaze B2
c32e8f2 docs: Add CORS proxy solution documentation
2956fba feat: Add image proxy API route to resolve CORS issues with Canvas
```

## Checklist Final

- [ ] Variável `S3_REGION=us-east-005` em Railway
- [ ] Variável `S3_ENDPOINT=https://s3.us-east-005.backblazeb2.com` em Railway
- [ ] Variável `S3_URL=https://f005.backblazeb2.com/file/5k-storage` em Railway
- [ ] Novo push do código para Vercel
- [ ] Vercel build completo (com `/api/image-proxy`)
- [ ] Railway redeploy automático
- [ ] Testar QR code em produção: carrega SEM erros

## Esperado Depois da Configuração

```
User cria novo vendedor
    ↓
Backend gera QR code
    ↓
Upload para S3 → URL correta: https://f005.backblazeb2.com/file/5k-storage/qrcodes/QR-xxx.png
    ↓
Frontend recebe qrCodeUrl
    ↓
Hook converte para proxy: /api/image-proxy?url=https://f005.backblazeb2.com/...
    ↓
API proxy busca no servidor (SEM CORS)
    ↓
Retorna com Access-Control-Allow-Origin: *
    ↓
Canvas consegue desenhar
    ↓
✅ QR code com nome do vendedor carrega perfeitamente
```

## Próximas Ações

1. ✅ Código está pronto (commits foram feitos)
2. ⏳ Você configura variáveis em Railway
3. ⏳ Você faz push: `git push origin dev`
4. ⏳ Aguarda deploys em Railway + Vercel
5. ⏳ Testa em produção

**Quando tudo estiver pronto, envie um print do QR code carregando com sucesso! 🎉**
