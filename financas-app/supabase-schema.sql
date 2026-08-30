-- Schema para o app de Controle Financeiro Pessoal
-- Rode este SQL no editor SQL do seu projeto Supabase

create table if not exists categorias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  nome text not null,
  tipo text not null check (tipo in ('receita', 'despesa')),
  cor text not null default '#3A6B52',
  created_at timestamptz default now()
);

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

alter table categorias enable row level security;
alter table transacoes enable row level security;

create policy "usuarios veem suas categorias" on categorias
  for select using (auth.uid() = user_id);
create policy "usuarios inserem suas categorias" on categorias
  for insert with check (auth.uid() = user_id);
create policy "usuarios atualizam suas categorias" on categorias
  for update using (auth.uid() = user_id);
create policy "usuarios deletam suas categorias" on categorias
  for delete using (auth.uid() = user_id);

create policy "usuarios veem suas transacoes" on transacoes
  for select using (auth.uid() = user_id);
create policy "usuarios inserem suas transacoes" on transacoes
  for insert with check (auth.uid() = user_id);
create policy "usuarios atualizam suas transacoes" on transacoes
  for update using (auth.uid() = user_id);
create policy "usuarios deletam suas transacoes" on transacoes
  for delete using (auth.uid() = user_id);

-- Categorias padrão inseridas automaticamente no primeiro login (via app)
