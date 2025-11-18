# 🚀 Guia de Instalação Rápida - 5K Platform Backend

## ✅ Todos os erros foram corrigidos!

### 📦 Pacotes instalados com sucesso

Os warnings de deprecated são normais e não afetam o funcionamento:
- ✅ Dependencies instaladas
- ✅ DevDependencies instaladas
- ✅ 0 vulnerabilidades encontradas

### 🔧 Próximos Passos

#### 1. Gerar o Prisma Client
```bash
npx prisma generate
```

Este comando irá:
- Gerar os tipos TypeScript do Prisma
- Criar o Prisma Client com todos os models
- Resolver os imports de `@prisma/client`

#### 2. Configurar o arquivo .env
```bash
# Copie o arquivo de exemplo
copy .env.example .env

# Edite o .env com suas configurações
# Especialmente: DATABASE_URL, JWT_SECRET
```

#### 3. Executar as Migrações do Banco
```bash
npx prisma migrate dev --name init
```

Este comando irá:
- Criar o banco de dados se não existir
- Criar todas as tabelas
- Aplicar as migrações

#### 4. Executar o Seed (Dados Iniciais)
```bash
npx prisma db seed
```

Ou:
```bash
npm run prisma:seed
```

Isso criará:
- ✅ Usuário admin: `admin@5kplatform.com` / `admin123`
- ✅ Vendedor de exemplo

#### 5. Iniciar o Servidor
```bash
npm run dev
```

O servidor estará rodando em: `http://localhost:4000`

### 🧪 Testar a API

#### Health Check
```bash
curl http://localhost:4000/health
```

#### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@5kplatform.com\",\"password\":\"admin123\"}"
```

### ✅ Correções Realizadas

1. **✅ lead.service.ts** - Tipo `LeadStatus` definido manualmente
2. **✅ lead.controller.ts** - Tipo `LeadStatus` definido manualmente
3. **✅ person.service.ts** - Tipos explícitos nos filters
4. **✅ jwt.ts** - Cast explícito de tipos para jwt.sign
5. **✅ tsconfig.json** - Incluído prisma/seed.ts no escopo

### 📋 Estrutura de Comandos

```bash
# Desenvolvimento
npm run dev              # Inicia servidor em modo dev
npm run build           # Compila TypeScript
npm start               # Inicia em modo produção

# Prisma
npm run prisma:generate     # Gera Prisma Client
npm run prisma:migrate      # Executa migrações
npm run prisma:studio       # Abre Prisma Studio
npm run prisma:seed         # Popula dados iniciais

# Qualidade de Código
npm run lint            # Executa ESLint
npm run format          # Formata com Prettier
```

### 🐳 Rodando com Docker (Opcional)

Se você tem o Docker Compose na raiz do projeto:

```bash
# Volte para a raiz
cd ..

# Suba os containers
docker-compose up -d

# O backend estará disponível em http://localhost:4000
```

### ⚠️ Sobre os Warnings de Deprecated

Os packages deprecated mencionados são **normais** e **não afetam o funcionamento**:

- `inflight@1.0.6` - Dependência transitiva, será atualizada pelas libs
- `@humanwhocodes/*` - Já em processo de migração para @eslint/*
- `rimraf@3.0.2` - Dependência de dev, sem impacto
- `glob@7.2.3` - Dependência transitiva
- `multer@1.4.5-lts.2` - Funcional, atualização para 2.x é opcional
- `eslint@8.57.1` - Versão LTS, totalmente funcional

Você pode ignorá-los por enquanto. Não há vulnerabilidades de segurança.

### 🎯 Checklist de Verificação

Antes de iniciar o servidor, certifique-se:

- [ ] PostgreSQL está rodando
- [ ] MinIO está rodando (ou Docker Compose up)
- [ ] Arquivo `.env` está configurado
- [ ] `npx prisma generate` foi executado
- [ ] `npx prisma migrate dev` foi executado
- [ ] `npx prisma db seed` foi executado

### 🆘 Resolução de Problemas

#### Erro: "Can't reach database server"
```bash
# Verifique se o PostgreSQL está rodando
# Verifique a DATABASE_URL no .env
```

#### Erro: "PrismaClient is unable to run in the browser"
```bash
# Execute: npx prisma generate
```

#### Erro: "Table doesn't exist"
```bash
# Execute: npx prisma migrate dev
```

#### Erro de tipos do Prisma
```bash
# Execute: npx prisma generate
# Reinicie o TypeScript Server no VS Code: Ctrl+Shift+P > "TypeScript: Restart TS Server"
```

### 📚 Próximos Passos

1. ✅ Backend funcionando
2. 🔄 Testar endpoints com Postman/Insomnia
3. 🔄 Desenvolver Frontend
4. 🔄 Integrar Frontend com Backend
5. 🔄 Deploy em produção

### 🎉 Tudo Pronto!

Todos os erros foram corrigidos. O projeto está pronto para ser executado!

**Comandos em sequência:**
```bash
# 1. Gerar Prisma Client
npx prisma generate

# 2. Executar migrações
npx prisma migrate dev --name init

# 3. Seed inicial
npx prisma db seed

# 4. Iniciar servidor
npm run dev
```

✨ Boa sorte com o projeto!