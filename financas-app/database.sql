-- ========================================
-- Razão (financas-app) — Database Schema
-- ========================================
-- Complete SQL script for Supabase project setup
-- Run this in your Supabase SQL Editor (Project > SQL Editor)
--
-- Steps:
-- 1. Create Supabase project at https://supabase.com
-- 2. Copy this entire script to SQL Editor and execute
-- 3. Copy SUPABASE_URL and SUPABASE_ANON_KEY to src/supabase.js
-- 4. (Optional) Run the test data section below with your user UUID

-- ========================================
-- Section 0: CREATE SCHEMA
-- ========================================

create schema if not exists fin;

-- ========================================
-- Section 1: CREATE TABLES
-- ========================================

-- ========================================
-- Table: fin.categorias
-- ========================================
-- Stores income/expense categories for each user
-- Default categories are seeded by the app on first login

create table if not exists fin.categorias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  nome text not null,
  tipo text not null check (tipo in ('receita', 'despesa')),
  cor text not null default '#3A6B52',
  created_at timestamptz default now()
);

-- ========================================
-- Table: fin.transacoes
-- ========================================
-- Stores all financial transactions (income/expense)

create table if not exists fin.transacoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  categoria_id uuid references fin.categorias on delete set null,
  descricao text not null,
  valor numeric(12,2) not null,
  tipo text not null check (tipo in ('receita', 'despesa')),
  data date not null default current_date,
  created_at timestamptz default now()
);

-- ========================================
-- Section 2: ENABLE ROW LEVEL SECURITY (RLS)
-- ========================================

alter table fin.categorias enable row level security;
alter table fin.transacoes enable row level security;

-- ========================================
-- Section 3: RLS POLICIES
-- ========================================

-- ========================================
-- RLS Policies for fin.categorias table
-- ========================================
-- Users can only see/modify their own categories

create policy "usuarios veem suas categorias" on fin.categorias
  for select using (auth.uid() = user_id);

create policy "usuarios inserem suas categorias" on fin.categorias
  for insert with check (auth.uid() = user_id);

create policy "usuarios atualizam suas categorias" on fin.categorias
  for update using (auth.uid() = user_id);

create policy "usuarios deletam suas categorias" on fin.categorias
  for delete using (auth.uid() = user_id);

-- ========================================
-- RLS Policies for fin.transacoes table
-- ========================================
-- Users can only see/modify their own transactions

create policy "usuarios veem suas transacoes" on fin.transacoes
  for select using (auth.uid() = user_id);

create policy "usuarios inserem suas transacoes" on fin.transacoes
  for insert with check (auth.uid() = user_id);

create policy "usuarios atualizam suas transacoes" on fin.transacoes
  for update using (auth.uid() = user_id);

create policy "usuarios deletam suas transacoes" on fin.transacoes
  for delete using (auth.uid() = user_id);

-- ========================================
-- Section 4: TEST DATA (OPTIONAL)
-- ========================================
-- Uncomment and modify the section below to insert test data
-- ⚠️ IMPORTANT: Replace 'SEU_USER_ID_AQUI' with your actual user UUID
--
-- To find your user UUID:
-- 1. Go to Authentication > Users in Supabase
-- 2. Click on a user and copy the UUID
--
-- Example UUID: 550e8400-e29b-41d4-a716-446655440000

/*
-- Step 1: Define your user ID variable
\set user_id 'SEU_USER_ID_AQUI'

-- Step 2: Insert default categories
insert into fin.categorias (user_id, nome, tipo, cor) values
  (:'user_id', 'Salário',        'receita', '#3A6B52'),
  (:'user_id', 'Freelas',        'receita', '#6B8E6C'),
  (:'user_id', 'Moradia',        'despesa', '#B14A2E'),
  (:'user_id', 'Alimentação',    'despesa', '#C77A44'),
  (:'user_id', 'Transporte',     'despesa', '#A67C1E'),
  (:'user_id', 'Lazer',          'despesa', '#8A6F9E'),
  (:'user_id', 'Outros',         'despesa', '#7A7166')
on conflict do nothing;

-- Step 3: Insert sample transactions for August 2026
insert into fin.transacoes (user_id, categoria_id, descricao, valor, tipo, data)
select
  :'user_id'::uuid as user_id,
  c.id as categoria_id,
  t.descricao,
  t.valor,
  t.tipo,
  t.data
from (
  values
    -- Income
    ('Salário',           5000.00, 'receita', '2026-08-05'::date),
    ('Freela: design',    1200.00, 'receita', '2026-08-15'::date),
    ('Bônus',              300.00, 'receita', '2026-08-28'::date),

    -- Expenses
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
join fin.categorias c on c.user_id = :'user_id'::uuid and c.nome = t.nome_cat
where not exists (
  select 1 from fin.transacoes tx
  where tx.user_id = :'user_id'::uuid
  and tx.data = t.data
  and tx.descricao = t.descricao
);
*/

-- ========================================
-- OPTIONAL VERIFICATION QUERIES
-- ========================================
-- Uncomment to verify data after insertion:

/*
SELECT 'Categorias' as section;
SELECT * FROM fin.categorias WHERE user_id = 'SEU_USER_ID_AQUI'::uuid;

SELECT 'Transações' as section;
SELECT t.*, c.nome as categoria_nome
FROM fin.transacoes t
LEFT JOIN fin.categorias c ON t.categoria_id = c.id
WHERE t.user_id = 'SEU_USER_ID_AQUI'::uuid
ORDER BY t.data DESC;

SELECT 'Sumário Financeiro - Agosto 2026' as section;
SELECT
  SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END)::numeric(12,2) as total_receitas,
  SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END)::numeric(12,2) as total_despesas,
  (SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END) -
   SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END))::numeric(12,2) as saldo
FROM fin.transacoes
WHERE user_id = 'SEU_USER_ID_AQUI'::uuid;
*/

-- ========================================
-- CLEANUP (if needed)
-- ========================================
-- To delete all data for a specific user, run:
-- DELETE FROM fin.transacoes WHERE user_id = 'SEU_USER_ID_AQUI'::uuid;
-- DELETE FROM fin.categorias WHERE user_id = 'SEU_USER_ID_AQUI'::uuid;
