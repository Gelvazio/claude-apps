# Andamento — Módulo Vendas e Logística

> Ciclo completo de vendas. Atualizado em: 2026-08-16

---

## Fluxo

```
Pedido de Venda → NF Venda → Separação → Romaneio → Expedição → Entrega
```

---

## Telas

| Tela | Arquivo | Status |
|------|---------|--------|
| Pedidos de Venda | `vendas/pedidos-venda.html` | ✅ Concluído |
| Nota Fiscal de Venda | `vendas/nota-fiscal-venda.html` | ✅ Concluído |
| Separação (Picking) | `vendas/separacao.html` | ✅ Concluído |
| Romaneio | `vendas/romaneio.html` | ✅ Concluído |
| Expedição | `vendas/expedicao.html` | ✅ Concluído |
| Entrega | `vendas/entrega.html` | ✅ Concluído |
| Tele Vendas | `vendas/televendas.html` | ✅ Concluído |
| Logística | `vendas/logistica.html` | ✅ Concluído |

---

## Banco de Dados (Supabase)

| Tabela | Status | Obs |
|--------|--------|-----|
| `vendas_pedidos` | ✅ Criada | Inclui coluna `etapa` (default: 'Pedido de Venda') |
| `vendas_notas_fiscais` | ✅ Criada | — |
| `vendas_separacoes` | ✅ Criada | — |
| `vendas_romaneios` | ✅ Criada | — |
| `vendas_expedicoes` | ✅ Criada | — |
| `vendas_entregas` | ✅ Criada | — |
| `televendas` | ✅ Criada | 10 registros de teste |

---

## Funcionalidades Especiais

| Funcionalidade | Status |
|----------------|--------|
| Verificação de estoque ao confirmar PV | ❌ A implementar |
| Múltiplos produtos por pedido | ❌ A implementar |
| Baixa automática de estoque na Expedição | ❌ A implementar |
| Rastreamento de entrega por código | ❌ A implementar |

---

## Observações

- Todas as 8 telas existem e renderizam corretamente.
- `televendas.html` tem spec de tabela própria (ver `vendas/CLAUDE.md`).
- Todas as tabelas no Supabase já foram criadas com dados de teste.
- `logistica.html` usa campo `etapa` da tabela `vendas_pedidos` para controlar o pipeline.
