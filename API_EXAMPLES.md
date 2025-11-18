# 🧪 Exemplos de Uso da API - 5K Platform

Este arquivo contém exemplos práticos de como usar cada endpoint da API.

## 🔐 Autenticação

### 1. Criar primeiro usuário admin

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@5kplatform.com",
    "password": "admin123",
    "name": "Administrador Principal",
    "role": "SUPER_ADMIN"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@5kplatform.com",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx...",
      "email": "admin@5kplatform.com",
      "name": "Administrador Principal",
      "role": "SUPER_ADMIN"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**⚠️ Salve o token! Use em todas as requisições protegidas:**
```
Authorization: Bearer SEU_TOKEN_AQUI
```

---

## 👥 Vendedores

### 3. Criar um vendedor

```bash
curl -X POST http://localhost:4000/api/person \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "phone": "(11) 99999-9999",
    "pixKey": "joao@exemplo.com"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "phone": "(11) 99999-9999",
    "pixKey": "joao@exemplo.com",
    "qrCode": "QR-1234567890-abc123",
    "qrCodeUrl": "/uploads/qrcodes/clx...-QR-1234567890-abc123.png",
    "active": true,
    "scanCount": 0
  }
}
```

### 4. Listar todos os vendedores

```bash
curl -X GET http://localhost:4000/api/person \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 5. Listar apenas vendedores ativos

```bash
curl -X GET "http://localhost:4000/api/person?active=true" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 6. Buscar vendedor específico

```bash
curl -X GET http://localhost:4000/api/person/ID_DO_VENDEDOR \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 7. Ver estatísticas de um vendedor

```bash
curl -X GET http://localhost:4000/api/person/ID_DO_VENDEDOR/stats \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "name": "João Silva",
    "scanCount": 15,
    "leads": {
      "total": 8,
      "bought": 2,
      "negotiation": 5,
      "cancelled": 1
    },
    "conversionRate": "25.00%"
  }
}
```

### 8. Atualizar vendedor

```bash
curl -X PUT http://localhost:4000/api/person/ID_DO_VENDEDOR \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "name": "João Silva Santos",
    "phone": "(11) 88888-8888"
  }'
```

### 9. Desativar vendedor

```bash
curl -X PUT http://localhost:4000/api/person/ID_DO_VENDEDOR \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "active": false
  }'
```

### 10. Deletar vendedor (soft delete)

```bash
curl -X DELETE http://localhost:4000/api/person/ID_DO_VENDEDOR \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 📋 Leads

### 11. Criar lead manualmente (admin)

```bash
curl -X POST http://localhost:4000/api/lead \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "name": "Maria Santos",
    "email": "maria@exemplo.com",
    "phone": "(11) 77777-7777",
    "ownerId": "ID_DO_VENDEDOR"
  }'
```

### 12. Listar todos os leads

```bash
curl -X GET http://localhost:4000/api/lead \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 13. Filtrar leads por status

```bash
curl -X GET "http://localhost:4000/api/lead?status=NEGOTIATION" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

Valores válidos: `BOUGHT`, `NEGOTIATION`, `CANCELLED`

### 14. Filtrar leads por vendedor

```bash
curl -X GET "http://localhost:4000/api/lead?ownerId=ID_DO_VENDEDOR" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 15. Ver leads de um vendedor (simplificado)

```bash
curl -X GET http://localhost:4000/api/lead/owner/ID_DO_VENDEDOR \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

**Response (para o vendedor ver):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "name": "Maria Santos",
      "status": "NEGOTIATION",
      "createdAt": "2025-11-18T10:30:00.000Z"
    }
  ]
}
```

### 16. Ver detalhes de um lead

```bash
curl -X GET http://localhost:4000/api/lead/ID_DO_LEAD \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 17. Atualizar lead

```bash
curl -X PUT http://localhost:4000/api/lead/ID_DO_LEAD \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "notes": "Cliente interessado em sistema de 10kW"
  }'
```

### 18. Atualizar status do lead

```bash
curl -X PATCH http://localhost:4000/api/lead/ID_DO_LEAD/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "status": "BOUGHT"
  }'
```

### 19. Ver estatísticas gerais de leads

```bash
curl -X GET http://localhost:4000/api/lead/stats \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 20. Ver novos leads (últimos 7 dias)

```bash
curl -X GET "http://localhost:4000/api/lead/new?days=7" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 📱 QR Code (Endpoints Públicos)

### 21. Buscar vendedor por QR Code

```bash
curl -X GET http://localhost:4000/api/person/qr/QR-1234567890-abc123
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "name": "João Silva",
    "qrCode": "QR-1234567890-abc123",
    "active": true
  }
}
```

### 22. Registrar scan do QR Code

```bash
curl -X POST http://localhost:4000/api/qrcode/scan/QR-1234567890-abc123
```

**Response:**
```json
{
  "success": true,
  "data": {
    "personId": "clx...",
    "personName": "João Silva",
    "message": "QR Code escaneado com sucesso"
  }
}
```

### 23. Criar lead via QR Code (formulário público)

```bash
curl -X POST http://localhost:4000/api/qrcode/lead/QR-1234567890-abc123 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pedro Oliveira",
    "email": "pedro@exemplo.com",
    "phone": "(11) 66666-6666",
    "energyBill": "/uploads/energy-bills/conta-123.pdf",
    "roofPhoto": "/uploads/roof-photos/telhado-123.jpg"
  }'
```

---

## 📤 Upload de Arquivos

### 24. Upload de foto de perfil (protegido)

```bash
curl -X POST http://localhost:4000/api/upload/profile \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -F "file=@/caminho/para/foto.jpg"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "/uploads/profiles/1700000000000-foto.jpg"
  }
}
```

### 25. Upload de conta de energia (público)

```bash
curl -X POST http://localhost:4000/api/upload/energy-bill \
  -F "file=@/caminho/para/conta.pdf"
```

### 26. Upload de foto do telhado (público)

```bash
curl -X POST http://localhost:4000/api/upload/roof-photo \
  -F "file=@/caminho/para/telhado.jpg"
```

---

## 📊 Estatísticas de QR Code

### 27. Ver histórico de scans de um vendedor

```bash
curl -X GET http://localhost:4000/api/qrcode/scans/ID_DO_VENDEDOR \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 28. Ver estatísticas de scans

```bash
curl -X GET http://localhost:4000/api/qrcode/stats \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "today": 12,
    "thisWeek": 45,
    "thisMonth": 150
  }
}
```

### 29. Ver estatísticas de scans de um vendedor específico

```bash
curl -X GET "http://localhost:4000/api/qrcode/stats?personId=ID_DO_VENDEDOR" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 🔧 Fluxo Completo de Teste

### Passo 1: Setup inicial
```bash
# 1. Fazer login
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@5kplatform.com","password":"admin123"}' \
  | jq -r '.data.token')

echo "Token: $TOKEN"
```

### Passo 2: Criar vendedor
```bash
# 2. Criar vendedor
PERSON=$(curl -s -X POST http://localhost:4000/api/person \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "João Teste",
    "email": "joao@teste.com",
    "phone": "(11) 99999-9999",
    "pixKey": "joao@teste.com"
  }')

PERSON_ID=$(echo $PERSON | jq -r '.data.id')
QR_CODE=$(echo $PERSON | jq -r '.data.qrCode')

echo "Vendedor ID: $PERSON_ID"
echo "QR Code: $QR_CODE"
```

### Passo 3: Simular scan público
```bash
# 3. Simular scan do QR Code
curl -X POST http://localhost:4000/api/qrcode/scan/$QR_CODE
```

### Passo 4: Criar lead via QR
```bash
# 4. Criar lead via QR Code
curl -X POST http://localhost:4000/api/qrcode/lead/$QR_CODE \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cliente Teste",
    "email": "cliente@teste.com",
    "phone": "(11) 88888-8888"
  }'
```

### Passo 5: Ver estatísticas
```bash
# 5. Ver estatísticas do vendedor
curl -X GET http://localhost:4000/api/person/$PERSON_ID/stats \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## 🌐 Testando com Postman/Insomnia

### Configuração de Environment

Crie as seguintes variáveis:

- `base_url`: `http://localhost:4000`
- `token`: (será preenchido após login)

### Collection sugerida:

1. **Auth**
   - POST Login
   - POST Register

2. **Person**
   - POST Create Person
   - GET List Persons
   - GET Person by ID
   - GET Person Stats
   - PUT Update Person
   - DELETE Delete Person

3. **Lead**
   - POST Create Lead
   - GET List Leads
   - GET Lead by ID
   - PATCH Update Lead Status
   - GET Lead Stats

4. **QR Code (Public)**
   - POST Scan QR
   - POST Create Lead from QR

5. **Upload**
   - POST Upload Profile Photo
   - POST Upload Energy Bill
   - POST Upload Roof Photo

---

## 🐛 Troubleshooting

### Erro 401 - Unauthorized
- Certifique-se de incluir o token no header
- Verifique se o token não expirou
- Formato: `Authorization: Bearer SEU_TOKEN`

### Erro 404 - Not Found
- Verifique se a URL está correta
- Verifique se o ID existe no banco

### Erro 400 - Bad Request
- Verifique o formato dos dados enviados
- Certifique-se de que todos os campos obrigatórios foram preenchidos

### Erro 500 - Internal Server Error
- Verifique os logs do servidor
- Certifique-se de que o banco está acessível
- Verifique se o MinIO está rodando

---

## 📝 Notas

- Todos os endpoints retornam JSON
- Use `Content-Type: application/json` para requisições com body
- Para upload de arquivos, use `Content-Type: multipart/form-data`
- Tokens JWT expiram em 7 dias (configurável no .env)