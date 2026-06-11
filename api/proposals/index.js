// GET /api/proposals — list or get single proposal
// DELETE /api/proposals?id=xxx — delete a proposal
const { getUser, query, del } = require('../_lib/supabase.js')

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Missing authorization' })
  const { data: user } = await getUser(token)

  const id = req.query.id

  if (req.method === 'DELETE') {
    if (!id) return res.status(400).json({ error: 'Proposal ID required' })
    const r = await del('proposals', id, token)
    if (r.status >= 400) return res.status(500).json({ error: 'Delete failed' })
    return res.status(200).json({ success: true })
  }

  if (req.method === 'GET') {
    if (id) {
      const r = await query('proposals', {
        filter: { id, user_id: user.id },
        single: true,
        token
      })
      if (r.status >= 400 || !r.data?.length) return res.status(404).json({ error: 'Not found' })
      return res.status(200).json(r.data[0])
    } else {
      const r = await query('proposals', {
        filter: { user_id: user.id },
        order: 'created_at.desc',
        token
      })
      if (r.status >= 400) return res.status(500).json({ error: 'Failed to load' })
      return res.status(200).json(r.data || [])
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}