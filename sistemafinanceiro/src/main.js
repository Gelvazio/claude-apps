// ── Supabase imports ──────────────────────────────────────────────────
import {
  getSession,
  getCurrentUser,
  onAuthStateChange,
  logout as supabaseLogout,
  getLancamentos,
  createLancamento,
  updateLancamento,
  deleteLancamento,
  deleteLancamentos,
  getLojas
} from './supabaseClient.js';

// ── Auth guard ────────────────────────────────────────────────────────
const session = await getSession();
if (!session) {
  window.location.replace('/login.html');
}

let _currentUser = await getCurrentUser();
if (!_currentUser) {
  window.location.replace('/login.html');
}

// Observar mudanças de autenticação
onAuthStateChange((event, newSession) => {
  if (!newSession) {
    window.location.replace('/login.html');
  }
});

// ─────────────────────────────────────────────────────────────────────
let allLojas = [];

let allLancamentos = [];
let selectedMonth = getCurrentMonth();
let filtroTipo = 'todos';
let filtroStatus = 'todos';
let _editScope = 'single';

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// ── Data ──────────────────────────────────────────────────────────────
async function loadData() {
  try {
    allLancamentos = await getLancamentos();
    allLojas = await getLojas();
    render();
  } catch (err) {
    console.error('Erro ao carregar dados:', err);
    document.getElementById('table-body').innerHTML =
      `<tr><td colspan="8" class="table-empty" style="color:var(--warn-red)">
        ⚠ Erro ao carregar lançamentos:<br>
        <code style="font-size:12px;color:var(--h3)">${err.message}</code>
      </td></tr>`;
  }
}

async function patchLancamento(id) {
  const today = new Date().toISOString().split('T')[0];
  const updated = await updateLancamento(id, { status: 1, data_pagamento: today });
  if (!updated) throw new Error('Falha ao atualizar');
  return updated;
}

// ── Filters ───────────────────────────────────────────────────────────
function getMonthData() {
  return allLancamentos.filter(l => l.data_vencimento.startsWith(selectedMonth));
}

function getFilteredData() {
  return allLancamentos.filter(l => {
    const okMes    = l.data_vencimento.startsWith(selectedMonth);
    const okTipo   = filtroTipo === 'todos' || l.tipo === filtroTipo;
    const okStatus = filtroStatus === 'todos' || String(l.status) === filtroStatus;
    return okMes && okTipo && okStatus;
  });
}

// ── Format helpers ────────────────────────────────────────────────────
function fmt$(v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

function fmtDate(d) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

function addMonths(dateStr, months) {
  if (!months) return dateStr;
  const [y, m, d] = dateStr.split('-').map(Number);
  const target  = new Date(y, m - 1 + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  const day     = Math.min(d, lastDay);
  return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// ── Installment group helpers ─────────────────────────────────────────
function findInstallmentGroup(lancamento) {
  if (lancamento.id_parcelamento) {
    return allLancamentos.filter(l => l.id_parcelamento === lancamento.id_parcelamento);
  }
  // Fallback for records created before id_parcelamento field
  if (lancamento.grupo_id) {
    return allLancamentos.filter(l => l.grupo_id === lancamento.grupo_id);
  }
  return allLancamentos.filter(l =>
    l.descricao    === lancamento.descricao &&
    l.tipo         === lancamento.tipo &&
    l.qtd_parcelas === lancamento.qtd_parcelas
  );
}

function getRecordsForScope(lancamento, scope) {
  const group = findInstallmentGroup(lancamento);
  if (scope === 'single') return [lancamento];
  if (scope === 'future') return group.filter(l => l.parcela_atual >= lancamento.parcela_atual);
  return group;
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Render ────────────────────────────────────────────────────────────
function renderMonthLabel() {
  const [y, m] = selectedMonth.split('-');
  const label = new Date(+y, +m - 1, 1)
    .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  document.getElementById('month-label').textContent =
    label.charAt(0).toUpperCase() + label.slice(1);
}

function renderCards() {
  const data = getMonthData();

  const recList = data.filter(l => l.tipo === 'receber' && l.status !== 3);
  const pagList = data.filter(l => l.tipo === 'pagar'   && l.status !== 3);

  const totalRec = recList.reduce((s, l) => s + l.valor, 0);
  const totalPag = pagList.reduce((s, l) => s + l.valor, 0);
  const saldo    = totalRec - totalPag;

  document.getElementById('card-receber').textContent = fmt$(totalRec);
  document.getElementById('card-pagar').textContent   = fmt$(totalPag);

  const saldoEl = document.getElementById('card-saldo');
  saldoEl.textContent = fmt$(saldo);
  saldoEl.className = 'summary-card-value ' + (saldo >= 0 ? 'positive' : 'negative');

  // Saldo Pendente: soma de todos os lançamentos em Aberto do mês
  const abertos       = data.filter(l => l.status === 0);
  const totalPendente = abertos.reduce((s, l) => s + l.valor, 0);
  document.getElementById('card-pendente').textContent = fmt$(totalPendente);
  document.getElementById('card-pendente-sub').textContent =
    `${abertos.length} lançamento${abertos.length !== 1 ? 's' : ''} em aberto`;

  const recebidos = recList.filter(l => l.status === 1).length;
  const pagos     = pagList.filter(l => l.status === 1).length;

  document.getElementById('card-receber-sub').textContent =
    `${recebidos} de ${recList.length} recebido${recList.length !== 1 ? 's' : ''}`;
  document.getElementById('card-pagar-sub').textContent =
    `${pagos} de ${pagList.length} pago${pagList.length !== 1 ? 's' : ''}`;
  document.getElementById('card-saldo-sub').textContent =
    saldo >= 0 ? 'Saldo positivo ✓' : 'Saldo negativo ✗';
}

const STATUS_LABEL = { 0: 'Aberto', 1: 'Pago', 3: 'Cancelado' };

function renderTable() {
  const data = getFilteredData();
  const tbody = document.getElementById('table-body');

  if (data.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="8" class="table-empty">Nenhum lançamento encontrado.</td></tr>';
    return;
  }

  tbody.innerHTML = data.map(l => {
    const isAberto   = l.status === 0;
    const btnLabel   = l.tipo === 'pagar' ? 'Pagar' : 'Receber';
    const btnCls     = l.tipo === 'pagar' ? 'btn-pagar' : 'btn-receber';
    const disabled   = isAberto ? '' : 'disabled';
    const disabledEditCancel = (l.status === 1 || l.status === 3) ? 'disabled' : '';

    return `
      <tr class="row-s${l.status}">
        <td class="col-desc"><strong>#${l.id}</strong> ${esc(l.descricao)}</td>
        <td><span class="tbadge tbadge-${l.tipo}">${l.tipo === 'pagar' ? 'Pagar' : 'Receber'}</span></td>
        <td class="col-date">${fmtDate(l.data_vencimento)}</td>
        <td class="col-date">${fmtDate(l.data_pagamento)}</td>
        <td class="col-parc">${l.parcela_atual}/${l.qtd_parcelas}</td>
        <td class="col-valor">${fmt$(l.valor)}</td>
        <td><span class="sbadge sbadge-${l.status}">${STATUS_LABEL[l.status] ?? '—'}</span></td>
        <td>
          <div class="action-cell">
            <button class="btn-action ${btnCls}"
              data-id="${l.id}"
              data-action="${l.tipo}"
              ${disabled}>
              ${btnLabel}
            </button>
            <button class="btn-action btn-cancelar"
              data-id="${l.id}"
              data-action="cancelar"
              ${disabledEditCancel}>
              Cancelar
            </button>
            <button class="btn-action btn-editar"
              data-id="${l.id}"
              data-action="editar"
              ${disabledEditCancel}>
              Editar
            </button>
            <button class="btn-action btn-excluir"
              data-id="${l.id}"
              data-action="excluir">
              Excluir
            </button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

function render() {
  renderMonthLabel();
  renderCards();
  renderTable();
}

// ── Toast ─────────────────────────────────────────────────────────────
function showToast(msg, isError = false) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.style.display = 'block';
  el.style.borderColor = isError
    ? 'rgba(255,91,110,0.5)'
    : 'rgba(52,224,215,0.38)';
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.style.display = 'none'; }, 3000);
}

// ── Event: table action (delegated) ──────────────────────────────────
document.getElementById('table-body').addEventListener('click', async e => {
  const btn = e.target.closest('[data-action]');
  if (!btn || btn.disabled) return;

  const id     = Number(btn.dataset.id);
  const action = btn.dataset.action;

  if (action === 'pagar' || action === 'receber') {
    const ok = await confirmModal(action === 'pagar'
      ? { icon: '💰', title: 'Confirmar Pagamento',   msg: 'Deseja registrar o pagamento deste lançamento?',   color: 'var(--warn-green)' }
      : { icon: '📥', title: 'Confirmar Recebimento', msg: 'Deseja registrar o recebimento deste lançamento?', color: 'var(--h2)' });
    if (!ok) return;
    btn.disabled = true;
    btn.textContent = '...';
    try {
      const updated = await patchLancamento(id);
      const idx = allLancamentos.findIndex(l => l.id === id);
      if (idx !== -1) allLancamentos[idx] = updated;
      render();
      showToast(action === 'pagar' ? '✓ Pagamento registrado!' : '✓ Recebimento registrado!');
    } catch {
      showToast('Erro ao atualizar o registro.', true);
      render();
    }
  } else if (action === 'cancelar') {
    await handleCancelar(id);
  } else if (action === 'editar') {
    openModalEdit(id);
  } else if (action === 'excluir') {
    await handleExcluir(id);
  }
});

// ── Cancelar ──────────────────────────────────────────────────────────
async function handleCancelar(id) {
  const ok = await confirmModal({
    icon: '⚠️', title: 'Cancelar Lançamento',
    msg: 'Deseja cancelar este lançamento?',
    color: 'var(--h3)'
  });
  if (!ok) return;
  try {
    const updated = await updateLancamento(id, { status: 3 });
    const idx = allLancamentos.findIndex(l => l.id === id);
    if (idx !== -1) allLancamentos[idx] = updated;
    render();
    showToast('✓ Lançamento cancelado.');
  } catch {
    showToast('Erro ao cancelar o lançamento.', true);
  }
}

// ── Modal de confirmação genérico (Promise-based) ────────────────────
function confirmModal({ icon = '❓', title = 'Confirmar', msg = 'Tem certeza?', color = 'var(--h2)' } = {}) {
  document.getElementById('modal-confirm-icon').textContent  = icon;
  document.getElementById('modal-confirm-title').textContent = title;
  document.getElementById('modal-confirm-title').style.color = color;
  document.getElementById('modal-confirm-msg').innerHTML     = msg;

  return new Promise(resolve => {
    const modal = document.getElementById('modal-confirm');
    modal.style.display = 'flex';

    const ok  = document.getElementById('btn-confirm-ok');
    const nok = document.getElementById('btn-confirm-cancel');

    function close(result) {
      modal.style.display = 'none';
      ok.removeEventListener('click', onOk);
      nok.removeEventListener('click', onNok);
      modal.removeEventListener('click', onBackdrop);
      resolve(result);
    }
    const onOk       = () => close(true);
    const onNok      = () => close(false);
    const onBackdrop = e => { if (e.target === modal) close(false); };

    ok.addEventListener('click', onOk);
    nok.addEventListener('click', onNok);
    modal.addEventListener('click', onBackdrop);
  });
}

// ── Modal de escopo (Promise-based) ──────────────────────────────────
function scopeModal({ icon = '❓', title = '', msg = '' } = {}) {
  document.getElementById('modal-scope-icon').textContent  = icon;
  document.getElementById('modal-scope-title').textContent = title;
  document.getElementById('modal-scope-msg').innerHTML     = msg;

  return new Promise(resolve => {
    const modal     = document.getElementById('modal-scope');
    modal.style.display = 'flex';

    const btnSingle = document.getElementById('btn-scope-single');
    const btnFuture = document.getElementById('btn-scope-future');
    const btnAll    = document.getElementById('btn-scope-all');
    const btnCancel = document.getElementById('btn-scope-cancel');

    function close(result) {
      modal.style.display = 'none';
      btnSingle.removeEventListener('click', onSingle);
      btnFuture.removeEventListener('click', onFuture);
      btnAll.removeEventListener('click', onAll);
      btnCancel.removeEventListener('click', onCancel);
      modal.removeEventListener('click', onBackdrop);
      resolve(result);
    }
    const onSingle   = () => close('single');
    const onFuture   = () => close('future');
    const onAll      = () => close('all');
    const onCancel   = () => close(null);
    const onBackdrop = e => { if (e.target === modal) close(null); };

    btnSingle.addEventListener('click', onSingle);
    btnFuture.addEventListener('click', onFuture);
    btnAll.addEventListener('click', onAll);
    btnCancel.addEventListener('click', onCancel);
    modal.addEventListener('click', onBackdrop);
  });
}

// ── Excluir ───────────────────────────────────────────────────────────
async function handleExcluir(id) {
  const lancamento = allLancamentos.find(l => l.id === id);
  if (!lancamento) return;

  let scope = 'single';

  if (lancamento.qtd_parcelas > 1) {
    scope = await scopeModal({
      icon: '🗑️',
      title: 'Excluir Lançamento',
      msg: `<b>#${lancamento.id} ${esc(lancamento.descricao)}</b><br>Parcela ${lancamento.parcela_atual}/${lancamento.qtd_parcelas} — Qual o escopo da exclusão?`
    });
    if (scope === null) return;
  } else {
    const confirmed = await confirmModal({
      icon: '🗑️', title: 'Excluir Lançamento',
      msg: 'Tem certeza que deseja excluir este lançamento?<br><span style="font-size:12px;color:var(--txt-soft)">Esta ação não pode ser desfeita.</span>',
      color: 'var(--warn-red)'
    });
    if (!confirmed) return;
  }

  const records = getRecordsForScope(lancamento, scope);
  const ids = records.map(l => l.id);

  try {
    await deleteLancamentos(ids);
    allLancamentos = allLancamentos.filter(l => !ids.includes(l.id));
    render();
    showToast(ids.length > 1 ? `✓ ${ids.length} lançamentos excluídos.` : '✓ Lançamento excluído.');
  } catch {
    showToast('Erro ao excluir.', true);
  }
}

// ── Modal helpers ─────────────────────────────────────────────────────
function fillForm(fields) {
  document.getElementById('f-id').value                  = fields.id ?? '';
  document.getElementById('f-id-parcelamento').value     = fields.id_parcelamento ?? '';
  document.getElementById('f-tipo').value                = fields.tipo ?? 'pagar';
  document.getElementById('f-descricao').value           = fields.descricao ?? '';
  document.getElementById('f-vencimento').value          = fields.data_vencimento ?? '';
  document.getElementById('f-pagamento').value           = fields.data_pagamento ?? '';
  document.getElementById('f-qtd-parcelas').value        = fields.qtd_parcelas ?? 1;
  document.getElementById('f-parcela-atual').value       = fields.parcela_atual ?? 1;
  document.getElementById('f-valor').value               = fields.valor ?? '';
  document.getElementById('f-status').value              = String(fields.status ?? 0);
  document.getElementById('form-err').textContent        = '';
  document.getElementById('btn-gravar').disabled         = false;
  document.getElementById('btn-gravar').textContent      = 'Gravar';

  // Mostrar/ocultar campo de ID
  const idField = document.getElementById('id-field');
  if (fields.id) {
    document.getElementById('f-id-display').value = fields.id;
    idField.style.display = 'block';
  } else {
    idField.style.display = 'none';
  }
}

async function openModalInsert(tipo) {
  // Verificar se há lojas disponíveis
  if (allLojas.length === 0) {
    showToast(
      '⚠️ Nenhuma loja configurada. Execute o SQL no Supabase Dashboard.',
      true
    );
    return;
  }

  document.getElementById('modal-form-title').textContent =
    tipo === 'pagar' ? '➕ Nova Conta a Pagar' : '➕ Nova Conta a Receber';
  fillForm({ tipo });
  document.getElementById('modal-form').style.display = 'flex';
  document.getElementById('f-descricao').focus();
}

async function openModalEdit(id) {
  const l = allLancamentos.find(l => l.id === id);
  if (!l) return;

  if (l.qtd_parcelas > 1) {
    _editScope = await scopeModal({
      icon: '✏️',
      title: 'Editar Lançamento',
      msg: `<b>#${l.id} ${esc(l.descricao)}</b><br>Parcela ${l.parcela_atual}/${l.qtd_parcelas} — Qual o escopo da edição?`
    });
    if (_editScope === null) return;
  } else {
    _editScope = 'single';
  }

  document.getElementById('modal-form-title').textContent = '✏️ Editar Lançamento';
  fillForm(l);
  document.getElementById('modal-form').style.display = 'flex';
  document.getElementById('f-descricao').focus();
}

function closeModal() {
  document.getElementById('modal-form').style.display = 'none';
}

// ── Modal events ──────────────────────────────────────────────────────
document.getElementById('btn-modal-fechar').addEventListener('click', closeModal);
document.getElementById('modal-form').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-form')) closeModal();
});

document.getElementById('form-lanc').addEventListener('submit', async e => {
  e.preventDefault();
  const errEl    = document.getElementById('form-err');
  const submitBtn = document.getElementById('btn-gravar');
  errEl.textContent = '';

  const id                = document.getElementById('f-id').value;
  const idParcelamento    = document.getElementById('f-id-parcelamento').value;
  const tipo              = document.getElementById('f-tipo').value;
  const descricao         = document.getElementById('f-descricao').value.trim();
  const vencimento        = document.getElementById('f-vencimento').value;
  const pagamento         = document.getElementById('f-pagamento').value || null;
  const qtdParcelas       = parseInt(document.getElementById('f-qtd-parcelas').value) || 1;
  const parcelaAtual      = parseInt(document.getElementById('f-parcela-atual').value) || 1;
  const valor             = parseFloat(document.getElementById('f-valor').value);
  const status            = parseInt(document.getElementById('f-status').value);

  if (!descricao)             { errEl.textContent = 'Informe a descrição.'; return; }
  if (!vencimento)            { errEl.textContent = 'Informe a data de vencimento.'; return; }
  if (isNaN(valor) || valor < 0) { errEl.textContent = 'Informe um valor válido.'; return; }
  if (parcelaAtual > qtdParcelas) { errEl.textContent = 'Parcela atual não pode ser maior que total de parcelas.'; return; }
  if (parcelaAtual < 1) { errEl.textContent = 'Parcela atual deve ser no mínimo 1.'; return; }

  const payload = { descricao, tipo, data_vencimento: vencimento, data_pagamento: pagamento,
                    qtd_parcelas: qtdParcelas, parcela_atual: parcelaAtual, valor, status,
                    id_parcelamento: idParcelamento };

  submitBtn.disabled = true;
  submitBtn.textContent = 'Gravando...';

  try {
    if (id) {
      const lancamento = allLancamentos.find(l => l.id === Number(id));
      if (_editScope !== 'single' && lancamento) {
        const records = getRecordsForScope(lancamento, _editScope);
        const bulkPayload = { descricao, tipo, valor, qtd_parcelas: qtdParcelas };
        const results = await Promise.all(
          records.map(r => updateLancamento(r.id, bulkPayload))
        );
        results.forEach(updated => {
          const idx = allLancamentos.findIndex(l => l.id === updated.id);
          if (idx !== -1) allLancamentos[idx] = updated;
        });
        showToast(`✓ ${results.length} lançamento${results.length > 1 ? 's atualizados' : ' atualizado'}!`);
      } else {
        const updated = await updateLancamento(Number(id), payload);
        const idx = allLancamentos.findIndex(l => l.id === Number(id));
        if (idx !== -1) allLancamentos[idx] = updated;
        showToast('✓ Lançamento atualizado!');
      }
    } else {
      if (qtdParcelas > 1) {
        const grupoId = `g${Date.now()}`;
        const idParcel = `p${Date.now()}`;
        const records = [];
        for (let i = parcelaAtual; i <= qtdParcelas; i++) {
          const offset = i - parcelaAtual;
          records.push({
            ...payload,
            grupo_id: grupoId,
            id_parcelamento: idParcel,
            parcela_atual: i,
            data_vencimento: addMonths(vencimento, offset),
            data_pagamento: offset === 0 ? pagamento : null,
            status: offset === 0 ? status : 0,
          });
        }
        const results = await Promise.all(
          records.map(r => createLancamento(r))
        );
        allLancamentos.push(...results);
        showToast(`✓ ${results.length} parcela${results.length > 1 ? 's geradas' : ' gerada'}!`);
      } else {
        const created = await createLancamento(payload);
        allLancamentos.push(created);
        showToast('✓ Lançamento inserido!');
      }
    }
    closeModal();
    render();
  } catch (err) {
    let mensagemErro = 'Erro ao gravar. Tente novamente.';

    if (err.message.includes('Nenhuma loja')) {
      mensagemErro = '⚠️ Nenhuma loja configurada no banco de dados.';
    } else if (err.message.includes('Falha ao')) {
      mensagemErro = 'Erro ao atualizar. Verifique os dados.';
    } else if (err.message.includes('violates')) {
      mensagemErro = 'Dados inválidos ou duplicados. Verifique.';
    }

    errEl.textContent = mensagemErro;
    submitBtn.disabled = false;
    submitBtn.textContent = 'Gravar';
  }
});

// ── Insert buttons ────────────────────────────────────────────────────
document.getElementById('btn-ins-pagar').addEventListener('click', () => openModalInsert('pagar'));
document.getElementById('btn-ins-receber').addEventListener('click', () => openModalInsert('receber'));

// ── Event: month picker ───────────────────────────────────────────────
document.getElementById('month-picker').addEventListener('change', e => {
  selectedMonth = e.target.value;
  render();
});

function shiftMonth(delta) {
  const [y, m] = selectedMonth.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  selectedMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  document.getElementById('month-picker').value = selectedMonth;
  render();
}

document.getElementById('btn-prev').addEventListener('click', () => shiftMonth(-1));
document.getElementById('btn-next').addEventListener('click', () => shiftMonth(+1));

// ── Event: tipo filters ───────────────────────────────────────────────
document.querySelectorAll('[data-ftipo]').forEach(btn => {
  btn.addEventListener('click', () => {
    filtroTipo = btn.dataset.ftipo;
    document.querySelectorAll('[data-ftipo]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTable();
  });
});

// ── Event: status filters ─────────────────────────────────────────────
document.querySelectorAll('[data-fstatus]').forEach(btn => {
  btn.addEventListener('click', () => {
    filtroStatus = btn.dataset.fstatus;
    document.querySelectorAll('[data-fstatus]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTable();
  });
});

// ── Logout ────────────────────────────────────────────────────────────
document.getElementById('btn-logout').addEventListener('click', async () => {
  try {
    await supabaseLogout();
    window.location.replace('/login.html');
  } catch (err) {
    console.error('Erro ao fazer logout:', err);
    window.location.replace('/login.html');
  }
});

// ── Config Modal ─────────────────────────────────────────────────────
async function openConfigModal() {
  const cfgEmail = document.getElementById('cfg-email');
  const cfgNome = document.getElementById('cfg-nome');
  const cfgLoja = document.getElementById('cfg-loja');
  const cfgDataSessao = document.getElementById('cfg-data-sessao');

  // Preencher com dados do usuário
  if (_currentUser) {
    cfgEmail.value = _currentUser.email || '—';
    cfgNome.value = _currentUser.user_metadata?.nome || '—';
  }

  // Recarregar lojas se vazio
  if (allLojas.length === 0) {
    try {
      allLojas = await getLojas();
    } catch (err) {
      console.error('Erro ao carregar lojas:', err);
    }
  }

  // Carregar lojas no select
  cfgLoja.innerHTML = '';
  if (allLojas.length === 0) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = '⚠️ Nenhuma loja configurada';
    cfgLoja.appendChild(option);
    cfgLoja.disabled = true;
  } else {
    cfgLoja.disabled = false;
    // Obter loja padrão salva (ou primeira)
    const lojapadraoPref = localStorage.getItem('fin_loja_padrao');

    allLojas.forEach(loja => {
      const option = document.createElement('option');
      option.value = loja.id;
      option.textContent = `${loja.loj_nome} ${loja.loj_cidade ? '(' + loja.loj_cidade + ')' : ''}`;
      cfgLoja.appendChild(option);
    });

    // Selecionar loja padrão
    if (lojapadraoPref && allLojas.some(l => l.id == lojapadraoPref)) {
      cfgLoja.value = lojapadraoPref;
    } else {
      cfgLoja.value = allLojas[0]?.id || '';
    }
  }

  // Data da sessão
  cfgDataSessao.value = new Date().toLocaleString('pt-BR');

  document.getElementById('modal-config').style.display = 'flex';
}

function saveConfigModal() {
  const cfgLoja = document.getElementById('cfg-loja');

  if (cfgLoja.value) {
    localStorage.setItem('fin_loja_padrao', cfgLoja.value);
    showToast('✓ Loja padrão salva com sucesso!');
  }

  closeConfigModal();
}

function closeConfigModal() {
  document.getElementById('modal-config').style.display = 'none';
}

document.getElementById('btn-config').addEventListener('click', openConfigModal);
document.getElementById('btn-salvar-config').addEventListener('click', saveConfigModal);
document.getElementById('btn-fechar-config').addEventListener('click', closeConfigModal);
document.getElementById('modal-config').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-config')) closeConfigModal();
});

// ── Init ──────────────────────────────────────────────────────────────
document.getElementById('month-picker').value = selectedMonth;
// Mostra e-mail do usuário no navbar
if (_currentUser) {
  const navUser = document.getElementById('nav-user');
  if (navUser) navUser.textContent = _currentUser.email;
}
loadData();
