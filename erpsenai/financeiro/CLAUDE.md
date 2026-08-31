# Módulo Financeiro — Referência de Desenvolvimento

> Controla o fluxo de caixa, contas a pagar, contas a receber, análise de crédito e balanço gerencial.

---

## 1. Contas a Pagar (`contas-pagar.html`)

Registro e controle de obrigações financeiras da empresa.

### Campos

| Campo | Tipo | Regras |
|-------|------|--------|
| Número | Texto | **Gerado automaticamente** |
| Fornecedor | Select | Fornecedores ativos |
| Descrição | Texto | **Obrigatório** — descrição da despesa |
| Valor | Número | **Obrigatório** — formato R$ 1.000,00 |
| Vencimento | Data | **Obrigatório** |
| Data de Pagamento | Data | Preenchida ao quitar |
| Categoria | Select | Fornecedor, Salários, Impostos, Aluguel, Serviços, Outros |
| Status | Select | Em Aberto, Pago, Vencido, Cancelado |
| Forma de Pagamento | Select | Boleto, PIX, TED, Cartão, Dinheiro |
| Observações | Textarea | — |

### Regras de Negócio
- Status muda automaticamente para **"Vencido"** quando `Vencimento < hoje` e Status = "Em Aberto".
- Ao marcar como **"Pago"**, registrar data de pagamento automaticamente (default: hoje).

### Tabela Supabase
```sql
CREATE TABLE fin_contas_pagar (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  numero          text UNIQUE NOT NULL,
  fornecedor_id   uuid REFERENCES fornecedores(id),
  descricao       text NOT NULL,
  valor           numeric(12,2) NOT NULL,
  vencimento      date NOT NULL,
  data_pagamento  date,
  categoria       text,
  status          text DEFAULT 'Em Aberto',
  forma_pagamento text,
  observacoes     text,
  created_at      timestamptz DEFAULT now()
);
```

---

## 2. Contas a Receber (`contas-receber.html`)

Registro e controle de valores a receber de clientes.

### Campos

| Campo | Tipo | Regras |
|-------|------|--------|
| Número | Texto | **Gerado automaticamente** |
| Cliente | Select | Clientes ativos |
| Pedido de Venda | Select | PV vinculado (opcional) |
| Descrição | Texto | **Obrigatório** |
| Valor | Número | **Obrigatório** |
| Vencimento | Data | **Obrigatório** |
| Data de Recebimento | Data | Preenchida ao receber |
| Categoria | Select | Venda, Serviço, Aluguel, Outros |
| Status | Select | Em Aberto, Recebido, Vencido, Cancelado |
| Forma de Recebimento | Select | Boleto, PIX, TED, Cartão, Dinheiro |
| Observações | Textarea | — |

### Tabela Supabase
```sql
CREATE TABLE fin_contas_receber (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  numero              text UNIQUE NOT NULL,
  cliente_id          uuid REFERENCES clientes(id),
  pedido_id           uuid REFERENCES vendas_pedidos(id),
  descricao           text NOT NULL,
  valor               numeric(12,2) NOT NULL,
  vencimento          date NOT NULL,
  data_recebimento    date,
  categoria           text,
  status              text DEFAULT 'Em Aberto',
  forma_recebimento   text,
  observacoes         text,
  created_at          timestamptz DEFAULT now()
);
```

---

## 3. Balancete Gerencial (`balancete.html`)

Painel de análise financeira consolidada — **não possui formulário de cadastro**.

### Funcionalidade
- Resumo de Receitas vs Despesas por período.
- Gráficos: fluxo de caixa mensal, distribuição por categoria.
- KPIs: Total a Receber, Total a Pagar, Saldo Projetado.
- Filtros por período (mês/ano) e categoria.
- Dados calculados das tabelas `fin_contas_pagar` e `fin_contas_receber`.

---

## 4. Análise de Crédito (`analisecredito.html`)

Score de crédito e análise de risco de clientes.

### Funcionalidade
- Consulta de score de crédito de um cliente.
- Histórico de pedidos e adimplência.
- Indicadores: pedidos em aberto, valor total em aberto, média de atraso.
- Parecer automático: Baixo Risco / Médio Risco / Alto Risco.
- Filtros por cliente e período.

---

## Padrões de Interface

- Alertas visuais para contas vencidas (badge vermelho).
- Alertas para contas próximas ao vencimento (badge laranja — vencimento em até 5 dias).
- Listagem com totalizadores por status no rodapé da tabela.
- Exportação para PDF disponível nos painéis gerenciais.
