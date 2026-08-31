# Remover Sistema JSON

**Objetivo:** Eliminar `sistema.json` e carregar os módulos exclusivamente da tabela `sistema` no Supabase.

**Tech Stack:** JavaScript, HTML e Supabase REST.

---

## Status Geral

| Passo | Descrição | Status |
|-------|-----------|--------|
| 1 | Substituir a leitura JSON na tela de telas | ✅ Concluído |
| 2 | Substituir a leitura JSON na tela de perfis | ✅ Concluído |
| 3 | Excluir `sistema.json` | ✅ Concluído |
| 4 | Commit e publicação | ✅ Concluído |

---

### Passo 1: Atualizar cadastro de telas

**Status:** ✅ Concluído

**Arquivo:** Modificar `configuracoes/telas.html`

**Ação:** Carregar os sistemas ativos e ordenados diretamente do banco.

```javascript
sbListar('sistema', 'sisativo=eq.1&order=sisordem.asc')
```

**Verificação:**

```powershell
git diff -- configuracoes/telas.html
```

Esperado: nenhuma chamada a `sistema.json`.

---

### Passo 2: Atualizar cadastro de perfis

**Status:** ✅ Concluído

**Arquivo:** Modificar `configuracoes/perfis.html`

**Ação:** Usar a mesma consulta da tabela `sistema` para agrupar as telas do perfil.

```javascript
const sis = await sbListar('sistema', 'sisativo=eq.1&order=sisordem.asc');
```

**Verificação:**

```powershell
git diff -- configuracoes/perfis.html
```

Esperado: os nomes e a ordem dos módulos vêm do banco.

---

### Passo 3: Excluir a fonte local

**Status:** ✅ Concluído

**Arquivo:** Excluir `sistema.json`

**Ação:** Remover o arquivo para impedir divergência entre configuração local e banco.

**Verificação:**

```powershell
Test-Path sistema.json
```

Esperado: `False`.

---

### Passo 4: Commit e publicação

**Status:** ✅ Concluído

**Arquivos:** Versionar as duas telas, a exclusão do JSON e este documento.

**Ação:** Criar commit descritivo e enviar para `origin/main`.

**Verificação:**

```powershell
git log -1 --oneline
```

Esperado: alteração publicada no branch principal.

> Os comandos de verificação estão documentados, mas não serão executados devido à proibição expressa de testes e validações neste projeto.
