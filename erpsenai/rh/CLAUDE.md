# Módulo Recursos Humanos — Referência de Desenvolvimento

> Gerencia o ciclo completo do colaborador — da admissão ao desligamento — com ponto eletrônico, folha de pagamento, férias, afastamentos, treinamentos e benefícios.

---

## Fluxo

```
Admissão → Cadastro → Ponto Eletrônico → Folha de Pagamento → Férias / Afastamentos → Desligamento
                    ↘ Treinamentos / Benefícios
```

---

## Telas do Módulo

| Arquivo | Tela | Status |
|---------|------|--------|
| `dashboard.html` | Painel RH | ✅ Concluído |
| `departamentos.html` | CRUD de Departamentos | ✅ Concluído |
| `cargos.html` | CRUD de Cargos | ✅ Concluído |
| `funcionarios.html` | CRUD de Funcionários | ✅ Concluído |
| `beneficios.html` | CRUD de Benefícios | 🔄 Em andamento |
| `jornadas.html` | CRUD de Jornadas de Trabalho | ✅ Concluído |
| `ponto.html` | Lançamentos de Ponto | ✅ Concluído |
| `apuracao-ponto.html` | Painel de Apuração de Ponto | ✅ Concluído |
| `folha.html` | Folha de Pagamento | 🔄 Em andamento |
| `decimo-terceiro.html` | 13º Salário | ✅ Concluído |
| `ferias.html` | Controle de Férias | ✅ Concluído |
| `afastamentos.html` | Afastamentos e Atestados | ✅ Concluído |
| `treinamentos.html` | Catálogo de Treinamentos | 🔄 Em andamento |
| `participacoes.html` | Participações em Treinamentos | 🔄 Em andamento |
| `admissao.html` | Solicitações de Admissão | 🔄 Em andamento |
| `desligamento.html` | Registro de Desligamento | 🔄 Em andamento |
| `progressao-desempenho.html` | Progressão e Desempenho | ❌ Não Iniciado |
| `avaliacao-desempenho.html` | Avaliações de Desempenho | ❌ Não Iniciado |
| `vinculo-beneficios.html` | Vínculo Funcionário × Benefício | ❌ Não Iniciado |

---

## Numeração Automática

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
| Avaliação | `AVL` | `AVL00001` |

---

## 1. Dashboard RH (`dashboard.html`)

Painel de visão geral dos indicadores de RH.

### Funcionalidade
- KPIs: total de funcionários ativos, admissões do mês, desligamentos do mês.
- Alertas: férias vencendo em 30 dias, treinamentos com validade expirando.
- Gráfico: distribuição por departamento e cargo.
- Últimos lançamentos de ponto e eventos de folha.

---

## 2. Departamentos (`departamentos.html`)

### Campos

| Campo | Tipo | Regras |
|-------|------|--------|
| Código | Texto | **Gerado automaticamente** — `DEP00001` |
| Nome | Texto | **Obrigatório** |
| Responsável | Select | Usuário do sistema |
| Centro de Custo | Texto | — |
| Ativo | Toggle | Default: Ativo |
| Observações | Textarea | — |

---

## 3. Cargos (`cargos.html`)

### Campos

| Campo | Tipo | Regras |
|-------|------|--------|
| Código | Texto | **Gerado automaticamente** — `CGO00001` |
| Nome | Texto | **Obrigatório** |
| Departamento | Select | Departamentos ativos |
| CBO | Texto | Código Brasileiro de Ocupações |
| Salário Base | Número | R$ |
| Nível | Texto | Júnior, Pleno, Sênior, Especialista etc. |
| Ativo | Toggle | Default: Ativo |
| Descrição | Textarea | — |

---

## 4. Funcionários (`funcionarios.html`)

### Campos principais

| Campo | Tipo |
|-------|------|
| Matrícula | Gerado — `F00001` |
| Nome | **Obrigatório** |
| CPF | **Obrigatório** único |
| RG, Data de Nasc., Sexo, Estado Civil | Texto/Select |
| E-mail, Telefone | — |
| Endereço, CEP + ViaCEP | — |
| Departamento, Cargo | Select |
| Tipo de Contrato | CLT, PJ, Estágio, Temporário |
| Salário, Data de Admissão | **Obrigatório** |
| Dados Bancários (banco, agência, conta, PIX) | — |
| Foto, PIS/PASEP, CTPS | — |
| Ativo | Toggle |

---

## 5. Benefícios (`beneficios.html`)

Catálogo de benefícios disponíveis.

### Campos

| Campo | Tipo | Regras |
|-------|------|--------|
| Nome | Texto | **Obrigatório** |
| Tipo | Select | Vale Transporte, Vale Refeição, Plano de Saúde, Odontológico, Seguro de Vida, Outros |
| Valor Empresa | Número | R$ — custo para a empresa |
| Valor Funcionário | Número | R$ — desconto em folha |
| Periodicidade | Select | Mensal, Semanal, Anual |
| Obrigatório | Toggle | — |
| Ativo | Toggle | — |
| Descrição | Textarea | — |

---

## 6. Jornadas (`jornadas.html`)

### Campos

| Campo | Tipo |
|-------|------|
| Nome | **Obrigatório** |
| Entrada / Início Intervalo / Fim Intervalo / Saída | Hora |
| Carga Horária Diária | Número (horas) |
| Dias da Semana | MultiSelect |
| Ativo | Toggle |

---

## 7. Ponto Eletrônico (`ponto.html`)

Lançamentos individuais de ponto.

### Campos

| Campo | Tipo |
|-------|------|
| Número | Gerado — `PT00001` |
| Funcionário | Select — **Obrigatório** |
| Data | Date |
| Entrada / Início Intervalo / Fim Intervalo / Saída | Hora |
| Horas Trabalhadas | Calculado |
| Horas Extras | Calculado |
| Ocorrência | Select — Normal, Falta, Atraso, Saída Antecipada, Folga, Feriado |
| Responsável, Observações | — |

---

## 8. Apuração de Ponto (`apuracao-ponto.html`)

Painel de consolidação do ponto por período — sem formulário de cadastro.

### Funcionalidade
- Selecionar período (mês/ano) e departamento.
- Tabela com cada funcionário: dias trabalhados, horas totais, extras, faltas, atrasos.
- Exportação para PDF.

---

## 9. Folha de Pagamento (`folha.html`)

### Competências

| Campo | Tipo |
|-------|------|
| Competência | Texto — ex: `2026-08` |
| Status | Em Elaboração, Calculada, Fechada, Paga |
| Data de Pagamento | Date |

### Lançamentos por Funcionário

| Campo | Tipo |
|-------|------|
| Número | Gerado — `FL00001` |
| Salário Bruto | Número |
| Horas Extras + Valor | Número |
| Adicionais | Número |
| INSS, IRRF | Calculado |
| Descontos (VT, VR, outros) | Número |
| Salário Líquido | Calculado |
| Status | Rascunho, Calculado, Aprovado |

---

## 10. 13º Salário (`decimo-terceiro.html`)

| Campo | Tipo |
|-------|------|
| Número | Gerado — `13S00001` |
| Competência | Texto |
| Funcionário | Select |
| Parcela | 1ª Parcela, 2ª Parcela |
| Valor Bruto | Número |
| INSS, IRRF | Calculado |
| Valor Líquido | Calculado |
| Status | Rascunho, Calculado, Pago |

---

## 11. Férias (`ferias.html`)

| Campo | Tipo |
|-------|------|
| Número | Gerado — `FER00001` |
| Funcionário | Select |
| Período Aquisitivo | Texto |
| Dias de Férias | Número — default 30 |
| Data Início / Término | Date |
| Abono Pecuniário | Toggle |
| Valor Adicional | Número |
| Status | Agendada, Em Gozo, Concluída, Cancelada |
| Aprovado Por | Texto |

---

## 12. Afastamentos (`afastamentos.html`)

| Campo | Tipo |
|-------|------|
| Número | Gerado — `AFS00001` |
| Funcionário | Select |
| Tipo | Atestado Médico, Acidente de Trabalho, Licença Maternidade, Licença Paternidade, Outros |
| Data Início / Término | Date |
| Dias Afastados | Calculado |
| CID | Texto |
| Nº INSS | Texto |
| Gera Desconto | Toggle |
| Status | Ativo, Encerrado, Cancelado |

---

## 13. Treinamentos (`treinamentos.html`)

Catálogo de treinamentos disponíveis.

| Campo | Tipo |
|-------|------|
| Código | Gerado — `TRN00001` |
| Nome | **Obrigatório** |
| Tipo | NR, Comportamental, Técnico, Compliance, Outros |
| Modalidade | Presencial, EAD, Híbrido |
| Carga Horária | Número |
| Obrigatório | Toggle |
| Validade (meses) | Número |
| Instrutor, Custo | — |
| Ativo | Toggle |

---

## 14. Participações (`participacoes.html`)

Registro de quem realizou cada treinamento.

| Campo | Tipo |
|-------|------|
| Número | Gerado — `PAR00001` |
| Treinamento | Select |
| Funcionário | Select |
| Data de Realização | Date |
| Data de Vencimento | Calculada pela validade |
| Nota | Número |
| Status | Realizado, Reprovado, Cancelado |
| URL Certificado | Texto |

---

## 15. Admissão (`admissao.html`)

Solicitações de abertura de vaga e contratação.

| Campo | Tipo |
|-------|------|
| Número | Gerado — `ADM00001` |
| Cargo | Select |
| Departamento | Select |
| Salário Proposto | Número |
| Justificativa | Textarea |
| Tipo de Contrato | Select |
| Data Início Prevista | Date |
| Solicitante | Texto |
| Status | Pendente, Em Análise, Aprovada, Reprovada |
| Aprovado Por | Texto |

---

## 16. Desligamento (`desligamento.html`)

Registro e cálculo da rescisão.

| Campo | Tipo |
|-------|------|
| Número | Gerado — `DLG00001` |
| Funcionário | Select |
| Tipo | Pedido de Demissão, Demissão Sem Justa Causa, Demissão Com Justa Causa, Acordo |
| Data Aviso Prévio | Date |
| Data Desligamento | Date |
| Dias de Aviso | Número — default 30 |
| Aviso Trabalhado | Toggle |
| Saldo de Férias | Número |
| 13º Proporcional | Número |
| Multa FGTS | Número |
| Motivo | Textarea |
| Homologado Por | Texto |
| Status | Em Andamento, Homologado, Cancelado |

---

## Tabelas Supabase

Ver seção "Módulo 7 — RECURSOS HUMANOS" no `CLAUDE.md` da raiz do projeto para os CREATEs completos de todas as 18 tabelas.

## Sistema e Telas no Banco

```sql
INSERT INTO sistema (siscodigo, sisnome, sisativo, sisordem)
VALUES (11, 'Recursos Humanos', 1, 11);
-- 16 telas inseridas em tela + tela_sistema com sistema_id=11
```
