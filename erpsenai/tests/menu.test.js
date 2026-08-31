const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const test = require('node:test');
const assert = require('node:assert/strict');

const menuSource = readFileSync(require.resolve('../menu.js'), 'utf8');

function renderMenu({ telas, rawTelas, role = 'Usuário', page = 'dashboard.html' }) {
  const sidebar = {
    innerHTML: '',
    querySelectorAll() {
      return [];
    },
  };

  const storage = {
    erp_role: role,
    erp_telas: rawTelas ?? JSON.stringify(telas),
  };

  runInNewContext(menuSource, {
    console: { log() {} },
    document: {
      currentScript: { src: 'http://localhost/menu.js' },
      getElementById(id) {
        return id === 'sidebar' ? sidebar : null;
      },
    },
    localStorage: {
      getItem(key) {
        return storage[key] ?? null;
      },
    },
    window: {
      location: { href: `http://localhost/${page}` },
    },
  });

  return sidebar.innerHTML;
}

test('renderiza uma tela permitida cadastrada somente pelo nome do arquivo', () => {
  const html = renderMenu({
    telas: [{ nome_html: 'clientes.html' }],
  });

  assert.match(html, /href="cadastros\/clientes\.html"/);
  assert.doesNotMatch(html, /href="cadastros\/fornecedores\.html"/);
  assert.doesNotMatch(html, />null</);
});

test('mantém a distinção quando a permissão contém o caminho completo', () => {
  const html = renderMenu({
    telas: [{ nome_html: 'rh/dashboard.html' }],
  });

  assert.match(html, /href="rh\/dashboard\.html"/);
  assert.doesNotMatch(html, /href="dashboard\.html"/);
});

test('não libera o dashboard de RH pela permissão do dashboard principal', () => {
  const html = renderMenu({
    telas: [{ nome_html: 'dashboard.html' }],
  });

  assert.match(html, /href="dashboard\.html"/);
  assert.doesNotMatch(html, /href="rh\/dashboard\.html"/);
});

test('falha fechado sem interromper a sidebar quando erp_telas não é um array', () => {
  assert.doesNotThrow(() => {
    const html = renderMenu({ rawTelas: '{}' });
    assert.doesNotMatch(html, /class="sidebar-link/);
    assert.doesNotMatch(html, />null</);
  });
});

test('ignora entradas inválidas sem perder as telas válidas do perfil', () => {
  const html = renderMenu({
    telas: [null, {}, { nome_html: 'clientes.html' }],
  });

  assert.match(html, /href="cadastros\/clientes\.html"/);
});

test('administrador também fica limitado às telas carregadas para o perfil', () => {
  const html = renderMenu({
    role: 'Administrador',
    telas: [{ nome_html: 'clientes.html' }],
  });

  assert.match(html, /href="cadastros\/clientes\.html"/);
  assert.doesNotMatch(html, /href="configuracoes\/usuarios\.html"/);
});

test('perfil não administrador vê configurações quando a tela está permitida', () => {
  const html = renderMenu({
    role: 'Usuário',
    telas: [{ nome_html: 'perfis.html' }],
  });

  assert.match(html, /href="configuracoes\/perfis\.html"/);
});

test('renderiza as telas reais que antes não existiam no menu', () => {
  const html = renderMenu({
    telas: [
      { nome_html: 'pipeline.html' },
      { nome_html: 'gamificacao/equipe.html' },
      { nome_html: 'telas.html' },
      { nome_html: 'regras-negocios.html' },
    ],
  });

  assert.match(html, /href="compras\/pipeline\.html"/);
  assert.match(html, /href="gamificacao\/equipe\.html"/);
  assert.match(html, /href="configuracoes\/telas\.html"/);
  assert.match(html, /href="configuracoes\/regras-negocios\.html"/);
});

test('gera caminho relativo e estado ativo em páginas aninhadas', () => {
  const html = renderMenu({
    page: 'cadastros/clientes.html',
    telas: [{ nome_html: 'clientes.html' }],
  });

  assert.match(html, /class="sidebar-link ativo" href="\.\.\/cadastros\/clientes\.html"/);
});

test('aceita prefixo relativo legado em nome_html', () => {
  const html = renderMenu({
    telas: [{ nome_html: '../cadastros/clientes.html' }],
  });

  assert.match(html, /href="cadastros\/clientes\.html"/);
});
