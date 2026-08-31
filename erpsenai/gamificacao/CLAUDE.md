# Módulo Gamificação — Referência de Desenvolvimento

> Transforma a turma em uma empresa virtual. Cada equipe gerencia um setor do ERP. Um motor de simulação gera eventos de negócio automaticamente enquanto o professor controla o fluxo com Play/Pause.

---

## Telas do Módulo

```
gamificacao/
├── index.html          ← Hub do usuário (XP, nível, badges, missões)
├── ranking.html        ← Leaderboard geral
├── admin.html          ← Admin de configuração
├── professor.html      ← Dashboard do professor (Play/Pause, ranking, eventos ao vivo)
├── equipe.html         ← View da equipe (?equipe=uuid), countdown por evento
├── placar.html         ← Placar para projeção no telão (full-screen, dark, auto-refresh 5s)
└── config-sessao.html  ← Criar/editar sessão (equipes, membros, config do motor)
```

---

## 1. Hub do Usuário (`index.html`)

Painel individual do participante.

### Funcionalidade
- Exibe XP acumulado, nível atual, badges conquistados.
- Lista de missões ativas e concluídas.
- Progresso para próximo nível.
- Histórico de pontuações recentes.

---

## 2. Ranking (`ranking.html`)

Leaderboard geral da sessão ativa.

### Funcionalidade
- Tabela de equipes ordenada por pontos (decrescente).
- Exibe: posição, equipe, setor, pontos, eventos resolvidos.
- Auto-refresh a cada 10 segundos.
- Filtros por sessão.

---

## 3. Dashboard do Professor (`professor.html`)

Centro de controle da sessão gamificada.

### Funcionalidade
- Botões **Play / Pause** — inicia/pausa o motor de simulação.
- Seletor de velocidade: 1×, 2×, 5×.
- Contador de rodada atual.
- Lista de eventos ativos ao vivo com status (pendente, resolvido, expirado).
- Ranking em tempo real das equipes.
- Botão para encerrar sessão.
- Painel de criação rápida de evento manual.

---

## 4. Minha Equipe (`equipe.html`)

View da equipe — acessada via `?equipe=<uuid>`.

### Funcionalidade
- Exibe nome da equipe, setor e membros.
- Lista de eventos pendentes com countdown regressivo.
- Cada evento mostra: título, descrição, prioridade, prazo restante.
- Botão **"Resolver"** abre o formulário do módulo ERP correspondente.
- Pontuação atual da equipe.
- Feed de eventos resolvidos/expirados.

---

## 5. Placar (`placar.html`)

Tela para projeção no telão durante a aula.

### Funcionalidade
- Design dark, full-screen.
- Ranking das equipes em destaque (posição + pontos grandes).
- Destaque animado para eventos urgentes em andamento.
- Auto-refresh a cada 5 segundos.
- Sem sidebar, sem controles — apenas visualização.

---

## 6. Config Sessão (`config-sessao.html`)

Criação e edição de sessões gamificadas.

### Campos

| Campo | Tipo | Regras |
|-------|------|--------|
| Título da Sessão | Texto | **Obrigatório** |
| Equipes | Lista | Nome, setor, cor, membros de cada equipe |
| Velocidade Inicial | Select | 1×, 2×, 5× |
| Intervalo (segundos) | Número | Tempo entre geração de eventos |
| Máx. Eventos Ativos | Número | Limite simultâneo |
| Chance de Urgente (%) | Número | % de eventos urgentes |
| Produtos | MultiSelect | Produtos para usar nos eventos |
| Clientes | MultiSelect | Clientes para usar nos eventos |
| Fornecedores | MultiSelect | Fornecedores para usar nos eventos |

---

## 7. Admin (`admin.html`)

Administração geral do módulo.

### Funcionalidade
- Lista todas as sessões (ativas, pausadas, encerradas).
- Acesso rápido para editar ou deletar sessões.
- Logs de pontuação global.
- Reset de sessão.

---

## Equipes e Setores

| Equipe | Setor | Tabelas ERP usadas |
|--------|-------|--------------------|
| Compras | Módulo Compras | compras_solicitacoes, compras_pedidos |
| Estoque | Módulo Estoque | estoque_movimentacoes, estoque_inventarios |
| Vendas | Módulo Vendas | vendas_pedidos, vendas_separacoes |
| Logística | Romaneio/Expedição/Entrega | vendas_romaneios, vendas_expedicoes, vendas_entregas |
| Financeiro | Fluxo de caixa | fin_contas_pagar, fin_contas_receber |
| Marketing | Campanhas | marketing_campanhas, marketing_retornos |

---

## Sistema de Pontuação

| Situação | Pontos |
|----------|--------|
| Resolvido dentro do prazo | +pontos_base |
| Resolvido em < 50% do prazo | +pontos_base × 1,5 |
| Evento expirado | −5 pontos |
| Zero erros de validação | +3 bônus |
| Primeiro a resolver urgente | +15 bônus |

---

## Tabelas no Supabase

```sql
CREATE TABLE gamificacao_sessoes (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo        text NOT NULL,
  professor_id  uuid REFERENCES erp_usuarios(id),
  status        text DEFAULT 'pausada',
  velocidade    integer DEFAULT 1,
  rodada_atual  integer DEFAULT 1,
  iniciada_em   timestamptz,
  encerrada_em  timestamptz,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE gamificacao_equipes (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sessao_id  uuid REFERENCES gamificacao_sessoes(id),
  nome       text NOT NULL,
  setor      text NOT NULL,
  cor        text DEFAULT '#3B82F6',
  pontos     integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE gamificacao_membros (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  equipe_id  uuid REFERENCES gamificacao_equipes(id),
  nome       text NOT NULL,
  usuario_id uuid REFERENCES erp_usuarios(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE gamificacao_eventos (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sessao_id     uuid REFERENCES gamificacao_sessoes(id),
  rodada        integer NOT NULL,
  tipo          text NOT NULL,
  titulo        text NOT NULL,
  descricao     text,
  setor_alvo    text NOT NULL,
  prioridade    text DEFAULT 'normal',
  prazo_minutos integer DEFAULT 5,
  status        text DEFAULT 'pendente',
  referencia_id uuid,
  pontos_base   integer DEFAULT 10,
  resolvido_em  timestamptz,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE gamificacao_pontuacoes (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sessao_id  uuid REFERENCES gamificacao_sessoes(id),
  equipe_id  uuid REFERENCES gamificacao_equipes(id),
  evento_id  uuid REFERENCES gamificacao_eventos(id),
  pontos     integer NOT NULL,
  motivo     text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE gamificacao_config_motor (
  id                 uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sessao_id          uuid REFERENCES gamificacao_sessoes(id),
  intervalo_segundos integer DEFAULT 60,
  max_eventos_ativos integer DEFAULT 5,
  chance_urgente     integer DEFAULT 20,
  produtos_ids       uuid[],
  clientes_ids       uuid[],
  fornecedores_ids   uuid[],
  created_at         timestamptz DEFAULT now()
);
```

---

## Sistema e Telas no Banco

```sql
INSERT INTO sistema (siscodigo, sisnome, sisativo, sisordem)
VALUES (10, 'Gamificação', 1, 10);

INSERT INTO tela (nome, nome_html, ativo) VALUES
  ('Professor',     'gamificacao/professor.html',     1),
  ('Minha Equipe',  'gamificacao/equipe.html',        1),
  ('Placar',        'gamificacao/placar.html',         1),
  ('Config Sessão', 'gamificacao/config-sessao.html',  1);
```
