import { createClient } from '@supabase/supabase-js'

// Substitua pelas credenciais do seu projeto Supabase (Project Settings > API)
const SUPABASE_URL = 'https://vdhahqicqlrdvcpesiwk.supabase.co'
const SUPABASE_ANON_KEY = 'SUA_ANON_KEY_AQUI'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
