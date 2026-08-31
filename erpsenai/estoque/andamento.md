# Andamento — Módulo Estoque

> Controle de armazenagem, movimentações e inventário. Atualizado em: 2026-08-16

---

## Telas

| Tela | Arquivo | Status |
|------|---------|--------|
| Controle de Estoque | `estoque/controle.html` | ✅ Concluído |
| Movimentações | `estoque/movimentacoes.html` | ✅ Concluído |
| Armazenagem | `estoque/armazenagem.html` | ✅ Concluído |
| Inventário | `estoque/inventario.html` | ✅ Concluído |

---

## Banco de Dados (Supabase)

| Tabela | Status |
|--------|--------|
| `estoque_movimentacoes` | ✅ Criada |
| `estoque_inventarios` | ✅ Criada |

---

## Funcionalidades Especiais

| Funcionalidade | Status |
|----------------|--------|
| Indicadores de status (🟢🟡🔴) no Controle | ❌ A implementar |
| Geração automática de movimentação ao ajustar inventário | ❌ A implementar |
| Atualização de `estoque_atual` via movimentações | ❌ A implementar |

---

## Observações

- Todas as telas existem e renderizam corretamente.
- O painel de Controle de Estoque lê dados de `produtos` — depende do módulo Cadastros estar integrado.
