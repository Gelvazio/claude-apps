# Gamificação — Andamento da Implementação

> Documento de acompanhamento do módulo de Gamificação do ERP Senai.
> Última atualização: 2026-08-16 (sessão 2)

---

## 1. Banco de Dados (Supabase)

| Item | Descrição | Status |
|------|-----------|--------|
| `gamificacao_sessoes` | Tabela de sessões de aula | ✅ Concluído — tabela criada e ativa no Supabase |
| `gamificacao_equipes` | Tabela de equipes por sessão | ✅ Concluído — tabela criada e ativa no Supabase |
| `gamificacao_membros` | Tabela de membros das equipes | ✅ Concluído — tabela criada e ativa no Supabase |
| `gamificacao_eventos` | Tabela de eventos gerados pelo motor | ✅ Concluído — tabela criada e ativa no Supabase |
| `gamificacao_pontuacoes` | Histórico de pontuação por equipe | ✅ Concluído — tabela criada e ativa no Supabase |
| `gamificacao_config_motor` | Configurações do motor de simulação | ✅ Concluído — tabela criada e ativa no Supabase |
| RLS (Row Level Security) | Políticas permissivas para anon key | ✅ Concluído — policies "anon full" aplicadas em todas as tabelas |
| Seed de dados (exemplos) | Dados iniciais para teste | ⚠️ Iniciado — disponível em `DATABASE_SEED.sql` mas não executado |

---

## 2. Arquivos HTML (Telas)

| Arquivo | Descrição | Status |
|---------|-----------|--------|
| `index.html` | Hub do usuário — XP, nível, badges e missões | ✅ Concluído |
| `ranking.html` | Leaderboard do grupo (sistema gamif antigo) | ✅ Concluído |
| `admin.html` | Painel administrativo da gamificação antiga | ✅ Concluído |
| `professor.html` | Dashboard do professor — Play/Pause, motor ao vivo, ranking, histórico | ✅ Concluído |
| `equipe.html` | View da equipe — eventos pendentes, countdown, botão resolver, link ERP | ✅ Concluído |
| `placar.html` | Placar fullscreen para projeção no telão — dark mode, auto-refresh 5s | ✅ Concluído |
| `config-sessao.html` | Criação/edição de sessão — equipes, membros, motor de simulação | ✅ Concluído |

---

## 3. Motor de Simulação (JavaScript)

| Item | Descrição | Status |
|------|-----------|--------|
| Tipos de evento definidos | 7 tipos: pedido_venda, solicitacao_compra, chegada_mercadoria, pedido_urgente, campanha_lead, conta_vencendo, ruptura_estoque | ✅ Concluído (em `professor.html`) |
| Loop do motor (`iniciarMotor`) | Gera eventos em intervalos configuráveis com setInterval | ✅ Concluído (em `professor.html`) |
| Controle Play / Pause | Atualiza status da sessão no banco e para/retoma o interval | ✅ Concluído |
| Seletor de velocidade 1× / 2× / 5× | Divide o intervalo pelo multiplicador | ✅ Concluído |
| Verificação de eventos expirados | Penaliza equipe em −5 pts automaticamente | ✅ Concluído |
| Geração de evento urgente | Chance configurável (%), prioridade 'urgente' | ✅ Concluído |
| Avançar rodada manualmente | Incrementa `rodada_atual` na sessão | ✅ Concluído |

---

## 4. Sistema de Pontuação

| Item | Descrição | Status |
|------|-----------|--------|
| Resolução dentro do prazo | +pontos_base | ✅ Concluído (em `equipe.html`) |
| Resolução em menos de 50% do prazo | +pontos_base × 1,5 (bônus velocidade) | ✅ Concluído |
| Evento expirado sem resolução | −5 pontos da equipe | ✅ Concluído |
| Registro em `gamificacao_pontuacoes` | Histórico detalhado por evento | ✅ Concluído |
| Primeiro a resolver urgente (+15 bônus) | Bônus especial para eventos urgentes | ❌ Não Iniciado |
| Zero erros de validação (+3 bônus) | Bônus por preenchimento correto no ERP | ❌ Não Iniciado |

---

## 5. Dashboard do Professor (`professor.html`)

| Item | Descrição | Status |
|------|-----------|--------|
| Seletor de sessão | Carrega sessões do banco, auto-seleciona a ativa | ✅ Concluído |
| Botão Play / Pause | Controla o motor em tempo real | ✅ Concluído |
| Seletor de velocidade | 1× / 2× / 5× | ✅ Concluído |
| Painel de eventos ativos | Lista com countdown colorido (verde/amarelo/vermelho) | ✅ Concluído |
| Ranking de equipes ao vivo | Atualiza a cada 5 segundos | ✅ Concluído |
| Histórico de eventos | Últimos 40 eventos com status | ✅ Concluído |
| Botão Avançar Rodada | Incrementa rodada e gera evento imediato | ✅ Concluído |
| KPIs (Ativos / Resolvidos / Expirados / Equipes) | Cards de resumo | ✅ Concluído |
| Botão Abrir Placar | Abre `placar.html` em nova aba com a sessão atual | ✅ Concluído |
| Exportar relatório PDF | PDF com ranking final, KPIs e histórico | ❌ Não Iniciado |

---

## 6. View da Equipe (`equipe.html`)

| Item | Descrição | Status |
|------|-----------|--------|
| Seletor de equipe | Carrega equipes da sessão ativa | ✅ Concluído |
| Parâmetro `?equipe=uuid` na URL | Acesso direto via link | ✅ Concluído |
| Header da equipe (nome, setor, pontos, posição) | Mostra dados da equipe no topo | ✅ Concluído |
| Eventos filtrados por setor | Mostra apenas eventos do setor da equipe | ✅ Concluído |
| Countdown visual por evento | Verde → Amarelo → Vermelho com animação pulse | ✅ Concluído |
| Bônus de velocidade exibido | Mostra "+X pts bônus rápido!" se estiver em tempo | ✅ Concluído |
| Botão "Marcar Resolvido" | Calcula pontos, atualiza banco e exibe confirmação | ✅ Concluído |
| Link para tela ERP correspondente | Abre o módulo ERP correto do setor em nova aba | ✅ Concluído |
| Auto-refresh a cada 10s | Verifica novos eventos automaticamente | ✅ Concluído |
| Histórico de eventos resolvidos/expirados | Lista na parte inferior | ✅ Concluído |
| Detecção automática de resolução via polling | Detecta quando o aluno salvou no ERP sem clicar no botão | ❌ Não Iniciado |

---

## 7. Placar (`placar.html`)

| Item | Descrição | Status |
|------|-----------|--------|
| Layout fullscreen dark mode | Fundo escuro, fontes grandes, ideal para telão | ✅ Concluído |
| Ranking animado com barras de progresso | Barras relativas ao líder, com cor da equipe | ✅ Concluído |
| Auto-refresh a cada 5 segundos | Com contador regressivo no rodapé | ✅ Concluído |
| Status da sessão (ativa/pausada) | Indicador com dot piscando quando ativa | ✅ Concluído |
| Destaque para eventos urgentes | Cards vermelhos com animação shake | ✅ Concluído |
| Parâmetro `?sessao=uuid` na URL | Acesso direto a uma sessão específica | ✅ Concluído |
| Relógio em tempo real | Exibido no header | ✅ Concluído |
| Botão tela cheia (fullscreen API) | Entra em modo fullscreen nativo | ✅ Concluído |
| Medalhas 🥇🥈🥉 para top 3 | Visual destacado para as primeiras posições | ✅ Concluído |

---

## 8. Configuração de Sessão (`config-sessao.html`)

| Item | Descrição | Status |
|------|-----------|--------|
| Formulário de criação de sessão | Campo título | ✅ Concluído |
| Edição de sessão existente via `?sessao=uuid` | Carrega dados existentes | ✅ Concluído |
| Motor: intervalo entre eventos (range slider) | 10s a 300s | ✅ Concluído |
| Motor: máximo de eventos simultâneos | 1 a 15 | ✅ Concluído |
| Motor: chance de evento urgente (%) | 0% a 50% | ✅ Concluído |
| Adicionar equipes com nome, setor e cor | Interface dinâmica com add/remove | ✅ Concluído |
| Campo de membros por equipe | Nomes separados por vírgula | ✅ Concluído |
| Salvar equipes e membros no banco | Grava em `gamificacao_equipes` e `gamificacao_membros` | ✅ Concluído |
| Equipes padrão pré-preenchidas | 6 equipes (Compras, Estoque, Vendas, Logística, Financeiro, Marketing) | ✅ Concluído |
| Salvar template de configuração | Reutilizar configs entre aulas | ❌ Não Iniciado |
| Selecionar produtos/clientes/fornecedores específicos para a simulação | Limitar o motor a um subset do cadastro | ❌ Não Iniciado |

---

## 9. Integração com o Sistema ERP

| Item | Descrição | Status |
|------|-----------|--------|
| Links para telas ERP nos eventos da equipe | Cada setor abre a tela correta do ERP | ✅ Concluído |
| Gamificação no sidebar de todos os HTMLs do ERP | Links para professor, equipe, placar nas 4 novas telas | ✅ Concluído |
| Gamificação no sidebar das telas antigas (index, ranking, admin) | Links para professor, equipe, placar | ⚠️ Iniciado — apenas as telas novas foram atualizadas |
| Accordion no sidebar do `admin.html` | Todas as seções colapsam/expandem com animação `▸` | ✅ Concluído |
| `televendas.html` registrada na tabela `tela` | INSERT em `tela` (ID 56) + `tela_sistema` (sistema_id=5) | ✅ Concluído |
| SQL de registro no banco (sistema + telas) | INSERT em `sistema`, `tela`, `tela_sistema` para demais telas | ❌ Não Iniciado |
| Motor criando registros reais no ERP | Evento "Pedido de Venda" cria `vendas_pedidos` no banco | ❌ Não Iniciado — motor gera evento mas não cria o registro ERP vinculado |
| Detecção automática de resolução por status ERP | Polling verifica se o aluno alterou o status no módulo | ❌ Não Iniciado |

---

## 10. JavaScript Compartilhado (`gamif.js`)

| Item | Descrição | Status |
|------|-----------|--------|
| Sistema de XP e níveis (individual) | Níveis Iniciante → Master ERP | ✅ Concluído |
| Sistema de badges/conquistas | 7 badges com lógica de desbloqueio | ✅ Concluído |
| Missões gamificadas | Missões vinculadas a ações no ERP | ✅ Concluído |
| Integração gamif.js com as novas telas de equipe | gamif.js não é usado nas novas telas — sistema separado | ⚠️ Iniciado — dois sistemas paralelos, não unificados |

---

## 11. Agente de API — Tele Vendas com Gamificação

> Especificação do agente automático que gera pedidos na tabela `televendas` durante as sessões de aula. O professor controla o agente a partir do dashboard (`professor.html`).

### Visão Geral

O **Agente Tele Vendas** é um motor JavaScript embutido no `professor.html` que, ao receber o comando do professor, envia automaticamente múltiplos pedidos para a tabela `televendas` via REST API do Supabase, simulando chamadas de um sistema externo (IRP). Cada pedido inserido gera um **evento de gamificação** para a equipe de Vendas, que deve atendê-lo dentro do prazo para pontuar.

```
Professor configura → Professor dá Start → Agente insere N pedidos na tabela televendas
                                          → Para cada pedido: cria evento gamificação (setor: vendas)
                                          → Equipe Vendas vê o evento no equipe.html
                                          → Equipe acessa televendas.html e muda status para Concluído
                                          → Evento marcado como resolvido → pontos creditados
```

---

### 11.1 Estrutura da Tabela `televendas` (já existente)

```sql
CREATE TABLE televendas (
  id         bigserial PRIMARY KEY,
  pedido_d   text,                         -- ID/referência gerada pelo agente
  datahora   timestamptz DEFAULT now(),    -- timestamp do pedido
  id_chave   text,                         -- chave de identificação da sessão/rodada
  status     text DEFAULT 'Em Aberto',     -- status de atendimento
  observacao text,                         -- anotação do operador
  created_at timestamptz DEFAULT now()
);
```

**Campos utilizados pelo agente:**
- `pedido_d` — gerado pelo agente no formato `TV-{sessao_rodada}-{sequencial}` (ex: `TV-R3-001`)
- `id_chave` — `{sessao_id}:{rodada}` — permite rastrear todos os pedidos de uma rodada
- `datahora` — timestamp exato do envio
- `status` — sempre `'Em Aberto'` ao inserir (agente nunca fecha)

---

### 11.2 Painel de Controle do Agente (UI no `professor.html`)

Um novo bloco **"📞 Agente Tele Vendas"** é adicionado ao dashboard do professor, com os seguintes controles:

#### Campos de Configuração

| Campo | Tipo | Descrição |
|-------|------|-----------|
| Quantidade de Pedidos | Número (1–50) | Quantos pedidos o agente vai criar nesta rodada |
| Intervalo entre Pedidos | Número (1–60 s) | Segundos entre cada inserção (simula chegada gradual) |
| Modo de Produto | Select | **Aleatório** ou **Produto Específico** |
| Produto Específico | Select (produtos ativos) | Visível apenas quando modo = "Produto Específico" |
| Faixa de Valor Mínimo | Número (R$) | Valor mínimo do pedido (usado para gerar `observacao`) |
| Faixa de Valor Máximo | Número (R$) | Valor máximo do pedido |
| Prazo do Evento (min) | Número (1–30) | Minutos que a equipe de Vendas tem para resolver |
| Prioridade | Select | Normal / Alta / Urgente |

#### Botões

| Botão | Ação |
|-------|------|
| ▶ Iniciar Agente | Começa a enviar pedidos conforme configuração |
| ⏹ Parar Agente | Cancela o envio (pedidos já enviados permanecem) |
| 🔄 Resetar Contador | Zera o sequencial da rodada atual |

#### Indicador de Progresso

```
[███████░░░░░░░] 7 / 10 pedidos enviados  — Próximo em 4s
```

---

### 11.3 Lógica JavaScript do Agente

```js
// ── Configuração do agente ─────────────────────────────────────
let agenteInterval = null;
let agenteContador = 0;

const AGENTE_CFG = {
  quantidade:      10,
  intervaloSegundos: 5,
  modoAleatório:   true,
  produtoEspecifico: null,   // uuid do produto (quando modo = específico)
  valorMin:        100,
  valorMax:        5000,
  prazoMinutos:    8,
  prioridade:      'normal'
};

// ── Iniciar agente ────────────────────────────────────────────
async function iniciarAgente() {
  if (agenteInterval) return;
  agenteContador = 0;

  const cfg = lerConfiguracaoAgente();
  const sessao = sessaoAtual;            // sessão carregada no dashboard
  if (!sessao) { alert('Selecione uma sessão ativa.'); return; }

  atualizarBtnAgente(true);

  agenteInterval = setInterval(async () => {
    if (agenteContador >= cfg.quantidade) {
      pararAgente();
      return;
    }
    agenteContador++;
    await enviarPedidoTelevendas(cfg, sessao);
    atualizarProgressoAgente(agenteContador, cfg.quantidade, cfg.intervaloSegundos);
  }, cfg.intervaloSegundos * 1000);

  // enviar o primeiro imediatamente
  await enviarPedidoTelevendas(cfg, sessao);
  agenteContador++;
  atualizarProgressoAgente(agenteContador, cfg.quantidade, cfg.intervaloSegundos);
}

// ── Enviar um pedido ──────────────────────────────────────────
async function enviarPedidoTelevendas(cfg, sessao) {
  // 1. Selecionar produto
  const produto = cfg.modoAleatório
    ? produtos[Math.floor(Math.random() * produtos.length)]   // array de produtos ativos
    : cfg.produtoEspecifico;

  // 2. Gerar valor aleatório dentro da faixa
  const valor = (Math.random() * (cfg.valorMax - cfg.valorMin) + cfg.valorMin).toFixed(2);

  // 3. Montar referência do pedido
  const seq     = String(agenteContador).padStart(3, '0');
  const pedidoD = `TV-R${sessao.rodada_atual}-${seq}`;
  const idChave = `${sessao.id}:R${sessao.rodada_atual}`;

  // 4. Observação automática com detalhes do pedido
  const nomeProd = produto?.nome || 'Produto não informado';
  const obs = `Agente: ${nomeProd} | Qtd: ${Math.floor(Math.random()*10)+1} | Valor: R$ ${parseFloat(valor).toLocaleString('pt-BR',{minimumFractionDigits:2})}`;

  // 5. Inserir na tabela televendas
  const teleRow = await sbInserir('televendas', {
    pedido_d:   pedidoD,
    datahora:   new Date().toISOString(),
    id_chave:   idChave,
    status:     'Em Aberto',
    observacao: obs
  });

  // 6. Criar evento de gamificação vinculado
  await sbInserir('gamificacao_eventos', {
    sessao_id:     sessao.id,
    rodada:        sessao.rodada_atual,
    tipo:          'televendas_pedido',
    titulo:        `📞 Pedido ${pedidoD} — ${nomeProd}`,
    descricao:     obs,
    setor_alvo:    'vendas',
    prioridade:    cfg.prioridade,
    prazo_minutos: cfg.prazoMinutos,
    status:        'pendente',
    referencia_id: teleRow[0]?.id?.toString(),   // ID do registro televendas
    pontos_base:   cfg.prioridade === 'urgente' ? 25 : cfg.prioridade === 'alta' ? 15 : 10
  });
}

// ── Parar agente ──────────────────────────────────────────────
function pararAgente() {
  clearInterval(agenteInterval);
  agenteInterval = null;
  atualizarBtnAgente(false);
}
```

---

### 11.4 Fluxo Completo (Passo a Passo)

```
1. Professor abre professor.html com sessão ativa
2. Professor configura o Agente Tele Vendas:
   ├── Quantidade: 10 pedidos
   ├── Intervalo: 5 segundos entre cada um
   ├── Modo: Aleatório (ou seleciona produto específico)
   ├── Valor: R$ 500 a R$ 5.000
   ├── Prazo: 8 minutos
   └── Prioridade: Normal
3. Professor clica ▶ Iniciar Agente
4. Agente insere 1 registro em televendas a cada 5 segundos
5. Para cada insert em televendas, o agente também cria 1 evento em gamificacao_eventos
   └── setor_alvo = 'vendas' | tipo = 'televendas_pedido'
6. Equipe Vendas vê o evento no equipe.html com countdown de 8 minutos
7. Equipe clica em "Abrir Tele Vendas" → abre vendas/televendas.html
8. Operador busca o pedido pelo Pedido D (ex: TV-R3-001) e muda status para "Concluído"
9. De volta ao equipe.html, clica "Marcar Resolvido"
10. Sistema calcula pontos:
    ├── Dentro do prazo: +10 pts
    ├── Em menos de 50% do prazo: +15 pts (bônus)
    └── Expirado: −5 pts
11. Pontos atualizados no placar em tempo real
```

---

### 11.5 Modos de Produto

#### Modo Aleatório
- O agente sorteia um produto da lista de produtos ativos do banco
- Cada pedido pode ter um produto diferente
- A quantidade de itens por pedido também é aleatória (1 a 10 unidades)
- O valor pode ser aleatório dentro da faixa configurada OU calculado como `qtd × preco_venda` do produto

#### Modo Produto Específico
- O professor seleciona um produto do select (carregado da tabela `produtos`)
- Todos os pedidos daquela rodada são daquele produto
- Útil para simular uma campanha ou promoção específica
- O valor ainda pode ser aleatório dentro da faixa ou fixado pelo `preco_venda`

---

### 11.6 `id_chave` como Rastreador de Sessão

O campo `id_chave` usa o formato `{sessao_id}:R{rodada}`, que permite:

```js
// Buscar todos os pedidos de uma rodada específica
GET /rest/v1/televendas?id_chave=eq.{sessao_id}:R3
```

- Filtrar os pedidos de uma sessão/rodada no módulo `televendas.html`
- O professor pode ver quantos pedidos foram enviados e quantos foram atendidos

---

### 11.7 Novo Tipo de Evento no Motor

O tipo `televendas_pedido` deve ser adicionado ao objeto `TIPOS` em `professor.html`:

```js
const TIPOS = {
  // ... tipos existentes ...
  televendas_pedido: {
    setor:   'vendas',
    pts:     10,
    prazo:   8,
    prio:    'normal',
    titulo:  (p) => `📞 Pedido Tele Vendas — ${p?.nome || 'Produto'}`
  }
};
```

O agente usa esse tipo mas **não passa pelo motor aleatório** — é disparado diretamente pelo painel do agente.

---

### 11.8 HTML do Painel do Agente (Bloco a inserir em `professor.html`)

```html
<!-- ── Agente Tele Vendas ───────────────────────────────────── -->
<div class="panel" style="margin-bottom:16px">
  <div class="panel-hdr">
    <span>📞 Agente Tele Vendas</span>
    <span id="agenteStatusBadge" style="font-size:11px;font-weight:600;color:var(--color-text-muted)">Parado</span>
  </div>
  <div style="padding:14px 16px;display:flex;flex-direction:column;gap:12px">

    <!-- Linha 1: qtd / intervalo / prioridade / prazo -->
    <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end">
      <div style="display:flex;flex-direction:column;gap:4px;min-width:80px">
        <label style="font-size:11px;font-weight:700;color:var(--color-text-disabled);text-transform:uppercase">Pedidos</label>
        <input type="number" id="agQtd" value="10" min="1" max="50" class="crud-input" style="width:80px">
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;min-width:80px">
        <label style="font-size:11px;font-weight:700;color:var(--color-text-disabled);text-transform:uppercase">Intervalo (s)</label>
        <input type="number" id="agIntervalo" value="5" min="1" max="60" class="crud-input" style="width:80px">
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;min-width:100px">
        <label style="font-size:11px;font-weight:700;color:var(--color-text-disabled);text-transform:uppercase">Prazo (min)</label>
        <input type="number" id="agPrazo" value="8" min="1" max="30" class="crud-input" style="width:100px">
      </div>
      <div style="display:flex;flex-direction:column;gap:4px">
        <label style="font-size:11px;font-weight:700;color:var(--color-text-disabled);text-transform:uppercase">Prioridade</label>
        <select id="agPrioridade" class="crud-input" style="min-width:110px">
          <option value="normal">Normal</option>
          <option value="alta">Alta</option>
          <option value="urgente">Urgente</option>
        </select>
      </div>
    </div>

    <!-- Linha 2: valor mín / valor máx -->
    <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end">
      <div style="display:flex;flex-direction:column;gap:4px">
        <label style="font-size:11px;font-weight:700;color:var(--color-text-disabled);text-transform:uppercase">Valor Mín (R$)</label>
        <input type="number" id="agValMin" value="100" min="1" class="crud-input" style="width:110px">
      </div>
      <div style="display:flex;flex-direction:column;gap:4px">
        <label style="font-size:11px;font-weight:700;color:var(--color-text-disabled);text-transform:uppercase">Valor Máx (R$)</label>
        <input type="number" id="agValMax" value="5000" min="1" class="crud-input" style="width:110px">
      </div>
    </div>

    <!-- Linha 3: modo de produto -->
    <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end">
      <div style="display:flex;flex-direction:column;gap:4px">
        <label style="font-size:11px;font-weight:700;color:var(--color-text-disabled);text-transform:uppercase">Modo Produto</label>
        <select id="agModoProduto" class="crud-input" style="min-width:180px" onchange="toggleProdutoEspecifico()">
          <option value="aleatorio">🎲 Aleatório</option>
          <option value="especifico">📦 Produto Específico</option>
        </select>
      </div>
      <div id="agProdutoEspecificoWrap" style="display:none;flex-direction:column;gap:4px">
        <label style="font-size:11px;font-weight:700;color:var(--color-text-disabled);text-transform:uppercase">Produto</label>
        <select id="agProduto" class="crud-input" style="min-width:200px"></select>
      </div>
    </div>

    <!-- Progresso -->
    <div id="agenteProgresso" style="display:none">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:12px;font-weight:600;color:var(--color-text-muted)">
        <span id="agenteProgressoLabel">0 / 10 pedidos enviados</span>
        <span id="agenteProximoLabel"></span>
      </div>
      <div style="height:6px;background:var(--color-border);border-radius:100px;overflow:hidden">
        <div id="agenteProgressoBar" style="height:100%;background:var(--color-primary);border-radius:100px;transition:width .3s;width:0%"></div>
      </div>
    </div>

    <!-- Botões -->
    <div style="display:flex;gap:8px">
      <button id="btnAgenteStart" class="btn" onclick="iniciarAgente()" style="background:#16a34a">▶ Iniciar Agente</button>
      <button id="btnAgenteStop" class="btn" onclick="pararAgente()" style="background:#dc2626;display:none">⏹ Parar</button>
    </div>

  </div>
</div>
```

---

### 11.9 Status de Implementação

| Item | Descrição | Status |
|------|-----------|--------|
| Especificação do agente | Lógica, campos, fluxo e HTML documentados | ✅ Concluído (este documento) |
| Agente TV em `admin.html` (versão admin) | Painel completo em aba "📞 Tele Vendas" com config dinâmica | ✅ Concluído |
| Config: pedidos por minuto | Input numérico (1–60) que define o intervalo em segundos | ✅ Concluído (admin.html) |
| Config: faixa de valores (mín/máx) | Inputs R$ configuráveis que alimentam `enviarPedidoTv()` | ✅ Concluído (admin.html) |
| Config: modo produto (aleatório / específico / lista) | Select com subpainel dinâmico, carrega `produtos` ativos | ✅ Concluído (admin.html) |
| Config: modo cliente (aleatório / específico / lista) | Select com subpainel dinâmico, carrega `clientes` ativos | ✅ Concluído (admin.html) |
| `vendas/televendas.html`: botão Atualizar manual | Chama `carregarDados()` e reinicia contador de auto-refresh | ✅ Concluído |
| `vendas/televendas.html`: auto-refresh 5 minutos | Countdown regressivo visível no toolbar | ✅ Concluído |
| Painel UI no `professor.html` | Bloco HTML com campos de configuração (conforme spec 11.8) | ✅ Concluído |
| Função `iniciarAgente()` em `professor.html` | JavaScript de envio com setInterval + vínculo à sessão | ✅ Concluído |
| Função `enviarPedidoTelevendas()` em `professor.html` | Insert em `televendas` + insert em `gamificacao_eventos` | ✅ Concluído |
| Barra de progresso do agente (X/N pedidos) | Exibe progresso da rodada com countdown | ✅ Concluído |
| Equipe Vendas: link para televendas.html | Botão "Abrir Tele Vendas" em `equipe.html` | ❌ Não Iniciado |
| Filtro por `id_chave` em televendas.html | Permite ver só os pedidos da sessão/rodada atual | ❌ Não Iniciado |

---

---

## 12. RH — Gamificação de Pendências

> Permite ao professor gerar pendências de RH durante a sessão. As pendências aparecem no `rh/dashboard.html` como alertas visuais com badges por tipo. A equipe de RH resolve as pendências clicando em "Resolver".

### 12.1 Banco de Dados

| Item | Descrição | Status |
|------|-----------|--------|
| Tabela `rh_pendencias` | Armazena pendências geradas pela gamificação — campos: `tipo`, `titulo`, `funcionario_id`, `funcionario_nome`, `status`, `prioridade`, `dados_extra`, `observacao`, `resolvido_em` | ✅ Concluído — criada no Supabase com RLS permissiva |

### 12.2 Painel Admin (`gamificacao/admin.html`)

| Item | Descrição | Status |
|------|-----------|--------|
| Aba "👥 RH" na barra de abas | Nova aba no admin.html ao lado de "📞 Tele Vendas" | ✅ Concluído |
| Seletor de ação (5 tipos) | Contratar, Demitir, Promover, Férias, Atestado — cards visuais clicáveis | ✅ Concluído |
| Modo funcionário: Aleatório | Sorteia 1 funcionário ativo ao acaso | ✅ Concluído |
| Modo funcionário: Específico | Select com todos os funcionários ativos carregados do Supabase | ✅ Concluído |
| Modo funcionário: Lista (múltiplos) | Checkboxes com todos os funcionários; gera 1 pendência por selecionado | ✅ Concluído |
| Campo Prioridade | Normal / Alta / Urgente | ✅ Concluído |
| Campo Observação | Texto livre enviado junto à pendência | ✅ Concluído |
| Botão "📋 Gerar Pendência no RH" | Insere 1 registro em `rh_pendencias` por funcionário selecionado | ✅ Concluído |
| Tabela de histórico de pendências geradas | Lista as últimas 100 em tempo real com status colorido | ✅ Concluído |

### 12.3 Dashboard RH (`rh/dashboard.html`)

| Item | Descrição | Status |
|------|-----------|--------|
| Banner de pendências (topo da página) | Destaque em vermelho, visível apenas quando há pendências não resolvidas | ✅ Concluído |
| Badges por tipo de pendência | Um badge colorido por tipo (📝 Contratação, 🚪 Demissão, ⬆️ Promoção, 🏖️ Férias, 🏥 Atestado) com contador | ✅ Concluído |
| Filtro por badge | Clicar no badge filtra a lista para exibir só aquele tipo | ✅ Concluído |
| Lista expansível de pendências | Abre/fecha ao clicar no header do banner; exibe nome, tipo, data, prioridade | ✅ Concluído |
| Indicador de prioridade Urgente com animação | Badge vermelho pulsante para pendências urgentes | ✅ Concluído |
| Botão "✅ Resolver" por item | Faz PATCH em `rh_pendencias` → `status = Resolvido`; remove o item da lista com fade | ✅ Concluído |
| Auto-refresh a cada 30 segundos | Recarrega pendências automaticamente para manter o painel atualizado | ✅ Concluído |
| Ocultação automática do banner | Banner some automaticamente quando todas as pendências são resolvidas | ✅ Concluído |

---

## Resumo Geral

| Categoria | Concluído | Iniciado | Não Iniciado | Total |
|-----------|:---------:|:--------:|:------------:|:-----:|
| Banco de dados | 7 | 1 | 0 | 8 |
| Telas HTML | 7 | 0 | 0 | 7 |
| Motor de simulação | 7 | 0 | 0 | 7 |
| Sistema de pontuação | 4 | 0 | 2 | 6 |
| Dashboard Professor | 9 | 0 | 1 | 10 |
| View da Equipe | 10 | 0 | 1 | 11 |
| Placar | 9 | 0 | 0 | 9 |
| Config Sessão | 9 | 0 | 2 | 11 |
| Integração ERP | 2 | 1 | 3 | 6 |
| gamif.js | 3 | 1 | 0 | 4 |
| Agente Tele Vendas | 5 | 0 | 5 | 10 |
| **Total** | **68** | **3** | **18** | **89** |

---

## Próximos Passos Prioritários

1. **Implementar Agente Tele Vendas** — adicionar o painel HTML e as funções JS em `professor.html`
2. **Motor criar registros reais no ERP** — hoje o motor só cria o evento, não o pedido/SC no banco
3. **Detecção automática de resolução** — polling que verifica status no módulo ERP sem precisar do botão manual
4. **Atualizar sidebar das telas antigas** (`index.html`, `ranking.html`, `admin.html`) com links para professor/equipe/placar
5. **Exportar relatório PDF** no final da sessão
6. **Selecionar produtos/clientes/fornecedores** específicos na config-sessao

---

*Atualizado em 2026-08-16 após leitura do módulo Tele Vendas e especificação do Agente de API.*
