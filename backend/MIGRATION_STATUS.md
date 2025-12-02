# 🔄 Migração Prisma → Sequelize - Status Atual

## ✅ Completado

### 1. Dependências
- ✅ Instaladas todas as dependências do Sequelize
- ✅ Removido Prisma do package.json
- ✅ Scripts atualizados no package.json

### 2. Modelos Sequelize
- ✅ `src/models/Person.ts` - Completo
- ✅ `src/models/Lead.ts` - Completo
- ✅ `src/models/QRCodeScan.ts` - Completo
- ✅ `src/models/index.ts` - Exports centralizados

### 3. Configuração do Banco
- ✅ `src/database/sequelize.ts` - Configuração do Sequelize
- ✅ `config/database.js` - Para Sequelize CLI
- ✅ `.sequelizerc` - Configuração de paths

### 4. Services Atualizados
- ✅ `src/services/person.service.ts` - Convertido para Sequelize
- ✅ `src/services/auth.service.ts` - Convertido para Sequelize
- ✅ `src/services/seller-auth.service.ts` - Convertido para Sequelize
- ⚠️ `src/services/lead.service.ts` - PARCIALMENTE convertido
- ⚠️ `src/services/qrcode.service.ts` - PARCIALMENTE convertido

### 5. Servidor
- ✅ `src/server.ts` - Atualizado com inicialização do Sequelize

### 6. Migrations
- ✅ Migration inicial criada: `src/migrations/20241202000000-create-initial-tables.js`

## ⚠️ Ações Necessárias

### 1. Completar Conversão de Services

#### lead.service.ts
Ainda tem algumas referências a `prisma`. Execute:
```bash
# Abra o arquivo e substitua manualmente as ocorrências restantes
```

#### qrcode.service.ts
Ainda tem algumas referências a `prisma`. Execute:
```bash
# Abra o arquivo e substitua manualmente as ocorrências restantes
```

### 2. Executar Migration

**IMPORTANTE**: Faça backup do banco antes!

```bash
# Executar migration
npm run db:migrate

# Se houver erro, pode ser necessário dropar e recriar (CUIDADO - APAGA DADOS!)
# npm run db:migrate:undo
```

### 3. Testar a Aplicação

```bash
# Iniciar em modo desenvolvimento
npm run dev

# Verificar se todos os endpoints funcionam
```

### 4. Atualizar Scripts de Admin (Opcional)

Se você usa scripts de criação de admin:
- `create-admin-prod.ts`
- `generate-admin-hash.ts`

Eles precisam ser atualizados para usar Sequelize.

### 5. Remover Arquivos do Prisma (Após Testes)

```bash
# Depois de testar e confirmar que tudo funciona
Remove-Item -Recurse -Force prisma
Remove-Item prisma.config.js
Remove-Item prisma.config.ts
Remove-Item prisma.config.cjs
Remove-Item src\database\prisma.ts
```

## 📋 Checklist de Testes

- [ ] Endpoint de login admin funciona
- [ ] Endpoint de login seller funciona
- [ ] Criar pessoa/vendedor funciona
- [ ] Listar pessoas funciona
- [ ] Criar lead funciona
- [ ] Listar leads funciona
- [ ] Atualizar lead funciona
- [ ] QR Code scan funciona
- [ ] Upload de arquivos funciona

## 🔧 Comandos Úteis

```bash
# Executar migrations
npm run db:migrate

# Reverter última migration
npm run db:migrate:undo

# Executar seeds (se houver)
npm run db:seed

# Iniciar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar produção (com migrations)
npm run start:migrate
```

## 🐛 Troubleshooting

### Erro: "Cannot find module 'sequelize'"
```bash
npm install
```

### Erro: "relation does not exist"
```bash
# Execute as migrations
npm run db:migrate
```

### Erro: "type already exists"
Se você já tinha um banco com Prisma:
```bash
# Você pode precisar dropar os tipos enum antigos
# Conecte ao postgres e execute:
# DROP TYPE IF EXISTS "PersonRole";
# DROP TYPE IF EXISTS "LeadStatus";
```

### Erro de TypeScript
```bash
# Reconstrua o projeto
npm run build
```

## 📚 Documentação

- [Guia Completo de Migração](./MIGRATION_GUIDE.md)
- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [Sequelize TypeScript](https://github.com/sequelize/sequelize-typescript)

## 🆘 Problemas?

Se encontrar problemas:
1. Verifique os logs do terminal
2. Confira se as variáveis de ambiente estão corretas
3. Teste a conexão com o banco manualmente
4. Revise o arquivo de migration

## 📝 Notas Importantes

1. **Não execute migrations em produção sem backup**
2. **Teste tudo em desenvolvimento primeiro**
3. **Os modelos do Sequelize usam decorators do sequelize-typescript**
4. **As relations são definidas com `@HasMany`, `@BelongsTo`, etc**
5. **Use sempre `Op` do Sequelize para operadores de comparação**

## 🎯 Próximos Passos

1. Complete a conversão dos services restantes (lead, qrcode)
2. Execute as migrations
3. Teste todos os endpoints
4. Atualize scripts de admin (se necessário)
5. Remova arquivos do Prisma
6. Commit e deploy
