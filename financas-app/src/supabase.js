import { createClient } from '@supabase/supabase-js'

// Substitua pelas credenciais do seu projeto Supabase (Project Settings > API)
const SUPABASE_URL = 'https://jwasbzdbkbryncpvfujc.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3YXNiemRia2JyeW5jcHZmdWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MzA3ODEsImV4cCI6MjA2MjQwNjc4MX0.Bz7aZ6yG6DUTtWQ4WdeNbslWzE4qU81zzblUeHdTduU'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
