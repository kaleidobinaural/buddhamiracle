import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// ============================================================
// ★ Supabase Client (Standard)
// ============================================================
export const supabase = (supabaseUrl && supabaseUrl.startsWith('http'))
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any; 


// ============================================================
// ★ Supabase Admin Client (Server-side ONLY)
//   Use this for RAG vector search or administrative tasks.
// ============================================================
export const getSupabaseAdmin = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
    console.error('Invalid Supabase URL. Please check .env.local');
    return null as any;
  }
  if (!serviceRoleKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY is missing. Admin client may fail.');
  }
  return createClient(supabaseUrl, serviceRoleKey);
};
