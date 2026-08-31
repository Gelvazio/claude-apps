# Criar inserts para a tabela de pendências

**Objetivo:** Converter os itens de `sistema/pendencias.txt` em registros SQL para `public.pendencias`.

**Tech Stack:** PostgreSQL e Supabase

---

## Status Geral

| Passo | Descrição | Status |
|-------|-----------|--------|
| 1 | Ler a estrutura vigente da tabela | ✅ Concluído |
| 2 | Mapear os itens do arquivo de pendências | ✅ Concluído |
| 3 | Criar o script idempotente de inserts | ✅ Concluído |
| 4 | Commit e push | 🔄 Em progresso |

---

### Passo 1: Ler a estrutura da tabela

**Status:** ✅ Concluído

**Arquivo:** Consultar `C:\fontes\professor-senai\sistema\supabase-pendencias.sql`

**Ação:** Usar as colunas `data`, `descricao`, `status` e `materia_descricao` da versão completa utilizada pelo dashboard.

**Verificação:** Análise estática; nenhum SQL foi executado.

---

### Passo 2: Mapear as pendências

**Status:** ✅ Concluído

**Arquivo:** Ler `C:\fontes\professor-senai\sistema\pendencias.txt`

**Ação:** Converter as 11 linhas de trabalho em registros individuais e associá-las às respectivas matérias.

**Verificação:** Análise estática; nenhum teste foi executado.

---

### Passo 3: Criar o script de inserts

**Status:** ✅ Concluído

**Arquivo:** Criar `C:\fontes\professor-senai\erp-victor-anato-senai\INSERT_PENDENCIAS.sql`

**Ação:** Inserir os registros com status `PENDENTE`, data atual, matéria correspondente e prevenção de duplicidade por descrição.

```sql
where not exists (
  select 1
  from public.pendencias existente
  where upper(trim(existente.descricao)) = upper(trim(item.descricao))
);
```

**Verificação:** Não executar o script nem testes, conforme as regras do projeto.

---

### Passo 4: Commit e push

**Status:** 🔄 Em progresso

**Arquivo:** Versionar somente os arquivos desta tarefa.

**Ação:** Criar commit descritivo e enviar para `origin/main`.

**Verificação:** Conferir o resultado dos comandos Git.
