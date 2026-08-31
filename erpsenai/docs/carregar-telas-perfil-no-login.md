# Carregar Telas do Perfil no Login

**Objetivo:** Fazer o login carregar e persistir exclusivamente as telas ativas vinculadas ao `perfil_id` do usuário autenticado.

**Tech Stack:** JavaScript, Supabase REST, LocalStorage e Node.js

---

## Status Geral

| Passo | Descrição | Status |
|-------|-----------|--------|
| 1 | Reproduzir o fluxo incorreto | ✅ Concluído |
| 2 | Corrigir o carregamento por perfil | ✅ Concluído |
| 3 | Validar login, menu e integração real | ✅ Concluído |
| 4 | Commit, push e Graphify | ✅ Concluído |

---

### Passo 1: Reproduzir o fluxo incorreto

**Status:** ✅ Concluído

**Arquivo:** Criar `tests/login-perfil.test.js`.

**Ação:** Simular o Supabase e provar que todos os usuários devem consultar `perfil_sistema` pelo `perfil_id` autenticado.

**Verificação:**

```powershell
node --test tests/login-perfil.test.js
```

---

### Passo 2: Corrigir o carregamento por perfil

**Status:** ✅ Concluído

**Arquivo:** Modificar `SUPABASE.js`.

**Ação:** Remover o atalho por nome de perfil, carregar vínculos e telas ativas pelo ID e propagar falhas de autorização.

---

### Passo 3: Validar login, menu e integração real

**Status:** ✅ Concluído

**Arquivos:** `SUPABASE.js`, `menu.js` e testes.

**Verificação:**

```powershell
node --test tests/login-perfil.test.js tests/menu.test.js tests/menu.integration.test.js
```

**Resultado:** O fluxo usa `perfil_id` para todos os perfis, propaga falhas de autorização e o banco real possui 9 usuários ativos com perfis válidos e telas ativas vinculadas.

---

### Passo 4: Commit, push e Graphify

**Status:** ✅ Concluído

**Ação:** Versionar a correção, enviar para `origin/main` e atualizar o grafo.
