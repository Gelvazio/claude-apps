-- ============================================================
--  ERP SENAI — Módulo de Gamificação
--  Criação das tabelas no Supabase (PostgreSQL)
--  Projeto: vdhahqicqlrdvcpesiwk.supabase.co
--  Executar no Supabase SQL Editor antes de usar o módulo
-- ============================================================

-- Grupos (turmas ou setores)
CREATE TABLE IF NOT EXISTS gamif_grupos (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome       text NOT NULL,
  tipo       text DEFAULT 'turma',  -- 'turma' | 'setor'
  created_at timestamptz DEFAULT now()
);

-- Vínculo usuário ↔ grupo
CREATE TABLE IF NOT EXISTS gamif_usuario_grupo (
  usuario_id uuid REFERENCES erp_usuarios(id) ON DELETE CASCADE,
  grupo_id   uuid REFERENCES gamif_grupos(id) ON DELETE CASCADE,
  PRIMARY KEY (usuario_id, grupo_id)
);

-- Missões (fixas de onboarding + customizadas pelo admin)
CREATE TABLE IF NOT EXISTS gamif_missoes (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo     text NOT NULL,
  descricao  text,
  evento     text NOT NULL,         -- ex: 'pedido_compra_criado'
  meta       integer DEFAULT 1,     -- quantas vezes o evento deve ocorrer
  xp         integer NOT NULL,
  tipo       text DEFAULT 'onboarding',  -- 'onboarding' | 'modulo' | 'especial'
  grupo_id   uuid REFERENCES gamif_grupos(id) ON DELETE SET NULL,
  prazo      date,
  ativo      boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Progresso do usuário em cada missão
CREATE TABLE IF NOT EXISTS gamif_progresso (
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
CREATE TABLE IF NOT EXISTS gamif_perfil (
  usuario_id uuid PRIMARY KEY REFERENCES erp_usuarios(id) ON DELETE CASCADE,
  xp_total   integer DEFAULT 0,
  nivel      integer DEFAULT 1,
  updated_at timestamptz DEFAULT now()
);

-- Badges conquistados
CREATE TABLE IF NOT EXISTS gamif_badges (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id uuid REFERENCES erp_usuarios(id) ON DELETE CASCADE,
  badge_slug text NOT NULL,   -- ex: 'mestre_compras', 'erp_completo'
  ganho_em   timestamptz DEFAULT now(),
  UNIQUE (usuario_id, badge_slug)
);

-- ============================================================
--  RLS — Row Level Security (permissiva para desenvolvimento)
-- ============================================================

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
