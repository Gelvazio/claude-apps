-- ============================================================
--  ERP Senai — Schema PostgreSQL (Supabase)
--  Gerado em: 2026-08-14
-- ============================================================
-- Executar no SQL Editor do Supabase na ordem abaixo.
-- ============================================================

-- ── Extensões ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
--  MÓDULO: CONFIGURAÇÕES
-- ============================================================

CREATE TABLE IF NOT EXISTS erp_usuarios (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  nome        text        NOT NULL,
  email       text        NOT NULL UNIQUE,
  cargo       text,
  telefone    text,
  perfil      text        NOT NULL DEFAULT 'Usuário'
                          CHECK (perfil IN ('Administrador', 'Usuário')),
  senha_hash  text        NOT NULL,
  status      boolean     NOT NULL DEFAULT true,
  permissoes  jsonb       NOT NULL DEFAULT '{
    "visao_geral": true,
    "cadastros":   false,
    "compras":     false,
    "estoque":     false,
    "vendas":      false
  }'::jsonb,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

COMMENT ON TABLE  erp_usuarios IS 'Usuários do sistema ERP com perfil e permissões por módulo.';
COMMENT ON COLUMN erp_usuarios.perfil     IS 'Administrador: acesso total. Usuário: acesso restrito às permissões marcadas.';
COMMENT ON COLUMN erp_usuarios.senha_hash IS 'SHA-256 da senha. Nunca armazenar senha em texto puro.';
COMMENT ON COLUMN erp_usuarios.permissoes IS 'JSON com flags booleanas por módulo. Ignorado para Administrador.';


-- ============================================================
--  MÓDULO: CADASTROS
-- ============================================================

-- ── Clientes ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clientes (
  id          uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  nome        text    NOT NULL,
  cnpj_cpf    text,
  email       text,
  telefone    text,
  segmento    text    CHECK (segmento IN (
                'Tecnologia','Saúde','Varejo','Alimentação',
                'Automobilístico','Metalmecânica','Madeireiro',
                'Serviços','Agricultura','Transporte','Outros'
              )),
  endereco    text,
  cidade      text,
  estado      char(2),
  cep         text,
  ativo       boolean NOT NULL DEFAULT true,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

COMMENT ON TABLE clientes IS 'Clientes pessoa física ou jurídica.';

-- ── Fornecedores ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fornecedores (
  id          uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  nome        text    NOT NULL,
  cnpj        text,
  contato     text,
  email       text,
  telefone    text,
  segmento    text    CHECK (segmento IN (
                'Tecnologia','Saúde','Varejo','Alimentação',
                'Automobilístico','Metalmecânica','Madeireiro',
                'Serviços','Agricultura','Transporte','Outros'
              )),
  endereco    text,
  cidade      text,
  estado      char(2),
  cep         text,
  ativo       boolean NOT NULL DEFAULT true,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

COMMENT ON TABLE fornecedores IS 'Fornecedores (sempre pessoa jurídica).';

-- ── Produtos ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS produtos (
  id              uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo          text          NOT NULL UNIQUE,   -- P00001 (gerado pela aplicação)
  nome            text          NOT NULL,
  categoria       text          CHECK (categoria IN (
                    'Tecnologia','Saúde','Varejo','Alimentação',
                    'Automobilístico','Metalmecânica','Madeireiro',
                    'Serviços','Agricultura','Transporte',
                    'Embalagens','Manutenção e Reparos','Outros'
                  )),
  unidade         text          CHECK (unidade IN ('UN','KG','LT','CX','PC','MT')),
  preco_custo     numeric(14,2) DEFAULT 0,
  preco_venda     numeric(14,2) DEFAULT 0,
  estoque_atual   numeric(14,3) DEFAULT 0,
  estoque_minimo  numeric(14,3) DEFAULT 0,
  estoque_maximo  numeric(14,3),
  imagem_url      text,
  descricao       text,
  ativo           boolean       NOT NULL DEFAULT true,
  created_at      timestamptz   DEFAULT now(),
  updated_at      timestamptz   DEFAULT now()
);

COMMENT ON TABLE  produtos IS 'Catálogo de produtos. Código gerado pela aplicação (P00001).';
COMMENT ON COLUMN produtos.estoque_atual IS 'Atualizado automaticamente por trigger nas movimentações.';

-- ── Transportadoras ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transportadoras (
  id            uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  nome          text    NOT NULL,
  cnpj          text,
  tipo_servico  text,
  contato       text,
  email         text,
  telefone      text,
  cidade        text,
  estado        char(2),
  ativa         boolean NOT NULL DEFAULT true,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

COMMENT ON TABLE transportadoras IS 'Transportadoras usadas nas operações de logística.';


-- ============================================================
--  MÓDULO: COMPRAS
-- ============================================================

-- ── Planejamento de Compras ────────────────────────────────
CREATE TABLE IF NOT EXISTS compras_planejamento (
  id              uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo          text          NOT NULL,
  tipo            text,
  produto_id      uuid          REFERENCES produtos(id) ON DELETE SET NULL,
  periodo         text,
  qtd_planejada   numeric(14,3),
  qtd_realizada   numeric(14,3) DEFAULT 0,
  status          text          NOT NULL DEFAULT 'Em Planejamento'
                                CHECK (status IN (
                                  'Em Planejamento','Em Andamento','Concluído','Cancelado'
                                )),
  data            date          DEFAULT CURRENT_DATE,
  observacoes     text,
  created_at      timestamptz   DEFAULT now(),
  updated_at      timestamptz   DEFAULT now()
);

-- ── Solicitação de Compras ─────────────────────────────────
CREATE TABLE IF NOT EXISTS compras_solicitacoes (
  id          uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  planejamento_id uuid      REFERENCES compras_planejamento(id) ON DELETE SET NULL,
  fornecedor_id uuid        REFERENCES fornecedores(id) ON DELETE SET NULL,
  numero      text          NOT NULL UNIQUE,          -- SC00001
  produto_id  uuid          NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
  quantidade  numeric(14,3) NOT NULL CHECK (quantidade > 0),
  unidade     text,
  solicitante text,
  prioridade  text          NOT NULL DEFAULT 'Média'
                            CHECK (prioridade IN ('Baixa','Média','Alta','Urgente')),
  status      text          NOT NULL DEFAULT 'Pendente'
                            CHECK (status IN (
                              'Pendente','Em Análise','Aprovada','Concluída','Reprovada','Cancelada'
                            )),
  data        date          DEFAULT CURRENT_DATE,
  observacoes text,
  created_at  timestamptz   DEFAULT now(),
  updated_at  timestamptz   DEFAULT now()
);

COMMENT ON COLUMN compras_solicitacoes.numero IS 'Gerado pela aplicação: SC00001 sequencial.';

-- ── Pedido de Compras ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS compras_pedidos (
  id                uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  numero            text          NOT NULL UNIQUE,    -- PC00001
  solicitacao_id    uuid          REFERENCES compras_solicitacoes(id) ON DELETE SET NULL,
  fornecedor_id     uuid          REFERENCES fornecedores(id) ON DELETE RESTRICT,
  produto_id        uuid          NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
  quantidade        numeric(14,3) NOT NULL CHECK (quantidade > 0),
  preco_unitario    numeric(14,2) DEFAULT 0,
  valor_total       numeric(14,2) DEFAULT 0,          -- calculado: quantidade * preco_unitario
  status            text          NOT NULL DEFAULT 'Pendente'
                                  CHECK (status IN (
                                    'Pendente','Rascunho','Enviado','Confirmado','Concluído','Cancelado','Recebido'
                                  )),
  data              date          DEFAULT CURRENT_DATE,
  data_prevista     date,
  observacoes       text,
  created_at        timestamptz   DEFAULT now(),
  updated_at        timestamptz   DEFAULT now()
);

COMMENT ON COLUMN compras_pedidos.numero      IS 'Gerado pela aplicação: PC00001 sequencial.';
COMMENT ON COLUMN compras_pedidos.valor_total IS 'Calculado pela aplicação: quantidade × preco_unitario.';

-- Migração idempotente para bases existentes: habilita o fluxo automático.
ALTER TABLE compras_solicitacoes
  ADD COLUMN IF NOT EXISTS planejamento_id uuid REFERENCES compras_planejamento(id) ON DELETE SET NULL;

ALTER TABLE compras_solicitacoes
  ADD COLUMN IF NOT EXISTS fornecedor_id uuid REFERENCES fornecedores(id) ON DELETE SET NULL;

ALTER TABLE compras_solicitacoes DROP CONSTRAINT IF EXISTS compras_solicitacoes_status_check;
ALTER TABLE compras_solicitacoes ADD CONSTRAINT compras_solicitacoes_status_check
  CHECK (status IN ('Pendente','Em Análise','Aprovada','Concluída','Reprovada','Cancelada'));

ALTER TABLE compras_pedidos ALTER COLUMN fornecedor_id DROP NOT NULL;
ALTER TABLE compras_pedidos ALTER COLUMN status SET DEFAULT 'Pendente';
ALTER TABLE compras_pedidos DROP CONSTRAINT IF EXISTS compras_pedidos_status_check;
ALTER TABLE compras_pedidos ADD CONSTRAINT compras_pedidos_status_check
  CHECK (status IN ('Pendente','Rascunho','Enviado','Confirmado','Concluído','Cancelado','Recebido'));

CREATE UNIQUE INDEX IF NOT EXISTS uq_compras_solicitacoes_planejamento
  ON compras_solicitacoes (planejamento_id) WHERE planejamento_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_compras_pedidos_solicitacao
  ON compras_pedidos (solicitacao_id) WHERE solicitacao_id IS NOT NULL;

-- ── Recebimento ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS compras_recebimentos (
  id              uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  numero          text          NOT NULL UNIQUE,      -- RC00001
  pedido_id       uuid          REFERENCES compras_pedidos(id) ON DELETE SET NULL,
  fornecedor_id   uuid          REFERENCES fornecedores(id) ON DELETE SET NULL,
  produto_id      uuid          NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
  qtd_esperada    numeric(14,3),
  qtd_recebida    numeric(14,3),
  status          text          NOT NULL DEFAULT 'Aguardando'
                                CHECK (status IN (
                                  'Aguardando','Recebido Parcial','Recebido Total','Com Divergência'
                                )),
  responsavel     text,
  data            date          DEFAULT CURRENT_DATE,
  observacoes     text,
  created_at      timestamptz   DEFAULT now(),
  updated_at      timestamptz   DEFAULT now()
);

-- ── Conferência ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS compras_conferencias (
  id              uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  recebimento_id  uuid          NOT NULL REFERENCES compras_recebimentos(id) ON DELETE RESTRICT,
  fornecedor_id   uuid          REFERENCES fornecedores(id) ON DELETE SET NULL,
  produto_id      uuid          NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
  qtd_esperada    numeric(14,3),
  qtd_recebida    numeric(14,3),
  status          text          NOT NULL DEFAULT 'Em Análise'
                                CHECK (status IN (
                                  'Aprovado','Reprovado','Em Análise','Pendente'
                                )),
  responsavel     text,
  data            date          DEFAULT CURRENT_DATE,
  observacoes     text,
  created_at      timestamptz   DEFAULT now(),
  updated_at      timestamptz   DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_compras_recebimentos_pedido
  ON compras_recebimentos (pedido_id) WHERE pedido_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_compras_conferencias_recebimento
  ON compras_conferencias (recebimento_id);

-- ── Entrada de Nota Fiscal (Compra) ───────────────────────
CREATE TABLE IF NOT EXISTS compras_notas_fiscais (
  id              uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_nf       text          NOT NULL,
  fornecedor_id   uuid          NOT NULL REFERENCES fornecedores(id) ON DELETE RESTRICT,
  recebimento_id  uuid          REFERENCES compras_recebimentos(id) ON DELETE SET NULL,
  valor           numeric(14,2),
  qtd_itens       integer,
  status          text          NOT NULL DEFAULT 'Pendente'
                                CHECK (status IN (
                                  'Pendente','Lançada','Cancelada','Devolvida'
                                )),
  data            date          DEFAULT CURRENT_DATE,
  observacoes     text,
  created_at      timestamptz   DEFAULT now(),
  updated_at      timestamptz   DEFAULT now()
);

COMMENT ON TABLE compras_notas_fiscais IS 'Quando status = Lançada, a aplicação deve gerar uma movimentação de entrada no estoque.';


-- ============================================================
--  MÓDULO: ESTOQUE
-- ============================================================

-- ── Movimentações de Estoque ───────────────────────────────
CREATE TABLE IF NOT EXISTS estoque_movimentacoes (
  id          uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  numero      text          NOT NULL UNIQUE,          -- MV00001
  produto_id  uuid          NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
  tipo        text          NOT NULL
                            CHECK (tipo IN ('Entrada','Saída','Transferência','Ajuste')),
  quantidade  numeric(14,3) NOT NULL CHECK (quantidade > 0),
  origem      text,
  destino     text,
  usuario     text,
  referencia  text,         -- ex: "NF-000123", "PV00042"
  data        date          DEFAULT CURRENT_DATE,
  hora        time          DEFAULT CURRENT_TIME,
  observacoes text,
  created_at  timestamptz   DEFAULT now()
);

COMMENT ON TABLE  estoque_movimentacoes IS 'Histórico completo de movimentações. Imutável após criação.';
COMMENT ON COLUMN estoque_movimentacoes.referencia IS 'Número do documento de origem (NF, Pedido etc.).';

-- ── Inventário ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS estoque_inventarios (
  id          uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  numero      text          NOT NULL UNIQUE,          -- INV00001
  produto_id  uuid          NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
  qtd_sistema numeric(14,3),
  qtd_contada numeric(14,3),
  diferenca   numeric(14,3) GENERATED ALWAYS AS (qtd_contada - qtd_sistema) STORED,
  status      text          NOT NULL DEFAULT 'Pendente'
                            CHECK (status IN (
                              'Pendente','Em Contagem','Conferido','Ajustado'
                            )),
  responsavel text,
  data        date          DEFAULT CURRENT_DATE,
  observacoes text,
  created_at  timestamptz   DEFAULT now(),
  updated_at  timestamptz   DEFAULT now()
);

COMMENT ON COLUMN estoque_inventarios.diferenca IS 'Calculada automaticamente: qtd_contada - qtd_sistema.';
COMMENT ON TABLE  estoque_inventarios IS 'Ao marcar Ajustado, a aplicação gera movimentação de ajuste no estoque.';


-- ============================================================
--  MÓDULO: VENDAS E LOGÍSTICA
-- ============================================================

-- ── Pedido de Venda ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vendas_pedidos (
  id              uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  numero          text          NOT NULL UNIQUE,      -- PV00001
  cliente_id      uuid          NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  produto_id      uuid          NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
  quantidade      numeric(14,3) NOT NULL CHECK (quantidade > 0),
  preco_unitario  numeric(14,2) DEFAULT 0,
  valor_total     numeric(14,2) DEFAULT 0,            -- calculado pela aplicação
  status          text          NOT NULL DEFAULT 'Rascunho'
                                CHECK (status IN (
                                  'Rascunho','Confirmado','Em Separação',
                                  'Em Expedição','Entregue','Cancelado'
                                )),
  data            date          DEFAULT CURRENT_DATE,
  data_prevista   date,
  observacoes     text,
  created_at      timestamptz   DEFAULT now(),
  updated_at      timestamptz   DEFAULT now()
);

ALTER TABLE vendas_pedidos DROP CONSTRAINT IF EXISTS vendas_pedidos_status_check;
ALTER TABLE vendas_pedidos ADD CONSTRAINT vendas_pedidos_status_check
  CHECK (status IN (
    'Rascunho','Confirmado','GERAR_NOTA_FISCAL','EM_ANALISE_CREDITO',
    'Em Separação','Em Expedição','Entregue','Cancelado',
    'Aguardando Análise Financeira','Limite Insuficiente'
  ));

-- ── Nota Fiscal de Venda ───────────────────────────────────
CREATE TABLE IF NOT EXISTS vendas_notas_fiscais (
  id                        uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_nf                 text          NOT NULL,
  serie                     text,
  data_emissao              date,
  natureza_operacao         text,
  empresa_emitente          text,
  cliente_id                uuid          NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  pedido_id                 uuid          REFERENCES vendas_pedidos(id) ON DELETE SET NULL,
  produto_id                uuid          NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
  quantidade                numeric(14,3),
  valor_unitario            numeric(14,2),
  valor_produtos            numeric(14,2),
  desconto                  numeric(14,2) DEFAULT 0,
  frete                     numeric(14,2) DEFAULT 0,
  base_icms                 numeric(14,2),
  valor_icms                numeric(14,2),
  valor_ipi                 numeric(14,2),
  valor_total               numeric(14,2),
  transportadora_id         uuid          REFERENCES transportadoras(id) ON DELETE SET NULL,
  frete_por_conta           text          CHECK (frete_por_conta IN ('CIF','FOB','Sem Frete')),
  qtd_volumes               integer,
  peso_liquido              numeric(10,3),
  peso_bruto                numeric(10,3),
  status                    text          NOT NULL DEFAULT 'Rascunho'
                                          CHECK (status IN ('Rascunho','Emitida','Cancelada')),
  informacoes_complementares text,
  created_at                timestamptz   DEFAULT now(),
  updated_at                timestamptz   DEFAULT now()
);

-- ── Separação (Picking) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS vendas_separacoes (
  id          uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  numero      text          NOT NULL UNIQUE,          -- SEP00001
  pedido_id   uuid          REFERENCES vendas_pedidos(id) ON DELETE SET NULL,
  produto_id  uuid          NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
  quantidade  numeric(14,3) NOT NULL CHECK (quantidade > 0),
  separador   text,
  status      text          NOT NULL DEFAULT 'Pendente'
                            CHECK (status IN (
                              'Pendente','Em Separação','Concluído','Com Divergência'
                            )),
  data        date          DEFAULT CURRENT_DATE,
  observacoes text,
  created_at  timestamptz   DEFAULT now(),
  updated_at  timestamptz   DEFAULT now()
);

-- ── Romaneio ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vendas_romaneios (
  id                uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  numero            text          NOT NULL UNIQUE,    -- ROM00001
  data              date          DEFAULT CURRENT_DATE,
  pedido_id         uuid          REFERENCES vendas_pedidos(id) ON DELETE SET NULL,
  nota_fiscal_id    uuid          REFERENCES vendas_notas_fiscais(id) ON DELETE SET NULL,
  expedicao_id      uuid,                             -- FK adicionada após criar vendas_expedicoes
  cliente_id        uuid          NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  transportadora_id uuid          NOT NULL REFERENCES transportadoras(id) ON DELETE RESTRICT,
  produto_id        uuid          NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
  quantidade        numeric(14,3),
  qtd_volumes       integer,
  peso_liquido      numeric(10,3),
  peso_bruto        numeric(10,3),
  responsavel       text,
  status            text          NOT NULL DEFAULT 'Rascunho'
                                  CHECK (status IN ('Rascunho','Emitido','Despachado')),
  observacoes       text,
  created_at        timestamptz   DEFAULT now(),
  updated_at        timestamptz   DEFAULT now()
);

-- ── Expedição ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vendas_expedicoes (
  id                uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  numero            text          NOT NULL UNIQUE,    -- EXP00001
  pedido_id         uuid          REFERENCES vendas_pedidos(id) ON DELETE SET NULL,
  separacao_id      uuid          REFERENCES vendas_separacoes(id) ON DELETE SET NULL,
  transportadora_id uuid          NOT NULL REFERENCES transportadoras(id) ON DELETE RESTRICT,
  quantidade        numeric(14,3),
  tipo_embalagem    text,
  status            text          NOT NULL DEFAULT 'Pendente'
                                  CHECK (status IN (
                                    'Pendente','Em Expedição','Expedido','Cancelado'
                                  )),
  responsavel       text,
  data              date          DEFAULT CURRENT_DATE,
  observacoes       text,
  created_at        timestamptz   DEFAULT now(),
  updated_at        timestamptz   DEFAULT now()
);

COMMENT ON TABLE vendas_expedicoes IS 'Ao marcar Expedido, a aplicação deve baixar o estoque do produto.';

-- FK circular: Romaneio → Expedição (adicionada após criação das duas tabelas)
ALTER TABLE vendas_romaneios
  ADD CONSTRAINT fk_romaneio_expedicao
  FOREIGN KEY (expedicao_id)
  REFERENCES vendas_expedicoes(id)
  ON DELETE SET NULL;

-- ── Entrega ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vendas_entregas (
  id                uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  numero            text    NOT NULL UNIQUE,          -- ENT00001
  expedicao_id      uuid    REFERENCES vendas_expedicoes(id) ON DELETE SET NULL,
  transportadora_id uuid    NOT NULL REFERENCES transportadoras(id) ON DELETE RESTRICT,
  cliente_id        uuid    NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  codigo_rastreio   text,
  status            text    NOT NULL DEFAULT 'Em Trânsito'
                            CHECK (status IN (
                              'Em Trânsito','Entregue','Tentativa de Entrega',
                              'Devolvido','Extraviado'
                            )),
  data              date    DEFAULT CURRENT_DATE,
  data_entrega      date,
  responsavel       text,
  observacoes       text,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);


-- ============================================================
--  ÍNDICES (performance nas buscas mais comuns)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_clientes_nome         ON clientes (nome);
CREATE INDEX IF NOT EXISTS idx_clientes_ativo        ON clientes (ativo);
CREATE INDEX IF NOT EXISTS idx_fornecedores_nome     ON fornecedores (nome);
CREATE INDEX IF NOT EXISTS idx_fornecedores_ativo    ON fornecedores (ativo);
CREATE INDEX IF NOT EXISTS idx_produtos_codigo       ON produtos (codigo);
CREATE INDEX IF NOT EXISTS idx_produtos_nome         ON produtos (nome);
CREATE INDEX IF NOT EXISTS idx_produtos_ativo        ON produtos (ativo);
CREATE INDEX IF NOT EXISTS idx_transportadoras_nome  ON transportadoras (nome);
CREATE INDEX IF NOT EXISTS idx_transportadoras_ativa ON transportadoras (ativa);

CREATE INDEX IF NOT EXISTS idx_sc_numero     ON compras_solicitacoes (numero);
CREATE INDEX IF NOT EXISTS idx_sc_status     ON compras_solicitacoes (status);
CREATE INDEX IF NOT EXISTS idx_pc_numero     ON compras_pedidos (numero);
CREATE INDEX IF NOT EXISTS idx_pc_status     ON compras_pedidos (status);
CREATE INDEX IF NOT EXISTS idx_rc_numero     ON compras_recebimentos (numero);
CREATE INDEX IF NOT EXISTS idx_mov_numero    ON estoque_movimentacoes (numero);
CREATE INDEX IF NOT EXISTS idx_mov_produto   ON estoque_movimentacoes (produto_id);
CREATE INDEX IF NOT EXISTS idx_mov_data      ON estoque_movimentacoes (data);
CREATE INDEX IF NOT EXISTS idx_pv_numero     ON vendas_pedidos (numero);
CREATE INDEX IF NOT EXISTS idx_pv_status     ON vendas_pedidos (status);
CREATE INDEX IF NOT EXISTS idx_pv_cliente    ON vendas_pedidos (cliente_id);


-- ============================================================
--  TRIGGER: updated_at automático
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Aplicar em todas as tabelas com updated_at
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'erp_usuarios',
    'clientes', 'fornecedores', 'produtos', 'transportadoras',
    'compras_planejamento', 'compras_solicitacoes', 'compras_pedidos',
    'compras_recebimentos', 'compras_conferencias', 'compras_notas_fiscais',
    'estoque_inventarios',
    'vendas_pedidos', 'vendas_notas_fiscais', 'vendas_separacoes',
    'vendas_romaneios', 'vendas_expedicoes', 'vendas_entregas'
  ]
  LOOP
    EXECUTE format('
      CREATE TRIGGER trg_%s_updated_at
      BEFORE UPDATE ON %I
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    ', t, t);
  END LOOP;
END;
$$;


-- ============================================================
--  TRIGGER: atualizar estoque_atual em produtos
-- ============================================================

CREATE OR REPLACE FUNCTION atualizar_estoque_produto()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.tipo IN ('Entrada') THEN
    UPDATE produtos SET estoque_atual = estoque_atual + NEW.quantidade WHERE id = NEW.produto_id;
  ELSIF NEW.tipo IN ('Saída') THEN
    UPDATE produtos SET estoque_atual = estoque_atual - NEW.quantidade WHERE id = NEW.produto_id;
  ELSIF NEW.tipo = 'Ajuste' THEN
    -- quantidade pode representar delta positivo ou negativo
    -- a aplicação passa valor positivo para entrada e negativo não é permitido por CHECK
    -- então: diferença = contada - sistema (pode ser negativa na lógica do app)
    UPDATE produtos SET estoque_atual = estoque_atual + NEW.quantidade WHERE id = NEW.produto_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_movimentacao_estoque
AFTER INSERT ON estoque_movimentacoes
FOR EACH ROW EXECUTE FUNCTION atualizar_estoque_produto();

COMMENT ON FUNCTION atualizar_estoque_produto IS
  'Atualiza produtos.estoque_atual automaticamente ao inserir uma movimentação.
   Para Saída, a aplicação é responsável por garantir quantidade > 0 (o trigger subtrai).
   Para Ajuste negativo: inserir tipo=Ajuste com quantidade positiva e tratar sinal na aplicação.';


-- ============================================================
--  RLS — Row Level Security
--  (política permissiva para a anon key durante desenvolvimento)
-- ============================================================

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'erp_usuarios',
    'clientes', 'fornecedores', 'produtos', 'transportadoras',
    'compras_planejamento', 'compras_solicitacoes', 'compras_pedidos',
    'compras_recebimentos', 'compras_conferencias', 'compras_notas_fiscais',
    'estoque_movimentacoes', 'estoque_inventarios',
    'vendas_pedidos', 'vendas_notas_fiscais', 'vendas_separacoes',
    'vendas_romaneios', 'vendas_expedicoes', 'vendas_entregas'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format(
      'CREATE POLICY "anon full access" ON %I FOR ALL USING (true) WITH CHECK (true);', t
    );
  END LOOP;
END;
$$;


-- ============================================================
--  DADOS INICIAIS — Administrador padrão
--  Senha: admin123  (SHA-256 abaixo)
--  ALTERAR IMEDIATAMENTE após o primeiro login.
-- ============================================================

INSERT INTO erp_usuarios (nome, email, cargo, perfil, senha_hash, permissoes)
VALUES (
  'Administrador',
  'admin@erp.local',
  'Administrador do Sistema',
  'Administrador',
  -- SHA-256 de "admin123"
  '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
  '{"visao_geral":true,"cadastros":true,"compras":true,"estoque":true,"vendas":true}'
)
ON CONFLICT (email) DO NOTHING;


-- ============================================================
--  FIM DO SCRIPT
-- ============================================================
