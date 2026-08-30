-- ========================================
-- Database Schema for Razão (financas-app)
-- ========================================
-- Run this SQL in your Supabase project SQL editor
-- Project Settings > API: Copy SUPABASE_URL and SUPABASE_ANON_KEY to src/supabase.js

-- ========================================
-- Table: categorias
-- ========================================
-- Stores income/expense categories for each user
-- Default categories are seeded by the app on first login

create table if not exists categorias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  nome text not null,
  tipo text not null check (tipo in ('receita', 'despesa')),
  cor text not null default '#3A6B52',
  created_at timestamptz default now()
);

-- ========================================
-- Table: transacoes
-- ========================================
-- Stores all financial transactions (income/expense)

create table if not exists transacoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  categoria_id uuid references categorias on delete set null,
  descricao text not null,
  valor numeric(12,2) not null,
  tipo text not null check (tipo in ('receita', 'despesa')),
  data date not null default current_date,
  created_at timestamptz default now()
);

-- ========================================
-- Row Level Security (RLS) Policies
-- ========================================
-- Enable RLS on both tables

alter table categorias enable row level security;
alter table transacoes enable row level security;

-- ========================================
-- RLS Policies for categorias table
-- ========================================
-- Users can only see their own categories

create policy "usuarios veem suas categorias" on categorias
  for select using (auth.uid() = user_id);

create policy "usuarios inserem suas categorias" on categorias
  for insert with check (auth.uid() = user_id);

create policy "usuarios atualizam suas categorias" on categorias
  for update using (auth.uid() = user_id);

create policy "usuarios deletam suas categorias" on categorias
  for delete using (auth.uid() = user_id);

-- ========================================
-- RLS Policies for transacoes table
-- ========================================
-- Users can only see their own transactions

create policy "usuarios veem suas transacoes" on transacoes
  for select using (auth.uid() = user_id);

create policy "usuarios inserem suas transacoes" on transacoes
  for insert with check (auth.uid() = user_id);

create policy "usuarios atualizam suas transacoes" on transacoes
  for update using (auth.uid() = user_id);

create policy "usuarios deletam suas transacoes" on transacoes
  for delete using (auth.uid() = user_id);

-- ========================================
-- Default Categories (inserted by app)
-- ========================================
-- The application seeds these automatically on first login
-- No need to insert manually

-- {
--   nome: 'Salário',        tipo: 'receita', cor: '#3A6B52'
--   nome: 'Freelas',        tipo: 'receita', cor: '#6B8E6C'
--   nome: 'Moradia',        tipo: 'despesa', cor: '#B14A2E'
--   nome: 'Alimentação',    tipo: 'despesa', cor: '#C77A44'
--   nome: 'Transporte',     tipo: 'despesa', cor: '#A67C1E'
--   nome: 'Lazer',          tipo: 'despesa', cor: '#8A6F9E'
--   nome: 'Outros',         tipo: 'despesa', cor: '#7A7166'
-- }
