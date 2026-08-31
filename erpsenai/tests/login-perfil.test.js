const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const test = require('node:test');
const assert = require('node:assert/strict');

const supabaseSource = readFileSync(require.resolve('../SUPABASE.js'), 'utf8');

function resposta(dados, ok = true) {
  return {
    ok,
    async json() {
      return dados;
    },
    async text() {
      return JSON.stringify(dados);
    },
  };
}

function criarContexto({ nomePerfil = 'Financeiro', falharEm = '', perfilId = 7 } = {}) {
  const storage = new Map([['sessao_anterior', 'preservada']]);
  const chamadas = [];

  const dados = {
    erp_usuarios: [{
      id: 99,
      nome: 'Usuário Teste',
      email: 'teste@senai.br',
      perfil_id: perfilId,
      permissoes: {},
    }],
    perfil: [{ id: 7, nome: nomePerfil }],
    perfil_sistema: [{ tela_id: 10 }, { tela_id: 11 }],
    tela: [
      { id: 10, nome: 'Pagar', nome_html: 'contas-pagar.html' },
      { id: 11, nome: 'Receber', nome_html: 'contas-receber.html' },
    ],
    tela_sistema: [{ sistema_id: 7 }, { sistema_id: 7 }],
  };

  async function fetch(url) {
    const tabela = new URL(url).pathname.split('/').pop();
    chamadas.push({ tabela, url });
    if (tabela === falharEm) return resposta({ message: 'falha simulada' }, false);
    return resposta(dados[tabela] || []);
  }

  const localStorage = {
    getItem(key) {
      return storage.has(key) ? storage.get(key) : null;
    },
    setItem(key, value) {
      storage.set(key, String(value));
    },
    removeItem(key) {
      storage.delete(key);
    },
    clear() {
      storage.clear();
    },
  };

  const contexto = {
    AbortController,
    TextEncoder,
    Uint8Array,
    URL,
    clearTimeout,
    console: { error() {}, log() {}, warn() {} },
    crypto: {
      subtle: {
        async digest() {
          return new Uint8Array(32).buffer;
        },
      },
    },
    document: {
      addEventListener() {},
      documentElement: {
        getAttribute() { return 'light'; },
        setAttribute() {},
      },
      getElementById() { return null; },
      querySelector() { return null; },
      querySelectorAll() { return []; },
    },
    fetch,
    localStorage,
    sessionStorage: { removeItem() {} },
    setTimeout,
    window: {
      location: { pathname: '/dashboard.html', replace() {} },
    },
  };

  runInNewContext(supabaseSource, contexto);
  return { chamadas, contexto, storage };
}

test('usa o perfil_id do usuário para carregar e salvar suas telas', async () => {
  const { chamadas, contexto, storage } = criarContexto();

  await contexto.sbLogin('teste@senai.br', 'senha');

  const consultaVinculos = chamadas.find(({ tabela }) => tabela === 'perfil_sistema');
  assert.match(consultaVinculos.url, /perfil_id=eq\.7/);
  assert.deepEqual(JSON.parse(storage.get('erp_telas')), [
    { id: 10, nome: 'Pagar', nome_html: 'contas-pagar.html' },
    { id: 11, nome: 'Receber', nome_html: 'contas-receber.html' },
  ]);
  assert.equal(storage.get('erp_perfil_id'), '7');
});

test('administrador também recebe somente as telas vinculadas ao seu perfil_id', async () => {
  const { chamadas, contexto } = criarContexto({ nomePerfil: 'Administrador' });

  await contexto.sbLogin('teste@senai.br', 'senha');

  assert.equal(chamadas.filter(({ tabela }) => tabela === 'perfil_sistema').length, 1);
  const consultaTelas = chamadas.find(({ tabela }) => tabela === 'tela');
  assert.match(consultaTelas.url, /id=in\.\(10,11\)/);
});

test('não cria sessão quando falha o carregamento das permissões', async () => {
  const { contexto, storage } = criarContexto({ falharEm: 'perfil_sistema' });

  await assert.rejects(
    contexto.sbLogin('teste@senai.br', 'senha'),
    /perfil_sistema/
  );

  assert.equal(storage.has('erp_login'), false);
  assert.equal(storage.has('erp_telas'), false);
  assert.equal(storage.get('sessao_anterior'), 'preservada');
});

test('não cria sessão para usuário sem perfil_id', async () => {
  const { contexto, storage } = criarContexto({ perfilId: null });

  await assert.rejects(
    contexto.sbLogin('teste@senai.br', 'senha'),
    /perfil vinculado/i
  );

  assert.equal(storage.has('erp_login'), false);
  assert.equal(storage.has('erp_telas'), false);
});
