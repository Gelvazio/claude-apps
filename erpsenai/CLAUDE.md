# ERP Senai — Orientações de Desenvolvimento

> Documento de referência para o desenvolvimento do sistema ERP. Leia integralmente antes de implementar qualquer módulo.

---

## Commit, Push e Graphify

⚠️ **APÓS QUALQUER ALTERAÇÃO DE ARQUIVO, executar imediatamente e automaticamente, sem perguntar:**

1. Adicionar ao Git os arquivos alterados da tarefa.
2. Criar um commit com mensagem descritiva.
3. Executar `git push origin main`.
4. Atualizar o Graphify.

Comando obrigatório do Graphify após cada commit:

```yaml
C:\Python314\python.exe -m graphify update .
```

⚠️ **NUNCA perguntar se deve fazer commit, executar o Graphify ou dar push — realizar todo o fluxo diretamente, sem confirmar e sem perguntar.**

---

## Permissões de Acesso

> ⚠️ **REGRA DE NEGÓCIO CRÍTICA — respeitar em qualquer alteração de autenticação, sidebar ou menu.**

### Como funciona

1. **No login** (`sbLogin` em `SUPABASE.js`):
   - Após autenticar o usuário, busca o **perfil** (`perfil` table) pelo `perfil_id` do usuário.
   - Busca as **telas permitidas** desse perfil (`perfil_sistema` → `tela` tables).
   - Salva a lista de telas em `localStorage.setItem('erp_telas', JSON.stringify(telas))`.
   - Todo usuário, inclusive Administrador, recebe somente as telas ativas vinculadas ao seu `perfil_id` em `perfil_sistema`.
   - Se o usuário não tiver `perfil_id`, o perfil não existir ou alguma consulta de autorização falhar, o login deve falhar sem criar uma sessão parcial.
   - `SUPABASE.js` **não mostra, esconde ou filtra links da sidebar**; sua responsabilidade termina ao gravar os dados da sessão.

2. **Na sidebar** (`menu.js`):
   - Lê `erp_telas` do localStorage ao montar o menu.
   - **Somente mostra os links cujas telas estão na lista `erp_telas`** do perfil logado.
   - Se `erp_telas` estiver vazio, ausente ou inválido, não exibe nenhum link.
   - `erp_sistemas` define apenas a ordem preferencial das seções. Códigos ausentes nesse cache devem ser acrescentados à composição para que ele nunca oculte uma tela autorizada por `erp_telas`.
   - A lógica de filtro fica na função `link()` — cada link é `null` se a tela não estiver permitida.
   - O caminho completo de `nome_html` é o formato canônico. Cadastros legados contendo somente o nome do arquivo são aceitos quando não houver colisão; `dashboard.html` exige caminho completo para diferenciar o Dashboard principal do Dashboard de RH.
   - A lista deve ser lida imediatamente antes da montagem do array `html`, no ponto marcado por `VALIDE A REGRA DAS TELAS DO PERFIL, SEMPRE AQUI`.

3. **Regras inegociáveis**:
    - A sidebar **nunca** deve exibir uma tela que não esteja no perfil do usuário logado.
    - As telas exibidas vêm **exclusivamente** de `erp_telas` no localStorage, populado no login.
    - O nome do perfil não adiciona nem remove links; inclusive Configurações depende exclusivamente das telas vinculadas.
   - Qualquer nova tela criada no sistema precisa ser cadastrada em `tela` e vinculada ao perfil via `perfil_sistema` para aparecer no menu.
   - Nunca adicionar links hardcoded que ignorem esse filtro.
   - **Somente `menu.js` pode decidir mostrar ou esconder telas por perfil.** Nenhum HTML de módulo, helper, `SUPABASE.js` ou outro arquivo pode repetir, complementar ou substituir essa validação visual.
   - Não manipular `.sidebar-link` ou `.sidebar-section` depois da montagem para aplicar permissões. Links não autorizados devem nascer como `null` dentro de `link()`.
   - A proteção contra acesso direto por URL pode permanecer em `SUPABASE.js`, desde que não mostre, esconda nem manipule links ou seções da sidebar.

### Tabelas envolvidas

```
erp_usuarios.perfil_id → perfil.id → perfil_sistema.tela_id → tela.nome_html
```

### localStorage keys de sessão

| Key | Conteúdo |
|-----|----------|
| `erp_role` | Nome do perfil (ex: `'Administrador'`) |
| `erp_perfil_id` | ID numérico do perfil |
| `erp_telas` | JSON array das telas permitidas `[{id, nome, nome_html}]` |
| `erp_permissoes` | JSON de permissões por módulo (derivado das telas) |

---

## Administração da senha do usuário padrão

- O arquivo `criar-admin.html` foi removido definitivamente e **não deve ser recriado, utilizado nem referenciado** em novos fluxos.
- A criação inicial dos usuários permanece definida em `REGRAS-NEGOCIOS/seed.sql`.
- Para atualizar a senha do usuário `admin@erp.com` em uma base já existente, execute `UPDATE_SENHA_ADMIN.sql` diretamente no SQL Editor do Supabase.
- Nunca criar uma página pública ou um endpoint no frontend para cadastrar ou redefinir o administrador padrão.
- Nunca armazenar senhas em texto puro no banco de dados; o campo `erp_usuarios.senha_hash` recebe somente o hash SHA-256.

---

## Visão Geral do Sistema

Sistema ERP (Enterprise Resource Planning) voltado para gestão integrada de cadastros, compras, estoque, vendas e logística. O sistema deve ser construído como uma aplicação web moderna, com módulos independentes que se comunicam entre si através de vínculos entre registros (ex: Pedido de Compras vincula a uma Solicitação de Compras).

### Princípios Fundamentais

- Campos marcados com `*` são **obrigatórios** — deve haver validação no frontend e backend.
- Campos com numeração automática (ex: `P00001`, `SC00001`, `PC00001`) são **gerados pelo sistema**, sequenciais, **nunca editáveis** pelo usuário.
- Todo registro deve ter campo de **Observações** livre para anotações.
- O sistema deve manter **rastreabilidade** entre módulos: um Pedido de Venda pode ser rastreado até a Entrega.
- Registros com campo **Ativo/Ativa** permitem desativação sem exclusão (soft delete).

---

## Módulo 1 — CADASTROS

Módulo base do sistema. Todos os demais módulos dependem dos cadastros aqui realizados.

### 1.1 Clientes

Cadastro de clientes pessoa física ou jurídica.

| Campo | Tipo | Regras |
|-------|------|--------|
| Nome / Razão Social | Texto | **Obrigatório** |
| CNPJ / CPF | Texto | Validação de formato CPF (000.000.000-00) ou CNPJ (00.000.000/0001-00) |
| E-mail | E-mail | Validação de formato |
| Telefone | Texto | Máscara de telefone brasileiro |
| Segmento | Select | Tecnologia, Saúde, Varejo, Alimentação, Automobilístico, Metalmecânica, Madeireiro, Serviços, Agricultura, Transporte, Outros |
| Endereço | Texto | — |
| Cidade | Texto | — |
| Estado | Select | 27 UFs brasileiras (sigla) |
| CEP | Texto | Máscara 00000-000; integrar com API ViaCEP para autopreenchimento |
| Ativo | Toggle/Checkbox | Default: Ativo. Inativo oculta o cliente de seleções em outros módulos |

**Regras de negócio:**
- Não permitir CNPJ/CPF duplicado.
- Cliente inativo não deve aparecer em selects de Pedido de Venda, Romaneio, Entrega etc.
- Ao pesquisar por CEP via ViaCEP, preencher automaticamente Endereço, Cidade e Estado.

---

### 1.2 Fornecedores

Cadastro de fornecedores (sempre pessoa jurídica).

| Campo | Tipo | Regras |
|-------|------|--------|
| Nome / Razão Social | Texto | **Obrigatório** |
| CNPJ | Texto | Validação de formato CNPJ |
| Contato | Texto | Nome da pessoa de contato |
| E-mail | E-mail | Validação de formato |
| Telefone | Texto | Máscara de telefone |
| Segmento | Select | Mesmos segmentos de Clientes (exceto Embalagens, Manutenção e Reparos) |
| Endereço | Texto | — |
| Cidade | Texto | — |
| Estado | Select | 27 UFs brasileiras |
| CEP | Texto | Máscara + autopreenchimento via ViaCEP |
| Ativo | Toggle/Checkbox | Default: Ativo |

**Regras de negócio:**
- Não permitir CNPJ duplicado.
- Fornecedor inativo não aparece em selects de Pedido de Compras, Recebimento, Conferência etc.

---

### 1.3 Produtos

Cadastro do catálogo de produtos da empresa.

| Campo | Tipo | Regras |
|-------|------|--------|
| Código | Texto | **Gerado automaticamente** pelo sistema. Formato: `P00001` (sequencial, nunca editável) |
| Nome do Produto | Texto | **Obrigatório** |
| Categoria | Select | Tecnologia, Saúde, Varejo, Alimentação, Automobilístico, Metalmecânica, Madeireiro, Serviços, Agricultura, Transporte, Embalagens, Manutenção e Reparos, Outros |
| Unidade | Select | UN (Unidade), KG (Quilograma), LT (Litro), CX (Caixa), PC (Peça), MT (Metro) |
| Preço de Custo | Número | Formato monetário R$ 1.000,00 (separador de milhar ponto, decimal vírgula) |
| Preço de Venda | Número | Formato monetário R$ 1.000,00 |
| Estoque Atual | Número | Inteiro ou decimal conforme unidade. Atualizado automaticamente por movimentações |
| Estoque Mínimo | Número | Alerta visual quando Estoque Atual ≤ Estoque Mínimo |
| Estoque Máximo | Número | — |
| Imagem do Produto | Upload | Upload de imagem (JPG, PNG). Exibir thumbnail no cadastro e na listagem |
| Descrição | Texto longo | Campo textarea |
| Ativo | Toggle/Checkbox | Default: Ativo |

**Regras de negócio:**
- O código `P00001` é gerado no momento da criação e nunca se repete, mesmo que o produto seja excluído.
- O **Estoque Atual** não é editado manualmente — é calculado automaticamente com base nas movimentações (entradas via Recebimento de Compra; saídas via Pedido de Venda / Expedição).
- Exibir **alerta visual** (badge vermelho ou ícone de aviso) quando `Estoque Atual ≤ Estoque Mínimo`.
- Produto inativo não aparece em selects dos demais módulos.

---

### 1.4 Transportadoras

Cadastro das empresas de transporte utilizadas nas operações de logística.

| Campo | Tipo | Regras |
|-------|------|--------|
| Nome da Transportadora | Texto | **Obrigatório** |
| CNPJ | Texto | Validação de formato CNPJ |
| Tipo de Serviço | Texto/Select | Ex: Rodoviário, Aéreo, Marítimo, Expresso |
| Contato | Texto | Nome do responsável |
| E-mail | E-mail | Validação de formato |
| Telefone | Texto | Máscara de telefone |
| Cidade | Texto | — |
| Estado | Select | 27 UFs brasileiras |
| Ativa | Toggle/Checkbox | Default: Ativa |

**Regras de negócio:**
- Transportadora inativa não aparece em selects de Romaneio, Expedição, Entrega, Nota Fiscal de Venda.

---

## Módulo 2 — COMPRAS

Controla todo o ciclo de compras: do planejamento ao recebimento e entrada de nota fiscal.

### Fluxo do Módulo de Compras

```
Planejamento → Solicitação de Compras → Pedido de Compras → Recebimento → Conferência → Entrada de Nota Fiscal
```

**Transições automáticas obrigatórias:**
- Planejamento `Concluído` gera uma única Solicitação de Compras `Pendente`.
- Solicitação `Aprovada` ou `Concluída` exige fornecedor e gera um único Pedido de Compras `Pendente` já vinculado a ele.
- Pedido `Confirmado` ou `Concluído` gera um único Recebimento `Aguardando`.
- Recebimento efetivado gera uma única Conferência `Pendente`; quando total, também atualiza o Pedido para `Recebido`.
- Somente recebimentos com Conferência `Aprovado` ficam disponíveis para lançamento da Nota Fiscal.
- Cada transição deve consultar o vínculo de origem e reutilizar o registro existente para impedir duplicidade.

### 2.1 Planejamento

Registro do planejamento de compras por período.

| Campo | Tipo | Regras |
|-------|------|--------|
| Título | Texto | **Obrigatório** |
| Tipo | Select/Texto | Ex: Mensal, Trimestral, Anual |
| Produto | Select | Produtos ativos do cadastro |
| Período | Data ou Texto | Mês/Ano ou intervalo de datas |
| Qtd. Planejada | Número | Quantidade prevista |
| Qtd. Realizada | Número | Quantidade efetivamente comprada (atualizada ao longo do período) |
| Status | Select | Ex: Em Planejamento, Em Andamento, Concluído, Cancelado |
| Data | Data | Data do planejamento |
| Observações | Texto longo | — |

---

### 2.2 Solicitação de Compras

Registro formal de necessidade de compra de um produto.

| Campo | Tipo | Regras |
|-------|------|--------|
| Número da Solicitação | Texto | **Gerado automaticamente**. Formato: `SC00001` (sequencial, nunca editável) |
| Produto | Select | **Obrigatório**. Produtos ativos |
| Quantidade | Número | **Obrigatório** |
| Unidade | Texto | Preenchido automaticamente com base no produto selecionado |
| Solicitante | Texto/Select | Nome ou usuário que solicitou |
| Fornecedor | Select | Fornecedor ativo; obrigatório ao aprovar ou concluir a solicitação |
| Prioridade | Select | Baixa, Média, Alta, Urgente |
| Status | Select | Pendente, Em Análise, Aprovada, Concluída, Reprovada, Cancelada |
| Data | Data | Data da solicitação (default: hoje) |
| Observações | Texto longo | — |

---

### 2.3 Pedido de Compras

Formalização da compra junto ao fornecedor, vinculada a uma Solicitação.

| Campo | Tipo | Regras |
|-------|------|--------|
| Número do Pedido | Texto | **Gerado automaticamente**. Formato: `PC00001` (sequencial, nunca editável) |
| Solicitação de Compras | Select | SC vinculada (opcional — pedido pode ser criado sem SC) |
| Fornecedor | Select | Obrigatório ao avançar o pedido; pode ficar vazio enquanto `Pendente` |
| Produto | Select | **Obrigatório**. Produtos ativos |
| Quantidade | Número | **Obrigatório** |
| Preço Unitário | Número | Formato R$ 1.000,00 |
| Valor Total | Número | **Calculado automaticamente**: Quantidade × Preço Unitário |
| Status | Select | Pendente, Rascunho, Enviado, Confirmado, Concluído, Cancelado, Recebido |
| Data | Data | Data do pedido (default: hoje) |
| Data Prevista | Data | Previsão de entrega do fornecedor |
| Observações | Texto longo | — |

**Ação especial:**
- Botão **"Salvar como PDF"** por registro: gera um PDF com todas as informações do pedido formatadas, pronto para envio ao fornecedor. O PDF deve incluir: número do pedido, dados do fornecedor, produto, quantidade, preço unitário, valor total, data, data prevista e observações.

---

### 2.4 Recebimento

Registro da chegada física da mercadoria.

| Campo | Tipo | Regras |
|-------|------|--------|
| Número do Recebimento | Texto | **Obrigatório** (gerado automaticamente, formato `RC00001`) |
| Pedido de Compra | Select | PC vinculado |
| Fornecedor | Select/Texto | Preenchido automaticamente ao selecionar o PC |
| Produto | Select | **Obrigatório** |
| Qtd. Esperada | Número | Preenchida automaticamente com base no PC |
| Qtd. Recebida | Número | Quantidade que chegou fisicamente |
| Status | Select | Aguardando, Recebido Parcial, Recebido Total, Com Divergência |
| Responsável | Select/Texto | Usuário ou nome do responsável pelo recebimento |
| Data | Data | Data do recebimento (default: hoje) |
| Observações | Texto longo | — |

---

### 2.5 Conferência

Verificação da conformidade do que foi recebido.

| Campo | Tipo | Regras |
|-------|------|--------|
| Número do Recebimento | Select | **Obrigatório**. Vinculado a um Recebimento existente |
| Fornecedor | Texto | Preenchido automaticamente |
| Produto | Select | **Obrigatório** |
| Qtd. Esperada | Número | Vinda do Recebimento |
| Qtd. Recebida | Número | Confirmação da quantidade conferida |
| Status | Select | Aprovado, Reprovado, Em Análise, Pendente |
| Responsável | Select/Texto | Conferente |
| Data | Data | Data da conferência |
| Observações | Texto longo | Registrar discrepâncias, avarias etc. |

---

### 2.6 Entrada de Nota Fiscal

Registro da Nota Fiscal do fornecedor para fins contábeis/fiscais.

| Campo | Tipo | Regras |
|-------|------|--------|
| Número da Nota Fiscal | Texto | **Obrigatório** |
| Fornecedor | Select | **Obrigatório**. Fornecedores ativos |
| Recebimento | Select | Recebimento vinculado |
| Valor | Número | Valor total da NF em R$ |
| Qtd. Itens | Número | Quantidade de itens na nota |
| Status | Select | Pendente, Lançada, Cancelada, Devolvida |
| Data | Data | Data de emissão da NF |
| Observações | Texto longo | — |

**Regra de negócio:**
- Ao confirmar a Entrada de Nota Fiscal com status "Lançada", o sistema deve atualizar o **Estoque Atual** do produto (entrada no estoque).

---

## Módulo 3 — ESTOQUE

Controla armazenagem, movimentações e inventário dos produtos.

### 3.1 Armazenagem

Registro de movimentações físicas de produtos entre endereços/locais do estoque.

| Campo | Tipo | Regras |
|-------|------|--------|
| Número da Movimentação | Texto | **Obrigatório** (gerado automaticamente, formato `MV00001`) |
| Produto | Select | **Obrigatório** |
| Tipo | Select | Entrada, Saída, Transferência |
| Quantidade | Número | **Obrigatório** |
| Origem (Endereço) | Texto | Localização de onde o produto sai |
| Destino (Endereço) | Texto | Localização para onde o produto vai |
| Usuário | Select/Texto | Usuário que registrou a movimentação |
| Data | Data | Data da movimentação |
| Hora | Hora | Hora da movimentação |
| Observações | Texto longo | — |

---

### 3.2 Controle de Estoque

Painel de visão geral — **não possui formulário de cadastro próprio**.

- Exibe todos os produtos cadastrados com: Código, Nome, Categoria, Unidade, Estoque Atual, Estoque Mínimo, Estoque Máximo.
- Indicador visual de status:
  - 🟢 Normal: `Estoque Atual > Estoque Mínimo`
  - 🟡 Atenção: `Estoque Atual = Estoque Mínimo`
  - 🔴 Crítico: `Estoque Atual < Estoque Mínimo`
- Filtros por Categoria, Status e busca por nome/código.
- Os dados vêm exclusivamente do módulo Produtos + histórico de movimentações.

---

### 3.3 Movimentações

Histórico completo de todas as movimentações de estoque.

| Campo | Tipo | Regras |
|-------|------|--------|
| Número da Movimentação | Texto | **Obrigatório** (gerado automaticamente) |
| Produto | Select | **Obrigatório** |
| Tipo | Select | Entrada (compra, ajuste+), Saída (venda, ajuste-), Transferência |
| Quantidade | Número | **Obrigatório** |
| Origem | Texto | Local/endereço de origem |
| Destino | Texto | Local/endereço de destino |
| Usuário | Select/Texto | Quem registrou |
| Data | Data | — |
| Hora | Hora | — |
| Observações | Texto longo | — |

---

### 3.4 Inventário

Contagem física para conciliação com o sistema.

| Campo | Tipo | Regras |
|-------|------|--------|
| Número do Inventário | Texto | **Obrigatório** (gerado automaticamente, formato `INV00001`) |
| Produto | Select | **Obrigatório** |
| Qtd. Sistema | Número | Preenchida automaticamente com o Estoque Atual do produto |
| Qtd. Contada | Número | Quantidade apurada na contagem física |
| Diferença | Número | **Calculada automaticamente**: Qtd. Contada − Qtd. Sistema |
| Status | Select | Pendente, Em Contagem, Conferido, Ajustado |
| Responsável | Select/Texto | — |
| Data | Data | Data da contagem |
| Observações | Texto longo | — |

**Regra de negócio:**
- Ao marcar inventário como "Ajustado", o sistema deve gerar automaticamente uma Movimentação de ajuste (positivo ou negativo) para corrigir o Estoque Atual.

---

## Módulo 4 — VENDAS E LOGÍSTICA

Controla todo o ciclo de venda: do pedido à entrega ao cliente.

### Fluxo do Módulo de Vendas e Logística

```
Pedido de Venda → Nota Fiscal de Venda → Separação (Picking) → Romaneio → Expedição → Entrega
```

### 4.1 Pedido de Venda

Registro do pedido feito pelo cliente.

| Campo | Tipo | Regras |
|-------|------|--------|
| Número do Pedido | Texto | **Obrigatório** (gerado automaticamente, formato `PV00001`) |
| Cliente | Select | **Obrigatório**. Clientes ativos |
| Produto | Select | **Obrigatório**. Produtos ativos |
| Quantidade | Número | **Obrigatório** |
| Preço Unitário | Número | Preenchido automaticamente com o Preço de Venda do produto (editável) |
| Valor Total | Número | **Calculado automaticamente**: Quantidade × Preço Unitário |
| Status | Select | Rascunho, Confirmado, Em Separação, Em Expedição, Entregue, Cancelado |
| Data | Data | Data do pedido (default: hoje) |
| Data Prevista | Data | Previsão de entrega ao cliente |
| Observações | Texto longo | — |

**Regra de negócio:**
- Ao confirmar o Pedido de Venda, verificar se há estoque disponível. Alertar se `Qtd. Pedida > Estoque Atual`.
- Múltiplos produtos por pedido: o formulário deve permitir adicionar N linhas de produto.

---

### 4.2 Nota Fiscal de Venda

Documento fiscal emitido para o cliente.

| Campo | Tipo | Regras |
|-------|------|--------|
| Número da NF | Texto | **Obrigatório** |
| Série | Texto | Série da NF (ex: 001) |
| Data de Emissão | Data | **Obrigatório** |
| Natureza da Operação | Texto | Ex: Venda de Mercadoria |
| Empresa Emitente | Select/Texto | **Obrigatório**. Dados da empresa emissora |
| Cliente Destinatário | Select | **Obrigatório**. Clientes ativos |
| Pedido de Venda | Select | PV vinculado |
| Produto | Select | **Obrigatório** |
| Quantidade | Número | — |
| Valor Unitário | Número | R$ |
| Valor dos Produtos | Número | Calculado automaticamente |
| Desconto | Número | R$ ou % |
| Frete | Número | R$ |
| Base ICMS | Número | R$ |
| Valor ICMS | Número | R$ |
| Valor IPI | Número | R$ |
| Valor Total | Número | **Calculado automaticamente** |
| Transportadora | Select | Transportadoras ativas |
| Frete por Conta | Select | Emitente (CIF), Destinatário (FOB), Sem Frete |
| Qtd. Volumes | Número | — |
| Peso Líquido | Número | kg |
| Peso Bruto | Número | kg |
| Status | Select | Rascunho, Emitida, Cancelada |
| Informações Complementares | Texto longo | — |

---

### 4.3 Romaneio

Lista de itens a serem despachados em uma operação de entrega.

| Campo | Tipo | Regras |
|-------|------|--------|
| Número do Romaneio | Texto | **Obrigatório** (gerado automaticamente, formato `ROM00001`) |
| Data | Data | — |
| Pedido de Venda | Select | PV vinculado |
| Nota Fiscal | Select | NF vinculada |
| Expedição | Select | Expedição vinculada |
| Cliente | Select | **Obrigatório**. Clientes ativos |
| Transportadora | Select | **Obrigatório**. Transportadoras ativas |
| Produto | Select | **Obrigatório** |
| Quantidade | Número | — |
| Qtd. Volumes | Número | — |
| Peso Líquido | Número | kg |
| Peso Bruto | Número | kg |
| Responsável | Select/Texto | — |
| Status | Select | Rascunho, Emitido, Despachado |
| Observações | Texto longo | — |

---

### 4.4 Separação (Picking)

Processo de separação dos produtos no estoque para atender ao pedido.

| Campo | Tipo | Regras |
|-------|------|--------|
| Número da Separação | Texto | **Obrigatório** (gerado automaticamente, formato `SEP00001`) |
| Pedido de Venda | Select | PV vinculado |
| Produto | Select | **Obrigatório** |
| Quantidade | Número | **Obrigatório** |
| Separador | Select/Texto | Usuário ou nome do responsável pela separação |
| Status | Select | Pendente, Em Separação, Concluído, Com Divergência |
| Data | Data | — |
| Observações | Texto longo | — |

---

### 4.5 Expedição

Registro do processo de envio dos produtos separados.

| Campo | Tipo | Regras |
|-------|------|--------|
| Número da Expedição | Texto | **Obrigatório** (gerado automaticamente, formato `EXP00001`) |
| Pedido de Venda | Select | PV vinculado |
| Separação | Select | Separação vinculada |
| Transportadora | Select | **Obrigatório**. Transportadoras ativas |
| Quantidade | Número | — |
| Tipo de Embalagem | Select/Texto | Ex: Caixa, Palete, Saco, Granel |
| Status | Select | Pendente, Em Expedição, Expedido, Cancelado |
| Responsável | Select/Texto | — |
| Data | Data | — |
| Observações | Texto longo | — |

**Regra de negócio:**
- Ao confirmar a Expedição como "Expedido", o sistema deve baixar o estoque do produto (saída de estoque).

---

### 4.6 Entrega

Registro do rastreamento e confirmação de entrega ao cliente.

| Campo | Tipo | Regras |
|-------|------|--------|
| Número da Entrega | Texto | **Obrigatório** (gerado automaticamente, formato `ENT00001`) |
| Expedição | Select | Expedição vinculada |
| Transportadora | Select | **Obrigatório**. Transportadoras ativas |
| Cliente | Select | **Obrigatório**. Clientes ativos |
| Código de Rastreio | Texto | Código fornecido pela transportadora |
| Status | Select | Em Trânsito, Entregue, Tentativa de Entrega, Devolvido, Extraviado |
| Data | Data | Data de envio |
| Data de Entrega | Data | Data efetiva de entrega (preenchida ao confirmar entrega) |
| Responsável | Select/Texto | — |
| Observações | Texto longo | — |

---

## Módulo 5 — CONFIGURAÇÕES

### 5.1 Usuários

Gerenciamento de usuários e permissões de acesso ao sistema.

| Campo | Tipo | Regras |
|-------|------|--------|
| Nome Completo | Texto | Definido no momento do convite; não editável após criação |
| E-mail | E-mail | Definido no convite; usado como login; não editável |
| Cargo | Texto | Cargo na empresa |
| Telefone | Texto | Máscara de telefone |
| Perfil | Select | **Obrigatório**: Administrador ou Usuário |
| Status | Toggle | Ativo / Inativo |
| Permissões de Acesso | Checkboxes | Visão Geral, Cadastros, Compras, Estoque, Vendas e Logística |

**Regras de negócio:**
- **Administrador**: acesso total a todos os módulos e às Configurações. Pode gerenciar usuários.
- **Usuário**: acesso restrito apenas aos módulos com permissão marcada. Não acessa Configurações.
- Usuário inativo não consegue fazer login.
- O convite é enviado por e-mail. O usuário define sua senha no primeiro acesso.
- Deve haver ao menos **um Administrador ativo** no sistema em todo momento.

---

## Módulo 6 — GAMIFICAÇÃO

Transforma a turma em uma empresa virtual. Cada equipe gerencia um setor do ERP. Um motor de simulação gera eventos de negócio automaticamente enquanto o professor controla o fluxo com Play/Pause.

### 6.1 Equipes e Setores

| Equipe | Setor | Tabelas principais |
|--------|-------|--------------------|
| Compras | Módulo Compras | compras_solicitacoes, compras_pedidos |
| Estoque | Módulo Estoque | estoque_movimentacoes, estoque_inventarios |
| Vendas | Módulo Vendas | vendas_pedidos, vendas_separacoes |
| Logística | Romaneio/Expedição/Entrega | vendas_romaneios, vendas_expedicoes, vendas_entregas |
| Financeiro | Fluxo de caixa | fin_contas_pagar, fin_contas_receber |
| Marketing | Campanhas | marketing_campanhas, marketing_retornos |

### 6.2 Telas do Módulo

```
gamificacao/
├── professor.html      ← Dashboard do professor (Play/Pause, ranking, eventos ao vivo)
├── equipe.html         ← View da equipe (?equipe=uuid), countdown por evento
├── placar.html         ← Placar para projeção no telão (full-screen, dark, auto-refresh 5s)
├── config-sessao.html  ← Criar/editar sessão (equipes, membros, config do motor)
├── index.html          ← Hub do usuário (XP, nível, badges, missões) — já existe
├── ranking.html        ← Leaderboard — já existe
└── admin.html          ← Admin — já existe
```

### 6.3 Tabelas no Supabase (Gamificação)

```sql
CREATE TABLE gamificacao_sessoes (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo        text NOT NULL,
  professor_id  uuid REFERENCES erp_usuarios(id),
  status        text DEFAULT 'pausada',   -- 'ativa','pausada','encerrada'
  velocidade    integer DEFAULT 1,        -- 1x, 2x, 5x
  rodada_atual  integer DEFAULT 1,
  iniciada_em   timestamptz,
  encerrada_em  timestamptz,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE gamificacao_equipes (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sessao_id   uuid REFERENCES gamificacao_sessoes(id),
  nome        text NOT NULL,
  setor       text NOT NULL,  -- 'compras','estoque','vendas','logistica','financeiro','marketing'
  cor         text DEFAULT '#3B82F6',
  pontos      integer DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE gamificacao_membros (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  equipe_id   uuid REFERENCES gamificacao_equipes(id),
  nome        text NOT NULL,
  usuario_id  uuid REFERENCES erp_usuarios(id),
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE gamificacao_eventos (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sessao_id     uuid REFERENCES gamificacao_sessoes(id),
  rodada        integer NOT NULL,
  tipo          text NOT NULL,   -- 'pedido_venda','solicitacao_compra','chegada_mercadoria', etc.
  titulo        text NOT NULL,
  descricao     text,
  setor_alvo    text NOT NULL,
  prioridade    text DEFAULT 'normal',   -- 'normal','alta','urgente'
  prazo_minutos integer DEFAULT 5,
  status        text DEFAULT 'pendente', -- 'pendente','resolvido','expirado'
  referencia_id uuid,
  pontos_base   integer DEFAULT 10,
  resolvido_em  timestamptz,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE gamificacao_pontuacoes (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sessao_id   uuid REFERENCES gamificacao_sessoes(id),
  equipe_id   uuid REFERENCES gamificacao_equipes(id),
  evento_id   uuid REFERENCES gamificacao_eventos(id),
  pontos      integer NOT NULL,
  motivo      text,   -- 'resolucao_rapida','resolucao_no_prazo','expirado','bonus'
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE gamificacao_config_motor (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sessao_id           uuid REFERENCES gamificacao_sessoes(id),
  intervalo_segundos  integer DEFAULT 60,
  max_eventos_ativos  integer DEFAULT 5,
  chance_urgente      integer DEFAULT 20,
  produtos_ids        uuid[],
  clientes_ids        uuid[],
  fornecedores_ids    uuid[],
  created_at          timestamptz DEFAULT now()
);

-- RLS permissivo
ALTER TABLE gamificacao_sessoes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamificacao_equipes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamificacao_membros      ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamificacao_eventos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamificacao_pontuacoes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamificacao_config_motor ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon full" ON gamificacao_sessoes      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon full" ON gamificacao_equipes      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon full" ON gamificacao_membros      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon full" ON gamificacao_eventos      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon full" ON gamificacao_pontuacoes   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon full" ON gamificacao_config_motor FOR ALL USING (true) WITH CHECK (true);
```

### 6.4 Sistema e Telas no Banco

```sql
-- Sistema (siscodigo 10)
INSERT INTO sistema (siscodigo, sisnome, sisativo, sisordem)
VALUES (10, 'Gamificação', 1, 10);

-- Telas vinculadas ao sistema 10
INSERT INTO tela (nome, nome_html, ativo) VALUES
  ('Professor',     'gamificacao/professor.html',    1),
  ('Minha Equipe',  'gamificacao/equipe.html',       1),
  ('Placar',        'gamificacao/placar.html',        1),
  ('Config Sessão', 'gamificacao/config-sessao.html', 1);
-- Depois inserir os IDs gerados em tela_sistema com sistema_id=10
```

### 6.5 Sidebar HTML (Gamificação)

```html
<div class="sidebar-section">
  <div class="sidebar-section-label">Gamificação</div>
  <a class="sidebar-link" href="../gamificacao/professor.html"><span class="sidebar-icon">🎮</span> Professor</a>
  <a class="sidebar-link" href="../gamificacao/equipe.html"><span class="sidebar-icon">👥</span> Minha Equipe</a>
  <a class="sidebar-link" href="../gamificacao/placar.html"><span class="sidebar-icon">🏆</span> Placar</a>
</div>
```

### 6.6 Pontuação

| Situação | Pontos |
|----------|--------|
| Resolvido dentro do prazo | +pontos_base |
| Resolvido em < 50% do prazo | +pontos_base × 1,5 |
| Evento expirado | −5 pontos |
| Zero erros de validação | +3 bônus |
| Primeiro a resolver urgente | +15 bônus |

### 6.7 sistema.json — adicionar entrada

```json
{ "siscodigo": 10, "sisnome": "Gamificação", "sisativo": 1, "sisordem": 10 }
```

### 6.8 perfis.html — atualizar sisOrdem

```js
const sisOrdem = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
```

---

## Módulo 7 — RECURSOS HUMANOS

Gerencia o ciclo completo do colaborador — da admissão ao desligamento — com ponto eletrônico, folha de pagamento, férias, afastamentos, treinamentos e benefícios.

### Fluxo do Módulo de RH

```
Admissão → Cadastro → Ponto Eletrônico → Folha de Pagamento → Férias / Afastamentos → Desligamento
                    ↘ Treinamentos / Benefícios
```

### 7.1 Telas do Módulo

```
rh/
├── dashboard.html          ← Painel de RH
├── departamentos.html      ← CRUD de departamentos
├── cargos.html             ← CRUD de cargos
├── funcionarios.html       ← CRUD de funcionários
├── beneficios.html         ← CRUD de benefícios cadastrados
├── jornadas.html           ← CRUD de jornadas de trabalho
├── ponto.html              ← Lançamentos de ponto
├── apuracao-ponto.html     ← Painel de apuração por período
├── folha.html              ← Competências e lançamentos da folha
├── decimo-terceiro.html    ← 13º salário
├── ferias.html             ← Controle de férias
├── afastamentos.html       ← Afastamentos e atestados
├── treinamentos.html       ← Catálogo de treinamentos
├── participacoes.html      ← Participações em treinamentos
├── admissao.html           ← Solicitações de admissão
└── desligamento.html       ← Registro de desligamento / rescisão
```

### 7.2 Numeração Automática

| Entidade | Prefixo | Exemplo |
|----------|---------|---------|
| Departamento | `DEP` | `DEP00001` |
| Cargo | `CGO` | `CGO00001` |
| Funcionário | `F` | `F00001` |
| Registro de Ponto | `PT` | `PT00001` |
| Lançamento de Folha | `FL` | `FL00001` |
| 13º Salário | `13S` | `13S00001` |
| Férias | `FER` | `FER00001` |
| Afastamento | `AFS` | `AFS00001` |
| Treinamento | `TRN` | `TRN00001` |
| Participação | `PAR` | `PAR00001` |
| Admissão | `ADM` | `ADM00001` |
| Desligamento | `DLG` | `DLG00001` |
| Avaliação de Desempenho | `AVL` | `AVL00001` |

### 7.3 Tabelas no Supabase (RH)

```sql
-- DEPARTAMENTOS
CREATE TABLE rh_departamentos (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo        text UNIQUE NOT NULL,   -- gerado: DEP00001
  nome          text NOT NULL,
  responsavel_id uuid REFERENCES erp_usuarios(id),
  centro_custo  text,
  ativo         boolean DEFAULT true,
  observacoes   text,
  created_at    timestamptz DEFAULT now()
);

-- CARGOS
CREATE TABLE rh_cargos (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo          text UNIQUE NOT NULL,  -- gerado: CGO00001
  nome            text NOT NULL,
  departamento_id uuid REFERENCES rh_departamentos(id),
  cbo             text,
  salario_base    numeric(12,2),
  nivel           text,
  ativo           boolean DEFAULT true,
  descricao       text,
  created_at      timestamptz DEFAULT now()
);

-- FUNCIONÁRIOS
CREATE TABLE rh_funcionarios (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  matricula         text UNIQUE NOT NULL,   -- gerado: F00001
  nome              text NOT NULL,
  cpf               text UNIQUE NOT NULL,
  rg                text,
  data_nascimento   date,
  sexo              text,
  estado_civil      text,
  email             text,
  telefone          text,
  endereco          text,
  cidade            text,
  estado            text,
  cep               text,
  departamento_id   uuid REFERENCES rh_departamentos(id),
  cargo_id          uuid REFERENCES rh_cargos(id),
  tipo_contrato     text,
  salario           numeric(12,2),
  data_admissao     date NOT NULL,
  data_desligamento date,
  banco             text,
  agencia           text,
  conta             text,
  tipo_conta        text,
  chave_pix         text,
  foto_url          text,
  pis_pasep         text,
  ctps              text,
  ativo             boolean DEFAULT true,
  observacoes       text,
  created_at        timestamptz DEFAULT now()
);

-- BENEFÍCIOS (catálogo — nome definitivo: beneficios)
CREATE TABLE beneficios (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome              text NOT NULL,
  tipo              text,
  descricao         text,
  valor_empresa     numeric(12,2) DEFAULT 0,
  valor_funcionario numeric(12,2) DEFAULT 0,
  periodicidade     text DEFAULT 'Mensal',
  obrigatorio       boolean DEFAULT false,
  ativo             boolean DEFAULT true,
  created_at        timestamptz DEFAULT now()
);

-- VÍNCULOS FUNCIONÁRIO × BENEFÍCIO (nome definitivo: beneficio_funcionario)
CREATE TABLE beneficio_funcionario (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  funcionario_id    uuid REFERENCES rh_funcionarios(id) ON DELETE CASCADE,
  beneficio_id      uuid REFERENCES beneficios(id),
  data_inicio       date NOT NULL DEFAULT CURRENT_DATE,
  data_termino      date,
  valor_customizado numeric(12,2),
  observacoes       text,
  created_at        timestamptz DEFAULT now()
);

-- PROGRESSÃO DE CARREIRA E SALÁRIO (nome definitivo: progressao_desempenho)
CREATE TABLE progressao_desempenho (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cargo_id              uuid REFERENCES rh_cargos(id),
  nivel                 text NOT NULL,
  nivel_ordem           integer NOT NULL,
  salario_minimo        numeric(12,2) NOT NULL,
  salario_medio         numeric(12,2),
  salario_maximo        numeric(12,2) NOT NULL,
  tempo_minimo_meses    integer DEFAULT 12,
  nota_minima           numeric(4,1) DEFAULT 7.0,
  requisitos            text,
  ativo                 boolean DEFAULT true,
  created_at            timestamptz DEFAULT now()
);

-- AVALIAÇÕES DE DESEMPENHO
CREATE TABLE avaliacao_desempenho (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  numero                text UNIQUE NOT NULL,   -- gerado: AVL00001
  funcionario_id        uuid REFERENCES rh_funcionarios(id),
  avaliador             text,
  periodo               text NOT NULL,
  nota_tecnica          numeric(4,1),
  nota_comportamental   numeric(4,1),
  nota_geral            numeric(4,1),
  elegivel_promocao     boolean DEFAULT false,
  promocao_aprovada     boolean DEFAULT false,
  novo_nivel            text,
  novo_salario          numeric(12,2),
  data_avaliacao        date NOT NULL,
  proxima_avaliacao     date,
  observacoes           text,
  created_at            timestamptz DEFAULT now()
);

-- JORNADAS
CREATE TABLE rh_jornadas (
  id                   uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome                 text NOT NULL,
  entrada              time,
  inicio_intervalo     time,
  fim_intervalo        time,
  saida                time,
  carga_horaria_diaria numeric(4,2),
  dias_semana          text[],
  ativo                boolean DEFAULT true,
  created_at           timestamptz DEFAULT now()
);

-- PONTO
CREATE TABLE rh_ponto (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  numero           text UNIQUE NOT NULL,   -- gerado: PT00001
  funcionario_id   uuid REFERENCES rh_funcionarios(id),
  data             date NOT NULL,
  entrada          time,
  inicio_intervalo time,
  fim_intervalo    time,
  saida            time,
  horas_trabalhadas numeric(5,2),
  horas_extras     numeric(5,2),
  ocorrencia       text DEFAULT 'Normal',
  responsavel      text,
  observacoes      text,
  created_at       timestamptz DEFAULT now()
);

-- COMPETÊNCIAS DE FOLHA
CREATE TABLE rh_folha_competencias (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  competencia    text UNIQUE NOT NULL,
  status         text DEFAULT 'Em Elaboração',
  data_pagamento date,
  observacoes    text,
  created_at     timestamptz DEFAULT now()
);

-- LANÇAMENTOS DA FOLHA
CREATE TABLE rh_folha_lancamentos (
  id                   uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  numero               text UNIQUE NOT NULL,   -- gerado: FL00001
  competencia_id       uuid REFERENCES rh_folha_competencias(id),
  funcionario_id       uuid REFERENCES rh_funcionarios(id),
  salario_bruto        numeric(12,2),
  horas_extras         numeric(5,2) DEFAULT 0,
  valor_horas_extras   numeric(12,2) DEFAULT 0,
  adicionais           numeric(12,2) DEFAULT 0,
  inss                 numeric(12,2) DEFAULT 0,
  irrf                 numeric(12,2) DEFAULT 0,
  desc_vale_transporte numeric(12,2) DEFAULT 0,
  desc_vale_refeicao   numeric(12,2) DEFAULT 0,
  outros_descontos     numeric(12,2) DEFAULT 0,
  salario_liquido      numeric(12,2),
  status               text DEFAULT 'Rascunho',
  observacoes          text,
  created_at           timestamptz DEFAULT now()
);

-- 13º SALÁRIO
CREATE TABLE rh_decimo_terceiro (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  numero         text UNIQUE NOT NULL,   -- gerado: 13S00001
  competencia    text NOT NULL,
  funcionario_id uuid REFERENCES rh_funcionarios(id),
  parcela        text NOT NULL,
  valor_bruto    numeric(12,2),
  inss           numeric(12,2) DEFAULT 0,
  irrf           numeric(12,2) DEFAULT 0,
  valor_liquido  numeric(12,2),
  status         text DEFAULT 'Rascunho',
  created_at     timestamptz DEFAULT now()
);

-- FÉRIAS
CREATE TABLE rh_ferias (
  id                 uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  numero             text UNIQUE NOT NULL,   -- gerado: FER00001
  funcionario_id     uuid REFERENCES rh_funcionarios(id),
  periodo_aquisitivo text,
  dias_ferias        integer DEFAULT 30,
  data_inicio        date NOT NULL,
  data_termino       date,
  abono_pecuniario   boolean DEFAULT false,
  valor_adicional    numeric(12,2),
  status             text DEFAULT 'Agendada',
  aprovado_por       text,
  observacoes        text,
  created_at         timestamptz DEFAULT now()
);

-- AFASTAMENTOS
CREATE TABLE rh_afastamentos (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  numero         text UNIQUE NOT NULL,   -- gerado: AFS00001
  funcionario_id uuid REFERENCES rh_funcionarios(id),
  tipo           text NOT NULL,
  data_inicio    date NOT NULL,
  data_termino   date,
  dias_afastados integer,
  cid            text,
  numero_inss    text,
  gera_desconto  boolean DEFAULT false,
  documento_url  text,
  status         text DEFAULT 'Ativo',
  responsavel    text,
  observacoes    text,
  created_at     timestamptz DEFAULT now()
);

-- TREINAMENTOS (catálogo)
CREATE TABLE rh_treinamentos (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo          text UNIQUE NOT NULL,   -- gerado: TRN00001
  nome            text NOT NULL,
  tipo            text,
  modalidade      text,
  carga_horaria   numeric(5,1),
  obrigatorio     boolean DEFAULT false,
  validade_meses  integer DEFAULT 0,
  instrutor       text,
  custo           numeric(12,2) DEFAULT 0,
  ativo           boolean DEFAULT true,
  descricao       text,
  created_at      timestamptz DEFAULT now()
);

-- PARTICIPAÇÕES EM TREINAMENTOS
CREATE TABLE rh_participacoes (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  numero          text UNIQUE NOT NULL,   -- gerado: PAR00001
  treinamento_id  uuid REFERENCES rh_treinamentos(id),
  funcionario_id  uuid REFERENCES rh_funcionarios(id),
  data_realizacao date NOT NULL,
  data_vencimento date,
  nota            numeric(4,1),
  status          text DEFAULT 'Realizado',
  certificado_url text,
  observacoes     text,
  created_at      timestamptz DEFAULT now()
);

-- ADMISSÕES
CREATE TABLE rh_admissoes (
  id                   uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  numero               text UNIQUE NOT NULL,   -- gerado: ADM00001
  cargo_id             uuid REFERENCES rh_cargos(id),
  departamento_id      uuid REFERENCES rh_departamentos(id),
  salario_proposto     numeric(12,2),
  justificativa        text,
  tipo_contrato        text,
  data_inicio_prevista date,
  solicitante          text,
  status               text DEFAULT 'Pendente',
  aprovado_por         text,
  observacoes          text,
  created_at           timestamptz DEFAULT now()
);

-- DESLIGAMENTOS
CREATE TABLE rh_desligamentos (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  numero              text UNIQUE NOT NULL,   -- gerado: DLG00001
  funcionario_id      uuid REFERENCES rh_funcionarios(id),
  tipo_desligamento   text NOT NULL,
  data_aviso_previo   date,
  data_desligamento   date NOT NULL,
  dias_aviso          integer DEFAULT 30,
  aviso_trabalhado    boolean DEFAULT true,
  saldo_ferias        numeric(5,1),
  decimo_proporcional numeric(4,2),
  multa_fgts          numeric(12,2) DEFAULT 0,
  motivo              text,
  homologado_por      text,
  status              text DEFAULT 'Em Andamento',
  created_at          timestamptz DEFAULT now()
);

-- RLS permissivo
DO $$
DECLARE tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'rh_departamentos','rh_cargos','rh_funcionarios','beneficios',
    'beneficio_funcionario','progressao_desempenho','avaliacao_desempenho',
    'rh_jornadas','rh_ponto','rh_folha_competencias','rh_folha_lancamentos',
    'rh_decimo_terceiro','rh_ferias','rh_afastamentos','rh_treinamentos',
    'rh_participacoes','rh_admissoes','rh_desligamentos'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('CREATE POLICY "anon full" ON %I FOR ALL USING (true) WITH CHECK (true)', tbl);
  END LOOP;
END $$;
```

### 7.4 Sistema e Telas no Banco

```sql
-- Sistema (siscodigo 11)
INSERT INTO sistema (siscodigo, sisnome, sisativo, sisordem)
VALUES (11, 'Recursos Humanos', 1, 11);

-- Telas do módulo (vincular IDs em tela_sistema com sistema_id=11)
INSERT INTO tela (nome, nome_html, ativo) VALUES
  ('Painel RH',          'rh/dashboard.html',        1),
  ('Departamentos',      'rh/departamentos.html',     1),
  ('Cargos',             'rh/cargos.html',            1),
  ('Funcionários',       'rh/funcionarios.html',      1),
  ('Benefícios',         'rh/beneficios.html',        1),
  ('Jornadas',           'rh/jornadas.html',          1),
  ('Ponto Eletrônico',   'rh/ponto.html',             1),
  ('Apuração de Ponto',  'rh/apuracao-ponto.html',    1),
  ('Folha de Pagamento', 'rh/folha.html',             1),
  ('13º Salário',        'rh/decimo-terceiro.html',   1),
  ('Férias',             'rh/ferias.html',            1),
  ('Afastamentos',       'rh/afastamentos.html',      1),
  ('Treinamentos',       'rh/treinamentos.html',      1),
  ('Participações',      'rh/participacoes.html',     1),
  ('Admissão',           'rh/admissao.html',          1),
  ('Desligamento',       'rh/desligamento.html',      1);
```

### 7.5 Sidebar HTML (RH)

```html
<div class="sidebar-section">
  <div class="sidebar-section-label">Recursos Humanos</div>
  <a class="sidebar-link" href="../rh/dashboard.html"><span class="sidebar-icon">📊</span> Painel RH</a>
  <a class="sidebar-link" href="../rh/funcionarios.html"><span class="sidebar-icon">👤</span> Funcionários</a>
  <a class="sidebar-link" href="../rh/ponto.html"><span class="sidebar-icon">🕐</span> Ponto Eletrônico</a>
  <a class="sidebar-link" href="../rh/folha.html"><span class="sidebar-icon">💰</span> Folha de Pagamento</a>
  <a class="sidebar-link" href="../rh/ferias.html"><span class="sidebar-icon">🏖️</span> Férias</a>
  <a class="sidebar-link" href="../rh/afastamentos.html"><span class="sidebar-icon">🏥</span> Afastamentos</a>
  <a class="sidebar-link" href="../rh/treinamentos.html"><span class="sidebar-icon">🎓</span> Treinamentos</a>
</div>
```

### 7.6 sistema.json — adicionar entrada

```json
{ "siscodigo": 11, "sisnome": "Recursos Humanos", "sisativo": 1, "sisordem": 11 }
```

---

## Visão Geral (Dashboard)

A tela inicial do sistema deve exibir um painel resumido com:

- Total de Clientes ativos
- Total de Fornecedores ativos
- Total de Produtos com estoque crítico (Estoque Atual < Estoque Mínimo)
- Pedidos de Compra em aberto
- Pedidos de Venda em aberto
- Últimas movimentações de estoque (5 registros mais recentes)
- Indicadores rápidos: faturamento do mês, compras do mês (se disponível)

---

## Regras Gerais de Interface

### Listagens (tabelas)
- Toda listagem deve ter: busca por texto, filtro por status, ordenação por coluna, paginação.
- Ações por registro: **Editar**, **Visualizar**, **Excluir** (quando aplicável) e ações especiais (ex: "Salvar como PDF" no Pedido de Compras).
- Confirmação antes de excluir: modal "Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita."

### Formulários
- Validação em tempo real dos campos obrigatórios.
- Ao selecionar um registro vinculado (ex: selecionar Produto em Solicitação), preencher automaticamente campos derivados (Unidade, Preço, etc.).
- Botões: **Salvar**, **Cancelar** (volta à listagem sem salvar).
- Mensagem de sucesso/erro após salvar.

### Numeração Automática
Todos os números sequenciais devem usar padding fixo de 5 dígitos:
- Produto: `P00001`
- Solicitação de Compras: `SC00001`
- Pedido de Compras: `PC00001`
- Recebimento: `RC00001`
- Movimentação: `MV00001`
- Inventário: `INV00001`
- Pedido de Venda: `PV00001`
- Romaneio: `ROM00001`
- Separação: `SEP00001`
- Expedição: `EXP00001`
- Entrega: `ENT00001`

### Responsividade

O sistema deve ser **100% utilizável no celular**, sem rolagem horizontal, sem elementos cortados, sem zoom indesejado. Prioridade: celular primeiro — se funcionar no mobile, funciona em tudo.

#### Objetivo mobile
- Nenhum elemento deve ultrapassar a largura da viewport.
- Nenhuma rolagem horizontal no `<body>` — apenas dentro de containers específicos (tabelas).
- Todos os formulários, modais e botões devem ser tocáveis e legíveis sem zoom.
- A página deve carregar e ser utilizável **sem a sidebar visível**.

#### Layout geral
- Sidebar **oculta por padrão** em telas ≤ 768px, abre via botão ☰ no header.
- `.main` com `margin-left: 0` em mobile — nunca deixar margem reservada para sidebar.
- Padding do conteúdo principal: `16px` em mobile, `28px 32px` em desktop.
- **Proibido** usar `width` fixo em px em qualquer container de nível superior.
- Todo elemento usa `max-width: 100%` para não vazar da viewport.

#### Tabelas (regra crítica)
- **Sempre** envolver `<table>` em `<div class="crud-table-wrap">` — sem exceção.
- `.crud-table-wrap` tem `overflow-x: auto` — a tabela rola horizontalmente dentro dele.
- O `<body>` nunca rola na horizontal por causa de tabela.
- **Proibido** `white-space: nowrap` em `<td>` fora de `.crud-table-wrap`.
- Coluna de Ações nunca some em mobile (não usar `display:none`).

#### Formulários
- Grid de formulário `1fr 1fr` **colapsa para `1fr`** em telas ≤ 600px:
  ```css
  @media (max-width: 600px) {
    .form-grid { grid-template-columns: 1fr; }
    .form-grid .span-2 { grid-column: span 1; }
  }
  ```
- `font-size: 16px` em `input`, `select`, `textarea` no mobile — **obrigatório** para evitar zoom automático no iOS.
- Labels e inputs com `width: 100%` — nunca largura fixa.

#### Modais
- Modal com `max-height: 90vh` e `overflow-y: auto` no corpo — nunca ultrapassa a tela.
- Em mobile: `width: calc(100% - 24px)`, margem lateral de 12px.
- Backdrop (`crud-backdrop`) com `padding: 12px` em mobile.
- Botões do modal footer em coluna em telas ≤ 480px se necessário.

#### Header
- Em telas ≤ 480px, ocultar `.header-title` para liberar espaço aos botões.
- Botões do header com padding reduzido: `6px 10px` em mobile.
- Logo e botões ☰ / Sair sempre visíveis.

#### Breakpoints obrigatórios
```css
@media (max-width: 768px)  { /* tablet/celular — sidebar oculta, margin-left:0 */ }
@media (max-width: 600px)  { /* celular — formulários 1 coluna, font-size 16px inputs */ }
@media (max-width: 480px)  { /* celular pequeno — header compacto */ }
```

#### CSS proibido em mobile
- `white-space: nowrap` em `<td>` fora de wrapper com `overflow-x: auto`
- `width: NNNpx` fixo em containers de layout (`.main`, `.content-section`, `.page-header`)
- `position: absolute` sem `max-width: 100vw` ou fallback mobile
- `overflow: hidden` no `<body>` ou `<html>` — quebra scroll em iOS

#### Verificação rápida (checklist antes de cada commit)
- [ ] Abrir no DevTools em 375px (iPhone SE) — nenhum scroll horizontal
- [ ] Formulário abre e fecha corretamente no mobile
- [ ] Tabela rola dentro do seu container, não na página
- [ ] Inputs não causam zoom ao focar (font-size ≥ 16px)
- [ ] Sidebar abre e fecha via ☰

### Autenticação
- Login por e-mail + senha.
- Sessão autenticada com token JWT ou similar.
- Logout disponível em todas as telas.
- Redirecionamento para login ao tentar acessar rota protegida sem autenticação.

---

## Tecnologias

### Frontend — Vanilla JS (obrigatório)

O frontend é construído com **HTML + CSS + JavaScript puro**, sem nenhum framework ou biblioteca de componentes. Seguir o mesmo padrão do sistema SENAI existente (`sistema/`).

- **HTML5** — arquivos `.html` por módulo/tela (sem bundler, sem transpilação)
- **CSS** — arquivo único `styles.css` já criado com todo o design system (variáveis, tema claro/escuro, componentes)
- **JavaScript** — vanilla JS ES6+ (arrow functions, async/await, fetch, template literals)
- **Sem dependências de npm** — nenhum `package.json`, nenhum build step
- **Tema claro/escuro** — via `[data-theme="dark"]` no `<html>`, persistido em `localStorage.getItem("senai_tema")`
- **PDF** — `window.print()` com CSS `@media print` ou biblioteca CDN embutida via `<script>` (ex: jsPDF via CDN)
- **API de CEP** — ViaCEP via `fetch('https://viacep.com.br/ws/{cep}/json/')`

### Estrutura de arquivos HTML (uma por tela/módulo)

```
erp-victor-anato-senai/
├── styles.css              ← design system global (já criado)
├── index.html              ← login
├── dashboard.html          ← visão geral / home
├── cadastros/
│   ├── clientes.html
│   ├── fornecedores.html
│   ├── produtos.html
│   └── transportadoras.html
├── compras/
│   ├── planejamento.html
│   ├── solicitacoes.html
│   ├── pedidos.html
│   ├── recebimento.html
│   ├── conferencia.html
│   └── nota-fiscal.html
├── estoque/
│   ├── armazenagem.html
│   ├── controle.html
│   ├── movimentacoes.html
│   └── inventario.html
├── vendas/
│   ├── pedidos-venda.html
│   ├── nota-fiscal-venda.html
│   ├── romaneio.html
│   ├── separacao.html
│   ├── expedicao.html
│   └── entrega.html
├── configuracoes/
│   └── usuarios.html
├── gamificacao/
│   ├── professor.html      ← Dashboard do professor
│   ├── equipe.html         ← View da equipe
│   ├── placar.html         ← Placar para telão
│   ├── config-sessao.html  ← Configuração da sessão
│   ├── index.html          ← Hub do usuário (já existe)
│   ├── ranking.html        ← Leaderboard (já existe)
│   └── admin.html          ← Admin (já existe)
└── rh/
    ├── dashboard.html
    ├── departamentos.html
    ├── cargos.html
    ├── funcionarios.html
    ├── beneficios.html
    ├── jornadas.html
    ├── ponto.html
    ├── apuracao-ponto.html
    ├── folha.html
    ├── decimo-terceiro.html
    ├── ferias.html
    ├── afastamentos.html
    ├── treinamentos.html
    ├── participacoes.html
    ├── admissao.html
    └── desligamento.html
```

### Padrões JavaScript obrigatórios

```js
// Tema — aplicar antes do render para evitar flash
(function () {
  const t = localStorage.getItem("senai_tema") || "light";
  document.documentElement.setAttribute("data-theme", t);
})();

// Autenticação — verificar sessão em toda tela protegida
(function () {
  if (!localStorage.getItem("erp_role"))
    window.location.replace("../index.html");
})();

// Fetch com Supabase
const SUPABASE_URL = '...';
const SUPABASE_KEY = '...';
const headers = { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' };

async function fetchData(endpoint) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, { headers });
  return res.json();
}

// Numeração automática — buscar o último e incrementar
async function proximoNumero(tabela, campo, prefixo, digitos = 5) {
  const rows = await fetchData(`${tabela}?select=${campo}&order=${campo}.desc&limit=1`);
  const ultimo = rows.length ? parseInt(rows[0][campo].replace(prefixo, '')) : 0;
  return prefixo + String(ultimo + 1).padStart(digitos, '0');
}
```

### Backend / Banco de Dados

- **Supabase** (PostgreSQL) — backend exclusivo, sem servidor Node/Express próprio
- **API REST**: Supabase REST API via `fetch` diretamente do frontend (sem backend próprio)
- **Sessão**: `localStorage` com `erp_role` e `erp_login` (timestamp)

---

## Supabase — Configuração e Uso da API

### Credenciais

```js
const SUPABASE_URL = 'https://vdhahqicqlrdvcpesiwk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3YXNiemRia2JyeW5jcHZmdWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MzA3ODEsImV4cCI6MjA2MjQwNjc4MX0.Bz7aZ6yG6DUTtWQ4WdeNbslWzE4qU81zzblUeHdTduU';

const HEADERS = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};
```

### Padrão de CRUD — funções reutilizáveis

```js
const API = `${SUPABASE_URL}/rest/v1`;

// LIST — listar registros (com filtros opcionais)
async function listar(tabela, queryParams = '') {
  const res = await fetch(`${API}/${tabela}?${queryParams}`, { headers: HEADERS });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// GET — buscar um registro por id
async function buscar(tabela, id) {
  const res = await fetch(`${API}/${tabela}?id=eq.${id}&limit=1`, { headers: HEADERS });
  if (!res.ok) throw new Error(await res.text());
  const rows = await res.json();
  return rows[0] || null;
}

// INSERT — criar novo registro
async function inserir(tabela, dados) {
  const res = await fetch(`${API}/${tabela}`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(dados)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// UPDATE — atualizar registro por id
async function atualizar(tabela, id, dados) {
  const res = await fetch(`${API}/${tabela}?id=eq.${id}`, {
    method: 'PATCH',
    headers: HEADERS,
    body: JSON.stringify(dados)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// DELETE — excluir registro por id
async function excluir(tabela, id) {
  const res = await fetch(`${API}/${tabela}?id=eq.${id}`, {
    method: 'DELETE',
    headers: HEADERS
  });
  if (!res.ok) throw new Error(await res.text());
  return true;
}

// Numeração automática sequencial
async function proximoNumero(tabela, campo, prefixo, digitos = 5) {
  const rows = await listar(tabela, `select=${campo}&order=${campo}.desc&limit=1`);
  const ultimo = rows.length ? parseInt(rows[0][campo].replace(prefixo, '')) : 0;
  return prefixo + String(ultimo + 1).padStart(digitos, '0');
}
```

### Filtros e operadores da API REST Supabase

| Operador | URL | Exemplo |
|----------|-----|---------|
| Igual | `campo=eq.valor` | `?ativo=eq.true` |
| Diferente | `campo=neq.valor` | `?status=neq.Cancelado` |
| Maior que | `campo=gt.valor` | `?estoque_atual=gt.0` |
| Menor ou igual | `campo=lte.valor` | `?estoque_atual=lte.estoque_minimo` |
| Contém texto | `campo=ilike.*valor*` | `?nome=ilike.*ferr*` |
| In (lista) | `campo=in.(a,b,c)` | `?status=in.(Ativo,Pendente)` |
| Ordenar | `order=campo.asc` | `?order=nome.asc` |
| Limitar | `limit=N&offset=N` | `?limit=50&offset=0` |
| Selecionar campos | `select=a,b,c` | `?select=id,nome,ativo` |

### Esquema de tabelas do banco (PostgreSQL)

Criar estas tabelas no Supabase SQL Editor:

```sql
-- CADASTROS
CREATE TABLE clientes (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome        text NOT NULL,
  cnpj_cpf    text,
  email       text,
  telefone    text,
  segmento    text,
  endereco    text,
  cidade      text,
  estado      text,
  cep         text,
  ativo       boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE fornecedores (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome        text NOT NULL,
  cnpj        text,
  contato     text,
  email       text,
  telefone    text,
  segmento    text,
  endereco    text,
  cidade      text,
  estado      text,
  cep         text,
  ativo       boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE produtos (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo          text UNIQUE NOT NULL,   -- gerado: P00001
  nome            text NOT NULL,
  categoria       text,
  unidade         text,
  preco_custo     numeric(12,2),
  preco_venda     numeric(12,2),
  estoque_atual   numeric(12,3) DEFAULT 0,
  estoque_minimo  numeric(12,3) DEFAULT 0,
  estoque_maximo  numeric(12,3),
  imagem_url      text,
  descricao       text,
  ativo           boolean DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE transportadoras (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome            text NOT NULL,
  cnpj            text,
  tipo_servico    text,
  contato         text,
  email           text,
  telefone        text,
  cidade          text,
  estado          text,
  ativa           boolean DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

-- COMPRAS
CREATE TABLE compras_planejamento (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo        text NOT NULL,
  tipo          text,
  produto_id    uuid REFERENCES produtos(id),
  periodo       text,
  qtd_planejada numeric(12,3),
  qtd_realizada numeric(12,3) DEFAULT 0,
  status        text DEFAULT 'Em Planejamento',
  data          date,
  observacoes   text,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE compras_solicitacoes (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  numero        text UNIQUE NOT NULL,    -- gerado: SC00001
  produto_id    uuid REFERENCES produtos(id),
  quantidade    numeric(12,3) NOT NULL,
  unidade       text,
  solicitante   text,
  prioridade    text DEFAULT 'Média',
  status        text DEFAULT 'Pendente',
  data          date DEFAULT CURRENT_DATE,
  observacoes   text,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE compras_pedidos (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  numero            text UNIQUE NOT NULL,  -- gerado: PC00001
  solicitacao_id    uuid REFERENCES compras_solicitacoes(id),
  fornecedor_id     uuid REFERENCES fornecedores(id),
  produto_id        uuid REFERENCES produtos(id),
  quantidade        numeric(12,3) NOT NULL,
  preco_unitario    numeric(12,2),
  valor_total       numeric(12,2) GENERATED ALWAYS AS (quantidade * preco_unitario) STORED,
  status            text DEFAULT 'Rascunho',
  data              date DEFAULT CURRENT_DATE,
  data_prevista     date,
  observacoes       text,
  created_at        timestamptz DEFAULT now()
);

CREATE TABLE compras_recebimentos (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  numero          text UNIQUE NOT NULL,   -- gerado: RC00001
  pedido_id       uuid REFERENCES compras_pedidos(id),
  fornecedor_id   uuid REFERENCES fornecedores(id),
  produto_id      uuid REFERENCES produtos(id),
  qtd_esperada    numeric(12,3),
  qtd_recebida    numeric(12,3),
  status          text DEFAULT 'Aguardando',
  responsavel     text,
  data            date DEFAULT CURRENT_DATE,
  observacoes     text,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE compras_conferencias (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  recebimento_id  uuid REFERENCES compras_recebimentos(id),
  fornecedor_id   uuid REFERENCES fornecedores(id),
  produto_id      uuid REFERENCES produtos(id),
  qtd_esperada    numeric(12,3),
  qtd_recebida    numeric(12,3),
  status          text DEFAULT 'Em Análise',
  responsavel     text,
  data            date DEFAULT CURRENT_DATE,
  observacoes     text,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE compras_notas_fiscais (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_nf       text NOT NULL,
  fornecedor_id   uuid REFERENCES fornecedores(id),
  recebimento_id  uuid REFERENCES compras_recebimentos(id),
  valor           numeric(12,2),
  qtd_itens       integer,
  status          text DEFAULT 'Pendente',
  data            date DEFAULT CURRENT_DATE,
  observacoes     text,
  created_at      timestamptz DEFAULT now()
);

-- ESTOQUE
CREATE TABLE estoque_movimentacoes (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  numero      text UNIQUE NOT NULL,   -- gerado: MV00001
  produto_id  uuid REFERENCES produtos(id),
  tipo        text,  -- Entrada, Saída, Transferência
  quantidade  numeric(12,3) NOT NULL,
  origem      text,
  destino     text,
  usuario     text,
  data        date DEFAULT CURRENT_DATE,
  hora        time DEFAULT CURRENT_TIME,
  observacoes text,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE estoque_inventarios (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  numero      text UNIQUE NOT NULL,   -- gerado: INV00001
  produto_id  uuid REFERENCES produtos(id),
  qtd_sistema numeric(12,3),
  qtd_contada numeric(12,3),
  diferenca   numeric(12,3) GENERATED ALWAYS AS (qtd_contada - qtd_sistema) STORED,
  status      text DEFAULT 'Pendente',
  responsavel text,
  data        date DEFAULT CURRENT_DATE,
  observacoes text,
  created_at  timestamptz DEFAULT now()
);

-- VENDAS E LOGÍSTICA
CREATE TABLE vendas_pedidos (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  numero          text UNIQUE NOT NULL,   -- gerado: PV00001
  cliente_id      uuid REFERENCES clientes(id),
  produto_id      uuid REFERENCES produtos(id),
  quantidade      numeric(12,3) NOT NULL,
  preco_unitario  numeric(12,2),
  valor_total     numeric(12,2) GENERATED ALWAYS AS (quantidade * preco_unitario) STORED,
  status          text DEFAULT 'Rascunho',
  data            date DEFAULT CURRENT_DATE,
  data_prevista   date,
  observacoes     text,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE vendas_notas_fiscais (
  id                      uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_nf               text NOT NULL,
  serie                   text,
  data_emissao            date,
  natureza_operacao       text,
  empresa_emitente        text,
  cliente_id              uuid REFERENCES clientes(id),
  pedido_id               uuid REFERENCES vendas_pedidos(id),
  produto_id              uuid REFERENCES produtos(id),
  quantidade              numeric(12,3),
  valor_unitario          numeric(12,2),
  valor_produtos          numeric(12,2),
  desconto                numeric(12,2) DEFAULT 0,
  frete                   numeric(12,2) DEFAULT 0,
  base_icms               numeric(12,2),
  valor_icms              numeric(12,2),
  valor_ipi               numeric(12,2),
  valor_total             numeric(12,2),
  transportadora_id       uuid REFERENCES transportadoras(id),
  frete_por_conta         text,
  qtd_volumes             integer,
  peso_liquido            numeric(12,3),
  peso_bruto              numeric(12,3),
  status                  text DEFAULT 'Rascunho',
  informacoes_complementares text,
  created_at              timestamptz DEFAULT now()
);

CREATE TABLE vendas_romaneios (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  numero            text UNIQUE NOT NULL,   -- gerado: ROM00001
  data              date DEFAULT CURRENT_DATE,
  pedido_id         uuid REFERENCES vendas_pedidos(id),
  nota_fiscal_id    uuid,
  expedicao_id      uuid,
  cliente_id        uuid REFERENCES clientes(id),
  transportadora_id uuid REFERENCES transportadoras(id),
  produto_id        uuid REFERENCES produtos(id),
  quantidade        numeric(12,3),
  qtd_volumes       integer,
  peso_liquido      numeric(12,3),
  peso_bruto        numeric(12,3),
  responsavel       text,
  status            text DEFAULT 'Rascunho',
  observacoes       text,
  created_at        timestamptz DEFAULT now()
);

CREATE TABLE vendas_separacoes (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  numero      text UNIQUE NOT NULL,   -- gerado: SEP00001
  pedido_id   uuid REFERENCES vendas_pedidos(id),
  produto_id  uuid REFERENCES produtos(id),
  quantidade  numeric(12,3) NOT NULL,
  separador   text,
  status      text DEFAULT 'Pendente',
  data        date DEFAULT CURRENT_DATE,
  observacoes text,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE vendas_expedicoes (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  numero            text UNIQUE NOT NULL,   -- gerado: EXP00001
  pedido_id         uuid REFERENCES vendas_pedidos(id),
  separacao_id      uuid REFERENCES vendas_separacoes(id),
  transportadora_id uuid REFERENCES transportadoras(id),
  quantidade        numeric(12,3),
  tipo_embalagem    text,
  status            text DEFAULT 'Pendente',
  responsavel       text,
  data              date DEFAULT CURRENT_DATE,
  observacoes       text,
  created_at        timestamptz DEFAULT now()
);

CREATE TABLE vendas_entregas (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  numero            text UNIQUE NOT NULL,   -- gerado: ENT00001
  expedicao_id      uuid REFERENCES vendas_expedicoes(id),
  transportadora_id uuid REFERENCES transportadoras(id),
  cliente_id        uuid REFERENCES clientes(id),
  codigo_rastreio   text,
  status            text DEFAULT 'Em Trânsito',
  data              date DEFAULT CURRENT_DATE,
  data_entrega      date,
  responsavel       text,
  observacoes       text,
  created_at        timestamptz DEFAULT now()
);

-- CONFIGURAÇÕES
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

### RLS (Row Level Security)

Para simplificar o desenvolvimento inicial, usar a `anon key` com RLS desabilitado nas tabelas do ERP, ou criar uma policy permissiva:

```sql
-- Habilitar RLS e criar policy permissiva (para a anon key durante desenvolvimento)
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon full access" ON clientes FOR ALL USING (true) WITH CHECK (true);
-- Repetir para cada tabela
```

### Autenticação do ERP

```js
// Login — verificar usuário na tabela erp_usuarios
async function fazerLogin(email, senha) {
  const hash = await sha256(senha);
  const rows = await listar('erp_usuarios', `email=eq.${encodeURIComponent(email)}&senha_hash=eq.${hash}&status=eq.true&select=id,nome,perfil,permissoes`);
  if (rows.length === 0) throw new Error('Credenciais inválidas');
  const user = rows[0];
  localStorage.setItem('erp_role', user.perfil);
  localStorage.setItem('erp_user_id', user.id);
  localStorage.setItem('erp_user_nome', user.nome);
  localStorage.setItem('erp_permissoes', JSON.stringify(user.permissoes));
  localStorage.setItem('erp_login', Date.now());
  return user;
}

// SHA-256 (mesmo padrão do sistema SENAI)
async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

// Verificar sessão (chamar no início de cada tela protegida)
function verificarSessao() {
  const role = localStorage.getItem('erp_role');
  const login = parseInt(localStorage.getItem('erp_login') || '0');
  const OITO_HORAS = 8 * 60 * 60 * 1000;
  if (!role || Date.now() - login > OITO_HORAS) {
    localStorage.clear();
    window.location.replace('../index.html');
  }
}

// Verificar permissão de módulo
function temPermissao(modulo) {
  const perms = JSON.parse(localStorage.getItem('erp_permissoes') || '{}');
  const role  = localStorage.getItem('erp_role');
  return role === 'Administrador' || perms[modulo] === true;
}
```

---

## Ordem de Implementação Sugerida

1. Autenticação (login, sessão, perfis)
2. Módulo Configurações → Usuários
3. Módulo Cadastros → Clientes, Fornecedores, Produtos, Transportadoras
4. Dashboard (Visão Geral)
5. Módulo Compras (fluxo completo)
6. Módulo Estoque (controle e movimentações)
7. Módulo Vendas e Logística (fluxo completo)
8. Geração de PDF (Pedido de Compras)
9. Testes de integração entre módulos

---

*Documento baseado no relatório "Campos Disponíveis por Módulo" gerado em 05/08/2026.*
