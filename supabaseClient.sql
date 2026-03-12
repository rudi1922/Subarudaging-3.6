import { createClient } from '@supabase/supabase-js';

// Pastikan variabel ini sudah diatur di Environment Variables Vercel
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Konfigurasi Supabase tidak ditemukan!");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
