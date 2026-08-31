# Graph Report - claude-apps  (2026-08-31)

## Corpus Check
- 22 files · ~73,579 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 230 nodes · 254 edges · 20 communities (19 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a8dee538`
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
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]

## God Nodes (most connected - your core abstractions)
1. `Razão — Documentação Técnica` - 20 edges
2. `📊 Dashboard Financeiro - Documentação Técnica` - 15 edges
3. `render()` - 8 edges
4. `Projeto: Dashboard Financeiro` - 8 edges
5. `✅ PASSOS DE EXECUÇÃO` - 8 edges
6. `renderApp()` - 7 edges
7. `handleExcluir()` - 7 edges
8. `Dashboard Principal (`index.html` + `main.js`)` - 7 edges
9. `Fluxo de Dados` - 6 edges
10. `Razão — controle financeiro pessoal` - 6 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (20 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.16
Nodes (16): fmt(), loadData(), app, boot(), changeMonth(), DEFAULT_CATS, deleteTx(), drawChart() (+8 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (36): 1. Criar Projeto Supabase, 2. Configurar Credenciais, 3. Habilitar Email Auth, 4. Instalar e Rodar, Arquitetura, Arquivo `.env`, Banco de Dados (Supabase), Categorias Padrão (Seed no app) (+28 more)

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
Cohesion: 0.11
Nodes (26): fmt$(), loadData(), allLancamentos, allLojas, closeConfigModal(), confirmModal(), esc(), fillForm() (+18 more)

### Community 6 - "Community 6"
Cohesion: 0.07
Nodes (28): 1. Pré-requisitos, 1. Resumo (Summary Cards), 2. Clonar/Preparar Repositório, 2. Filtros, 3. Configurar Variáveis de Ambiente, 3. Tabela de Lançamentos, 4. Criar Schema PostgreSQL, 4. Modal de Edição/Inserção (+20 more)

### Community 7 - "Community 7"
Cohesion: 0.11
Nodes (17): 1. ✅ Criar arquivo db/supabase.sql com tabelas PostgreSQL, 2. ✅ Atualizar código fonte para Supabase Auth, 3. ⏭️ Criar API Edge Functions para CRUD de lançamentos, 4. ✅ Atualizar main.js para usar Supabase client, 5. ⏭️ Migrar dados de financeiro.json para PostgreSQL, 6. ⏭️ Testar no ambiente Supabase, 7. ✅ Atualizar CLAUDE.md com especificações, 📊 ESTRUTURA DO BANCO (+9 more)

### Community 8 - "Community 8"
Cohesion: 0.13
Nodes (14): dependencies, json-server, @supabase/supabase-js, devDependencies, vite, name, private, scripts (+6 more)

### Community 10 - "Community 10"
Cohesion: 0.20
Nodes (9): Arquivos criados, Autenticação, Como rodar, Estrutura do banco (`financeiro.json`), Funcionalidades, Memory Index, Projeto: Dashboard Financeiro, Stack (+1 more)

### Community 11 - "Community 11"
Cohesion: 0.29
Nodes (7): 1. Adicionar campo na tabela, 2. Adicionar função CRUD, 3. Usar no main.js, Como Adicionar uma Funcionalidade, Debugging, Estrutura de Arquivos, 💻 Guia de Desenvolvimento

### Community 12 - "Community 12"
Cohesion: 0.33
Nodes (6): 📊 Estrutura do Banco de Dados, Tabela: `cli_loja`, Tabela: `cliente`, Tabela: `lancamento` ⭐, Tabela: `loja`, Tabela: `usuarios`

### Community 13 - "Community 13"
Cohesion: 0.40
Nodes (4): Sheet: Despesas, Sheet: Receitas, Sheet: Receitas e Despesas, Sheet: Transferências

### Community 14 - "Community 14"
Cohesion: 0.40
Nodes (4): Sheet: Despesas, Sheet: Receitas, Sheet: Receitas e Despesas, Sheet: Transferências

### Community 15 - "Community 15"
Cohesion: 0.40
Nodes (5): 1. CORS, 2. Tokens Expirados, 3. RLS Bloqueando Queries, 4. Parcela Atual Não Incrementa, ⚠️ Problemas Conhecidos

### Community 16 - "Community 16"
Cohesion: 0.40
Nodes (5): 🔐 Autenticação, Fluxo de Cadastro, Fluxo de Login, Logout, Persistência

## Knowledge Gaps
- **136 isolated node(s):** `name`, `version`, `private`, `type`, `dev` (+131 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `📊 Dashboard Financeiro - Documentação Técnica` connect `Community 6` to `Community 16`, `Community 11`, `Community 12`, `Community 15`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `Razão — Documentação Técnica` connect `Community 1` to `Community 4`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _136 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05405405405405406 - nodes in this community are weakly interconnected._
- **Should `Community 5` be split into smaller, more focused modules?**
  _Cohesion score 0.10795454545454546 - nodes in this community are weakly interconnected._
- **Should `Community 6` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `Community 7` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._