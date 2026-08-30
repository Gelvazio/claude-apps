# Razão — controle financeiro pessoal

Vanilla JS + Vite + Supabase, no mesmo padrão do portfólio `gestao-microaas`.

## Setup

1. Crie um projeto em https://supabase.com (grátis).
2. No editor SQL do projeto, rode o conteúdo de `supabase-schema.sql`.
3. Em Project Settings > API, copie a **Project URL** e a **anon public key**.
4. Cole em `src/supabase.js`:
   ```js
   const SUPABASE_URL = 'https://SEU-PROJETO.supabase.co'
   const SUPABASE_ANON_KEY = 'SUA_ANON_KEY_AQUI'
   ```
5. Em Authentication > Providers, confirme que "Email" está habilitado.
   (Opcional: desative "Confirm email" em Authentication > Settings para testar mais rápido — sem isso, o usuário precisa confirmar o cadastro por e-mail antes de logar.)

## Rodar localmente

```bash
npm install
npm run dev
```

## Deploy (Vercel)

```bash
npm run build
```
Suba a pasta com `vercel` ou conecte o repo — é estático, sem backend próprio (tudo via Supabase).

## O que tem

- Login/cadastro por e-mail e senha (Supabase Auth)
- Categorias padrão criadas automaticamente no primeiro acesso (receita/despesa)
- Lançamentos por mês, navegação entre meses
- Saldo, total de receitas e despesas do mês
- Gráfico de barras dos últimos 6 meses (receita x despesa)
- Exclusão de lançamentos
- RLS no Supabase: cada usuário só vê seus próprios dados

## Próximos passos possíveis

- Editar lançamento (hoje só cria/exclui)
- Gerenciar categorias pela UI (hoje só via seed padrão)
- Exportar CSV / relatório mensal
- Metas de orçamento por categoria
