# Adicionar Fornecedor à Solicitação de Compra

**Objetivo:** Vincular fornecedor à solicitação e exigir sua seleção antes da aprovação ou conclusão.

**Tech Stack:** HTML, JavaScript, Supabase/PostgREST e PostgreSQL.

## Status Geral

| Passo | Descrição | Status |
|---|---|---|
| 1 | Adicionar `fornecedor_id` ao esquema | ✅ Concluído |
| 2 | Adicionar combobox ao modal | ✅ Concluído |
| 3 | Validar fornecedor na aprovação | ✅ Concluído |
| 4 | Herdar fornecedor no pedido automático | ✅ Concluído |
| 5 | Atualizar regras do módulo | ✅ Concluído |
| 6 | Commit, push e Graphify | ✅ Concluído |

### Passo 1: Esquema

**Status:** ✅ Concluído

**Arquivo:** Modificar `DATABASE.sql`.

**Ação:** Criar a coluna opcional `fornecedor_id`, vinculada a `fornecedores(id)`.

**Verificação prevista:** revisão estática; testes são proibidos pelas regras do projeto.

### Passo 2: Modal

**Status:** ✅ Concluído

**Arquivo:** Modificar `compras/solicitacoes.html`.

**Ação:** Carregar fornecedores ativos em um combobox e preservar a seleção ao editar.

**Verificação prevista:** revisão estática; testes são proibidos pelas regras do projeto.

### Passo 3: Aprovação

**Status:** ✅ Concluído

**Arquivo:** Modificar `compras/solicitacoes.html`.

**Ação:** Impedir os estados `Aprovada` e `Concluída` sem fornecedor.

**Verificação prevista:** revisão estática; testes são proibidos pelas regras do projeto.

### Passo 4: Pedido automático

**Status:** ✅ Concluído

**Arquivo:** Modificar `compras/solicitacoes.html`.

**Ação:** Copiar `fornecedor_id` para o pedido gerado automaticamente.

**Verificação prevista:** revisão estática; testes são proibidos pelas regras do projeto.

### Passo 5: Regras

**Status:** ✅ Concluído

**Arquivo:** Modificar `CLAUDE.md`.

**Ação:** Documentar o vínculo e a obrigatoriedade condicional.

**Verificação prevista:** revisão estática; testes são proibidos pelas regras do projeto.

### Passo 6: Publicação

**Status:** ✅ Concluído

**Ação:** Criar commit, enviar para `origin/main` e atualizar o Graphify.
