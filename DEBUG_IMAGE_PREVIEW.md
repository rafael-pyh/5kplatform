<!-- Teste de Preview de Imagem - Guia de Debug -->

# Guia de Teste - Preview de Imagem

## Se o Preview NÃO aparece após selecionar a imagem:

### 1. **Abra o DevTools Console (F12)**

Procure por estes logs quando selecionar uma imagem:
```
[ImageUploadModal] Arquivo selecionado: {name: "...", type: "image/...", size: ...}
[ImageUploadModal] Iniciando leitura do arquivo...
[ImageUploadModal] Lendo arquivo: 100.00%
[ImageUploadModal] FileReader onload - comprimento: 123456
[ImageUploadModal] Preview criado com sucesso - resultado: OK (data URL criada)
[ImageUploadModal] Imagem renderizada com sucesso
```

### 2. **Se VER os logs mas NÃO vir a imagem:**

**Possíveis causas:**
- A div de preview está fora da tela
- CSS está escondendo a imagem
- Problema no ResponsiveModal

**Solução:**
1. Clique F12 → Elements
2. Procure por `<div className="bg-blue-50 border-3 border-blue-400">`
3. Verifique se a `<img>` está visível dentro dessa div

### 3. **Se NÃO vê nenhum dos logs:**

**Possíveis causas:**
- O arquivo não está sendo selecionado
- Evento `onChange` não está sendo disparado
- Tipo de arquivo é inválido

**Solução:**
1. Tente com uma imagem diferente (JPEG, PNG, GIF ou WebP)
2. Verifique se o arquivo tem tamanho < 10MB
3. Verifique no Console se há erro de validação

### 4. **Se a imagem é MUITO GRANDE:**

O preview tem altura máxima de 380px e usa `object-contain`, então a imagem inteira deve aparecer dentro dessa caixa.

**Se a imagem está cortada:**
1. Verifique se há scroll dentro do modal
2. Use scroll para ver a imagem completa
3. Ou aumente o tamanho máximo alterando `max-h-96` no código

## Checklist de Verificação:

- [ ] Abrir DevTools Console
- [ ] Selecionar um arquivo de imagem
- [ ] Ver logs de "Arquivo selecionado"
- [ ] Ver logs de "Preview criado com sucesso"
- [ ] Ver mensagem "✅ ARQUIVO SELECIONADO" em verde
- [ ] Ver a imagem na caixa de pré-visualização
- [ ] Ver botão "✓ Enviar Imagem" habilitado (verde)
- [ ] Clicar "Enviar"
- [ ] Ver botão mudar para "⏳ Enviando..."
- [ ] Ver toast notification "Imagem enviada com sucesso!"
- [ ] Modal fecha automaticamente

## Se TUDO funcionar:

🎉 Upload de imagem está funcionando perfeitamente!

## Troubleshooting Avançado:

### Preview não aparece mas tudo parece estar OK nos logs?

```javascript
// Cole isto no Console (F12):
const preview = document.querySelector('img[alt="Preview da imagem selecionada"]');
console.log('Preview img element:', preview);
console.log('Preview src:', preview?.src?.substring(0, 50));
console.log('Preview parent:', preview?.parentElement?.className);
console.log('Preview visible:', preview?.offsetHeight > 0 ? 'SIM' : 'NÃO');
console.log('Preview width:', preview?.offsetWidth);
console.log('Preview height:', preview?.offsetHeight);
```

Se `offsetHeight` or `offsetWidth` for 0, a imagem está lá mas escondida.

### Network Tab - Verificar Upload:

1. F12 → Network
2. Selecione uma imagem e clique "Enviar"
3. Procure por uma requisição POST para:
   - `/api/shop/products/{id}/images` (para produtos)
   - `/api/shop/kits/{id}/image` (para kits)

4. Verifique:
   - **Status:** 201 (sucesso) ou 4xx/5xx (erro)
   - **Headers:** Content-Type multipart/form-data
   - **Request Body:** "image" com dados binários
   - **Response:** Deve conter URL da imagem

## Mensagens de Erro Comuns:

- **"Tipo de arquivo não suportado"** → Selecione JPEG, PNG, GIF ou WebP
- **"Arquivo muito grande"** → Reduza tamanho para < 10MB
- **"Erro ao ler a imagem"** → Selecione outro arquivo
- **"Erro ao exibir a pré-visualização"** → Tente recarregar a página

---

**Última atualização:** 23 de Janeiro de 2026
