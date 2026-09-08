-- ============================================================
--  EXECUTAR_NO_SUPABASE_AGORA.sql
--
--  ⚠️ COPIE E COLE TODO ESTE CÓDIGO NO SQL EDITOR DO SUPABASE
--  Execute linha por linha ou tudo de uma vez.
--
--  OBJETIVO: Atualizar o limite de Administradores de 3 para 20
-- ============================================================

-- ── PASSO 1: Droppar trigger existente (se houver) ──────────
DROP TRIGGER IF EXISTS trg_validar_admin_limit ON erp_usuarios CASCADE;
DROP FUNCTION IF EXISTS fn_validar_admin_limit() CASCADE;

-- ── PASSO 2: Criar função PL/pgSQL para validação ──────────
CREATE OR REPLACE FUNCTION fn_validar_admin_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_admin_count INTEGER;
  v_perfil_admin_id UUID;
BEGIN
  -- Contar administradores ATIVOS (excluindo o registro atual em edição)
  SELECT COUNT(*) INTO v_admin_count
  FROM erp_usuarios
  WHERE perfil = 'Administrador'
    AND status = TRUE
    AND (TG_OP = 'INSERT' OR id != NEW.id);

  -- Se é um novo Administrador (INSERT) ou está sendo promovido (UPDATE)
  IF NEW.perfil = 'Administrador' THEN
    -- Verificar se já atingiu o limite de 20
    IF v_admin_count >= 20 THEN
      RAISE EXCEPTION 'Limite de 20 administradores atingido. Desative um administrador antes de promover outro.' USING ERRCODE = 'P0001';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── PASSO 3: Criar trigger para validar ANTES de inserir/atualizar ──
CREATE TRIGGER trg_validar_admin_limit
  BEFORE INSERT OR UPDATE ON erp_usuarios
  FOR EACH ROW
  EXECUTE FUNCTION fn_validar_admin_limit();

-- ── PASSO 4: Verificação ────────────────────────────────────
-- Mostrar a função criada
SELECT
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines
WHERE routine_name = 'fn_validar_admin_limit'
  AND routine_schema = 'public';

-- ── PASSO 5: Confirmar trigger criada ────────────────────
SELECT
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_name = 'trg_validar_admin_limit'
  AND trigger_schema = 'public';

-- ============================================================
--  Se ambas as queries acima retornarem resultados, está PRONTO!
-- ============================================================
