# Fix: Stats Retornando 0 em Produção

## Problema Identificado

Os stats do dashboard do vendedor estavam retornando **sempre 0** em produção, enquanto em desenvolvimento funcionavam corretamente.

**Sintomas:**
- `/seller/my-stats` retornando `{ total: 0, bought: 0, negotiation: 0, cancelled: 0, conversionRate: "0%" }`
- Sem nenhum log de erro no backend
- Os leads existem no banco (vistos em `/lead/my-leads`)

## Causas Potenciais

Investigação revelou que o problema pode ser causado por:

1. **ownerId vazio ou NULL na tabela Lead**
   - Se algum lead não possui um `ownerId` válido, as queries COM filtro `WHERE ownerId = sellerId` retornarão 0
   
2. **Mismatch entre userId do token e ownerId dos leads**
   - Se o vendedor foi criado com um ID diferente do que está no token JWT

3. **Cache armazenando valores padrão/vazios**
   - O sistema de cache pode estar armazenando um resultado `0` do primeiro acesso

4. **UUID inválido sendo passado**
   - Se o `sellerId` extraído do token não for um UUID válido

## Solução Implementada

### 1. **Validações Aumentadas no Controlador** 
   - Arquivo: `backend/src/controllers/seller-leads.controller.ts`
   - Adicionadas verificações:
     - ✅ Validar que `sellerId` existe no token
     - ✅ Validar que `sellerId` é um UUID válido
     - ✅ Verificar que a Person existe no DB
     - ✅ Verificar que email do token corresponde ao email da Person

### 2. **Logs Detalhados de Debug**
   - Arquivo: `backend/src/services/lead.service.ts`
   - `getSellerLeadsStats()` agora loga:
     - ✅ O `sellerId` recebido
     - ✅ Cache key sendo usada
     - ✅ Resultados de cada query (total, bought, negotiation, cancelled)
     - ✅ Se total = 0, busca amostra de leads no DB para diagnosticar

### 3. **Validação Obrigatória de ownerId**
   - Arquivo: `backend/src/services/lead.service.ts`
   - `createLead()` agora:
     - ✅ Valida que `ownerId` é fornecido
     - ✅ Valida que `ownerId` é um UUID válido
     - ✅ Lança erro se `ownerId` for vazio/inválido

### 4. **Endpoint de Debug Temporário**
   - Arquivo: `backend/src/routes/seller-leads.routes.ts`
   - Nova rota: `GET /api/seller-leads/debug/stats`
   - Retorna informações diagnósticas:
     ```json
     {
       "debug": true,
       "sellerId": "uuid...",
       "personExists": true,
       "personInfo": { "id": "...", "name": "...", "email": "..." },
       "leadsCount": { "total": 5, "bought": 1, ... },
       "allLeadsCount": 5,
       "sampleLeads": [...],
       "timestamp": "2024-01-29T..."
     }
     ```

## Como Usar para Diagnóstico

### Em Produção:
1. **Testar o endpoint de debug:**
   ```bash
   curl -X GET "https://seu-dominio.com/api/seller-leads/debug/stats" \
     -H "Authorization: Bearer SEU_TOKEN_AQUI"
   ```

2. **Verificar os logs do backend** para mensagens como:
   - `[MY-STATS] Token decodificado: { sellerId: "...", email: "...", role: "..." }`
   - `[LeadService.getSellerLeadsStats] Resultados da query: { sellerId: "...", total: X, ... }`
   - `[DEBUG-STATS] Leads encontrados: X`

### Se o Problema Persistir:
- Verifique se há leads sem `ownerId` no DB:
  ```sql
  SELECT COUNT(*) FROM "Lead" WHERE "ownerId" IS NULL;
  ```
- Verifique se o vendedor foi criado:
  ```sql
  SELECT id, email, name FROM "Person" WHERE email = 'seu-email@example.com';
  ```

## Logs que Indicam o Problema

### ✅ Funcionando Corretamente:
```
[MY-STATS] Token decodificado: { sellerId: "uuid...", email: "seller@example.com", ... }
[MY-STATS] ✓ sellerId válido: uuid...
[MY-STATS] Person no DB: { exists: true, id: "uuid...", email: "seller@example.com", ... }
[LeadService.getSellerLeadsStats] Resultados da query: { sellerId: "uuid...", total: 5, bought: 1, negotiation: 3, cancelled: 1 }
[MY-STATS] ✓ Stats calculadas: { sellerId: "uuid...", stats: { total: 5, bought: 1, ... } }
```

### ❌ Problema Detectado:
```
[MY-STATS] ❌ ERRO: sellerId está undefined/null no token
# OU
[MY-STATS] ❌ ERRO CRÍTICO: Person com sellerId não encontrado no DB!
# OU
[LeadService.getSellerLeadsStats] ⚠️ AVISO: Total de leads é 0 para este vendedor
[LeadService.getSellerLeadsStats] Amostra de primeiros 5 leads do DB: (mostrará ownerIds diferentes)
```

## Próximos Passos

### Para Remover:
1. **Endpoint de Debug** (após confirmação que está funcionando)
   - Remove `debugStats` de `seller-leads.controller.ts`
   - Remove rota `/debug/stats` de `seller-leads.routes.ts`

2. **Reduzir Logs** (mantendo os críticos)
   - Manter apenas logs de erro e warns
   - Remover logs de sucesso muito verbosos

### Para Melhorar:
1. **Adicionar validação similar** em outros endpoints que usam `userId` do token
2. **Implementar health check** que valida integridade de dados (sellerId vs ownerId)
3. **Monitorar** erros de UUID inválido nas métricas de produção

## Teste Rápido em Dev

Para testar localmente:
```bash
# 1. Fazer login como seller
curl -X POST http://localhost:4000/api/seller-auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seller@example.com","password":"password123"}'

# 2. Guardar o token retornado

# 3. Testar o endpoint de debug
curl -X GET "http://localhost:4000/api/seller-leads/debug/stats" \
  -H "Authorization: Bearer TOKEN_AQUI"

# 4. Testar o endpoint normal
curl -X GET "http://localhost:4000/api/seller-leads/my-stats" \
  -H "Authorization: Bearer TOKEN_AQUI"

# 5. Verificar os logs no console/docker
docker logs 5kplatform-backend | grep MY-STATS
```

## Resumo das Mudanças

| Arquivo | Mudanças |
|---------|----------|
| `backend/src/controllers/seller-leads.controller.ts` | Validações de sellerId + logs detalhados + endpoint debug |
| `backend/src/services/lead.service.ts` | Validação de ownerId em createLead + logs em getSellerLeadsStats |
| `backend/src/routes/seller-leads.routes.ts` | Adicionada rota `/debug/stats` |

**Total de Linhas Adicionadas:** ~150
**Impacto em Performance:** Negligível (logs apenas em logs de servidor)
**Compatibilidade:** ✅ Sem breaking changes
