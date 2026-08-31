-- ============================================================
--  ERP SENAI — Módulo de Gamificação
--  Seed de dados iniciais
--  Projeto: vdhahqicqlrdvcpesiwk.supabase.co
--  Executar APÓS DATABASE.sql
-- ============================================================

-- 12 Missões fixas de onboarding
-- Cobrem todos os módulos do ERP: Cadastros, Compras, Estoque, Vendas
-- Total de XP possível: 650 XP

INSERT INTO gamif_missoes (titulo, descricao, evento, meta, xp, tipo, ativo) VALUES
  (
    'Faça seu primeiro cadastro de cliente',
    'Acesse o módulo Cadastros → Clientes e cadastre um novo cliente no sistema.',
    'cliente_cadastrado',
    1, 30, 'onboarding', true
  ),
  (
    'Cadastre um fornecedor',
    'Acesse o módulo Cadastros → Fornecedores e cadastre um fornecedor.',
    'fornecedor_cadastrado',
    1, 30, 'onboarding', true
  ),
  (
    'Adicione um produto ao catálogo',
    'Acesse o módulo Cadastros → Produtos e adicione um produto com código automático.',
    'produto_cadastrado',
    1, 30, 'onboarding', true
  ),
  (
    'Crie sua primeira solicitação de compra',
    'Acesse Compras → Solicitações e registre uma solicitação de compra de produto.',
    'solicitacao_criada',
    1, 50, 'onboarding', true
  ),
  (
    'Emita um pedido de compra',
    'Acesse Compras → Pedidos e formalize um pedido junto a um fornecedor.',
    'pedido_compra_criado',
    1, 50, 'onboarding', true
  ),
  (
    'Registre um recebimento de mercadoria',
    'Acesse Compras → Recebimento e registre a chegada física de uma mercadoria.',
    'recebimento_registrado',
    1, 50, 'onboarding', true
  ),
  (
    'Lance uma nota fiscal de compra',
    'Acesse Compras → Nota Fiscal e lance uma NF de fornecedor com status Lançada.',
    'nota_fiscal_compra_lancada',
    1, 70, 'onboarding', true
  ),
  (
    'Faça uma movimentação de estoque',
    'Acesse Estoque → Armazenagem e registre uma movimentação de produto.',
    'movimentacao_estoque',
    1, 50, 'onboarding', true
  ),
  (
    'Realize um inventário',
    'Acesse Estoque → Inventário e realize a contagem física de um produto.',
    'inventario_realizado',
    1, 70, 'onboarding', true
  ),
  (
    'Crie um pedido de venda',
    'Acesse Vendas → Pedidos de Venda e registre um pedido de um cliente.',
    'pedido_venda_criado',
    1, 50, 'onboarding', true
  ),
  (
    'Confirme uma expedição',
    'Acesse Vendas → Expedição e confirme o envio de um pedido com status Expedido.',
    'expedicao_confirmada',
    1, 70, 'onboarding', true
  ),
  (
    'Registre uma entrega ao cliente',
    'Acesse Vendas → Entrega e confirme a entrega do pedido ao cliente.',
    'entrega_confirmada',
    1, 100, 'onboarding', true
  );

-- Grupo padrão de demonstração (opcional)
INSERT INTO gamif_grupos (nome, tipo) VALUES
  ('Turma Demo', 'turma');
