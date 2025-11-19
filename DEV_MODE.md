# 🚀 Modo Desenvolvimento - Hot Reload

## Configuração para desenvolvimento com hot reload automático

### Como usar:

```bash
# Usar docker-compose de desenvolvimento
docker-compose -f docker-compose.dev.yaml up -d

# Ver logs em tempo real
docker-compose -f docker-compose.dev.yaml logs -f api

# Parar containers
docker-compose -f docker-compose.dev.yaml down
```

### O que acontece:

✅ **Hot Reload Ativo**: Alterações em arquivos `.ts` no backend reiniciam automaticamente o servidor
✅ **Volumes Mapeados**: Código fonte (`src/`) é mapeado do host para o container
✅ **Nodemon**: Monitora mudanças e reinicia o servidor
✅ **Sem Rebuild**: Não precisa fazer `docker-compose build` a cada mudança

### Estrutura:

- `docker-compose.yaml` → **Produção** (precisa rebuild)
- `docker-compose.dev.yaml` → **Desenvolvimento** (hot reload)
- `Dockerfile` → Build de produção
- `Dockerfile.dev` → Build de desenvolvimento

### Quando usar cada um:

**Desenvolvimento (Hot Reload):**
```bash
docker-compose -f docker-compose.dev.yaml up -d
```
- ✅ Alterações em `src/**/*.ts` → Reinicia automaticamente
- ✅ Alterações em `prisma/schema.prisma` → Reinicia automaticamente
- ❌ Alterações em `package.json` → Precisa rebuild

**Produção:**
```bash
docker-compose up -d
```
- ✅ Build otimizado e compilado
- ✅ Menor tamanho de imagem
- ✅ Melhor performance

### Testando o Hot Reload:

1. Inicie o modo desenvolvimento:
```bash
docker-compose -f docker-compose.dev.yaml up -d
```

2. Veja os logs:
```bash
docker-compose -f docker-compose.dev.yaml logs -f api
```

3. Edite um arquivo, por exemplo `backend/src/app.ts`:
```typescript
// Adicione um console.log
console.log('🔥 Hot reload funcionando!');
```

4. Salve o arquivo e veja o servidor reiniciar nos logs!

### Troubleshooting:

**Hot reload não funciona?**
```bash
# Parar tudo
docker-compose -f docker-compose.dev.yaml down

# Rebuild
docker-compose -f docker-compose.dev.yaml build

# Iniciar novamente
docker-compose -f docker-compose.dev.yaml up -d
```

**Alterações no package.json?**
```bash
# Quando adicionar novas dependências
docker-compose -f docker-compose.dev.yaml down
docker-compose -f docker-compose.dev.yaml build --no-cache
docker-compose -f docker-compose.dev.yaml up -d
```
