# 🚀 Quick Start - Templates de WhatsApp

## O que foi implementado em 30 minutos?

Um **sistema completo** de templates de mensagens de WhatsApp que permite:

✅ **Admins**: Criar, editar e deletar mensagens pré-definidas
✅ **Users**: Enviar WhatsApp para leads com um clique
✅ **Personalização**: Nome do cliente substituído automaticamente

---

## 📦 Arquivos Criados: 11

### Backend (6 arquivos)
1. `WhatsappTemplate.ts` - Modelo
2. `whatsapp-template.ts` - Migration
3. `whatsapp-template.service.ts` - Lógica
4. `whatsapp-template.controller.ts` - Endpoints
5. `whatsapp-template.routes.ts` - Rotas
6. `app.ts` - Modificado para registrar rotas

### Frontend (5 arquivos)
7. `whatsapp-template.service.ts` - HTTP calls
8. `WhatsappTemplateModal.tsx` - Criar/editar
9. `WhatsappTemplatesManager.tsx` - Listar gerenciar
10. `LeadDetailsModal.tsx` - Modificado com botão
11. `whatsapp-templates/page.tsx` - Dashboard admin

---

## ⚡ Como Usar (Resumo)

### 1️⃣ Criar Template (Admin)
```
/dashboard/whatsapp-templates → Novo → Preencher → Salvar
```

### 2️⃣ Usar Template (User)
```
/dashboard/leads → Detalhes → Botão WhatsApp → Enviar
```

---

## 🔧 Instalação Rápida

```bash
# 1. Executar migration
npm run migrate  # ou npx sequelize-cli db:migrate

# 2. Reiniciar backend
docker compose restart api

# 3. Acessar admin
# Login como ADMIN/SUPER_ADMIN
# Ir para /dashboard/whatsapp-templates
```

---

## 📝 Mensagem Exemplo

```
Nome: Saudação
Mensagem: "Olá {{CUSTOMER_NAME}}, temos energia solar para você!"

Quando enviado para João:
"Olá João, temos energia solar para você!"
```

---

## 🎯 Endpoints (7)

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/active` | ❌ | Listar ativos |
| POST | `/process-message` | ❌ | Processar com nome |
| POST | `/admin` | ✅ | Criar |
| GET | `/admin/all` | ✅ | Listar todos |
| GET | `/admin/:id` | ✅ | Obter um |
| PUT | `/admin/:id` | ✅ | Atualizar |
| DELETE | `/admin/:id` | ✅ | Deletar |

---

## 📚 Documentação

| Arquivo | Objetivo |
|---------|----------|
| `WHATSAPP_IMPLEMENTATION_SUMMARY.md` | Resumo executivo |
| `WHATSAPP_TEMPLATES_SYSTEM.md` | Documentação completa |
| `WHATSAPP_FLOW_DIAGRAM.md` | Diagramas visuais |
| `WHATSAPP_IMPLEMENTATION_CHECKLIST.md` | Verificações |
| `WHATSAPP_TEMPLATES_API_EXAMPLES.sh` | Exemplos curl |
| `WHATSAPP_QUICK_START.md` | Este arquivo |

---

## ✨ Features

- [x] CRUD de templates
- [x] Validação de placeholder obrigatório
- [x] Preview em tempo real
- [x] Autenticação/autorização
- [x] Modal seletor de templates
- [x] Integração com WhatsApp Web
- [x] Toast notifications
- [x] Suporte a múltiplos templates

---

## 🐛 Troubleshooting

| Erro | Solução |
|------|---------|
| 401 Unauthorized | Verificar token e login |
| 403 Forbidden | Deve ser ADMIN |
| Botão não aparece | Limpar cache do navegador |
| Templates não carregam | Verificar BD / logs |
| WhatsApp não abre | Verificar número (formato internacional) |

---

## 🔐 Validações

- ✅ Placeholder `{{CUSTOMER_NAME}}` obrigatório
- ✅ Apenas ADMIN pode gerenciar
- ✅ Autenticação JWT obrigatória para admin
- ✅ Nome e mensagem obrigatórios
- ✅ Status ativo/inativo

---

## 📊 Banco de Dados

```sql
CREATE TABLE WhatsappTemplate (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

---

## 🎬 Demonstração

### Para Admin
```
1. Acessar /dashboard/whatsapp-templates
2. Clicar "Novo Template"
3. Preencher:
   - Nome: "Saudação"
   - Mensagem: "Olá {{CUSTOMER_NAME}}, tudo bem?"
4. Ver preview: "Olá Maria, tudo bem?"
5. Salvar
6. Listar templates
7. Editar ou deletar
```

### Para User
```
1. Acessar /dashboard/leads
2. Clicar "Detalhes" de um lead
3. Clicar ícone WhatsApp (verde)
4. Selecionar template
5. Ver preview com nome real
6. Clicar "Enviar"
7. WhatsApp abre com mensagem pré-preenchida
8. Clicar ENVIAR no WhatsApp
```

---

## 📞 Placeholder

O sistema substitui `{{CUSTOMER_NAME}}` pelo nome real do cliente:

**Template:**
```
Olá {{CUSTOMER_NAME}}, como você está?
```

**Enviado para João:**
```
Olá João, como você está?
```

---

## 🌐 URL WhatsApp Gerada

```
https://wa.me/55119876543210?text=Olá%20João%2C%20como%20você%20está%3F
```

- `55119876543210` = Número do lead (formato internacional)
- `text=...` = Mensagem processada (encoded)

---

## 🚀 Próximas Melhorias

1. Duplicar template
2. Templates por departamento
3. Analytics de uso
4. Mais placeholders ({{EMAIL}}, {{PHONE}})
5. Versioning de templates
6. Importar/exportar CSV

---

**Status**: ✅ Pronto para usar

**Próximo Passo**: Executar migration e testar!
