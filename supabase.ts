import { createClient } from '@supabase/supabase-js';

// These environment variables should be set in your .env file
// VITE_SUPABASE_URL=your-project-url
// VITE_SUPABASE_ANON_KEY=your-anon-key

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Supabase integration will not work.');
}

// Validate URL format
const isValidUrl = (url: string | undefined): url is string => {
  if (!url || typeof url !== 'string') return false;
  if (url === 'your-project-url') return false; // Check for default placeholder
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

const finalUrl = isValidUrl(supabaseUrl) 
  ? supabaseUrl 
  : 'https://placeholder.supabase.co';

const finalKey = (supabaseAnonKey && supabaseAnonKey !== 'your-anon-key') 
  ? supabaseAnonKey 
  : 'placeholder-key';

export const isSupabaseConfigured = isValidUrl(supabaseUrl) && supabaseAnonKey && supabaseAnonKey !== 'your-anon-key';

// Use placeholders if missing or invalid to prevent crash on startup.
// The app logic guards against usage if VITE_SUPABASE_URL is not set or invalid.
export const supabase = createClient(finalUrl, finalKey);
