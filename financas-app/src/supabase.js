import { createClient } from '@supabase/supabase-js'

// Substitua pelas credenciais do seu projeto Supabase (Project Settings > API)
const SUPABASE_URL = 'https://vdhahqicqlrdvcpesikwk.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkaGFocWljcWxyZHZjcGVzaXdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MTI3OTYsImV4cCI6MjEwMjI4ODc5Nn0.7ACHuUUv6VMyy4-BbQcdAcmabMtqhiuVgrTGUUcV7RY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
