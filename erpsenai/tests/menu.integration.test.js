const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const test = require('node:test');
const assert = require('node:assert/strict');

const menuSource = readFileSync(require.resolve('../menu.js'), 'utf8');
const supabaseSource = readFileSync(require.resolve('../SUPABASE.js'), 'utf8');

function configSupabase() {
  const url = supabaseSource.match(/const SUPABASE_URL = '([^']+)'/)?.[1];
  const key = supabaseSource.match(/const SUPABASE_KEY =\s*'([^']+)'/)?.[1];
  assert.ok(url && key, 'Configuração do Supabase não encontrada');
  return { url, key };
}

async function listar(tabela, query) {
  const { url, key } = configSupabase();
  const response = await fetch(`${url}/rest/v1/${tabela}?${query}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });
  if (!response.ok) {
    assert.fail(`${tabela}: ${response.status} ${await response.text()}`);
  }
  return response.json();
}

function renderMenu(telas, role) {
  const sidebar = {
    innerHTML: '',
    querySelectorAll() {
      return [];
    },
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
        if (key === 'erp_role') return role;
        if (key === 'erp_telas') return JSON.stringify(telas);
        return null;
      },
    },
    window: { location: { href: 'http://localhost/dashboard.html' } },
  });

  return [...sidebar.innerHTML.matchAll(/href="([^"]+)"/g)]
    .map((match) => match[1].replace(/^\.\.\//, ''))
    .sort();
}

function resolverCaminhos(telas) {
  const caminhosMenu = [...menuSource.matchAll(/link\('([^']+)'/g)]
    .map((match) => match[1]);
  const esperados = new Set();
  const semLink = [];

  for (const tela of telas) {
    const permissao = String(tela.nome_html || '')
      .replace(/^(\.\.\/)+/, '')
      .replace(/^\//, '');
    if (!permissao) continue;

    if (caminhosMenu.includes(permissao)) {
      esperados.add(permissao);
      continue;
    }

    const equivalentes = caminhosMenu.filter(
      (caminho) => caminho.split('/').pop() === permissao
    );
    if (equivalentes.length === 1) {
      esperados.add(equivalentes[0]);
    } else {
      semLink.push(permissao);
    }
  }

  return { esperados: [...esperados].sort(), semLink: semLink.sort() };
}

test('renderiza exatamente as telas autorizadas de cada perfil real', async (t) => {
  const [perfis, vinculos, telas] = await Promise.all([
    listar('perfil', 'select=id,nome&order=nome.asc'),
    listar('perfil_sistema', 'select=perfil_id,tela_id'),
    listar('tela', 'select=id,nome,nome_html,ativo&order=nome.asc'),
  ]);

  for (const perfil of perfis) {
    await t.test(perfil.nome, () => {
      const telasAtivas = perfil.nome === 'Administrador'
        ? telas.filter((tela) => tela.ativo === 1)
        : telas.filter((tela) =>
          tela.ativo === 1 && vinculos.some(
            (vinculo) => vinculo.perfil_id === perfil.id && vinculo.tela_id === tela.id
          )
        );

      const { esperados, semLink } = resolverCaminhos(telasAtivas);
      assert.deepEqual(semLink, [], `Telas do perfil sem entrada no menu: ${semLink.join(', ')}`);
      assert.deepEqual(renderMenu(telasAtivas, perfil.nome), esperados);
    });
  }
});
