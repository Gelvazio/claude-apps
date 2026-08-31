# Corrigir Menu do Perfil Atual

**Objetivo:** Exibir no menu somente as telas vinculadas ao perfil atual, aceitando o formato real de `nome_html` armazenado no Supabase.

**Tech Stack:** JavaScript, Node.js, LocalStorage e Supabase REST

---

## Status Geral

| Passo | Descrição | Status |
|-------|-----------|--------|
| 1 | Investigar o fluxo e os dados reais | ✅ Concluído |
| 2 | Criar teste de regressão | ✅ Concluído |
| 3 | Corrigir a correspondência dos caminhos | ✅ Concluído |
| 4 | Executar testes e simulação | ✅ Concluído |
| 5 | Atualizar o grafo de conhecimento | ✅ Concluído |

---

### Passo 1: Investigar o fluxo e os dados reais

**Status:** ✅ Concluído

**Arquivos:** `SUPABASE.js`, `menu.js` e dados REST do Supabase.

**Ação:** Rastrear `perfil_sistema → tela → erp_telas → telasPermitidas → link()`.

**Evidência:** O Supabase possui telas como `clientes.html`, enquanto o menu usa `cadastros/clientes.html`; a comparação literal elimina o link.

---

### Passo 2: Criar teste de regressão

**Status:** ✅ Concluído

**Arquivo:** Criar `tests/menu.test.js`.

**Ação:** Simular DOM e LocalStorage com o formato real retornado pelo Supabase.

**Verificação:**

```powershell
node --test tests/menu.test.js
```

Resultado antes da correção: falha ao localizar `cadastros/clientes.html` e renderização literal de `null`.

---

### Passo 3: Corrigir a correspondência dos caminhos

**Status:** ✅ Concluído

**Arquivo:** Modificar `menu.js`.

**Ação:** Comparar o caminho completo e, quando o cadastro contiver somente o arquivo, comparar também o basename sem ampliar permissões em nomes colidentes. Adicionar as cinco telas existentes no Supabase que não tinham entrada no menu e retirar a restrição paralela baseada no nome do perfil.

**Verificação:**

```powershell
node --test tests/menu.test.js
```

Resultado: 10 cenários unitários passam.

---

### Passo 4: Executar testes e simulação

**Status:** ✅ Concluído

**Arquivo:** Validar `menu.js`.

**Ação:** Executar a suíte Node, servir o arquivo localmente e simular a sidebar com os vínculos reais dos sete perfis do Supabase.

**Verificação:**

```powershell
node --test tests/menu.test.js
```

Resultado: 10 testes unitários e 8 verificações de integração passam; o arquivo servido por HTTP corresponde ao arquivo local.

---

### Passo 5: Atualizar o grafo de conhecimento

**Status:** ✅ Concluído

**Arquivo:** Atualizar `graphify-out/`.

**Ação:** Executar atualização incremental após a correção.

**Verificação:** Graphify atualizado com 1.258 nós, 1.248 arestas e 74 comunidades.
