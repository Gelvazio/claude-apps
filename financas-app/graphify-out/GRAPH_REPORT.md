# Graph Report - financas-app  (2026-08-31)

## Corpus Check
- 6 files · ~5,778 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 83 nodes · 92 edges · 9 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d88650b6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]

## God Nodes (most connected - your core abstractions)
1. `Razão — Documentação Técnica` - 20 edges
2. `renderApp()` - 7 edges
3. `Fluxo de Dados` - 6 edges
4. `Razão — controle financeiro pessoal` - 6 edges
5. `loadData()` - 5 edges
6. `Setup e Configuração` - 5 edges
7. `Fluxos Principais` - 5 edges
8. `scripts` - 4 edges
9. `boot()` - 4 edges
10. `Cálculos e Formatação` - 4 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (9 total, 0 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.17
Nodes (15): app, boot(), changeMonth(), DEFAULT_CATS, deleteTx(), drawChart(), fmt(), loadData() (+7 more)

### Community 1 - "Community 1"
Cohesion: 0.11
Nodes (18): Arquitetura, Arquivo `.env`, Comandos Úteis, Componentes Visuais, CSS Classes Principais, Deploy (Vercel), Fluxo de State, Funções Utilitárias (+10 more)

### Community 2 - "Community 2"
Cohesion: 0.15
Nodes (12): dependencies, @supabase/supabase-js, devDependencies, vite, name, private, scripts, build (+4 more)

### Community 3 - "Community 3"
Cohesion: 0.29
Nodes (6): Deploy (Vercel), O que tem, Próximos passos possíveis, Razão — controle financeiro pessoal, Rodar localmente, Setup

### Community 4 - "Community 4"
Cohesion: 0.33
Nodes (6): 1. Autenticação, 2. Carregamento de Dados, 3. Navegação de Mês, 4. Criação de Transação, 5. Exclusão de Transação, Fluxo de Dados

### Community 5 - "Community 5"
Cohesion: 0.40
Nodes (5): 1. Criar Projeto Supabase, 2. Configurar Credenciais, 3. Habilitar Email Auth, 4. Instalar e Rodar, Setup e Configuração

### Community 6 - "Community 6"
Cohesion: 0.40
Nodes (5): Fluxos Principais, Gráfico de 6 Meses, Navegação Mensal, Novo Usuário (Signup + Primeiro Acesso), Usuário Existente

### Community 7 - "Community 7"
Cohesion: 0.50
Nodes (4): Banco de Dados (Supabase), Categorias Padrão (Seed no app), Tabela: `categorias`, Tabela: `transacoes`

### Community 8 - "Community 8"
Cohesion: 0.50
Nodes (4): Cálculo de Saldo, Cálculos e Formatação, Formatação de Moeda, Limites de Mês

## Knowledge Gaps
- **52 isolated node(s):** `name`, `version`, `private`, `type`, `dev` (+47 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Razão — Documentação Técnica` connect `Community 1` to `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`?**
  _High betweenness centrality (0.244) - this node is a cross-community bridge._
- **Why does `Fluxo de Dados` connect `Community 4` to `Community 1`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Why does `Setup e Configuração` connect `Community 5` to `Community 1`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _52 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._