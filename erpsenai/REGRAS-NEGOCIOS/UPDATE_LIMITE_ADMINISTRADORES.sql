-- ============================================================
--  UPDATE_LIMITE_ADMINISTRADORES.sql
--
--  Alterar o limite de Administradores de 3 para 20
--  Execute no SQL Editor do Supabase
--
--  Esse script atualiza a função PL/pgSQL que valida
--  o limite máximo de administradores ativos no sistema.
-- ============================================================

-- ── Substituir função de validação ──────────────────────────
CREATE OR REPLACE FUNCTION validar_limite_administradores()
RETURNS TRIGGER AS $$
DECLARE
  v_admin_perfil_id integer;
  v_admin_count integer;
BEGIN
  -- Obter o ID do perfil Administrador
  SELECT id INTO v_admin_perfil_id
  FROM perfil
  WHERE nome = 'Administrador'
  LIMIT 1;

  -- Se não encontrar o perfil, não validar
  IF v_admin_perfil_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Se o novo registro é um Administrador
  IF NEW.perfil_id = v_admin_perfil_id THEN
    -- Contar administradores ativos (excluindo o registro atual em edição)
    SELECT COUNT(*) INTO v_admin_count
    FROM erp_usuarios
    WHERE perfil_id = v_admin_perfil_id
      AND status = true
      AND (TG_OP = 'INSERT' OR id != NEW.id);

    -- Bloquear se atingir o limite de 20
    IF v_admin_count >= 20 THEN
      RAISE EXCEPTION 'Limite de 20 administradores atingido. Desative um administrador antes de promover outro.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── Trigger (se não existir) ────────────────────────────────
-- Descomente se a trigger não existir:
-- CREATE TRIGGER trigger_validar_limite_administradores
-- BEFORE INSERT OR UPDATE ON erp_usuarios
-- FOR EACH ROW
-- EXECUTE FUNCTION validar_limite_administradores();

-- ── Verificação ────────────────────────────────────────────
SELECT 'Função validar_limite_administradores atualizada com sucesso!' as resultado;
