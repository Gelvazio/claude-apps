# Módulo Cadastros — Referência de Desenvolvimento

> Módulo base do sistema. Todos os demais módulos dependem dos cadastros aqui realizados.

---

## Fluxo

Cadastros são tabelas mestre referenciadas por todos os outros módulos. Não há fluxo sequencial — cada entidade é independente.

---

## 1. Clientes (`clientes.html`)

Cadastro de clientes pessoa física ou jurídica.

### Campos

| Campo | Tipo | Regras |
|-------|------|--------|
| Nome / Razão Social | Texto | **Obrigatório** |
| CNPJ / CPF | Texto | Validação CPF `000.000.000-00` ou CNPJ `00.000.000/0001-00` |
| E-mail | E-mail | Validação de formato |
| Telefone | Texto | Máscara telefone brasileiro |
| Segmento | Select | Tecnologia, Saúde, Varejo, Alimentação, Automobilístico, Metalmecânica, Madeireiro, Serviços, Agricultura, Transporte, Outros |
| Endereço | Texto | — |
| Cidade | Texto | — |
| Estado | Select | 27 UFs brasileiras |
| CEP | Texto | Máscara `00000-000` + autopreenchimento ViaCEP |
| Ativo | Toggle | Default: Ativo |

### Regras de Negócio
- CNPJ/CPF único — não permitir duplicatas.
- ViaCEP: ao digitar CEP, preencher Endereço, Cidade e Estado automaticamente.
- Cliente inativo não aparece em selects de outros módulos (Pedido de Venda, Romaneio, Entrega, NF de Venda).

### Tabela Supabase
```sql
CREATE TABLE clientes (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome       text NOT NULL,
  cnpj_cpf   text,
  email      text,
  telefone   text,
  segmento   text,
  endereco   text,
  cidade     text,
  estado     text,
  cep        text,
  ativo      boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
```

---

## 2. Fornecedores (`fornecedores.html`)

Cadastro de fornecedores (sempre pessoa jurídica).

### Campos

| Campo | Tipo | Regras |
|-------|------|--------|
| Nome / Razão Social | Texto | **Obrigatório** |
| CNPJ | Texto | Validação CNPJ |
| Contato | Texto | Nome da pessoa de contato |
| E-mail | E-mail | Validação de formato |
| Telefone | Texto | Máscara de telefone |
| Segmento | Select | Mesmos segmentos de Clientes |
| Endereço | Texto | — |
| Cidade | Texto | — |
| Estado | Select | 27 UFs |
| CEP | Texto | Máscara + ViaCEP |
| Ativo | Toggle | Default: Ativo |

### Regras de Negócio
- CNPJ único.
- Fornecedor inativo não aparece em Pedidos de Compra, Recebimento, Conferência, NF de Compra.

### Tabela Supabase
```sql
CREATE TABLE fornecedores (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome       text NOT NULL,
  cnpj       text,
  contato    text,
  email      text,
  telefone   text,
  segmento   text,
  endereco   text,
  cidade     text,
  estado     text,
  cep        text,
  ativo      boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
```

---

## 3. Produtos (`produtos.html`)

Catálogo de produtos da empresa.

### Campos

| Campo | Tipo | Regras |
|-------|------|--------|
| Código | Texto | **Gerado automaticamente** — formato `P00001` |
| Nome do Produto | Texto | **Obrigatório** |
| Categoria | Select | Tecnologia, Saúde, Varejo, Alimentação, Automobilístico, Metalmecânica, Madeireiro, Serviços, Agricultura, Transporte, Embalagens, Manutenção e Reparos, Outros |
| Unidade | Select | UN, KG, LT, CX, PC, MT |
| Preço de Custo | Número | Formato R$ 1.000,00 |
| Preço de Venda | Número | Formato R$ 1.000,00 |
| Estoque Atual | Número | **Não editável** — calculado via movimentações |
| Estoque Mínimo | Número | Alerta quando `Estoque Atual ≤ Estoque Mínimo` |
| Estoque Máximo | Número | — |
| Imagem | Upload | JPG/PNG — thumbnail na listagem |
| Descrição | Textarea | — |
| Ativo | Toggle | Default: Ativo |

### Regras de Negócio
- Código `P00001` gerado sequencialmente e nunca repetido.
- Estoque Atual atualizado por movimentações (entradas via Recebimento, saídas via Expedição).
- Alerta visual (badge vermelho) quando `Estoque Atual ≤ Estoque Mínimo`.
- Produto inativo não aparece em selects de outros módulos.

### Tabela Supabase
```sql
CREATE TABLE produtos (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo         text UNIQUE NOT NULL,
  nome           text NOT NULL,
  categoria      text,
  unidade        text,
  preco_custo    numeric(12,2),
  preco_venda    numeric(12,2),
  estoque_atual  numeric(12,3) DEFAULT 0,
  estoque_minimo numeric(12,3) DEFAULT 0,
  estoque_maximo numeric(12,3),
  imagem_url     text,
  descricao      text,
  ativo          boolean DEFAULT true,
  created_at     timestamptz DEFAULT now()
);
```

---

## 4. Transportadoras (`transportadoras.html`)

Cadastro das empresas de transporte.

### Campos

| Campo | Tipo | Regras |
|-------|------|--------|
| Nome da Transportadora | Texto | **Obrigatório** |
| CNPJ | Texto | Validação CNPJ |
| Tipo de Serviço | Select | Rodoviário, Aéreo, Marítimo, Expresso |
| Contato | Texto | Nome do responsável |
| E-mail | E-mail | Validação de formato |
| Telefone | Texto | Máscara |
| Cidade | Texto | — |
| Estado | Select | 27 UFs |
| Ativa | Toggle | Default: Ativa |

### Regras de Negócio
- Transportadora inativa não aparece em Romaneio, Expedição, Entrega, NF de Venda.

### Tabela Supabase
```sql
CREATE TABLE transportadoras (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome         text NOT NULL,
  cnpj         text,
  tipo_servico text,
  contato      text,
  email        text,
  telefone     text,
  cidade       text,
  estado       text,
  ativa        boolean DEFAULT true,
  created_at   timestamptz DEFAULT now()
);
```

---

## Padrões de Interface

- Listagem com busca por texto, filtro por status (Ativo/Inativo), ordenação por coluna.
- Ações: **Editar**, **Visualizar**, **Excluir** (com confirmação modal).
- Formulário com validação em tempo real dos campos obrigatórios.
- Mensagem de sucesso/erro após salvar.
- Tabelas envolvidas em `<div class="crud-table-wrap">` para scroll horizontal mobile.
