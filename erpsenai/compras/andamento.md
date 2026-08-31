# Andamento — Módulo Compras

> Ciclo completo de compras. Atualizado em: 2026-08-16

---

## Fluxo

```
Planejamento → Solicitação → Pedido → Recebimento → Conferência → NF Entrada
```

---

## Telas

| Tela | Arquivo | Status |
|------|---------|--------|
| Planejamento | `compras/planejamento.html` | ✅ Concluído |
| Solicitações de Compras | `compras/solicitacoes.html` | ✅ Concluído |
| Pedidos de Compras | `compras/pedidos.html` | ✅ Concluído |
| Recebimento | `compras/recebimento.html` | ✅ Concluído |
| Conferência | `compras/conferencia.html` | ✅ Concluído |
| Entrada de Nota Fiscal | `compras/nota-fiscal.html` | ✅ Concluído |

---

## Banco de Dados (Supabase)

| Tabela | Status |
|--------|--------|
| `compras_planejamento` | ✅ Criada |
| `compras_solicitacoes` | ✅ Criada |
| `compras_pedidos` | ✅ Criada |
| `compras_recebimentos` | ✅ Criada |
| `compras_conferencias` | ✅ Criada |
| `compras_notas_fiscais` | ✅ Criada |

---

## Funcionalidades Especiais

| Funcionalidade | Status |
|----------------|--------|
| Geração de PDF do Pedido | ❌ A implementar |
| Preenchimento automático (SC → PC) | ❌ A implementar |
| Atualização de estoque ao lançar NF | ❌ A implementar |

---

## Observações

- Todas as telas existem e renderizam corretamente.
- Integração com Supabase pendente.
