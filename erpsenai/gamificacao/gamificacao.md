# Módulo de Gamificação — Plano Completo de Implementação

> Documento técnico e pedagógico para criação do módulo de Gamificação no ERP Senai.  
> Objetivo: transformar o sistema ERP em uma simulação empresarial interativa onde alunos gerenciam setores reais da empresa.

---

## 1. Visão Geral

### 1.1 Conceito Pedagógico

O módulo de Gamificação transforma a turma em uma empresa virtual. Cada equipe recebe um setor do ERP para gerenciar. Um motor de simulação gera automaticamente eventos de negócio (vendas, pedidos, cancelamentos, etc.) enquanto o professor controla o fluxo da aula com Play/Pause. No final de cada rodada, o sistema calcula o desempenho de cada equipe com base em KPIs reais.

### 1.2 Equipes e Setores

| Equipe | Setor Responsável | Tabelas do ERP |
|--------|-------------------|----------------|
| Compras | Módulo Compras | compras_solicitacoes, compras_pedidos, compras_recebimentos, compras_conferencias |
| Estoque | Módulo Estoque | estoque_movimentacoes, estoque_inventarios, produtos (estoque_atual) |
| Vendas | Módulo Vendas | vendas_pedidos, vendas_separacoes, vendas_expedicoes, vendas_entregas |
| Logística | Romaneio, Expedição, Entrega | vendas_romaneios, vendas_expedicoes, vendas_entregas |
| Financeiro | Fluxo de caixa, NF, balancete | financeiro_contas_pagar, financeiro_contas_receber, financeiro_lancamentos |
| Marketing | Campanhas e retorno | marketing_campanhas, marketing_retornos |

### 1.3 Motor de Simulação

O motor gera eventos automáticos em intervalos configuráveis:
- **Pedidos de venda** → aciona equipe de Vendas + Estoque
- **Solicitações de compra** → aciona equipe de Compras
- **Chegada de mercadoria** → aciona equipe de Estoque
- **Pedido urgente** → aciona Logística com prazo reduzido
- **Campanha ativa** → aciona Marketing com leads simulados
- **Conta a pagar vencendo** → aciona Financeiro para aprovação
- **Ruptura de estoque** → alerta geral para múltiplas equipes

---

## 2. Estrutura de Dados

### 2.1 Tabelas no Supabase

```sql
-- Sessão de jogo (uma por aula)
CREATE TABLE gamificacao_sessoes (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo        text NOT NULL,                    -- "Aula 03 — Semana 2"
  professor_id  uuid REFERENCES erp_usuarios(id),
  status        text DEFAULT 'pausada',           -- 'ativa', 'pausada', 'encerrada'
  velocidade    integer DEFAULT 1,                -- 1x, 2x, 5x (multiplicador de tempo)
  rodada_atual  integer DEFAULT 1,
  iniciada_em   timestamptz,
  encerrada_em  timestamptz,
  created_at    timestamptz DEFAULT now()
);

-- Equipes da sessão
CREATE TABLE gamificacao_equipes (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sessao_id   uuid REFERENCES gamificacao_sessoes(id),
  nome        text NOT NULL,          -- "Equipe Vendas"
  setor       text NOT NULL,          -- 'compras','estoque','vendas','logistica','financeiro','marketing'
  cor         text DEFAULT '#3B82F6', -- cor para identificação visual
  pontos      integer DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

-- Membros das equipes (alunos)
CREATE TABLE gamificacao_membros (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  equipe_id   uuid REFERENCES gamificacao_equipes(id),
  nome        text NOT NULL,
  usuario_id  uuid REFERENCES erp_usuarios(id), -- se tiver login
  created_at  timestamptz DEFAULT now()
);

-- Eventos gerados pelo motor de simulação
CREATE TABLE gamificacao_eventos (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sessao_id     uuid REFERENCES gamificacao_sessoes(id),
  rodada        integer NOT NULL,
  tipo          text NOT NULL,    -- 'pedido_venda','solicitacao_compra','chegada_mercadoria', etc.
  titulo        text NOT NULL,
  descricao     text,
  setor_alvo    text NOT NULL,    -- qual equipe deve responder
  prioridade    text DEFAULT 'normal',  -- 'normal','alta','urgente'
  prazo_minutos integer DEFAULT 5,     -- tempo para a equipe resolver
  status        text DEFAULT 'pendente', -- 'pendente','resolvido','expirado'
  referencia_id uuid,             -- id do registro criado no ERP (pedido, SC, etc.)
  pontos_base   integer DEFAULT 10,
  resolvido_em  timestamptz,
  created_at    timestamptz DEFAULT now()
);

-- Histórico de pontuação por equipe
CREATE TABLE gamificacao_pontuacoes (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sessao_id   uuid REFERENCES gamificacao_sessoes(id),
  equipe_id   uuid REFERENCES gamificacao_equipes(id),
  evento_id   uuid REFERENCES gamificacao_eventos(id),
  pontos      integer NOT NULL,
  motivo      text,     -- 'resolucao_rapida','resolucao_no_prazo','expirado','bonus'
  created_at  timestamptz DEFAULT now()
);

-- Configuração do motor de simulação
CREATE TABLE gamificacao_config_motor (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sessao_id           uuid REFERENCES gamificacao_sessoes(id),
  intervalo_segundos  integer DEFAULT 60,   -- frequência de novos eventos
  max_eventos_ativos  integer DEFAULT 5,    -- máximo de eventos abertos simultâneos
  chance_urgente      integer DEFAULT 20,   -- % de chance de evento urgente
  produtos_ids        uuid[],               -- produtos disponíveis na simulação
  clientes_ids        uuid[],               -- clientes para gerar pedidos
  fornecedores_ids    uuid[],               -- fornecedores disponíveis
  created_at          timestamptz DEFAULT now()
);

-- Habilitar RLS permissivo
ALTER TABLE gamificacao_sessoes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamificacao_equipes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamificacao_membros     ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamificacao_eventos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamificacao_pontuacoes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamificacao_config_motor ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon full" ON gamificacao_sessoes     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon full" ON gamificacao_equipes     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon full" ON gamificacao_membros     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon full" ON gamificacao_eventos     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon full" ON gamificacao_pontuacoes  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon full" ON gamificacao_config_motor FOR ALL USING (true) WITH CHECK (true);
```

---

## 3. Motor de Simulação

### 3.1 Tipos de Eventos

```js
const TIPOS_EVENTO = {
  pedido_venda: {
    titulo: (prod, cli) => `Pedido de Venda — ${cli.nome} quer ${prod.nome}`,
    setor: 'vendas',
    pontos_base: 15,
    prazo: 5,
    gerar: async (config) => {
      const produto  = aleatorio(config.produtos);
      const cliente  = aleatorio(config.clientes);
      const qtd      = Math.floor(Math.random() * 10) + 1;
      const numero   = await sbProximoNumero('vendas_pedidos', 'numero', 'PV');
      const pedido   = await sbInserir('vendas_pedidos', {
        numero, cliente_id: cliente.id, produto_id: produto.id,
        quantidade: qtd, preco_unitario: produto.preco_venda,
        status: 'Rascunho', data: hoje()
      });
      return { referencia_id: pedido[0].id, descricao: `${qtd}x ${produto.nome} para ${cliente.nome}` };
    }
  },
  solicitacao_compra: {
    titulo: (prod) => `Solicitação de Compra — Reposição de ${prod.nome}`,
    setor: 'compras',
    pontos_base: 10,
    prazo: 8,
    gerar: async (config) => {
      const produto = aleatorio(config.produtos);
      const numero  = await sbProximoNumero('compras_solicitacoes', 'numero', 'SC');
      const sc      = await sbInserir('compras_solicitacoes', {
        numero, produto_id: produto.id, quantidade: Math.floor(Math.random()*50)+10,
        prioridade: 'Média', status: 'Pendente', data: hoje()
      });
      return { referencia_id: sc[0].id };
    }
  },
  chegada_mercadoria: {
    titulo: (prod) => `Chegada de Mercadoria — ${prod.nome} no depósito`,
    setor: 'estoque',
    pontos_base: 10,
    prazo: 6,
    gerar: async (config) => {
      const produto = aleatorio(config.produtos);
      return { descricao: `Dar entrada de ${produto.nome} no estoque via Recebimento` };
    }
  },
  pedido_urgente: {
    titulo: (cli) => `⚠️ URGENTE — ${cli.nome} precisa de entrega hoje`,
    setor: 'logistica',
    pontos_base: 25,
    prazo: 3,
    prioridade: 'urgente',
    gerar: async (config) => {
      const cliente = aleatorio(config.clientes);
      return { descricao: `Preparar Romaneio e Expedição imediatos para ${cliente.nome}` };
    }
  },
  campanha_lead: {
    titulo: () => `📣 Lead de Marketing — Novo cliente interessado`,
    setor: 'marketing',
    pontos_base: 12,
    prazo: 10,
    gerar: async (config) => {
      return { descricao: 'Registrar retorno de campanha e vincular ao cliente' };
    }
  },
  conta_vencendo: {
    titulo: () => `💸 Financeiro — Conta a pagar vencendo em 24h`,
    setor: 'financeiro',
    pontos_base: 15,
    prazo: 7,
    gerar: async (config) => {
      return { descricao: 'Verificar e aprovar pagamento no módulo Financeiro' };
    }
  },
  ruptura_estoque: {
    titulo: (prod) => `🔴 ALERTA — Ruptura de estoque: ${prod.nome}`,
    setor: 'estoque',
    pontos_base: 20,
    prazo: 4,
    prioridade: 'alta',
    gerar: async (config) => {
      // Buscar produto com estoque crítico
      const criticos = await sbListar('produtos', 'select=id,nome,estoque_atual,estoque_minimo&ativo=eq.true');
      const produto  = criticos.find(p => parseFloat(p.estoque_atual) <= parseFloat(p.estoque_minimo));
      if (!produto) return null;
      return { descricao: `Estoque de ${produto.nome}: ${produto.estoque_atual} (mín: ${produto.estoque_minimo})` };
    }
  }
};
```

### 3.2 Loop do Motor

```js
// motor.js — rodado no dashboard do professor

let motorInterval = null;

async function iniciarMotor(sessaoId) {
  const config = await sbBuscar('gamificacao_config_motor', sessaoId, 'sessao_id');
  
  motorInterval = setInterval(async () => {
    const sessao = await sbBuscar('gamificacao_sessoes', sessaoId);
    if (sessao.status !== 'ativa') return;

    // Contar eventos pendentes
    const pendentes = await sbContar('gamificacao_eventos',
      `sessao_id=eq.${sessaoId}&status=eq.pendente`);
    if (pendentes >= config.max_eventos_ativos) return;

    // Escolher tipo de evento
    const tipos    = Object.keys(TIPOS_EVENTO);
    const urgente  = Math.random() * 100 < config.chance_urgente;
    const tipo     = urgente ? 'pedido_urgente' : aleatorio(tipos);
    const def      = TIPOS_EVENTO[tipo];

    // Gerar o evento no ERP
    const resultado = await def.gerar(config);
    if (!resultado) return;

    // Salvar evento
    const rodada = sessao.rodada_atual;
    await sbInserir('gamificacao_eventos', {
      sessao_id: sessaoId,
      rodada,
      tipo,
      titulo: def.titulo(aleatorio(config.produtos || [{}]), aleatorio(config.clientes || [{}])),
      descricao: resultado.descricao || '',
      setor_alvo: def.setor,
      prioridade: def.prioridade || 'normal',
      prazo_minutos: def.prazo,
      pontos_base: def.pontos_base,
      referencia_id: resultado.referencia_id || null
    });

    // Verificar eventos expirados
    await verificarExpirados(sessaoId);

  }, config.intervalo_segundos * 1000);
}

function pararMotor() {
  if (motorInterval) clearInterval(motorInterval);
  motorInterval = null;
}

async function verificarExpirados(sessaoId) {
  const agora = new Date().toISOString();
  const eventos = await sbListar('gamificacao_eventos',
    `sessao_id=eq.${sessaoId}&status=eq.pendente`);
  
  for (const ev of eventos) {
    const criado    = new Date(ev.created_at);
    const prazoMs   = ev.prazo_minutos * 60 * 1000;
    const expirou   = Date.now() - criado.getTime() > prazoMs;
    if (expirou) {
      await sbAtualizar('gamificacao_eventos', ev.id, { status: 'expirado' });
      // Penalizar equipe
      const equipe = await encontrarEquipePorSetor(sessaoId, ev.setor_alvo);
      if (equipe) {
        await sbInserir('gamificacao_pontuacoes', {
          sessao_id: sessaoId, equipe_id: equipe.id, evento_id: ev.id,
          pontos: -5, motivo: 'expirado'
        });
        await sbAtualizar('gamificacao_equipes', equipe.id,
          { pontos: equipe.pontos - 5 });
      }
    }
  }
}
```

---

## 4. Sistema de Pontuação

### 4.1 Regras de Pontuação

| Situação | Pontos |
|----------|--------|
| Evento resolvido dentro do prazo | +pontos_base |
| Evento resolvido em menos de 50% do prazo | +pontos_base × 1.5 (arredondado) |
| Evento expirado sem resolução | −5 pontos |
| Resolução com zero erros de validação | +3 pontos bônus |
| Estoque reposto antes de ruptura | +10 pontos bônus |
| Primeiro a resolver evento urgente | +15 pontos bônus |

### 4.2 KPIs por Setor

```js
const KPI_SETOR = {
  compras: {
    nome: 'Eficiência de Compras',
    formula: (dados) => {
      const aprovadas = dados.solicitacoes.filter(s => s.status === 'Aprovada').length;
      const total     = dados.solicitacoes.length || 1;
      return Math.round(aprovadas / total * 100);
    },
    unidade: '%'
  },
  estoque: {
    nome: 'Giro de Estoque',
    formula: (dados) => {
      const saidas   = dados.movimentacoes.filter(m => m.tipo === 'Saída').reduce((s,m)=>s+m.quantidade,0);
      const estoqueM = dados.estoque_medio || 1;
      return (saidas / estoqueM).toFixed(2);
    },
    unidade: 'x'
  },
  vendas: {
    nome: 'Taxa de Conversão',
    formula: (dados) => {
      const entregues = dados.pedidos.filter(p => p.status === 'Entregue').length;
      const total     = dados.pedidos.length || 1;
      return Math.round(entregues / total * 100);
    },
    unidade: '%'
  },
  logistica: {
    nome: 'Pontualidade de Entrega',
    formula: (dados) => {
      const noPrazo = dados.entregas.filter(e => e.status === 'Entregue' && e.data_entrega <= e.data_prevista).length;
      const total   = dados.entregas.length || 1;
      return Math.round(noPrazo / total * 100);
    },
    unidade: '%'
  },
  financeiro: {
    nome: 'Liquidez Corrente',
    formula: (dados) => {
      const receber = dados.contas_receber.reduce((s,c)=>s+c.valor,0);
      const pagar   = dados.contas_pagar.reduce((s,c)=>s+c.valor,0) || 1;
      return (receber / pagar).toFixed(2);
    },
    unidade: 'x'
  },
  marketing: {
    nome: 'ROI de Marketing',
    formula: (dados) => {
      const retorno = dados.retornos.reduce((s,r)=>s+parseFloat(r.valor_venda||0),0);
      const custo   = dados.campanhas.reduce((s,c)=>s+parseFloat(c.custo_real||0),0) || 1;
      return Math.round((retorno - custo) / custo * 100);
    },
    unidade: '%'
  }
};
```

---

## 5. Telas do Módulo

### 5.1 Dashboard do Professor (`gamificacao/professor.html`)

**Funcionalidades:**
- Criar nova sessão (nome, equipes, configurações do motor)
- Botão **▶ Play** / **⏸ Pause** — controla o motor de simulação em tempo real
- Seletor de velocidade: 1x / 2x / 5x
- Painel ao vivo com todos os eventos ativos e seus prazos (countdown)
- Ranking de equipes em tempo real (pontuação acumulada)
- Histórico de eventos da sessão
- Botão "Avançar Rodada" (manual)
- Exportar relatório da sessão (PDF)

**Layout sugerido:**
```
┌─────────────────────────────────────────────────┐
│  [⏸ PAUSE]  Rodada 3   Velocidade: [1x][2x][5x] │
├──────────────────┬──────────────────────────────┤
│  RANKING         │  EVENTOS ATIVOS               │
│  1. Vendas  85pts│  🔴 Pedido Urgente (1:23 min) │
│  2. Estoque 72pts│  🟡 SC de Reposição (4:55 min)│
│  3. Compras 61pts│  🟢 Lead Marketing (8:02 min) │
│  ...             │  ...                          │
├──────────────────┴──────────────────────────────┤
│  HISTÓRICO DE EVENTOS (últimos 20)              │
└─────────────────────────────────────────────────┘
```

### 5.2 Dashboard da Equipe (`gamificacao/equipe.html`)

**Funcionalidades:**
- Cada equipe acessa sua própria view com `?equipe=uuid`
- Exibe apenas eventos destinados ao seu setor
- Mostra pontuação atual da equipe
- Botão "Marcar como Resolvido" em cada evento
- Contador regressivo por evento (cor muda: verde → amarelo → vermelho)
- Link direto para a tela relevante do ERP (ex: clica no evento de Pedido de Venda → abre `vendas/pedidos-venda.html`)

### 5.3 Placar Geral (`gamificacao/placar.html`)

**Para projetar na TV/telão da sala:**
- Tela full-screen com ranking ao vivo
- Barras de progresso animadas por equipe
- Destaque para o evento urgente ativo
- Auto-refresh a cada 5 segundos via `setInterval`
- Modo "dark" por padrão (melhor visibilidade em telão)

### 5.4 Configuração da Sessão (`gamificacao/config-sessao.html`)

**Campos:**
- Nome da sessão
- Lista de equipes (nome, setor, membros)
- Intervalo entre eventos (30s, 60s, 2min, 5min)
- Máximo de eventos simultâneos
- Chance de evento urgente (0%–50%)
- Selecionar produtos, clientes e fornecedores disponíveis na simulação
- Salvar configuração como template

---

## 6. Arquivos a Criar

```
gamificacao/
├── professor.html        ← Dashboard de controle do professor
├── equipe.html           ← View da equipe (usa ?equipe=uuid)
├── placar.html           ← Placar para projeção (telão)
├── config-sessao.html    ← Criar/editar sessão de jogo
└── gamificacao.md        ← Este documento
```

---

## 7. Integração com o ERP

### 7.1 Como os Eventos se Conectam ao ERP

Quando o motor gera um evento, ele cria o registro real no banco:
- Evento "Pedido de Venda" → cria registro em `vendas_pedidos` com status "Rascunho"
- Evento "SC de Compra" → cria em `compras_solicitacoes` com status "Pendente"
- A equipe acessa a tela normal do ERP para processar o registro
- Ao salvar/atualizar o status, o evento pode ser marcado como resolvido

### 7.2 Detecção de Resolução (Polling ou Webhook)

```js
// Polling a cada 10 segundos na tela da equipe
async function verificarResolucoes(sessaoId, equipeId) {
  const eventos = await sbListar('gamificacao_eventos',
    `sessao_id=eq.${sessaoId}&setor_alvo=eq.${setor}&status=eq.pendente`);
  
  for (const ev of eventos) {
    let resolvido = false;
    
    if (ev.tipo === 'pedido_venda' && ev.referencia_id) {
      const pedido = await sbBuscar('vendas_pedidos', ev.referencia_id);
      resolvido = pedido && pedido.status !== 'Rascunho';
    }
    if (ev.tipo === 'solicitacao_compra' && ev.referencia_id) {
      const sc = await sbBuscar('compras_solicitacoes', ev.referencia_id);
      resolvido = sc && sc.status !== 'Pendente';
    }
    // ... demais tipos
    
    if (resolvido) {
      await marcarEventoResolvido(ev, equipeId);
    }
  }
}
```

### 7.3 Marcar Evento Resolvido e Pontuar

```js
async function marcarEventoResolvido(evento, equipeId) {
  const agora    = new Date();
  const criado   = new Date(evento.created_at);
  const decorrido = (agora - criado) / 1000 / 60; // minutos
  const prazo    = evento.prazo_minutos;

  let pontos = evento.pontos_base;
  let motivo = 'resolucao_no_prazo';

  if (decorrido < prazo * 0.5) {
    pontos = Math.round(pontos * 1.5);
    motivo = 'resolucao_rapida';
  }

  await sbAtualizar('gamificacao_eventos', evento.id, {
    status: 'resolvido',
    resolvido_em: agora.toISOString()
  });

  const equipe = await sbBuscar('gamificacao_equipes', equipeId);
  const novasPontos = (equipe.pontos || 0) + pontos;

  await sbAtualizar('gamificacao_equipes', equipeId, { pontos: novasPontos });

  await sbInserir('gamificacao_pontuacoes', {
    sessao_id: evento.sessao_id,
    equipe_id: equipeId,
    evento_id: evento.id,
    pontos,
    motivo
  });
}
```

---

## 8. Ordem de Implementação

### Passo 1 — Banco de Dados
1. Executar o SQL da seção 2.1 no Supabase SQL Editor
2. Verificar que todas as tabelas foram criadas com RLS habilitado

### Passo 2 — Configuração da Sessão (`config-sessao.html`)
1. Formulário de criação de sessão
2. Adição de equipes e membros
3. Seleção de produtos/clientes/fornecedores
4. Salvar configuração do motor

### Passo 3 — Motor de Simulação (JavaScript puro)
1. Implementar `TIPOS_EVENTO` com funções `gerar()`
2. Implementar `iniciarMotor()` / `pararMotor()`
3. Implementar `verificarExpirados()`
4. Testar geração de eventos manualmente

### Passo 4 — Dashboard do Professor (`professor.html`)
1. Controle Play/Pause (chama `iniciarMotor`/`pararMotor`)
2. Seletor de velocidade
3. Painel de eventos ativos com countdown
4. Ranking ao vivo (polling a cada 5s)
5. Botão "Avançar Rodada"

### Passo 5 — Dashboard da Equipe (`equipe.html`)
1. Filtrar eventos por `setor_alvo`
2. Countdown visual por evento
3. Botão "Marcar Resolvido" (manual) ou detecção automática
4. Link para tela do ERP

### Passo 6 — Placar (`placar.html`)
1. Ranking animado em full-screen
2. Auto-refresh a cada 5 segundos
3. Modo dark por padrão

### Passo 7 — Relatório Final
1. Ao encerrar a sessão, gerar PDF com:
   - Ranking final
   - Pontuação detalhada por equipe
   - KPIs calculados por setor
   - Eventos resolvidos vs. expirados

---

## 9. Adição ao Sistema (Telas e Perfis)

### 9.1 SQL para registrar no banco

```sql
-- Sistema
INSERT INTO sistema (siscodigo, sisnome, sisativo, sisordem)
VALUES (10, 'Gamificação', 1, 10);

-- Telas
INSERT INTO tela (nome, titulo, nome_html, sistema_id, ativo, ordem)
VALUES
  ('Professor', 'Dashboard Professor', 'gamificacao/professor.html', 10, true, 1),
  ('Equipe', 'Dashboard Equipe', 'gamificacao/equipe.html', 10, true, 2),
  ('Placar', 'Placar Geral', 'gamificacao/placar.html', 10, true, 3),
  ('Config Sessão', 'Configuração de Sessão', 'gamificacao/config-sessao.html', 10, true, 4);

-- Vincular telas ao sistema (usar os IDs gerados acima)
-- INSERT INTO tela_sistema (tela_id, sistema_id) VALUES (...);
```

### 9.2 Adicionar ao sidebar

Adicionar em todos os HTMLs do ERP:
```html
<div class="sidebar-section">
  <div class="sidebar-section-label">Gamificação</div>
  <a class="sidebar-link" href="../gamificacao/professor.html"><span class="sidebar-icon">🎮</span> Professor</a>
  <a class="sidebar-link" href="../gamificacao/equipe.html"><span class="sidebar-icon">👥</span> Minha Equipe</a>
  <a class="sidebar-link" href="../gamificacao/placar.html"><span class="sidebar-icon">🏆</span> Placar</a>
</div>
```

### 9.3 Adicionar ao `sistema.json`
```json
{ "siscodigo": 10, "sisnome": "Gamificação", "sisativo": 1, "sisordem": 10 }
```

### 9.4 Atualizar `perfis.html`
```js
const sisOrdem = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
```

---

## 10. Dicas de Uso em Sala de Aula

1. **Antes da aula**: criar sessão, definir equipes, selecionar produtos/clientes reais do banco
2. **No início**: mostrar o placar no telão, dividir turma nas equipes
3. **Durante**: usar velocidade 1x para aulas de 90min; 2x para demonstrações rápidas
4. **Intervenção do professor**: pode pausar e criar um evento manual a qualquer momento
5. **Avaliação**: exportar relatório ao final — pontuação = nota de participação
6. **Revisão**: o histórico de eventos mostra quais decisões cada equipe tomou e o impacto

---

*Documento criado em 2026-08-16. Atualizar conforme o módulo for implementado.*
