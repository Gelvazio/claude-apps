# Módulo Marketing — Referência de Desenvolvimento

> Gerencia campanhas de marketing e acompanhamento de retornos/resultados.

---

## 1. Campanhas (`campanhas.html`)

Registro e controle de campanhas de marketing.

### Campos

| Campo | Tipo | Regras |
|-------|------|--------|
| Número | Texto | **Gerado automaticamente** — formato `CAM00001` |
| Nome da Campanha | Texto | **Obrigatório** |
| Tipo | Select | Email Marketing, Redes Sociais, SMS, Panfleto, Evento, Mídia Paga, Outros |
| Segmento Alvo | Select | Segmentos de clientes (Tecnologia, Saúde, Varejo, etc.) |
| Canal | Texto | Canal de veiculação |
| Orçamento | Número | R$ — valor investido na campanha |
| Data de Início | Data | **Obrigatório** |
| Data de Término | Data | — |
| Meta de Leads | Número | Quantidade esperada de leads |
| Meta de Conversão | Número | % de conversão esperada |
| Status | Select | Rascunho, Ativa, Pausada, Concluída, Cancelada |
| Responsável | Texto | — |
| Observações | Textarea | — |

### Regras de Negócio
- Campanha ativa aparece na tela de Retornos para registro de resultados.
- ROI calculado automaticamente: `(Retorno − Orçamento) / Orçamento × 100`.

### Tabela Supabase
```sql
CREATE TABLE marketing_campanhas (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  numero          text UNIQUE NOT NULL,
  nome            text NOT NULL,
  tipo            text,
  segmento_alvo   text,
  canal           text,
  orcamento       numeric(12,2) DEFAULT 0,
  data_inicio     date NOT NULL,
  data_termino    date,
  meta_leads      integer,
  meta_conversao  numeric(5,2),
  status          text DEFAULT 'Rascunho',
  responsavel     text,
  observacoes     text,
  created_at      timestamptz DEFAULT now()
);
```

---

## 2. Retornos (`retornos.html`)

Registro dos resultados e retornos de cada campanha.

### Campos

| Campo | Tipo | Regras |
|-------|------|--------|
| Campanha | Select | **Obrigatório** — campanhas ativas ou concluídas |
| Data de Registro | Data | **Obrigatório** — default: hoje |
| Leads Gerados | Número | Quantidade de leads obtidos |
| Leads Convertidos | Número | Leads que viraram clientes |
| Valor de Retorno | Número | R$ — receita gerada pela campanha |
| Taxa de Abertura | Número | % (para email marketing) |
| Cliques | Número | Quantidade de cliques (digital) |
| Impressões | Número | Alcance/visualizações |
| ROI Calculado | Número | **Calculado automaticamente** |
| Observações | Textarea | — |

### Regras de Negócio
- `ROI = (Valor de Retorno − Orçamento da Campanha) / Orçamento × 100`.
- `Taxa de Conversão = Leads Convertidos / Leads Gerados × 100`.

### Tabela Supabase
```sql
CREATE TABLE marketing_retornos (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  campanha_id      uuid REFERENCES marketing_campanhas(id),
  data_registro    date DEFAULT CURRENT_DATE,
  leads_gerados    integer DEFAULT 0,
  leads_convertidos integer DEFAULT 0,
  valor_retorno    numeric(12,2) DEFAULT 0,
  taxa_abertura    numeric(5,2),
  cliques          integer,
  impressoes       integer,
  roi_calculado    numeric(8,2),
  observacoes      text,
  created_at       timestamptz DEFAULT now()
);
```

---

## Numeração Automática

| Entidade | Prefixo | Exemplo |
|----------|---------|---------|
| Campanha | `CAM` | `CAM00001` |
