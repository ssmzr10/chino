import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.trim() !== '' &&
  supabaseAnonKey.trim() !== '' &&
  !supabaseUrl.includes('YOUR_SUPABASE_URL')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

export interface AppStateRow {
  key: string;
  value: any;
  updated_at?: string;
}

/**
 * Fetch all app_state records from Supabase
 */
export async function fetchAllAppState(): Promise<Record<string, any> | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('app_state')
      .select('key, value, updated_at');

    if (error) {
      console.warn('Supabase fetchAllAppState warning:', error.message);
      return null;
    }

    if (!data) return null;

    const result: Record<string, any> = {};
    for (const row of data) {
      result[row.key] = row.value;
    }
    return result;
  } catch (err) {
    console.error('Failed to fetch from Supabase:', err);
    return null;
  }
}

/**
 * Upsert a single key-value pair to app_state
 */
export async function upsertAppState(key: string, value: any): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('app_state').upsert(
      {
        key,
        value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );

    if (error) {
      console.error(`Failed to upsert key "${key}" to Supabase:`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Error upserting key "${key}" to Supabase:`, err);
    return false;
  }
}
