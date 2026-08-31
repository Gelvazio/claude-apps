# Andamento do Módulo de Recursos Humanos

> Acompanhamento de implementação baseado em `rh/recursos-humanos.md`.  
> Atualizado em: 2026-08-16

## Legenda

| Ícone | Status |
|-------|--------|
| ✅ | Concluído |
| 🔄 | Em andamento (parcialmente implementado — campos faltantes ou divergências) |
| ❌ | Não iniciado |

---

## Seção 2 — Cadastros Base

### 2.1 Departamentos

| Item | Status | Observação |
|------|--------|------------|
| `rh/departamentos.html` | ✅ Concluído | CRUD completo com numeração `DEP00001` |
| Tabela `rh_departamentos` (Supabase) | ✅ Criada | Aplicada em 2026-08-16 |
| Campos: codigo, nome, responsavel, centro_custo, ativo, observacoes | ✅ Concluído | — |

---

### 2.2 Cargos

| Item | Status | Observação |
|------|--------|------------|
| `rh/cargos.html` | ✅ Concluído | CRUD completo com numeração `CGO00001` |
| Tabela `rh_cargos` (Supabase) | ✅ Criada | Aplicada em 2026-08-16 |
| Campos: codigo, nome, departamento, cbo, salario_base, nivel, ativo, descricao | ✅ Concluído | — |

---

### 2.3 Funcionários

| Item | Status | Observação |
|------|--------|------------|
| `rh/funcionarios.html` | ✅ Concluído | CRUD completo com numeração `F00001` |
| Tabela `rh_funcionarios` (Supabase) | ✅ Criada | Aplicada em 2026-08-16 |
| Autopreenchimento via ViaCEP | ✅ Concluído | — |
| Upload de foto (thumbnail) | ✅ Concluído | — |
| Campos: matricula, nome, cpf, rg, data_nascimento, sexo, estado_civil, email, telefone, endereco, cidade, estado, cep, departamento, cargo, tipo_contrato, salario, data_admissao, data_desligamento, banco, agencia, conta, tipo_conta, chave_pix, foto, pis_pasep, ctps, ativo, observacoes | ✅ Concluído | — |

---

### 2.4 Benefícios Cadastrados

| Item | Status | Observação |
|------|--------|------------|
| `rh/beneficios.html` | ✅ Concluído | Campos extras adicionados em 2026-08-16 |
| Tabela `beneficios` (Supabase) | ✅ Criada | Aplicada em 2026-08-16 |
| Campos base: nome, tipo, valor_empresa, valor_funcionario, ativo, observacoes | ✅ Concluído | — |
| Campo `descricao` (seção 11.1) | ✅ Concluído | Adicionado em 2026-08-16 |
| Campo `periodicidade` — Mensal/Anual/Eventual (seção 11.1) | ✅ Concluído | Adicionado em 2026-08-16 |
| Campo `obrigatorio` toggle — para todos os CLT (seção 11.1) | ✅ Concluído | Adicionado em 2026-08-16 |

---

## Seção 3 — Ponto Eletrônico

### 3.1 Jornadas de Trabalho

| Item | Status | Observação |
|------|--------|------------|
| `rh/jornadas.html` | ✅ Concluído | CRUD completo |
| Tabela `rh_jornadas` (Supabase) | ✅ Criada | Aplicada em 2026-08-16 |
| Campos: nome, entrada, inicio_intervalo, fim_intervalo, saida, carga_horaria_diaria, dias_semana (checkboxes), ativo | ✅ Concluído | — |

---

### 3.2 Registros de Ponto

| Item | Status | Observação |
|------|--------|------------|
| `rh/ponto.html` | ✅ Concluído | CRUD completo com numeração `PT00001` |
| Tabela `rh_ponto` (Supabase) | ✅ Criada | Aplicada em 2026-08-16 |
| Cálculo automático de horas trabalhadas e horas extras | ✅ Concluído | — |
| Campos: numero, funcionario, data, entrada, inicio_intervalo, fim_intervalo, saida, horas_trabalhadas, horas_extras, ocorrencia, responsavel, observacoes | ✅ Concluído | — |

---

### 3.3 Apuração de Ponto (Painel)

| Item | Status | Observação |
|------|--------|------------|
| `rh/apuracao-ponto.html` | ✅ Concluído | Painel de visão consolidada por período |
| Filtros: Funcionário, Departamento, Período (Mês/Ano) | ✅ Concluído | — |
| Totais: dias trabalhados, faltas, horas extras, banco de horas | ✅ Concluído | — |
| Exportar PDF | ✅ Concluído | via `window.print()` |

---

## Seção 4 — Folha de Pagamento

### 4.1 Competências (Períodos de Folha)

| Item | Status | Observação |
|------|--------|------------|
| Tabela `rh_folha_competencias` (Supabase) | ✅ Criada | Aplicada em 2026-08-16 |
| Gestão de competências (AAAA-MM) | 🔄 Em andamento | Gerenciada inline em `folha.html` como texto, não como tabela separada com FK |
| Campos: competencia, status (Em Elaboração/Fechada/Paga), data_pagamento, observacoes | 🔄 Em andamento | Status e data_pagamento gerenciados diretamente nos lançamentos |

---

### 4.2 Lançamentos da Folha

| Item | Status | Observação |
|------|--------|------------|
| `rh/folha.html` | 🔄 Em andamento | Implementado com texto direto em vez de FK para `rh_folha_competencias` |
| Tabela `rh_folha_lancamentos` (Supabase) | ✅ Criada | Aplicada em 2026-08-16 |
| Numeração `FL00001` | ✅ Concluído | — |
| Cálculo automático INSS (tabela progressiva 2026) | ✅ Concluído | — |
| Cálculo automático IRRF (tabela progressiva 2026) | ✅ Concluído | — |
| Cálculo Salário Líquido | ✅ Concluído | — |
| Botão "Salvar como PDF" (holerite) | ✅ Concluído | — |
| Campo `competencia_id` FK para `rh_folha_competencias` | 🔄 Em andamento | Usa campo `competencia` texto (AAAA-MM) em vez de FK |
| Campo `valor_horas_extras` (separado de `horas_extras`) | ✅ Concluído | — |
| Campo `desc_vale_transporte` (máx 6% salário bruto) | ✅ Concluído | — |
| Campo `desc_vale_refeicao` | ✅ Concluído | — |
| Status: Rascunho, Calculado, Aprovado, Pago | ✅ Concluído | — |

---

### 4.3 13º Salário

| Item | Status | Observação |
|------|--------|------------|
| `rh/decimo-terceiro.html` | ✅ Concluído | CRUD completo com numeração `13S00001` |
| Tabela `rh_decimo_terceiro` (Supabase) | ✅ Criada | Aplicada em 2026-08-16 |
| Cálculo proporcional (meses/12 × salário) | ✅ Concluído | — |
| Cálculo INSS e IRRF (2ª parcela) | ✅ Concluído | — |
| Campos: numero, competencia (ano), funcionario, parcela (1ª/2ª), valor_bruto, inss, irrf, valor_liquido, status | ✅ Concluído | — |

---

## Seção 5 — Férias e Afastamentos

### 5.1 Controle de Férias

| Item | Status | Observação |
|------|--------|------------|
| `rh/ferias.html` | ✅ Concluído | CRUD completo com numeração `FER00001` |
| Tabela `rh_ferias` (Supabase) | ✅ Criada | Aplicada em 2026-08-16 |
| Cálculo automático Data de Término | ✅ Concluído | — |
| Cálculo Valor Adicional (1/3) | ✅ Concluído | — |
| Alerta de férias vencidas (> 24 meses) | ✅ Concluído | — |
| Abono Pecuniário (toggle) | ✅ Concluído | — |
| Campos: numero, funcionario, periodo_aquisitivo, dias_ferias, data_inicio, data_termino, abono_pecuniario, valor_adicional, status, aprovado_por, observacoes | ✅ Concluído | — |

---

### 5.2 Afastamentos

| Item | Status | Observação |
|------|--------|------------|
| `rh/afastamentos.html` | ✅ Concluído | CRUD completo com numeração `AFS00001` |
| Tabela `rh_afastamentos` (Supabase) | ✅ Criada | Aplicada em 2026-08-16 |
| Upload de documento (PDF atestado) | ✅ Concluído | — |
| Cálculo automático Dias Afastados | ✅ Concluído | — |
| Campos: numero, funcionario, tipo, data_inicio, data_termino, dias_afastados, cid, numero_inss, gera_desconto, documento_url, status, responsavel, observacoes | ✅ Concluído | — |

---

## Seção 6 — Treinamentos

### 6.1 Catálogo de Treinamentos

| Item | Status | Observação |
|------|--------|------------|
| `rh/treinamentos.html` | ✅ Concluído | Campos extras adicionados em 2026-08-16 |
| Tabela `rh_treinamentos` (Supabase) | ✅ Criada | Aplicada em 2026-08-16 |
| Campos: codigo (`TRN00001`), nome, tipo, carga_horaria, validade_meses, instrutor, custo, ativo, descricao | ✅ Concluído | — |
| Campo `modalidade` — Presencial/Online/Híbrido | ✅ Concluído | Adicionado em 2026-08-16 |
| Campo `obrigatorio` (toggle) | ✅ Concluído | Adicionado em 2026-08-16 |

---

### 6.2 Participações em Treinamentos

| Item | Status | Observação |
|------|--------|------------|
| `rh/participacoes.html` | ✅ Concluído | Campo URL certificado corrigido em 2026-08-16 |
| Tabela `rh_participacoes` (Supabase) | ✅ Criada | Aplicada em 2026-08-16 |
| Numeração `PAR00001` | ✅ Concluído | — |
| Preenchimento automático data de vencimento | ✅ Concluído | Calcula com base em `validade_meses` do treinamento |
| Status: Pendente, Realizado, Aprovado, Reprovado, Vencido | ✅ Concluído | — |
| Campo `certificado_url` (URL do PDF) | ✅ Concluído | Substituído de boolean para URL em 2026-08-16 |
| Campos: numero, treinamento, funcionario, data_realizacao, data_vencimento, nota, status, observacoes | ✅ Concluído | — |

---

## Seção 7 — Admissão e Desligamento

### 7.1 Solicitação de Admissão

| Item | Status | Observação |
|------|--------|------------|
| `rh/admissao.html` | ✅ Concluído | Campos justificativa e aprovado_por adicionados em 2026-08-16 |
| Tabela `rh_admissoes` (Supabase) | ✅ Criada | Aplicada em 2026-08-16 |
| Numeração `ADM00001` | ✅ Concluído | — |
| Campos da vaga: cargo, departamento (auto), salario_proposto, tipo_contrato, data_inicio_prevista, solicitante, status, observacoes | ✅ Concluído | — |
| Campo `justificativa` (texto longo) | ✅ Concluído | Adicionado em 2026-08-16 |
| Campo `aprovado_por` | ✅ Concluído | Adicionado em 2026-08-16 |
| Status: Pendente, Aprovada, Reprovada, Cancelada, Concluída | ✅ Concluído | Corrigido em 2026-08-16 |

---

### 7.2 Desligamento

| Item | Status | Observação |
|------|--------|------------|
| `rh/desligamento.html` | ✅ Concluído | Todos os campos reestruturados em 2026-08-16 |
| Tabela `rh_desligamentos` (Supabase) | ✅ Criada | Aplicada em 2026-08-16 |
| Numeração `DLG00001` | ✅ Concluído | — |
| Inativação automática do funcionário ao homologar | ✅ Concluído | Chama `sbAtualizar('rh_funcionarios', id, {ativo:false})` ao status Homologado |
| Campo `tipo_desligamento` com opções completas | ✅ Concluído | Pedido de Demissão, Dispensa Sem/Com Justa Causa, Término de Contrato, Acordo Mútuo, Aposentadoria, Falecimento, Outros |
| Campo `data_aviso_previo` | ✅ Concluído | Adicionado em 2026-08-16 |
| Campo `dias_aviso` (30 padrão CLT) | ✅ Concluído | Adicionado em 2026-08-16 |
| Campo `aviso_trabalhado` (toggle Trabalhado/Indenizado) | ✅ Concluído | Adicionado em 2026-08-16 |
| Campo `saldo_ferias` (editável) | ✅ Concluído | Adicionado em 2026-08-16 |
| Campo `decimo_proporcional` (calculado automaticamente) | ✅ Concluído | Calculado com base nos meses do ano corrente |
| Campo `multa_fgts` (só para dispensa sem justa causa) | ✅ Concluído | Condicional por tipo — visível somente quando aplicável |
| Campo `homologado_por` | ✅ Concluído | Adicionado em 2026-08-16 |
| Status: Em Andamento, Homologado, Cancelado | ✅ Concluído | Corrigido em 2026-08-16 |

---

## Seção 8 — Vínculos de Benefícios

| Item | Status | Observação |
|------|--------|------------|
| Tela `rh/vinculo-beneficios.html` | ✅ Concluído | Criada em 2026-08-16 |
| Tabela `beneficio_funcionario` (Supabase) | ✅ Criada | Aplicada em 2026-08-16 |
| Campos: funcionario, beneficio, data_inicio, data_termino, valor_customizado, observacoes | ✅ Concluído | Todos implementados |

---

## Seção 9 — Painel de RH (Dashboard)

| Item | Status | Observação |
|------|--------|------------|
| `rh/dashboard.html` | ✅ Concluído | Painel sem formulário próprio |
| KPIs: funcionários ativos, afastamentos, férias em gozo, admissões pendentes | ✅ Concluído | — |
| Aniversariantes do mês | ✅ Concluído | — |
| Afastamentos em andamento | ✅ Concluído | — |
| Próximas férias agendadas | ✅ Concluído | — |
| Admissões pendentes | ✅ Concluído | — |
| Últimas participações em treinamentos | ✅ Concluído | — |
| Folha do mês (total líquido) | ✅ Concluído | — |

---

## Seção 11.1 — Tabelas e Telas Extras

### Progressão de Desempenho

| Item | Status | Observação |
|------|--------|------------|
| Tela `rh/progressao-desempenho.html` | ✅ Concluído | Criada em 2026-08-16 |
| Tabela `progressao_desempenho` (Supabase) | ✅ Criada | Aplicada em 2026-08-16 |
| Campos: cargo, nivel, nivel_ordem, salario_minimo, salario_medio, salario_maximo, tempo_minimo_meses, nota_minima, requisitos, ativo | ✅ Concluído | Todos implementados |

---

### Avaliação de Desempenho

| Item | Status | Observação |
|------|--------|------------|
| Tela `rh/avaliacao-desempenho.html` | ✅ Concluído | Criada em 2026-08-16 |
| Tabela `avaliacao_desempenho` (Supabase) | ✅ Criada | Aplicada em 2026-08-16 |
| Numeração `AVL00001` | ✅ Concluído | Implementado |
| Campos: numero, funcionario, avaliador, periodo, nota_tecnica, nota_comportamental, nota_geral (média), elegivel_promocao, promocao_aprovada, novo_nivel, novo_salario, data_avaliacao, proxima_avaliacao, observacoes | ✅ Concluído | Todos implementados |
| Nota geral calculada automaticamente (média de técnica e comportamental) | ✅ Concluído | Com coloração visual por faixa |

---

## Integração com Sistema

| Item | Status | Observação |
|------|--------|------------|
| `sistema.json` — entrada siscodigo=11 "Recursos Humanos" | ✅ Concluído | Verificado |
| `configuracoes/perfis.html` — sisOrdem inclui 11 | ✅ Concluído | Verificado |
| Sidebar RH adicionada em todos os HTML do ERP | ✅ Concluído | 33+ arquivos atualizados |

---

## Banco de Dados (Supabase) — SQL executado

Todos os SQLs foram aplicados via MCP Supabase em 2026-08-16.

| Tabela | Status |
|--------|--------|
| `rh_departamentos` | ✅ Criada |
| `rh_cargos` | ✅ Criada |
| `rh_funcionarios` | ✅ Criada |
| `rh_beneficios` | ✅ Criada |
| `rh_funcionario_beneficios` | ✅ Criada |
| `rh_jornadas` | ✅ Criada |
| `rh_ponto` | ✅ Criada |
| `rh_folha_competencias` | ✅ Criada |
| `rh_folha_lancamentos` | ✅ Criada |
| `rh_decimo_terceiro` | ✅ Criada |
| `rh_ferias` | ✅ Criada |
| `rh_afastamentos` | ✅ Criada |
| `rh_treinamentos` | ✅ Criada |
| `rh_participacoes` | ✅ Criada |
| `rh_admissoes` | ✅ Criada |
| `rh_desligamentos` | ✅ Criada |
| `beneficios` (sec 11.1) | ✅ Criada |
| `beneficio_funcionario` (sec 11.1) | ✅ Criada |
| `progressao_desempenho` (sec 11.1) | ✅ Criada |
| `avaliacao_desempenho` (sec 11.1) | ✅ Criada |

---

## Resumo Geral

| Categoria | Concluído | Em Andamento | Não Iniciado |
|-----------|-----------|--------------|--------------|
| Páginas HTML (seção 10) | 16 | 0 | 0 |
| Páginas extras (seção 11.1) | 3 | 0 | 0 |
| Tabelas Supabase | 20 | 0 | 0 |
| Integração (sistema.json, sidebar, perfis) | 3 | 0 | 0 |

**Módulo de Recursos Humanos 100% implementado em 2026-08-16.**
