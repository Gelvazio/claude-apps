# Correção da Listagem de Telas Após o Login

**Objetivo:** Preservar as telas carregadas para o perfil durante a renovação da sessão e aplicá-las corretamente ao menu lateral.

**Tech Stack:** JavaScript, HTML, LocalStorage e Supabase REST.

---

## Status Geral

| Passo | Descrição | Status |
|-------|-----------|--------|
| 1 | Rastrear o fluxo de telas entre login e menu | ✅ Concluído |
| 2 | Preservar `erp_telas` ao limpar a sessão anterior | ✅ Concluído |
| 3 | Centralizar o filtro de telas no carregamento da interface | ✅ Concluído |
| 4 | Commit e publicação | ✅ Concluído |
| 5 | Remover o bloqueio antecipado por permissão de módulo | ✅ Concluído |
| 6 | Aplicar comportamento seguro quando o perfil não tiver telas | ✅ Concluído |
| 7 | Commit e publicação do ajuste complementar | ✅ Concluído |
| 8 | Aplicar `erp_telas` durante a montagem do menu | ✅ Concluído |
| 9 | Remover validação duplicada de `SUPABASE.js` | ✅ Concluído |
| 10 | Documentar a responsabilidade exclusiva em `CLAUDE.md` | ✅ Concluído |

---

### Passo 1: Rastrear o fluxo de telas

**Status:** ✅ Concluído

**Arquivos:** Modificar `SUPABASE.js` e `menu.js`

**Ação:** Confirmar que o login consulta `perfil_sistema`, carrega as telas ativas e grava o resultado em `erp_telas`, que depois é consumido pelo menu.

**Verificação:**

```powershell
rg -n "sbLogin|erp_telas|sbFiltrarSidebar" SUPABASE.js menu.js
```

Esperado: o fluxo de escrita e leitura de `erp_telas` aparece nos dois componentes.

---

### Passo 2: Preservar as telas durante a troca de sessão

**Status:** ✅ Concluído

**Arquivo:** Modificar `SUPABASE.js`

**Ação:** Manter o resultado da consulta em memória, limpar os dados da sessão anterior e somente depois gravar a nova lista.

```javascript
let telasDoLogin = [];

// As consultas do perfil atribuem o resultado a telasDoLogin.

localStorage.removeItem('erp_telas');
localStorage.setItem('erp_telas', JSON.stringify(telasDoLogin));
```

**Verificação:**

```powershell
git diff -- SUPABASE.js
```

Esperado: `erp_telas` é gravado depois da limpeza da sessão.

---

### Passo 3: Centralizar o filtro do menu

**Status:** ✅ Concluído

**Arquivo:** Modificar `menu.js`

**Ação:** Gerar todos os links autorizados pelo módulo e deixar `sbFiltrarSidebar()` aplicar as telas específicas do perfil após o DOM estar pronto.

```javascript
function link(href, icon, label) {
  const active = pageFull === href || pageFull.endsWith('/' + href);
  return `<a class="sidebar-link${active ? ' ativo' : ''}" href="${base}${href}">` +
         `<span class="sidebar-icon">${icon}</span> ${label}</a>`;
}
```

**Verificação:**

```powershell
git diff -- menu.js
```

Esperado: a montagem não elimina links antes de `sbFiltrarSidebar()` processar `erp_telas`.

---

### Passo 4: Commit e publicação

**Status:** ✅ Concluído

**Arquivos:** Versionar `SUPABASE.js`, `menu.js` e este documento.

**Ação:** Criar commit descritivo e enviar para `origin/main`.

**Verificação:**

```powershell
git status --short
git log -1 --oneline
```

Esperado: commit da correção presente no histórico remoto.

> Testes e validações de execução não foram realizados por proibição expressa das regras do projeto.

---

### Passo 5: Remover o bloqueio antecipado por módulo

**Status:** ✅ Concluído

**Arquivo:** Modificar `menu.js`

**Ação:** Montar as seções do menu antes do filtro individual, evitando que um mapeamento agregado de módulo descarte telas que estão vinculadas ao perfil.

```javascript
function section(chave, label, links) {
  const content = links.filter(Boolean).join('');
  if (!content) return '';
  return `<div class="sidebar-section open">...</div>`;
}
```

**Verificação:**

```powershell
git diff -- menu.js
```

Esperado: a visibilidade das telas passa a depender de `erp_telas`, não do agrupamento `erp_permissoes`.

---

### Passo 6: Tratar perfil sem telas

**Status:** ✅ Concluído

**Arquivo:** Modificar `SUPABASE.js`

**Ação:** Para usuários comuns, ocultar todas as telas quando `erp_telas` estiver vazia; administradores continuam com acesso integral.

```javascript
if (sbIsAdmin()) return;
const permitidas = new Set(['dashboard.html']);
```

**Verificação:**

```powershell
git diff -- SUPABASE.js
```

Esperado: a ausência de vínculos deixa visível somente o Dashboard.

---

### Passo 7: Commit e publicação do ajuste complementar

**Status:** ✅ Concluído

**Arquivos:** Versionar `SUPABASE.js`, `menu.js` e este documento.

**Ação:** Criar commit descritivo e enviar para `origin/main`.

**Verificação:**

```powershell
git log -1 --oneline
```

Esperado: correção complementar publicada no branch principal.

---

### Passo 8: Aplicar as telas do perfil no menu

**Status:** ✅ Concluído

**Arquivo:** Modificar `menu.js`

**Ação:** Ler `erp_telas` do LocalStorage imediatamente antes de montar o HTML e fazer `link()` retornar somente as telas vinculadas ao perfil.

```javascript
let telasDoPerfil = [];
try {
  telasDoPerfil = JSON.parse(localStorage.getItem('erp_telas') || '[]');
} catch {
  telasDoPerfil = [];
}
const telasPermitidas = new Set(telasDoPerfil.map((tela) => tela.nome_html));
```

**Verificação:**

```powershell
git diff -- menu.js
```

Esperado: o menu é montado diretamente a partir da lista de telas do perfil logado.

---

### Passo 9: Centralizar a visibilidade em menu.js

**Status:** ✅ Concluído

**Arquivo:** Modificar `SUPABASE.js`

**Ação:** Remover o filtro visual da sidebar e a manipulação de links/seções. A proteção de acesso direto por URL permanece separada e não altera o menu.

**Verificação:**

```powershell
rg -n "erp_telas|sbFiltrarSidebar" SUPABASE.js menu.js
```

Esperado: a leitura de `erp_telas` para mostrar ou esconder telas existe somente em `menu.js`.

---

### Passo 10: Atualizar as regras do projeto

**Status:** ✅ Concluído

**Arquivo:** Modificar `CLAUDE.md`

**Ação:** Registrar que somente `menu.js` pode validar a visibilidade das telas do perfil e que os demais componentes não podem manipular a sidebar por permissão.

**Verificação:**

```powershell
rg -n "Somente `menu.js`|SUPABASE.js.*não mostra" CLAUDE.md
```

Esperado: a regra de responsabilidade exclusiva está documentada.
