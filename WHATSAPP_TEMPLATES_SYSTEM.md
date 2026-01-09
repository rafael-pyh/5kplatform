# Sistema de Templates de WhatsApp - Guia Completo

## Visão Geral

Foi desenvolvido um sistema completo para gerenciar mensagens pré-definidas de WhatsApp que permite aos administradores criar, editar e usar templates de mensagens com placeholder para o nome do cliente.

## Arquitetura

### Backend

#### 1. Modelo de Dados (`WhatsappTemplate.ts`)
- `id`: UUID (chave primária)
- `name`: String - Nome do template
- `message`: TEXT - Mensagem com placeholder `{{CUSTOMER_NAME}}`
- `isActive`: Boolean - Status do template
- `createdAt`, `updatedAt`: Timestamps

#### 2. Migration (`20260109000100-create-whatsapp-template.js`)
Cria a tabela `WhatsappTemplate` no banco de dados.

#### 3. Service (`whatsapp-template.service.ts`)
Funções principais:
- `createTemplate()` - Criar novo template
- `listActiveTemplates()` - Listar templates ativos
- `listAllTemplates()` - Listar todos (admin)
- `getTemplateById()` - Obter um template
- `updateTemplate()` - Atualizar template
- `deleteTemplate()` - Deletar template
- `processMessage()` - Substituir placeholder pelo nome
- `getDefaultTemplate()` - Obter primeiro template ativo

#### 4. Controller (`whatsapp-template.controller.ts`)
Endpoints:
- `POST /admin` - Criar template (ADMIN)
- `GET /admin/all` - Listar todos (ADMIN)
- `GET /admin/:id` - Obter um (ADMIN)
- `PUT /admin/:id` - Atualizar (ADMIN)
- `DELETE /admin/:id` - Deletar (ADMIN)
- `GET /active` - Listar ativos (PUBLIC)
- `GET /default` - Obter padrão (PUBLIC)
- `POST /process-message` - Processar mensagem (PUBLIC)

#### 5. Rotas (`whatsapp-template.routes.ts`)
Registra todos os endpoints com middlewares de autenticação e autorização.

#### 6. App.ts
Registra as rotas em `app.use("/api/whatsapp-templates", whatsappTemplateRoutes)`.

### Frontend

#### 1. Tipos (`lib/types.ts`)
```typescript
interface WhatsappTemplate {
  id: string;
  name: string;
  message: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateWhatsappTemplateDto {
  name: string;
  message: string;
}

interface UpdateWhatsappTemplateDto {
  name?: string;
  message?: string;
  isActive?: boolean;
}

interface ProcessedMessage {
  templateId: string;
  customerName: string;
  message: string;
}
```

#### 2. Serviço Frontend (`lib/services/whatsapp-template.service.ts`)
Funções:
- `getActiveTemplates()` - Buscar templates ativos
- `getDefaultTemplate()` - Obter template padrão
- `processMessage()` - Processar mensagem com nome
- `adminListAllTemplates()` - Listar todos (ADMIN)
- `adminCreateTemplate()` - Criar (ADMIN)
- `adminGetTemplate()` - Obter um (ADMIN)
- `adminUpdateTemplate()` - Atualizar (ADMIN)
- `adminDeleteTemplate()` - Deletar (ADMIN)
- `generateWhatsappLink()` - Gerar URL do WhatsApp

#### 3. Modal de Templates (`components/leads/WhatsappTemplateModal.tsx`)
Componente para criar/editar templates com:
- Campo de nome
- Campo de mensagem com helper para inserir placeholder
- Preview da mensagem com exemplo de nome
- Validação de placeholder obrigatório
- Botão de deletar (para edição)

#### 4. Gerenciador de Templates (`components/leads/WhatsappTemplatesManager.tsx`)
Componente para listar e gerenciar templates com:
- Lista de templates com status (Ativo/Inativo)
- Botão para criar novo
- Botão para editar cada template
- Carregamento automático

#### 5. LeadDetailsModal Atualizado
Adicionados:
- Botão de WhatsApp ao lado do botão de copiar telefone
- Modal seletor de templates ao clicar
- Integração com serviço para processar mensagem
- Redirecionamento automático para WhatsApp

#### 6. Página de Gerenciamento (`app/dashboard/whatsapp-templates/page.tsx`)
Página dedicada para admins gerenciarem templates com:
- Verificação de autenticação
- Validação de permissão (ADMIN/SUPER_ADMIN)
- Integração com `WhatsappTemplatesManager`

## Fluxo de Uso

### Para Administrador:

1. **Acessar página**: `/dashboard/whatsapp-templates`
2. **Criar Template**:
   - Clicar em "Novo Template"
   - Preencher nome (ex: "Saudação Padrão")
   - Escrever mensagem com `{{CUSTOMER_NAME}}`
   - Preview mostra como fica com exemplo
   - Salvar
3. **Editar Template**:
   - Clicar em "Editar" no template
   - Modificar dados
   - Salvar
4. **Deletar Template**:
   - Clicar em "Deletar"
   - Confirmar exclusão

### Para Usuário (Enviando WhatsApp):

1. **Abrir Lead**: Clicar em "Detalhes" do lead
2. **Ver Botão WhatsApp**: Ao lado do botão de copiar telefone
3. **Selecionar Template**: Clicar em botão de WhatsApp
4. **Escolher Mensagem**: Modal mostra templates disponíveis com preview
5. **Enviar**: Clicar em "Enviar" abre WhatsApp com mensagem pré-preenchida

## Validações

### Backend:
- Mensagem deve conter `{{CUSTOMER_NAME}}`
- Validação de autenticação (token)
- Validação de autorização (apenas ADMIN/SUPER_ADMIN)

### Frontend:
- Nome obrigatório
- Mensagem obrigatória
- Placeholder obrigatório (`{{CUSTOMER_NAME}}`)
- Toast notifications para feedback

## Placeholder

O sistema usa `{{CUSTOMER_NAME}}` como placeholder que será substituído automaticamente pelo nome do cliente ao enviar a mensagem via WhatsApp.

Exemplo:
- Template: "Olá {{CUSTOMER_NAME}}, temos energia solar para você!"
- Cliente: João Silva
- Mensagem Final: "Olá João Silva, temos energia solar para você!"

## URLs do WhatsApp

O sistema gera URLs no formato:
```
https://wa.me/PHONE_NUMBER?text=ENCODED_MESSAGE
```

Isso abre o WhatsApp com a conversa pré-preenchida (sem enviar automaticamente).

## Pontos Importantes

1. **Segurança**: Apenas admins podem gerenciar templates
2. **Flexibilidade**: Templates podem ser ativados/desativados
3. **UX**: Modal de seleção de template direto do lead
4. **Processamento**: Placeholder substituído no backend antes de processar
5. **Rastreamento**: Criação e atualização de templates registradas

## Próximas Melhorias Sugeridas

1. Adicionar mais placeholders (email, telefone, etc.)
2. Templates por departamento/vendedor
3. Analytics de uso de templates
4. Versioning de templates
5. Duplicar template existente
6. Importar/exportar templates
