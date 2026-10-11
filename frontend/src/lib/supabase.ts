import { supabase } from './supabaseClient';

export { supabase };
export default supabase;

export const isSupabaseConfigured = (): boolean => {
  return true;
};
