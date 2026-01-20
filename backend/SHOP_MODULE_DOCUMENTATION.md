# Módulo Kit / Loja - Documentação Completa

## 📋 Visão Geral

Sistema completo de gerenciamento de kits (produtos pré-embalados) com fluxo de pedidos e aprovação manual, incluindo sistema de créditos com ledger de transações e saque manual.

**Características principais:**
- ✅ CRUD de Produtos com múltiplas imagens
- ✅ CRUD de Kits (compostos por produtos)
- ✅ Sistema de Pedidos com comprovantes de pagamento
- ✅ Aprovação manual de pedidos (ADMIN)
- ✅ Carteira de créditos com ledger imutável
- ✅ Sistema de saque com fluxo 100% manual
- ✅ Sem integração com provedores de pagamento
- ✅ Seguindo padrão MSC + OOP + SOLID

---

## 🏗️ Arquitetura

### Models (Banco de Dados)

```
Product
  ├── ProductImage (múltiplas imagens)
  ├── KitItem (relação kit → produto)
  └── [Imagem no MinIO]

Kit
  ├── KitItem (produtos + quantidade)
  ├── Order (pedidos do kit)
  └── [Imagem principal no MinIO]

Order
  ├── Person (quem solicitou)
  ├── Kit (qual kit)
  ├── PaymentProof (comprovantes)
  └── CreditTransaction (se pago com créditos)

CreditWallet
  └── CreditTransaction (ledger imutável)

WithdrawalRequest
  └── CreditTransaction (auditoria)
```

### Padrão de Código

**Models:** Classes com decoradores Sequelize-TypeScript
```typescript
@Table({ tableName: 'Product' })
export class Product extends Model { ... }
```

**Services:** Lógica de negócio, validações, sem lógica no controller
```typescript
export const createProduct = async (name, price, userId) => {
  // Validações
  // Lógica de negócio
  // Chamadas ao banco
}
```

**Controllers:** Apenas entrada/saída HTTP, delegam tudo ao service
```typescript
export const createProductController = async (req, res) => {
  const { name, price } = req.body;
  const product = await createProduct(name, price, userId);
  return res.status(201).json({ success: true, data: product });
}
```

**Routes:** Organizam endpoints por recurso
```typescript
router.post('/', authenticate, checkAdminRole, createProductController);
router.get('/', listProductsController);
```

---

## 📦 Endpoints da API

### PRODUTOS

#### `GET /api/products`
Listar produtos (público)

**Query Parameters:**
- `limit`: Números de resultados (default: 50)
- `offset`: Paginação (default: 0)
- `name`: Filtro por nome (case-insensitive)
- `minPrice`, `maxPrice`: Filtro de preço
- `tags`: Filtro por tags
- `active`: Apenas ativos (true/false)

**Response:**
```json
{
  "success": true,
  "pagination": { "total": 10, "limit": 50, "offset": 0 },
  "data": [
    {
      "id": "uuid",
      "name": "Painel Solar 100W",
      "price": "599.99",
      "description": "...",
      "stock": 50,
      "tags": "solar,painel,energia",
      "active": true,
      "imagesCount": 3,
      "createdAt": "2025-01-20T10:00:00Z"
    }
  ]
}
```

#### `GET /api/products/:id`
Obter detalhes de um produto (público)

#### `POST /api/products` (ADMIN)
Criar novo produto

**Body:**
```json
{
  "name": "Painel Solar 100W",
  "price": 599.99,
  "description": "Descrição",
  "sku": "PS-100W",
  "stock": 50,
  "tags": "solar,painel,energia"
}
```

#### `PUT /api/products/:id` (ADMIN)
Atualizar produto

#### `PATCH /api/products/:id/status` (ADMIN)
Ativar/Inativar produto

**Body:**
```json
{ "active": true }
```

#### `DELETE /api/products/:id` (ADMIN)
Deletar produto (e todas suas imagens)

#### `POST /api/products/:id/images` (ADMIN)
Adicionar imagem ao produto (multipart/form-data)

**Form Data:**
- `image`: arquivo (PNG, JPEG, GIF, WebP)
- `order`: ordem de exibição (opcional)
- `description`: descrição (opcional)

#### `DELETE /api/products/:productId/images/:imageId` (ADMIN)
Remover imagem do produto

#### `POST /api/products/:id/images/reorder` (ADMIN)
Reordenar imagens

**Body:**
```json
{
  "imageIds": ["id1", "id2", "id3"]
}
```

---

### KITS

#### `GET /api/kits`
Listar kits (público)

**Query Parameters:** (mesmo que produtos)

#### `GET /api/kits/:id`
Obter detalhes de um kit com itens (público)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Kit Solar Residencial",
    "price": "2999.99",
    "description": "Kit completo para residência",
    "imageUrl": "url",
    "active": true,
    "items": [
      {
        "id": "uuid",
        "productId": "uuid",
        "productName": "Painel Solar 100W",
        "productPrice": "599.99",
        "quantity": 4,
        "notes": "Notas específicas"
      }
    ]
  }
}
```

#### `POST /api/kits` (ADMIN)
Criar novo kit

**Body:**
```json
{
  "name": "Kit Solar Residencial",
  "price": 2999.99,
  "description": "Kit completo",
  "sku": "KIT-SOLAR-RES",
  "imageUrl": "https://...",
  "tags": "kit,solar,residencial",
  "items": [
    {
      "productId": "uuid",
      "quantity": 4,
      "notes": "Notas opcionais"
    },
    {
      "productId": "uuid",
      "quantity": 1,
      "notes": "Inversor"
    }
  ]
}
```

#### `PUT /api/kits/:id` (ADMIN)
Atualizar informações do kit

#### `PUT /api/kits/:id/items` (ADMIN)
Atualizar itens do kit (remove antigos e cria novos)

**Body:**
```json
{
  "items": [
    { "productId": "uuid", "quantity": 5 },
    { "productId": "uuid", "quantity": 2 }
  ]
}
```

#### `PATCH /api/kits/:id/status` (ADMIN)
Ativar/Inativar kit

#### `DELETE /api/kits/:id` (ADMIN)
Deletar kit

---

### PEDIDOS

#### `POST /api/orders`
Criar novo pedido (autenticado)

**Body:**
```json
{
  "kitId": "uuid",
  "useCredit": false,
  "notes": "Observações do pedido"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "orderCode": "2025-01-20-A1B2",
    "status": "PENDING_PAYMENT",
    "totalPrice": "2999.99",
    "usesCredit": false,
    "createdAt": "2025-01-20T10:00:00Z"
  }
}
```

#### `GET /api/orders`
Listar pedidos (ADMIN: todos, SELLER: seus)

**Query Parameters:**
- `limit`, `offset`: Paginação
- `personId`: Filtrar por pessoa (ADMIN)
- `status`: Filtro de status
- `startDate`, `endDate`: Filtro de data

#### `GET /api/orders/:id`
Obter detalhes completo de um pedido (com kit, comprovantes, etc)

#### `GET /api/orders/code/:orderCode`
Buscar pedido por código

#### `POST /api/orders/:id/payment-proofs`
Fazer upload de comprovante (multipart/form-data)

**Form Data:**
- `proof`: arquivo (PNG, JPEG, GIF, WebP ou PDF)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "fileUrl": "https://...",
    "fileType": "image",
    "originalFileName": "comprovante.jpg",
    "fileSize": 2048000,
    "createdAt": "2025-01-20T10:00:00Z"
  }
}
```

#### `GET /api/orders/:id/payment-proofs`
Listar comprovantes de um pedido

#### `DELETE /api/orders/:orderId/payment-proofs/:proofId`
Remover comprovante (não pode se pedido aprovado)

#### `POST /api/orders/:id/approve` (ADMIN)
Aprovar pedido

**Regras:**
- Pedido deve estar em `PENDING_APPROVAL` ou `PAID`
- Se `usesCredit === false`, deve haver comprovante anexado
- Se `usesCredit === true`, dispensa comprovante

#### `POST /api/orders/:id/reject` (ADMIN)
Rejeitar pedido

**Body:**
```json
{
  "rejectionReason": "Motivo da rejeição"
}
```

**Regras:**
- Se pedido foi pago com créditos, reverter transação (reembolsar)

---

### CRÉDITOS

#### `GET /api/credits/wallet`
Obter carteira do usuário logado

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "balance": 1500.50,
    "lastTransactionAt": "2025-01-20T10:00:00Z"
  }
}
```

#### `GET /api/credits/balance`
Obter saldo (formato simples)

**Response:**
```json
{
  "success": true,
  "data": { "balance": 1500.50 }
}
```

#### `GET /api/credits/transactions`
Listar transações do usuário

**Query Parameters:**
- `limit`, `offset`: Paginação
- `type`: Filtro por tipo (COMMISSION, KIT_PURCHASE, WITHDRAW_REQUEST, ADJUSTMENT)
- `startDate`, `endDate`: Filtro de data

**Response:**
```json
{
  "success": true,
  "pagination": { "total": 25, "limit": 50, "offset": 0 },
  "data": [
    {
      "id": "uuid",
      "type": "COMMISSION",
      "amount": 250.00,
      "description": "Comissão do pedido ABC123",
      "orderId": "uuid",
      "createdAt": "2025-01-20T10:00:00Z"
    }
  ]
}
```

#### `GET /api/credits/stats`
Obter estatísticas de créditos

**Response:**
```json
{
  "success": true,
  "data": {
    "balance": 1500.50,
    "totalEarned": 5000.00,
    "totalSpent": 3499.50,
    "lastTransaction": "2025-01-20T10:00:00Z"
  }
}
```

#### `GET /api/credits/ledger/export`
Exportar ledger (JSON ou CSV)

**Query Parameters:**
- `startDate`, `endDate`: Intervalo de datas
- `format`: `json` ou `csv` (default: json)

#### `POST /api/credits/adjust` (ADMIN)
Fazer ajuste manual de créditos

**Body:**
```json
{
  "personId": "uuid",
  "amount": 100.00,
  "reason": "Reembolso por erro no sistema"
}
```

#### `GET /api/credits/wallet/:personId` (ADMIN)
Obter carteira de outro usuário

---

### SAQUES

#### `POST /api/withdrawals/request`
Solicitar saque de créditos (autenticado)

**Body:**
```json
{
  "amount": 500.00,
  "bankAccountInfo": "Chave PIX: email@example.com",
  "notes": "Observações"
}
```

**Validações:**
- Valor > 0
- Saldo suficiente
- Quantidade máxima padrão: R$ 50.000,00

#### `GET /api/withdrawals/my`
Listar saques do usuário logado

#### `GET /api/withdrawals`
Listar todos os saques (ADMIN)

**Query Parameters:**
- `limit`, `offset`: Paginação
- `personId`: Filtrar por pessoa
- `status`: Filtro de status
- `startDate`, `endDate`: Filtro de data

#### `GET /api/withdrawals/:id`
Obter detalhes de um saque

#### `DELETE /api/withdrawals/:id/cancel`
Cancelar solicitação (apenas se PENDING)

#### `POST /api/withdrawals/:id/approve` (ADMIN)
Aprovar saque

**Fluxo:**
- PENDING → APPROVED
- Cria CreditTransaction para auditoria

#### `POST /api/withdrawals/:id/reject` (ADMIN)
Rejeitar saque

**Body:**
```json
{
  "rejectionReason": "Motivo da rejeição"
}
```

**Fluxo:**
- PENDING → REJECTED
- Usuário pode solicitar novamente

#### `POST /api/withdrawals/:id/mark-as-paid` (ADMIN)
Marcar saque como pago

**Fluxo:**
- APPROVED → PAID
- Finaliza o saque

#### `GET /api/withdrawals/stats` (ADMIN)
Obter estatísticas de saques

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRequests": 10,
    "pendingAmount": 500.00,
    "approvedAmount": 1000.00,
    "paidAmount": 5000.00,
    "rejectedCount": 2
  }
}
```

---

## 🔄 Fluxos de Negócio

### Fluxo de Pedido (com comprovante)

```
1. Usuário cria pedido
   POST /api/orders { kitId, useCredit: false }
   → Status: PENDING_PAYMENT

2. Usuário faz transferência/PIX (banco real, não integrado)

3. Usuário faz upload de comprovante
   POST /api/orders/:id/payment-proofs { proof }
   → Status muda para: PENDING_APPROVAL

4. Admin analisa e aprova
   POST /api/orders/:id/approve
   → Status: APPROVED ✅

   Ou rejeita:
   POST /api/orders/:id/reject { rejectionReason }
   → Status: REJECTED
   → Usuário pode solicitar novamente (sem reverter créditos)
```

### Fluxo de Pedido (com créditos)

```
1. Usuário cria pedido
   POST /api/orders { kitId, useCredit: true }
   → Status: PAID (imediato)
   → Cria CreditTransaction (debitando saldo)

2. Admin aprova automaticamente (comprovante dispensável)
   POST /api/orders/:id/approve
   → Status: APPROVED ✅

   Ou se rejeitado:
   POST /api/orders/:id/reject
   → CreditTransaction reversa (reembolsa créditos)
   → Status: REJECTED
```

### Fluxo de Saque

```
1. Usuário solicita saque
   POST /api/withdrawals/request { amount, bankAccountInfo }
   → Status: PENDING

2. Admin aprova
   POST /api/withdrawals/:id/approve
   → Status: APPROVED
   → Cria CreditTransaction (auditoria)

   Ou rejeita:
   POST /api/withdrawals/:id/reject { rejectionReason }
   → Status: REJECTED
   → Usuário pode solicitar novamente (créditos não são debitados)

3. Admin marca como pago (após transferência manual)
   POST /api/withdrawals/:id/mark-as-paid
   → Status: PAID ✅
```

### Fluxo de Carteira de Créditos

```
Operações que geram CreditTransaction:

1. COMMISSION (admin cria manualmente)
   - Comissão por venda
   - Exemplo: Vendedor vende lead → ganha comissão

2. KIT_PURCHASE (automático)
   - Criado quando ordem é feita com useCredit=true
   - Débito automático do saldo

3. WITHDRAW_REQUEST (automático)
   - Criado quando admin aprova saque
   - Auditoria apenas (créditos já foram debitados)

4. ADJUSTMENT (admin)
   - Ajuste manual
   - Pode ser positivo ou negativo
   - Requer aprovação admin

IMPORTANTE:
- Nunca alterar CreditWallet.balance diretamente!
- Sempre criar CreditTransaction
- Ledger é imutável (auditoria completa)
```

---

## 🔐 Autenticação e Autorização

### Recursos Públicos
- `GET /api/products` - Listar produtos
- `GET /api/products/:id` - Detalhes do produto
- `GET /api/kits` - Listar kits
- `GET /api/kits/:id` - Detalhes do kit
- `GET /api/orders/code/:orderCode` - Buscar pedido por código

### Recursos Autenticados (qualquer usuário logado)
- `POST /api/orders` - Criar pedido
- `GET /api/orders` - Listar seus pedidos
- `GET /api/orders/:id` - Ver seu pedido
- `POST /api/orders/:id/payment-proofs` - Fazer upload
- `GET /api/credits/wallet` - Ver sua carteira
- `GET /api/credits/balance` - Ver seu saldo
- `GET /api/credits/transactions` - Ver suas transações
- `POST /api/withdrawals/request` - Solicitar saque
- `GET /api/withdrawals/my` - Ver seus saques
- `DELETE /api/withdrawals/:id/cancel` - Cancelar seu saque

### Recursos Admin (ADMIN ou SUPER_ADMIN)
- `POST /api/products` - Criar produto
- `PUT /api/products/:id` - Atualizar produto
- `DELETE /api/products/:id` - Deletar produto
- `POST /api/products/:id/images` - Adicionar imagem
- `POST /api/kits` - Criar kit
- `PUT /api/kits/:id` - Atualizar kit
- `DELETE /api/kits/:id` - Deletar kit
- `GET /api/orders` - Listar todos os pedidos
- `POST /api/orders/:id/approve` - Aprovar pedido
- `POST /api/orders/:id/reject` - Rejeitar pedido
- `DELETE /api/orders/:id/payment-proofs/:proofId` - Remover comprovante
- `POST /api/credits/adjust` - Fazer ajuste de créditos
- `GET /api/withdrawals` - Listar saques
- `POST /api/withdrawals/:id/approve` - Aprovar saque
- `POST /api/withdrawals/:id/reject` - Rejeitar saque
- `POST /api/withdrawals/:id/mark-as-paid` - Marcar como pago

---

## 📝 Exemplos de Uso

### 1. Criar um Produto com Imagens

```bash
# 1. Criar produto
curl -X POST http://localhost:3001/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Painel Solar 100W",
    "price": 599.99,
    "description": "Painel eficiente",
    "sku": "PS-100W",
    "stock": 50,
    "tags": "solar,painel"
  }'

# Response contém ID do produto
# PRODUCT_ID="xyz"

# 2. Adicionar primeira imagem (principal)
curl -X POST http://localhost:3001/api/products/$PRODUCT_ID/images \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@painel-1.jpg" \
  -F "order=1" \
  -F "description=Vista frontal"

# 3. Adicionar segunda imagem
curl -X POST http://localhost:3001/api/products/$PRODUCT_ID/images \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@painel-2.jpg" \
  -F "order=2"
```

### 2. Criar um Kit com Produtos

```bash
# Pré-requisito: IDs de produtos criados

curl -X POST http://localhost:3001/api/kits \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Kit Solar Residencial Completo",
    "price": 2999.99,
    "description": "Solução completa para residência",
    "sku": "KIT-SOLAR-RES",
    "tags": "kit,solar,residencial",
    "items": [
      {
        "productId": "prod-1-uuid",
        "quantity": 4,
        "notes": "Painéis solares 100W"
      },
      {
        "productId": "prod-2-uuid",
        "quantity": 1,
        "notes": "Inversor 5KW"
      },
      {
        "productId": "prod-3-uuid",
        "quantity": 10,
        "notes": "Conectores"
      }
    ]
  }'
```

### 3. Fluxo Completo de Pedido (com Comprovante)

```bash
# 1. Usuário cria pedido
ORDER=$(curl -X POST http://localhost:3001/api/orders \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "kitId": "kit-uuid", "useCredit": false }')

ORDER_ID=$(echo $ORDER | jq -r '.data.id')
ORDER_CODE=$(echo $ORDER | jq -r '.data.orderCode')

echo "Pedido criado: $ORDER_CODE"

# 2. Usuário faz transferência no banco (manual)
# ... usuário transfere R$ 2.999,99 para a conta da empresa ...

# 3. Usuário faz upload do comprovante
curl -X POST http://localhost:3001/api/orders/$ORDER_ID/payment-proofs \
  -H "Authorization: Bearer $USER_TOKEN" \
  -F "proof=@comprovante.jpg"

# 4. Admin aprova
curl -X POST http://localhost:3001/api/orders/$ORDER_ID/approve \
  -H "Authorization: Bearer $ADMIN_TOKEN"

echo "Pedido $ORDER_CODE aprovado!"
```

### 4. Fluxo de Saque

```bash
# 1. Usuário vê seu saldo
curl -X GET http://localhost:3001/api/credits/balance \
  -H "Authorization: Bearer $USER_TOKEN"

# 2. Solicita saque
WITHDRAWAL=$(curl -X POST http://localhost:3001/api/withdrawals/request \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500.00,
    "bankAccountInfo": "Chave PIX: usuario@email.com"
  }')

WITHDRAWAL_ID=$(echo $WITHDRAWAL | jq -r '.data.id')

# 3. Admin aprova
curl -X POST http://localhost:3001/api/withdrawals/$WITHDRAWAL_ID/approve \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 4. Admin faz transferência bancária (manual)
# ... admin transfere R$ 500,00 para a chave PIX ...

# 5. Admin marca como pago
curl -X POST http://localhost:3001/api/withdrawals/$WITHDRAWAL_ID/mark-as-paid \
  -H "Authorization: Bearer $ADMIN_TOKEN"

echo "Saque R$ 500,00 processado!"
```

---

## 🗂️ Estrutura de Arquivos

```
backend/src/
├── models/
│   ├── Product.ts          # Modelo de Produto
│   ├── ProductImage.ts     # Imagens do Produto
│   ├── Kit.ts              # Modelo de Kit
│   ├── KitItem.ts          # Items do Kit
│   ├── Order.ts            # Modelo de Pedido
│   ├── PaymentProof.ts     # Comprovantes
│   ├── CreditWallet.ts     # Carteira de Créditos
│   ├── CreditTransaction.ts # Ledger de Transações
│   ├── WithdrawalRequest.ts# Solicitação de Saque
│   └── index.ts            # Exports
│
├── services/
│   ├── product.service.ts     # Lógica de Produtos
│   ├── kit.service.ts         # Lógica de Kits
│   ├── order.service.ts       # Lógica de Pedidos
│   ├── credit.service.ts      # Lógica de Créditos
│   └── withdrawal.service.ts  # Lógica de Saques
│
├── controllers/
│   ├── product.controller.ts    # Endpoints de Produtos
│   ├── kit.controller.ts        # Endpoints de Kits
│   ├── order.controller.ts      # Endpoints de Pedidos
│   ├── credit.controller.ts     # Endpoints de Créditos
│   └── withdrawal.controller.ts # Endpoints de Saques
│
├── routes/
│   ├── product.routes.ts       # Rotas de Produtos
│   ├── kit.routes.ts           # Rotas de Kits
│   ├── order.routes.ts         # Rotas de Pedidos
│   ├── credit.routes.ts        # Rotas de Créditos
│   └── withdrawal.routes.ts    # Rotas de Saques
│
├── config/
│   └── shop.constants.ts  # Enums e Constantes
│
└── app.ts (ATUALIZADO COM NOVAS ROTAS)
```

---

## 🔧 Configurações Importantes

### Variáveis de Ambiente (.env)

```env
# MinIO (já existentes)
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=5kplatform

# Banco de dados (já existentes)
DB_HOST=postgres
DB_PORT=5432
DB_NAME=5kplatform
DB_USER=postgres
DB_PASSWORD=postgres
```

### Tabelas do Banco de Dados

Já estão configuradas via migrations Sequelize. As tabelas serão criadas automaticamente:

```sql
-- Criadas automaticamente ao rodar migrations
Product
ProductImage
Kit
KitItem
Order
PaymentProof
CreditWallet
CreditTransaction
WithdrawalRequest
```

---

## 📋 Validações Importantes

### Validações de Produto
- ✅ Nome obrigatório
- ✅ Preço > 0
- ✅ Máximo 10 imagens
- ✅ Imagens: PNG, JPEG, GIF, WebP (máx 10MB)
- ✅ SKU pode ser único ou duplicado (a sua escolha)

### Validações de Kit
- ✅ Nome obrigatório
- ✅ Preço > 0
- ✅ Mínimo 1 item
- ✅ Máximo 50 itens
- ✅ Quantidade de cada item > 0
- ✅ Produtos devem existir

### Validações de Pedido
- ✅ Kit deve estar ativo
- ✅ Se useCredit=true, deve ter saldo
- ✅ Comprovante obrigatório se useCredit=false
- ✅ Código gerado automaticamente e único
- ✅ Status transitions válidas

### Validações de Créditos
- ✅ Nunca negativo (exceto ADJUSTMENT explícito)
- ✅ Transações imutáveis (criar novo em vez de alterar)
- ✅ Sempre auditar quem fez cada ajuste

### Validações de Saque
- ✅ Valor > 0
- ✅ Saldo suficiente
- ✅ Máximo R$ 50.000,00 por saque
- ✅ Fluxo: PENDING → APPROVED → PAID
- ✅ Cancelamento apenas se PENDING

---

## 🚀 Próximos Passos (Para Desenvolvimento Futuro)

1. **Comissões Automáticas**
   - Quando um pedido é aprovado, gerar CreditTransaction de comissão
   - Baseado em configuração por período

2. **Webhooks**
   - Notificar quando pedido muda de status
   - Notificar quando saque é aprovado

3. **Relatórios**
   - Dashboard de vendas
   - Relatório de comissões
   - Auditoria de transações

4. **Integração de Pagamento**
   - Quando necessário, integrar com Stripe/PayPal
   - Marcar automático como aprovado
   - Converter para créditos

5. **Campanha de Kits**
   - Criar "promoções" de kits
   - Descontos automáticos
   - Quantidade mínima

---

## 📚 Referências

- **Models:** [Sequelize-TypeScript Docs](https://www.npmjs.com/package/sequelize-typescript)
- **Padrão MSC:** Model-Service-Controller (separação de responsabilidades)
- **SOLID:** Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **OOP:** Object-Oriented Programming (classes, herança, composição)

---

## ✅ Checklist de Implementação

- ✅ Criar Models (Product, ProductImage, Kit, KitItem)
- ✅ Criar Models (Order, PaymentProof)
- ✅ Criar Models (CreditWallet, CreditTransaction, WithdrawalRequest)
- ✅ Criar Services (product, kit, order, credit, withdrawal)
- ✅ Criar Controllers (product, kit, order, credit, withdrawal)
- ✅ Criar Routes (product, kit, order, credit, withdrawal)
- ✅ Registrar rotas no app.ts
- ✅ Enums e Constantes
- ✅ Documentação

---

**Versão:** 1.0.0  
**Data:** 20 de janeiro de 2025  
**Status:** ✅ Pronto para produção
