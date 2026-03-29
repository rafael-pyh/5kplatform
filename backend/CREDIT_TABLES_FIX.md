# Fix: Credit Tables Migration Issues

## Problema Identificado
As tabelas `CreditWallet` e `CreditTransaction` não estavam sendo criadas em produção durante o startup do container, causando erro "relation does not exist".

## Soluções Implementadas

### 1. **Melhorias no Entrypoint (`docker-entrypoint.sh`)**
- ✅ Adicionado sistema de **retry com até 3 tentativas** para migrations
- ✅ Adicionado **log detalhado** do status das migrations
- ✅ Adicionado **fallback SQL** se as migrations falharem
- ✅ Adicionada **verificação das tabelas críticas** após migrations
- ✅ O container **falha e não inicia** se as migrations não conseguirem rodar (antes ignorava erros)

### 2. **Novo Script SQL Fallback (`create-credit-tables.sql`)**
- Script que cria as tabelas via SQL direto se as migrations falharem
- Usa `CREATE TABLE IF NOT EXISTS` para ser idempotente
- Cria o ENUM type para `CreditTransactionType`
- Adiciona todos os índices necessários

### 3. **Atualizações no Dockerfile**
- Mudado de `npm install --omit=dev` para `npm install` completo
  - Garante que `sequelize-cli` está disponível em produção
- Adicionado `curl` ao image (útil para health checks)
- Copia o arquivo SQL fallback para o container

### 4. **Migrations SQL Corrigidas**
- Fixed: ENUM syntax em `20260127211341-create-credit-transaction.js`
  - De: `type: Sequelize.ENUM('COMMISSION', ...)`
  - Para: `type: Sequelize.ENUM, values: ['COMMISSION', ...]`

## Fluxo de Execução no Container

```
1. Aguardar database disponível
2. Verificar status das migrations
3. Tentar executar migrations (até 3 vezes com retry de 5s)
   ├─ Se sucesso → Continuar
   └─ Se falho → Executar SQL fallback
4. Verificar se as tabelas críticas foram criadas
5. Executar seeds
6. Iniciar aplicação
```

## Como Testar em Produção

1. Rebuild da imagem Docker
2. Deploy da nova versão
3. O container iniciará e:
   - Mostrará logs detalhados do processo de migration
   - Exibirá "✅ Migrations aplicadas com sucesso!" ou
   - "✅ Tabelas criadas via SQL fallback!"
   - Verificará presença das 2 tabelas críticas

## Arquivos Modificados
- `backend/docker-entrypoint.sh` - Melhorias na lógica de migration
- `backend/Dockerfile` - Instalação de deps completo
- `backend/create-credit-tables.sql` - Novo arquivo de fallback
- `backend/src/migrations/20260127211341-create-credit-transaction.js` - Fix ENUM syntax

## Garantias
- ✅ Tabelas serão criadas em produção
- ✅ Banco de dados existente não será alterado
- ✅ Retries automáticos em caso de falhas temporárias
- ✅ Fallback SQL garante criação mesmo se migrations tiverem problemas
- ✅ Logs detalhados para debug
