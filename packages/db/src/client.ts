import { createClient } from '@supabase/supabase-js'
import type { Database } from './types.js'

function getEnv(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Missing required environment variable: ${key}`)
  return value
}

export function createSupabaseClient() {
  return createClient<Database>(getEnv('SUPABASE_URL'), getEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export function createSupabaseAnonClient(url: string, anonKey: string) {
  return createClient<Database>(url, anonKey)
}

export type SupabaseClient = ReturnType<typeof createSupabaseClient>
