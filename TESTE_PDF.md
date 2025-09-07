# 🧪 Guia de Teste - Exportação de PDF

## Como Testar a Funcionalidade

### 1. Abrir o Dashboard

- Acesse: http://localhost:3001/dashboard
- Faça login se necessário

### 2. Testar Exportação de PDF

1. **Abra o Console do Navegador**:
   - Chrome/Edge: `F12` ou `Ctrl+Shift+I`
   - Firefox: `F12` ou `Ctrl+Shift+K`
   - Vá para a aba "Console"

2. **Execute a Exportação**:
   - Clique nos 3 pontos (⋮) de qualquer projeto
   - Selecione "Exportar PDF"
   - **Observe os logs no console**

### 3. Logs Esperados no Console

Se tudo estiver funcionando, você deve ver:

```
Iniciando exportação de PDF para projeto: [Nome do Projeto]
Elemento temporário criado, adicionando ao DOM
Chamando função exportToPDF...
Elemento encontrado: <div id="temp-document-content">...</div>
Canvas criado: [largura] x [altura]
Imagem convertida para base64
Dimensões calculadas - Width: 210 Height: [altura calculada]
Salvando PDF: [nome_do_arquivo].pdf
PDF salvo com sucesso!
Resultado da exportação: {success: true, fileName: "..."}
Elemento temporário removido
```

### 4. Possíveis Problemas e Soluções

#### ❌ **Erro: "Element not found for PDF export"**

- **Causa**: O elemento temporário não foi criado corretamente
- **Solução**: Verificar se o JavaScript está habilitado

#### ❌ **Erro no html2canvas**

- **Causa**: Problemas com a biblioteca html2canvas
- **Solução**: Verificar se as dependências estão instaladas:
  ```bash
  npm install html2canvas@^1.4.1 jspdf@^3.0.2
  ```

#### ❌ **PDF não é baixado**

- **Causa**: Bloqueador de pop-ups ou configurações do navegador
- **Solução**:
  - Permitir downloads automáticos
  - Desabilitar bloqueador de pop-ups
  - Verificar pasta de Downloads

#### ❌ **Erro de CORS**

- **Causa**: Problemas de Cross-Origin Resource Sharing
- **Solução**: Já configurado com `useCORS: true` e `allowTaint: true`

### 5. Teste Alternativo (HTML Simples)

Se o teste no dashboard falhar, teste com o arquivo HTML simples:

1. Abra o arquivo: `test-pdf.html` no navegador
2. Clique em "Exportar PDF"
3. Verifique se o PDF é gerado

### 6. Verificação Final

✅ **Sucesso se**:

- Logs aparecem no console sem erros
- Notificação de sucesso aparece
- Arquivo PDF é baixado
- PDF contém o conteúdo do projeto

❌ **Falha se**:

- Erros aparecem no console
- Notificação de erro aparece
- Nenhum arquivo é baixado
- PDF está vazio ou corrompido

---

## 🔧 Informações Técnicas

- **Bibliotecas**: jsPDF v3.0.2 + html2canvas v1.4.1
- **Formato**: PDF A4 (210x297mm)
- **Resolução**: 2x scale para melhor qualidade
- **Elemento alvo**: `temp-document-content` (criado dinamicamente)

## 📝 Relatório de Teste

Após testar, informe:

1. ✅ Funcionou perfeitamente
2. ⚠️ Funcionou com problemas: [descrever]
3. ❌ Não funcionou: [logs de erro do console]
