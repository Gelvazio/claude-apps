# Correção da geração de nota fiscal ao finalizar pedido

## Objetivo

Garantir que a confirmação de um Pedido de Venda gere automaticamente uma Nota Fiscal de Venda em rascunho, vinculada ao pedido e sem duplicidades.

## Etapas

1. ✅ Rastrear o fluxo de salvamento/finalização do Pedido de Venda.
2. ✅ Identificar a ausência da criação da Nota Fiscal de Venda.
3. ✅ Implementar a geração automática e idempotente da nota fiscal.
4. ✅ Corrigir pedidos que já estavam confirmados e continuavam sem nota fiscal.
5. ✅ Registrar a conclusão e versionar os arquivos alterados.

## Diagnóstico

O método `salvar()` de `vendas/pedidos-venda.html` atualizava ou inseria o pedido e encerrava o fluxo sem consultar nem inserir registros na tabela `vendas_notas_fiscais`.

Após a primeira correção, a geração ainda dependia exclusivamente da mudança de status para `Confirmado`. Pedidos que já estavam confirmados antes da correção não entravam novamente nesse fluxo e permaneciam sem nota fiscal. O salvamento de qualquer pedido confirmado agora consulta a nota vinculada e cria somente quando ela ainda não existe.

## Validação prevista

Por regra do projeto, não serão executados testes, servidor ou navegador. A revisão será limitada à inspeção estática do fluxo e do diff.
