# 🚀 Kit / Loja - Guia Rápido de Implementação

## 📝 Resumo Executivo

Módulo completo de Kits (produtos pré-embalados) com:
- CRUD de Produtos com múltiplas imagens
- CRUD de Kits (composição de produtos)
- Sistema de Pedidos com aprovação manual
- Comprovantes de pagamento (imagem/PDF)
- Carteira de créditos com ledger imutável
- Sistema de saque 100% manual

**Status:** ✅ Pronto para integração  
**Padrão:** MSC (Model-Service-Controller) + OOP + SOLID  
**Banco de Dados:** Sequelize-TypeScript  
**Armazenamento de Arquivos:** MinIO

---

## 📦 O que foi criado

### Models (9 novos)
```
✅ Product           - Produtos da loja
✅ ProductImage      - Múltiplas imagens por produto
✅ Kit               - Kits (agrupamentos de produtos)
✅ KitItem           - Relação Kit → Produto (com quantidade)
✅ Order             - Pedidos (com status e aprovação manual)
✅ PaymentProof      - Comprovantes de pagamento (imagem ou PDF)
✅ CreditWallet      - Carteira de créditos
✅ CreditTransaction - Ledger (extrato imutável)
✅ WithdrawalRequest - Solicitações de saque
```

### Services (5 novos)
```
✅ product.service.ts     - Lógica de CRUD de produtos
✅ kit.service.ts         - Lógica de CRUD de kits
✅ order.service.ts       - Fluxo de pedidos, aprovação, comprovantes
✅ credit.service.ts      - Carteira de créditos (ledger)
✅ withdrawal.service.ts  - Solicitações de saque
```

### Controllers (5 novos)
```
✅ product.controller.ts     - Endpoints REST de produtos
✅ kit.controller.ts         - Endpoints REST de kits
✅ order.controller.ts       - Endpoints REST de pedidos
✅ credit.controller.ts      - Endpoints REST de créditos
✅ withdrawal.controller.ts  - Endpoints REST de saques
```

### Routes (5 novos)
```
✅ product.routes.ts      - GET/POST/PUT/DELETE /api/products
✅ kit.routes.ts          - GET/POST/PUT/DELETE /api/kits
✅ order.routes.ts        - GET/POST /api/orders (+ approval)
✅ credit.routes.ts       - GET /api/credits (+ wallet/transactions)
✅ withdrawal.routes.ts   - POST/GET /api/withdrawals
```

### Configuração
```
✅ app.ts                 - Rotas registradas
✅ shop.constants.ts      - Enums e constantes
✅ shop.types.ts          - Interfaces TypeScript
```

### Documentação
```
✅ SHOP_MODULE_DOCUMENTATION.md - Documentação completa (150+ páginas)
✅ SHOP_QUICK_IMPLEMENTATION.md - Este arquivo
```

---

## 🎯 Próximos Passos para Integração

### 1️⃣ Criar Migrations (Sequelize)

```bash
# No diretório backend/

# Criar migrations para as novas tabelas
npx sequelize-cli migration:create --name create-product-table
npx sequelize-cli migration:create --name create-kit-table
npx sequelize-cli migration:create --name create-order-table
npx sequelize-cli migration:create --name create-credit-wallet-table
npx sequelize-cli migration:create --name create-withdrawal-request-table
```

### 2️⃣ Verificar Database Connection

As models usam decoradores Sequelize-TypeScript. Verifique:

```typescript
// Deve existir arquivo de configuração do Sequelize
// com conexão ao banco de dados
```

### 3️⃣ Testar Endpoints

```bash
# Iniciar servidor
npm run dev

# Testar criar produto
curl -X POST http://localhost:3001/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Painel Solar",
    "price": 599.99,
    "description": "Descrição"
  }'

# Listar produtos (público)
curl http://localhost:3001/api/products
```

### 4️⃣ Integração com Sistema Existente

**A integração é automática!** As rotas já estão registradas em `app.ts`:

```typescript
app.use("/api/products", productRoutes);
app.use("/api/kits", kitRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/credits", creditRoutes);
app.use("/api/withdrawals", withdrawalRoutes);
```

### 5️⃣ Adicionar Inicialização de Carteira

Quando uma nova `Person` é criada, inicializar sua `CreditWallet`:

```typescript
import { initializeCreditWallet } from '../services/credit.service';

// Após criar Person
const wallet = await initializeCreditWallet(person.id);
```

---

## 🔐 Autenticação

Todos os endpoints seguem middleware existente:
```typescript
import { authenticate } from "./middlewares/auth.middleware";

// Rotas públicas: SEM authenticate
router.get('/', listProductsController);

// Rotas autenticadas: COM authenticate
router.post('/', authenticate, createProductController);

// Rotas admin: COM authenticate + checkAdminRole
router.post('/', authenticate, checkAdminRole, createProductController);
```

---

## 🗄️ Banco de Dados - Relacionamentos

```
Person (1)
  ├─→ Product (1:N) - criados pelo admin
  ├─→ Order (1:N) - pedidos criados
  ├─→ CreditWallet (1:1) - sua carteira
  ├─→ CreditTransaction (1:N) - histórico de créditos
  └─→ WithdrawalRequest (1:N) - saques solicitados

Product (1)
  ├─→ ProductImage (1:N) - múltiplas imagens
  └─→ KitItem (1:N) - em quais kits está

Kit (1)
  ├─→ KitItem (1:N) - quais produtos contém
  └─→ Order (1:N) - quantos pedidos

Order (1)
  ├─→ Person - quem pediu
  ├─→ Kit - qual kit
  ├─→ PaymentProof (1:N) - comprovantes
  └─→ CreditTransaction (1:N) - se pago com créditos

CreditWallet (1)
  └─→ CreditTransaction (1:N) - ledger

WithdrawalRequest (1)
  └─→ CreditTransaction (1:N) - auditoria
```

---

## 📊 Fluxos Principais

### Fluxo 1: Comprar Kit com Comprovante
```
Usuário → Cria Pedido → Faz Transferência → Upload Comprovante 
→ Admin Aprova → Pedido Aprovado ✅
```

### Fluxo 2: Comprar Kit com Créditos
```
Usuário → Cria Pedido (com useCredit=true) 
→ Débito Automático → Admin Aprova → Pedido Aprovado ✅
```

### Fluxo 3: Sacar Créditos
```
Usuário → Solicita Saque → Admin Aprova → Admin Marca como Pago 
→ Saque Finalizado ✅
```

---

## 🔒 Regras de Negócio Críticas

### Pedidos
- ✅ Comprovante OBRIGATÓRIO se `useCredit=false`
- ✅ Dispensa comprovante se `useCredit=true`
- ✅ Código único gerado automaticamente
- ✅ Status: PENDING_PAYMENT → PENDING_APPROVAL → APPROVED

### Créditos
- ✅ NUNCA alterar `CreditWallet.balance` diretamente!
- ✅ SEMPRE criar `CreditTransaction`
- ✅ Ledger é imutável (auditoria)
- ✅ Transações: COMMISSION, KIT_PURCHASE, WITHDRAW_REQUEST, ADJUSTMENT

### Saques
- ✅ Fluxo 100% manual
- ✅ PENDING → APPROVED → PAID ou REJECTED
- ✅ Cancelamento apenas se PENDING
- ✅ Admin aprova e processa manualmente

---

## 🛠️ Configurações Importantes

### MinIO (já deve estar configurado)
```
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=5kplatform
```

### Pastas no MinIO
```
products/          - Imagens de produtos
kits/              - Imagens de kits (não implementado, mas estruturado)
payment-proofs/    - Comprovantes de pagamento
```

### Tamanhos de Upload
```
Imagens de Produto: Máx 10MB (PNG, JPEG, GIF, WebP)
Comprovantes:      Máx 20MB (PNG, JPEG, GIF, WebP, PDF)
```

---

## 🧪 Testes Rápidos

### 1. Criar Produto
```bash
TOKEN="seu_token_aqui"

curl -X POST http://localhost:3001/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Painel Solar 100W",
    "price": 599.99,
    "sku": "PS-100W",
    "description": "Eficiente e durável"
  }'
```

### 2. Listar Produtos
```bash
curl http://localhost:3001/api/products
```

### 3. Criar Kit
```bash
curl -X POST http://localhost:3001/api/kits \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Kit Solar Residencial",
    "price": 2999.99,
    "items": [
      {"productId": "uuid-do-produto", "quantity": 4}
    ]
  }'
```

### 4. Criar Pedido
```bash
curl -X POST http://localhost:3001/api/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "kitId": "uuid-do-kit",
    "useCredit": false
  }'
```

### 5. Verificar Saldo de Créditos
```bash
curl -X GET http://localhost:3001/api/credits/balance \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📚 Documentação Detalhada

Para documentação completa, consulte: [SHOP_MODULE_DOCUMENTATION.md](./SHOP_MODULE_DOCUMENTATION.md)

Contém:
- Descrição de cada endpoint
- Exemplos de requisição/resposta
- Validações
- Fluxos de negócio
- Estrutura de arquivos
- Próximos passos

---

## ⚠️ Pontos de Atenção

### 1. Migrations do Banco de Dados
- [ ] Criar migrations para as 9 novas tabelas
- [ ] Executar `npm run db:migrate`
- [ ] Verificar criação das tabelas

### 2. Inicialização de Carteira
- [ ] Quando Person é criada, executar `initializeCreditWallet(personId)`
- [ ] Garantir que toda Person tenha CreditWallet

### 3. Autenticação
- [ ] Verificar que middleware `authenticate` está funcionando
- [ ] Testar com tokens válidos e inválidos

### 4. Uploads (MinIO)
- [ ] Bucket MinIO deve estar criado
- [ ] Pasta `products/`, `kits/`, `payment-proofs/` existem
- [ ] Credenciais do MinIO estão corretas

### 5. Validações
- [ ] Todas as validações estão no Service, não no Controller
- [ ] Mensagens de erro são claras

---

## 🔄 Fluxo de Integração Recomendado

```
1. Copiar arquivos (já feito) ✅
2. Criar migrations
3. Rodar migrations
4. Inicializar wallets para pessoas existentes
5. Testar endpoints básicos
6. Integrar com frontend
7. Testar fluxo completo
8. Deploy em produção
```

---

## 🚨 Troubleshooting

### Erro: "Tabela Product não existe"
- Solução: Executar migrations (`npm run db:migrate`)

### Erro: "MinIO não conecta"
- Solução: Verificar variáveis de ambiente (.env)

### Erro: "Token inválido"
- Solução: Usar middleware `authenticate` nas rotas protegidas

### Erro: "Saldo insuficiente"
- Solução: Testar com `useCredit=false` primeiro, depois com créditos

---

## 📞 Suporte

Para dúvidas sobre implementação:
1. Consulte a documentação detalhada
2. Verifique exemplos de código nos controllers
3. Confira validações nos services

---

**Versão:** 1.0.0  
**Data:** 20 de janeiro de 2025  
**Status:** ✅ Pronto para integração  
**Próximo:** Criar migrations e testar endpoints
