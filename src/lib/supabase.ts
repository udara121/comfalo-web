/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// Safely resolve env variables in both Vite browser client and Node.js server
const env: any = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (typeof process !== 'undefined' ? process.env : {});

const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || 'https://kpjwjkqxyfhkyzfiadqs.supabase.co';
const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_lvjasPYH4wKtOQ7L9bJvNw_lPz7YzlD';

export const supabase = createClient(supabaseUrl, supabaseKey);
