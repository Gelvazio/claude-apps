# Módulo Tele Vendas — Especificação

## Visão Geral

O módulo Tele Vendas registra pedidos originados de um sistema externo (IRP) via chamadas de API. Os pedidos são inseridos automaticamente na tabela `televendas` pelo sistema externo. Os operadores internos visualizam e gerenciam o atendimento desses pedidos.

---

## Tabela: `televendas`

```sql
CREATE TABLE televendas (
  id          bigserial PRIMARY KEY,
  pedido_d    text,
  datahora    timestamptz DEFAULT now(),
  id_chave    text,
  status      text DEFAULT 'Em Aberto',
  observacao  text,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE televendas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon full" ON televendas FOR ALL USING (true) WITH CHECK (true);
```

### Campos

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | bigserial | Chave primária auto-incremental |
| `pedido_d` | text | ID/referência do pedido vindo do sistema IRP externo |
| `datahora` | timestamptz | Data e hora do pedido (enviado pelo sistema externo) |
| `id_chave` | text | Chave de identificação do sistema IRP externo |
| `status` | text | Status do atendimento interno |
| `observacao` | text | Observação livre do operador |
| `created_at` | timestamptz | Data/hora de inserção no sistema |

---

## Status possíveis

| Status | Cor |
|--------|-----|
| Em Aberto | Cinza |
| Em Atendimento | Azul |
| Aguardando Retorno | Laranja |
| Concluído | Verde |
| Cancelado | Vermelho |

---

## Arquivo HTML

- **Caminho:** `vendas/televendas.html`
- **Ícone sidebar:** 📞
- **Label sidebar:** Tele Vendas
- **Seção sidebar:** Vendas

---

## Funcionalidades da Tela

### Listagem

- Exibe todos os registros da tabela `televendas`
- Colunas: ID, Pedido D, ID Chave, Data/Hora, Status, Ações
- Busca por `pedido_d` ou `id_chave`
- Filtro por status
- Badge colorido por status

### Modal de Edição

- Campos **somente leitura** (vindos do IRP externo): `id`, `pedido_d`, `datahora`, `id_chave`
- Campos **editáveis** pelo operador: `status`, `observacao`
- Botão Salvar atualiza apenas `status` e `observacao`

### Inserção manual (opcional)

- Botão "Novo Registro" permite inserir manualmente para testes
- Todos os campos disponíveis no formulário

---

## Integração com Sistema Externo (IRP)

Os pedidos são inseridos na tabela via REST API do Supabase:

```bash
POST https://vdhahqicqlrdvcpesiwk.supabase.co/rest/v1/televendas
Content-Type: application/json
apikey: <SUPABASE_KEY>
Authorization: Bearer <SUPABASE_KEY>

{
  "pedido_d": "PED-001",
  "datahora": "2026-08-16T10:30:00Z",
  "id_chave": "CHAVE-XYZ",
  "status": "Em Aberto"
}
```

---

## Padrões de desenvolvimento

- Seguir os mesmos padrões do `vendas/pedidos-venda.html`
- Usar `SUPABASE.js` (path: `../SUPABASE.js`)
- Verificar sessão com `sbVerificarSessao('../index.html')`
- Exigir permissão `vendas` com `sbExigirPermissao('vendas', '../dashboard.html')`
- Tema claro/escuro via `localStorage` (`senai_tema`)
- Responsivo: mobile-first, sidebar oculta em ≤ 768px
