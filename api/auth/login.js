// POST /api/auth/login
const { signIn } = require('../_lib/supabase.js')

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

  try {
    const { status, data } = await signIn(email, password)
    if (status >= 400) {
      return res.status(status).json({ error: data.msg || data.error_description || data.error || 'Invalid credentials' })
    }
    return res.status(200).json({
      token: data.access_token,
      user: { id: data.user.id, email: data.user.email }
    })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}