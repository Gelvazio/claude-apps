# REGRAS DE NEGÓCIOS

## Módulos como registros na tabela SISTEMA

Cada módulo do ERP será um registro na tabela **SISTEMA**.

### Estrutura da tabela SISTEMA

```
SISTEMA {
    SISCODIGO,
    SISNOME,
    SISATIVO  (0 = inativo, 1 = ativo)
    SISORDEM
}
```

---

## Telas — Tabela TELA_SISTEMA

A tabela **TELA_SISTEMA** vincula a lista de telas a cada sistema/módulo.

### Estrutura da tabela TELA_SISTEMA

```
TELA_SISTEMA {
    TELA_ID,
    SISTEMA_ID
}
```

> Nesta tabela deve-se linkar a lista de telas em cada sistema.
