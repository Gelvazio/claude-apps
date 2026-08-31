-- Atualiza a senha do administrador padrão do ERP.
-- Execute este script no SQL Editor do Supabase.

DO $$
DECLARE
  usuarios_atualizados integer;
BEGIN
  UPDATE erp_usuarios
  SET senha_hash = '166da0daa25c3edb40d87c1634bbee0eda8b50ccd82f93c36c54c35a004e5561'
  WHERE email = 'admin@erp.com';

  GET DIAGNOSTICS usuarios_atualizados = ROW_COUNT;

  IF usuarios_atualizados = 0 THEN
    RAISE EXCEPTION 'Usuário admin@erp.com não encontrado.';
  END IF;

  RAISE NOTICE 'Senha do usuário admin@erp.com atualizada com sucesso.';
END;
$$;
