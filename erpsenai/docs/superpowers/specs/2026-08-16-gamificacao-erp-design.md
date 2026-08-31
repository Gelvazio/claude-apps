# Gamificação do ERP SENAI — Especificação de Design

**Data:** 2026-08-16  
**Status:** Aprovado  
**Autor:** Brainstorming colaborativo

---

## Visão Geral

Módulo de gamificação dos processos do ERP para treinar usuários — alunos do SENAI aprendendo como funciona um ERP real e colaboradores novos aprendendo a operar o sistema. O usuário trabalha normalmente no ERP e acumula XP ao completar missões vinculadas a ações reais do sistema.

---

## Arquitetura

### Abordagem: Dashboard central + eventos leves nos módulos

Um hub de gamificação independente (`gamificacao/`) com um motor JavaScript central (`gamif.js`) que escuta eventos disparados pelos módulos existentes. Os módulos existentes recebem apenas uma linha de integração nos pontos de salvamento — sem alteração de layout.

### Estrutura de arquivos

```
erp-victor-anato-senai/
└── gamificacao/
    ├── index.html       ← hub do usuário (missões, XP, nível, badges)
    ├── ranking.html     ← leaderboard do grupo
    ├── admin.html       ← painel admin (missões, grupos, visão geral)
    ├── gamif.js         ← motor central
    └── gamificacao.md   ← este documento (spec)
```

### Integração nos módulos existentes

```html
<!-- Carregar no <head> de cada página relevante -->
<script src="../gamificacao/gamif.js"></script>
```

```js
// No final da função salvar() de cada módulo — 1 linha
if (window.gamif) await gamif.registrarEvento('pedido_compra_criado');
```

---

## Público-Alvo

| Perfil | Uso |
|--------|-----|
| Alunos do SENAI | Aprendizado pedagógico de ERP real |
| Colaboradores novos | Onboarding operacional do sistema |
| Administradores | Gerenciam missões, grupos e visualizam progresso |

---

## Sistema de Missões

### Tipos

| Tipo | Criado por | Atribuição |
|------|-----------|------------|
| **Onboarding** | Pré-definido no sistema | Automática para todo usuário novo |
| **Por módulo** | Admin | Atribuída a grupo/turma específico |
| **Especial** | Admin | Com prazo, visível para todo o grupo |

### Eventos rastreáveis

| Evento | Módulo |
|--------|--------|
| `cliente_cadastrado` | Cadastros |
| `fornecedor_cadastrado` | Cadastros |
| `produto_cadastrado` | Cadastros |
| `solicitacao_criada` | Compras |
| `pedido_compra_criado` | Compras |
| `recebimento_registrado` | Compras |
| `nota_fiscal_compra_lancada` | Compras |
| `movimentacao_estoque` | Estoque |
| `inventario_realizado` | Estoque |
| `pedido_venda_criado` | Vendas |
| `expedicao_confirmada` | Vendas |
| `entrega_confirmada` | Vendas |

### Missões fixas de onboarding (pré-carregadas)

| # | Missão | Evento | XP |
|---|--------|--------|----|
| 1 | Faça seu primeiro cadastro de cliente | `cliente_cadastrado` | 30 |
| 2 | Cadastre um fornecedor | `fornecedor_cadastrado` | 30 |
| 3 | Adicione um produto ao catálogo | `produto_cadastrado` | 30 |
| 4 | Crie sua primeira solicitação de compra | `solicitacao_criada` | 50 |
| 5 | Emita um pedido de compra | `pedido_compra_criado` | 50 |
| 6 | Registre um recebimento de mercadoria | `recebimento_registrado` | 50 |
| 7 | Lance uma nota fiscal de compra | `nota_fiscal_compra_lancada` | 70 |
| 8 | Faça uma movimentação de estoque | `movimentacao_estoque` | 50 |
| 9 | Realize um inventário | `inventario_realizado` | 70 |
| 10 | Crie um pedido de venda | `pedido_venda_criado` | 50 |
| 11 | Confirme uma expedição | `expedicao_confirmada` | 70 |
| 12 | Registre uma entrega ao cliente | `entrega_confirmada` | 100 |

**Total onboarding completo: 650 XP**

### Estrutura de uma missão customizada

```
Título:      texto livre
Descrição:   texto livre
Evento:      enum dos eventos rastreáveis
Meta:        integer (quantas vezes o evento deve ocorrer)
XP:          integer
Grupo:       referência a gamif_grupos (opcional para especiais)
Prazo:       date (opcional)
Tipo:        'onboarding' | 'modulo' | 'especial'
```

---

## Sistema de Progressão

### Níveis

| Nível | Nome | XP necessário |
|-------|------|--------------|
| 1 | Iniciante | 0 |
| 2 | Aprendiz | 200 |
| 3 | Operador | 500 |
| 4 | Analista | 1.000 |
| 5 | Especialista | 2.000 |
| 6 | Sênior | 3.500 |
| 7 | Master ERP | 5.000 |

### Badges

| Badge | Slug | Como ganhar |
|-------|------|-------------|
| 🏁 Bem-vindo | `bem_vindo` | Completar as 3 primeiras missões de onboarding |
| 🛒 Mestre das Compras | `mestre_compras` | Completar todo o fluxo de Compras (SC→PC→RC→NF) |
| 📦 Guardião do Estoque | `guardiao_estoque` | Concluir missão de movimentação (meta=5) E missão de inventário — verificado em `gamif.js` após cada evento de estoque |
| 💼 Vendedor Expert | `vendedor_expert` | Completar todo o fluxo de Vendas (PV→Expedição→Entrega) |
| 🌟 ERP Completo | `erp_completo` | Completar todas as 12 missões de onboarding |
| ⚡ Velocista | `velocista` | Completar 5 missões em menos de 24h (verificado via `concluida_em`) |
| 🏆 Líder da Turma | `lider_turma` | Atingir o 1º lugar no ranking do próprio grupo |

---

## Ranking

- Ranking por **grupo** (turma ou setor), não global
- Exibe: posição, nome do usuário, nível, XP total
- Destaques visuais para 🥇 🥈 🥉
- Usuário vê apenas o ranking do próprio grupo

---

## Telas

### `index.html` — Hub do Usuário

- Card de perfil: nome, nível atual, barra de progresso XP, badges conquistados
- Lista de missões ativas (pendentes primeiro, concluídas por último)
- Cada missão mostra: título, módulo relacionado, XP, progresso (ex: 2/3), status
- Link para `ranking.html`

### `ranking.html` — Leaderboard do Grupo

- Nome do grupo no topo
- Tabela ordenada por XP decrescente
- Destaque visual para as 3 primeiras posições
- Linha do usuário logado destacada

### `admin.html` — Painel Administrativo

Três abas:

**Missões** — CRUD completo de missões customizadas. Missões fixas de onboarding são listadas mas não editáveis.

**Grupos** — Criar/editar grupos (nome, tipo: turma ou setor). Adicionar/remover usuários do grupo.

**Visão Geral** — Cards com métricas (usuários ativos, missões concluídas hoje, XP total distribuído). Tabela top 10 usuários por XP (todos os grupos).

Acesso restrito a perfil **Administrador**.

---

## Motor Central (`gamif.js`)

### API pública

```js
// Disparado pelos módulos do ERP
await gamif.registrarEvento('pedido_compra_criado');

// Retorna dados do usuário logado
const perfil = await gamif.carregarPerfil();
// → { xp_total, nivel, nome_nivel, badges, percentual_proximo_nivel }
```

### Fluxo interno de `registrarEvento`

1. Busca missões ativas do usuário com o evento correspondente
2. Para cada missão encontrada: incrementa progresso em `gamif_progresso`
3. Se `progresso >= meta`: marca concluída, soma XP em `gamif_perfil`, recalcula nível
4. Verifica se algum badge foi desbloqueado
5. Dispara toast de notificação no canto inferior direito (4 segundos)
6. Retorna silenciosamente se não há missão para o evento

### Toast de notificação

Injetado dinamicamente no DOM pelo `gamif.js`. Não requer HTML extra nas páginas:

```
🎯 Missão concluída!
[nome da missão]
+50 XP • Nível 3 atingido!
```

---

## Banco de Dados (Supabase)

```sql
CREATE TABLE gamif_grupos (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome       text NOT NULL,
  tipo       text,  -- 'turma' | 'setor'
  created_at timestamptz DEFAULT now()
);

CREATE TABLE gamif_usuario_grupo (
  usuario_id uuid REFERENCES erp_usuarios(id),
  grupo_id   uuid REFERENCES gamif_grupos(id),
  PRIMARY KEY (usuario_id, grupo_id)
);

CREATE TABLE gamif_missoes (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo     text NOT NULL,
  descricao  text,
  evento     text NOT NULL,
  meta       integer DEFAULT 1,
  xp         integer NOT NULL,
  tipo       text DEFAULT 'onboarding',  -- 'onboarding' | 'modulo' | 'especial'
  grupo_id   uuid REFERENCES gamif_grupos(id),
  prazo      date,
  ativo      boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE gamif_progresso (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id   uuid REFERENCES erp_usuarios(id),
  missao_id    uuid REFERENCES gamif_missoes(id),
  progresso    integer DEFAULT 0,
  concluida    boolean DEFAULT false,
  concluida_em timestamptz,
  created_at   timestamptz DEFAULT now(),
  UNIQUE (usuario_id, missao_id)
);

CREATE TABLE gamif_perfil (
  usuario_id uuid PRIMARY KEY REFERENCES erp_usuarios(id),
  xp_total   integer DEFAULT 0,
  nivel      integer DEFAULT 1,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE gamif_badges (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id uuid REFERENCES erp_usuarios(id),
  badge_slug text NOT NULL,
  ganho_em   timestamptz DEFAULT now(),
  UNIQUE (usuario_id, badge_slug)
);
```

---

## Ordem de Implementação Sugerida

1. Criar tabelas no Supabase + seeds das missões de onboarding
2. Implementar `gamif.js` (motor central)
3. Criar `index.html` (hub do usuário)
4. Criar `ranking.html`
5. Criar `admin.html` (3 abas)
6. Integrar eventos nos módulos existentes (1 linha por módulo)
7. Adicionar link "Gamificação" no sidebar de todos os HTMLs
8. Testes de fluxo completo onboarding

---

## Decisões de Design

- **Sem streak**: simplifica o sistema e evita punir ausência
- **Ranking por grupo, não global**: respeita o contexto de turmas SENAI
- **gamif.js opcional**: `if (window.gamif)` garante que módulos não quebram se o script não carregar
- **Missões onboarding não editáveis**: garante consistência da experiência inicial para todo usuário novo
- **Toast injetado por gamif.js**: nenhuma tela precisa de HTML extra para receber notificações
