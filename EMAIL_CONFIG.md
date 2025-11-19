# 📧 Configuração de Email

## Opção 1: App Password do Gmail (Mais Simples) ⭐

Esta é a forma mais simples e recomendada para começar rapidamente.

### Passo 1: Ativar 2FA no Gmail

1. Acesse https://myaccount.google.com/security
2. Clique em "Verificação em duas etapas"
3. Siga as instruções para ativar

### Passo 2: Gerar App Password

1. Acesse https://myaccount.google.com/apppasswords
2. Em "App name", digite: `5K Energia Solar`
3. Clique em "Create"
4. **Copie a senha de 16 dígitos** (sem espaços)

### Passo 3: Configurar no `.env`

Adicione estas variáveis no arquivo `.env` do backend:

```bash
# Email com App Password
GMAIL_USER=seuemail@gmail.com
EMAIL_USER=seuemail@gmail.com
EMAIL_PASS=xxxxxxxxxxxxxxxx  # Senha de 16 dígitos SEM espaços
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

### Passo 4: Configurar no Docker Compose

Adicione no `docker-compose.yaml` em `services.api.environment`:

```yaml
api:
  environment:
    # ... outras variáveis ...
    GMAIL_USER: seuemail@gmail.com
    EMAIL_USER: seuemail@gmail.com
    EMAIL_PASS: xxxxxxxxxxxxxxxx
    EMAIL_HOST: smtp.gmail.com
    EMAIL_PORT: 587
```

### Passo 5: Rebuild e Teste

```bash
docker-compose down
docker-compose build
docker-compose up -d
```

Agora quando você criar um vendedor, o email será enviado de verdade! ✅

---

## Opção 2: OAuth2 (Mais Seguro para Produção)

Para produção em grande escala, use OAuth2. Veja o arquivo `GMAIL_OAUTH_SETUP.md` para instruções detalhadas.

---

## Verificação

Após configurar, crie um vendedor e verifique:

1. **Sem configuração**: Vê o link no console (modo dev)
2. **Com configuração**: Recebe email real + mensagem `✅ Email enviado com sucesso`

## Troubleshooting

### Erro: "Invalid login: 535-5.7.8 Username and Password not accepted"

- Verifique se a senha no `.env` **não tem espaços**
- Certifique-se de que copiou a App Password corretamente
- Confirme que 2FA está ativo

### Erro: "Authentication Required"

- Verifique se `EMAIL_USER` e `GMAIL_USER` estão definidos
- Certifique-se de que `EMAIL_PASS` está configurado

### Email não chega

- Verifique a pasta de SPAM
- Confirme que o email do vendedor está correto
- Veja os logs do backend para erros
