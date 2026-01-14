# 🚀 Guia de Otimização Backend - 5K Plataforma

## 📋 Resumo das Melhorias Implementadas

Esta documentação descreve todas as otimizações implementadas no backend da 5K Plataforma para melhorar performance, reduzir custos em Railway e garantir escalabilidade.

---

## 1️⃣ Cache em Memória com LRU e TTL

### 📂 Arquivos Criados
- `src/cache/cache.service.ts` - Serviço de cache base
- `src/cache/cache-invalidation.ts` - Gerenciador de invalidação e decorators

### 🎯 Características

#### ✅ Cache Service
```typescript
import { getGlobalCache } from './src/cache/cache.service';

// Obter valor do cache
const userData = cache.get<User>('user:123');

// Definir com TTL (tempo de vida)
cache.set('user:123', userData, 5 * 60 * 1000); // 5 minutos

// Invalidar por padrão (regex)
cache.invalidateByPattern(/^user:.*/); // Remove todas as chaves de user

// Limpeza manual
cache.clear();

// Estatísticas
console.log(cache.getStats());
// { size: 45, maxSize: 1000, utilizationPercent: '4.50' }
```

#### ✅ Invalidação Automática
```typescript
import { CacheInvalidationManager } from './src/cache/cache-invalidation';

// Após criar recurso
CacheInvalidationManager.invalidateAfterCreate('Lead');

// Após atualizar
CacheInvalidationManager.invalidateAfterUpdate('Lead', leadId);

// Após deletar
CacheInvalidationManager.invalidateAfterDestroy('Lead', leadId);
```

#### ✅ Decorator para Cache Automático (futuro)
```typescript
@CacheDecorator(60000, 'users')  // 1 minuto, prefixo 'users'
async getUser(id: string) {
  return User.findByPk(id);
}
```

### 📊 TTLs Recomendadas por Tipo

| Tipo | TTL | Caso de Uso |
|------|-----|-----------|
| Listas | 10 min | getAllLeads, getLeadsByOwner |
| Detalhes | 10 min | getLeadById, getSellerLeadById |
| Estatísticas | 5 min | getLeadsStats, getSellerLeadsStats |
| Health Check | 1 min | /health, status endpoints |

---

## 2️⃣ Sequelize: Singleton com Pool Otimizado

### 📂 Arquivo Modificado
- `src/database/sequelize.ts` - Agora com singleton pattern

### 🎯 Melhorias

#### ✅ Antes (problema)
```typescript
// ❌ RUIM: Cria nova instância a cada import
const sequelize = new Sequelize(...);
export default sequelize;
```

#### ✅ Depois (otimizado)
```typescript
// ✅ BOM: Singleton - apenas uma instância
function initializeSequelize(): Sequelize {
  if (sequelizeInstance) {
    return sequelizeInstance;
  }
  
  sequelizeInstance = new Sequelize(...);
  return sequelizeInstance;
}

export function getSequelize(): Sequelize {
  return sequelizeInstance || initializeSequelize();
}
```

### 📊 Configuração de Pool

**Desenvolvimento:**
```typescript
pool: {
  max: 5,              // Máximo 5 conexões
  min: 0,              // Nenhuma conexão parada
  acquire: 30000,      // Espera 30s por conexão
  idle: 10000,         // Fecha após 10s inativo
  evict: 10000,        // Valida a cada 10s
  handleDisconnects: true,
}
```

**Produção (Railway):**
```typescript
pool: {
  max: 10,             // Mais conexões em prod
  min: 2,              // Mantém 2 sempre ativas
  acquire: 30000,
  idle: 10000,
  evict: 10000,
  handleDisconnects: true,
}
```

### ⚠️ Importante
- Não crie múltiplas instâncias do Sequelize
- Use sempre `getSequelize()` ou `import sequelize from './database/sequelize'`
- O pool é compartilhado globalmente

---

## 3️⃣ Queries Otimizadas com Attributes

### 📂 Arquivo Modificado
- `src/services/lead.service.ts` - Todas as queries refatoradas

### 🎯 Padrão: Sempre especificar attributes

#### ❌ ANTES (ineficiente)
```typescript
// SELECT * - traz TODAS as colunas
const leads = await Lead.findAll({
  where: { ownerId },
});
```

#### ✅ DEPOIS (otimizado)
```typescript
// SELECT apenas colunas necessárias
const leads = await Lead.findAll({
  where: { ownerId },
  attributes: ['id', 'name', 'status', 'createdAt'],
  order: [['createdAt', 'DESC']],
  limit: 50,           // Paginação
  offset: 0,
});
```

### 📊 Exemplo Real: Lead Service

```typescript
// 1️⃣ CRIAR LEAD
async function createLead(data: CreateLeadDto) {
  const lead = await Lead.create(data);
  CacheInvalidationManager.invalidateAfterCreate('Lead'); // Invalida cache
  return lead;
}

// 2️⃣ LISTAR COM CACHE
async function getAllLeads(filters?: FilterOptions) {
  const cacheKey = service.getCacheKey('list', JSON.stringify(filters));
  
  return service.getCachedOrExecute(cacheKey, async () => {
    return Lead.findAll({
      attributes: ['id', 'name', 'status', 'createdAt'], // ✅ Attributes
      where: buildWhere(filters),
      order: [['createdAt', 'DESC']],
      limit: 50,     // ✅ Paginação
      offset: 0,
    });
  }, 10 * 60 * 1000); // TTL: 10 minutos
}

// 3️⃣ BUSCAR POR ID COM CACHE E INCLUDES
async function getLeadById(id: string) {
  const cacheKey = `Lead:by-id:${id}`;
  
  return service.getCachedOrExecute(cacheKey, async () => {
    return Lead.findByPk(id, {
      attributes: ['id', 'name', 'status', 'email', 'phone'],
      include: [{
        model: Person,
        as: 'owner',
        attributes: ['id', 'name'],  // ✅ Attributes no include também
      }],
    });
  }, 10 * 60 * 1000);
}

// 4️⃣ ATUALIZAR COM INVALIDAÇÃO
async function updateLead(id: string, data: UpdateLeadDto) {
  const lead = await Lead.findByPk(id);
  await lead.update(data);
  
  // Invalida apenas caches afetados
  CacheInvalidationManager.invalidateAfterUpdate('Lead', id);
  
  return lead;
}
```

### 📋 Checklist de Query Otimizada

- ✅ Usa `attributes` (sem SELECT *)
- ✅ Usa `where` com filtros específicos
- ✅ Implementa paginação (`limit`, `offset`)
- ✅ Utiliza `raw: true` quando não precisa de instâncias
- ✅ Cacheia resultados com TTL apropriado
- ✅ Invalida cache após writes (create, update, destroy)

---

## 4️⃣ Redução de CPU e Logs

### 🎯 Otimizações Implementadas

#### ✅ Desabilitar Logs do Sequelize em Produção
```typescript
// src/database/sequelize.ts

logging: process.env.NODE_ENV === 'production'
  ? false  // ❌ Nenhum log em produção
  : (msg) => console.log(`[SQL] ${msg}`);  // ✅ Log apenas em dev
```

#### ✅ Validar NODE_ENV
```bash
# Em produção, definir:
NODE_ENV=production
```

#### ✅ Remover Logs Excessivos
```typescript
// ❌ RUIM - Log a cada request
console.log(`Query: ${sql}`);
console.log(`Result: ${JSON.stringify(result)}`);

// ✅ BOM - Log apenas quando necessário
if (process.env.LOG_SQL === 'true') {
  console.log(`[SQL] ${sql}`);
}
```

#### ✅ Usar `raw: true` para Queries Simples
```typescript
// ❌ RUIM - Cria instâncias (mais CPU)
const leads = await Lead.findAll({ raw: false });

// ✅ BOM - Retorna POJOs (menos CPU)
const leads = await Lead.findAll({ raw: true });
// Perde suportes a: .toJSON(), hooks, validações Sequelize
```

---

## 5️⃣ Variáveis de Ambiente - Separação Clara

### 📂 Arquivo Modificado
- `src/config/env.ts` - Agora com tipagem e validação

### 🎯 Padrão: URLs Internas vs Públicas

#### ❌ PROBLEMA COMUM
```typescript
// .env
API_URL=https://5kplatform.railway.internal  // ❌ Exposto ao frontend!
PUBLIC_API_URL=https://api.5kenergiasolar.com.br

// frontend/.env.local
NEXT_PUBLIC_API_URL=${API_URL}  // ❌ Usa a interna por acidente
```

#### ✅ SOLUÇÃO IMPLEMENTADA
```typescript
// backend/src/config/env.ts
export const env = {
  // Server-side only
  INTERNAL_API_URL: 'https://5kplatform.railway.internal',  // Para backend-to-backend
  
  // Public (pode ser NEXT_PUBLIC_)
  PUBLIC_API_URL: 'https://api.5kenergiasolar.com.br',      // Para browser
  FRONTEND_URL: 'https://5kenergiasolar.com.br',
};
```

#### ✅ Uso Correto
```typescript
// backend/src/services/lead.service.ts
// ✅ Usar URL interna para chamadas internas
const internalResponse = await axios.get(env.INTERNAL_API_URL + '/api/...');

// frontend/.env.local
NEXT_PUBLIC_API_URL=${PUBLIC_API_URL}  // ✅ Correto!
```

### 📊 Variáveis de Ambiente Recomendadas

```bash
# .env ou railway.json

# Server Config
PORT=4000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Cache
CACHE_MAX_SIZE=1000
CACHE_TTL_MS=300000  # 5 minutos

# JWT
JWT_SECRET=super-secret-change-in-prod
JWT_EXPIRES_IN=7d

# URLs - CRITICAL SEPARATION
INTERNAL_API_URL=https://5kplatform-api.railway.internal
PUBLIC_API_URL=https://api.5kenergiasolar.com.br
FRONTEND_URL=https://5kenergiasolar.com.br

# Storage
S3_ENDPOINT=https://s3.us-east-005.backblazeb2.com
S3_REGION=us-east-005
S3_ACCESS_KEY=your-key
S3_SECRET_KEY=your-secret
S3_BUCKET=images

# Email
EMAIL_USER=contact@5kenergiasolar.com.br
EMAIL_PASS=app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# Logging
LOG_LEVEL=info
LOG_SQL=false  # Desabilita logs de SQL em prod
```

---

## 6️⃣ Tratamento de Erros Global

### 📂 Arquivo Modificado
- `src/server.ts` - Agora com handlers globais

### 🎯 Melhorias

```typescript
// ✅ Graceful Shutdown
process.on('SIGTERM', async () => {
  console.log('Encerrando gracefully...');
  server.close();
  await sequelize.close();
  process.exit(0);
});

// ✅ Unhandled Rejections
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  // Log para observability, mas não mata o processo
});

// ✅ Uncaught Exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
```

### 🎯 Timeout de Conexão

```typescript
// src/database/sequelize.ts
dialectOptions: {
  statement_timeout: 30000,  // 30s timeout para queries em produção
}
```

---

## 7️⃣ Exemplos de Uso por Camada

### 📂 Estrutura de Pastas
```
src/
├── cache/
│   ├── cache.service.ts
│   └── cache-invalidation.ts
├── database/
│   └── sequelize.ts          # Singleton
├── models/
│   └── Lead.ts               # Sequelize models
├── services/
│   └── lead.service.ts       # Lógica com cache
├── controllers/
│   └── lead.controller.ts    # HTTP handlers
├── routes/
│   └── lead.routes.ts        # Express routes
└── config/
    └── env.ts                # Variáveis validadas
```

### 💻 Exemplo Completo: Criar e Listar Leads

```typescript
// ==================== DATABASE ====================
// src/database/sequelize.ts
import { getSequelize } from './database/sequelize';
const db = getSequelize();  // Singleton garantido

// ==================== SERVICE (Lógica com Cache) ====================
// src/services/lead.service.ts
export const LeadServiceFunctions = {
  async createLead(data: CreateLeadDto) {
    const lead = await Lead.create(data);
    CacheInvalidationManager.invalidateAfterCreate('Lead'); // Invalida
    return lead;
  },

  async getAllLeads(filters?: FilterOptions) {
    const service = new LeadService();
    const cacheKey = service.getCacheKey('list', JSON.stringify(filters));

    return service.getCachedOrExecute(cacheKey, async () => {
      return Lead.findAll({
        attributes: ['id', 'name', 'status'],
        where: buildWhere(filters),
        limit: filters?.limit || 50,
        offset: filters?.offset || 0,
      });
    }, 10 * 60 * 1000); // 10 min cache
  },
};

// ==================== CONTROLLER (HTTP) ====================
// src/controllers/lead.controller.ts
export const createLead = async (req, res, next) => {
  try {
    const data = await LeadServiceFunctions.createLead(req.body);
    return ResponseBuilder.created(res, data.toJSON());
  } catch (error) {
    next(error);
  }
};

export const getAllLeads = async (req, res, next) => {
  try {
    const { limit, offset } = req.query;
    const data = await LeadServiceFunctions.getAllLeads({ limit, offset });
    return ResponseBuilder.success(res, data);
  } catch (error) {
    next(error);
  }
};

// ==================== ROUTES ====================
// src/routes/lead.routes.ts
import * as controller from '../controllers/lead.controller';

router.post('/', authenticate, controller.createLead);
router.get('/', authenticate, controller.getAllLeads);
router.get('/:id', authenticate, controller.getLeadById);
router.put('/:id', authenticate, controller.updateLead);
router.delete('/:id', authenticate, controller.deleteLead);
```

---

## 8️⃣ Checklist de Produção - Railway

### 🚀 Antes de Deployar

- [ ] ✅ `NODE_ENV=production` definido
- [ ] ✅ Logs do Sequelize desabilitados
- [ ] ✅ `DATABASE_URL` configurada
- [ ] ✅ `INTERNAL_API_URL` aponta para .railway.internal
- [ ] ✅ `PUBLIC_API_URL` aponta para domínio público
- [ ] ✅ Cache TTL apropriado (não usar 0)
- [ ] ✅ Pool config: max: 10, min: 2 em produção
- [ ] ✅ JWT_SECRET seguro (não default)
- [ ] ✅ CORS configurado corretamente
- [ ] ✅ Error handlers ativos
- [ ] ✅ Graceful shutdown implementado

### 📊 Monitoramento

```bash
# Cache hit rate
curl http://api:4000/health
# Deve retornar status rápido (< 100ms)

# Database pool
# Monitorar via Railway Dashboard ou pgAdmin:
# SELECT count(*) FROM pg_stat_activity;

# Verificar logs
docker logs <container>
```

---

## 9️⃣ Migração de Código Antigo

### 📋 Passo a Passo

1. **Manter compatibilidade com imports antigos:**
```typescript
// src/database/sequelize.ts
export default getSequelize();  // Permite: import sequelize from '...'
export { getSequelize };         // Permite: import { getSequelize } from '...'
```

2. **Atualizar serviços gradualmente:**
```typescript
// Antigo ainda funciona:
import sequelize from './database/sequelize';

// Novo padrão:
const sequelize = getSequelize();
```

3. **Refatorar controllers por módulo:**
```typescript
// 1º: Lead service ✅
// 2º: Person service
// 3º: Creative service
// etc...
```

---

## 🔟 Dicas de Performance

### 🎯 Para Railway/Produção

1. **Database Indexes**
```sql
-- Adicionar índices em colunas frequentemente filtradas
CREATE INDEX idx_leads_owner_id ON leads(owner_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at);
```

2. **Connection Pooling**
```typescript
pool: {
  max: 10,           // Rails padrão: 5
  min: 2,            // Mantém mínimo
  idle: 10000,       // Fecha inativas
  handleDisconnects: true,  // Reconecta
}
```

3. **Cache Agressivo**
```typescript
// Listas mudam pouco
export const CACHE_LISTS = 15 * 60 * 1000;  // 15 min

// Estatísticas são lentas
export const CACHE_STATS = 5 * 60 * 1000;   // 5 min

// Detalhes individuais são mais voláteis
export const CACHE_DETAIL = 5 * 60 * 1000;  // 5 min
```

4. **Batch Operations**
```typescript
// ❌ RUIM: 100 queries
for (const id of leadIds) {
  await Lead.update({ status: 'BOUGHT' }, { where: { id } });
}

// ✅ BOM: 1 query
await Lead.update({ status: 'BOUGHT' }, {
  where: { id: leadIds }
});
```

5. **Use Raw Queries para Relatórios**
```typescript
// ❌ RUIM: Sequelize carrega tudo em memória
const stats = await Lead.findAll();

// ✅ BOM: Query raw, apenas agregação
const [stats] = await sequelize.query(`
  SELECT status, COUNT(*) as count
  FROM leads
  GROUP BY status
`);
```

---

## 📚 Referências

- [Sequelize Pool Documentation](https://sequelize.org/api/v6/class/src/pool.js~pool)
- [Node.js Memory Management](https://nodejs.org/en/docs/guides/simple-profiling/)
- [Railway PostgreSQL Best Practices](https://docs.railway.app/guides/postgres)

---

## 🤝 Suporte

Para dúvidas sobre a implementação:
1. Verificar os exemplos em `src/services/lead.service.ts`
2. Consultar `src/cache/cache.service.ts` para cache
3. Verificar `src/config/env.ts` para variáveis
