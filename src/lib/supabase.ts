import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://uotzztasrxdxdxunleny.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_raif2dls9os3gJmZ0aqEcg_b0G_kxBb';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

