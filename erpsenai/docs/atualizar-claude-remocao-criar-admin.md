# Atualizar documentação após remoção do criar-admin

**Objetivo:** Registrar no `CLAUDE.md` que `criar-admin.html` foi removido e não deve voltar a ser usado.

**Tech Stack:** Markdown e PostgreSQL/Supabase

---

## Status Geral

| Passo | Descrição | Status |
|-------|-----------|--------|
| 1 | Documentar a remoção do fluxo HTML | ✅ Concluído |
| 2 | Indicar o fluxo SQL vigente | ✅ Concluído |
| 3 | Commit e push | 🔄 Em progresso |

---

### Passo 1: Documentar a remoção do fluxo HTML

**Status:** ✅ Concluído

**Arquivo:** Modificar `C:\fontes\professor-senai\erp-victor-anato-senai\CLAUDE.md`

**Ação:** Declarar que `criar-admin.html` foi excluído e não pode ser recriado ou referenciado.

**Verificação:** Não executar testes, conforme as regras do projeto.

---

### Passo 2: Indicar o fluxo SQL vigente

**Status:** ✅ Concluído

**Arquivo:** Modificar `C:\fontes\professor-senai\erp-victor-anato-senai\CLAUDE.md`

**Ação:** Orientar que alterações da senha administrativa sejam feitas pelo SQL Editor do Supabase usando `UPDATE_SENHA_ADMIN.sql`.

**Verificação:** Não executar testes, conforme as regras do projeto.

---

### Passo 3: Commit e push

**Status:** 🔄 Em progresso

**Arquivo:** Versionar a documentação e a remoção relacionadas à tarefa.

**Ação:** Criar commit descritivo e enviar para `origin/main`.

**Verificação:** Conferir o resultado dos comandos Git.
