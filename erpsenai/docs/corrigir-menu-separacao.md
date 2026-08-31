# Corrigir menu da tela de Separação

**Objetivo:** Garantir que a sidebar da tela `vendas/separacao.html` liste todas as seções permitidas pelo perfil, mesmo quando o cache de sistemas estiver incompleto.

**Tech Stack:** JavaScript e localStorage

---

## Status Geral

| Passo | Descrição | Status |
|-------|-----------|--------|
| 1 | Identificar a causa raiz | ✅ Concluído |
| 2 | Corrigir a composição da ordem das seções | ✅ Concluído |
| 3 | Documentar a regra no CLAUDE.md | ✅ Concluído |
| 4 | Commit e push | 🔄 Em progresso |

---

### Passo 1: Identificar a causa raiz

**Status:** ✅ Concluído

**Arquivo:** Analisar `C:\fontes\professor-senai\erp-victor-anato-senai\menu.js`

**Ação:** Confirmar que `erp_sistemas`, quando presente, substituía integralmente a lista de seções em vez de apenas ordená-la.

**Verificação:** Análise estática, sem executar testes ou abrir navegador.

---

### Passo 2: Corrigir a composição da ordem das seções

**Status:** ✅ Concluído

**Arquivo:** Modificar `C:\fontes\professor-senai\erp-victor-anato-senai\menu.js`

**Ação:** Manter primeiro os códigos ordenados vindos de `erp_sistemas` e acrescentar os códigos ausentes; `erp_telas` continua sendo o único filtro de visibilidade.

```javascript
const codigosDisponiveis = Object.keys(SECAO_POR_SISCODIGO).map(Number);
const codigosDoCache = sistemasOrdenados.map((s) => Number(s.siscodigo));
const codigosOrdenados = [
  ...codigosDoCache,
  ...codigosDisponiveis.filter((codigo) => !codigosDoCache.includes(codigo))
];
```

**Verificação:** Não executar testes nem abrir navegador, conforme as regras do projeto.

---

### Passo 3: Documentar a regra

**Status:** ✅ Concluído

**Arquivo:** Modificar `C:\fontes\professor-senai\erp-victor-anato-senai\CLAUDE.md`

**Ação:** Esclarecer que `erp_sistemas` ordena as seções, mas nunca pode ocultar telas permitidas.

**Verificação:** Não executar testes, conforme as regras do projeto.

---

### Passo 4: Commit e push

**Status:** 🔄 Em progresso

**Arquivo:** Versionar somente os arquivos desta tarefa.

**Ação:** Criar commit descritivo e enviar para `origin/main`.

**Verificação:** Conferir o resultado dos comandos Git.
