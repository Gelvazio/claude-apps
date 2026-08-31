# Destacar Fornecedor Obrigatório

**Objetivo:** Alertar e destacar visualmente o fornecedor quando uma solicitação for finalizada sem essa informação.

**Tech Stack:** HTML, CSS e JavaScript.

## Status Geral

| Passo | Descrição | Status |
|---|---|---|
| 1 | Manter estados disponíveis | ✅ Concluído |
| 2 | Impedir gravação sem fornecedor | ✅ Concluído |
| 3 | Destacar campo em vermelho | ✅ Concluído |
| 4 | Remover destaque após seleção | ✅ Concluído |
| 5 | Commit, push e Graphify | ✅ Concluído |

### Passo 1: Estados

**Status:** ✅ Concluído

**Arquivo:** Modificar `compras/solicitacoes.html`.

**Ação:** Preservar as opções `Aprovada` e `Concluída` no campo de status.

**Verificação prevista:** revisão estática; testes são proibidos pelas regras do projeto.

### Passo 2: Alerta e bloqueio da gravação

**Status:** ✅ Concluído

**Arquivo:** Modificar `compras/solicitacoes.html`.

**Ação:** Exibir mensagem e interromper a gravação quando o fornecedor não estiver preenchido.

**Verificação prevista:** revisão estática; testes são proibidos pelas regras do projeto.

### Passo 3: Destaque visual

**Status:** ✅ Concluído

**Arquivo:** Modificar `compras/solicitacoes.html`.

**Ação:** Aplicar borda e foco vermelhos ao combobox inválido e limpar o destaque após seleção.

**Verificação prevista:** revisão estática; testes são proibidos pelas regras do projeto.

### Passo 4: Publicação

**Status:** ✅ Concluído

**Ação:** Criar commit, enviar para `origin/main` e atualizar o Graphify.
