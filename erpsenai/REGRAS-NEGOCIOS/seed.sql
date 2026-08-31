-- ============================================================
--  SEED — ERP Senai
--  Dados de teste: Cadastros, Compras, Estoque, Vendas e Logística
--  Execute no Supabase SQL Editor
--
--  Usuários criados:
--    admin@erp.com   — Administrador (acesso total)
--    joao@erp.com    — Usuário (Compras + Estoque)
--    maria@erp.com   — Usuário (Estoque + Vendas)
-- ============================================================

-- ------------------------------------------------------------
-- OPCIONAL: limpar dados existentes antes de inserir
-- Descomente o bloco abaixo se quiser apagar tudo primeiro.
-- ------------------------------------------------------------
/*
TRUNCATE TABLE
  vendas_entregas,
  vendas_expedicoes,
  vendas_separacoes,
  vendas_romaneios,
  vendas_notas_fiscais,
  vendas_pedidos,
  estoque_inventarios,
  estoque_movimentacoes,
  compras_notas_fiscais,
  compras_conferencias,
  compras_recebimentos,
  compras_pedidos,
  compras_solicitacoes,
  compras_planejamento,
  transportadoras,
  produtos,
  fornecedores,
  clientes,
  erp_usuarios
CASCADE;
*/

-- ============================================================
--  CONFIGURAÇÕES — Usuários
--  Hash SHA-256 da senha administrativa:
--  166da0daa25c3edb40d87c1634bbee0eda8b50ccd82f93c36c54c35a004e5561
--  Senha dos demais usuários "admin" → SHA-256:
--  8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918
-- ============================================================

INSERT INTO erp_usuarios
  (id, nome, email, cargo, telefone, perfil, senha_hash, status, permissoes)
VALUES
(
  '00000000-0000-0000-0000-000000000001',
  'Administrador',
  'admin@erp.com',
  'Administrador do Sistema',
  '(11) 99999-0001',
  'Administrador',
  '166da0daa25c3edb40d87c1634bbee0eda8b50ccd82f93c36c54c35a004e5561',
  true,
  '{"visao_geral":true,"cadastros":true,"compras":true,"estoque":true,"vendas":true}'
),
(
  '00000000-0000-0000-0000-000000000002',
  'João Silva',
  'joao@erp.com',
  'Analista de Compras',
  '(11) 98888-1001',
  'Usuário',
  '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
  true,
  '{"visao_geral":true,"cadastros":false,"compras":true,"estoque":true,"vendas":false}'
),
(
  '00000000-0000-0000-0000-000000000003',
  'Maria Fernanda',
  'maria@erp.com',
  'Analista de Vendas',
  '(11) 97777-2002',
  'Usuário',
  '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
  true,
  '{"visao_geral":true,"cadastros":false,"compras":false,"estoque":true,"vendas":true}'
);

-- ============================================================
--  CADASTROS — Clientes
-- ============================================================

INSERT INTO clientes
  (id, nome, cnpj_cpf, email, telefone, segmento, endereco, cidade, estado, cep, ativo)
VALUES
(
  '10000000-0000-0000-0000-000000000001',
  'Tech Solutions Ltda',
  '12.345.678/0001-90',
  'contato@techsolutions.com.br',
  '(11) 3333-4444',
  'Tecnologia',
  'Rua das Inovações, 100',
  'São Paulo',
  'SP',
  '01310-100',
  true
),
(
  '10000000-0000-0000-0000-000000000002',
  'Saúde Bem Estar S.A.',
  '98.765.432/0001-10',
  'compras@saudebemestar.com.br',
  '(21) 2222-5555',
  'Saúde',
  'Av. das Clínicas, 500',
  'Rio de Janeiro',
  'RJ',
  '20040-020',
  true
),
(
  '10000000-0000-0000-0000-000000000003',
  'Mercado do Povo Ltda',
  '11.222.333/0001-44',
  'pedidos@mercadodopovo.com.br',
  '(31) 4444-6666',
  'Varejo',
  'Rua do Comércio, 250',
  'Belo Horizonte',
  'MG',
  '30130-110',
  true
),
(
  '10000000-0000-0000-0000-000000000004',
  'Alimentos Naturais ME',
  '55.444.333/0001-22',
  'direcao@alimentosnaturais.com.br',
  '(51) 5555-7777',
  'Alimentação',
  'Av. dos Alimentos, 80',
  'Porto Alegre',
  'RS',
  '90040-060',
  true
),
(
  '10000000-0000-0000-0000-000000000005',
  'Carlos Eduardo Pereira',
  '123.456.789-09',
  'carlos@email.com',
  '(41) 9 8765-4321',
  'Serviços',
  'Rua das Palmeiras, 12',
  'Curitiba',
  'PR',
  '80010-020',
  true
);

-- ============================================================
--  CADASTROS — Fornecedores
-- ============================================================

INSERT INTO fornecedores
  (id, nome, cnpj, contato, email, telefone, segmento, endereco, cidade, estado, cep, ativo)
VALUES
(
  '20000000-0000-0000-0000-000000000001',
  'Distribuidora Nacional Ltda',
  '33.444.555/0001-66',
  'Pedro Alves',
  'pedro@distribuidoranacional.com.br',
  '(11) 4444-8888',
  'Tecnologia',
  'Rua dos Distribuidores, 500',
  'São Paulo',
  'SP',
  '04578-000',
  true
),
(
  '20000000-0000-0000-0000-000000000002',
  'Indústria Metal Forte S.A.',
  '77.888.999/0001-00',
  'Ana Costa',
  'ana@metalforte.com.br',
  '(19) 3333-2222',
  'Metalmecânica',
  'Av. Industrial, 1200',
  'Campinas',
  'SP',
  '13065-900',
  true
),
(
  '20000000-0000-0000-0000-000000000003',
  'Embalagens Rápidas Ltda',
  '22.111.000/0001-88',
  'Roberto Lima',
  'roberto@embalagensrapidas.com.br',
  '(62) 5555-1111',
  'Outros',
  'Rua das Embalagens, 30',
  'Goiânia',
  'GO',
  '74110-010',
  true
),
(
  '20000000-0000-0000-0000-000000000004',
  'TechParts Componentes Ltda',
  '44.333.222/0001-11',
  'Fernanda Ramos',
  'fernanda@techparts.com.br',
  '(47) 7777-3333',
  'Tecnologia',
  'Rua dos Componentes, 900',
  'Joinville',
  'SC',
  '89201-740',
  true
);

-- ============================================================
--  CADASTROS — Produtos
--  Nota: estoque_atual é atualizado pelas movimentações abaixo.
--        Os valores aqui refletem o estado final após todas as entradas/saídas.
-- ============================================================

INSERT INTO produtos
  (id, codigo, nome, categoria, unidade, preco_custo, preco_venda,
   estoque_atual, estoque_minimo, estoque_maximo, descricao, ativo)
VALUES
(
  '30000000-0000-0000-0000-000000000001',
  'P00001',
  'Notebook Dell Inspiron 15',
  'Tecnologia',
  'UN',
  2800.00, 3999.90,
  12, 5, 50,
  'Notebook Dell Inspiron 15, Intel Core i5, 8GB RAM, 256GB SSD',
  true
),
(
  '30000000-0000-0000-0000-000000000002',
  'P00002',
  'Mouse Sem Fio Logitech',
  'Tecnologia',
  'UN',
  45.00, 89.90,
  60, 20, 200,
  'Mouse sem fio Logitech MX Anywhere, bateria longa duração',
  true
),
(
  '30000000-0000-0000-0000-000000000003',
  'P00003',
  'Teclado Mecânico RGB',
  'Tecnologia',
  'UN',
  120.00, 249.90,
  38, 10, 100,
  'Teclado mecânico com retroiluminação RGB, switch blue',
  true
),
(
  '30000000-0000-0000-0000-000000000004',
  'P00004',
  'Monitor LED 24"',
  'Tecnologia',
  'UN',
  650.00, 1099.90,
  8, 3, 30,
  'Monitor LED 24 polegadas Full HD, 75Hz, 1ms',
  true
),
(
  '30000000-0000-0000-0000-000000000005',
  'P00005',
  'Cabo de Rede CAT6 (rolo 100m)',
  'Tecnologia',
  'MT',
  180.00, 320.00,
  8, 10, 50,
  'Cabo de rede CAT6, rolo com 100 metros, blindado',
  true
),
(
  '30000000-0000-0000-0000-000000000006',
  'P00006',
  'Caixa de Papelão Reforçada',
  'Outros',
  'CX',
  3.50, 8.90,
  200, 50, 500,
  'Caixa de papelão dupla face, resistente, 40x30x20cm',
  true
),
(
  '30000000-0000-0000-0000-000000000007',
  'P00007',
  'Headset USB com Microfone',
  'Tecnologia',
  'UN',
  75.00, 149.90,
  25, 8, 60,
  'Headset USB estéreo com microfone retrátil, cancelamento de ruído',
  true
);

-- ============================================================
--  CADASTROS — Transportadoras
-- ============================================================

INSERT INTO transportadoras
  (id, nome, cnpj, tipo_servico, contato, email, telefone, cidade, estado, ativa)
VALUES
(
  '40000000-0000-0000-0000-000000000001',
  'Transportadora Rápido Sul',
  '55.666.777/0001-88',
  'Rodoviário',
  'Gilberto Moura',
  'operacoes@rapidosul.com.br',
  '(51) 3111-2222',
  'Porto Alegre',
  'RS',
  true
),
(
  '40000000-0000-0000-0000-000000000002',
  'Logística Express Ltda',
  '66.777.888/0001-99',
  'Expresso',
  'Tatiane Freitas',
  'tatiane@logisticaexpress.com.br',
  '(11) 4444-5555',
  'São Paulo',
  'SP',
  true
),
(
  '40000000-0000-0000-0000-000000000003',
  'Nacional Frete S.A.',
  '99.000.111/0001-22',
  'Rodoviário',
  'Marcos Vieira',
  'marcos@nacionalfrete.com.br',
  '(61) 3222-4444',
  'Brasília',
  'DF',
  true
);

-- ============================================================
--  COMPRAS — Planejamento
-- ============================================================

INSERT INTO compras_planejamento
  (id, titulo, tipo, produto_id, periodo, qtd_planejada, qtd_realizada, status, data, observacoes)
VALUES
(
  '50000000-0000-0000-0000-000000000001',
  'Compras de TI — Agosto 2026',
  'Mensal',
  '30000000-0000-0000-0000-000000000001',
  'Agosto/2026',
  20, 15,
  'Em Andamento',
  '2026-08-01',
  'Reposição de notebooks para novos funcionários'
),
(
  '50000000-0000-0000-0000-000000000002',
  'Reposição de Acessórios — Q3 2026',
  'Trimestral',
  '30000000-0000-0000-0000-000000000002',
  'Jul-Set/2026',
  100, 80,
  'Em Andamento',
  '2026-07-01',
  'Mouses e teclados para toda a equipe'
),
(
  '50000000-0000-0000-0000-000000000003',
  'Infraestrutura de Rede — 2026',
  'Anual',
  '30000000-0000-0000-0000-000000000005',
  '2026',
  20, 8,
  'Em Andamento',
  '2026-01-15',
  'Cabeamento estruturado do novo andar'
);

-- ============================================================
--  COMPRAS — Solicitações de Compras
-- ============================================================

INSERT INTO compras_solicitacoes
  (id, numero, produto_id, quantidade, unidade, solicitante, prioridade, status, data, observacoes)
VALUES
(
  '60000000-0000-0000-0000-000000000001',
  'SC00001',
  '30000000-0000-0000-0000-000000000001',
  10, 'UN',
  'João Silva',
  'Alta', 'Aprovada',
  '2026-08-01',
  'Urgente — novos funcionários começam em 10/08'
),
(
  '60000000-0000-0000-0000-000000000002',
  'SC00002',
  '30000000-0000-0000-0000-000000000002',
  50, 'UN',
  'Maria Fernanda',
  'Média', 'Aprovada',
  '2026-08-03',
  'Substituição de mouses com defeito'
),
(
  '60000000-0000-0000-0000-000000000003',
  'SC00003',
  '30000000-0000-0000-0000-000000000005',
  5, 'MT',
  'João Silva',
  'Baixa', 'Pendente',
  '2026-08-10',
  'Cabo para nova sala de reuniões'
),
(
  '60000000-0000-0000-0000-000000000004',
  'SC00004',
  '30000000-0000-0000-0000-000000000007',
  15, 'UN',
  'Administrador',
  'Urgente', 'Em Análise',
  '2026-08-12',
  'Headsets para equipe de atendimento'
);

-- ============================================================
--  COMPRAS — Pedidos de Compras
--  Nota: valor_total é GENERATED (quantidade * preco_unitario), não inserir.
-- ============================================================

INSERT INTO compras_pedidos
  (id, numero, solicitacao_id, fornecedor_id, produto_id,
   quantidade, preco_unitario, status, data, data_prevista, observacoes)
VALUES
(
  '70000000-0000-0000-0000-000000000001',
  'PC00001',
  '60000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',
  10, 2800.00,
  'Recebido',
  '2026-08-02', '2026-08-08',
  'Pagamento 30 dias — boleto bancário'
),
(
  '70000000-0000-0000-0000-000000000002',
  'PC00002',
  '60000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000002',
  50, 45.00,
  'Confirmado',
  '2026-08-04', '2026-08-11',
  'Incluir nota fiscal eletrônica'
),
(
  '70000000-0000-0000-0000-000000000003',
  'PC00003',
  '60000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000004',
  '30000000-0000-0000-0000-000000000003',
  20, 120.00,
  'Enviado',
  '2026-08-05', '2026-08-15',
  'Teclados para reposição de estoque'
),
(
  '70000000-0000-0000-0000-000000000004',
  'PC00004',
  NULL,
  '20000000-0000-0000-0000-000000000003',
  '30000000-0000-0000-0000-000000000006',
  100, 3.50,
  'Confirmado',
  '2026-08-06', '2026-08-13',
  'Caixas para expedição do mês'
);

-- ============================================================
--  COMPRAS — Recebimentos
-- ============================================================

INSERT INTO compras_recebimentos
  (id, numero, pedido_id, fornecedor_id, produto_id,
   qtd_esperada, qtd_recebida, status, responsavel, data, observacoes)
VALUES
(
  '80000000-0000-0000-0000-000000000001',
  'RC00001',
  '70000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',
  10, 10,
  'Recebido Total',
  'João Silva',
  '2026-08-08',
  'Mercadoria recebida sem avarias'
),
(
  '80000000-0000-0000-0000-000000000002',
  'RC00002',
  '70000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000002',
  50, 48,
  'Recebido Parcial',
  'João Silva',
  '2026-08-11',
  '2 unidades faltando — fornecedor enviará complemento'
);

-- ============================================================
--  COMPRAS — Conferências
-- ============================================================

INSERT INTO compras_conferencias
  (id, recebimento_id, fornecedor_id, produto_id,
   qtd_esperada, qtd_recebida, status, responsavel, data, observacoes)
VALUES
(
  '90000000-0000-0000-0000-000000000001',
  '80000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',
  10, 10,
  'Aprovado',
  'Maria Fernanda',
  '2026-08-08',
  'Todos os notebooks conferidos e funcionando'
),
(
  '90000000-0000-0000-0000-000000000002',
  '80000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000002',
  50, 48,
  'Aprovado',
  'Maria Fernanda',
  '2026-08-11',
  'Divergência de 2 unidades registrada — aguardar complemento'
);

-- ============================================================
--  COMPRAS — Entradas de Nota Fiscal
-- ============================================================

INSERT INTO compras_notas_fiscais
  (id, numero_nf, fornecedor_id, recebimento_id, valor, qtd_itens, status, data, observacoes)
VALUES
(
  'a0000000-0000-0000-0000-000000000001',
  'NF-52341',
  '20000000-0000-0000-0000-000000000001',
  '80000000-0000-0000-0000-000000000001',
  28000.00, 10,
  'Lançada',
  '2026-08-08',
  'NF referente ao PC00001 — 10 Notebooks Dell'
),
(
  'a0000000-0000-0000-0000-000000000002',
  'NF-52399',
  '20000000-0000-0000-0000-000000000001',
  '80000000-0000-0000-0000-000000000002',
  2160.00, 48,
  'Lançada',
  '2026-08-11',
  'NF referente ao PC00002 — 48 Mouses (2 unidades pendentes)'
);

-- ============================================================
--  ESTOQUE — Movimentações
-- ============================================================

INSERT INTO estoque_movimentacoes
  (id, numero, produto_id, tipo, quantidade, origem, destino, usuario, data, hora, observacoes)
VALUES
(
  'b0000000-0000-0000-0000-000000000001',
  'MV00001',
  '30000000-0000-0000-0000-000000000001',
  'Entrada', 10,
  'Fornecedor — Distribuidora Nacional',
  'Estoque Principal — Prateleira A1',
  'João Silva',
  '2026-08-08', '10:30:00',
  'Entrada via NF-52341 / RC00001'
),
(
  'b0000000-0000-0000-0000-000000000002',
  'MV00002',
  '30000000-0000-0000-0000-000000000002',
  'Entrada', 48,
  'Fornecedor — Distribuidora Nacional',
  'Estoque Principal — Prateleira B2',
  'João Silva',
  '2026-08-11', '14:15:00',
  'Entrada via NF-52399 / RC00002 (48 de 50)'
),
(
  'b0000000-0000-0000-0000-000000000003',
  'MV00003',
  '30000000-0000-0000-0000-000000000003',
  'Transferência', 5,
  'Estoque Principal — Prateleira C3',
  'Estoque Showroom',
  'Administrador',
  '2026-08-12', '09:00:00',
  'Transferência para demonstração no showroom'
),
(
  'b0000000-0000-0000-0000-000000000004',
  'MV00004',
  '30000000-0000-0000-0000-000000000006',
  'Entrada', 200,
  'Fornecedor — Embalagens Rápidas',
  'Estoque Embalagens — Área E1',
  'Maria Fernanda',
  '2026-08-13', '11:45:00',
  'Entrada de caixas — referente ao PC00004'
),
(
  'b0000000-0000-0000-0000-000000000005',
  'MV00005',
  '30000000-0000-0000-0000-000000000001',
  'Saída', 3,
  'Estoque Principal — Prateleira A1',
  'Expedição — EXP00001',
  'João Silva',
  '2026-08-10', '08:00:00',
  'Saída via PV00001 / EXP00001'
),
(
  'b0000000-0000-0000-0000-000000000006',
  'MV00006',
  '30000000-0000-0000-0000-000000000004',
  'Saída', 2,
  'Estoque Principal — Prateleira D1',
  'Expedição — EXP00002',
  'Maria Fernanda',
  '2026-08-11', '15:30:00',
  'Saída via PV00002 / EXP00002'
),
(
  'b0000000-0000-0000-0000-000000000007',
  'MV00007',
  '30000000-0000-0000-0000-000000000003',
  'Saída', 2,
  'Estoque Principal — Prateleira C3',
  'Ajuste',
  'Administrador',
  '2026-08-14', '16:00:00',
  'Ajuste negativo — diferença apurada no INV00002'
);

-- ============================================================
--  ESTOQUE — Inventários
--  Nota: diferenca é GENERATED (qtd_contada - qtd_sistema), não inserir.
-- ============================================================

INSERT INTO estoque_inventarios
  (id, numero, produto_id, qtd_sistema, qtd_contada, status, responsavel, data, observacoes)
VALUES
(
  'c0000000-0000-0000-0000-000000000001',
  'INV00001',
  '30000000-0000-0000-0000-000000000001',
  12, 12,
  'Conferido',
  'João Silva',
  '2026-08-14',
  'Contagem bate com sistema — sem divergência'
),
(
  'c0000000-0000-0000-0000-000000000002',
  'INV00002',
  '30000000-0000-0000-0000-000000000003',
  40, 38,
  'Ajustado',
  'Maria Fernanda',
  '2026-08-14',
  'Diferença de -2 unidades apurada. Ajuste gerado via MV00007.'
),
(
  'c0000000-0000-0000-0000-000000000003',
  'INV00003',
  '30000000-0000-0000-0000-000000000005',
  8, 8,
  'Conferido',
  'Administrador',
  '2026-08-14',
  'ATENÇÃO: estoque abaixo do mínimo (atual=8, mínimo=10)'
);

-- ============================================================
--  VENDAS — Pedidos de Venda
--  Nota: valor_total é GENERATED (quantidade * preco_unitario), não inserir.
-- ============================================================

INSERT INTO vendas_pedidos
  (id, numero, cliente_id, produto_id, quantidade, preco_unitario,
   status, data, data_prevista, observacoes)
VALUES
(
  'd0000000-0000-0000-0000-000000000001',
  'PV00001',
  '10000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',
  3, 3999.90,
  'Entregue',
  '2026-08-09', '2026-08-14',
  'Venda corporativa — 3 notebooks para equipe de TI'
),
(
  'd0000000-0000-0000-0000-000000000002',
  'PV00002',
  '10000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0000-000000000004',
  2, 1099.90,
  'Em Expedição',
  '2026-08-10', '2026-08-16',
  'Monitores para consultórios'
),
(
  'd0000000-0000-0000-0000-000000000003',
  'PV00003',
  '10000000-0000-0000-0000-000000000003',
  '30000000-0000-0000-0000-000000000002',
  20, 89.90,
  'Em Separação',
  '2026-08-12', '2026-08-18',
  'Mouses para checkout dos caixas'
),
(
  'd0000000-0000-0000-0000-000000000004',
  'PV00004',
  '10000000-0000-0000-0000-000000000004',
  '30000000-0000-0000-0000-000000000007',
  5, 149.90,
  'Confirmado',
  '2026-08-13', '2026-08-20',
  'Headsets para atendimento ao cliente'
),
(
  'd0000000-0000-0000-0000-000000000005',
  'PV00005',
  '10000000-0000-0000-0000-000000000005',
  '30000000-0000-0000-0000-000000000003',
  1, 249.90,
  'Rascunho',
  '2026-08-15', '2026-08-22',
  'Venda avulsa — teclado mecânico'
);

-- ============================================================
--  VENDAS — Notas Fiscais de Venda
-- ============================================================

INSERT INTO vendas_notas_fiscais
  (id, numero_nf, serie, data_emissao, natureza_operacao, empresa_emitente,
   cliente_id, pedido_id, produto_id, quantidade, valor_unitario,
   valor_produtos, desconto, frete, valor_total,
   transportadora_id, frete_por_conta, qtd_volumes,
   peso_liquido, peso_bruto, status, informacoes_complementares)
VALUES
(
  'e0000000-0000-0000-0000-000000000001',
  '000001', '001',
  '2026-08-09',
  'Venda de Mercadoria',
  'ERP Senai LTDA',
  '10000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',
  3, 3999.90, 11999.70, 0.00, 150.00, 12149.70,
  '40000000-0000-0000-0000-000000000002',
  'CIF',
  3, 6.5, 7.2,
  'Emitida',
  'Venda corporativa conforme PV00001'
),
(
  'e0000000-0000-0000-0000-000000000002',
  '000002', '001',
  '2026-08-10',
  'Venda de Mercadoria',
  'ERP Senai LTDA',
  '10000000-0000-0000-0000-000000000002',
  'd0000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0000-000000000004',
  2, 1099.90, 2199.80, 100.00, 80.00, 2179.80,
  '40000000-0000-0000-0000-000000000001',
  'FOB',
  2, 10.0, 11.5,
  'Emitida',
  'Frete por conta do destinatário — conforme PV00002'
);

-- ============================================================
--  VENDAS — Separações (Picking)
-- ============================================================

INSERT INTO vendas_separacoes
  (id, numero, pedido_id, produto_id, quantidade, separador, status, data, observacoes)
VALUES
(
  'f0000000-0000-0000-0000-000000000001',
  'SEP00001',
  'd0000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',
  3,
  'João Silva',
  'Concluído',
  '2026-08-09',
  'Separação concluída — prateleira A1-03'
),
(
  'f0000000-0000-0000-0000-000000000002',
  'SEP00002',
  'd0000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0000-000000000004',
  2,
  'Maria Fernanda',
  'Concluído',
  '2026-08-10',
  'Monitores embalados individualmente em caixa original'
),
(
  'f0000000-0000-0000-0000-000000000003',
  'SEP00003',
  'd0000000-0000-0000-0000-000000000003',
  '30000000-0000-0000-0000-000000000002',
  20,
  'João Silva',
  'Em Separação',
  '2026-08-13',
  'Localizados em B2-07 — aguardando embalagem'
);

-- ============================================================
--  VENDAS — Romaneios
-- ============================================================

INSERT INTO vendas_romaneios
  (id, numero, data, pedido_id, cliente_id, transportadora_id,
   produto_id, quantidade, qtd_volumes, peso_liquido, peso_bruto,
   responsavel, status, observacoes)
VALUES
(
  'aa000000-0000-0000-0000-000000000001',
  'ROM00001',
  '2026-08-09',
  'd0000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0000-000000000001',
  3, 3, 6.5, 7.2,
  'João Silva',
  'Despachado',
  'Entrega em endereço corporativo — Rua das Inovações, 100'
),
(
  'aa000000-0000-0000-0000-000000000002',
  'ROM00002',
  '2026-08-10',
  'd0000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000002',
  '40000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000004',
  2, 2, 10.0, 11.5,
  'Maria Fernanda',
  'Emitido',
  'Aguardando coleta da transportadora'
);

-- ============================================================
--  VENDAS — Expedições
-- ============================================================

INSERT INTO vendas_expedicoes
  (id, numero, pedido_id, separacao_id, transportadora_id,
   quantidade, tipo_embalagem, status, responsavel, data, observacoes)
VALUES
(
  'bb000000-0000-0000-0000-000000000001',
  'EXP00001',
  'd0000000-0000-0000-0000-000000000001',
  'f0000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000002',
  3, 'Caixa',
  'Expedido',
  'João Silva',
  '2026-08-10',
  'Saiu às 08h — PV00001 expedido com sucesso'
),
(
  'bb000000-0000-0000-0000-000000000002',
  'EXP00002',
  'd0000000-0000-0000-0000-000000000002',
  'f0000000-0000-0000-0000-000000000002',
  '40000000-0000-0000-0000-000000000001',
  2, 'Caixa',
  'Em Expedição',
  'Maria Fernanda',
  '2026-08-11',
  'Aguardando coleta da transportadora Rápido Sul'
);

-- ============================================================
--  VENDAS — Entregas
-- ============================================================

INSERT INTO vendas_entregas
  (id, numero, expedicao_id, transportadora_id, cliente_id,
   codigo_rastreio, status, data, data_entrega, responsavel, observacoes)
VALUES
(
  'cc000000-0000-0000-0000-000000000001',
  'ENT00001',
  'bb000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000001',
  'EX123456789BR',
  'Entregue',
  '2026-08-10', '2026-08-14',
  'João Silva',
  'Recebido por Cláudia Souza — Recepção da Tech Solutions'
),
(
  'cc000000-0000-0000-0000-000000000002',
  'ENT00002',
  'bb000000-0000-0000-0000-000000000002',
  '40000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  'EX987654321BR',
  'Em Trânsito',
  '2026-08-11', NULL,
  'Maria Fernanda',
  'Previsão de entrega: 16/08/2026'
);

-- ============================================================
--  FIM DO SEED
--  Resumo do que foi inserido:
--    Usuários      : 3 (administrador, joao e maria)
--    Clientes      : 5
--    Fornecedores  : 4
--    Produtos      : 7 (P00001 a P00007)
--    Transportadoras: 3
--    Planejamentos : 3
--    Solicitações  : 4 (SC00001 a SC00004)
--    Pedidos Compra: 4 (PC00001 a PC00004)
--    Recebimentos  : 2 (RC00001 a RC00002)
--    Conferências  : 2
--    NFs Compra    : 2 (NF-52341, NF-52399)
--    Movimentações : 7 (MV00001 a MV00007)
--    Inventários   : 3 (INV00001 a INV00003)
--    Pedidos Venda : 5 (PV00001 a PV00005)
--    NFs Venda     : 2 (000001, 000002)
--    Separações    : 3 (SEP00001 a SEP00003)
--    Romaneios     : 2 (ROM00001 a ROM00002)
--    Expedições    : 2 (EXP00001 a EXP00002)
--    Entregas      : 2 (ENT00001 a ENT00002)
-- ============================================================
