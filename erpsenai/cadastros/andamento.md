# Andamento — Módulo Cadastros

> Módulo base do sistema. Atualizado em: 2026-08-17

---

## Telas

| Tela | Arquivo | Status |
|------|---------|--------|
| Clientes | `cadastros/clientes.html` | ✅ Concluído |
| Fornecedores | `cadastros/fornecedores.html` | ✅ Concluído |
| Produtos | `cadastros/produtos.html` | ✅ Concluído — campo NCMSH adicionado |
| Transportadoras | `cadastros/transportadoras.html` | ✅ Concluído |
| Impostos | `cadastros/impostos.html` | ✅ Concluído |
| NCMSH | `cadastros/ncmsh.html` | ✅ Concluído — vinculado a imposto via combo |

---

## Banco de Dados (Supabase)

| Tabela | Status |
|--------|--------|
| `clientes` | ✅ Criada |
| `fornecedores` | ✅ Criada |
| `produtos` | ✅ Criada — coluna `ncmsh_id` a aplicar |
| `transportadoras` | ✅ Criada |
| `impostos` | ✅ Criada |
| `ncmsh` | ✅ Criada |

### SQL das novas tabelas (aplicar no Supabase)

```sql
-- IMPOSTOS
CREATE TABLE impostos (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  descricao    text NOT NULL,
  taxa_imposto numeric(7,4) NOT NULL,
  ativo        boolean DEFAULT true,
  created_at   timestamptz DEFAULT now()
);
ALTER TABLE impostos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon full" ON impostos FOR ALL USING (true) WITH CHECK (true);

-- NCMSH
CREATE TABLE ncmsh (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  descricao   text NOT NULL,
  imposto_id  uuid REFERENCES impostos(id),
  ativo       boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE ncmsh ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon full" ON ncmsh FOR ALL USING (true) WITH CHECK (true);

-- Coluna ncmsh_id em produtos
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS ncmsh_id uuid REFERENCES ncmsh(id);
```

---

## Integrações

| Integração | Status |
|------------|--------|
| ViaCEP (autopreenchimento CEP) | ✅ Implementado |
| Validação CPF/CNPJ | ✅ Implementado |
| Soft delete (ativo/inativo) | ✅ Implementado |
| Upload de imagem de produto | ✅ Implementado |
| NCMSH vinculado a Imposto | ✅ Implementado |
| NCMSH no cadastro de Produto | ✅ Implementado |
