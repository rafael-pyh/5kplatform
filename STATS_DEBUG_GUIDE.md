# Diagnóstico: Stats Retornando 0 em Produção - Guia Detalhado

## Novo Sistema de Logging em Arquivo

Como os logs de console não estão aparecendo em produção, foi implementado um sistema de logging em arquivo que escreve em `/tmp/5k-platform-logs/stats.log`.

### Endpoints para Diagnóstico

#### 1. **Testar se Logging Funciona**
```bash
curl -X GET "https://seu-dominio.com/api/seller-leads/test-logging" \
  -H "Authorization: Bearer SEU_TOKEN"
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "message": "Teste de logging executado - verifique os logs do servidor",
    "timestamp": "2024-01-29T...",
    "userId": "uuid...",
    "loggingWorking": true
  }
}
```

#### 2. **Visualizar Arquivo de Log**
```bash
curl -X GET "https://seu-dominio.com/api/seller-leads/debug/logs" \
  -H "Authorization: Bearer SEU_TOKEN"
```

**Resposta:**
Retorna o conteúdo do arquivo `/tmp/5k-platform-logs/stats.log` com todos os eventos registrados.

#### 3. **Obter Stats com Debug Info**
```bash
curl -X GET "https://seu-dominio.com/api/seller-leads/my-stats" \
  -H "Authorization: Bearer SEU_TOKEN"
```

Verificar o header de resposta `X-Debug-Stats` que contém:
```json
{
  "timestamp": "2024-01-29T...",
  "sellerId": "uuid...",
  "hasTotalField": true,
  "statsType": "object"
}
```

## O Que Procurar nos Logs

### Padrão de Sucesso (Funcionando)

No arquivo `/tmp/5k-platform-logs/stats.log`:
```
[2024-01-29T10:30:45.123Z] {"context":"getMyStats_start","sellerId":"uuid...","userEmail":"seller@example.com","userRole":"SELLER","timestamp":"2024-01-29T10:30:45.123Z"}
[2024-01-29T10:30:45.124Z] {"context":"getSellerLeadsStats_start","sellerId":"uuid...","cacheKey":"Lead:seller-stats:uuid...","timestamp":"2024-01-29T10:30:45.124Z"}
[2024-01-29T10:30:45.125Z] {"context":"getSellerLeadsStats_cache_miss","sellerId":"uuid...","timestamp":"2024-01-29T10:30:45.125Z"}
[2024-01-29T10:30:45.150Z] {"context":"getSellerLeadsStats_query_results","sellerId":"uuid...","total":5,"bought":1,"negotiation":3,"cancelled":1,"timestamp":"2024-01-29T10:30:45.150Z"}
[2024-01-29T10:30:45.151Z] {"context":"getSellerLeadsStats_result","sellerId":"uuid...","result":{"total":5,"bought":1,"negotiation":3,"cancelled":1,"conversionRate":"20.00%"},"timestamp":"2024-01-29T10:30:45.151Z"}
[2024-01-29T10:30:45.152Z] {"context":"getMyStats_response","sellerId":"uuid...","stats":{"total":5,"bought":1,"negotiation":3,"cancelled":1,"conversionRate":"20.00%"},"timestamp":"2024-01-29T10:30:45.152Z"}
```

### Padrão de Erro (Total = 0)

Se estiver retornando 0:
```
[2024-01-29T10:30:45.123Z] {"context":"getMyStats_start","sellerId":"uuid...","userEmail":"seller@example.com","userRole":"SELLER","timestamp":"2024-01-29T10:30:45.123Z"}
[2024-01-29T10:30:45.124Z] {"context":"getSellerLeadsStats_start","sellerId":"uuid...","cacheKey":"Lead:seller-stats:uuid...","timestamp":"2024-01-29T10:30:45.124Z"}
[2024-01-29T10:30:45.125Z] {"context":"getSellerLeadsStats_cache_miss","sellerId":"uuid...","timestamp":"2024-01-29T10:30:45.125Z"}
[2024-01-29T10:30:45.150Z] {"context":"getSellerLeadsStats_query_results","sellerId":"uuid...","total":0,"bought":0,"negotiation":0,"cancelled":0,"timestamp":"2024-01-29T10:30:45.150Z"}
[2024-01-29T10:30:45.150Z] {"context":"getSellerLeadsStats_zero_leads_debug","sellerId":"uuid...","totalLeadsInDb":5,"sample":[{"id":"lead-1","ownerId":"DIFERENTE-uuid","name":"Lead 1","isOwned":false},...],"timestamp":"2024-01-29T10:30:45.150Z"}
```

**Problema Identificado:** `isOwned: false` - o `ownerId` dos leads NÃO corresponde ao `sellerId` do token!

## Possíveis Causas (Agora Diagnosticáveis)

### 1. **ownerId dos Leads Não Corresponde ao sellerId do Token**
**Sintoma no Log:**
```json
{"context":"getSellerLeadsStats_zero_leads_debug","sample":[{"isOwned":false}...]}
```

**Solução:** Precisa sincronizar os dados no banco. Verificar:
```sql
-- Ver o sellerId do token
SELECT * FROM "Person" WHERE email = 'seller@example.com';

-- Ver quem é o owner dos leads
SELECT DISTINCT "ownerId" FROM "Lead" LIMIT 5;

-- Se não corresponder, atualizar:
UPDATE "Lead" SET "ownerId" = 'uuid-correto' WHERE "ownerId" = 'uuid-errado';
```

### 2. **Cache Armazenando Valor Antigo**
**Sintoma no Log:**
```json
{"context":"getSellerLeadsStats_start"} // Sem "cache_miss" depois
```

**Solução:** O sistema de cache detecta e invalida automaticamente. Se persistir, executar (em produção, se tiver acesso):
```javascript
// Limpar cache manualmente (em código ou via endpoint especial)
CacheInvalidationManager.invalidateModel('Lead');
```

### 3. **Erro ao Executar Query**
**Sintoma no Log:**
```json
{"context":"getSellerLeadsStats_query_error","message":"...erro de conexão..."}
```

**Solução:** Problema de conectividade com DB. Verificar:
- Conexão com PostgreSQL
- Permissões de leitura
- Pool de conexões esgotado

### 4. **sellerId Vazio/Nulo no Token**
**Sintoma no Log:**
```json
{"context":"getMyStats_start","sellerId":null,"userEmail":"..."}
```

**Solução:** Problema de autenticação. Verificar:
- Token JWT válido
- Claims do token contêm `userId`
- Servidor de autenticação gerando tokens corretamente

## Passo-a-Passo para Resolução

### Em Produção:

1. **Testar que logs estão sendo gravados:**
   ```bash
   curl https://seu-dominio.com/api/seller-leads/test-logging -H "Authorization: Bearer TOKEN"
   curl https://seu-dominio.com/api/seller-leads/debug/logs -H "Authorization: Bearer TOKEN"
   ```

2. **Se arquivo `/tmp/5k-platform-logs/stats.log` estiver vazio:**
   - Sistema de logs não está funcionando
   - Verificar permissões de escrita em `/tmp`
   - Verificar se o container tem `/tmp` montado como volume

3. **Se arquivo tem logs mas stats continua 0:**
   - Procurar por `"isOwned":false` no debug output
   - Isso significa que os leads têm um `ownerId` diferente

4. **Se encontrou mismatch de ownerId:**
   - Executar SQL para sincronizar:
   ```sql
   -- Verificar qual Person uuid está certa
   SELECT id, email, name FROM "Person" WHERE email = 'seu-email@example.com';
   
   -- Verificar qual ownerId está nos leads
   SELECT "ownerId", COUNT(*) as count FROM "Lead" GROUP BY "ownerId";
   
   -- Atualizar se necessário
   UPDATE "Lead" SET "ownerId" = 'uuid-correto' WHERE "ownerId" IS NULL OR "ownerId" = 'uuid-errado';
   ```

## Mudanças Implementadas

| Componente | Mudança | Efeito |
|-----------|--------|--------|
| `file-logger.ts` (novo) | File logging em `/tmp/5k-platform-logs/stats.log` | Logs persistem mesmo com stdout/stderr bloqueados |
| `getMyStats()` | Try/catch com fallback + file log início | Sempre retorna objeto válido, registra início |
| `getSellerLeadsStats()` | Try/catch aninhado + file log cada passo | Cada etapa é registrada mesmo se falhar |
| Response HTTP | Header `X-Debug-Stats` | Pode inspecionar via `curl -i` |
| Endpoints novos | `/debug/logs` e `/test-logging` | Diagnóstico sem acessar servidor |

## Segurança

⚠️ **IMPORTANTE:** Remover endpoints de debug em produção após diagnosticar:
- `GET /api/seller-leads/test-logging`
- `GET /api/seller-leads/debug/stats`  
- `GET /api/seller-leads/debug/logs`

Esses endpoints retornam informações sensíveis (IDs, contagens exatas, etc).

## Resumo da Solução

A solução implementada **garante que:**
1. ✅ Logs são gravados em arquivo mesmo que console seja bloqueado
2. ✅ Stats NUNCA retorna `undefined`, sempre retorna objeto válido
3. ✅ Erros são capturados e documentados em log
4. ✅ Response HTTP contém headers de debug
5. ✅ Endpoints especiais permitem diagnóstico remoto
6. ✅ Se total=0, o debug output explica por quê (mismatch de ownerId, zero leads, etc)

**Próxima ação:** Fazer deploy em staging, testar endpoints de debug, verificar arquivo de log, corrigir causa raiz.
