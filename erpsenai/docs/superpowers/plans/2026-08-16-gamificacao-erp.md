# Gamificação do ERP SENAI — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar módulo de gamificação dos processos do ERP para treinar alunos SENAI e colaboradores via missões explícitas com XP, níveis e badges.

**Architecture:** Hub central em `gamificacao/` com motor `gamif.js` que escuta eventos disparados pelos módulos existentes. Os módulos existentes recebem apenas uma linha de integração nos pontos de salvamento, sem alteração de layout. Banco de dados exclusivamente no Supabase via REST API.

**Tech Stack:** HTML5 + CSS + Vanilla JS ES6+, Supabase REST API, sem frameworks ou npm.

## Global Constraints

- Vanilla JS puro — sem npm, sem bundler, sem frameworks
- Supabase URL: `https://vdhahqicqlrdvcpesiwk.supabase.co`
- Supabase Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3YXNiemRia2JyeW5jcHZmdWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MzA3ODEsImV4cCI6MjA2MjQwNjc4MX0.Bz7aZ6yG6DUTtWQ4WdeNbslWzE4qU81zzblUeHdTduU`
- Tema claro/escuro via `localStorage.getItem('senai_tema')` e `data-theme` no `<html>`
- Sessão via `localStorage.getItem('erp_role')` e `erp_user_id`
- Responsivo — sidebar oculta em ≤768px, formulários 1 coluna em ≤600px, inputs font-size≥16px
- Arquivos de gamificação em `erp-victor-anato-senai/gamificacao/`
- Sidebar em páginas dentro de subpastas usa `../gamificacao/`; `dashboard.html` (raiz) usa `gamificacao/`
- Commit após cada task

---

## Mapa de Arquivos

**Criar:**

- `gamificacao/gamif.js` — motor central (eventos, XP, níveis, badges, toast)
- `gamificacao/index.html` — hub do usuário (missões, XP, nível, badges)
- `gamificacao/ranking.html` — leaderboard do grupo
- `gamificacao/admin.html` — painel admin (3 abas: Missões, Grupos, Visão Geral)

**Modificar (1 linha por arquivo — integração de eventos):**

- `cadastros/clientes.html` — evento `cliente_cadastrado`
- `cadastros/fornecedores.html` — evento `fornecedor_cadastrado`
- `cadastros/produtos.html` — evento `produto_cadastrado`
- `compras/solicitacoes.html` — evento `solicitacao_criada`
- `compras/pedidos.html` — evento `pedido_compra_criado`
- `compras/recebimento.html` — evento `recebimento_registrado`
- `compras/nota-fiscal.html` — evento `nota_fiscal_compra_lancada`
- `estoque/movimentacoes.html` — evento `movimentacao_estoque`
- `estoque/inventario.html` — evento `inventario_realizado`
- `vendas/pedidos-venda.html` — evento `pedido_venda_criado`
- `vendas/expedicao.html` — evento `expedicao_confirmada`
- `vendas/entrega.html` — evento `entrega_confirmada`

**Modificar (sidebar — link Gamificação):**

- Todos os 33 HTMLs do projeto (ver lista completa na Task 7)

---

## Task 1: Criar tabelas Supabase e seeds de missões de onboarding

**Files:**

- Nenhum arquivo local — executar SQL diretamente no Supabase SQL Editor

**Interfaces:**

- Produz: tabelas `gamif_grupos`, `gamif_usuario_grupo`, `gamif_missoes`, `gamif_progresso`, `gamif_perfil`, `gamif_badges`

- [ ] **Step 1: Abrir o Supabase SQL Editor**

Acessar o projeto em `https://supabase.com/dashboard/project/vdhahqicqlrdvcpesiwk./sql/new`

- [ ] **Step 2: Executar SQL de criação das tabelas**

```sql
-- Grupos (turmas ou setores)
CREATE TABLE gamif_grupos (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome       text NOT NULL,
  tipo       text DEFAULT 'turma',  -- 'turma' | 'setor'
  created_at timestamptz DEFAULT now()
);

-- Vínculo usuário ↔ grupo
CREATE TABLE gamif_usuario_grupo (
  usuario_id uuid REFERENCES erp_usuarios(id) ON DELETE CASCADE,
  grupo_id   uuid REFERENCES gamif_grupos(id) ON DELETE CASCADE,
  PRIMARY KEY (usuario_id, grupo_id)
);

-- Missões (fixas de onboarding + customizadas pelo admin)
CREATE TABLE gamif_missoes (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo     text NOT NULL,
  descricao  text,
  evento     text NOT NULL,
  meta       integer DEFAULT 1,
  xp         integer NOT NULL,
  tipo       text DEFAULT 'onboarding',  -- 'onboarding' | 'modulo' | 'especial'
  grupo_id   uuid REFERENCES gamif_grupos(id) ON DELETE SET NULL,
  prazo      date,
  ativo      boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Progresso do usuário em cada missão
CREATE TABLE gamif_progresso (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id   uuid REFERENCES erp_usuarios(id) ON DELETE CASCADE,
  missao_id    uuid REFERENCES gamif_missoes(id) ON DELETE CASCADE,
  progresso    integer DEFAULT 0,
  concluida    boolean DEFAULT false,
  concluida_em timestamptz,
  created_at   timestamptz DEFAULT now(),
  UNIQUE (usuario_id, missao_id)
);

-- Perfil de XP e nível do usuário
CREATE TABLE gamif_perfil (
  usuario_id uuid PRIMARY KEY REFERENCES erp_usuarios(id) ON DELETE CASCADE,
  xp_total   integer DEFAULT 0,
  nivel      integer DEFAULT 1,
  updated_at timestamptz DEFAULT now()
);

-- Badges conquistados
CREATE TABLE gamif_badges (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id uuid REFERENCES erp_usuarios(id) ON DELETE CASCADE,
  badge_slug text NOT NULL,
  ganho_em   timestamptz DEFAULT now(),
  UNIQUE (usuario_id, badge_slug)
);
```

- [ ] **Step 3: Executar SQL de RLS (políticas permissivas para desenvolvimento)**

```sql
ALTER TABLE gamif_grupos         ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamif_usuario_grupo  ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamif_missoes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamif_progresso      ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamif_perfil         ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamif_badges         ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon full access" ON gamif_grupos        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon full access" ON gamif_usuario_grupo FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon full access" ON gamif_missoes       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon full access" ON gamif_progresso     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon full access" ON gamif_perfil        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon full access" ON gamif_badges        FOR ALL USING (true) WITH CHECK (true);
```

- [ ] **Step 4: Executar SQL de seed — 12 missões de onboarding**

```sql
INSERT INTO gamif_missoes (titulo, descricao, evento, meta, xp, tipo) VALUES
('Faça seu primeiro cadastro de cliente',    'Acesse Cadastros → Clientes e registre um novo cliente.',            'cliente_cadastrado',          1, 30,  'onboarding'),
('Cadastre um fornecedor',                   'Acesse Cadastros → Fornecedores e registre um novo fornecedor.',     'fornecedor_cadastrado',        1, 30,  'onboarding'),
('Adicione um produto ao catálogo',          'Acesse Cadastros → Produtos e registre um novo produto.',            'produto_cadastrado',           1, 30,  'onboarding'),
('Crie sua primeira solicitação de compra',  'Acesse Compras → Solicitações e crie uma nova solicitação.',         'solicitacao_criada',           1, 50,  'onboarding'),
('Emita um pedido de compra',                'Acesse Compras → Pedidos e emita um novo pedido.',                   'pedido_compra_criado',         1, 50,  'onboarding'),
('Registre um recebimento de mercadoria',    'Acesse Compras → Recebimento e registre a chegada de um pedido.',   'recebimento_registrado',       1, 50,  'onboarding'),
('Lance uma nota fiscal de compra',          'Acesse Compras → Nota Fiscal e lance a NF do fornecedor.',          'nota_fiscal_compra_lancada',   1, 70,  'onboarding'),
('Faça uma movimentação de estoque',         'Acesse Estoque → Movimentações e registre uma movimentação.',       'movimentacao_estoque',         1, 50,  'onboarding'),
('Realize um inventário',                    'Acesse Estoque → Inventário e registre uma contagem física.',        'inventario_realizado',         1, 70,  'onboarding'),
('Crie um pedido de venda',                  'Acesse Vendas → Pedidos de Venda e registre um novo pedido.',       'pedido_venda_criado',          1, 50,  'onboarding'),
('Confirme uma expedição',                   'Acesse Vendas → Expedição e confirme um envio.',                    'expedicao_confirmada',         1, 70,  'onboarding'),
('Registre uma entrega ao cliente',          'Acesse Vendas → Entrega e registre a confirmação de entrega.',      'entrega_confirmada',           1, 100, 'onboarding');
```

- [ ] **Step 5: Verificar**

No SQL Editor, executar:

```sql
SELECT COUNT(*) FROM gamif_missoes;
-- Esperado: 12
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: criar tabelas Supabase do módulo de gamificação + seeds onboarding"
git push origin main
```

---

## Task 2: gamif.js — motor central

**Files:**

- Create: `gamificacao/gamif.js`

**Interfaces:**

- Produz: `window.gamif.registrarEvento(evento: string): Promise<void>`
- Produz: `window.gamif.carregarPerfil(): Promise<{xp_total, nivel, nome_nivel, percentual, badges}>`

- [ ] **Step 1: Criar `gamificacao/gamif.js`**

```js
(function () {
  const URL = 'https://vdhahqicqlrdvcpesiwk.supabase.co/rest/v1';
  const KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3YXNiemRia2JyeW5jcHZmdWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MzA3ODEsImV4cCI6MjA2MjQwNjc4MX0.Bz7aZ6yG6DUTtWQ4WdeNbslWzE4qU81zzblUeHdTduU';
  const H = {
    apikey: KEY,
    Authorization: `Bearer ${KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation'
  };

  const NIVEIS = [
    { nivel: 1, nome: 'Iniciante', xp: 0 },
    { nivel: 2, nome: 'Aprendiz', xp: 200 },
    { nivel: 3, nome: 'Operador', xp: 500 },
    { nivel: 4, nome: 'Analista', xp: 1000 },
    { nivel: 5, nome: 'Especialista', xp: 2000 },
    { nivel: 6, nome: 'Sênior', xp: 3500 },
    { nivel: 7, nome: 'Master ERP', xp: 5000 }
  ];

  const BADGES_DEF = [
    {
      slug: 'bem_vindo',
      emoji: '🏁',
      nome: 'Bem-vindo',
      check: async (uid) => (await _missoesConcluidas(uid)) >= 3
    },
    {
      slug: 'mestre_compras',
      emoji: '🛒',
      nome: 'Mestre das Compras',
      check: async (uid) =>
        await _eventosConcluidos(uid, [
          'solicitacao_criada',
          'pedido_compra_criado',
          'recebimento_registrado',
          'nota_fiscal_compra_lancada'
        ])
    },
    {
      slug: 'guardiao_estoque',
      emoji: '📦',
      nome: 'Guardião do Estoque',
      check: async (uid) =>
        await _eventosConcluidos(uid, ['movimentacao_estoque', 'inventario_realizado'])
    },
    {
      slug: 'vendedor_expert',
      emoji: '💼',
      nome: 'Vendedor Expert',
      check: async (uid) =>
        await _eventosConcluidos(uid, [
          'pedido_venda_criado',
          'expedicao_confirmada',
          'entrega_confirmada'
        ])
    },
    {
      slug: 'erp_completo',
      emoji: '🌟',
      nome: 'ERP Completo',
      check: async (uid) => (await _missoesConcluidas(uid)) >= 12
    },
    {
      slug: 'velocista',
      emoji: '⚡',
      nome: 'Velocista',
      check: async (uid) => await _cincoMissoes24h(uid)
    },
    {
      slug: 'lider_turma',
      emoji: '🏆',
      nome: 'Líder da Turma',
      check: async (uid) => await _liderGrupo(uid)
    }
  ];

  async function _get(path) {
    const r = await fetch(`${URL}/${path}`, { headers: H });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  }
  async function _post(path, body) {
    const r = await fetch(`${URL}/${path}`, {
      method: 'POST',
      headers: H,
      body: JSON.stringify(body)
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  }
  async function _patch(path, body) {
    const r = await fetch(`${URL}/${path}`, {
      method: 'PATCH',
      headers: H,
      body: JSON.stringify(body)
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  }

  function _uid() {
    return localStorage.getItem('erp_user_id');
  }

  function _calcularNivel(xp) {
    let atual = NIVEIS[0];
    for (const n of NIVEIS) {
      if (xp >= n.xp) atual = n;
      else break;
    }
    return atual;
  }

  function _percentual(xp) {
    const atual = _calcularNivel(xp);
    const idx = NIVEIS.findIndex((n) => n.nivel === atual.nivel);
    const prox = NIVEIS[idx + 1];
    if (!prox) return 100;
    return Math.round(((xp - atual.xp) / (prox.xp - atual.xp)) * 100);
  }

  async function _missoesConcluidas(uid) {
    const rows = await _get(`gamif_progresso?usuario_id=eq.${uid}&concluida=eq.true&select=id`);
    return rows.length;
  }

  async function _eventosConcluidos(uid, eventos) {
    for (const ev of eventos) {
      const missoes = await _get(`gamif_missoes?evento=eq.${ev}&ativo=eq.true&select=id`);
      if (!missoes.length) continue;
      const ids = missoes.map((m) => m.id).join(',');
      const prog = await _get(
        `gamif_progresso?usuario_id=eq.${uid}&missao_id=in.(${ids})&concluida=eq.true&select=id`
      );
      if (!prog.length) return false;
    }
    return true;
  }

  async function _cincoMissoes24h(uid) {
    const limite = new Date(Date.now() - 86400000).toISOString();
    const rows = await _get(
      `gamif_progresso?usuario_id=eq.${uid}&concluida=eq.true&concluida_em=gte.${limite}&select=id`
    );
    return rows.length >= 5;
  }

  async function _liderGrupo(uid) {
    const grupos = await _get(`gamif_usuario_grupo?usuario_id=eq.${uid}&select=grupo_id`);
    if (!grupos.length) return false;
    const gid = grupos[0].grupo_id;
    const membros = await _get(`gamif_usuario_grupo?grupo_id=eq.${gid}&select=usuario_id`);
    if (membros.length < 2) return false;
    const ids = membros.map((m) => m.usuario_id).join(',');
    const perfis = await _get(
      `gamif_perfil?usuario_id=in.(${ids})&order=xp_total.desc&limit=1&select=usuario_id`
    );
    return perfis.length > 0 && perfis[0].usuario_id === uid;
  }

  async function _garantirPerfil(uid) {
    const rows = await _get(`gamif_perfil?usuario_id=eq.${uid}&select=xp_total,nivel`);
    if (rows.length) return rows[0];
    await _post('gamif_perfil', { usuario_id: uid, xp_total: 0, nivel: 1 });
    return { xp_total: 0, nivel: 1 };
  }

  async function _inicializarMissoesOnboarding(uid) {
    const missoes = await _get(`gamif_missoes?tipo=eq.onboarding&ativo=eq.true&select=id`);
    for (const m of missoes) {
      const existe = await _get(
        `gamif_progresso?usuario_id=eq.${uid}&missao_id=eq.${m.id}&select=id`
      );
      if (!existe.length) {
        await _post('gamif_progresso', {
          usuario_id: uid,
          missao_id: m.id,
          progresso: 0,
          concluida: false
        });
      }
    }
  }

  async function _verificarBadges(uid) {
    const badges = await _get(`gamif_badges?usuario_id=eq.${uid}&select=badge_slug`);
    const jaGanhou = new Set(badges.map((b) => b.badge_slug));
    const novos = [];
    for (const def of BADGES_DEF) {
      if (jaGanhou.has(def.slug)) continue;
      const ganhou = await def.check(uid);
      if (ganhou) {
        await _post('gamif_badges', { usuario_id: uid, badge_slug: def.slug });
        novos.push(def);
      }
    }
    return novos;
  }

  function _toast(titulo, subtitulo, extra) {
    const el = document.createElement('div');
    el.style.cssText = `
      position:fixed; bottom:24px; right:24px; z-index:99999;
      background:var(--color-surface,#fff); color:var(--color-text,#111);
      border:1px solid var(--color-border,#ddd); border-radius:12px;
      box-shadow:0 8px 32px rgba(0,0,0,.18); padding:14px 18px;
      min-width:260px; max-width:320px; animation:gamifSlide .3s ease;
      font-family:inherit;
    `;
    el.innerHTML = `
      <div style="font-weight:700;font-size:14px;margin-bottom:4px">🎯 ${titulo}</div>
      <div style="font-size:13px;color:var(--color-text-muted,#666)">${subtitulo}</div>
      ${extra ? `<div style="font-size:12px;color:var(--color-primary,#0043a4);margin-top:4px;font-weight:600">${extra}</div>` : ''}
    `;
    if (!document.getElementById('gamif-style')) {
      const s = document.createElement('style');
      s.id = 'gamif-style';
      s.textContent = `@keyframes gamifSlide{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`;
      document.head.appendChild(s);
    }
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }

  async function registrarEvento(evento) {
    const uid = _uid();
    if (!uid) return;
    try {
      await _garantirPerfil(uid);
      await _inicializarMissoesOnboarding(uid);

      const missoes = await _get(
        `gamif_missoes?evento=eq.${evento}&ativo=eq.true&select=id,titulo,meta,xp`
      );
      if (!missoes.length) return;

      for (const missao of missoes) {
        const rows = await _get(
          `gamif_progresso?usuario_id=eq.${uid}&missao_id=eq.${missao.id}&select=id,progresso,concluida`
        );
        if (!rows.length) {
          await _post('gamif_progresso', {
            usuario_id: uid,
            missao_id: missao.id,
            progresso: 1,
            concluida: false
          });
          var prog = { id: null, progresso: 1, concluida: false };
          // buscar o id recém-criado
          const criado = await _get(
            `gamif_progresso?usuario_id=eq.${uid}&missao_id=eq.${missao.id}&select=id,progresso,concluida`
          );
          if (criado.length) prog = criado[0];
        } else {
          prog = rows[0];
        }
        if (prog.concluida) continue;

        const novoProgresso = prog.progresso + (rows.length ? 1 : 0);
        const concluida = novoProgresso >= missao.meta;

        await _patch(`gamif_progresso?usuario_id=eq.${uid}&missao_id=eq.${missao.id}`, {
          progresso: novoProgresso,
          concluida,
          concluida_em: concluida ? new Date().toISOString() : null
        });

        if (concluida) {
          const perfil = await _get(`gamif_perfil?usuario_id=eq.${uid}&select=xp_total,nivel`);
          const xpAtual = perfil[0]?.xp_total ?? 0;
          const novoXp = xpAtual + missao.xp;
          const nivelAntes = _calcularNivel(xpAtual);
          const nivelDepois = _calcularNivel(novoXp);

          await _patch(`gamif_perfil?usuario_id=eq.${uid}`, {
            xp_total: novoXp,
            nivel: nivelDepois.nivel,
            updated_at: new Date().toISOString()
          });

          const extra =
            nivelDepois.nivel > nivelAntes.nivel
              ? `🎉 Nível ${nivelDepois.nivel} — ${nivelDepois.nome} atingido!`
              : `+${missao.xp} XP • Total: ${novoXp} XP`;

          _toast('Missão concluída!', missao.titulo, extra);

          const novosBadges = await _verificarBadges(uid);
          for (const b of novosBadges) {
            setTimeout(() => _toast(`Badge desbloqueado! ${b.emoji}`, b.nome, ''), 1000);
          }
        }
      }
    } catch (e) {
      console.warn('[gamif] Erro ao registrar evento:', e.message);
    }
  }

  async function carregarPerfil() {
    const uid = _uid();
    if (!uid) return null;
    await _garantirPerfil(uid);
    await _inicializarMissoesOnboarding(uid);
    const perfil = await _get(`gamif_perfil?usuario_id=eq.${uid}&select=xp_total,nivel`);
    const badges = await _get(`gamif_badges?usuario_id=eq.${uid}&select=badge_slug`);
    const xp = perfil[0]?.xp_total ?? 0;
    const nivel = _calcularNivel(xp);
    return {
      xp_total: xp,
      nivel: nivel.nivel,
      nome_nivel: nivel.nome,
      percentual: _percentual(xp),
      badges: badges.map((b) => b.badge_slug),
      BADGES_DEF,
      NIVEIS
    };
  }

  window.gamif = { registrarEvento, carregarPerfil, NIVEIS, BADGES_DEF };
})();
```

- [ ] **Step 2: Verificar que o arquivo foi criado**

```bash
ls erp-victor-anato-senai/gamificacao/
# Esperado: gamif.js  gamificacao.md
```

- [ ] **Step 3: Commit**

```bash
git add gamificacao/gamif.js
git commit -m "feat: gamif.js — motor central de gamificação (eventos, XP, níveis, badges, toast)"
git push origin main
```

---

## Task 3: index.html — Hub do Usuário

**Files:**

- Create: `gamificacao/index.html`

**Interfaces:**

- Consome: `window.gamif.carregarPerfil()` → `{xp_total, nivel, nome_nivel, percentual, badges, BADGES_DEF}`
- Consome: `gamif_progresso` via Supabase REST (missões do usuário)
- Consome: `gamif_missoes` via Supabase REST

- [ ] **Step 1: Criar `gamificacao/index.html`**

```html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>ERP — Minha Jornada</title>
    <link rel="stylesheet" href="../styles.css" />
    <script src="gamif.js"></script>
    <style>
      .app-layout {
        display: flex;
        min-height: calc(100vh - 56px);
      }
      .sidebar {
        width: 240px;
        background: var(--color-surface);
        border-right: 1px solid var(--color-border-faint);
        display: flex;
        flex-direction: column;
        position: fixed;
        top: 56px;
        left: 0;
        bottom: 0;
        overflow-y: auto;
        z-index: 50;
        transition: transform 0.25s;
      }
      .sidebar-section {
        padding: 20px 0 4px;
      }
      .sidebar-section-label {
        font-size: 10px;
        font-weight: 700;
        color: var(--color-text-disabled);
        letter-spacing: 1.2px;
        text-transform: uppercase;
        padding: 0 20px 6px;
      }
      .sidebar-link {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 9px 20px;
        font-size: 13px;
        font-weight: 500;
        color: var(--color-text-muted);
        text-decoration: none;
        border-left: 3px solid transparent;
        transition:
          background 0.15s,
          color 0.15s,
          border-color 0.15s;
      }
      .sidebar-link:hover {
        background: #e8f0fe;
        color: var(--color-primary);
      }
      .sidebar-link.ativo {
        background: #e8f0fe;
        color: var(--color-primary);
        border-left-color: var(--color-primary);
        font-weight: 600;
      }
      [data-theme='dark'] .sidebar-link:hover,
      [data-theme='dark'] .sidebar-link.ativo {
        background: #1e2554;
        color: #7aa3d4;
      }
      .sidebar-icon {
        font-size: 16px;
        width: 20px;
        text-align: center;
        flex-shrink: 0;
      }
      .main {
        margin-left: 240px;
        padding: 28px 32px;
        flex: 1;
      }
      @media (max-width: 768px) {
        .sidebar {
          transform: translateX(-100%);
        }
        .main {
          margin-left: 0;
          padding: 16px;
        }
        .sidebar.open {
          transform: translateX(0);
        }
      }
      .sidebar-overlay {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.45);
        z-index: 49;
      }
      .sidebar-overlay.show {
        display: block;
      }
      .btn-menu {
        display: none;
        background: rgba(255, 255, 255, 0.15);
        border: none;
        color: #fff;
        font-size: 20px;
        width: 36px;
        height: 36px;
        border-radius: 6px;
        cursor: pointer;
        align-items: center;
        justify-content: center;
      }
      @media (max-width: 768px) {
        .btn-menu {
          display: flex;
        }
      }
      /* Perfil card */
      .perfil-card {
        background: var(--color-surface);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);
        padding: 24px;
        margin-bottom: 20px;
      }
      .perfil-nome {
        font-size: 20px;
        font-weight: 700;
        color: var(--color-text);
        margin-bottom: 4px;
      }
      .perfil-nivel {
        font-size: 13px;
        color: var(--color-text-muted);
        margin-bottom: 14px;
      }
      .xp-bar-wrap {
        background: var(--color-border-light);
        border-radius: 100px;
        height: 10px;
        margin-bottom: 6px;
        overflow: hidden;
      }
      .xp-bar {
        height: 100%;
        background: var(--color-primary);
        border-radius: 100px;
        transition: width 0.5s;
      }
      .xp-label {
        font-size: 12px;
        color: var(--color-text-muted);
      }
      .badges-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 16px;
      }
      .badge-pill {
        display: flex;
        align-items: center;
        gap: 6px;
        background: var(--color-surface-2);
        border: 1px solid var(--color-border);
        border-radius: 100px;
        padding: 4px 12px;
        font-size: 12px;
        color: var(--color-text-muted);
      }
      .badge-pill.ganho {
        background: #fff8e1;
        border-color: #f59e0b;
        color: #92400e;
      }
      [data-theme='dark'] .badge-pill.ganho {
        background: #2d2000;
        border-color: #f59e0b;
        color: #fcd34d;
      }
      /* Missões */
      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 14px;
      }
      .section-title {
        font-size: 16px;
        font-weight: 700;
        color: var(--color-text);
      }
      .missoes-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .missao-card {
        background: var(--color-surface);
        border: 1px solid var(--color-border-faint);
        border-radius: var(--radius-md);
        padding: 14px 16px;
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .missao-card.concluida {
        opacity: 0.6;
      }
      .missao-icon {
        font-size: 22px;
        flex-shrink: 0;
      }
      .missao-info {
        flex: 1;
        min-width: 0;
      }
      .missao-titulo {
        font-size: 13px;
        font-weight: 600;
        color: var(--color-text);
        margin-bottom: 2px;
      }
      .missao-desc {
        font-size: 12px;
        color: var(--color-text-muted);
      }
      .missao-xp {
        font-size: 12px;
        font-weight: 700;
        color: var(--color-primary);
        flex-shrink: 0;
      }
      .missao-status {
        font-size: 11px;
        font-weight: 600;
        padding: 3px 8px;
        border-radius: 100px;
        flex-shrink: 0;
      }
      .missao-status.pendente {
        background: var(--color-warning-bg);
        color: var(--color-warning);
      }
      .missao-status.concluida {
        background: var(--color-success-bg);
        color: var(--color-success);
      }
      .missao-prog {
        font-size: 11px;
        color: var(--color-text-disabled);
        margin-top: 3px;
      }
      .link-ranking {
        font-size: 13px;
        color: var(--color-primary);
        text-decoration: none;
        font-weight: 600;
      }
      .link-ranking:hover {
        text-decoration: underline;
      }
      #loading {
        text-align: center;
        padding: 40px;
        color: var(--color-text-muted);
      }
    </style>
    <script>
      (function () {
        const t = localStorage.getItem('senai_tema') || 'light';
        document.documentElement.setAttribute('data-theme', t);
      })();
    </script>
  </head>
  <body>
    <script>
      (function () {
        if (!localStorage.getItem('erp_role')) window.location.replace('../index.html');
      })();
    </script>

    <div class="sidebar-overlay" id="sidebarOverlay" onclick="toggleSidebar()"></div>

    <!-- HEADER (copiar do padrão do projeto) -->
    <header
      style="position:fixed;top:0;left:0;right:0;height:56px;background:var(--color-primary);display:flex;align-items:center;padding:0 20px;gap:14px;z-index:100;box-shadow:0 2px 8px rgba(0,0,0,.18)"
    >
      <button class="btn-menu" onclick="toggleSidebar()">☰</button>
      <span style="color:#fff;font-weight:700;font-size:16px;flex:1">🎮 ERP SENAI</span>
      <button
        onclick="toggleTema()"
        style="background:rgba(255,255,255,.15);border:none;color:#fff;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px"
      >
        🌙 Tema
      </button>
      <button
        onclick="sair()"
        style="background:rgba(255,255,255,.15);border:none;color:#fff;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px"
      >
        Sair
      </button>
    </header>

    <div class="app-layout" style="margin-top:56px">
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-section">
          <div class="sidebar-section-label">Principal</div>
          <a class="sidebar-link" href="../dashboard.html"
            ><span class="sidebar-icon">🏠</span> Visão Geral</a
          >
        </div>
        <div class="sidebar-section">
          <div class="sidebar-section-label">Cadastros</div>
          <a class="sidebar-link" href="../cadastros/clientes.html"
            ><span class="sidebar-icon">👥</span> Clientes</a
          >
          <a class="sidebar-link" href="../cadastros/fornecedores.html"
            ><span class="sidebar-icon">🏭</span> Fornecedores</a
          >
          <a class="sidebar-link" href="../cadastros/produtos.html"
            ><span class="sidebar-icon">📦</span> Produtos</a
          >
          <a class="sidebar-link" href="../cadastros/transportadoras.html"
            ><span class="sidebar-icon">🚚</span> Transportadoras</a
          >
        </div>
        <div class="sidebar-section">
          <div class="sidebar-section-label">Compras</div>
          <a class="sidebar-link" href="../compras/planejamento.html"
            ><span class="sidebar-icon">📋</span> Planejamento</a
          >
          <a class="sidebar-link" href="../compras/solicitacoes.html"
            ><span class="sidebar-icon">📝</span> Solicitações</a
          >
          <a class="sidebar-link" href="../compras/pedidos.html"
            ><span class="sidebar-icon">🛒</span> Pedidos</a
          >
          <a class="sidebar-link" href="../compras/recebimento.html"
            ><span class="sidebar-icon">📥</span> Recebimento</a
          >
          <a class="sidebar-link" href="../compras/conferencia.html"
            ><span class="sidebar-icon">✅</span> Conferência</a
          >
          <a class="sidebar-link" href="../compras/nota-fiscal.html"
            ><span class="sidebar-icon">🧾</span> Nota Fiscal</a
          >
        </div>
        <div class="sidebar-section">
          <div class="sidebar-section-label">Vendas e Logística</div>
          <a class="sidebar-link" href="../vendas/pedidos-venda.html"
            ><span class="sidebar-icon">🛍️</span> Pedidos de Venda</a
          >
          <a class="sidebar-link" href="../vendas/nota-fiscal-venda.html"
            ><span class="sidebar-icon">📄</span> NF de Venda</a
          >
          <a class="sidebar-link" href="../vendas/separacao.html"
            ><span class="sidebar-icon">📤</span> Separação</a
          >
          <a class="sidebar-link" href="../vendas/romaneio.html"
            ><span class="sidebar-icon">📃</span> Romaneio</a
          >
          <a class="sidebar-link" href="../vendas/expedicao.html"
            ><span class="sidebar-icon">🚀</span> Expedição</a
          >
          <a class="sidebar-link" href="../vendas/entrega.html"
            ><span class="sidebar-icon">📍</span> Entrega</a
          >
        </div>
        <div class="sidebar-section">
          <div class="sidebar-section-label">Estoque</div>
          <a class="sidebar-link" href="../estoque/controle.html"
            ><span class="sidebar-icon">📊</span> Controle</a
          >
          <a class="sidebar-link" href="../estoque/movimentacoes.html"
            ><span class="sidebar-icon">🔄</span> Movimentações</a
          >
          <a class="sidebar-link" href="../estoque/armazenagem.html"
            ><span class="sidebar-icon">🏪</span> Armazenagem</a
          >
          <a class="sidebar-link" href="../estoque/inventario.html"
            ><span class="sidebar-icon">🔍</span> Inventário</a
          >
        </div>
        <div class="sidebar-section">
          <div class="sidebar-section-label">Financeiro</div>
          <a class="sidebar-link" href="../financeiro/contas-pagar.html"
            ><span class="sidebar-icon">💸</span> Contas a Pagar</a
          >
          <a class="sidebar-link" href="../financeiro/contas-receber.html"
            ><span class="sidebar-icon">💰</span> Contas a Receber</a
          >
          <a class="sidebar-link" href="../financeiro/balancete.html"
            ><span class="sidebar-icon">📊</span> Balancete Gerencial</a
          >
        </div>
        <div class="sidebar-section">
          <div class="sidebar-section-label">Marketing</div>
          <a class="sidebar-link" href="../marketing/campanhas.html"
            ><span class="sidebar-icon">📣</span> Campanhas</a
          >
          <a class="sidebar-link" href="../marketing/retornos.html"
            ><span class="sidebar-icon">📈</span> Retornos</a
          >
        </div>
        <div class="sidebar-section">
          <div class="sidebar-section-label">Gamificação</div>
          <a class="sidebar-link ativo" href="index.html"
            ><span class="sidebar-icon">🎮</span> Minha Jornada</a
          >
          <a class="sidebar-link" href="ranking.html"
            ><span class="sidebar-icon">🏆</span> Ranking</a
          >
          <a class="sidebar-link" id="linkAdmin" href="admin.html" style="display:none"
            ><span class="sidebar-icon">⚙️</span> Admin Gamif.</a
          >
        </div>
        <div style="height:24px"></div>
      </aside>

      <main class="main">
        <div
          style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px"
        >
          <div>
            <h1 style="font-size:22px;font-weight:700;color:var(--color-text)">🎮 Minha Jornada</h1>
            <p style="font-size:13px;color:var(--color-text-muted);margin-top:2px">
              Acompanhe seu progresso no ERP
            </p>
          </div>
          <a class="link-ranking" href="ranking.html">Ver Ranking →</a>
        </div>

        <div id="loading">Carregando seu progresso...</div>
        <div id="conteudo" style="display:none">
          <!-- Perfil -->
          <div class="perfil-card">
            <div class="perfil-nome" id="pNome"></div>
            <div class="perfil-nivel" id="pNivel"></div>
            <div class="xp-bar-wrap"><div class="xp-bar" id="pBar" style="width:0%"></div></div>
            <div class="xp-label" id="pXpLabel"></div>
            <div class="badges-row" id="pBadges"></div>
          </div>

          <!-- Missões -->
          <div class="section-header">
            <div class="section-title">Missões</div>
            <div style="display:flex;gap:8px">
              <button class="filter-btn ativo" onclick="filtrar('todas',this)">Todas</button>
              <button class="filter-btn" onclick="filtrar('pendente',this)">Pendentes</button>
              <button class="filter-btn" onclick="filtrar('concluida',this)">Concluídas</button>
            </div>
          </div>
          <div class="missoes-list" id="missoesList"></div>
        </div>
      </main>
    </div>

    <script>
      const SB_URL = 'https://vdhahqicqlrdvcpesiwk.supabase.co/rest/v1';
      const SB_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3YXNiemRia2JyeW5jcHZmdWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MzA3ODEsImV4cCI6MjA2MjQwNjc4MX0.Bz7aZ6yG6DUTtWQ4WdeNbslWzE4qU81zzblUeHdTduU';
      const HDR = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` };

      const uid = localStorage.getItem('erp_user_id');
      const nome = localStorage.getItem('erp_user_nome') || 'Usuário';
      const role = localStorage.getItem('erp_role');

      if (role === 'Administrador') document.getElementById('linkAdmin').style.display = 'flex';

      let _missoes = [];
      let _filtro = 'todas';

      async function get(path) {
        const r = await fetch(`${SB_URL}/${path}`, { headers: HDR });
        return r.json();
      }

      async function init() {
        const perfil = await gamif.carregarPerfil();

        document.getElementById('pNome').textContent = nome;
        document.getElementById('pNivel').textContent =
          `⭐ Nível ${perfil.nivel} — ${perfil.nome_nivel}`;
        document.getElementById('pBar').style.width = perfil.percentual + '%';

        const proxNivel = perfil.NIVEIS.find((n) => n.nivel === perfil.nivel + 1);
        document.getElementById('pXpLabel').textContent = proxNivel
          ? `${perfil.xp_total} / ${proxNivel.xp} XP para o próximo nível`
          : `${perfil.xp_total} XP — Nível máximo atingido! 🌟`;

        const badgesEl = document.getElementById('pBadges');
        badgesEl.innerHTML = perfil.BADGES_DEF.map((b) => {
          const ganhou = perfil.badges.includes(b.slug);
          return `<span class="badge-pill ${ganhou ? 'ganho' : ''}" title="${b.nome}">${b.emoji} ${b.nome}</span>`;
        }).join('');

        const prog = await get(
          `gamif_progresso?usuario_id=eq.${uid}&select=missao_id,progresso,concluida`
        );
        const missoes = await get(
          `gamif_missoes?ativo=eq.true&order=tipo.asc&select=id,titulo,descricao,evento,meta,xp,tipo`
        );

        const progMap = {};
        prog.forEach((p) => {
          progMap[p.missao_id] = p;
        });

        _missoes = missoes.map((m) => ({
          ...m,
          prog: progMap[m.id] || { progresso: 0, concluida: false }
        }));

        renderMissoes();
        document.getElementById('loading').style.display = 'none';
        document.getElementById('conteudo').style.display = 'block';
      }

      function renderMissoes() {
        const list = document.getElementById('missoesList');
        const itens =
          _filtro === 'todas'
            ? _missoes
            : _missoes.filter((m) =>
                _filtro === 'concluida' ? m.prog.concluida : !m.prog.concluida
              );

        if (!itens.length) {
          list.innerHTML =
            '<p style="color:var(--color-text-muted);padding:20px 0">Nenhuma missão encontrada.</p>';
          return;
        }

        list.innerHTML = itens
          .map(
            (m) => `
      <div class="missao-card ${m.prog.concluida ? 'concluida' : ''}">
        <div class="missao-icon">${m.tipo === 'onboarding' ? '📘' : m.tipo === 'especial' ? '⭐' : '🎯'}</div>
        <div class="missao-info">
          <div class="missao-titulo">${m.titulo}</div>
          <div class="missao-desc">${m.descricao || ''}</div>
          ${m.meta > 1 ? `<div class="missao-prog">Progresso: ${m.prog.progresso}/${m.meta}</div>` : ''}
        </div>
        <div class="missao-xp">+${m.xp} XP</div>
        <span class="missao-status ${m.prog.concluida ? 'concluida' : 'pendente'}">${m.prog.concluida ? '✅ Feita' : '⏳ Pendente'}</span>
      </div>
    `
          )
          .join('');
      }

      function filtrar(f, btn) {
        _filtro = f;
        document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('ativo'));
        btn.classList.add('ativo');
        renderMissoes();
      }

      function toggleSidebar() {
        document.getElementById('sidebar').classList.toggle('open');
        document.getElementById('sidebarOverlay').classList.toggle('show');
      }
      function toggleTema() {
        const t = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', t);
        localStorage.setItem('senai_tema', t);
      }
      function sair() {
        localStorage.clear();
        window.location.replace('../index.html');
      }

      init();
    </script>
  </body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add gamificacao/index.html
git commit -m "feat: gamificacao/index.html — hub do usuário com XP, nível e missões"
git push origin main
```

---

## Task 4: ranking.html — Leaderboard do Grupo

**Files:**

- Create: `gamificacao/ranking.html`

**Interfaces:**

- Consome: `gamif_usuario_grupo` + `gamif_perfil` + `erp_usuarios` via Supabase REST

- [ ] **Step 1: Criar `gamificacao/ranking.html`**

```html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>ERP — Ranking</title>
    <link rel="stylesheet" href="../styles.css" />
    <script src="gamif.js"></script>
    <style>
      .app-layout {
        display: flex;
        min-height: calc(100vh - 56px);
      }
      .sidebar {
        width: 240px;
        background: var(--color-surface);
        border-right: 1px solid var(--color-border-faint);
        display: flex;
        flex-direction: column;
        position: fixed;
        top: 56px;
        left: 0;
        bottom: 0;
        overflow-y: auto;
        z-index: 50;
        transition: transform 0.25s;
      }
      .sidebar-section {
        padding: 20px 0 4px;
      }
      .sidebar-section-label {
        font-size: 10px;
        font-weight: 700;
        color: var(--color-text-disabled);
        letter-spacing: 1.2px;
        text-transform: uppercase;
        padding: 0 20px 6px;
      }
      .sidebar-link {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 9px 20px;
        font-size: 13px;
        font-weight: 500;
        color: var(--color-text-muted);
        text-decoration: none;
        border-left: 3px solid transparent;
        transition:
          background 0.15s,
          color 0.15s,
          border-color 0.15s;
      }
      .sidebar-link:hover {
        background: #e8f0fe;
        color: var(--color-primary);
      }
      .sidebar-link.ativo {
        background: #e8f0fe;
        color: var(--color-primary);
        border-left-color: var(--color-primary);
        font-weight: 600;
      }
      [data-theme='dark'] .sidebar-link:hover,
      [data-theme='dark'] .sidebar-link.ativo {
        background: #1e2554;
        color: #7aa3d4;
      }
      .sidebar-icon {
        font-size: 16px;
        width: 20px;
        text-align: center;
        flex-shrink: 0;
      }
      .main {
        margin-left: 240px;
        padding: 28px 32px;
        flex: 1;
      }
      @media (max-width: 768px) {
        .sidebar {
          transform: translateX(-100%);
        }
        .main {
          margin-left: 0;
          padding: 16px;
        }
        .sidebar.open {
          transform: translateX(0);
        }
      }
      .sidebar-overlay {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.45);
        z-index: 49;
      }
      .sidebar-overlay.show {
        display: block;
      }
      .btn-menu {
        display: none;
        background: rgba(255, 255, 255, 0.15);
        border: none;
        color: #fff;
        font-size: 20px;
        width: 36px;
        height: 36px;
        border-radius: 6px;
        cursor: pointer;
        align-items: center;
        justify-content: center;
      }
      @media (max-width: 768px) {
        .btn-menu {
          display: flex;
        }
      }
      .ranking-card {
        background: var(--color-surface);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);
        overflow: hidden;
      }
      .ranking-header {
        padding: 16px 20px;
        border-bottom: 1px solid var(--color-border-faint);
        font-weight: 700;
        font-size: 15px;
        color: var(--color-text);
      }
      .ranking-row {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 14px 20px;
        border-bottom: 1px solid var(--color-border-faint);
      }
      .ranking-row:last-child {
        border-bottom: none;
      }
      .ranking-row.eu {
        background: #e8f0fe;
      }
      [data-theme='dark'] .ranking-row.eu {
        background: #1e2554;
      }
      .rank-pos {
        font-size: 20px;
        width: 36px;
        text-align: center;
        flex-shrink: 0;
      }
      .rank-nome {
        flex: 1;
        font-size: 14px;
        font-weight: 600;
        color: var(--color-text);
      }
      .rank-nivel {
        font-size: 12px;
        color: var(--color-text-muted);
      }
      .rank-xp {
        font-size: 13px;
        font-weight: 700;
        color: var(--color-primary);
      }
      .sem-grupo {
        text-align: center;
        padding: 40px;
        color: var(--color-text-muted);
      }
      #loading {
        text-align: center;
        padding: 40px;
        color: var(--color-text-muted);
      }
    </style>
    <script>
      (function () {
        const t = localStorage.getItem('senai_tema') || 'light';
        document.documentElement.setAttribute('data-theme', t);
      })();
    </script>
  </head>
  <body>
    <script>
      (function () {
        if (!localStorage.getItem('erp_role')) window.location.replace('../index.html');
      })();
    </script>

    <div class="sidebar-overlay" id="sidebarOverlay" onclick="toggleSidebar()"></div>

    <header
      style="position:fixed;top:0;left:0;right:0;height:56px;background:var(--color-primary);display:flex;align-items:center;padding:0 20px;gap:14px;z-index:100;box-shadow:0 2px 8px rgba(0,0,0,.18)"
    >
      <button class="btn-menu" onclick="toggleSidebar()">☰</button>
      <span style="color:#fff;font-weight:700;font-size:16px;flex:1">🏆 ERP SENAI</span>
      <button
        onclick="toggleTema()"
        style="background:rgba(255,255,255,.15);border:none;color:#fff;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px"
      >
        🌙 Tema
      </button>
      <button
        onclick="sair()"
        style="background:rgba(255,255,255,.15);border:none;color:#fff;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px"
      >
        Sair
      </button>
    </header>

    <div class="app-layout" style="margin-top:56px">
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-section">
          <div class="sidebar-section-label">Principal</div>
          <a class="sidebar-link" href="../dashboard.html"
            ><span class="sidebar-icon">🏠</span> Visão Geral</a
          >
        </div>
        <div class="sidebar-section">
          <div class="sidebar-section-label">Cadastros</div>
          <a class="sidebar-link" href="../cadastros/clientes.html"
            ><span class="sidebar-icon">👥</span> Clientes</a
          >
          <a class="sidebar-link" href="../cadastros/fornecedores.html"
            ><span class="sidebar-icon">🏭</span> Fornecedores</a
          >
          <a class="sidebar-link" href="../cadastros/produtos.html"
            ><span class="sidebar-icon">📦</span> Produtos</a
          >
          <a class="sidebar-link" href="../cadastros/transportadoras.html"
            ><span class="sidebar-icon">🚚</span> Transportadoras</a
          >
        </div>
        <div class="sidebar-section">
          <div class="sidebar-section-label">Compras</div>
          <a class="sidebar-link" href="../compras/planejamento.html"
            ><span class="sidebar-icon">📋</span> Planejamento</a
          >
          <a class="sidebar-link" href="../compras/solicitacoes.html"
            ><span class="sidebar-icon">📝</span> Solicitações</a
          >
          <a class="sidebar-link" href="../compras/pedidos.html"
            ><span class="sidebar-icon">🛒</span> Pedidos</a
          >
          <a class="sidebar-link" href="../compras/recebimento.html"
            ><span class="sidebar-icon">📥</span> Recebimento</a
          >
          <a class="sidebar-link" href="../compras/conferencia.html"
            ><span class="sidebar-icon">✅</span> Conferência</a
          >
          <a class="sidebar-link" href="../compras/nota-fiscal.html"
            ><span class="sidebar-icon">🧾</span> Nota Fiscal</a
          >
        </div>
        <div class="sidebar-section">
          <div class="sidebar-section-label">Vendas e Logística</div>
          <a class="sidebar-link" href="../vendas/pedidos-venda.html"
            ><span class="sidebar-icon">🛍️</span> Pedidos de Venda</a
          >
          <a class="sidebar-link" href="../vendas/nota-fiscal-venda.html"
            ><span class="sidebar-icon">📄</span> NF de Venda</a
          >
          <a class="sidebar-link" href="../vendas/separacao.html"
            ><span class="sidebar-icon">📤</span> Separação</a
          >
          <a class="sidebar-link" href="../vendas/romaneio.html"
            ><span class="sidebar-icon">📃</span> Romaneio</a
          >
          <a class="sidebar-link" href="../vendas/expedicao.html"
            ><span class="sidebar-icon">🚀</span> Expedição</a
          >
          <a class="sidebar-link" href="../vendas/entrega.html"
            ><span class="sidebar-icon">📍</span> Entrega</a
          >
        </div>
        <div class="sidebar-section">
          <div class="sidebar-section-label">Estoque</div>
          <a class="sidebar-link" href="../estoque/controle.html"
            ><span class="sidebar-icon">📊</span> Controle</a
          >
          <a class="sidebar-link" href="../estoque/movimentacoes.html"
            ><span class="sidebar-icon">🔄</span> Movimentações</a
          >
          <a class="sidebar-link" href="../estoque/armazenagem.html"
            ><span class="sidebar-icon">🏪</span> Armazenagem</a
          >
          <a class="sidebar-link" href="../estoque/inventario.html"
            ><span class="sidebar-icon">🔍</span> Inventário</a
          >
        </div>
        <div class="sidebar-section">
          <div class="sidebar-section-label">Financeiro</div>
          <a class="sidebar-link" href="../financeiro/contas-pagar.html"
            ><span class="sidebar-icon">💸</span> Contas a Pagar</a
          >
          <a class="sidebar-link" href="../financeiro/contas-receber.html"
            ><span class="sidebar-icon">💰</span> Contas a Receber</a
          >
          <a class="sidebar-link" href="../financeiro/balancete.html"
            ><span class="sidebar-icon">📊</span> Balancete Gerencial</a
          >
        </div>
        <div class="sidebar-section">
          <div class="sidebar-section-label">Marketing</div>
          <a class="sidebar-link" href="../marketing/campanhas.html"
            ><span class="sidebar-icon">📣</span> Campanhas</a
          >
          <a class="sidebar-link" href="../marketing/retornos.html"
            ><span class="sidebar-icon">📈</span> Retornos</a
          >
        </div>
        <div class="sidebar-section">
          <div class="sidebar-section-label">Gamificação</div>
          <a class="sidebar-link" href="index.html"
            ><span class="sidebar-icon">🎮</span> Minha Jornada</a
          >
          <a class="sidebar-link ativo" href="ranking.html"
            ><span class="sidebar-icon">🏆</span> Ranking</a
          >
          <a class="sidebar-link" id="linkAdmin" href="admin.html" style="display:none"
            ><span class="sidebar-icon">⚙️</span> Admin Gamif.</a
          >
        </div>
        <div style="height:24px"></div>
      </aside>

      <main class="main">
        <div style="margin-bottom:20px">
          <h1 style="font-size:22px;font-weight:700;color:var(--color-text)">
            🏆 Ranking do Grupo
          </h1>
          <p style="font-size:13px;color:var(--color-text-muted);margin-top:2px" id="nomeGrupo">
            Carregando...
          </p>
        </div>
        <div id="loading">Carregando ranking...</div>
        <div id="conteudo" style="display:none">
          <div class="ranking-card">
            <div class="ranking-header" id="rankHeader"></div>
            <div id="rankList"></div>
          </div>
        </div>
        <div id="semGrupo" style="display:none" class="sem-grupo">
          <p style="font-size:32px">🎮</p>
          <p style="font-weight:700;margin:8px 0">Você ainda não está em nenhum grupo</p>
          <p style="font-size:13px">
            Peça ao administrador para adicioná-lo a um grupo para ver o ranking.
          </p>
        </div>
      </main>
    </div>

    <script>
      const SB_URL = 'https://vdhahqicqlrdvcpesiwk.supabase.co/rest/v1';
      const SB_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3YXNiemRia2JyeW5jcHZmdWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MzA3ODEsImV4cCI6MjA2MjQwNjc4MX0.Bz7aZ6yG6DUTtWQ4WdeNbslWzE4qU81zzblUeHdTduU';
      const HDR = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` };
      const uid = localStorage.getItem('erp_user_id');
      const role = localStorage.getItem('erp_role');

      if (role === 'Administrador') document.getElementById('linkAdmin').style.display = 'flex';

      const NIVEL_NOMES = [
        '',
        'Iniciante',
        'Aprendiz',
        'Operador',
        'Analista',
        'Especialista',
        'Sênior',
        'Master ERP'
      ];

      async function get(path) {
        const r = await fetch(`${SB_URL}/${path}`, { headers: HDR });
        return r.json();
      }

      const MEDALHAS = ['🥇', '🥈', '🥉'];

      async function init() {
        const grupos = await get(`gamif_usuario_grupo?usuario_id=eq.${uid}&select=grupo_id`);
        if (!grupos.length) {
          document.getElementById('loading').style.display = 'none';
          document.getElementById('semGrupo').style.display = 'block';
          return;
        }

        const gid = grupos[0].grupo_id;
        const grupo = await get(`gamif_grupos?id=eq.${gid}&select=nome`);
        const membros = await get(`gamif_usuario_grupo?grupo_id=eq.${gid}&select=usuario_id`);
        const ids = membros.map((m) => m.usuario_id).join(',');
        const perfis = await get(
          `gamif_perfil?usuario_id=in.(${ids})&order=xp_total.desc&select=usuario_id,xp_total,nivel`
        );
        const usuarios = await get(`erp_usuarios?id=in.(${ids})&select=id,nome`);

        const nomeMap = {};
        usuarios.forEach((u) => {
          nomeMap[u.id] = u.nome;
        });

        document.getElementById('nomeGrupo').textContent = grupo[0]?.nome || '';
        document.getElementById('rankHeader').textContent =
          `${grupo[0]?.nome || 'Grupo'} — ${perfis.length} participante${perfis.length !== 1 ? 's' : ''}`;

        document.getElementById('rankList').innerHTML = perfis
          .map(
            (p, i) => `
      <div class="ranking-row ${p.usuario_id === uid ? 'eu' : ''}">
        <div class="rank-pos">${MEDALHAS[i] || i + 1}</div>
        <div class="rank-nome">
          ${nomeMap[p.usuario_id] || 'Usuário'}
          ${p.usuario_id === uid ? ' <span style="font-size:11px;color:var(--color-primary)">(você)</span>' : ''}
          <div class="rank-nivel">Nível ${p.nivel} — ${NIVEL_NOMES[p.nivel] || ''}</div>
        </div>
        <div class="rank-xp">${p.xp_total.toLocaleString('pt-BR')} XP</div>
      </div>
    `
          )
          .join('');

        document.getElementById('loading').style.display = 'none';
        document.getElementById('conteudo').style.display = 'block';
      }

      function toggleSidebar() {
        document.getElementById('sidebar').classList.toggle('open');
        document.getElementById('sidebarOverlay').classList.toggle('show');
      }
      function toggleTema() {
        const t = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', t);
        localStorage.setItem('senai_tema', t);
      }
      function sair() {
        localStorage.clear();
        window.location.replace('../index.html');
      }

      init();
    </script>
  </body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add gamificacao/ranking.html
git commit -m "feat: gamificacao/ranking.html — leaderboard do grupo"
git push origin main
```

---

## Task 5: admin.html — Painel Administrativo

**Files:**

- Create: `gamificacao/admin.html`

**Interfaces:**

- Consome: `gamif_missoes`, `gamif_grupos`, `gamif_usuario_grupo`, `gamif_perfil`, `gamif_progresso`, `erp_usuarios` via Supabase REST
- Acesso restrito a `erp_role === 'Administrador'`

- [ ] **Step 1: Criar `gamificacao/admin.html`**

```html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>ERP — Admin Gamificação</title>
    <link rel="stylesheet" href="../styles.css" />
    <style>
      .app-layout {
        display: flex;
        min-height: calc(100vh - 56px);
      }
      .sidebar {
        width: 240px;
        background: var(--color-surface);
        border-right: 1px solid var(--color-border-faint);
        display: flex;
        flex-direction: column;
        position: fixed;
        top: 56px;
        left: 0;
        bottom: 0;
        overflow-y: auto;
        z-index: 50;
        transition: transform 0.25s;
      }
      .sidebar-section {
        padding: 20px 0 4px;
      }
      .sidebar-section-label {
        font-size: 10px;
        font-weight: 700;
        color: var(--color-text-disabled);
        letter-spacing: 1.2px;
        text-transform: uppercase;
        padding: 0 20px 6px;
      }
      .sidebar-link {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 9px 20px;
        font-size: 13px;
        font-weight: 500;
        color: var(--color-text-muted);
        text-decoration: none;
        border-left: 3px solid transparent;
        transition:
          background 0.15s,
          color 0.15s,
          border-color 0.15s;
      }
      .sidebar-link:hover {
        background: #e8f0fe;
        color: var(--color-primary);
      }
      .sidebar-link.ativo {
        background: #e8f0fe;
        color: var(--color-primary);
        border-left-color: var(--color-primary);
        font-weight: 600;
      }
      [data-theme='dark'] .sidebar-link:hover,
      [data-theme='dark'] .sidebar-link.ativo {
        background: #1e2554;
        color: #7aa3d4;
      }
      .sidebar-icon {
        font-size: 16px;
        width: 20px;
        text-align: center;
        flex-shrink: 0;
      }
      .main {
        margin-left: 240px;
        padding: 28px 32px;
        flex: 1;
      }
      @media (max-width: 768px) {
        .sidebar {
          transform: translateX(-100%);
        }
        .main {
          margin-left: 0;
          padding: 16px;
        }
        .sidebar.open {
          transform: translateX(0);
        }
      }
      .sidebar-overlay {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.45);
        z-index: 49;
      }
      .sidebar-overlay.show {
        display: block;
      }
      .btn-menu {
        display: none;
        background: rgba(255, 255, 255, 0.15);
        border: none;
        color: #fff;
        font-size: 20px;
        width: 36px;
        height: 36px;
        border-radius: 6px;
        cursor: pointer;
        align-items: center;
        justify-content: center;
      }
      @media (max-width: 768px) {
        .btn-menu {
          display: flex;
        }
      }
      /* Abas */
      .abas {
        display: flex;
        gap: 4px;
        border-bottom: 2px solid var(--color-border-faint);
        margin-bottom: 20px;
      }
      .aba {
        padding: 10px 18px;
        font-size: 13px;
        font-weight: 600;
        color: var(--color-text-muted);
        cursor: pointer;
        border-bottom: 2px solid transparent;
        margin-bottom: -2px;
        background: none;
        border-top: none;
        border-left: none;
        border-right: none;
        font-family: inherit;
      }
      .aba.ativa {
        color: var(--color-primary);
        border-bottom-color: var(--color-primary);
      }
      .painel {
        display: none;
      }
      .painel.ativo {
        display: block;
      }
      /* Cards métricas */
      .metrics {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 14px;
        margin-bottom: 24px;
      }
      .metric-card {
        background: var(--color-surface);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-sm);
        padding: 16px;
      }
      .metric-val {
        font-size: 28px;
        font-weight: 800;
        color: var(--color-primary);
      }
      .metric-label {
        font-size: 12px;
        color: var(--color-text-muted);
        margin-top: 4px;
      }
      /* Tabela */
      .section-card {
        background: var(--color-surface);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);
        overflow: hidden;
        margin-bottom: 20px;
      }
      .section-card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 20px;
        border-bottom: 1px solid var(--color-border-faint);
      }
      .section-card-title {
        font-size: 15px;
        font-weight: 700;
        color: var(--color-text);
      }
      .crud-table-wrap {
        overflow-x: auto;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th,
      td {
        padding: 10px 14px;
        text-align: left;
        font-size: 13px;
        border-bottom: 1px solid var(--color-border-faint);
      }
      th {
        font-size: 11px;
        font-weight: 700;
        color: var(--color-text-disabled);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        background: var(--color-surface-2);
      }
      tr:last-child td {
        border-bottom: none;
      }
      .badge-tipo {
        padding: 2px 8px;
        border-radius: 100px;
        font-size: 11px;
        font-weight: 600;
      }
      .badge-tipo.onboarding {
        background: #e8f0fe;
        color: #1a56db;
      }
      .badge-tipo.especial {
        background: #fef3c7;
        color: #92400e;
      }
      .badge-tipo.modulo {
        background: #d1fae5;
        color: #065f46;
      }
      /* Modal */
      .crud-backdrop {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 200;
        align-items: center;
        justify-content: center;
        padding: 12px;
      }
      .crud-backdrop.show {
        display: flex;
      }
      .crud-modal {
        background: var(--color-surface);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        width: 100%;
        max-width: 520px;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
      }
      .crud-modal-header {
        padding: 16px 20px;
        border-bottom: 1px solid var(--color-border-faint);
        font-weight: 700;
        font-size: 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .modal-body-scroll {
        overflow-y: auto;
        padding: 20px;
        flex: 1;
      }
      .modal-footer {
        padding: 12px 20px;
        display: flex;
        justify-content: center;
        gap: 10px;
        border-top: 1px solid var(--color-border-faint);
        background: var(--color-surface-2);
      }
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-bottom: 12px;
      }
      .form-label {
        font-size: 10px;
        font-weight: 700;
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }
      .form-input,
      .form-select,
      .form-textarea {
        width: 100%;
        padding: 9px 12px;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        font-size: 13px;
        color: var(--color-text);
        background: var(--color-surface-3);
        font-family: inherit;
        outline: none;
      }
      .form-input:focus,
      .form-select:focus {
        border-color: var(--color-primary);
      }
      @media (max-width: 600px) {
        .form-input,
        .form-select,
        .form-textarea {
          font-size: 16px;
        }
      }
    </style>
    <script>
      (function () {
        const t = localStorage.getItem('senai_tema') || 'light';
        document.documentElement.setAttribute('data-theme', t);
      })();
    </script>
  </head>
  <body>
    <script>
      (function () {
        const role = localStorage.getItem('erp_role');
        if (!role) window.location.replace('../index.html');
        if (role !== 'Administrador') {
          alert('Acesso restrito a administradores.');
          window.location.replace('../dashboard.html');
        }
      })();
    </script>

    <div class="sidebar-overlay" id="sidebarOverlay" onclick="toggleSidebar()"></div>

    <header
      style="position:fixed;top:0;left:0;right:0;height:56px;background:var(--color-primary);display:flex;align-items:center;padding:0 20px;gap:14px;z-index:100;box-shadow:0 2px 8px rgba(0,0,0,.18)"
    >
      <button class="btn-menu" onclick="toggleSidebar()">☰</button>
      <span style="color:#fff;font-weight:700;font-size:16px;flex:1">⚙️ ERP SENAI</span>
      <button
        onclick="toggleTema()"
        style="background:rgba(255,255,255,.15);border:none;color:#fff;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px"
      >
        🌙 Tema
      </button>
      <button
        onclick="sair()"
        style="background:rgba(255,255,255,.15);border:none;color:#fff;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px"
      >
        Sair
      </button>
    </header>

    <div class="app-layout" style="margin-top:56px">
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-section">
          <div class="sidebar-section-label">Principal</div>
          <a class="sidebar-link" href="../dashboard.html"
            ><span class="sidebar-icon">🏠</span> Visão Geral</a
          >
        </div>
        <div class="sidebar-section">
          <div class="sidebar-section-label">Gamificação</div>
          <a class="sidebar-link" href="index.html"
            ><span class="sidebar-icon">🎮</span> Minha Jornada</a
          >
          <a class="sidebar-link" href="ranking.html"
            ><span class="sidebar-icon">🏆</span> Ranking</a
          >
          <a class="sidebar-link ativo" href="admin.html"
            ><span class="sidebar-icon">⚙️</span> Admin Gamif.</a
          >
        </div>
        <div style="height:24px"></div>
      </aside>

      <main class="main">
        <div style="margin-bottom:20px">
          <h1 style="font-size:22px;font-weight:700;color:var(--color-text)">
            ⚙️ Admin — Gamificação
          </h1>
        </div>

        <div class="abas">
          <button class="aba ativa" onclick="trocarAba('missoes',this)">Missões</button>
          <button class="aba" onclick="trocarAba('grupos',this)">Grupos</button>
          <button class="aba" onclick="trocarAba('geral',this)">Visão Geral</button>
        </div>

        <!-- ABA MISSÕES -->
        <div class="painel ativo" id="painelMissoes">
          <div class="section-card">
            <div class="section-card-header">
              <div class="section-card-title">Missões</div>
              <button class="btn btn-primary" onclick="abrirModalMissao()">+ Nova Missão</button>
            </div>
            <div class="crud-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Evento</th>
                    <th>Meta</th>
                    <th>XP</th>
                    <th>Tipo</th>
                    <th>Grupo</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody id="tbodyMissoes">
                  <tr>
                    <td
                      colspan="8"
                      style="text-align:center;padding:20px;color:var(--color-text-muted)"
                    >
                      Carregando...
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ABA GRUPOS -->
        <div class="painel" id="painelGrupos">
          <div class="section-card" style="margin-bottom:16px">
            <div class="section-card-header">
              <div class="section-card-title">Grupos</div>
              <button class="btn btn-primary" onclick="abrirModalGrupo()">+ Novo Grupo</button>
            </div>
            <div class="crud-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Tipo</th>
                    <th>Membros</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody id="tbodyGrupos">
                  <tr>
                    <td
                      colspan="4"
                      style="text-align:center;padding:20px;color:var(--color-text-muted)"
                    >
                      Carregando...
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ABA VISÃO GERAL -->
        <div class="painel" id="painelGeral">
          <div class="metrics" id="metrics"></div>
          <div class="section-card">
            <div class="section-card-header">
              <div class="section-card-title">Top 10 por XP</div>
            </div>
            <div class="crud-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Usuário</th>
                    <th>Nível</th>
                    <th>XP Total</th>
                  </tr>
                </thead>
                <tbody id="tbodyTop"></tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Modal Missão -->
    <div class="crud-backdrop" id="modalMissao">
      <div class="crud-modal">
        <div class="crud-modal-header">
          <span id="modalMissaoTitulo">Nova Missão</span
          ><button
            onclick="fecharModalMissao()"
            style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--color-text-muted)"
          >
            ×
          </button>
        </div>
        <div class="modal-body-scroll">
          <div class="form-group">
            <label class="form-label">Título *</label
            ><input class="form-input" id="mTitulo" placeholder="Ex: Crie 3 pedidos de compra" />
          </div>
          <div class="form-group">
            <label class="form-label">Descrição</label
            ><textarea class="form-textarea form-input" id="mDesc" rows="2"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Evento *</label>
            <select class="form-select" id="mEvento">
              <option value="">Selecione...</option>
              <option value="cliente_cadastrado">cliente_cadastrado</option>
              <option value="fornecedor_cadastrado">fornecedor_cadastrado</option>
              <option value="produto_cadastrado">produto_cadastrado</option>
              <option value="solicitacao_criada">solicitacao_criada</option>
              <option value="pedido_compra_criado">pedido_compra_criado</option>
              <option value="recebimento_registrado">recebimento_registrado</option>
              <option value="nota_fiscal_compra_lancada">nota_fiscal_compra_lancada</option>
              <option value="movimentacao_estoque">movimentacao_estoque</option>
              <option value="inventario_realizado">inventario_realizado</option>
              <option value="pedido_venda_criado">pedido_venda_criado</option>
              <option value="expedicao_confirmada">expedicao_confirmada</option>
              <option value="entrega_confirmada">entrega_confirmada</option>
            </select>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div class="form-group">
              <label class="form-label">Meta (repetições) *</label
              ><input class="form-input" id="mMeta" type="number" min="1" value="1" />
            </div>
            <div class="form-group">
              <label class="form-label">XP *</label
              ><input class="form-input" id="mXp" type="number" min="1" value="50" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Tipo</label>
            <select class="form-select" id="mTipo">
              <option value="modulo">Por Módulo</option>
              <option value="especial">Especial</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Grupo</label
            ><select class="form-select" id="mGrupo">
              <option value="">Todos os grupos</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Prazo</label
            ><input class="form-input" id="mPrazo" type="date" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="fecharModalMissao()">Cancelar</button>
          <button class="btn btn-primary" onclick="salvarMissao()">Salvar</button>
        </div>
      </div>
    </div>

    <!-- Modal Grupo -->
    <div class="crud-backdrop" id="modalGrupo">
      <div class="crud-modal">
        <div class="crud-modal-header">
          <span id="modalGrupoTitulo">Novo Grupo</span
          ><button
            onclick="fecharModalGrupo()"
            style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--color-text-muted)"
          >
            ×
          </button>
        </div>
        <div class="modal-body-scroll">
          <div class="form-group">
            <label class="form-label">Nome *</label
            ><input class="form-input" id="gNome" placeholder="Ex: Turma 2026-A" />
          </div>
          <div class="form-group">
            <label class="form-label">Tipo</label>
            <select class="form-select" id="gTipo">
              <option value="turma">Turma</option>
              <option value="setor">Setor</option>
            </select>
          </div>
          <div class="form-group" id="grupoMembrosWrap" style="display:none">
            <label class="form-label">Membros</label>
            <div
              id="grupoMembros"
              style="max-height:200px;overflow-y:auto;border:1px solid var(--color-border);border-radius:var(--radius-md);padding:8px"
            ></div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="fecharModalGrupo()">Cancelar</button>
          <button class="btn btn-primary" onclick="salvarGrupo()">Salvar</button>
        </div>
      </div>
    </div>

    <script>
      const SB_URL = 'https://vdhahqicqlrdvcpesiwk.supabase.co/rest/v1';
      const SB_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3YXNiemRia2JyeW5jcHZmdWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MzA3ODEsImV4cCI6MjA2MjQwNjc4MX0.Bz7aZ6yG6DUTtWQ4WdeNbslWzE4qU81zzblUeHdTduU';
      const HDR = {
        apikey: SB_KEY,
        Authorization: `Bearer ${SB_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      };

      const NIVEL_NOMES = [
        '',
        'Iniciante',
        'Aprendiz',
        'Operador',
        'Analista',
        'Especialista',
        'Sênior',
        'Master ERP'
      ];

      async function get(path) {
        const r = await fetch(`${SB_URL}/${path}`, { headers: HDR });
        return r.json();
      }
      async function post(path, body) {
        const r = await fetch(`${SB_URL}/${path}`, {
          method: 'POST',
          headers: HDR,
          body: JSON.stringify(body)
        });
        return r.json();
      }
      async function patch(path, body) {
        const r = await fetch(`${SB_URL}/${path}`, {
          method: 'PATCH',
          headers: HDR,
          body: JSON.stringify(body)
        });
        return r.json();
      }
      async function del(path) {
        await fetch(`${SB_URL}/${path}`, { method: 'DELETE', headers: HDR });
      }

      let _grupos = [],
        _usuarios = [],
        _idEdicaoMissao = null,
        _idEdicaoGrupo = null;

      // ── Abas ──
      function trocarAba(nome, btn) {
        document.querySelectorAll('.painel').forEach((p) => p.classList.remove('ativo'));
        document.querySelectorAll('.aba').forEach((b) => b.classList.remove('ativa'));
        document
          .getElementById('painel' + nome.charAt(0).toUpperCase() + nome.slice(1))
          .classList.add('ativo');
        btn.classList.add('ativa');
        if (nome === 'geral') carregarGeral();
        if (nome === 'grupos') carregarGrupos();
        if (nome === 'missoes') carregarMissoes();
      }

      // ── Missões ──
      async function carregarMissoes() {
        const [missoes, grupos] = await Promise.all([
          get(
            'gamif_missoes?order=tipo.asc,created_at.desc&select=id,titulo,evento,meta,xp,tipo,grupo_id,ativo'
          ),
          get('gamif_grupos?select=id,nome')
        ]);
        _grupos = grupos;
        const gMap = {};
        grupos.forEach((g) => {
          gMap[g.id] = g.nome;
        });

        const tipos = { onboarding: 'onboarding', modulo: 'modulo', especial: 'especial' };
        document.getElementById('tbodyMissoes').innerHTML = missoes
          .map(
            (m) => `
      <tr>
        <td>${m.titulo}</td>
        <td style="font-size:11px;color:var(--color-text-muted)">${m.evento}</td>
        <td>${m.meta}</td>
        <td style="font-weight:700;color:var(--color-primary)">${m.xp}</td>
        <td><span class="badge-tipo ${tipos[m.tipo] || 'modulo'}">${m.tipo}</span></td>
        <td>${m.grupo_id ? gMap[m.grupo_id] || '—' : 'Todos'}</td>
        <td><span style="font-size:11px;font-weight:600;color:${m.ativo ? 'var(--color-success)' : 'var(--color-text-disabled)'}">${m.ativo ? 'Ativa' : 'Inativa'}</span></td>
        <td>
          ${
            m.tipo !== 'onboarding'
              ? `<button class="btn btn-secondary" style="font-size:11px;padding:4px 8px" onclick="editarMissao('${m.id}')">Editar</button>
          <button class="btn btn-secondary" style="font-size:11px;padding:4px 8px;margin-left:4px" onclick="toggleMissao('${m.id}',${m.ativo})">${m.ativo ? 'Desativar' : 'Ativar'}</button>`
              : '<span style="font-size:11px;color:var(--color-text-disabled)">Fixo</span>'
          }
        </td>
      </tr>
    `
          )
          .join('');

        // Popular select de grupos no modal
        const sel = document.getElementById('mGrupo');
        sel.innerHTML =
          '<option value="">Todos os grupos</option>' +
          grupos.map((g) => `<option value="${g.id}">${g.nome}</option>`).join('');
      }

      function abrirModalMissao() {
        _idEdicaoMissao = null;
        document.getElementById('modalMissaoTitulo').textContent = 'Nova Missão';
        ['mTitulo', 'mDesc', 'mEvento', 'mGrupo', 'mPrazo'].forEach((id) => {
          document.getElementById(id).value = '';
        });
        document.getElementById('mMeta').value = '1';
        document.getElementById('mXp').value = '50';
        document.getElementById('mTipo').value = 'modulo';
        document.getElementById('modalMissao').classList.add('show');
      }

      async function editarMissao(id) {
        const rows = await get(`gamif_missoes?id=eq.${id}&select=*`);
        const m = rows[0];
        if (!m) return;
        _idEdicaoMissao = id;
        document.getElementById('modalMissaoTitulo').textContent = 'Editar Missão';
        document.getElementById('mTitulo').value = m.titulo;
        document.getElementById('mDesc').value = m.descricao || '';
        document.getElementById('mEvento').value = m.evento;
        document.getElementById('mMeta').value = m.meta;
        document.getElementById('mXp').value = m.xp;
        document.getElementById('mTipo').value = m.tipo;
        document.getElementById('mGrupo').value = m.grupo_id || '';
        document.getElementById('mPrazo').value = m.prazo || '';
        document.getElementById('modalMissao').classList.add('show');
      }

      async function salvarMissao() {
        const titulo = document.getElementById('mTitulo').value.trim();
        const evento = document.getElementById('mEvento').value;
        const meta = parseInt(document.getElementById('mMeta').value) || 1;
        const xp = parseInt(document.getElementById('mXp').value) || 0;
        if (!titulo || !evento || !xp) {
          alert('Preencha título, evento e XP.');
          return;
        }

        const dados = {
          titulo,
          descricao: document.getElementById('mDesc').value.trim() || null,
          evento,
          meta,
          xp,
          tipo: document.getElementById('mTipo').value,
          grupo_id: document.getElementById('mGrupo').value || null,
          prazo: document.getElementById('mPrazo').value || null
        };

        if (_idEdicaoMissao) {
          await patch(`gamif_missoes?id=eq.${_idEdicaoMissao}`, dados);
        } else {
          await post('gamif_missoes', dados);
        }
        fecharModalMissao();
        carregarMissoes();
      }

      async function toggleMissao(id, ativo) {
        await patch(`gamif_missoes?id=eq.${id}`, { ativo: !ativo });
        carregarMissoes();
      }

      function fecharModalMissao() {
        document.getElementById('modalMissao').classList.remove('show');
      }

      // ── Grupos ──
      async function carregarGrupos() {
        const [grupos, membros] = await Promise.all([
          get('gamif_grupos?order=nome.asc&select=id,nome,tipo'),
          get('gamif_usuario_grupo?select=grupo_id,usuario_id')
        ]);
        _grupos = grupos;
        const countMap = {};
        membros.forEach((m) => {
          countMap[m.grupo_id] = (countMap[m.grupo_id] || 0) + 1;
        });

        document.getElementById('tbodyGrupos').innerHTML = grupos
          .map(
            (g) => `
      <tr>
        <td style="font-weight:600">${g.nome}</td>
        <td>${g.tipo}</td>
        <td>${countMap[g.id] || 0} membro(s)</td>
        <td>
          <button class="btn btn-secondary" style="font-size:11px;padding:4px 8px" onclick="gerenciarMembros('${g.id}','${g.nome}')">Membros</button>
          <button class="btn btn-secondary" style="font-size:11px;padding:4px 8px;margin-left:4px;color:var(--color-error)" onclick="excluirGrupo('${g.id}')">Excluir</button>
        </td>
      </tr>
    `
          )
          .join('');
      }

      function abrirModalGrupo() {
        _idEdicaoGrupo = null;
        document.getElementById('modalGrupoTitulo').textContent = 'Novo Grupo';
        document.getElementById('gNome').value = '';
        document.getElementById('gTipo').value = 'turma';
        document.getElementById('grupoMembrosWrap').style.display = 'none';
        document.getElementById('modalGrupo').classList.add('show');
      }

      async function salvarGrupo() {
        const nome = document.getElementById('gNome').value.trim();
        if (!nome) {
          alert('Nome é obrigatório.');
          return;
        }
        const dados = { nome, tipo: document.getElementById('gTipo').value };
        if (_idEdicaoGrupo) {
          await patch(`gamif_grupos?id=eq.${_idEdicaoGrupo}`, dados);
        } else {
          await post('gamif_grupos', dados);
        }
        fecharModalGrupo();
        carregarGrupos();
      }

      async function gerenciarMembros(gid, gnome) {
        _idEdicaoGrupo = gid;
        document.getElementById('modalGrupoTitulo').textContent = `Membros — ${gnome}`;
        document.getElementById('gNome').value = gnome;
        document.getElementById('grupoMembrosWrap').style.display = 'block';

        const [usuarios, membros] = await Promise.all([
          get('erp_usuarios?status=eq.true&order=nome.asc&select=id,nome'),
          get(`gamif_usuario_grupo?grupo_id=eq.${gid}&select=usuario_id`)
        ]);
        _usuarios = usuarios;
        const memSet = new Set(membros.map((m) => m.usuario_id));

        document.getElementById('grupoMembros').innerHTML = usuarios
          .map(
            (u) => `
      <label style="display:flex;align-items:center;gap:8px;padding:6px 0;cursor:pointer">
        <input type="checkbox" ${memSet.has(u.id) ? 'checked' : ''} data-uid="${u.id}" style="width:16px;height:16px">
        <span style="font-size:13px">${u.nome}</span>
      </label>
    `
          )
          .join('');

        document.getElementById('modalGrupo').classList.add('show');

        // Override salvar para modo membros
        document.querySelector('#modalGrupo .btn-primary').onclick = async () => {
          const checks = document.querySelectorAll('#grupoMembros input[type=checkbox]');
          await del(`gamif_usuario_grupo?grupo_id=eq.${gid}`);
          for (const c of checks) {
            if (c.checked)
              await post('gamif_usuario_grupo', { grupo_id: gid, usuario_id: c.dataset.uid });
          }
          fecharModalGrupo();
          carregarGrupos();
        };
      }

      async function excluirGrupo(id) {
        if (!confirm('Excluir este grupo? Os membros serão desvinculados.')) return;
        await del(`gamif_usuario_grupo?grupo_id=eq.${id}`);
        await del(`gamif_grupos?id=eq.${id}`);
        carregarGrupos();
      }

      function fecharModalGrupo() {
        document.getElementById('modalGrupo').classList.remove('show');
        document.querySelector('#modalGrupo .btn-primary').onclick = salvarGrupo;
      }

      // ── Visão Geral ──
      async function carregarGeral() {
        const [usuarios, missoesConcluidas, xpData, top] = await Promise.all([
          get('erp_usuarios?status=eq.true&select=id'),
          get('gamif_progresso?concluida=eq.true&select=id'),
          get('gamif_perfil?select=xp_total'),
          get('gamif_perfil?order=xp_total.desc&limit=10&select=usuario_id,xp_total,nivel')
        ]);

        const xpTotal = xpData.reduce((s, p) => s + (p.xp_total || 0), 0);
        const uids = top.map((t) => t.usuario_id).join(',');
        const nomes = uids ? await get(`erp_usuarios?id=in.(${uids})&select=id,nome`) : [];
        const nMap = {};
        nomes.forEach((u) => {
          nMap[u.id] = u.nome;
        });

        document.getElementById('metrics').innerHTML = `
      <div class="metric-card"><div class="metric-val">${usuarios.length}</div><div class="metric-label">Usuários ativos</div></div>
      <div class="metric-card"><div class="metric-val">${missoesConcluidas.length}</div><div class="metric-label">Missões concluídas</div></div>
      <div class="metric-card"><div class="metric-val">${xpTotal.toLocaleString('pt-BR')}</div><div class="metric-label">XP total distribuído</div></div>
    `;

        document.getElementById('tbodyTop').innerHTML = top
          .map(
            (p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${nMap[p.usuario_id] || 'Usuário'}</td>
        <td>Nível ${p.nivel} — ${NIVEL_NOMES[p.nivel] || ''}</td>
        <td style="font-weight:700;color:var(--color-primary)">${p.xp_total.toLocaleString('pt-BR')} XP</td>
      </tr>
    `
          )
          .join('');
      }

      function toggleSidebar() {
        document.getElementById('sidebar').classList.toggle('open');
        document.getElementById('sidebarOverlay').classList.toggle('show');
      }
      function toggleTema() {
        const t = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', t);
        localStorage.setItem('senai_tema', t);
      }
      function sair() {
        localStorage.clear();
        window.location.replace('../index.html');
      }

      carregarMissoes();
    </script>
  </body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add gamificacao/admin.html
git commit -m "feat: gamificacao/admin.html — painel admin (missões, grupos, visão geral)"
git push origin main
```

---

## Task 6: Integrar eventos nos módulos existentes

**Files:**

- Modify: `cadastros/clientes.html`, `cadastros/fornecedores.html`, `cadastros/produtos.html`
- Modify: `compras/solicitacoes.html`, `compras/pedidos.html`, `compras/recebimento.html`, `compras/nota-fiscal.html`
- Modify: `estoque/movimentacoes.html`, `estoque/inventario.html`
- Modify: `vendas/pedidos-venda.html`, `vendas/expedicao.html`, `vendas/entrega.html`

**Interfaces:**

- Consome: `window.gamif.registrarEvento(evento)` de `gamif.js`

**Padrão de integração em cada arquivo:**

Passo 1 — adicionar `<script src="../gamificacao/gamif.js"></script>` no `<head>`, antes do fechamento.

Passo 2 — na função `salvar()` de cada arquivo, adicionar após o sucesso (após `msg('... sucesso...')` ou antes de `fecharModal()`):

```js
if (window.gamif) await gamif.registrarEvento('NOME_DO_EVENTO');
```

- [ ] **Step 1: Integrar cadastros/clientes.html**

No `<head>`, antes de `</head>`:

```html
<script src="../gamificacao/gamif.js"></script>
```

Na função `salvar()`, após `msg('Cliente cadastrado com sucesso!', 'ok');`:

```js
if (window.gamif) await gamif.registrarEvento('cliente_cadastrado');
```

- [ ] **Step 2: Integrar cadastros/fornecedores.html**

No `<head>`:

```html
<script src="../gamificacao/gamif.js"></script>
```

Na função `salvar()`, após a mensagem de sucesso de insert:

```js
if (window.gamif) await gamif.registrarEvento('fornecedor_cadastrado');
```

- [ ] **Step 3: Integrar cadastros/produtos.html**

No `<head>`:

```html
<script src="../gamificacao/gamif.js"></script>
```

Na função `salvar()`, após a mensagem de sucesso de insert:

```js
if (window.gamif) await gamif.registrarEvento('produto_cadastrado');
```

- [ ] **Step 4: Integrar compras/solicitacoes.html**

No `<head>`:

```html
<script src="../gamificacao/gamif.js"></script>
```

Na função `salvar()`, após a mensagem de sucesso de insert:

```js
if (window.gamif) await gamif.registrarEvento('solicitacao_criada');
```

- [ ] **Step 5: Integrar compras/pedidos.html**

No `<head>`:

```html
<script src="../gamificacao/gamif.js"></script>
```

Na função `salvar()`, após a mensagem de sucesso de insert:

```js
if (window.gamif) await gamif.registrarEvento('pedido_compra_criado');
```

- [ ] **Step 6: Integrar compras/recebimento.html**

No `<head>`:

```html
<script src="../gamificacao/gamif.js"></script>
```

Na função `salvar()`, após a mensagem de sucesso de insert:

```js
if (window.gamif) await gamif.registrarEvento('recebimento_registrado');
```

- [ ] **Step 7: Integrar compras/nota-fiscal.html**

No `<head>`:

```html
<script src="../gamificacao/gamif.js"></script>
```

Na função `salvar()`, após a mensagem de sucesso de insert:

```js
if (window.gamif) await gamif.registrarEvento('nota_fiscal_compra_lancada');
```

- [ ] **Step 8: Integrar estoque/movimentacoes.html**

No `<head>`:

```html
<script src="../gamificacao/gamif.js"></script>
```

Na função `salvar()`, após a mensagem de sucesso de insert:

```js
if (window.gamif) await gamif.registrarEvento('movimentacao_estoque');
```

- [ ] **Step 9: Integrar estoque/inventario.html**

No `<head>`:

```html
<script src="../gamificacao/gamif.js"></script>
```

Na função `salvar()`, após a mensagem de sucesso de insert:

```js
if (window.gamif) await gamif.registrarEvento('inventario_realizado');
```

- [ ] **Step 10: Integrar vendas/pedidos-venda.html**

No `<head>`:

```html
<script src="../gamificacao/gamif.js"></script>
```

Na função `salvar()`, após a mensagem de sucesso de insert:

```js
if (window.gamif) await gamif.registrarEvento('pedido_venda_criado');
```

- [ ] **Step 11: Integrar vendas/expedicao.html**

No `<head>`:

```html
<script src="../gamificacao/gamif.js"></script>
```

Na função `salvar()`, após a mensagem de sucesso de insert:

```js
if (window.gamif) await gamif.registrarEvento('expedicao_confirmada');
```

- [ ] **Step 12: Integrar vendas/entrega.html**

No `<head>`:

```html
<script src="../gamificacao/gamif.js"></script>
```

Na função `salvar()`, após a mensagem de sucesso de insert:

```js
if (window.gamif) await gamif.registrarEvento('entrega_confirmada');
```

- [ ] **Step 13: Commit**

```bash
git add cadastros/clientes.html cadastros/fornecedores.html cadastros/produtos.html
git add compras/solicitacoes.html compras/pedidos.html compras/recebimento.html compras/nota-fiscal.html
git add estoque/movimentacoes.html estoque/inventario.html
git add vendas/pedidos-venda.html vendas/expedicao.html vendas/entrega.html
git commit -m "feat: integrar eventos de gamificação nos módulos do ERP (12 módulos)"
git push origin main
```

---

## Task 7: Adicionar link Gamificação no sidebar de todos os HTMLs

**Files:**

- Modify: todos os 33 HTMLs do projeto (exceto `gamificacao/*.html` já feitos)

**O bloco a inserir** (antes do `<div style="height:24px"></div>` que fecha a sidebar):

Para arquivos **dentro de subpastas** (`cadastros/`, `compras/`, `estoque/`, `vendas/`, `financeiro/`, `marketing/`, `configuracoes/`):

```html
<div class="sidebar-section">
  <div class="sidebar-section-label">Gamificação</div>
  <a class="sidebar-link" href="../gamificacao/index.html"
    ><span class="sidebar-icon">🎮</span> Minha Jornada</a
  >
  <a class="sidebar-link" href="../gamificacao/ranking.html"
    ><span class="sidebar-icon">🏆</span> Ranking</a
  >
  <a class="sidebar-link" id="linkAdmin" href="../gamificacao/admin.html" style="display:none"
    ><span class="sidebar-icon">⚙️</span> Admin Gamif.</a
  >
</div>
```

Para arquivos na **raiz** (`dashboard.html`, `criar-admin.html`):

```html
<div class="sidebar-section">
  <div class="sidebar-section-label">Gamificação</div>
  <a class="sidebar-link" href="gamificacao/index.html"
    ><span class="sidebar-icon">🎮</span> Minha Jornada</a
  >
  <a class="sidebar-link" href="gamificacao/ranking.html"
    ><span class="sidebar-icon">🏆</span> Ranking</a
  >
  <a class="sidebar-link" id="linkAdmin" href="gamificacao/admin.html" style="display:none"
    ><span class="sidebar-icon">⚙️</span> Admin Gamif.</a
  >
</div>
```

E adicionar este script antes do `</body>` em cada arquivo (se ainda não existir lógica de role):

```js
(function () {
  if (localStorage.getItem('erp_role') === 'Administrador') {
    const el = document.getElementById('linkAdmin');
    if (el) el.style.display = 'flex';
  }
})();
```

**Lista de arquivos a modificar:**

Subpastas (usar `../gamificacao/`):

- `cadastros/clientes.html`
- `cadastros/fornecedores.html`
- `cadastros/produtos.html`
- `cadastros/transportadoras.html`
- `compras/conferencia.html`
- `compras/nota-fiscal.html`
- `compras/pedidos.html`
- `compras/planejamento.html`
- `compras/recebimento.html`
- `compras/solicitacoes.html`
- `configuracoes/perfis.html`
- `configuracoes/regras-negocios.html`
- `configuracoes/telas.html`
- `configuracoes/usuarios.html`
- `estoque/armazenagem.html`
- `estoque/controle.html`
- `estoque/inventario.html`
- `estoque/movimentacoes.html`
- `financeiro/balancete.html`
- `financeiro/contas-pagar.html`
- `financeiro/contas-receber.html`
- `marketing/campanhas.html`
- `marketing/retornos.html`
- `vendas/entrega.html`
- `vendas/expedicao.html`
- `vendas/logistica.html`
- `vendas/nota-fiscal-venda.html`
- `vendas/pedidos-venda.html`
- `vendas/romaneio.html`
- `vendas/separacao.html`

Raiz (usar `gamificacao/`):

- `dashboard.html`
- `criar-admin.html`

- [ ] **Step 1: Aplicar bloco sidebar em cada arquivo (buscar o padrão e inserir antes do fechamento)**

Em cada arquivo, localizar:

```html
<div style="height:24px"></div>
  </aside>
```

E inserir o bloco de gamificação imediatamente antes.

- [ ] **Step 2: Adicionar script de role em cada arquivo**

Em cada arquivo, localizar `</body>` e inserir antes:

```html
<script>
  (function () {
    if (localStorage.getItem('erp_role') === 'Administrador') {
      const el = document.getElementById('linkAdmin');
      if (el) el.style.display = 'flex';
    }
  })();
</script>
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: adicionar link de Gamificação no sidebar de todos os HTMLs do ERP"
git push origin main
```

---

## Verificação Final

Após implementar todas as tasks:

- [ ] Abrir `gamificacao/index.html` — hub carrega com perfil e missões
- [ ] Abrir `gamificacao/ranking.html` — exibe mensagem de "sem grupo" se usuário não estiver em nenhum
- [ ] Abrir `gamificacao/admin.html` — redireciona para dashboard se não for admin
- [ ] Criar um cliente em `cadastros/clientes.html` — toast aparece no canto inferior direito
- [ ] Voltar ao hub — missão "Faça seu primeiro cadastro de cliente" marcada como concluída
- [ ] Verificar que `gamif.js` com erro de rede não quebra o funcionamento do módulo (try/catch silencioso)
- [ ] Testar em 375px (mobile) — sidebar oculta, layout correto
