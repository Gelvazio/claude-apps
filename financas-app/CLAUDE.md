# Razão — Documentação Técnica

## Visão Geral

**Razão** é um aplicativo de controle financeiro pessoal que permite ao usuário registrar, visualizar e analisar receitas e despesas mensalmente. A aplicação é construída com **Vanilla JavaScript**, **Vite** e **Supabase**, sem backend próprio.

**URL do projeto**: https://supabase.com (grátis)  
**Padrão base**: Mesmo do portfólio `gestao-microaas`

---

## Stack Técnico

- **Frontend**: Vanilla JavaScript (ES6+ modules)
- **Bundler**: Vite 8.2.2
- **Backend/Auth**: Supabase (PostgreSQL + Auth)
- **Banco de dados**: PostgreSQL (via Supabase)
- **Estilos**: CSS nativo (Google Fonts: Fraunces, Inter, IBM Plex Mono)
- **Gráficos**: Canvas 2D nativo
- **Segurança**: Row Level Security (RLS) no Supabase

---

## Arquitetura

```
financas-app/
├── index.html              # Entry point HTML
├── package.json            # Dependências (Vite, Supabase)
├── vite.config.js (implied) # Config Vite padrão
├── supabase-schema.sql     # Schema do banco + RLS policies
├── .env                    # Variáveis de ambiente (ignorado no git)
├── .gitignore              # Arquivo ignore padrão Vite
├── src/
│   ├── main.js            # Lógica principal (state, rendering, handlers)
│   ├── supabase.js        # Cliente Supabase (credenciais)
│   └── style.css          # Estilos CSS
├── public/
│   ├── livro.svg          # Ícone (favicon)
│   ├── icons.svg          # Ícones SVG
│   └── favicon.svg        # Favicon alternativo
└── README.md              # Setup e deploy
```

---

## State (Estado da Aplicação)

```javascript
const state = {
  session: null,        // Sessão do usuário autenticado (Supabase Auth)
  transacoes: [],       // Array de transações do mês atual
  categorias: [],       // Array de categorias do usuário
  refDate: new Date(),  // Data de referência (mês visualizado)
  authMode: 'login',    // 'login' ou 'signup'
}
```

### Fluxo de State

1. **Inicialização** → `boot()` verifica sessão existente
2. **Auth** → `renderAuth()` mostra login/signup
3. **Autenticado** → `loadData()` busca categorias e transações do mês
4. **Renderização** → `renderApp()` desenha dashboard
5. **Interação** → Usuário cria/deleta transações ou muda mês

---

## Fluxo de Dados

### 1. Autenticação

```
User Input (email/password)
    ↓
supabase.auth.signUp() ou signInWithPassword()
    ↓
Credenciais validadas
    ↓
Session criada (JWT token)
    ↓
boot() → loadData() → renderApp()
```

**Handlers**:
- `renderAuth()` → Desenha form de login/signup
- `traduzErro()` → Traduz mensagens de erro para português

### 2. Carregamento de Dados

```
boot()
  ↓
loadData()
  ├─ Busca categorias do usuário
  ├─ Busca transações do mês (monthBounds)
  ├─ Se sem categorias, insere DEFAULT_CATS
  └─ Atualiza state.categorias e state.transacoes
```

**Queries importantes**:
```javascript
// Categorias
supabase.from('categorias').select('*').order('nome')

// Transações (mês + relação com categorias)
supabase
  .from('transacoes')
  .select('*, categorias(nome, cor)')
  .gte('data', start)    // Data >= início do mês
  .lte('data', end)      // Data <= fim do mês
  .order('data', { ascending: false })
```

### 3. Navegação de Mês

```
User clica ← ou →
    ↓
changeMonth(delta)
    ↓
state.refDate atualizada
    ↓
loadData()
    ↓
renderApp()
```

### 4. Criação de Transação

```
User clica "+ Receita" ou "+ Despesa"
    ↓
openModal(tipo)
    ├─ Modal renderizado com form
    ├─ Campos: descrição, valor, categoria, data
    └─ Gera select com categorias filtradas por tipo
    ↓
User submeta form
    ↓
supabase.from('transacoes').insert({...})
    ↓
loadData() + renderApp()
```

### 5. Exclusão de Transação

```
User clica × (delete button)
    ↓
deleteTx(id)
    ↓
supabase.from('transacoes').delete().eq('id', id)
    ↓
loadData() + renderApp()
```

---

## Cálculos e Formatação

### Cálculo de Saldo

```javascript
receitas = sum(transacoes com tipo='receita')
despesas = sum(transacoes com tipo='despesa')
saldo = receitas - despesas
```

### Formatação de Moeda

```javascript
const fmt = (n) => n.toLocaleString('pt-BR', {
  style: 'currency',
  currency: 'BRL'
})
// Resultado: R$ 1.234,56
```

### Limites de Mês

```javascript
function monthBounds(d) {
  const start = new Date(d.getFullYear(), d.getMonth(), 1)      // 1º do mês
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0)    // Último do mês
  return { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }
}
```

---

## Gráfico (últimos 6 meses)

```javascript
drawChart(receitasMesAtual, despesasMesAtual)
  ├─ Busca 6 meses de transações (sem filtro de usuário aqui — ⚠️ bug?)
  ├─ Agrupa por mês: receita vs despesa
  ├─ Encontra valor máximo para escala
  └─ Desenha barras lado-a-lado no Canvas
```

**Cores**:
- Receita: `#3A6B52` (verde)
- Despesa: `#B14A2E` (vermelho-marrom)

**Características**:
- Responsivo (width = largura do container)
- DPR-aware (device pixel ratio para telas retina)
- Font: IBM Plex Mono 10px
- Altura fixa: 90px

---

## Banco de Dados (Supabase)

### Tabela: `categorias`

```sql
id (UUID, PK)
user_id (UUID, FK → auth.users)
nome (text)
tipo (text: 'receita' | 'despesa')
cor (text: hex color, default '#3A6B52')
created_at (timestamptz, auto)
```

**RLS Policies**: Usuário vê/insere/atualiza/deleta apenas suas categorias.

### Tabela: `transacoes`

```sql
id (UUID, PK)
user_id (UUID, FK → auth.users)
categoria_id (UUID, FK → categorias, nullable)
descricao (text)
valor (numeric 12,2)
tipo (text: 'receita' | 'despesa')
data (date)
created_at (timestamptz, auto)
```

**RLS Policies**: Usuário vê/insere/atualiza/deleta apenas suas transações.

### Categorias Padrão (Seed no app)

Inseridas automaticamente no primeiro acesso:

```javascript
[
  { nome: 'Salário', tipo: 'receita', cor: '#3A6B52' },
  { nome: 'Freelas', tipo: 'receita', cor: '#6B8E6C' },
  { nome: 'Moradia', tipo: 'despesa', cor: '#B14A2E' },
  { nome: 'Alimentação', tipo: 'despesa', cor: '#C77A44' },
  { nome: 'Transporte', tipo: 'despesa', cor: '#A67C1E' },
  { nome: 'Lazer', tipo: 'despesa', cor: '#8A6F9E' },
  { nome: 'Outros', tipo: 'despesa', cor: '#7A7166' },
]
```

---

## Componentes Visuais

### Telas Principais

1. **Auth Screen** (`renderAuth()`)
   - Logo + marca "Razão"
   - Form: email + senha
   - Toggle entre login/signup
   - Mensagens de erro traduzidas

2. **Main App** (`renderApp()`)
   - Header: marca + botão "sair"
   - Month Nav: ← [mês · ano] →
   - Balance Hero: saldo + receitas/despesas
   - Chart: Canvas com gráfico 6 meses
   - Add Bar: botões "+ Receita" e "+ Despesa"
   - Ledger List: tabela de transações do mês

3. **Modal** (`openModal(tipo)`)
   - Form para nova transação
   - Campos: descrição, valor, categoria, data
   - Botões: Cancelar, Salvar
   - Backdrop (fechar ao clicar fora)

### CSS Classes Principais

- `.auth-screen` — Tela de autenticação
- `.ledger-header` — Header com marca e logout
- `.month-nav` — Navegação de mês
- `.balance-hero` — Seção de saldo
- `.chart-wrap` → `<canvas>` — Gráfico
- `.add-bar` — Botões de adicionar
- `.ledger-list` → `.ledger-row` — Linhas de transação
- `.modal-backdrop` + `.modal` — Modal overlay
- `.btn-primary` `.btn-cancel` `.btn-save` `.btn-add-receita` `.btn-add-despesa` `.del` — Botões

---

## Setup e Configuração

### 1. Criar Projeto Supabase

- Acesse https://supabase.com
- Crie um projeto gratuito
- No SQL Editor, rode `supabase-schema.sql`

### 2. Configurar Credenciais

Em `src/supabase.js`:

```javascript
const SUPABASE_URL = 'https://SEU-PROJETO.supabase.co'
const SUPABASE_ANON_KEY = 'SUA_ANON_KEY_AQUI'
```

Copie de: **Project Settings > API**

### 3. Habilitar Email Auth

**Authentication > Providers**: certifique-se que "Email" está ✓  
Opcional: Desative "Confirm email" em **Authentication > Settings** para testar sem verificação por e-mail.

### 4. Instalar e Rodar

```bash
npm install
npm run dev
```

Acessa `http://localhost:5173` (Vite default)

---

## Deploy (Vercel)

```bash
npm run build
```

Suba a pasta `dist/` para Vercel ou conecte o repositório — é estático, sem servidor backend.

---

## Fluxos Principais

### Novo Usuário (Signup + Primeiro Acesso)

1. Abre app
2. Clica "Criar conta"
3. Insere e-mail e senha
4. Verifica e-mail (se ativado)
5. Faz login
6. Primeira carga: `loadData()` detecta 0 categorias
7. Insere DEFAULT_CATS automaticamente
8. Dashboard vazio com categorias prontas
9. Clica "+ Receita" e começa a registrar

### Usuário Existente

1. Abre app
2. `getSession()` encontra sessão ativa
3. `boot()` → `loadData()` → carrega mês atual
4. Dashboard mostra transações do mês

### Navegação Mensal

1. Clica ← ou →
2. `changeMonth()` atualiza `refDate`
3. `loadData()` busca novo intervalo de datas
4. `renderApp()` redesenha com dados novos

### Gráfico de 6 Meses

- Renderizado toda vez que `renderApp()` executa
- Busca todas as transações dos últimos 6 meses (sem filtro RLS visível — usa a sessão)
- Agrupa por tipo e mês
- Desenha barras lado-a-lado

---

## Segurança (RLS)

Cada tabela tem **4 policies** (select, insert, update, delete):

```sql
... using (auth.uid() = user_id)
... with check (auth.uid() = user_id)
```

**Garantia**: Usuário só acessa dados onde `user_id` = seu ID.

---

## Funções Utilitárias

- `fmt(n)` — Formata número em BRL
- `monthBounds(d)` — Retorna início/fim do mês em ISO string
- `escapeHtml(str)` — Previne XSS (escapa HTML em descrições)
- `traduzErro(msg)` — Traduz mensagens de erro do Supabase

---

## Próximos Passos (Roadmap)

- ✅ Login/signup
- ✅ Categorias padrão
- ✅ Lançar receita/despesa
- ✅ Excluir lançamento
- ✅ Gráfico 6 meses
- ❌ **Editar lançamento** (hoje só cria/exclui)
- ❌ **Gerenciar categorias pela UI** (hoje só seed padrão)
- ❌ **Exportar CSV / relatório**
- ❌ **Metas de orçamento**
- ❌ **Busca/filtro** de transações
- ❌ **Tags/notas** em transações
- ❌ **Recorrência** (transações automáticas)

---

## Possíveis Bugs / Melhorias

1. **Gráfico**: Quando busca 6 meses, pode estar retornando dados de outros usuários (RLS deveria filtrar, mas checar query)
2. **Modal**: Não há validação de valor negativo no front (confiar em `min="0.01"` do input?)
3. **UX**: Sem feedback visual enquanto aguarda response do Supabase
4. **Acessibilidade**: Faltam `aria-label` e contraste de cores em alguns elementos
5. **Responsivo**: Testado em mobile? Canvas e layout podem quebrar em telas pequenas

---

## Arquivo `.env`

Exemplo (nunca commitar credenciais reais):

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

**Nota**: Hoje as credenciais estão hardcoded em `src/supabase.js`. Considere mover para `.env` + `import.meta.env` no Vite.

---

## Links Úteis

- [Documentação Supabase](https://supabase.com/docs)
- [Autenticação Supabase](https://supabase.com/docs/guides/auth)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
- [Vite](https://vitejs.dev/)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)

---

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview build local
npm run preview

# Executar graphify (atualizar grafo de conhecimento)
C:\Python314\python.exe -m graphify update .
```

---

**Última atualização**: 2026-08-30  
**Autor**: Razão Team
