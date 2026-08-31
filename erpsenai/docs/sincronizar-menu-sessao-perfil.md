# Sincronizar Menu com o Perfil da Sessão

**Objetivo:** Recarregar no Supabase as telas vinculadas ao `perfil_id` do usuário em cada sessão válida e atualizar a sidebar sem depender de novo login ou de dados antigos do navegador.

**Tech Stack:** JavaScript, Supabase REST, LocalStorage, DOM Events e Node.js

---

## Status Geral

| Passo | Descrição | Status |
|-------|-----------|--------|
| 1 | Confirmar a causa no ciclo real da sessão | ✅ Concluído |
| 2 | Criar regressão da sessão com `erp_telas` desatualizado | 🔄 Em progresso |
| 3 | Centralizar a leitura de telas pelo `perfil_id` | ⬜ Pendente |
| 4 | Atualizar a sidebar após a sincronização | ⬜ Pendente |
| 5 | Corrigir páginas sem o carregamento de `SUPABASE.js` e invalidar cache antigo | ⬜ Pendente |
| 6 | Simular login, restauração de sessão e perfis reais | ⬜ Pendente |
| 7 | Commit, push e Graphify | ⬜ Pendente |

---

### Passo 1: Confirmar a causa no ciclo real da sessão

**Status:** ✅ Concluído

**Arquivos:** `index.html`, `menu.js`, `SUPABASE.js` e páginas HTML protegidas.

**Ação:** Rastrear `erp_perfil_id → perfil_sistema → tela → erp_telas → menu.js` desde o login até a restauração de uma sessão existente.

**Evidência:** `index.html` redireciona sessões de até oito horas sem chamar `sbLogin`; `erp_telas` somente era calculado dentro de `sbLogin`. Depois, `menu.js` monta a sidebar de forma síncrona antes de `SUPABASE.js`, usando o valor antigo ou vazio. A sessão protegida ainda usa duração diferente, de uma hora.

**Verificação:**

```powershell
rg -n "erp_telas|erp_perfil_id|OITO_HORAS|SESSAO_MAX_MS|menu.js|SUPABASE.js" index.html menu.js SUPABASE.js dashboard.html
```

Esperado: identificar o redirecionamento sem recarga das telas, a única gravação no login e a ordem dos scripts.

---

### Passo 2: Criar regressão da sessão desatualizada

**Status:** 🔄 Em progresso

**Arquivo:** Modificar `tests/menu.integration.test.js` e `tests/login-perfil.test.js`.

**Ação:** Simular uma sessão válida com `erp_telas=[]`, sincronizar o perfil corrente e exigir que o menu seja renderizado novamente com as telas retornadas.

**Verificação:**

```powershell
C:\programas\node\node.exe --test tests\menu.integration.test.js tests\login-perfil.test.js
```

Esperado antes da implementação: a sidebar continua vazia; depois da implementação: recebe somente as telas do perfil.

---

### Passo 3: Centralizar a leitura de telas pelo perfil

**Status:** ⬜ Pendente

**Arquivo:** Modificar `SUPABASE.js`.

**Ação:** Criar uma função reutilizável que consulta `perfil_sistema` pelo `perfil_id`, busca as telas ativas e publica `erp_telas` e `erp_permissoes`. Usá-la tanto no login quanto na restauração da sessão, sem substituir o cache por uma lista vazia quando ocorrer falha de rede.

**Verificação:**

```powershell
C:\programas\node\node.exe --check SUPABASE.js
```

Esperado: sintaxe válida e uma única implementação do carregamento de acessos.

---

### Passo 4: Atualizar a sidebar após a sincronização

**Status:** ⬜ Pendente

**Arquivo:** Modificar `menu.js`.

**Ação:** Transformar a montagem em função reexecutável, renderizar o cache imediatamente e ouvir o evento de atualização emitido após a consulta do perfil.

**Verificação:**

```powershell
C:\programas\node\node.exe --test tests\menu.test.js tests\menu.integration.test.js
```

Esperado: a sidebar passa de vazia para os links autorizados sem recarregar a página.

---

### Passo 5: Cobrir todas as páginas e invalidar cache antigo

**Status:** ⬜ Pendente

**Arquivos:** Páginas HTML que carregam `menu.js`.

**Ação:** Incluir `SUPABASE.js` nas páginas de gamificação que não o carregam e versionar as referências aos dois scripts compartilhados para que o navegador busque a correção publicada.

**Verificação:**

```powershell
rg -L "SUPABASE.js" gamificacao\*.html
rg -n "menu.js\?v=|SUPABASE.js\?v=" --glob "*.html"
```

Esperado: toda página com sidebar carrega os dois scripts corrigidos e nenhuma referência permanece presa à versão anterior.

---

### Passo 6: Simular o fluxo completo

**Status:** ⬜ Pendente

**Arquivos:** `tests/` e dados REST de leitura do Supabase.

**Ação:** Executar as regressões, simular a restauração de sessão e comparar as telas renderizadas com os vínculos atuais dos perfis no Supabase.

**Verificação:**

```powershell
C:\programas\node\node.exe --test tests\*.test.js
```

Esperado: todas as regressões aprovadas e nenhum link fora do perfil.

---

### Passo 7: Commit, push e Graphify

**Status:** ⬜ Pendente

**Arquivos:** Todos os arquivos alterados nesta correção.

**Ação:** Versionar somente os arquivos da tarefa, enviar `main` e atualizar o grafo incremental.

**Verificação:**

```powershell
git status --short --branch
git log -1 --oneline
```

Esperado: `main` sincronizada com `origin/main`, preservando arquivos não relacionados.
