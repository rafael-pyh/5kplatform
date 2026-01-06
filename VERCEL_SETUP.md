# Configuração do Vercel - Variáveis de Ambiente

## 🚨 IMPORTANTE

O frontend em produção precisa saber a URL da API backend. Se não estiver configurado, você receberá erro 500 ao tentar validar email.

## 📋 Variáveis Necessárias no Vercel

Acesse: https://vercel.com/dashboard → Seu Projeto → Settings → Environment Variables

Adicione as seguintes variáveis:

### Para Desenvolvimento Local
```
NEXT_PUBLIC_API_URL=http://localhost:4000
API_URL=http://localhost:4000
NEXT_PUBLIC_MINIO_URL=http://localhost:9000
```

### Para Produção (Railway)
Substitua pelos valores reais:

```
# URL da API Backend (Railway)
API_URL=https://seu-backend-railway-url.railway.app
NEXT_PUBLIC_API_URL=https://seu-backend-railway-url.railway.app

# URL do MinIO/B2 Storage
NEXT_PUBLIC_MINIO_URL=https://f005.backblazeb2.com
```

## 🔧 Como Adicionar no Vercel Dashboard

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto ("5kplatform")
3. Vá em **Settings** (Configurações)
4. Clique em **Environment Variables** (Variáveis de Ambiente)
5. Clique em **Add**
6. Preencha:
   - **Name**: `API_URL`
   - **Value**: `https://seu-backend-url.railway.app`
7. Em **Select Environments**, escolha **Production** ✓
8. Clique em **Save**
9. Repita para `NEXT_PUBLIC_API_URL` e `NEXT_PUBLIC_MINIO_URL`

## ✅ Verificação

Após adicionar as variáveis:

1. Faça um redeploy no Vercel
   - Vá em **Deployments**
   - Clique no último deployment
   - Clique em **Redeploy**
   - Selecione **Use existing Build Cache** 
   - Clique em **Redeploy**

2. Teste:
   - Acesse https://seu-frontend-url/
   - Crie um novo usuário
   - Vá para o email de confirmação
   - Clique no link
   - Abra o Console (F12) e procure por logs `[confirmEmailAction]`

## 🐛 Se Ainda Não Funcionar

Verifique os logs no Vercel:
1. Acesse https://vercel.com/dashboard
2. Seu projeto → **Deployments** 
3. Clique em **Logs**
4. Procure por erros como:
   - `API_URL não está configurada`
   - Erros de conexão à API
   - Status 500 ou 502

## 🔐 Segurança

- **API_URL**: NÃO public (usado apenas no servidor)
- **NEXT_PUBLIC_API_URL**: Public (pode ser vista no navegador)
- **NEXT_PUBLIC_MINIO_URL**: Public (para acessar imagens)

## 📱 URLs de Exemplo

**Railway Backend:**
```
https://5kplatform-prod-xxx.railway.app
```

**Vercel Frontend:**
```
https://5kplatform.vercel.app
```

**B2 Storage:**
```
https://f005.backblazeb2.com
```

---

Após configurar, faça o redeploy e teste novamente! 🚀
