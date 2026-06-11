// GET /api/auth/me
const { getUser } = require('../_lib/supabase.js')

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Not authenticated' })

  const { status, data } = await getUser(token)
  if (status >= 400) return res.status(401).json({ error: 'Invalid token' })

  return res.status(200).json({
    id: data.id,
    email: data.email,
    created_at: data.created_at
  })
}