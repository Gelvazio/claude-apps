# Módulo Configurações — Referência de Desenvolvimento

> Gerencia usuários, permissões, telas e regras de negócio do sistema ERP.

---

## 1. Usuários (`usuarios.html`)

Gerenciamento de usuários e permissões de acesso ao sistema.

### Campos

| Campo | Tipo | Regras |
|-------|------|--------|
| Nome Completo | Texto | **Obrigatório** — não editável após criação |
| E-mail | E-mail | **Obrigatório** — login do sistema; não editável |
| Cargo | Texto | Cargo na empresa |
| Telefone | Texto | Máscara de telefone |
| Perfil | Select | **Obrigatório**: Administrador ou Usuário |
| Status | Toggle | Ativo / Inativo |
| Permissões | Checkboxes | Visão Geral, Cadastros, Compras, Estoque, Vendas e Logística |

### Regras de Negócio
- **Administrador**: acesso total a todos os módulos e Configurações; pode gerenciar usuários.
- **Usuário**: acesso apenas aos módulos com permissão marcada; não acessa Configurações.
- Usuário inativo não consegue fazer login.
- Deve haver ao menos **um Administrador ativo** no sistema em todo momento.
- Convite enviado por e-mail; usuário define senha no primeiro acesso.

### Tabela Supabase
```sql
CREATE TABLE erp_usuarios (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome        text NOT NULL,
  email       text UNIQUE NOT NULL,
  cargo       text,
  telefone    text,
  perfil      text NOT NULL CHECK (perfil IN ('Administrador','Usuário')),
  senha_hash  text NOT NULL,
  status      boolean DEFAULT true,
  permissoes  jsonb DEFAULT '{"visao_geral":true,"cadastros":false,"compras":false,"estoque":false,"vendas":false}'::jsonb,
  created_at  timestamptz DEFAULT now()
);
```

---

## 2. Perfis (`perfis.html`)

Configuração dos perfis de acesso e telas disponíveis por sistema/módulo.

### Funcionalidade
- Lista todos os sistemas (módulos) cadastrados em `sistema`.
- Para cada sistema, exibe as telas vinculadas em `tela_sistema`.
- Permite ativar/desativar telas por perfil.
- Filtro por sistema (módulo).
- Accordion sidebar com links de todos os módulos.

### Tabelas Supabase
```sql
-- Sistemas (módulos)
CREATE TABLE sistema (
  siscodigo integer PRIMARY KEY,
  sisnome   text NOT NULL,
  sisativo  integer DEFAULT 1,
  sisordem  integer
);

-- Telas
CREATE TABLE tela (
  id       uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome     text NOT NULL,
  nome_html text NOT NULL,
  ativo    integer DEFAULT 1
);

-- Vínculo tela × sistema
CREATE TABLE tela_sistema (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tela_id    uuid REFERENCES tela(id),
  sistema_id integer REFERENCES sistema(siscodigo),
  ativo      integer DEFAULT 1
);
```

---

## 3. Telas (`telas.html`)

CRUD de telas do sistema.

### Campos

| Campo | Tipo | Regras |
|-------|------|--------|
| Nome | Texto | **Obrigatório** — nome exibido no menu |
| Arquivo HTML | Texto | **Obrigatório** — caminho relativo (ex: `cadastros/clientes.html`) |
| Sistema | Select | Módulo ao qual a tela pertence |
| Ativo | Toggle | Default: Ativo |

### Funcionalidade
- Lista todas as telas cadastradas com nome, arquivo, sistema e status.
- Permite criar, editar e ativar/desativar telas sem excluí-las.

---

## 4. Regras de Negócio (`regras-negocios.html`)

Configuração de regras e parâmetros globais do sistema.

### Campos

| Campo | Tipo | Regras |
|-------|------|--------|
| Nome da Regra | Texto | **Obrigatório** |
| Módulo | Select | Módulo ao qual a regra pertence |
| Tipo | Select | Validação, Alerta, Automação, Permissão |
| Valor / Parâmetro | Texto | Configuração específica da regra |
| Ativo | Toggle | Regra habilitada/desabilitada |
| Descrição | Textarea | Explicação da regra |

### Exemplos de Regras
- Estoque mínimo: alerta quando produto abaixo do limite.
- Prazo de pagamento padrão: dias para vencimento de contas.
- Limite de crédito por cliente.
- Aprovação obrigatória para pedidos acima de R$ X.

---

## SUPABASE.js — Funções de Configurações

O arquivo `SUPABASE.js` (na raiz) injeta o menu de Configurações automaticamente via `sbInjetarMenuConfiguracoes()`. Apenas Administradores veem o menu.

### Modal "Andamento Alterações"
- Botão "📝 Andamento Alterações" no dropdown de Configurações.
- Chama `sbAbrirAndamento()` — lê todos os `andamento.md` e exibe em modal com abas por módulo.
- Abas: Geral, Cadastros, Compras, Estoque, Vendas, Financeiro, Marketing, Config, Gamificação, RH.

### Autenticação
```js
// Verificação de sessão (em toda tela protegida)
verificarSessao();

// Verificação de perfil Administrador (telas de config)
if (!temPermissao('configuracoes')) {
  window.location.replace('../index.html');
}
```
