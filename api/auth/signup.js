// POST /api/auth/signup
const { signUp } = require('../_lib/supabase.js')

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })

  try {
    const { status, data } = await signUp(email, password)

    if (status >= 400) {
      return res.status(status).json({ error: data.msg || data.error_description || data.error || 'Signup failed' })
    }

    if (data.user && !data.access_token) {
      return res.status(200).json({
        message: 'Account created! Check your email for the confirmation link.',
        user: { id: data.user.id, email: data.user.email }
      })
    }

    return res.status(201).json({
      token: data.access_token,
      user: { id: data.user.id, email: data.user.email }
    })
  } catch (err) {
    console.error('Signup error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}