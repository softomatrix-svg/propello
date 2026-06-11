// POST /api/proposals/save — save or update a proposal
const { getUser, insert, update } = require('../_lib/supabase.js')

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Missing authorization' })
  const { data: user } = await getUser(token)

  const { id, title, client_name, job_description, framework, ai_generated_proposal, edited_proposal, status } = req.body

  if (id) {
    const r = await update('proposals', id, {
      title, client_name, job_description, framework, ai_generated_proposal, edited_proposal, status
    }, token)
    if (r.status >= 400) return res.status(500).json({ error: 'Save failed' })
    return res.status(200).json(r.data?.[0] || { id })
  } else {
    if (!title || !job_description || !framework) {
      return res.status(400).json({ error: 'Title, job_description, and framework are required' })
    }
    const r = await insert('proposals', {
      user_id: user.id, title, client_name, job_description, framework,
      ai_generated_proposal, edited_proposal, status: status || 'draft'
    }, token)
    if (r.status >= 400) return res.status(500).json({ error: 'Save failed' })
    return res.status(201).json(r.data[0])
  }
}