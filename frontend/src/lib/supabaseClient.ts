import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://baqelrnhnrsdnubasepq.supabase.co';
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhcWVscm5obnJzZG51YmFzZXBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NTg3NjgsImV4cCI6MjEwNzEzNDc2OH0.FoaZMFc1cwkQhkWiEXEGfwYZOHS_Ca7DR28UXsBgJy4';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export default supabase;
