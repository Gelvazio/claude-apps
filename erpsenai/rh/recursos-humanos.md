# Módulo de Recursos Humanos (RH) — Plano Completo de Implementação

> Documento técnico para criação do Módulo de RH no ERP Senai.  
> Objetivo: gerenciar o ciclo completo do colaborador — da admissão ao desligamento — com folha de pagamento, ponto eletrônico, férias, treinamentos e benefícios.

---

## 1. Visão Geral

O módulo de RH é dividido em sub-módulos que cobrem todo o ciclo de vida do colaborador na empresa:

```
Admissão → Cadastro → Ponto Eletrônico → Folha de Pagamento → Férias / Afastamentos → Desligamento
                    ↘ Treinamentos / Benefícios
```

### 1.1 Princípios

- Campos `*` são **obrigatórios**.
- Numeração automática gerada pelo sistema (nunca editável pelo usuário).
- Soft delete em todos os registros: campo `ativo` desativa sem excluir.
- Rastreabilidade completa: todo lançamento de ponto, pagamento e alteração tem data/hora/usuário responsável.

---

## 2. Cadastros Base

### 2.1 Departamentos

| Campo | Tipo | Regras |
|-------|------|--------|
| Código | Texto | **Gerado automaticamente** — formato `DEP00001` |
| Nome do Departamento | Texto | **Obrigatório** |
| Responsável | Select | Funcionário ativo (gerente do depto.) |
| Centro de Custo | Texto | Código do centro de custo |
| Ativo | Toggle | Default: Ativo |
| Observações | Texto longo | — |

**Regras:**
- Departamento inativo não aparece em selects de outros módulos.
- Ao inativar, alertar se houver funcionários ativos vinculados.

---

### 2.2 Cargos

| Campo | Tipo | Regras |
|-------|------|--------|
| Código | Texto | **Gerado automaticamente** — formato `CGO00001` |
| Nome do Cargo | Texto | **Obrigatório** |
| Departamento | Select | **Obrigatório**. Departamentos ativos |
| CBO | Texto | Código Brasileiro de Ocupações (ex: 2521-05) |
| Salário Base | Número | R$ — referência para o cargo |
| Nível | Select | Júnior, Pleno, Sênior, Especialista, Gerência |
| Ativo | Toggle | Default: Ativo |
| Descrição | Texto longo | Descrição das atividades e requisitos |

---

### 2.3 Funcionários

| Campo | Tipo | Regras |
|-------|------|--------|
| Matrícula | Texto | **Gerado automaticamente** — formato `F00001` |
| Nome Completo | Texto | **Obrigatório** |
| CPF | Texto | **Obrigatório**. Validação de formato e unicidade |
| RG | Texto | — |
| Data de Nascimento | Data | — |
| Sexo | Select | Masculino, Feminino, Não informado |
| Estado Civil | Select | Solteiro, Casado, Divorciado, Viúvo, União Estável |
| E-mail | E-mail | Validação de formato |
| Telefone | Texto | Máscara de telefone brasileiro |
| Endereço | Texto | — |
| Cidade | Texto | — |
| Estado | Select | 27 UFs brasileiras |
| CEP | Texto | Máscara + autopreenchimento ViaCEP |
| Departamento | Select | **Obrigatório**. Departamentos ativos |
| Cargo | Select | **Obrigatório**. Cargos ativos do departamento |
| Tipo de Contrato | Select | CLT, PJ, Estágio, Temporário, Aprendiz |
| Salário | Número | R$ — salário individual (pode diferir do salário base do cargo) |
| Data de Admissão | Data | **Obrigatório** |
| Data de Desligamento | Data | Preenchida no desligamento |
| Banco | Select | Lista de bancos brasileiros |
| Agência | Texto | — |
| Conta | Texto | — |
| Tipo de Conta | Select | Corrente, Poupança |
| Chave PIX | Texto | CPF, e-mail, telefone ou chave aleatória |
| Foto | Upload | JPG/PNG — exibir thumbnail |
| PIS/PASEP | Texto | — |
| CTPS (Série/Número) | Texto | — |
| Ativo | Toggle | Default: Ativo |
| Observações | Texto longo | — |

**Regras:**
- CPF não pode ser duplicado.
- Ao inativar, preencher automaticamente Data de Desligamento com a data atual.
- Autopreenchimento de Endereço/Cidade/Estado via ViaCEP ao digitar o CEP.
- Funcionário inativo não aparece em selects dos demais módulos.

---

### 2.4 Benefícios Cadastrados

Tabela de referência com os tipos de benefícios oferecidos pela empresa.

| Campo | Tipo | Regras |
|-------|------|--------|
| Nome do Benefício | Texto | **Obrigatório** (ex: Vale Refeição, Plano de Saúde) |
| Tipo | Select | Vale Refeição, Vale Transporte, Plano de Saúde, Plano Odontológico, Seguro de Vida, Outros |
| Valor Empresa | Número | R$ — parcela paga pela empresa |
| Valor Funcionário | Número | R$ — desconto na folha do funcionário |
| Ativo | Toggle | Default: Ativo |
| Observações | Texto longo | — |

---

## 3. Ponto Eletrônico

### 3.1 Jornadas de Trabalho

Configuração dos horários padrão.

| Campo | Tipo | Regras |
|-------|------|--------|
| Nome da Jornada | Texto | **Obrigatório** (ex: "Comercial 8h", "Turno Noturno") |
| Entrada | Hora | Horário de entrada padrão |
| Início Intervalo | Hora | — |
| Fim Intervalo | Hora | — |
| Saída | Hora | Horário de saída padrão |
| Carga Horária Diária | Número | Em horas (ex: 8.0) |
| Dias da Semana | Checkboxes | Seg, Ter, Qua, Qui, Sex, Sáb, Dom |
| Ativo | Toggle | Default: Ativo |

---

### 3.2 Registros de Ponto

Lançamentos individuais de ponto por funcionário.

| Campo | Tipo | Regras |
|-------|------|--------|
| Número | Texto | **Gerado automaticamente** — formato `PT00001` |
| Funcionário | Select | **Obrigatório**. Funcionários ativos |
| Data | Data | **Obrigatório** (default: hoje) |
| Entrada | Hora | — |
| Início Intervalo | Hora | — |
| Fim Intervalo | Hora | — |
| Saída | Hora | — |
| Horas Trabalhadas | Número | **Calculado automaticamente** (Saída − Entrada − Intervalo) |
| Horas Extras | Número | **Calculado automaticamente** (Horas Trabalhadas − Carga Horária da Jornada) |
| Ocorrência | Select | Normal, Falta, Falta Justificada, Atestado, Folga, Feriado |
| Responsável | Select/Texto | Usuário que registrou |
| Observações | Texto longo | — |

**Regras:**
- Horas Extras negativas = atraso/saída antecipada.
- Ocorrência "Falta" gera desconto automático na folha.
- Ocorrência "Atestado" não gera desconto.

---

### 3.3 Apuração de Ponto (Painel)

Visão consolidada por período — **não possui formulário próprio**.

- Filtros: Funcionário, Departamento, Período (Mês/Ano).
- Exibe por funcionário: total de dias trabalhados, faltas, horas extras acumuladas, banco de horas.
- Exportar relatório em PDF.

---

## 4. Folha de Pagamento

### 4.1 Competências (Períodos de Folha)

| Campo | Tipo | Regras |
|-------|------|--------|
| Competência | Texto | **Obrigatório** — formato `AAAA-MM` (ex: `2026-08`) |
| Status | Select | Em Elaboração, Fechada, Paga |
| Data de Pagamento | Data | Data de crédito em conta |
| Observações | Texto longo | — |

---

### 4.2 Lançamentos da Folha

Registros individuais de vencimentos e descontos por funcionário/competência.

| Campo | Tipo | Regras |
|-------|------|--------|
| Número | Texto | **Gerado automaticamente** — formato `FL00001` |
| Competência | Select | **Obrigatório**. Competências em elaboração |
| Funcionário | Select | **Obrigatório**. Funcionários ativos |
| Salário Bruto | Número | Preenchido automaticamente com o salário do funcionário |
| Horas Extras | Número | Importado do ponto do período |
| Valor Horas Extras | Número | **Calculado automaticamente** |
| Adicionais | Número | R$ — adicionais manuais (insalubridade, periculosidade, etc.) |
| INSS | Número | **Calculado automaticamente** — tabela progressiva |
| IRRF | Número | **Calculado automaticamente** — tabela progressiva |
| Desconto Vale Transporte | Número | Máximo 6% do salário bruto |
| Desconto Vale Refeição | Número | Conforme política da empresa |
| Outros Descontos | Número | R$ — descontos manuais |
| Salário Líquido | Número | **Calculado automaticamente** (Bruto + Extras + Adicionais − INSS − IRRF − Descontos) |
| Status | Select | Rascunho, Calculado, Aprovado, Pago |
| Observações | Texto longo | — |

**Tabela INSS 2026 (referência):**
| Faixa Salarial | Alíquota |
|----------------|----------|
| Até R$ 1.518,00 | 7,5% |
| R$ 1.518,01 – R$ 2.793,88 | 9% |
| R$ 2.793,89 – R$ 4.190,83 | 12% |
| R$ 4.190,84 – R$ 8.157,41 | 14% |

**Regras:**
- Folha só pode ser fechada quando todos os lançamentos estão com status "Aprovado".
- Ao fechar, gerar arquivo de pagamento (listagem para banco).
- Botão **"Salvar como PDF"** — gera holerite individual por funcionário.

---

### 4.3 13º Salário

| Campo | Tipo | Regras |
|-------|------|--------|
| Número | Texto | **Gerado automaticamente** — formato `13S00001` |
| Competência | Texto | Ano de referência (ex: `2026`) |
| Funcionário | Select | **Obrigatório** |
| Parcela | Select | 1ª Parcela (novembro), 2ª Parcela (dezembro) |
| Valor Bruto | Número | Calculado proporcionalmente (meses trabalhados / 12 × salário) |
| INSS | Número | Calculado automaticamente |
| IRRF | Número | Calculado (apenas na 2ª parcela) |
| Valor Líquido | Número | Calculado automaticamente |
| Status | Select | Rascunho, Calculado, Pago |

---

## 5. Férias e Afastamentos

### 5.1 Controle de Férias

| Campo | Tipo | Regras |
|-------|------|--------|
| Número | Texto | **Gerado automaticamente** — formato `FER00001` |
| Funcionário | Select | **Obrigatório**. Funcionários ativos |
| Período Aquisitivo | Texto | Ex: `2025-08 a 2026-07` (calculado com base na admissão) |
| Dias de Férias | Número | Default: 30. Pode ser fracionado (mínimo 10 dias por período) |
| Data de Início | Data | **Obrigatório** |
| Data de Término | Data | **Calculada automaticamente** (Início + Dias − 1) |
| Abono Pecuniário | Toggle | Vender até 10 dias de férias em dinheiro |
| Valor Adicional (1/3) | Número | **Calculado automaticamente** |
| Status | Select | Agendada, Em Gozo, Concluída, Cancelada |
| Aprovado por | Select/Texto | Usuário aprovador |
| Observações | Texto longo | — |

**Regras:**
- Férias vencem após 12 meses de trabalho (período aquisitivo).
- Alerta visual quando funcionário está com férias vencidas (período > 24 meses sem gozar).
- Fracionamento: máximo 3 períodos, sendo pelo menos um ≥ 14 dias.

---

### 5.2 Afastamentos

| Campo | Tipo | Regras |
|-------|------|--------|
| Número | Texto | **Gerado automaticamente** — formato `AFS00001` |
| Funcionário | Select | **Obrigatório** |
| Tipo | Select | Atestado Médico, INSS/Auxílio-Doença, Licença Maternidade, Licença Paternidade, Licença Sem Vencimento, Acidente de Trabalho, Outros |
| Data de Início | Data | **Obrigatório** |
| Data de Término | Data | — (pode ser em aberto) |
| Dias Afastados | Número | **Calculado automaticamente** quando data de término preenchida |
| CID | Texto | Código da doença (para atestados médicos) |
| Número INSS | Texto | Para benefícios previdenciários |
| Gera Desconto | Toggle | Default: Não (atestado não desconta; falta injustificada desconta) |
| Documento | Upload | PDF do atestado/documento de suporte |
| Status | Select | Ativo, Encerrado |
| Responsável | Select/Texto | — |
| Observações | Texto longo | — |

---

## 6. Treinamentos

### 6.1 Catálogo de Treinamentos

| Campo | Tipo | Regras |
|-------|------|--------|
| Código | Texto | **Gerado automaticamente** — formato `TRN00001` |
| Nome do Treinamento | Texto | **Obrigatório** |
| Tipo | Select | Integração, Técnico, Comportamental, Segurança do Trabalho, Compliance, Outros |
| Modalidade | Select | Presencial, Online, Híbrido |
| Carga Horária | Número | Em horas |
| Obrigatório | Toggle | Se obrigatório, todos os funcionários devem realizar |
| Validade (meses) | Número | 0 = sem validade. Ex: 12 = precisa refazer anualmente |
| Instrutor/Responsável | Texto | — |
| Custo | Número | R$ por participante |
| Ativo | Toggle | Default: Ativo |
| Descrição | Texto longo | — |

---

### 6.2 Participações em Treinamentos

| Campo | Tipo | Regras |
|-------|------|--------|
| Número | Texto | **Gerado automaticamente** — formato `PAR00001` |
| Treinamento | Select | **Obrigatório**. Treinamentos ativos |
| Funcionário | Select | **Obrigatório**. Funcionários ativos |
| Data de Realização | Data | **Obrigatório** |
| Data de Vencimento | Data | **Calculada automaticamente** (Realização + Validade do treinamento) |
| Nota / Aprovação | Número | 0–10 (opcional) |
| Status | Select | Pendente, Realizado, Aprovado, Reprovado, Vencido |
| Certificado | Upload | PDF do certificado |
| Observações | Texto longo | — |

**Regras:**
- Alerta visual quando treinamento obrigatório está vencido ou pendente.
- Exibir badge de atenção no cadastro do funcionário se há treinamento obrigatório em aberto.

---

## 7. Admissão e Desligamento

### 7.1 Solicitação de Admissão

| Campo | Tipo | Regras |
|-------|------|--------|
| Número | Texto | **Gerado automaticamente** — formato `ADM00001` |
| Cargo Solicitado | Select | **Obrigatório**. Cargos ativos |
| Departamento | Select | Preenchido automaticamente com base no cargo |
| Salário Proposto | Número | R$ |
| Justificativa | Texto longo | Motivo da contratação |
| Tipo de Contrato | Select | CLT, PJ, Estágio, Temporário, Aprendiz |
| Data de Início Prevista | Data | — |
| Solicitante | Select/Texto | Usuário que solicitou |
| Status | Select | Pendente, Aprovada, Reprovada, Cancelada, Concluída |
| Aprovado por | Select/Texto | — |
| Observações | Texto longo | — |

---

### 7.2 Desligamento

| Campo | Tipo | Regras |
|-------|------|--------|
| Número | Texto | **Gerado automaticamente** — formato `DLG00001` |
| Funcionário | Select | **Obrigatório**. Funcionários ativos |
| Tipo de Desligamento | Select | Pedido de Demissão, Dispensa Sem Justa Causa, Dispensa Com Justa Causa, Término de Contrato, Aposentadoria, Falecimento, Outros |
| Data de Aviso Prévio | Data | — |
| Data de Desligamento | Data | **Obrigatório** |
| Dias de Aviso | Número | 30 dias padrão CLT; proporcional conforme anos trabalhados |
| Aviso Trabalhado | Toggle | Sim = funcionário cumpre o aviso; Não = indenizado |
| Saldo de Férias | Número | Dias de férias a pagar na rescisão (calculado automaticamente) |
| 13º Proporcional | Número | Meses trabalhados no ano corrente (calculado automaticamente) |
| Multa FGTS (40%) | Número | Sobre saldo do FGTS (apenas dispensa sem justa causa) |
| Motivo | Texto longo | Descrição do motivo |
| Homologado por | Select/Texto | Responsável pela homologação |
| Status | Select | Em Andamento, Homologado, Cancelado |

**Regras:**
- Ao confirmar desligamento, marcar o funcionário como inativo automaticamente.
- Calcular automaticamente: saldo de férias proporcionais, 13º proporcional e aviso prévio.

---

## 8. Vínculos de Benefícios

Registro dos benefícios atribuídos a cada funcionário.

| Campo | Tipo | Regras |
|-------|------|--------|
| Funcionário | Select | **Obrigatório** |
| Benefício | Select | **Obrigatório**. Benefícios cadastrados e ativos |
| Data de Início | Data | **Obrigatório** |
| Data de Término | Data | — (em branco = benefício vigente) |
| Valor Customizado | Número | Sobrescreve o valor padrão do benefício (se aplicável) |
| Observações | Texto longo | — |

---

## 9. Painel de RH (Dashboard do Módulo)

Visão consolidada — **não possui formulário próprio**.

- Total de funcionários ativos por departamento.
- Headcount: admissões e desligamentos do mês.
- Funcionários com férias vencidas (alerta).
- Treinamentos obrigatórios pendentes ou vencidos.
- Folha do mês: total de salários brutos e líquidos.
- Próximas férias agendadas (próximos 30 dias).
- Aniversariantes do mês.

---

## 10. Telas do Módulo

```
rh/
├── dashboard.html          ← Painel de RH
├── departamentos.html      ← CRUD de departamentos
├── cargos.html             ← CRUD de cargos
├── funcionarios.html       ← CRUD de funcionários (listagem + modal)
├── beneficios.html         ← CRUD de benefícios cadastrados
├── jornadas.html           ← CRUD de jornadas de trabalho
├── ponto.html              ← Lançamentos de ponto
├── apuracao-ponto.html     ← Painel de apuração por período
├── folha.html              ← Competências e lançamentos da folha
├── decimo-terceiro.html    ← 13º salário
├── ferias.html             ← Controle de férias
├── afastamentos.html       ← Afastamentos e atestados
├── treinamentos.html       ← Catálogo de treinamentos
├── participacoes.html      ← Participações em treinamentos por funcionário
├── admissao.html           ← Solicitações de admissão
└── desligamento.html       ← Registro de desligamento / rescisão
```

---

## 11. Estrutura de Dados — Tabelas Supabase

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

-- BENEFÍCIOS (catálogo)
CREATE TABLE rh_beneficios (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome                text NOT NULL,
  tipo                text,
  valor_empresa       numeric(12,2) DEFAULT 0,
  valor_funcionario   numeric(12,2) DEFAULT 0,
  ativo               boolean DEFAULT true,
  observacoes         text,
  created_at          timestamptz DEFAULT now()
);

-- VÍNCULOS DE BENEFÍCIOS
CREATE TABLE rh_funcionario_beneficios (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  funcionario_id    uuid REFERENCES rh_funcionarios(id),
  beneficio_id      uuid REFERENCES rh_beneficios(id),
  data_inicio       date NOT NULL,
  data_termino      date,
  valor_customizado numeric(12,2),
  observacoes       text,
  created_at        timestamptz DEFAULT now()
);

-- JORNADAS
CREATE TABLE rh_jornadas (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome                text NOT NULL,
  entrada             time,
  inicio_intervalo    time,
  fim_intervalo       time,
  saida               time,
  carga_horaria_diaria numeric(4,2),
  dias_semana         text[],   -- ['seg','ter','qua','qui','sex']
  ativo               boolean DEFAULT true,
  created_at          timestamptz DEFAULT now()
);

-- PONTO
CREATE TABLE rh_ponto (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  numero          text UNIQUE NOT NULL,   -- gerado: PT00001
  funcionario_id  uuid REFERENCES rh_funcionarios(id),
  data            date NOT NULL,
  entrada         time,
  inicio_intervalo time,
  fim_intervalo   time,
  saida           time,
  horas_trabalhadas numeric(5,2),
  horas_extras    numeric(5,2),
  ocorrencia      text DEFAULT 'Normal',
  responsavel     text,
  observacoes     text,
  created_at      timestamptz DEFAULT now()
);

-- COMPETÊNCIAS DE FOLHA
CREATE TABLE rh_folha_competencias (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  competencia      text UNIQUE NOT NULL,  -- formato AAAA-MM
  status           text DEFAULT 'Em Elaboração',
  data_pagamento   date,
  observacoes      text,
  created_at       timestamptz DEFAULT now()
);

-- LANÇAMENTOS DA FOLHA
CREATE TABLE rh_folha_lancamentos (
  id                        uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  numero                    text UNIQUE NOT NULL,  -- gerado: FL00001
  competencia_id            uuid REFERENCES rh_folha_competencias(id),
  funcionario_id            uuid REFERENCES rh_funcionarios(id),
  salario_bruto             numeric(12,2),
  horas_extras              numeric(5,2) DEFAULT 0,
  valor_horas_extras        numeric(12,2) DEFAULT 0,
  adicionais                numeric(12,2) DEFAULT 0,
  inss                      numeric(12,2) DEFAULT 0,
  irrf                      numeric(12,2) DEFAULT 0,
  desc_vale_transporte      numeric(12,2) DEFAULT 0,
  desc_vale_refeicao        numeric(12,2) DEFAULT 0,
  outros_descontos          numeric(12,2) DEFAULT 0,
  salario_liquido           numeric(12,2),
  status                    text DEFAULT 'Rascunho',
  observacoes               text,
  created_at                timestamptz DEFAULT now()
);

-- 13º SALÁRIO
CREATE TABLE rh_decimo_terceiro (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  numero         text UNIQUE NOT NULL,   -- gerado: 13S00001
  competencia    text NOT NULL,          -- ano (ex: '2026')
  funcionario_id uuid REFERENCES rh_funcionarios(id),
  parcela        text NOT NULL,          -- '1ª Parcela', '2ª Parcela'
  valor_bruto    numeric(12,2),
  inss           numeric(12,2) DEFAULT 0,
  irrf           numeric(12,2) DEFAULT 0,
  valor_liquido  numeric(12,2),
  status         text DEFAULT 'Rascunho',
  created_at     timestamptz DEFAULT now()
);

-- FÉRIAS
CREATE TABLE rh_ferias (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  numero              text UNIQUE NOT NULL,   -- gerado: FER00001
  funcionario_id      uuid REFERENCES rh_funcionarios(id),
  periodo_aquisitivo  text,
  dias_ferias         integer DEFAULT 30,
  data_inicio         date NOT NULL,
  data_termino        date,
  abono_pecuniario    boolean DEFAULT false,
  valor_adicional     numeric(12,2),
  status              text DEFAULT 'Agendada',
  aprovado_por        text,
  observacoes         text,
  created_at          timestamptz DEFAULT now()
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
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo       text UNIQUE NOT NULL,   -- gerado: TRN00001
  nome         text NOT NULL,
  tipo         text,
  modalidade   text,
  carga_horaria numeric(5,1),
  obrigatorio  boolean DEFAULT false,
  validade_meses integer DEFAULT 0,
  instrutor    text,
  custo        numeric(12,2) DEFAULT 0,
  ativo        boolean DEFAULT true,
  descricao    text,
  created_at   timestamptz DEFAULT now()
);

-- PARTICIPAÇÕES EM TREINAMENTOS
CREATE TABLE rh_participacoes (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  numero           text UNIQUE NOT NULL,   -- gerado: PAR00001
  treinamento_id   uuid REFERENCES rh_treinamentos(id),
  funcionario_id   uuid REFERENCES rh_funcionarios(id),
  data_realizacao  date NOT NULL,
  data_vencimento  date,
  nota             numeric(4,1),
  status           text DEFAULT 'Realizado',
  certificado_url  text,
  observacoes      text,
  created_at       timestamptz DEFAULT now()
);

-- ADMISSÕES
CREATE TABLE rh_admissoes (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  numero              text UNIQUE NOT NULL,   -- gerado: ADM00001
  cargo_id            uuid REFERENCES rh_cargos(id),
  departamento_id     uuid REFERENCES rh_departamentos(id),
  salario_proposto    numeric(12,2),
  justificativa       text,
  tipo_contrato       text,
  data_inicio_prevista date,
  solicitante         text,
  status              text DEFAULT 'Pendente',
  aprovado_por        text,
  observacoes         text,
  created_at          timestamptz DEFAULT now()
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

-- RLS permissivo para todas as tabelas de RH
DO $$
DECLARE tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'rh_departamentos','rh_cargos','rh_funcionarios','rh_beneficios',
    'rh_funcionario_beneficios','rh_jornadas','rh_ponto',
    'rh_folha_competencias','rh_folha_lancamentos','rh_decimo_terceiro',
    'rh_ferias','rh_afastamentos','rh_treinamentos','rh_participacoes',
    'rh_admissoes','rh_desligamentos'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('CREATE POLICY "anon full" ON %I FOR ALL USING (true) WITH CHECK (true)', tbl);
  END LOOP;
END $$;
```

---

## 11.1 Tabelas com Nomenclatura Definitiva

As tabelas abaixo usam os nomes exatos conforme definido pelo módulo de RH:

### `beneficios` — Catálogo de Benefícios

Lista de todos os benefícios oferecidos pela empresa (referência central).

```sql
CREATE TABLE beneficios (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome              text NOT NULL,                  -- Ex: Vale Refeição, Plano de Saúde
  tipo              text,                           -- 'Vale Refeição','Vale Transporte','Plano de Saúde','Plano Odontológico','Seguro de Vida','Outros'
  descricao         text,
  valor_empresa     numeric(12,2) DEFAULT 0,        -- Parcela paga pela empresa
  valor_funcionario numeric(12,2) DEFAULT 0,        -- Desconto na folha do funcionário
  periodicidade     text DEFAULT 'Mensal',          -- 'Mensal','Anual','Eventual'
  obrigatorio       boolean DEFAULT false,          -- Se obrigatório para todos os CLT
  ativo             boolean DEFAULT true,
  created_at        timestamptz DEFAULT now()
);

ALTER TABLE beneficios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon full" ON beneficios FOR ALL USING (true) WITH CHECK (true);
```

---

### `beneficio_funcionario` — Vínculo Funcionário × Benefício

Controla quais benefícios cada funcionário recebe, com datas de vigência.

```sql
CREATE TABLE beneficio_funcionario (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  funcionario_id    uuid REFERENCES rh_funcionarios(id) ON DELETE CASCADE,
  beneficio_id      uuid REFERENCES beneficios(id),
  data_inicio       date NOT NULL DEFAULT CURRENT_DATE,
  data_termino      date,                           -- NULL = benefício vigente
  valor_customizado numeric(12,2),                 -- Sobrescreve valor padrão do benefício
  observacoes       text,
  created_at        timestamptz DEFAULT now()
);

ALTER TABLE beneficio_funcionario ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon full" ON beneficio_funcionario FOR ALL USING (true) WITH CHECK (true);
```

**Regras:**
- Um funcionário pode ter múltiplos benefícios simultâneos.
- `data_termino NULL` = benefício ativo.
- `valor_customizado NULL` = usar o valor padrão da tabela `beneficios`.
- Ao desligar funcionário, definir `data_termino` para todos os vínculos ativos.

---

### `progressao_desempenho` — Progressão de Carreira e Salário

Define a faixa salarial e os critérios de progressão para cada cargo/nível.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| Cargo | Select | Cargo de referência |
| Nível | Select | Júnior, Pleno, Sênior, Especialista, Gerência |
| Salário Mínimo | Número | Piso salarial para o nível |
| Salário Médio | Número | Referência de mercado |
| Salário Máximo | Número | Teto salarial para o nível |
| Tempo Mínimo (meses) | Número | Tempo mínimo no nível atual para promoção |
| Nota Mínima Desempenho | Número | Nota mínima na avaliação para avançar (0–10) |
| Requisitos | Texto | Critérios adicionais (certificações, treinamentos, etc.) |
| Ativo | Toggle | — |

```sql
CREATE TABLE progressao_desempenho (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cargo_id              uuid REFERENCES rh_cargos(id),
  nivel                 text NOT NULL,             -- 'Júnior','Pleno','Sênior','Especialista','Gerência'
  nivel_ordem           integer NOT NULL,          -- 1=Júnior, 2=Pleno, 3=Sênior, 4=Especialista, 5=Gerência
  salario_minimo        numeric(12,2) NOT NULL,
  salario_medio         numeric(12,2),
  salario_maximo        numeric(12,2) NOT NULL,
  tempo_minimo_meses    integer DEFAULT 12,        -- Tempo mínimo no nível atual
  nota_minima           numeric(4,1) DEFAULT 7.0,  -- Nota mínima para promoção
  requisitos            text,                      -- Texto livre: certificações, treinamentos, etc.
  ativo                 boolean DEFAULT true,
  created_at            timestamptz DEFAULT now()
);

ALTER TABLE progressao_desempenho ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon full" ON progressao_desempenho FOR ALL USING (true) WITH CHECK (true);
```

**Exemplo de cadastro:**
| Cargo | Nível | Salário Mín. | Salário Máx. | Tempo Mín. | Nota Mín. |
|-------|-------|-------------|-------------|-----------|----------|
| Analista de TI | Júnior | R$ 3.000 | R$ 4.500 | 12 meses | 7,0 |
| Analista de TI | Pleno | R$ 4.500 | R$ 7.000 | 24 meses | 7,5 |
| Analista de TI | Sênior | R$ 7.000 | R$ 12.000 | 36 meses | 8,0 |

---

### `avaliacao_desempenho` — Avaliações Periódicas por Funcionário

Registro das avaliações de desempenho aplicadas a cada funcionário.

| Campo | Tipo | Regras |
|-------|------|--------|
| Número | Texto | **Gerado automaticamente** — formato `AVL00001` |
| Funcionário | Select | **Obrigatório** |
| Avaliador | Select/Texto | Usuário que realizou a avaliação |
| Período | Texto | Ex: `2026-S1` (semestral) ou `2026` (anual) |
| Nota Técnica | Número | 0–10 — competências técnicas |
| Nota Comportamental | Número | 0–10 — competências comportamentais |
| Nota Geral | Número | **Calculada automaticamente** — média ponderada |
| Elegível para Promoção | Toggle | Calculado com base nas regras de progressao_desempenho |
| Promoção Aprovada | Toggle | Aprovação manual pelo gestor |
| Novo Nível | Select | Nível após promoção (se aprovada) |
| Novo Salário | Número | Salário após promoção |
| Data da Avaliação | Data | **Obrigatório** |
| Próxima Avaliação | Data | Calculada automaticamente (+ 6 ou 12 meses) |
| Observações | Texto longo | — |

```sql
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

ALTER TABLE avaliacao_desempenho ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon full" ON avaliacao_desempenho FOR ALL USING (true) WITH CHECK (true);
```

**Regras de elegibilidade para promoção (verificadas automaticamente):**
1. Nota geral ≥ `nota_minima` da tabela `progressao_desempenho` para o nível atual.
2. Tempo no nível atual ≥ `tempo_minimo_meses` da tabela `progressao_desempenho`.
3. Salário atual < `salario_maximo` do nível seguinte.

---

## 12. Numeração Automática

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

---

## 13. Sidebar HTML (RH)

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

---

## 14. Sistema e Telas no Banco

```sql
-- Sistema (siscodigo 11)
INSERT INTO sistema (siscodigo, sisnome, sisativo, sisordem)
VALUES (11, 'Recursos Humanos', 1, 11);

-- Telas do módulo
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
-- Depois vincular IDs gerados em tela_sistema com sistema_id=11
```

---

## 15. Ordem de Implementação Sugerida

1. **Cadastros base**: Departamentos → Cargos → Funcionários → Benefícios → Jornadas
2. **Ponto Eletrônico**: Lançamentos → Apuração
3. **Folha de Pagamento**: Competências → Lançamentos → 13º Salário
4. **Férias e Afastamentos**
5. **Treinamentos**: Catálogo → Participações
6. **Admissão e Desligamento**
7. **Dashboard RH** (consolida dados dos sub-módulos)

---

*Documento criado em 2026-08-16. Atualizar conforme o módulo for implementado.*
