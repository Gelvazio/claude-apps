import './style.css'
import { supabase } from './supabase.js'

const app = document.getElementById('app')

const DEFAULT_CATS = [
  { nome: 'Salário', tipo: 'receita', cor: '#3A6B52' },
  { nome: 'Freelas', tipo: 'receita', cor: '#6B8E6C' },
  { nome: 'Moradia', tipo: 'despesa', cor: '#B14A2E' },
  { nome: 'Alimentação', tipo: 'despesa', cor: '#C77A44' },
  { nome: 'Transporte', tipo: 'despesa', cor: '#A67C1E' },
  { nome: 'Lazer', tipo: 'despesa', cor: '#8A6F9E' },
  { nome: 'Outros', tipo: 'despesa', cor: '#7A7166' },
]

const fmt = (n) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const state = {
  session: null,
  transacoes: [],
  categorias: [],
  refDate: new Date(),
  authMode: 'login', // login | signup | reset
}

function monthBounds(d) {
  const start = new Date(d.getFullYear(), d.getMonth(), 1)
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  const iso = (x) => x.toISOString().slice(0, 10)
  return { start: iso(start), end: iso(end) }
}

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

// ---------- Data ----------
async function loadData() {
  const { start, end } = monthBounds(state.refDate)
  const [{ data: cats }, { data: txs }] = await Promise.all([
    supabase.from('fin.categorias').select('*').order('nome'),
    supabase
      .from('transacoes')
      .select('*, categorias(nome, cor)')
      .gte('data', start)
      .lte('data', end)
      .order('data', { ascending: false }),
  ])
  state.categorias = cats || []
  state.transacoes = txs || []

  if (state.categorias.length === 0) {
    const userId = state.session.user.id
    const rows = DEFAULT_CATS.map((c) => ({ ...c, user_id: userId }))
    const { data: inserted } = await supabase.from('fin.categorias').insert(rows).select()
    state.categorias = inserted || []
  }
}

// ---------- Auth screen ----------
function renderAuth() {
  if (state.authMode === 'reset') {
    return renderReset()
  }

  const isSignup = state.authMode === 'signup'
  app.innerHTML = `
    <div class="auth-screen">
      <div>
        <div class="auth-mark">livro-caixa</div>
        <h1 class="auth-title">Razão</h1>
        <p class="auth-sub">Seu controle financeiro pessoal, linha por linha.</p>
      </div>
      <form class="auth-form" id="auth-form">
        <input type="email" name="email" placeholder="e-mail" required autocomplete="email" />
        <input type="password" name="password" placeholder="senha" required autocomplete="${isSignup ? 'new-password' : 'current-password'}" minlength="6" />
        <p class="auth-error" id="auth-error"></p>
        <button class="btn-primary" type="submit">${isSignup ? 'Criar conta' : 'Entrar'}</button>
      </form>
      <div class="auth-links">
        <button class="auth-toggle" id="auth-toggle">
          ${isSignup ? 'Já tem conta? Entrar' : 'Ainda não tem conta? Criar'}
        </button>
        ${!isSignup ? '<button class="auth-forgot" id="auth-forgot">Esqueceu a senha?</button>' : ''}
      </div>
    </div>
  `

  document.getElementById('auth-toggle').onclick = () => {
    state.authMode = isSignup ? 'login' : 'signup'
    renderAuth()
  }

  if (!isSignup) {
    document.getElementById('auth-forgot').onclick = () => {
      state.authMode = 'reset'
      renderAuth()
    }
  }

  document.getElementById('auth-form').onsubmit = async (e) => {
    e.preventDefault()
    const btn = e.target.querySelector('button')
    const errorEl = document.getElementById('auth-error')
    errorEl.textContent = ''
    btn.disabled = true
    const email = e.target.email.value.trim()
    const password = e.target.password.value

    const { data, error } = isSignup
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })

    btn.disabled = false
    if (error) {
      errorEl.textContent = traduzErro(error.message)
      return
    }
    if (isSignup && !data.session) {
      errorEl.style.color = 'var(--income)'
      errorEl.textContent = 'Conta criada! Verifique seu e-mail para confirmar.'
      return
    }
    state.session = data.session
    await boot()
  }
}

// ---------- Reset password screen ----------
function renderReset() {
  app.innerHTML = `
    <div class="auth-screen">
      <div>
        <div class="auth-mark">livro-caixa</div>
        <h1 class="auth-title">Resetar senha</h1>
        <p class="auth-sub">Enviaremos um link de recuperação para seu e-mail.</p>
      </div>
      <form class="auth-form" id="reset-form">
        <input type="email" name="email" placeholder="e-mail" required autocomplete="email" />
        <p class="auth-error" id="reset-error"></p>
        <button class="btn-primary" type="submit">Enviar link</button>
      </form>
      <button class="auth-toggle" id="reset-back">Voltar ao login</button>
    </div>
  `

  document.getElementById('reset-back').onclick = () => {
    state.authMode = 'login'
    renderAuth()
  }

  document.getElementById('reset-form').onsubmit = async (e) => {
    e.preventDefault()
    const btn = e.target.querySelector('button')
    const errorEl = document.getElementById('reset-error')
    errorEl.textContent = ''
    btn.disabled = true
    const email = e.target.email.value.trim()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}`,
    })

    btn.disabled = false
    if (error) {
      errorEl.textContent = traduzErro(error.message)
      return
    }
    errorEl.style.color = 'var(--income)'
    errorEl.textContent = 'Link enviado! Verifique seu e-mail para resetar a senha.'
    e.target.reset()
  }
}

function traduzErro(msg) {
  if (msg.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.'
  if (msg.includes('already registered')) return 'Este e-mail já está cadastrado.'
  if (msg.includes('Password')) return 'A senha precisa ter no mínimo 6 caracteres.'
  return msg
}

// ---------- Main app ----------
function renderApp() {
  const receitas = state.transacoes.filter((t) => t.tipo === 'receita').reduce((s, t) => s + Number(t.valor), 0)
  const despesas = state.transacoes.filter((t) => t.tipo === 'despesa').reduce((s, t) => s + Number(t.valor), 0)
  const saldo = receitas - despesas

  app.innerHTML = `
    <header class="ledger-header">
      <div class="brand">Razão<span>.</span></div>
      <button class="signout" id="signout">sair</button>
    </header>

    <div class="month-nav">
      <button id="prev-month" aria-label="mês anterior">&larr;</button>
      <span class="month-label">${MESES[state.refDate.getMonth()]} · ${state.refDate.getFullYear()}</span>
      <button id="next-month" aria-label="próximo mês">&rarr;</button>
    </div>

    <div class="balance-hero">
      <div class="balance-eyebrow">Saldo do mês</div>
      <div class="balance-figure ${saldo < 0 ? 'negative' : ''}">${fmt(saldo)}</div>
      <div class="balance-split">
        <div><span class="label">Receitas</span><span class="income-amt">${fmt(receitas)}</span></div>
        <div><span class="label">Despesas</span><span class="expense-amt">${fmt(despesas)}</span></div>
      </div>
    </div>

    <div class="chart-wrap"><canvas id="chart"></canvas></div>

    <div class="add-bar">
      <button class="btn-add-receita" id="add-receita">+ Receita</button>
      <button class="btn-add-despesa" id="add-despesa">+ Despesa</button>
    </div>

    <div class="section-title">Lançamentos</div>
    <div class="ledger-list" id="ledger-list">
      ${renderLedgerRows()}
    </div>
  `

  document.getElementById('signout').onclick = async () => {
    await supabase.auth.signOut()
    state.session = null
    renderAuth()
  }
  document.getElementById('prev-month').onclick = () => changeMonth(-1)
  document.getElementById('next-month').onclick = () => changeMonth(1)
  document.getElementById('add-receita').onclick = () => openModal('receita')
  document.getElementById('add-despesa').onclick = () => openModal('despesa')

  document.querySelectorAll('.del').forEach((btn) => {
    btn.onclick = () => deleteTx(btn.dataset.id)
  })

  drawChart(receitas, despesas)
}

function renderLedgerRows() {
  if (state.transacoes.length === 0) {
    return `<div class="empty-state">Nenhum lançamento neste mês. Toque em "+ Receita" ou "+ Despesa" para começar.</div>`
  }
  return state.transacoes
    .map((t) => {
      const cor = t.categorias?.cor || '#7A7166'
      const d = new Date(t.data + 'T00:00:00')
      const dataFmt = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
      const sinal = t.tipo === 'receita' ? '+' : '−'
      return `
        <div class="ledger-row">
          <span class="date">${dataFmt}</span>
          <span class="cat-dot" style="background:${cor}"></span>
          <span class="desc" title="${escapeHtml(t.descricao)}">${escapeHtml(t.descricao)}</span>
          <span class="leader"></span>
          <span class="amount ${t.tipo}">${sinal} ${fmt(Number(t.valor))}</span>
          <button class="del" data-id="${t.id}" title="excluir">×</button>
        </div>
      `
    })
    .join('')
}

function escapeHtml(str) {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

async function changeMonth(delta) {
  state.refDate = new Date(state.refDate.getFullYear(), state.refDate.getMonth() + delta, 1)
  await loadData()
  renderApp()
}

async function deleteTx(id) {
  await supabase.from('fin.transacoes').delete().eq('id', id)
  await loadData()
  renderApp()
}

// ---------- Modal ----------
function openModal(tipo) {
  const cats = state.categorias.filter((c) => c.tipo === tipo)
  const backdrop = document.createElement('div')
  backdrop.className = 'modal-backdrop'
  backdrop.innerHTML = `
    <div class="modal">
      <h3>${tipo === 'receita' ? 'Nova receita' : 'Nova despesa'}</h3>
      <form id="tx-form">
        <div>
          <label>Descrição</label>
          <input name="descricao" required placeholder="ex: aluguel, mercado..." />
        </div>
        <div>
          <label>Valor (R$)</label>
          <input name="valor" type="number" step="0.01" min="0.01" required placeholder="0,00" />
        </div>
        <div>
          <label>Categoria</label>
          <select name="categoria_id">
            ${cats.map((c) => `<option value="${c.id}">${escapeHtml(c.nome)}</option>`).join('')}
          </select>
        </div>
        <div>
          <label>Data</label>
          <input name="data" type="date" value="${new Date().toISOString().slice(0, 10)}" required />
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-cancel" id="cancel-modal">Cancelar</button>
          <button type="submit" class="btn-save" style="background:${tipo === 'receita' ? 'var(--income)' : 'var(--expense)'}">Salvar</button>
        </div>
      </form>
    </div>
  `
  document.body.appendChild(backdrop)
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) backdrop.remove()
  })
  document.getElementById('cancel-modal').onclick = () => backdrop.remove()

  document.getElementById('tx-form').onsubmit = async (e) => {
    e.preventDefault()
    const f = e.target
    const { error } = await supabase.from('fin.transacoes').insert({
      user_id: state.session.user.id,
      descricao: f.descricao.value.trim(),
      valor: parseFloat(f.valor.value),
      categoria_id: f.categoria_id.value || null,
      tipo,
      data: f.data.value,
    })
    if (!error) {
      backdrop.remove()
      await loadData()
      renderApp()
    }
  }
}

// ---------- Chart: últimos 6 meses ----------
async function drawChart(receitasMesAtual, despesasMesAtual) {
  const canvas = document.getElementById('chart')
  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width * dpr
  canvas.height = 90 * dpr
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)

  // busca últimos 6 meses de uma vez
  const meses = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(state.refDate.getFullYear(), state.refDate.getMonth() - i, 1)
    meses.push(d)
  }
  const start = monthBounds(meses[0]).start
  const end = monthBounds(meses[meses.length - 1]).end
  const { data: txs } = await supabase
    .from('transacoes')
    .select('valor, tipo, data')
    .gte('data', start)
    .lte('data', end)

  const porMes = meses.map((d) => {
    const { start: s, end: e } = monthBounds(d)
    const doMes = (txs || []).filter((t) => t.data >= s && t.data <= e)
    const r = doMes.filter((t) => t.tipo === 'receita').reduce((sum, t) => sum + Number(t.valor), 0)
    const dsp = doMes.filter((t) => t.tipo === 'despesa').reduce((sum, t) => sum + Number(t.valor), 0)
    return { mes: MESES[d.getMonth()], r, dsp }
  })

  const max = Math.max(1, ...porMes.map((m) => Math.max(m.r, m.dsp)))
  const w = rect.width
  const h = 90
  const groupW = w / porMes.length
  const barW = Math.min(16, groupW * 0.22)

  ctx.clearRect(0, 0, w, h)
  ctx.font = '10px IBM Plex Mono'
  ctx.fillStyle = '#4A5850'
  ctx.textAlign = 'center'

  porMes.forEach((m, i) => {
    const cx = groupW * i + groupW / 2
    const rH = (m.r / max) * (h - 22)
    const dH = (m.dsp / max) * (h - 22)
    ctx.fillStyle = '#3A6B52'
    ctx.fillRect(cx - barW - 2, h - 16 - rH, barW, rH)
    ctx.fillStyle = '#B14A2E'
    ctx.fillRect(cx + 2, h - 16 - dH, barW, dH)
    ctx.fillStyle = '#4A5850'
    ctx.fillText(m.mes, cx, h - 3)
  })
}

// ---------- Boot ----------
async function boot() {
  if (!state.session) {
    renderAuth()
    return
  }
  await loadData()
  renderApp()
}

supabase.auth.getSession().then(({ data }) => {
  state.session = data.session
  boot()
})

supabase.auth.onAuthStateChange((_event, session) => {
  state.session = session
})
