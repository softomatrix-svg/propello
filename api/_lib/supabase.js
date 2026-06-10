// Supabase client for Vercel serverless functions
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// These get set in Vercel environment variables
const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

function getSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey)
}

function getServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  return createClient(supabaseUrl, serviceKey)
}

export { getSupabaseClient, getServiceClient }