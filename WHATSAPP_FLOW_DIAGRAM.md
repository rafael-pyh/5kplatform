# Diagrama do Fluxo - Sistema de Templates de WhatsApp

## 🔄 Fluxo de Criação de Template (ADMIN)

```
┌─────────────────────────────────────────────────────────────┐
│                  ADMIN CRIAR TEMPLATE                        │
└─────────────────────────────────────────────────────────────┘

    1. Admin acessa /dashboard/whatsapp-templates
                     │
                     ↓
    2. Clica "Novo Template"
                     │
                     ↓
    ┌──────────────────────────────────────────┐
    │  WhatsappTemplateModal abre              │
    │  - Campo de nome                         │
    │  - Campo de mensagem                     │
    │  - Botão inserir {{CUSTOMER_NAME}}       │
    │  - Preview em tempo real                 │
    └──────────────────────────────────────────┘
                     │
                     ↓
    3. Admin preenche dados
       Nome: "Saudação Padrão"
       Message: "Olá {{CUSTOMER_NAME}}, tudo bem?"
                     │
                     ↓
    4. Valida (deve conter {{CUSTOMER_NAME}})
                     │
                     ↓
    5. Clica "Salvar Template"
                     │
                     ↓
    ┌──────────────────────────────────────────┐
    │  Frontend envia POST                     │
    │  /api/whatsapp-templates/admin           │
    │  {                                       │
    │    name: "Saudação Padrão",              │
    │    message: "Olá {{CUSTOMER_NAME}}..."   │
    │  }                                       │
    └──────────────────────────────────────────┘
                     │
                     ↓ (autenticado)
    ┌──────────────────────────────────────────┐
    │  Backend (Controller)                    │
    │  ✓ Valida autenticação                   │
    │  ✓ Valida autorização (ADMIN)            │
    │  ✓ Valida placeholder                    │
    └──────────────────────────────────────────┘
                     │
                     ↓
    ┌──────────────────────────────────────────┐
    │  Backend (Service)                       │
    │  ✓ createTemplate()                      │
    │  ✓ Salva no banco                        │
    │  ✓ Retorna template com ID               │
    └──────────────────────────────────────────┘
                     │
                     ↓
    ┌──────────────────────────────────────────┐
    │  Banco de Dados                          │
    │  INSERT INTO WhatsappTemplate            │
    │  (id, name, message, isActive)           │
    └──────────────────────────────────────────┘
                     │
                     ↓
    6. Retorna 201 Created com template
                     │
                     ↓
    7. Frontend mostra toast "Criado com sucesso!"
                     │
                     ↓
    8. Modal fecha e lista atualiza
```

---

## 📱 Fluxo de Envio de WhatsApp (USER)

```
┌──────────────────────────────────────────────────────────────┐
│           USER ENVIAR WHATSAPP AO LEAD                       │
└──────────────────────────────────────────────────────────────┘

    1. User acessa /dashboard/leads
                     │
                     ↓
    2. Clica em "Detalhes" do lead
                     │
                     ↓
    ┌───────────────────────────────────────────┐
    │  LeadDetailsModal abre                    │
    │  - Mostra dados do lead                   │
    │  - Botão copy email                       │
    │  - Botão copy phone                       │
    │  - Botão WhatsApp ← NOVO!                 │
    └───────────────────────────────────────────┘
                     │
                     ↓
    3. User clica botão WhatsApp (ícone green)
                     │
                     ↓
    ┌───────────────────────────────────────────┐
    │  Frontend carrega templates               │
    │  GET /api/whatsapp-templates/active       │
    │  (sem autenticação necessária)            │
    └───────────────────────────────────────────┘
                     │
                     ↓
    ┌───────────────────────────────────────────┐
    │  Modal Seletor abre                       │
    │  Mostra lista de templates:               │
    │  ┌─────────────────────────────────────┐  │
    │  │ Saudação Padrão                     │  │
    │  │ "Olá João Silva, tudo bem?"         │  │
    │  │ [ENVIAR]                            │  │
    │  └─────────────────────────────────────┘  │
    └───────────────────────────────────────────┘
                     │
                     ↓
    4. User seleciona template
                     │
                     ↓
    5. Clica "ENVIAR"
                     │
                     ↓
    ┌───────────────────────────────────────────┐
    │  Frontend processa mensagem               │
    │  POST /api/whatsapp-templates/...         │
    │  process-message                          │
    │  {                                        │
    │    templateId: "uuid",                    │
    │    customerName: "João Silva"             │
    │  }                                        │
    └───────────────────────────────────────────┘
                     │
                     ↓
    ┌───────────────────────────────────────────┐
    │  Backend substitui {{CUSTOMER_NAME}}      │
    │  "Olá João Silva, tudo bem?"              │
    └───────────────────────────────────────────┘
                     │
                     ↓
    ┌───────────────────────────────────────────┐
    │  Frontend gera URL WhatsApp               │
    │  https://wa.me/55119876543210             │
    │  ?text=Olá%20João%20Silva...              │
    └───────────────────────────────────────────┘
                     │
                     ↓
    6. Abre em nova aba (target="_blank")
                     │
                     ↓
    ┌───────────────────────────────────────────┐
    │  WhatsApp Web/App                         │
    │  - Abre conversa com o número             │
    │  - Mensagem pré-preenchida                │
    │  - User só precisa clicar ENVIAR          │
    └───────────────────────────────────────────┘
                     │
                     ↓
    7. Mensagem enviada com sucesso!
```

---

## 🗄️ Estrutura do Banco de Dados

```
┌───────────────────────────────────────────────┐
│          WhatsappTemplate Table               │
├───────────────────────────────────────────────┤
│ id              UUID PRIMARY KEY              │
│ name            VARCHAR(255) NOT NULL         │
│ message         TEXT NOT NULL                 │
│ isActive        BOOLEAN DEFAULT true          │
│ createdAt       TIMESTAMP DEFAULT NOW         │
│ updatedAt       TIMESTAMP DEFAULT NOW         │
└───────────────────────────────────────────────┘
```

---

## 🔌 Estrutura de API

```
/api/whatsapp-templates
│
├─ [GET] /active
│        └─ Retorna templates ativos
│           Response: { success: true, data: [...] }
│
├─ [GET] /default
│        └─ Retorna primeiro template ativo
│           Response: { success: true, data: {...} }
│
├─ [POST] /process-message
│        └─ Processa mensagem com nome do cliente
│           Body: { templateId, customerName }
│           Response: { success: true, data: { message } }
│
└─ /admin (requer autenticação ADMIN)
   │
   ├─ [GET] /all
   │        └─ Lista todos os templates
   │           Response: { success: true, data: [...] }
   │
   ├─ [POST] /
   │        └─ Cria novo template
   │           Body: { name, message }
   │           Response: 201 { success: true, data: {...} }
   │
   ├─ [GET] /:id
   │        └─ Obtem um template
   │           Response: { success: true, data: {...} }
   │
   ├─ [PUT] /:id
   │        └─ Atualiza template
   │           Body: { name?, message?, isActive? }
   │           Response: { success: true, data: {...} }
   │
   └─ [DELETE] /:id
            └─ Deleta template
               Response: { success: true, message: "..." }
```

---

## 🎯 Fluxo de Dados - Visão Geral

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Components                                       │  │
│  │ - LeadDetailsModal                               │  │
│  │ - WhatsappTemplateModal                          │  │
│  │ - WhatsappTemplatesManager                       │  │
│  └──────────────────────────────────────────────────┘  │
│           │                            │                │
│           ↓                            ↓                │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Services                                         │  │
│  │ lib/services/whatsapp-template.service.ts        │  │
│  └──────────────────────────────────────────────────┘  │
│                      │                                  │
└──────────────────────┼──────────────────────────────────┘
                       │ HTTP (Fetch/Axios)
                       ↓
┌─────────────────────────────────────────────────────────┐
│                      BACKEND                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Routes                                           │  │
│  │ routes/whatsapp-template.routes.ts               │  │
│  └──────────────────────────────────────────────────┘  │
│           │                                             │
│           ↓                                             │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Controllers                                      │  │
│  │ controllers/whatsapp-template.controller.ts      │  │
│  └──────────────────────────────────────────────────┘  │
│           │                                             │
│           ↓                                             │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Services                                         │  │
│  │ services/whatsapp-template.service.ts            │  │
│  └──────────────────────────────────────────────────┘  │
│           │                                             │
│           ↓                                             │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Models                                           │  │
│  │ models/WhatsappTemplate.ts (Sequelize ORM)       │  │
│  └──────────────────────────────────────────────────┘  │
│           │                                             │
└───────────┼─────────────────────────────────────────────┘
            │ SQL Query
            ↓
    ┌───────────────────┐
    │ PostgreSQL/MySQL  │
    │ WhatsappTemplate  │
    │ Table             │
    └───────────────────┘
```

---

## 🔐 Fluxo de Autenticação

```
Admin quer gerenciar templates:
│
├─ Login (/login)
│  └─ Obtém token JWT
│
├─ Acessa /dashboard/whatsapp-templates
│  └─ Verifica token em localStorage
│
├─ Envia requisição ADMIN com token
│  POST /api/whatsapp-templates/admin
│  Header: Authorization: Bearer <TOKEN>
│
├─ Backend valida
│  ├─ Token válido?
│  ├─ Usuário autenticado?
│  └─ Role é ADMIN/SUPER_ADMIN?
│
└─ Se tudo OK → Executa operação
   Se erro → 401/403 Unauthorized/Forbidden
```

---

## 💬 Fluxo de Substituição de Placeholder

```
Template no DB:
"Olá {{CUSTOMER_NAME}}, tudo bem?"

User envia com customer = "João Silva":
│
├─ Frontend:
│  POST /process-message
│  { templateId: "abc123", customerName: "João Silva" }
│
├─ Backend:
│  const template = getTemplateById("abc123")
│  message = template.message
│  processedMessage = message.replace(
│    /{{CUSTOMER_NAME}}/g,
│    "João Silva"
│  )
│
├─ Resultado:
│  "Olá João Silva, tudo bem?"
│
└─ Frontend:
   generateWhatsappLink(phone, processedMessage)
   → https://wa.me/55119876543210?text=Olá%20João%20Silva...
```

---

## 📊 Fluxo de Estados do Frontend

```
LeadDetailsModal
│
├─ State: selectedImage (para lightbox)
├─ State: lightboxOpen (mostrar imagem grande)
├─ State: whatsappTemplates (lista de templates)
├─ State: showWhatsappTemplateSelector (mostrar modal)
└─ State: isLoadingTemplates (carregando)

Quando modal abre:
│
├─ useEffect dispara
├─ loadWhatsappTemplates() chamado
├─ GET /active enviado
├─ setWhatsappTemplates() atualizado
└─ Modal renderiza com templates

Quando user clica WhatsApp:
│
├─ setShowWhatsappTemplateSelector(true)
├─ Modal seletor abre
├─ User seleciona template
├─ handleSendWhatsapp() chamado
├─ processMessage() chamado
├─ generateWhatsappLink() cria URL
└─ window.open() abre WhatsApp
```

---

## 🎨 Integração Visual

```
LeadDetailsModal
│
├─ Header
│  └─ "Detalhes do Lead" + "Baixar tudo"
│
├─ Personal Info Box
│  ├─ Nome
│  ├─ Email + Copy Button
│  ├─ Telefone + Copy Button + 🟢 WHATSAPP BUTTON ← NOVO
│  └─ Vendedor
│
├─ Attachments Section
│  ├─ Imagens/documentos
│  └─ Preview
│
├─ Status & Date
│  ├─ Status (BOUGHT/NEGOTIATION/CANCELLED)
│  └─ Data de Cadastro
│
├─ Footer
│  └─ Botão Fechar
│
├─ Lightbox (quando clica em imagem)
│  └─ Imagem grande com close button
│
└─ WhatsApp Template Selector (novo modal)
   ├─ Título "Selecione um Template"
   ├─ Lista de templates com preview
   │  ├─ Nome do template
   │  ├─ Preview da mensagem
   │  └─ Botão [Enviar]
   └─ Botão [Cancelar]
```

---

**Diagrama atualizado**: 09 de Janeiro de 2026
