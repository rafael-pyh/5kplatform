# Proxy de Arquivos MinIO via Backend

## Problema Resolvido

O frontend estava fazendo requisições diretas ao MinIO usando URLs HTTP (`http://localhost:9000/...`), o que causava erros de **Mixed Content** quando a aplicação rodava em HTTPS (produção).

### Erro Original:
```
Mixed Content: The page at 'https://5kplatform.vercel.app/dashboard/sellers' was loaded over HTTPS, 
but requested an insecure element 'http://localhost:9000/uploads/qrcodes/...'. 
This request was automatically upgraded to HTTPS.
```

## Solução Implementada

Criamos um sistema de **proxy** onde o backend serve todos os arquivos do MinIO. Agora:

1. ✅ **Frontend nunca acessa o MinIO diretamente**
2. ✅ **Backend é o único que se comunica com o MinIO**
3. ✅ **Todas as URLs são HTTPS (em produção)**
4. ✅ **Cache otimizado (1 ano)**

## Arquitetura

```
Frontend (HTTPS)  →  Backend (HTTPS)  →  MinIO (HTTP interno)
     ↓                     ↓
Solicita imagem    Busca no MinIO
     ↓                     ↓
Recebe stream ←── Retorna stream
```

## Mudanças no Backend

### 1. Novo Controller: `file.controller.ts`
```typescript
// Serve qualquer arquivo do MinIO via proxy
GET /api/files/*
```

### 2. Atualizado `minio.ts`
```typescript
// Agora retorna apenas o caminho do arquivo
uploadFile() → "qrcodes/uuid-QR-123.png"

// Nova função para gerar URL pública
getPublicUrl() → "https://api.com/api/files/qrcodes/uuid-QR-123.png"
```

### 3. Novo Transformer: `url-transformer.ts`
```typescript
// Transforma caminhos em URLs completas do backend
transformPersonUrls(person)
transformPersonsUrls(persons)
```

### 4. Atualizado `person.controller.ts`
- Todos os endpoints agora aplicam `transformPersonUrls/transformPersonsUrls`
- Frontend recebe URLs prontas para uso

## Mudanças no Frontend

### 1. Atualizado `imageUrl.ts`
```typescript
// Removida lógica de normalização com MINIO_URL
// Backend já retorna URLs completas
normalizeImageUrl(url) → url
```

### 2. Componentes
- Nenhuma mudança necessária nos componentes
- Continuam usando as mesmas props e funções
- URLs agora vêm prontas do backend

## Variáveis de Ambiente

### Backend
```env
# Nova variável (obrigatória em produção)
API_URL=https://your-api.com

# Não mais necessário em produção
MINIO_PUBLIC_URL=http://localhost:9000
```

### Frontend
```env
# Não mais necessário
# NEXT_PUBLIC_MINIO_URL pode ser removido
```

## Rotas da API

### Arquivos Genéricos
```
GET /api/files/qrcodes/uuid-QR-123.png
GET /api/files/photos/user-photo.jpg
GET /api/files/documents/file.pdf
```

### QR Code Específico
```
GET /api/qrcode/image/:personId
```

## Benefícios

1. ✅ **Segurança**: Sem Mixed Content em HTTPS
2. ✅ **Controle**: Backend valida e controla acesso aos arquivos
3. ✅ **Performance**: Cache otimizado (max-age=31536000)
4. ✅ **Manutenibilidade**: Única fonte de verdade para URLs
5. ✅ **Escalabilidade**: Fácil adicionar autenticação/autorização futuramente

## Exemplo de Resposta da API

### Antes (problema)
```json
{
  "id": "uuid",
  "name": "João",
  "qrCodeUrl": "qrcodes/uuid-QR-123.png"
}
```
Frontend precisava adicionar `http://localhost:9000/uploads/` → ❌ Mixed Content

### Depois (solução)
```json
{
  "id": "uuid",
  "name": "João",
  "qrCodeUrl": "https://api.exemplo.com/api/files/qrcodes/uuid-QR-123.png"
}
```
Frontend usa diretamente → ✅ HTTPS seguro

## Testes

### Desenvolvimento
```bash
# Backend deve estar rodando
curl http://localhost:4000/api/files/qrcodes/uuid-QR-123.png

# Deve retornar a imagem PNG
```

### Produção
```bash
# Verificar URL do backend
curl https://your-api.com/api/files/qrcodes/uuid-QR-123.png

# Deve retornar a imagem via HTTPS
```

## Migração de Dados Existentes

Se você já tem URLs completas do MinIO no banco de dados:

```sql
-- Substituir URLs antigas por caminhos relativos
UPDATE persons 
SET qrCodeUrl = REPLACE(qrCodeUrl, 'http://localhost:9000/uploads/', '')
WHERE qrCodeUrl LIKE 'http://localhost:9000/uploads/%';
```

## Notas Importantes

- O MinIO continua rodando normalmente (interno ao backend)
- Frontend nunca precisa saber onde o MinIO está
- Em desenvolvimento local, funciona com HTTP
- Em produção, funciona com HTTPS (sem mixed content)
