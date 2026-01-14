# Configuração Swagger & CORS

## ✅ O que foi configurado

### 1. **CORS (Cross-Origin Resource Sharing)**
O backend está configurado para aceitar requisições das seguintes URLs:
- `https://5kenergiasolar.up.railway.app/`
- `https://5kplatform.vercel.app/`
- `http://localhost:3000`

**Arquivo**: [backend/src/app.ts](../app.ts)

### 2. **Swagger/OpenAPI Documentation**
A documentação da API está disponível em:
- **Local**: `http://localhost:3000/api-docs`
- **Production**: `https://5kenergiasolar.up.railway.app/api-docs`

**Arquivo de Configuração**: [backend/src/config/swagger.config.ts](../config/swagger.config.ts)

---

## 📝 Como Documentar suas Rotas

O Swagger utiliza comentários JSDoc para gerar a documentação. Aqui está o padrão:

### Exemplo: Rota GET simples

```typescript
/**
 * @swagger
 * /api/pessoa/{id}:
 *   get:
 *     summary: Obter dados de uma pessoa
 *     description: Retorna os dados de uma pessoa pelo ID
 *     tags:
 *       - Person
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da pessoa
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pessoa encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *       404:
 *         description: Pessoa não encontrada
 *       401:
 *         description: Não autenticado
 */
```

### Exemplo: Rota POST com corpo

```typescript
/**
 * @swagger
 * /api/lead:
 *   post:
 *     summary: Criar novo lead
 *     description: Cria um novo lead no sistema
 *     tags:
 *       - Lead
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *                 example: João Silva
 *               email:
 *                 type: string
 *                 format: email
 *                 example: joao@example.com
 *               phone:
 *                 type: string
 *                 example: 11999999999
 *     responses:
 *       201:
 *         description: Lead criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno do servidor
 */
```

### Exemplo: Rota com autenticação

```typescript
/**
 * @swagger
 * /api/seller/leads:
 *   get:
 *     summary: Listar leads do vendedor
 *     description: Retorna todos os leads do vendedor autenticado
 *     tags:
 *       - Seller
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de leads
 *       401:
 *         description: Não autenticado
 */
```

---

## 🏗️ Estrutura de Tags

Use tags para agrupar endpoints relacionados. Exemplos:
- `Authentication` - Rotas de login/logout
- `Person` - Rotas de pessoas
- `Lead` - Rotas de leads
- `Seller` - Rotas de vendedores
- `Admin` - Rotas administrativas
- `Upload` - Rotas de upload
- `Health` - Health check

---

## 🔐 Segurança

As rotas que requerem autenticação devem incluir:

```yaml
security:
  - bearerAuth: []
```

Isso indicará no Swagger que é necessário enviar um header:
```
Authorization: Bearer <seu_token_jwt>
```

---

## 🚀 Como Usar o Swagger

1. **Em desenvolvimento**:
   ```bash
   cd backend
   npm run dev
   ```
   Acesse: `http://localhost:3000/api-docs`

2. **Em produção**:
   Acesse: `https://5kenergiasolar.up.railway.app/api-docs`

3. **No Swagger UI**:
   - Clique em "Try it out" para testar endpoints
   - Clique no botão "Authorize" para adicionar seu token JWT
   - Veja a documentação e schemas de resposta

---

## 📦 Pacotes Instalados

```json
{
  "swagger-ui-express": "^4.x.x",
  "swagger-jsdoc": "^6.x.x"
}
```

---

## 🔍 Referência Rápida

| Campo | Descrição |
|-------|-----------|
| `summary` | Título curto do endpoint |
| `description` | Descrição detalhada |
| `tags` | Categoria para agrupar |
| `parameters` | Query params, path params, headers |
| `requestBody` | Corpo da requisição (POST, PUT, etc) |
| `responses` | Status codes e formatos de resposta |
| `security` | Tipo de autenticação requerido |

---

## ✅ Próximos Passos

1. Adicione documentação a **todas as rotas** em seus arquivos de routes
2. Use o padrão de tags consistentemente
3. Verifique se a documentação aparece no Swagger UI
4. Teste os endpoints diretamente no Swagger (botão "Try it out")

Para mais exemplos, consulte o arquivo [swagger-examples.ts](../docs/swagger-examples.ts)
