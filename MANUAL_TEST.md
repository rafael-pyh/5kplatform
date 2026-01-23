# Teste Manual - Passo a Passo

## 🎯 Objetivo:
Verificar se o preview de imagem aparece quando você seleciona uma imagem no modal de upload.

## ⚙️ Preparação:

1. **Abra o navegador**
   - URL: http://localhost:3000 (ou seu domínio)

2. **Faça login como ADMIN**
   - Se não tiver acesso, crie uma conta admin

3. **Abra DevTools**
   - Pressione `F12`
   - Vá para a aba "Console"
   - Deixe aberto para ver os logs

## 📋 Teste 1: Criar Novo Kit (Para Ver o Upload)

### Passo 1: Navegue até Kits
- Clique em "Admin" (no menu)
- Clique em "Gestão de Produtos e Kits"
- Clique em "Novo Kit" (botão verde)

### Passo 2: Preencha os Dados Básicos
- Nome do Kit: "Kit Teste"
- Preço: "999.99"
- Descrição: "Teste do preview de imagem"
- Selecione alguns produtos (se houver)

### Passo 3: Clique "Adicionar Imagem"
- Procure pelo botão "Adicionar Imagem" (deve estar desabilitado se não houver produtos)
- Se conseguir clicar, um modal abrirá

### Passo 4: No Modal de Upload

**No Console, você deve ver:**
```
[ImageUploadModal] Arquivo selecionado: {name: "...", type: "image/...", size: ...}
```

**Na Tela, você deve ver:**
```
📁 Selecione uma Imagem
[Clique para selecionar imagens]
ℹ️ Máximo 10MB. Formatos: JPEG, PNG, GIF, WebP
```

### Passo 5: Clique em "Clique para selecionar imagens"
- Abre um explorador de arquivos do seu sistema
- Selecione uma imagem (PNG, JPG, GIF ou WebP)
- **A imagem deve ter menos de 10MB**

### Passo 6: APÓS Selecionar a Imagem

**No Console, você verá:**
```
[ImageUploadModal] ========== NOVO ARQUIVO SELECIONADO ==========
[ImageUploadModal] Nome: foto.jpg
[ImageUploadModal] Tipo: image/jpeg
[ImageUploadModal] Tamanho: 2048576 bytes (1.95MB)
[ImageUploadModal] Última modificação: ...
[ImageUploadModal] Tipo permitido? true
[ImageUploadModal] ✅ Arquivo VALIDADO
[ImageUploadModal] 📖 Iniciando leitura com FileReader...
[ImageUploadModal] 📊 Lendo arquivo: 100%
[ImageUploadModal] ✅ FileReader.onload disparado
[ImageUploadModal] Data URL comprimento: 2731440 caracteres
[ImageUploadModal] ✅ Preview state atualizado
[ImageUploadModal] ========== ARQUIVO PRONTO PARA UPLOAD ==========
[ImageUploadModal] ✅ Imagem renderizada com sucesso
```

**Na Tela, você verá:**
```
✅ ARQUIVO SELECIONADO
foto.jpg (1.95MB)

🖼️ Pré-visualização da Imagem
┌─────────────────────────┐
│                         │
│    [IMAGEM AQUI]        │
│                         │
│                    ×    │
└─────────────────────────┘

Clique no X para remover a imagem

[✕ Cancelar] [✓ Enviar Imagem]
```

### Passo 7: Verifique a Imagem

- [ ] Mensagem "✅ ARQUIVO SELECIONADO" em verde aparece?
- [ ] Nome e tamanho do arquivo aparecem?
- [ ] Caixa azul com borda aparece?
- [ ] A imagem real aparece dentro da caixa?
- [ ] Botão X está visível no canto superior direito?
- [ ] Botão "✓ Enviar Imagem" está em verde?

## 📋 Teste 2: Teste de Erro - Arquivo Muito Grande

### Passo 1: Prepare um Arquivo Grande
- Crie uma imagem maior que 10MB
- OU use uma imagem grande que você tenha

### Passo 2: Repita o Processo
- Clique "Adicionar Imagem"
- Selecione o arquivo grande

**Esperado:**
```
Na Tela: 🔴 ERRO (em vermelho)
"Arquivo muito grande. Máximo 10MB permitido. Arquivo: 15.25MB"

No Console:
[ImageUploadModal] ❌ ERRO DE TAMANHO: ...
```

## 📋 Teste 3: Teste de Erro - Tipo Inválido

### Passo 1: Selecione um Arquivo Inválido
- Tente selecionar um arquivo .txt, .pdf ou outro
- O sistema deve rejeitar

**Esperado:**
```
Na Tela: 🔴 ERRO (em vermelho)
"Tipo de arquivo não suportado..."

No Console:
[ImageUploadModal] ❌ ERRO DE TIPO: ...
```

## 📋 Teste 4: Enviar Imagem com Sucesso

### Passo 1: Repita Teste 1 até Passo 6

### Passo 2: Clique "✓ Enviar Imagem"
- Botão deve ficar cinza por um momento
- Deve mostrar "⏳ Enviando..."

**Na Tela:**
```
Botão fica assim: ⏳ Enviando...
```

**No Console:**
```
[handleImageUploadSubmit] Iniciando upload: {
  imageUploadId: "...",
  imageUploadType: "kit",
  fileName: "foto.jpg",
  fileSize: 2048576,
  fileType: "image/jpeg"
}

[handleImageUploadSubmit] Enviando imagem para kit: ...
[handleImageUploadSubmit] Imagem do kit enviada com sucesso
[handleImageUploadSubmit] Recarregando dados...
```

### Passo 3: Aguarde o Resultado

**Esperado em 2-5 segundos:**

```
Na Tela:
- Toast notification "Imagem enviada com sucesso!"
- Modal fecha automaticamente
- Você volta para a tela anterior

No Console:
[ImageUploadModal] Upload concluído com sucesso
```

## ✅ Tudo Funcionando Quando:

- ✅ Preview aparece após selecionar
- ✅ Informações do arquivo aparecem em verde
- ✅ Imagem é visível na caixa azul
- ✅ Erros aparecem em vermelho
- ✅ Console mostra todos os logs
- ✅ Toast notification aparece no canto superior direito
- ✅ Modal fecha após enviar

## ❌ Problemas Comuns:

### Preview não aparece
**Solução:** Recarregue a página e tente novamente

### Erro "Arquivo não selecionado"
**Solução:** Certifique-se de clicar em "Clique para selecionar" e depois selecionar um arquivo

### Modal fica travado com "⏳ Enviando..."
**Solução:** Verifique a aba Network no DevTools para ver se há erro do servidor

### Toast notification não aparece
**Solução:** Procure no canto superior direito ou abra Console para ver se há erro

## 🎬 Gravação de Teste:

Se possível, grave uma vídeo enquanto faz este teste para compartilhar:
1. F12 aberto mostrando Console
2. Modal de upload visível
3. Seleção de imagem
4. Preview aparecendo

Isso ajudará muito no troubleshooting se houver problema.

---

**Executar este teste agora e reportar os resultados!**
