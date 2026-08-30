-- ========================================
-- Script de Teste: Inserir Usuário com Dados de Exemplo
-- ========================================
-- Este script cria categorias e transações de exemplo para um usuário de teste.
--
-- ⚠️ IMPORTANTE:
-- 1. Primeiro, crie um usuário no Supabase Auth (Authentication > Users)
--    ou use um user_id existente
-- 2. Substitua 'SEU_USER_ID_AQUI' pelo UUID do usuário real
-- 3. Rode este script no SQL Editor do seu projeto Supabase
--
-- Exemplo de UUID real: 550e8400-e29b-41d4-a716-446655440000

-- ========================================
-- Variável: USER_ID (substitua pelo seu)
-- ========================================
-- Descomente a linha abaixo e substitua pelo seu UUID real:
\set user_id 'SEU_USER_ID_AQUI'

-- ========================================
-- Inserir Categorias Padrão
-- ========================================
insert into categorias (user_id, nome, tipo, cor) values
  (:'user_id', 'Salário',        'receita', '#3A6B52'),
  (:'user_id', 'Freelas',        'receita', '#6B8E6C'),
  (:'user_id', 'Moradia',        'despesa', '#B14A2E'),
  (:'user_id', 'Alimentação',    'despesa', '#C77A44'),
  (:'user_id', 'Transporte',     'despesa', '#A67C1E'),
  (:'user_id', 'Lazer',          'despesa', '#8A6F9E'),
  (:'user_id', 'Outros',         'despesa', '#7A7166')
on conflict do nothing;

-- ========================================
-- Inserir Transações de Exemplo (Agosto 2026)
-- ========================================
insert into transacoes (user_id, categoria_id, descricao, valor, tipo, data)
select
  :'user_id'::uuid as user_id,
  c.id as categoria_id,
  t.descricao,
  t.valor,
  t.tipo,
  t.data
from (
  values
    -- Receitas
    ('Salário',           5000.00, 'receita', '2026-08-05'::date),
    ('Freela: design',    1200.00, 'receita', '2026-08-15'::date),
    ('Bônus',              300.00, 'receita', '2026-08-28'::date),

    -- Despesas
    ('Aluguel',           1500.00, 'despesa', '2026-08-01'::date),
    ('Supermercado',       250.00, 'despesa', '2026-08-03'::date),
    ('Ônibus/Uber',       150.00, 'despesa', '2026-08-07'::date),
    ('Cinema',             45.00, 'despesa', '2026-08-12'::date),
    ('Restaurante',       180.00, 'despesa', '2026-08-14'::date),
    ('Conta de luz',      120.00, 'despesa', '2026-08-20'::date),
    ('Supermercado',       300.00, 'despesa', '2026-08-22'::date),
    ('Presente amigo',     80.00, 'despesa', '2026-08-25'::date),
    ('Netflix',            54.90, 'despesa', '2026-08-26'::date)
) as t(nome_cat, valor, tipo, data)
join categorias c on c.user_id = :'user_id'::uuid and c.nome = t.nome_cat
where not exists (
  select 1 from transacoes tx
  where tx.user_id = :'user_id'::uuid
  and tx.data = t.data
  and tx.descricao = t.descricao
);

-- ========================================
-- Verificar Dados Inseridos
-- ========================================
-- Descomente as queries abaixo para verificar os dados inseridos:

-- SELECT 'Categorias Inseridas' as info;
-- SELECT * FROM categorias WHERE user_id = :'user_id'::uuid;

-- SELECT 'Transações Inseridas' as info;
-- SELECT t.*, c.nome as categoria_nome
-- FROM transacoes t
-- LEFT JOIN categorias c ON t.categoria_id = c.id
-- WHERE t.user_id = :'user_id'::uuid
-- ORDER BY t.data DESC;

-- SELECT 'Sumário Financeiro - Agosto 2026' as info;
-- SELECT
--   SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END)::numeric(12,2) as total_receitas,
--   SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END)::numeric(12,2) as total_despesas,
--   (SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END) -
--    SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END))::numeric(12,2) as saldo
-- FROM transacoes
-- WHERE user_id = :'user_id'::uuid;

-- ========================================
-- Notas
-- ========================================
-- - As transações são de agosto de 2026 para testes
-- - Você pode alterar as datas, valores e descrições conforme necessário
-- - Se precisar limpar os dados, use:
--   DELETE FROM transacoes WHERE user_id = 'SEU_USER_ID_AQUI';
--   DELETE FROM categorias WHERE user_id = 'SEU_USER_ID_AQUI';
