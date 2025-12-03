# 🚂 Configuração do Railway - Monorepo

## 📁 Estrutura do Projeto

```
5kplatform/
├── backend/          ← Serviço: API
│   ├── Dockerfile
│   ├── railway.json
│   └── ...
├── minio/            ← Serviço: MinIO
│   ├── Dockerfile
│   ├── railway.json
│   └── ...
└── frontend/         ← Serviço: Frontend (Vercel)
    └── ...
```

## ⚙️ Configuração por Serviço

### 🔧 Serviço: API (Backend)

**No Railway Dashboard:**

1. **Settings → General**
   - **Root Directory:** `backend`
   - **Watch Paths:** `backend/**`

2. **Settings → Build**
   - **Builder:** Dockerfile
   - **Dockerfile Path:** `Dockerfile` (relativo ao Root Directory)

3. **Settings → Deploy**
   - **Restart Policy:** On Failure
   - **Max Retries:** 10

4. **Variables**
   ```env
   DATABASE_URL=postgresql://...
   NODE_ENV=production
   PORT=4000
   JWT_SECRET=your-secret
   API_URL=https://your-api.railway.app
   FRONTEND_URL=https://your-frontend.vercel.app
   MINIO_ENDPOINT=minio.railway.internal
   MINIO_PORT=9000
   MINIO_ROOT_USER=minio
   MINIO_ROOT_PASSWORD=minio123
   MINIO_USE_SSL=false
   ```

---

### 📦 Serviço: MinIO

**No Railway Dashboard:**

1. **Settings → General**
   - **Root Directory:** `minio`
   - **Watch Paths:** `minio/**`

2. **Settings → Build**
   - **Builder:** Dockerfile
   - **Dockerfile Path:** `Dockerfile` (relativo ao Root Directory)

3. **Settings → Deploy**
   - **Restart Policy:** On Failure
   - **Max Retries:** 3

4. **Variables**
   ```env
   MINIO_ROOT_USER=minio
   MINIO_ROOT_PASSWORD=minio123
   ```

---

## 🎯 Passos para Configurar

### 1️⃣ Criar Serviços no Railway

```bash
# No Railway Dashboard:
1. New Project → Deploy from GitHub repo
2. Selecionar: rafael-pyh/5kplatform
3. Criar dois serviços separados:
   - API (backend)
   - MinIO (minio)
```

### 2️⃣ Configurar Root Directory

**Para o serviço API:**
```
Settings → General → Root Directory → backend
```

**Para o serviço MinIO:**
```
Settings → General → Root Directory → minio
```

### 3️⃣ Configurar Watch Paths (Opcional)

Isso faz com que o serviço só faça redeploy quando arquivos específicos mudarem:

**API:**
```
Settings → General → Watch Paths → backend/**
```

**MinIO:**
```
Settings → General → Watch Paths → minio/**
```

---

## 🐛 Troubleshooting

### ❌ "Dockerfile does not exist"

**Causa:** Root Directory não está configurado.

**Solução:**
1. Vá em **Settings → General**
2. Configure **Root Directory** para `backend` ou `minio`
3. Salve e faça redeploy

---

### ❌ "docker-entrypoint.sh not found"

**Causa:** O Railway está tentando buildar do contexto errado.

**Solução:**
1. Certifique-se que **Root Directory** está configurado
2. Verifique que `.dockerignore` não está bloqueando o arquivo
3. O `dockerfilePath` no `railway.json` deve ser relativo ao Root Directory

---

### ❌ Deploy do MinIO afeta o Backend

**Causa:** Ambos os serviços estão configurados para assistir o mesmo diretório.

**Solução:**
1. Configure **Watch Paths** específicos para cada serviço
2. Backend: `backend/**`
3. MinIO: `minio/**`

---

## ✅ Checklist Final

- [ ] Serviço API criado no Railway
- [ ] Root Directory da API: `backend`
- [ ] Watch Paths da API: `backend/**`
- [ ] Variáveis de ambiente da API configuradas
- [ ] Serviço MinIO criado no Railway
- [ ] Root Directory do MinIO: `minio`
- [ ] Watch Paths do MinIO: `minio/**`
- [ ] Variáveis de ambiente do MinIO configuradas
- [ ] Banco de dados PostgreSQL criado e conectado à API
- [ ] Rede privada configurada (MinIO ↔ API)

---

## 🔗 Conexão Entre Serviços

O Backend se conecta ao MinIO via rede privada do Railway:

```env
# No serviço API
MINIO_ENDPOINT=minio.railway.internal  # Nome do serviço MinIO
MINIO_PORT=9000
```

O Railway resolve automaticamente `minio.railway.internal` para o IP interno do serviço MinIO.

---

## 📝 Comandos Git

Após configurar tudo:

```bash
# Commitar mudanças
git add .
git commit -m "chore: configure railway for monorepo"
git push origin dev

# O Railway vai fazer deploy automático dos serviços configurados
```

---

## 🎉 Resultado Final

Após configuração correta:

✅ Push no `backend/**` → Redeploy apenas da API
✅ Push no `minio/**` → Redeploy apenas do MinIO
✅ Push no `frontend/**` → Nenhum redeploy (frontend está na Vercel)
✅ Cada serviço tem seu próprio Dockerfile e contexto
✅ Comunicação interna entre serviços funciona
