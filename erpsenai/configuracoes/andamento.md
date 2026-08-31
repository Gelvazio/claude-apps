# Andamento — Módulo Configurações

> Gerenciamento de usuários, perfis, telas e regras. Atualizado em: 2026-08-16

---

## Telas

| Tela | Arquivo | Status |
|------|---------|--------|
| Usuários | `configuracoes/usuarios.html` | ✅ Concluído |
| Perfis | `configuracoes/perfis.html` | ✅ Concluído |
| Telas | `configuracoes/telas.html` | ✅ Concluído |
| Regras de Negócio | `configuracoes/regras-negocios.html` | ✅ Concluído |

---

## Banco de Dados (Supabase)

| Tabela | Status |
|--------|--------|
| `erp_usuarios` | ✅ Criada |
| `sistema` | ✅ Criada |
| `tela` | ✅ Criada |
| `tela_sistema` | ✅ Criada |

---

## Infraestrutura Global (SUPABASE.js)

| Funcionalidade | Status |
|----------------|--------|
| Autenticação (login/sessão) | ✅ Concluído |
| Sidebar dinâmica por módulo | ✅ Concluído |
| Tema claro/escuro | ✅ Concluído |
| Dropdown ⚙️ Configurações (só Admin) | ✅ Concluído |
| Modal Andamento Alterações | ✅ Concluído |
| Parser Markdown inline | ✅ Concluído |
| CRUD genérico (listar, inserir, atualizar, excluir) | ✅ Concluído |
| Numeração automática sequencial | ✅ Concluído |
| `_sbRootPath()` para resolução de caminhos | ✅ Concluído |

---

## Observações

- Telas existem e renderizam corretamente.
- O arquivo `SUPABASE.js` centraliza autenticação, sidebar e o menu de Configurações para todas as demais telas do sistema.
- A tabela `erp_usuarios` precisa ser criada no Supabase junto com as demais para que o login funcione com dados reais.
