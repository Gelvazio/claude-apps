# Módulo Compras — Referência de Desenvolvimento

> Controla todo o ciclo de compras: do planejamento ao recebimento e entrada de nota fiscal.

---

## Fluxo

```
Planejamento → Solicitação de Compras → Pedido de Compras → Recebimento → Conferência → Entrada de Nota Fiscal
```

---

## 1. Planejamento (`planejamento.html`)

Registro do planejamento de compras por período.

### Campos

| Campo | Tipo | Regras |
|-------|------|--------|
| Título | Texto | **Obrigatório** |
| Tipo | Select | Mensal, Trimestral, Anual |
| Produto | Select | Produtos ativos |
| Período | Texto | Mês/Ano ou intervalo de datas |
| Qtd. Planejada | Número | Quantidade prevista |
| Qtd. Realizada | Número | Atualizada ao longo do período |
| Status | Select | Em Planejamento, Em Andamento, Concluído, Cancelado |
| Data | Data | Data do planejamento |
| Observações | Textarea | — |

### Tabela Supabase
```sql
CREATE TABLE compras_planejamento (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo        text NOT NULL,
  tipo          text,
  produto_id    uuid REFERENCES produtos(id),
  periodo       text,
  qtd_planejada numeric(12,3),
  qtd_realizada numeric(12,3) DEFAULT 0,
  status        text DEFAULT 'Em Planejamento',
  data          date,
  observacoes   text,
  created_at    timestamptz DEFAULT now()
);
```

---

## 2. Solicitações de Compras (`solicitacoes.html`)

Registro formal de necessidade de compra de um produto.

### Campos

| Campo | Tipo | Regras |
|-------|------|--------|
| Número | Texto | **Gerado automaticamente** — formato `SC00001` |
| Produto | Select | **Obrigatório** — produtos ativos |
| Quantidade | Número | **Obrigatório** |
| Unidade | Texto | Preenchido automaticamente pelo produto |
| Solicitante | Texto | Nome ou usuário |
| Prioridade | Select | Baixa, Média, Alta, Urgente |
| Status | Select | Pendente, Em Análise, Aprovada, Reprovada, Cancelada |
| Data | Data | Default: hoje |
| Observações | Textarea | — |

### Tabela Supabase
```sql
CREATE TABLE compras_solicitacoes (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  numero      text UNIQUE NOT NULL,
  produto_id  uuid REFERENCES produtos(id),
  quantidade  numeric(12,3) NOT NULL,
  unidade     text,
  solicitante text,
  prioridade  text DEFAULT 'Média',
  status      text DEFAULT 'Pendente',
  data        date DEFAULT CURRENT_DATE,
  observacoes text,
  created_at  timestamptz DEFAULT now()
);
```

---

## 3. Pedidos de Compras (`pedidos.html`)

Formalização da compra junto ao fornecedor.

### Campos

| Campo | Tipo | Regras |
|-------|------|--------|
| Número | Texto | **Gerado automaticamente** — formato `PC00001` |
| Solicitação de Compras | Select | SC vinculada (opcional) |
| Fornecedor | Select | **Obrigatório** — fornecedores ativos |
| Produto | Select | **Obrigatório** — produtos ativos |
| Quantidade | Número | **Obrigatório** |
| Preço Unitário | Número | R$ |
| Valor Total | Número | **Calculado**: Quantidade × Preço Unitário |
| Status | Select | Rascunho, Enviado, Confirmado, Cancelado, Recebido |
| Data | Data | Default: hoje |
| Data Prevista | Data | Previsão de entrega |
| Observações | Textarea | — |

### Ação Especial
- Botão **"Salvar como PDF"**: gera PDF com dados completos do pedido para envio ao fornecedor.

### Tabela Supabase
```sql
CREATE TABLE compras_pedidos (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  numero         text UNIQUE NOT NULL,
  solicitacao_id uuid REFERENCES compras_solicitacoes(id),
  fornecedor_id  uuid REFERENCES fornecedores(id),
  produto_id     uuid REFERENCES produtos(id),
  quantidade     numeric(12,3) NOT NULL,
  preco_unitario numeric(12,2),
  valor_total    numeric(12,2),
  status         text DEFAULT 'Rascunho',
  data           date DEFAULT CURRENT_DATE,
  data_prevista  date,
  observacoes    text,
  created_at     timestamptz DEFAULT now()
);
```

---

## 4. Recebimento (`recebimento.html`)

Registro da chegada física da mercadoria.

### Campos

| Campo | Tipo | Regras |
|-------|------|--------|
| Número | Texto | **Gerado automaticamente** — formato `RC00001` |
| Pedido de Compra | Select | PC vinculado |
| Fornecedor | Select | Preenchido automaticamente pelo PC |
| Produto | Select | **Obrigatório** |
| Qtd. Esperada | Número | Preenchida pelo PC |
| Qtd. Recebida | Número | Quantidade que chegou fisicamente |
| Status | Select | Aguardando, Recebido Parcial, Recebido Total, Com Divergência |
| Responsável | Texto | — |
| Data | Data | Default: hoje |
| Observações | Textarea | — |

### Tabela Supabase
```sql
CREATE TABLE compras_recebimentos (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  numero        text UNIQUE NOT NULL,
  pedido_id     uuid REFERENCES compras_pedidos(id),
  fornecedor_id uuid REFERENCES fornecedores(id),
  produto_id    uuid REFERENCES produtos(id),
  qtd_esperada  numeric(12,3),
  qtd_recebida  numeric(12,3),
  status        text DEFAULT 'Aguardando',
  responsavel   text,
  data          date DEFAULT CURRENT_DATE,
  observacoes   text,
  created_at    timestamptz DEFAULT now()
);
```

---

## 5. Conferência (`conferencia.html`)

Verificação da conformidade do que foi recebido.

### Campos

| Campo | Tipo | Regras |
|-------|------|--------|
| Número do Recebimento | Select | **Obrigatório** — vinculado a um Recebimento |
| Fornecedor | Texto | Preenchido automaticamente |
| Produto | Select | **Obrigatório** |
| Qtd. Esperada | Número | Vinda do Recebimento |
| Qtd. Recebida | Número | Quantidade conferida |
| Status | Select | Aprovado, Reprovado, Em Análise, Pendente |
| Responsável | Texto | Conferente |
| Data | Data | — |
| Observações | Textarea | Registrar avarias, discrepâncias etc. |

### Tabela Supabase
```sql
CREATE TABLE compras_conferencias (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  recebimento_id uuid REFERENCES compras_recebimentos(id),
  fornecedor_id  uuid REFERENCES fornecedores(id),
  produto_id     uuid REFERENCES produtos(id),
  qtd_esperada   numeric(12,3),
  qtd_recebida   numeric(12,3),
  status         text DEFAULT 'Em Análise',
  responsavel    text,
  data           date DEFAULT CURRENT_DATE,
  observacoes    text,
  created_at     timestamptz DEFAULT now()
);
```

---

## 6. Entrada de Nota Fiscal (`nota-fiscal.html`)

Registro da NF do fornecedor para fins contábeis/fiscais.

### Campos

| Campo | Tipo | Regras |
|-------|------|--------|
| Número da NF | Texto | **Obrigatório** |
| Fornecedor | Select | **Obrigatório** |
| Recebimento | Select | Recebimento vinculado |
| Valor | Número | Total da NF em R$ |
| Qtd. Itens | Número | Itens na nota |
| Status | Select | Pendente, Lançada, Cancelada, Devolvida |
| Data | Data | Data de emissão da NF |
| Observações | Textarea | — |

### Regra de Negócio
- Ao confirmar NF com status **"Lançada"**, atualizar o `estoque_atual` do produto (entrada no estoque).

### Tabela Supabase
```sql
CREATE TABLE compras_notas_fiscais (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_nf      text NOT NULL,
  fornecedor_id  uuid REFERENCES fornecedores(id),
  recebimento_id uuid REFERENCES compras_recebimentos(id),
  valor          numeric(12,2),
  qtd_itens      integer,
  status         text DEFAULT 'Pendente',
  data           date DEFAULT CURRENT_DATE,
  observacoes    text,
  created_at     timestamptz DEFAULT now()
);
```

---

## Numeração Automática

| Entidade | Prefixo | Exemplo |
|----------|---------|---------|
| Solicitação | `SC` | `SC00001` |
| Pedido | `PC` | `PC00001` |
| Recebimento | `RC` | `RC00001` |
