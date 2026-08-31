# Criar script de atualização da senha do administrador

**Objetivo:** Criar um script SQL para atualizar a senha de `admin@erp.com` usando o hash SHA-256 definido para a credencial padrão.

**Tech Stack:** PostgreSQL e Supabase

---

## Status Geral

| Passo | Descrição | Status |
|-------|-----------|--------|
| 1 | Criar o script SQL | ✅ Concluído |
| 2 | Documentar o comportamento seguro | ✅ Concluído |
| 3 | Commit e push | 🔄 Em progresso |

---

### Passo 1: Criar o script SQL

**Status:** ✅ Concluído

**Arquivo:** Criar `C:\fontes\professor-senai\erp-victor-anato-senai\UPDATE_SENHA_ADMIN.sql`

**Ação:** Atualizar `senha_hash` exclusivamente para o registro identificado por `admin@erp.com`.

```sql
UPDATE erp_usuarios
SET senha_hash = '166da0daa25c3edb40d87c1634bbee0eda8b50ccd82f93c36c54c35a004e5561'
WHERE email = 'admin@erp.com';
```

**Verificação:** Não executar testes nem o script, conforme as regras do projeto.

---

### Passo 2: Documentar o comportamento seguro

**Status:** ✅ Concluído

**Arquivo:** Modificar `C:\fontes\professor-senai\erp-victor-anato-senai\UPDATE_SENHA_ADMIN.sql`

**Ação:** Não registrar a senha em texto puro e emitir erro caso o usuário não exista.

**Verificação:** Não executar testes nem o script, conforme as regras do projeto.

---

### Passo 3: Commit e push

**Status:** 🔄 Em progresso

**Arquivo:** Versionar somente os arquivos desta tarefa.

**Ação:** Criar commit descritivo e enviar para `origin/main`.

**Verificação:** Conferir o resultado dos comandos Git.
