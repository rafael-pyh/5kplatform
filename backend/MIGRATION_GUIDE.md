# Guia de Migração: Prisma → Sequelize

## ✅ Concluído

### 1. Dependências Atualizadas (package.json)
- ✅ Removido: `@prisma/client` e `prisma`
- ✅ Adicionado: `sequelize`, `sequelize-typescript`, `pg`, `pg-hstore`, `reflect-metadata`
- ✅ Adicionado Dev: `sequelize-cli`, `@types/validator`
- ✅ Scripts atualizados para usar Sequelize CLI

### 2. Modelos Criados
- ✅ `src/models/Person.ts` - Modelo Person com enum PersonRole
- ✅ `src/models/Lead.ts` - Modelo Lead com enum LeadStatus
- ✅ `src/models/QRCodeScan.ts` - Modelo QRCodeScan
- ✅ `src/models/index.ts` - Exports centralizados

### 3. Configuração do Banco
- ✅ `src/database/sequelize.ts` - Nova configuração Sequelize
- ✅ `config/database.js` - Configuração para Sequelize CLI
- ✅ `.sequelizerc` - Paths do Sequelize CLI

## 🔄 Precisa Atualizar

### Services que precisam ser convertidos:

#### 1. person.service.ts
Principais mudanças:
- `prisma.person.findUnique()` → `Person.findOne()`
- `prisma.person.findMany()` → `Person.findAll()`
- `prisma.person.create()` → `Person.create()`
- `prisma.person.update()` → `person.update()` (instância)
- `include` → usar array de objetos com `model` e `as`

#### 2. auth.service.ts
Principais mudanças:
- `prisma.person.findUnique()` → `Person.findOne()`
- `prisma.person.create()` → `Person.create()`
- `prisma.person.update()` → instância.update()
- `select` → usar `attributes: [...]`

#### 3. seller-auth.service.ts
Similar ao auth.service.ts

#### 4. lead.service.ts (PARCIALMENTE ATUALIZADO)
Verificar e completar todas as conversões

#### 5. qrcode.service.ts (PARCIALMENTE ATUALIZADO)
Verificar e completar todas as conversões

### Padrões de Conversão Prisma → Sequelize

#### Buscar por ID
```typescript
// Prisma
const item = await prisma.model.findUnique({ where: { id } });

// Sequelize
const item = await Model.findByPk(id);
```

#### Buscar um registro
```typescript
// Prisma
const item = await prisma.model.findFirst({ where: { email } });

// Sequelize
const item = await Model.findOne({ where: { email } });
```

#### Buscar múltiplos
```typescript
// Prisma
const items = await prisma.model.findMany({
  where: { active: true },
  orderBy: { createdAt: 'desc' },
});

// Sequelize
const items = await Model.findAll({
  where: { active: true },
  order: [['createdAt', 'DESC']],
});
```

#### Criar registro
```typescript
// Prisma
const item = await prisma.model.create({ data: { ...data } });

// Sequelize
const item = await Model.create({ ...data });
```

#### Atualizar registro
```typescript
// Prisma
const item = await prisma.model.update({
  where: { id },
  data: { ...updateData },
});

// Sequelize
const item = await Model.findByPk(id);
await item.update({ ...updateData });
// ou
await Model.update({ ...updateData }, { where: { id } });
```

#### Deletar registro
```typescript
// Prisma
await prisma.model.delete({ where: { id } });

// Sequelize
const item = await Model.findByPk(id);
await item.destroy();
// ou
await Model.destroy({ where: { id } });
```

#### Contar registros
```typescript
// Prisma
const count = await prisma.model.count({ where: { status: 'active' } });

// Sequelize
const count = await Model.count({ where: { status: 'active' } });
```

#### Includes/Relations
```typescript
// Prisma
const item = await prisma.model.findUnique({
  where: { id },
  include: {
    relation: {
      select: { id: true, name: true },
    },
  },
});

// Sequelize
const item = await Model.findByPk(id, {
  include: [{
    model: RelatedModel,
    as: 'relation',
    attributes: ['id', 'name'],
  }],
});
```

#### Operadores de comparação
```typescript
// Prisma
where: {
  createdAt: { gte: date },
  status: { in: ['ACTIVE', 'PENDING'] },
}

// Sequelize
import { Op } from 'sequelize';

where: {
  createdAt: { [Op.gte]: date },
  status: { [Op.in]: ['ACTIVE', 'PENDING'] },
}
```

#### Incrementar campo
```typescript
// Prisma
await prisma.model.update({
  where: { id },
  data: { count: { increment: 1 } },
});

// Sequelize
await Model.increment('count', { where: { id } });
```

## 📋 Próximos Passos

### 1. Atualizar Services Restantes
Converter todos os arquivos em `src/services/` usando os padrões acima:
- ✅ qrcode.service.ts (parcial)
- ✅ lead.service.ts (parcial)
- ❌ person.service.ts
- ❌ auth.service.ts
- ❌ seller-auth.service.ts

### 2. Atualizar Imports
Em todos os services, trocar:
```typescript
import prisma from "../database/prisma";
```
Por:
```typescript
import sequelize from "../database/sequelize";
import { Person, PersonRole } from "../models/Person";
import { Lead, LeadStatus } from "../models/Lead";
import { QRCodeScan } from "../models/QRCodeScan";
import { Op } from "sequelize";
```

### 3. Atualizar src/app.ts ou src/server.ts
Adicionar inicialização do Sequelize:
```typescript
import sequelize from './database/sequelize';

// Antes de iniciar o servidor
sequelize.authenticate()
  .then(() => console.log('✅ Database connected'))
  .catch(err => console.error('❌ Database connection failed:', err));

// Em desenvolvimento, pode sincronizar modelos (NÃO USE EM PRODUÇÃO)
if (process.env.NODE_ENV === 'development') {
  sequelize.sync({ alter: true });
}
```

### 4. Criar Migrations
Criar migrations para replicar o schema do Prisma:

```bash
npx sequelize-cli migration:generate --name create-initial-tables
```

Editar o arquivo de migration criado em `src/migrations/` com o schema completo.

### 5. Criar Seeds
Converter `prisma/seed.ts` para um seeder do Sequelize:

```bash
npx sequelize-cli seed:generate --name demo-data
```

### 6. Atualizar Scripts de Admin
Atualizar arquivos:
- `create-admin-prod.ts`
- `generate-admin-hash.ts`

Para usar Sequelize ao invés de Prisma.

### 7. Remover Arquivos do Prisma
Após tudo funcionar:
```bash
# Remover diretório prisma
rm -rf prisma/

# Remover arquivos de configuração
rm prisma.config.js
rm prisma.config.ts
rm prisma.config.cjs

# Remover src/database/prisma.ts (já substituído por sequelize.ts)
rm src/database/prisma.ts
```

### 8. Atualizar Variáveis de Ambiente
Garantir que `.env` tenha:
```env
DATABASE_URL=postgresql://user:password@host:port/database
# ou variáveis individuais
DB_HOST=localhost
DB_PORT=5432
DB_NAME=database_name
DB_USER=username
DB_PASSWORD=password
```

### 9. Testar a Aplicação
```bash
# Executar migrations
npm run db:migrate

# Executar seeds (se houver)
npm run db:seed

# Iniciar aplicação
npm run dev
```

## 📝 Notas Importantes

1. **Enums**: No Sequelize, os enums são definidos nos modelos com `DataType.ENUM`
2. **UUIDs**: Use `DataType.UUIDV4` com `@Default(DataType.UUIDV4)`
3. **Timestamps**: `@CreatedAt` e `@UpdatedAt` são automáticos
4. **Relations**: Defina com `@HasMany`, `@BelongsTo`, `@ForeignKey`
5. **Transactions**: Use `sequelize.transaction()` quando necessário

## ⚠️ Avisos

- NÃO execute `sequelize.sync({ force: true })` em produção (apaga dados!)
- Sempre use migrations para alterações de schema em produção
- Teste completamente em desenvolvimento antes de fazer deploy
- Faça backup do banco de dados antes de migrar em produção

## 🆘 Problemas Comuns

### Erro: "Cannot find module 'sequelize'"
```bash
npm install
```

### Erro de tipos TypeScript
```bash
npm install --save-dev @types/validator
```

### Migrations não funcionam
Verifique se `.sequelizerc` está correto e se `config/database.js` existe.

### Relations não carregam
Verifique se os aliases (`as`) nos models combinam com os usados nos includes.
