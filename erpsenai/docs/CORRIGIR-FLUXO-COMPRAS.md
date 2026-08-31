# Corrigir Fluxo de Compras

**Objetivo:** Encadear automaticamente as etapas do processo de compras, mantendo rastreabilidade e impedindo registros duplicados.

**Tech Stack:** HTML, JavaScript, Supabase/PostgREST e PostgreSQL.

## Status Geral

| Passo | Descrição | Status |
|---|---|---|
| 1 | Planejamento concluído gera solicitação pendente | ✅ Concluído |
| 2 | Solicitação concluída/aprovada gera pedido pendente | ✅ Concluído |
| 3 | Pedido concluído/confirmado gera pendência de recebimento | ✅ Concluído |
| 4 | Recebimento efetivado atualiza pedido e gera conferência | ✅ Concluído |
| 5 | Conferência aprovada libera o recebimento para nota fiscal | ✅ Concluído |
| 6 | Atualizar regras e esquema do módulo | ✅ Concluído |
| 7 | Commit, push e Graphify | ✅ Concluído |

### Passo 1: Planejamento para solicitação

**Status:** ✅ Concluído

**Arquivo:** Modificar `compras/planejamento.html`.

**Ação:** Ao salvar um planejamento como `Concluído`, criar uma única solicitação `Pendente` com produto, quantidade e referência ao planejamento.

**Verificação prevista (não executar por regra do projeto):** revisar estaticamente a transição e a consulta de duplicidade.

### Passo 2: Solicitação para pedido

**Status:** ✅ Concluído

**Arquivo:** Modificar `compras/solicitacoes.html`.

**Ação:** Ao concluir ou aprovar uma solicitação, criar um único pedido `Pendente`, ainda sem fornecedor, para posterior complementação.

**Verificação prevista (não executar por regra do projeto):** revisar estaticamente os dados copiados e a consulta pelo vínculo `solicitacao_id`.

### Passo 3: Pedido para recebimento

**Status:** ✅ Concluído

**Arquivo:** Modificar `compras/pedidos.html`.

**Ação:** Ao concluir ou confirmar o pedido, criar um único recebimento `Aguardando` com os dados do pedido.

**Verificação prevista (não executar por regra do projeto):** revisar estaticamente a criação e a consulta pelo vínculo `pedido_id`.

### Passo 4: Recebimento para conferência

**Status:** ✅ Concluído

**Arquivo:** Modificar `compras/recebimento.html`.

**Ação:** Ao efetivar o recebimento, atualizar o pedido e criar uma única conferência `Pendente`.

**Verificação prevista (não executar por regra do projeto):** revisar estaticamente a atualização do pedido e o vínculo `recebimento_id`.

### Passo 5: Conferência para nota fiscal

**Status:** ✅ Concluído

**Arquivos:** Modificar `compras/conferencia.html` e `compras/nota-fiscal.html`.

**Ação:** Permitir que somente recebimentos com conferência aprovada avancem para lançamento da nota fiscal.

**Verificação prevista (não executar por regra do projeto):** revisar estaticamente a filtragem e o preenchimento automático.

### Passo 6: Regras e esquema

**Status:** ✅ Concluído

**Arquivos:** Modificar `CLAUDE.md` e `DATABASE.sql`.

**Ação:** Documentar as transições e permitir os estados/vínculos necessários no banco de dados.

**Verificação prevista (não executar por regra do projeto):** conferir consistência entre documentação, selects e restrições SQL.

### Passo 7: Publicação

**Status:** ✅ Concluído

**Ação:** Criar commit descritivo, enviar para `origin/main` e atualizar o Graphify.

**Verificação prevista (não executar testes):** consultar somente o resultado dos comandos Git e Graphify.
