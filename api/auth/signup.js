// POST /api/auth/signup - Create a new account
import { getSupabaseClient } from '../_lib/supabase.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })

  const supabase = getSupabaseClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: 'https://propello-omega.vercel.app/app' }
  })

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  if (data.user && !data.session) {
    // Email confirmation required
    return res.status(200).json({
      message: 'Account created! Check your email for the confirmation link.',
      user: { id: data.user.id, email: data.user.email }
    })
  }

  return res.status(201).json({
    token: data.session.access_token,
    user: { id: data.user.id, email: data.user.email }
  })
}