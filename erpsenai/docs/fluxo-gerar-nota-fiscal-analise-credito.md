# Fluxo GERAR_NOTA_FISCAL e análise de crédito

**Objetivo:** Controlar a geração da Nota Fiscal pelo status do Pedido de Venda e encaminhar crediários sem limite para análise de crédito.

**Tech Stack:** HTML, JavaScript, Supabase REST e PostgreSQL.

---

## Status Geral

| Passo | Descrição | Status |
|-------|-----------|--------|
| 1 | Adicionar os novos status ao pedido | ✅ Concluído |
| 2 | Aplicar a decisão de crédito antes da Nota Fiscal | ✅ Concluído |
| 3 | Direcionar o usuário para a etapa correspondente | ✅ Concluído |
| 4 | Atualizar a restrição SQL | ✅ Concluído |
| 5 | Commit e publicação | ✅ Concluído |

---

### Passo 1: Novos status

**Status:** ✅ Concluído

**Arquivo:** Modificar `vendas/pedidos-venda.html`.

**Ação:** Disponibilizar `GERAR_NOTA_FISCAL` e `EM_ANALISE_CREDITO` no fluxo do pedido.

**Verificação prevista:** Revisar estaticamente as opções e badges de status. Não executar por regra do projeto.

### Passo 2: Decisão de crédito

**Status:** ✅ Concluído

**Arquivo:** Modificar `vendas/pedidos-venda.html`.

**Ação:** Somente verificar limite quando o usuário solicitar a geração da nota para uma venda no crediário.

**Verificação prevista:** Revisar os ramos à vista, crediário com limite e crediário sem limite. Não executar por regra do projeto.

### Passo 3: Direcionamento

**Status:** ✅ Concluído

**Arquivo:** Modificar `vendas/pedidos-venda.html`.

**Ação:** Abrir Nota Fiscal após geração ou Análise de Crédito quando o limite for insuficiente.

**Verificação prevista:** Revisar estaticamente os destinos das navegações. Não executar por regra do projeto.

### Passo 4: Restrição SQL

**Status:** ✅ Concluído

**Arquivo:** Modificar `DATABASE.sql`.

**Ação:** Permitir os novos valores na restrição de status de `vendas_pedidos`.

**Verificação prevista:** Revisar estaticamente o comando SQL. Não executar por regra do projeto.

### Passo 5: Publicação

**Status:** ✅ Concluído

**Ação:** Versionar e publicar somente os arquivos desta tarefa.

**Verificação prevista:** Conferir o commit e a referência remota sem executar testes.
