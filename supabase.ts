import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const finalUrl = isValidUrl(supabaseUrl) 
  ? supabaseUrl 
  : 'https://placeholder.supabase.co';

const finalKey = (supabaseAnonKey && supabaseAnonKey !== 'your-anon-key') 
  ? supabaseAnonKey 
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZCI6InBsYWNlaG9sZGVyIn0.placeholder';

export const isSupabaseConfigured = isValidUrl(supabaseUrl) && supabaseAnonKey && supabaseAnonKey !== 'your-anon-key';

export const supabase = createClient(finalUrl, finalKey);
