# Módulo Estoque — Referência de Desenvolvimento

> Controla armazenagem, movimentações e inventário dos produtos.

---

## 1. Controle de Estoque (`controle.html`)

Painel de visão geral — **não possui formulário de cadastro próprio**.

### Funcionalidade
- Exibe todos os produtos cadastrados com: Código, Nome, Categoria, Unidade, Estoque Atual, Estoque Mínimo, Estoque Máximo.
- Indicador visual de status:
  - 🟢 **Normal**: `Estoque Atual > Estoque Mínimo`
  - 🟡 **Atenção**: `Estoque Atual = Estoque Mínimo`
  - 🔴 **Crítico**: `Estoque Atual < Estoque Mínimo`
- Filtros por Categoria, Status e busca por nome/código.
- Dados exclusivamente da tabela `produtos` + histórico de `estoque_movimentacoes`.

---

## 2. Movimentações (`movimentacoes.html`)

Histórico completo de todas as movimentações de estoque.

### Campos

| Campo | Tipo | Regras |
|-------|------|--------|
| Número | Texto | **Gerado automaticamente** — formato `MV00001` |
| Produto | Select | **Obrigatório** |
| Tipo | Select | Entrada, Saída, Transferência |
| Quantidade | Número | **Obrigatório** |
| Origem | Texto | Local/endereço de origem |
| Destino | Texto | Local/endereço de destino |
| Usuário | Texto | Quem registrou |
| Data | Data | — |
| Hora | Hora | — |
| Observações | Textarea | — |

### Tabela Supabase
```sql
CREATE TABLE estoque_movimentacoes (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  numero     text UNIQUE NOT NULL,
  produto_id uuid REFERENCES produtos(id),
  tipo       text,
  quantidade numeric(12,3) NOT NULL,
  origem     text,
  destino    text,
  usuario    text,
  data       date DEFAULT CURRENT_DATE,
  hora       time DEFAULT CURRENT_TIME,
  observacoes text,
  created_at timestamptz DEFAULT now()
);
```

---

## 3. Armazenagem (`armazenagem.html`)

Registro de movimentações físicas entre endereços/locais do estoque.

### Campos

| Campo | Tipo | Regras |
|-------|------|--------|
| Número | Texto | **Gerado automaticamente** — formato `MV00001` |
| Produto | Select | **Obrigatório** |
| Tipo | Select | Entrada, Saída, Transferência |
| Quantidade | Número | **Obrigatório** |
| Origem (Endereço) | Texto | Localização de onde sai |
| Destino (Endereço) | Texto | Localização para onde vai |
| Usuário | Texto | Responsável |
| Data | Data | — |
| Hora | Hora | — |
| Observações | Textarea | — |

---

## 4. Inventário (`inventario.html`)

Contagem física para conciliação com o sistema.

### Campos

| Campo | Tipo | Regras |
|-------|------|--------|
| Número | Texto | **Gerado automaticamente** — formato `INV00001` |
| Produto | Select | **Obrigatório** |
| Qtd. Sistema | Número | Preenchida automaticamente com `estoque_atual` |
| Qtd. Contada | Número | Apurada na contagem física |
| Diferença | Número | **Calculada**: Qtd. Contada − Qtd. Sistema |
| Status | Select | Pendente, Em Contagem, Conferido, Ajustado |
| Responsável | Texto | — |
| Data | Data | — |
| Observações | Textarea | — |

### Regra de Negócio
- Ao marcar como **"Ajustado"**, gerar automaticamente uma Movimentação de ajuste (positivo ou negativo) para corrigir o `estoque_atual`.

### Tabela Supabase
```sql
CREATE TABLE estoque_inventarios (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  numero      text UNIQUE NOT NULL,
  produto_id  uuid REFERENCES produtos(id),
  qtd_sistema numeric(12,3),
  qtd_contada numeric(12,3),
  diferenca   numeric(12,3),
  status      text DEFAULT 'Pendente',
  responsavel text,
  data        date DEFAULT CURRENT_DATE,
  observacoes text,
  created_at  timestamptz DEFAULT now()
);
```

---

## Numeração Automática

| Entidade | Prefixo | Exemplo |
|----------|---------|---------|
| Movimentação | `MV` | `MV00001` |
| Inventário | `INV` | `INV00001` |
