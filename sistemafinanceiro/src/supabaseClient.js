// ============================================================================
// SUPABASE CLIENT + CRUD
// ============================================================================
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Faltam VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Copie .env.example para .env.local.'
  );
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// ── Auth ──────────────────────────────────────────────────────────────
export async function loginWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUp(email, password, nome) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nome: nome || '' } },
  });
  if (error) throw error;

  const user = data.user;
  if (user) {
    const { error: profileError } = await supabase.from('usuarios').upsert({
      id: user.id,
      email,
      nome: nome || '',
      is_active: 1,
    });
    if (profileError) {
      // Perfil pode ser criado por trigger; não bloqueia o cadastro
      console.warn('Perfil usuarios:', profileError.message);
    }
  }
  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}

// ── Helpers ───────────────────────────────────────────────────────────
async function requireUserId() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');
  return user.id;
}

function defaultLojaId() {
  const saved = localStorage.getItem('fin_loja_padrao');
  return saved ? Number(saved) : null;
}

// ── Lançamentos ───────────────────────────────────────────────────────
export async function getLancamentos() {
  const { data, error } = await supabase
    .from('lancamento')
    .select('*')
    .order('data_vencimento', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createLancamento(lancamento) {
  const usuario_id = await requireUserId();
  let loja_id = lancamento.loja_id ?? defaultLojaId();

  if (!loja_id) {
    const lojas = await getLojas();
    if (!lojas.length) throw new Error('Nenhuma loja configurada no banco de dados.');
    loja_id = lojas[0].id;
  }

  const row = {
    usuario_id,
    loja_id,
    descricao: lancamento.descricao,
    tipo: lancamento.tipo,
    data_vencimento: lancamento.data_vencimento,
    data_pagamento: lancamento.data_pagamento ?? null,
    qtd_parcelas: lancamento.qtd_parcelas ?? 1,
    parcela_atual: lancamento.parcela_atual ?? 1,
    valor: lancamento.valor,
    status: lancamento.status ?? 0,
    id_parcelamento: lancamento.id_parcelamento || null,
    grupo_id: lancamento.grupo_id || null,
  };

  const { data, error } = await supabase.from('lancamento').insert(row).select().single();
  if (error) throw error;
  return data;
}

export async function updateLancamento(id, updates) {
  const payload = { ...updates };
  delete payload.id;
  delete payload.usuario_id;
  delete payload.created_at;

  const { data, error } = await supabase
    .from('lancamento')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  if (!data) throw new Error('Falha ao atualizar lançamento');
  return data;
}

export async function deleteLancamento(id) {
  const { error } = await supabase.from('lancamento').delete().eq('id', id);
  if (error) throw error;
  return true;
}

export async function deleteLancamentos(ids) {
  if (!ids?.length) return true;
  const { error } = await supabase.from('lancamento').delete().in('id', ids);
  if (error) throw error;
  return true;
}

// ── Lojas ─────────────────────────────────────────────────────────────
export async function getLojas() {
  const { data, error } = await supabase
    .from('loja')
    .select('*')
    .eq('loj_ativo', 1)
    .order('loj_nome', { ascending: true });
  if (error) throw error;
  return data || [];
}

export function subscribeLancamentos(callback) {
  return supabase
    .channel('lancamento-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'lancamento' },
      payload => callback(payload)
    )
    .subscribe();
}
