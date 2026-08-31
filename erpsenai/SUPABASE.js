// ============================================================
//  ERP Senai — Configuração e Utilitários Supabase
//  Incluir em todas as páginas: <script src="../SUPABASE.js"></script>
//  (ajustar o caminho relativo conforme a pasta da página)
// ============================================================

'use strict';

// ── Credenciais ─────────────────────────────────────────────
const SUPABASE_URL = 'https://vdhahqicqlrdvcpesiwk.supabase.co';
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkaGFocWljcWxyZHZjcGVzaXdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MTI3OTYsImV4cCI6MjEwMjI4ODc5Nn0.7ACHuUUv6VMyy4-BbQcdAcmabMtqhiuVgrTGUUcV7RY';
const API = `${SUPABASE_URL}/rest/v1`;
const DATABASE_PASS = 'QFWIOenjgvEJlNKy';

const HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation'
};

const HEADERS_READ = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json'
};

// ── Timeout padrão das requisições (10 segundos) ────────────
const REQUEST_TIMEOUT_MS = 10_000;

function fetchComTimeout(url, options = {}) {
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  return fetch(url, { ...options, signal: ctrl.signal }).finally(() => clearTimeout(tid));
}

// ============================================================
//  CRUD GENÉRICO
// ============================================================

/**
 * Listar registros de uma tabela.
 * @param {string} tabela - Nome da tabela no Supabase.
 * @param {string} [query=''] - Query string adicional, ex: 'ativo=eq.true&order=nome.asc'
 * @returns {Promise<Array>}
 */
async function sbListar(tabela, query = '') {
  const sep = query ? '?' : '';
  const res = await fetchComTimeout(`${API}/${tabela}${sep}${query}`, {
    headers: HEADERS_READ
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`[sbListar] ${tabela}: ${err}`);
  }
  return res.json();
}

/**
 * Buscar um único registro pelo id.
 * @param {string} tabela
 * @param {string} id - UUID do registro.
 * @returns {Promise<Object|null>}
 */
async function sbBuscar(tabela, id) {
  const rows = await sbListar(tabela, `id=eq.${encodeURIComponent(id)}&limit=1`);
  return rows[0] ?? null;
}

/**
 * Inserir um novo registro.
 * @param {string} tabela
 * @param {Object} dados - Campos a inserir.
 * @returns {Promise<Object>} Registro inserido.
 */
async function sbInserir(tabela, dados) {
  const res = await fetchComTimeout(`${API}/${tabela}`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(dados)
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`[sbInserir] ${tabela}: ${err}`);
  }
  const result = await res.json();
  return Array.isArray(result) ? result[0] : result;
}

/**
 * Atualizar um registro pelo id.
 * @param {string} tabela
 * @param {string} id
 * @param {Object} dados - Campos a atualizar.
 * @returns {Promise<Object>} Registro atualizado.
 */
async function sbAtualizar(tabela, id, dados) {
  const res = await fetchComTimeout(`${API}/${tabela}?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: HEADERS,
    body: JSON.stringify(dados)
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`[sbAtualizar] ${tabela}: ${err}`);
  }
  const result = await res.json();
  return Array.isArray(result) ? result[0] : result;
}

/**
 * Excluir um registro pelo id.
 * @param {string} tabela
 * @param {string} id
 * @returns {Promise<true>}
 */
async function sbExcluir(tabela, id) {
  const res = await fetchComTimeout(`${API}/${tabela}?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: HEADERS_READ
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`[sbExcluir] ${tabela}: ${err}`);
  }
  return true;
}

/**
 * Contar registros de uma tabela (com filtro opcional).
 * @param {string} tabela
 * @param {string} [query='']
 * @returns {Promise<number>}
 */
async function sbContar(tabela, query = '') {
  const sep = query ? '&' : '?';
  const res = await fetchComTimeout(`${API}/${tabela}?select=id${sep}${query}`, {
    headers: HEADERS_READ
  });
  if (!res.ok) throw new Error(`[sbContar] ${tabela}`);
  const rows = await res.json();
  return rows.length;
}

// ============================================================
//  NUMERAÇÃO AUTOMÁTICA
// ============================================================

/**
 * Gera o próximo número sequencial para uma tabela.
 * Exemplos: proximoNumero('produtos','codigo','P') → 'P00001'
 *
 * @param {string} tabela  - Nome da tabela.
 * @param {string} campo   - Nome da coluna com o número (ex: 'numero', 'codigo').
 * @param {string} prefixo - Prefixo do número (ex: 'P', 'SC', 'PC', 'PV').
 * @param {number} [digitos=5] - Total de dígitos numéricos.
 * @returns {Promise<string>}
 */
async function sbProximoNumero(tabela, campo, prefixo, digitos = 5) {
  const rows = await sbListar(tabela, `select=${campo}&order=${campo}.desc&limit=1`);
  const ultimo = rows.length ? parseInt(rows[0][campo].replace(prefixo, ''), 10) : 0;
  return prefixo + String(ultimo + 1).padStart(digitos, '0');
}

// Atalhos por entidade
const Numerar = {
  produto: () => sbProximoNumero('produtos', 'codigo', 'P'),
  solicitacao: () => sbProximoNumero('compras_solicitacoes', 'numero', 'SC'),
  pedidoCompra: () => sbProximoNumero('compras_pedidos', 'numero', 'PC'),
  recebimento: () => sbProximoNumero('compras_recebimentos', 'numero', 'RC'),
  inventario: () => sbProximoNumero('estoque_inventarios', 'numero', 'INV'),
  movimentacao: () => sbProximoNumero('estoque_movimentacoes', 'numero', 'MV'),
  pedidoVenda: () => sbProximoNumero('vendas_pedidos', 'numero', 'PV'),
  romaneio: () => sbProximoNumero('vendas_romaneios', 'numero', 'ROM'),
  separacao: () => sbProximoNumero('vendas_separacoes', 'numero', 'SEP'),
  expedicao: () => sbProximoNumero('vendas_expedicoes', 'numero', 'EXP'),
  entrega: () => sbProximoNumero('vendas_entregas', 'numero', 'ENT')
};

// ============================================================
//  AUTENTICAÇÃO
// ============================================================

/** SHA-256 de uma string (Web Crypto API). */
async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Autenticar usuário do ERP.
 * Após o login, busca as telas permitidas do perfil e salva em localStorage.
 * @param {string} email
 * @param {string} senha - Senha em texto puro (será hasheada).
 * @returns {Promise<Object>} Dados do usuário logado.
 * @throws {Error} Se as credenciais forem inválidas.
 */
async function sbLogin(email, senha) {
  const hash = await sha256(senha);
  const rows = await sbListar(
    'erp_usuarios',
    `email=eq.${encodeURIComponent(email)}&senha_hash=eq.${hash}&status=eq.true` +
      `&select=id,nome,email,cargo,perfil_id,permissoes`
  );
  if (!rows.length) throw new Error('E-mail ou senha incorretos.');

  const user = rows[0];

  // Mapeamento siscodigo → chave de permissão usada no menu
  const SISTEMA_PERM = {
    1: 'visao_geral',
    2: 'cadastros',
    3: 'compras',
    4: 'estoque',
    5: 'vendas',
    6: 'estoque',
    7: 'financeiro',
    9: 'marketing',
    10: 'gamificacao',
    11: 'rh'
  };

  if (user.perfil_id == null) {
    throw new Error('Usuário sem perfil vinculado. Contate o administrador.');
  }

  const perfis = await sbListar(
    'perfil',
    `id=eq.${user.perfil_id}&select=nome&limit=1`
  );
  if (!perfis.length) {
    throw new Error('Perfil do usuário não encontrado. Contate o administrador.');
  }

  const nomePerfil = perfis[0].nome;
  const permissoes = {};
  let telasDoLogin = [];

  const perfilTelas = await sbListar(
    'perfil_sistema',
    `perfil_id=eq.${user.perfil_id}&select=tela_id`
  );
  console.log('[sbLogin] perfil_id:', user.perfil_id);
  console.log('[sbLogin] perfil_sistema rows:', perfilTelas);

  const telaIds = [...new Set(
    perfilTelas.map((vinculo) => vinculo.tela_id).filter((id) => id != null)
  )];
  console.log('[sbLogin] telaIds:', telaIds);

  if (telaIds.length) {
    const filtroIds = telaIds.join(',');

    telasDoLogin = await sbListar(
      'tela',
      `id=in.(${filtroIds})&ativo=eq.1&select=id,nome,nome_html,nome_sistema_html&order=nome.asc`
    );
    console.log('[sbLogin] telasDoLogin:', telasDoLogin);

    const telaSistemas = await sbListar(
      'tela_sistema',
      `tela_id=in.(${filtroIds})&select=tela_id,sistema_id`
    );
    const telaToSistema = {};
    telaSistemas.forEach((ts) => { if (!telaToSistema[ts.tela_id]) telaToSistema[ts.tela_id] = ts.sistema_id; });
    telasDoLogin = telasDoLogin.map((t) => ({ ...t, sistema_id: telaToSistema[t.id] ?? 0 }));
    const sistemasUnicos = [...new Set(telaSistemas.map((ts) => ts.sistema_id))];
    sistemasUnicos.forEach((sid) => {
      const chave = SISTEMA_PERM[sid];
      if (chave) permissoes[chave] = true;
    });
  } else {
    console.warn('[sbLogin] Nenhuma tela vinculada ao perfil_id:', user.perfil_id);
  }

  const sistemasOrdenados = await sbListar('sistema', 'sisativo=eq.1&order=sisordem.asc&select=siscodigo,sisnome,sisordem');

  // Limpar dados de sessão anterior e setar tudo de uma vez
  [
    'erp_role',
    'erp_perfil_id',
    'erp_user_id',
    'erp_user_nome',
    'erp_user_email',
    'erp_permissoes',
    'erp_telas',
    'erp_sistemas',
    'erp_login'
  ].forEach((k) => localStorage.removeItem(k));
  sessionStorage.removeItem('_telas_cache');

  localStorage.setItem('erp_role', nomePerfil);
  localStorage.setItem('erp_perfil_id', String(user.perfil_id));
  localStorage.setItem('erp_user_id', user.id);
  localStorage.setItem('erp_user_nome', user.nome);
  localStorage.setItem('erp_user_email', user.email);
  localStorage.setItem('erp_permissoes', JSON.stringify(permissoes));
  localStorage.setItem('erp_telas', JSON.stringify(telasDoLogin));
  localStorage.setItem('erp_sistemas', JSON.stringify(sistemasOrdenados));
  localStorage.setItem('erp_login', String(Date.now()));

  return user;
}

/** Encerrar sessão e redirecionar para o login. */
function sbLogout(paginaLogin = '/index.html') {
  localStorage.removeItem('erp_role');
  localStorage.removeItem('erp_perfil_id');
  localStorage.removeItem('erp_telas');
  localStorage.removeItem('erp_sistemas');
  localStorage.removeItem('erp_user_id');
  localStorage.removeItem('erp_user_nome');
  localStorage.removeItem('erp_user_email');
  localStorage.removeItem('erp_permissoes');
  localStorage.removeItem('erp_login');
  sessionStorage.removeItem('_telas_cache'); // limpa cache de sessão
  window.location.href = paginaLogin;
}

/** Duração máxima da sessão: 60 minutos. */
const SESSAO_MAX_MS = 60 * 60 * 1000;

/**
 * Verificar se há sessão válida. Redireciona para o login se inválida.
 * Chamar no topo de toda página protegida.
 * @param {string} [paginaLogin='../index.html']
 */
function sbVerificarSessao(paginaLogin = '../index.html') {
  const role  = localStorage.getItem('erp_role');
  const login = parseInt(localStorage.getItem('erp_login') || '0', 10);
  if (!role || Date.now() - login > SESSAO_MAX_MS) {
    localStorage.clear();
    window.location.replace(paginaLogin);
    return;
  }
  // Sessão antiga sem erp_telas → forçar re-login para repopular permissões
  const telasRaw = localStorage.getItem('erp_telas');
  let telaValida = false;
  try {
    const arr = JSON.parse(telasRaw || 'null');
    telaValida = Array.isArray(arr) && arr.length > 0;
  } catch { telaValida = false; }
  if (!telaValida) {
    localStorage.clear();
    window.location.replace(paginaLogin);
  }
}

/** Retorna o perfil do usuário logado ('Administrador' | 'Usuário'). */
function sbPerfil() {
  return localStorage.getItem('erp_role') ?? null;
}

/** Retorna true se o usuário logado é Administrador. */
function sbIsAdmin() {
  return sbPerfil() === 'Administrador';
}

/**
 * Verifica se o usuário tem permissão para um módulo.
 * Administradores têm acesso a tudo.
 * @param {'visao_geral'|'cadastros'|'compras'|'estoque'|'vendas'} modulo
 * @returns {boolean}
 */
function sbTemPermissao(modulo) {
  if (sbIsAdmin()) return true;
  const perms = JSON.parse(localStorage.getItem('erp_permissoes') || '{}');
  return perms[modulo] === true;
}

/** Redireciona para o dashboard se o usuário não tiver permissão. */
function sbExigirPermissao(modulo, paginaDashboard = '../dashboard.html') {
  if (!sbTemPermissao(modulo)) {
    alert('Você não tem permissão para acessar este módulo.');
    window.location.replace(paginaDashboard);
  }
}

/** Retorna o nome do usuário logado. */
function sbUserNome() {
  return localStorage.getItem('erp_user_nome') ?? 'Usuário';
}

// ============================================================
//  TEMA (claro / escuro)
// ============================================================

/** Aplicar o tema salvo antes do render (evita flash). Chamar no <head>. */
function sbAplicarTema() {
  const t = localStorage.getItem('senai_tema') || 'light';
  document.documentElement.setAttribute('data-theme', t);
}

/** Alternar entre claro e escuro. */
function sbToggleTema() {
  const atual = document.documentElement.getAttribute('data-theme');
  const novo = atual === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', novo);
  localStorage.setItem('senai_tema', novo);
  return novo;
}

/** Sincronizar o texto do botão de tema com o estado atual.
 *  Apenas atualiza o label — o clique é tratado pelo onclick da página.
 *  @param {string} btnId - ID do botão de toggle.
 */
function sbIniciarBtnTema(btnId = 'btnTema') {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  const t = localStorage.getItem('senai_tema') || 'light';
  btn.textContent = t === 'dark' ? '☀️ Claro' : '🌙 Escuro';
}

// ============================================================
//  SIDEBAR ACCORDION
// ============================================================

/**
 * Transforma as seções do sidebar em accordion (Cadastros, Compras, Estoque, Vendas e Logística).
 * Chamada automaticamente quando o DOM estiver pronto e houver um .sidebar na página.
 */
function sbInitSidebarAccordion() {
  const ACC_KEYS = [
    'cadastros',
    'compras',
    'estoque',
    'vendas',
    'logística',
    'log',
    'financeiro',
    'configurações',
    'config',
    'marketing',
    'gamificação',
    'gamif',
    'recursos humanos',
    'rh'
  ];

  document.querySelectorAll('.sidebar-section').forEach((section) => {
    const labelEl = section.querySelector('.sidebar-section-label');
    if (!labelEl) return;

    const labelKey = labelEl.textContent.trim().toLowerCase();
    if (!ACC_KEYS.some((k) => labelKey.startsWith(k))) return;

    const labelText = labelEl.textContent.trim();
    const hasActive = !!section.querySelector('.sidebar-link.ativo');

    // Botão de toggle
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sidebar-acc-btn';
    const arrow = document.createElement('span');
    arrow.className = 'sidebar-acc-arrow' + (hasActive ? ' open' : '');
    arrow.textContent = '▼';
    btn.appendChild(document.createTextNode(''));
    btn.innerHTML = `<span>${labelText}</span>`;
    btn.appendChild(arrow);

    // Corpo colapsável
    const body = document.createElement('div');
    body.className = 'sidebar-acc-body' + (hasActive ? ' open' : '');

    // Move links para o corpo (mantém labelEl no lugar por enquanto)
    Array.from(section.children).forEach((child) => {
      if (child !== labelEl) body.appendChild(child);
    });

    labelEl.replaceWith(btn);
    section.appendChild(body);

    btn.addEventListener('click', () => {
      const open = body.classList.toggle('open');
      btn.querySelector('.sidebar-acc-arrow').classList.toggle('open', open);
    });
  });
}

// Auto-init em páginas que possuem sidebar
(function () {
  function _tryInit() {
    // sbInitSidebarAccordion removido: menu.js já gerencia o accordion via .sidebar-section.open
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _tryInit);
  } else {
    _tryInit();
  }
})();

// ============================================================
//  AUXILIARES DE UI
// ============================================================

/**
 * Exibir mensagem de feedback (sucesso, erro, alerta).
 * @param {string} elId - ID do elemento de mensagem.
 * @param {string} texto
 * @param {'ok'|'err'|'warn'} tipo
 * @param {number} [ms=3000] - Duração antes de ocultar (0 = não ocultar).
 */
function sbMensagem(elId, texto, tipo = 'ok', ms = 3000) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = texto;
  el.className = `crud-msg ${tipo}`;
  el.style.display = 'block';
  if (ms > 0)
    setTimeout(() => {
      el.style.display = 'none';
    }, ms);
}

/**
 * Formatar valor monetário brasileiro.
 * @param {number|string} valor
 * @returns {string} ex: 'R$ 1.234,56'
 */
function sbMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

/**
 * Formatar data ISO para DD/MM/AAAA.
 * @param {string} iso - ex: '2026-08-14'
 * @returns {string} ex: '14/08/2026'
 */
function sbData(iso) {
  if (!iso) return '—';
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
}

/**
 * Preencher um <select> com opções vindas do Supabase.
 * @param {string} selectId - ID do elemento <select>.
 * @param {string} tabela   - Tabela a consultar.
 * @param {string} query    - Query adicional (ex: 'ativo=eq.true&order=nome.asc').
 * @param {string} campoValor  - Campo usado como value da option (geralmente 'id').
 * @param {string} campoTexto  - Campo exibido como label (geralmente 'nome').
 * @param {string} [placeholderTexto='Selecione...']
 */
async function sbPopularSelect(
  selectId,
  tabela,
  query,
  campoValor = 'id',
  campoTexto = 'nome',
  placeholderTexto = 'Selecione...'
) {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  sel.innerHTML = `<option value="">— ${placeholderTexto} —</option>`;
  try {
    const rows = await sbListar(tabela, query);
    rows.forEach((r) => {
      const opt = document.createElement('option');
      opt.value = r[campoValor];
      opt.textContent = r[campoTexto];
      sel.appendChild(opt);
    });
  } catch (e) {
    console.error('[sbPopularSelect]', e);
  }
}

/**
 * Integração com ViaCEP — preenche campos de endereço ao sair do CEP.
 * Se o campo cidade for um <select>, recarrega as cidades do estado retornado pelo CEP.
 * @param {string} cepInputId - ID do input de CEP.
 * @param {{ endereco, cidade, estado }} campos - IDs dos campos a preencher.
 */
function sbViaCEP(cepInputId, campos = {}) {
  const inp = document.getElementById(cepInputId);
  if (!inp) return;
  inp.addEventListener('blur', async () => {
    const cep = inp.value.replace(/\D/g, '');
    if (cep.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (data.erro) return;
      if (campos.endereco) {
        const el = document.getElementById(campos.endereco);
        if (el) el.value = data.logradouro || '';
      }
      if (campos.estado) {
        const el = document.getElementById(campos.estado);
        if (el) el.value = data.uf || '';
      }
      if (campos.cidade) {
        const el = document.getElementById(campos.cidade);
        if (el) {
          if (el.tagName === 'SELECT') {
            // Recarrega cidades do estado e pré-seleciona a cidade do CEP
            await sbCarregarCidades(data.uf || '', campos.cidade, data.localidade || '');
          } else {
            el.value = data.localidade || '';
          }
        }
      }
    } catch {
      /* silencioso */
    }
  });
}

/**
 * Carrega municípios de uma UF via IBGE e popula um <select>.
 * @param {string} uf - Sigla do estado (ex: 'SC', 'SP')
 * @param {string} cidadeSelectId - ID do <select> de cidade
 * @param {string} [cidadeSelecionada=''] - Nome da cidade a pré-selecionar
 */
async function sbCarregarCidades(uf, cidadeSelectId, cidadeSelecionada = '') {
  const sel = document.getElementById(cidadeSelectId);
  if (!sel) return;
  if (!uf) {
    sel.innerHTML = '<option value="">— Selecione o estado —</option>';
    sel.disabled = true;
    return;
  }
  sel.innerHTML = '<option value="">Carregando cidades…</option>';
  sel.disabled = true;
  try {
    const res = await fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`
    );
    const municipios = await res.json();
    sel.innerHTML = '<option value="">— Cidade —</option>';
    municipios.forEach((m) => {
      const opt = document.createElement('option');
      opt.value = m.nome;
      opt.textContent = m.nome;
      if (m.nome === cidadeSelecionada) opt.selected = true;
      sel.appendChild(opt);
    });
  } catch {
    sel.innerHTML = '<option value="">Erro ao carregar cidades</option>';
  } finally {
    sel.disabled = false;
  }
}

/**
 * Vincula o select de Estado ao select de Cidade.
 * Ao mudar o estado, recarrega as cidades automaticamente.
 * Por padrão, carrega SC ao inicializar.
 * @param {string} estadoId - ID do <select> de estado
 * @param {string} cidadeId - ID do <select> de cidade
 * @param {string} [defaultUF='SC'] - UF padrão se o estado estiver vazio
 */
function sbBindEstadoCidade(estadoId, cidadeId, defaultUF = 'SC') {
  const selEstado = document.getElementById(estadoId);
  if (!selEstado) return;
  selEstado.addEventListener('change', () => sbCarregarCidades(selEstado.value, cidadeId));
  if (!selEstado.value && defaultUF) selEstado.value = defaultUF;
  sbCarregarCidades(selEstado.value || defaultUF, cidadeId);
}

// ============================================================
//  ESTOQUE — helpers específicos
// ============================================================

/**
 * Registrar uma movimentação de estoque (Entrada, Saída, Ajuste, Transferência).
 * O trigger do banco atualiza produtos.estoque_atual automaticamente.
 *
 * @param {'Entrada'|'Saída'|'Ajuste'|'Transferência'} tipo
 * @param {string} produtoId
 * @param {number} quantidade
 * @param {Object} [extra={}] - origem, destino, referencia, observacoes, usuario
 * @returns {Promise<Object>} Movimentação criada.
 */
async function sbMovimentarEstoque(tipo, produtoId, quantidade, extra = {}) {
  const numero = await Numerar.movimentacao();
  return sbInserir('estoque_movimentacoes', {
    numero,
    produto_id: produtoId,
    tipo,
    quantidade,
    origem: extra.origem ?? null,
    destino: extra.destino ?? null,
    referencia: extra.referencia ?? null,
    observacoes: extra.observacoes ?? null,
    usuario: extra.usuario ?? sbUserNome(),
    data: new Date().toISOString().split('T')[0],
    hora: new Date().toTimeString().slice(0, 8)
  });
}

/**
 * Verificar se há estoque suficiente para uma venda.
 * @param {string} produtoId
 * @param {number} qtdNecessaria
 * @returns {Promise<{ok:boolean, atual:number}>}
 */
async function sbVerificarEstoque(produtoId, qtdNecessaria) {
  const prod = await sbBuscar('produtos', produtoId);
  if (!prod) return { ok: false, atual: 0 };
  return { ok: prod.estoque_atual >= qtdNecessaria, atual: prod.estoque_atual };
}

// ============================================================
//  GERAÇÃO DE PDF — Pedido de Compras
// ============================================================

/**
 * Gerar e imprimir o PDF de um Pedido de Compras.
 * Usa window.print() com CSS @media print.
 * @param {Object} pedido - Dados completos do pedido.
 * @param {Object} fornecedor - Dados do fornecedor.
 * @param {Object} produto - Dados do produto.
 */
function sbGerarPDFPedidoCompra(pedido, fornecedor, produto) {
  const win = window.open('', '_blank');
  win.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Pedido de Compras — ${pedido.numero}</title>
      <style>
        body{font-family:Arial,sans-serif;margin:40px;color:#202124}
        h1{color:#004384;font-size:20px;margin-bottom:4px}
        .sub{color:#666;font-size:12px;margin-bottom:24px}
        table{width:100%;border-collapse:collapse;font-size:13px;margin:16px 0}
        th{background:#004384;color:#fff;padding:8px 12px;text-align:left}
        td{padding:8px 12px;border-bottom:1px solid #e0e0e0}
        .valor{font-size:18px;font-weight:700;color:#004384;margin-top:12px}
        .rodape{margin-top:40px;font-size:11px;color:#aaa;border-top:1px solid #e0e0e0;padding-top:12px}
        @media print{body{margin:20px}}
      </style>
    </head>
    <body>
      <h1>📦 Pedido de Compras</h1>
      <div class="sub">${pedido.numero} &nbsp;·&nbsp; Emitido em ${sbData(pedido.data)}</div>
      <table>
        <tr><th colspan="2">Fornecedor</th></tr>
        <tr><td>Razão Social</td><td>${fornecedor.nome}</td></tr>
        <tr><td>CNPJ</td><td>${fornecedor.cnpj ?? '—'}</td></tr>
        <tr><td>Contato</td><td>${fornecedor.contato ?? '—'}</td></tr>
        <tr><td>E-mail</td><td>${fornecedor.email ?? '—'}</td></tr>
        <tr><td>Telefone</td><td>${fornecedor.telefone ?? '—'}</td></tr>
      </table>
      <table>
        <tr><th>Produto</th><th>Qtd</th><th>Unidade</th><th>Preço Unit.</th><th>Valor Total</th></tr>
        <tr>
          <td>${produto.nome} (${produto.codigo})</td>
          <td>${pedido.quantidade}</td>
          <td>${produto.unidade ?? '—'}</td>
          <td>${sbMoeda(pedido.preco_unitario)}</td>
          <td>${sbMoeda(pedido.valor_total)}</td>
        </tr>
      </table>
      <div class="valor">Total: ${sbMoeda(pedido.valor_total)}</div>
      <table>
        <tr><th>Data do Pedido</th><th>Entrega Prevista</th><th>Status</th></tr>
        <tr>
          <td>${sbData(pedido.data)}</td>
          <td>${sbData(pedido.data_prevista) ?? '—'}</td>
          <td>${pedido.status}</td>
        </tr>
      </table>
      ${pedido.observacoes ? `<p><strong>Observações:</strong> ${pedido.observacoes}</p>` : ''}
      <div class="rodape">ERP Senai &nbsp;·&nbsp; Gerado em ${new Date().toLocaleString('pt-BR')}</div>
    </body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
}

// ============================================================
// ============================================================

/**
 * Tenta o caminho relativo correto conforme a profundidade da página.
 */
/**
 * Síncrono — sem fetch, sem risco de race condition ou falha de rede.
 * presentes em erp_telas permanecem visíveis.
 */
  // ── Ocultar links não permitidos ──────────────────────────────

  // ── Ocultar seções sem nenhum link visível ─────────────────────

  // ── Bloquear acesso direto a página não autorizada ─────────────
/** A visibilidade das telas é controlada exclusivamente por menu.js. */

/** Impede acesso direto por URL sem manipular a visibilidade da sidebar. */
function sbProtegerTelaAtual() {
  if (sbIsAdmin()) return;
  const perfilId = localStorage.getItem('erp_perfil_id');
  if (!perfilId || perfilId === 'null' || perfilId === 'undefined') return;

  let telas = [];
  try {
    telas = JSON.parse(localStorage.getItem('erp_telas') || '[]');
  } catch {
    telas = [];
  }

  const arquivoAtual = window.location.pathname.replace(/\\/g, '/').split('/').pop() || '';
  if (!arquivoAtual || arquivoAtual === 'index.html' || arquivoAtual === 'dashboard.html') return;

  const permitidas = new Set(telas.map((tela) => String(tela.nome_html || '').split('/').pop()));
  if (!permitidas.has(arquivoAtual)) {
    const partes = window.location.pathname.replace(/\\/g, '/').split('/').filter(Boolean);
    window.location.replace(partes.length >= 2 ? '../dashboard.html' : 'dashboard.html');
  }
}
// ============================================================
//  MENU CONFIGURAÇÕES (dropdown no header)
// ============================================================

/** Detecta o prefixo de caminho para a pasta configuracoes/ */
function _sbConfigPath() {
  const p = window.location.pathname.replace(/\\/g, '/');
  const partes = p.split('/').filter(Boolean);
  const pasta = partes.length >= 2 ? partes[partes.length - 2].toLowerCase() : '';
  if (pasta === 'configuracoes') return './';
  if (
    [
      'cadastros',
      'compras',
      'estoque',
      'vendas',
      'financeiro',
      'rh',
      'marketing',
      'gamificacao'
    ].includes(pasta)
  )
    return '../configuracoes/';
  return 'configuracoes/';
}

/** Injeta o botão ⚙️ Configurações (com dropdown) antes do botão Sair. */
function sbInjetarMenuConfiguracoes() {
  if (!sbIsAdmin()) return;
  if (document.getElementById('sbDdConfigBtn')) return; // já injetado

  const sairBtn =
    document.querySelector('.header-btn[onclick*="sair"]') ||
    document.querySelector('.header-btn[onclick*="sbLogout"]');
  if (!sairBtn) return;

  const base = _sbConfigPath();
  const wrap = document.createElement('div');
  wrap.className = 'sb-dd';
  wrap.id = 'sbDdConfigWrap';
  wrap.innerHTML = `
    <button class="header-btn" id="sbDdConfigBtn" type="button">⚙️ Configurações ▾</button>
    <div class="sb-dd-menu" id="sbDdConfigMenu">
      <a class="sb-dd-item" href="${base}usuarios.html">👤 Usuários</a>
      <a class="sb-dd-item" href="${base}telas.html">🖥️ Telas</a>
      <a class="sb-dd-item" href="${base}perfis.html">🔑 Perfis</a>
      <a class="sb-dd-item" href="${base}regras-negocios.html">📋 Regras de Negócios</a>
      <hr style="margin:4px 0;border:none;border-top:1px solid var(--color-border-faint)">
      <button class="sb-dd-item" style="width:100%;background:none;border:none;text-align:left;cursor:pointer;font-family:inherit" onclick="sbAbrirAndamento()">📝 Andamento Alterações</button>
    </div>`;
  sairBtn.before(wrap);

  document.getElementById('sbDdConfigBtn').addEventListener('click', function (e) {
    e.stopPropagation();
    document.getElementById('sbDdConfigMenu').classList.toggle('show');
  });

  document.addEventListener('click', function () {
    const menu = document.getElementById('sbDdConfigMenu');
    if (menu) menu.classList.remove('show');
  });
}

// ============================================================
//  ANDAMENTO DE ALTERAÇÕES (modal com tabs por módulo)
// ============================================================

function _sbRootPath() {
  const p = (window.location.pathname || '').replace(/\\/g, '/');
  const parts = p.split('/').filter(Boolean);
  const folder = parts.length >= 2 ? parts[parts.length - 2].toLowerCase() : '';
  const sub = [
    'cadastros',
    'compras',
    'estoque',
    'vendas',
    'financeiro',
    'configuracoes',
    'marketing',
    'gamificacao',
    'rh',
    'score-credito'
  ];
  return sub.includes(folder) ? '../' : '';
}

const _SB_AND_MODULOS = [
  { key: 'geral', label: '📊 Geral', file: 'andamento.md' },
  { key: 'cadastros', label: '👥 Cadastros', file: 'cadastros/andamento.md' },
  { key: 'compras', label: '🛒 Compras', file: 'compras/andamento.md' },
  { key: 'estoque', label: '📦 Estoque', file: 'estoque/andamento.md' },
  { key: 'vendas', label: '🛍️ Vendas', file: 'vendas/andamento.md' },
  { key: 'financeiro', label: '💰 Financeiro', file: 'financeiro/andamento.md' },
  { key: 'marketing', label: '📣 Marketing', file: 'marketing/andamento.md' },
  { key: 'configuracoes', label: '⚙️ Config', file: 'configuracoes/andamento.md' },
  { key: 'gamificacao', label: '🎮 Gamificação', file: 'gamificacao/andamento.md' },
  { key: 'rh', label: '👤 RH', file: 'rh/andamento.md' }
];

function _sbMdInline(t) {
  return t
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(
      /`(.+?)`/g,
      '<code style="background:rgba(0,0,0,.08);padding:1px 5px;border-radius:3px;font-size:.88em;font-family:monospace">$1</code>'
    );
}

function _sbMdToHtml(md) {
  if (!md)
    return '<p style="color:var(--color-text-faint);font-style:italic;font-size:13px">Arquivo não encontrado.</p>';
  const lines = md.split('\n');
  let html = '';
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('### ')) {
      html += `<h3 style="font-size:13px;font-weight:700;margin:14px 0 4px;color:var(--color-text)">${_sbMdInline(line.slice(4))}</h3>`;
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      html += `<h2 style="font-size:15px;font-weight:700;margin:18px 0 6px;color:var(--color-text);border-bottom:1px solid var(--color-border-faint);padding-bottom:4px">${_sbMdInline(line.slice(3))}</h2>`;
      i++;
      continue;
    }
    if (line.startsWith('# ')) {
      html += `<h1 style="font-size:18px;font-weight:800;margin:0 0 8px;color:var(--color-text)">${_sbMdInline(line.slice(2))}</h1>`;
      i++;
      continue;
    }
    if (/^-{3,}$/.test(line.trim())) {
      html +=
        '<hr style="border:none;border-top:1px solid var(--color-border-faint);margin:12px 0">';
      i++;
      continue;
    }
    if (line.startsWith('> ')) {
      html += `<blockquote style="border-left:3px solid var(--color-primary);margin:8px 0;padding:4px 12px;font-size:12px;color:var(--color-text-muted)">${_sbMdInline(line.slice(2))}</blockquote>`;
      i++;
      continue;
    }
    if (line.startsWith('```')) {
      i++;
      let code = '';
      while (i < lines.length && !lines[i].startsWith('```')) {
        code += lines[i] + '\n';
        i++;
      }
      html += `<pre style="background:rgba(0,0,0,.06);border-radius:6px;padding:10px 14px;overflow-x:auto;font-size:11px;margin:8px 0;font-family:monospace"><code>${code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
      i++;
      continue;
    }
    if (line.startsWith('|')) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        rows.push(lines[i]);
        i++;
      }
      if (rows.length === 0) continue;
      const th = rows[0]
        .split('|')
        .slice(1, -1)
        .map(
          (c) =>
            `<th style="background:var(--color-primary);color:#fff;padding:7px 10px;text-align:left;font-size:11px;font-weight:600;white-space:nowrap">${_sbMdInline(c.trim())}</th>`
        )
        .join('');
      let tbody = '';
      for (let r = 2; r < rows.length; r++) {
        const td = rows[r]
          .split('|')
          .slice(1, -1)
          .map(
            (c) =>
              `<td style="padding:6px 10px;font-size:12px;border-top:1px solid var(--color-border-faint);color:var(--color-text-secondary)">${_sbMdInline(c.trim())}</td>`
          )
          .join('');
        tbody += `<tr style="transition:background .1s" onmouseover="this.style.background='rgba(0,67,132,.04)'" onmouseout="this.style.background=''">${td}</tr>`;
      }
      html += `<div style="overflow-x:auto;margin:8px 0;border-radius:8px;border:1px solid var(--color-border-faint)"><table style="border-collapse:collapse;width:100%;min-width:320px"><thead><tr>${th}</tr></thead><tbody>${tbody}</tbody></table></div>`;
      continue;
    }
    if (/^[-*]\s/.test(line)) {
      html += '<ul style="margin:6px 0 6px 20px;padding:0">';
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        html += `<li style="font-size:13px;margin:3px 0;color:var(--color-text-secondary)">${_sbMdInline(lines[i].replace(/^[-*]\s/, ''))}</li>`;
        i++;
      }
      html += '</ul>';
      continue;
    }
    if (/^\d+\.\s/.test(line)) {
      html += '<ol style="margin:6px 0 6px 20px;padding:0">';
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        html += `<li style="font-size:13px;margin:3px 0;color:var(--color-text-secondary)">${_sbMdInline(lines[i].replace(/^\d+\.\s/, ''))}</li>`;
        i++;
      }
      html += '</ol>';
      continue;
    }
    if (line.trim() === '') {
      i++;
      continue;
    }
    html += `<p style="font-size:13px;margin:4px 0;color:var(--color-text-secondary)">${_sbMdInline(line)}</p>`;
    i++;
  }
  return html || '<p style="color:var(--color-text-faint);font-style:italic">Vazio.</p>';
}

async function sbAbrirAndamento() {
  const menu = document.getElementById('sbDdConfigMenu');
  if (menu) menu.classList.remove('show');

  if (document.getElementById('sbAndBackdrop')) {
    document.getElementById('sbAndBackdrop').style.display = 'flex';
    return;
  }

  const root = _sbRootPath();
  const modulos = _SB_AND_MODULOS;

  const tabsHtml = modulos
    .map(
      (m, idx) =>
        `<button class="sb-and-tab${idx === 0 ? ' sb-and-active' : ''}" data-key="${m.key}"
      onclick="window._sbAndTab('${m.key}')">${m.label}</button>`
    )
    .join('');

  const panelsHtml = modulos
    .map(
      (m, idx) =>
        `<div class="sb-and-panel${idx === 0 ? ' sb-and-active' : ''}" id="sbAP_${m.key}">
      <div id="sbAC_${m.key}" style="color:var(--color-text-faint);font-style:italic;font-size:13px">Carregando...</div>
    </div>`
    )
    .join('');

  const bd = document.createElement('div');
  bd.id = 'sbAndBackdrop';
  bd.className = 'crud-backdrop';
  bd.addEventListener('click', (e) => {
    if (e.target === bd) window.sbFecharAndamento();
  });
  bd.innerHTML = `
    <div class="crud-modal" style="max-width:920px">
      <div class="crud-modal-head">
        <h3>📝 Andamento de Alterações</h3>
        <button class="crud-btn-fechar" onclick="window.sbFecharAndamento()">✕</button>
      </div>
      <div style="overflow-x:auto;background:var(--color-surface-2,#f4f6fa);border-bottom:1px solid var(--color-border-faint);flex-shrink:0">
        <div style="display:flex;gap:2px;padding:8px 16px;min-width:max-content">${tabsHtml}</div>
      </div>
      <div style="flex:1;overflow-y:auto;padding:20px 24px">${panelsHtml}</div>
    </div>`;

  if (!document.getElementById('sbAndStyle')) {
    const s = document.createElement('style');
    s.id = 'sbAndStyle';
    s.textContent = `
      .sb-and-tab{background:none;border:none;padding:6px 14px;border-radius:6px;font-size:12px;font-weight:500;cursor:pointer;color:var(--color-text-muted);transition:all .15s;white-space:nowrap;font-family:inherit}
      .sb-and-tab:hover{background:rgba(0,67,132,.08);color:var(--color-primary)}
      .sb-and-tab.sb-and-active{background:var(--color-primary);color:#fff}
      [data-theme="dark"] .sb-and-tab:hover{background:rgba(139,92,246,.15);color:#c4b5fd}
      [data-theme="dark"] .sb-and-tab.sb-and-active{background:#8b5cf6}
      [data-theme="dark"] .sb-and-panel pre{background:rgba(255,255,255,.05)}
      [data-theme="dark"] .sb-and-panel code{background:rgba(255,255,255,.08)!important}
      .sb-and-panel{display:none}
      .sb-and-panel.sb-and-active{display:block}
    `;
    document.head.appendChild(s);
  }
  document.body.appendChild(bd);

  window._sbAndTab = function (key) {
    document
      .querySelectorAll('.sb-and-tab')
      .forEach((t) => t.classList.toggle('sb-and-active', t.dataset.key === key));
    document
      .querySelectorAll('.sb-and-panel')
      .forEach((p) => p.classList.toggle('sb-and-active', p.id === `sbAP_${key}`));
  };
  window.sbFecharAndamento = function () {
    const el = document.getElementById('sbAndBackdrop');
    if (el) el.style.display = 'none';
  };

  const results = await Promise.all(
    modulos.map((m) =>
      fetch(root + m.file)
        .then((r) => (r.ok ? r.text() : null))
        .catch(() => null)
    )
  );
  modulos.forEach((m, idx) => {
    const el = document.getElementById(`sbAC_${m.key}`);
    if (el) el.innerHTML = _sbMdToHtml(results[idx]);
  });
}

// ============================================================
//  INICIALIZAÇÃO AUTOMÁTICA
// ============================================================

// Aplicar tema assim que o script carregar (antes do DOMContentLoaded)
sbAplicarTema();

// Quando o DOM estiver pronto, inicializar componentes de UI
document.addEventListener('DOMContentLoaded', () => {
  sbIniciarBtnTema('btnTema');
  sbInjetarMenuConfiguracoes();
  sbProtegerTelaAtual();
});
