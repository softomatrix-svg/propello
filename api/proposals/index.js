// GET  /api/proposals         → list user's proposals
// GET  /api/proposals/[id]    → get single proposal
// DELETE /api/proposals/[id]  → delete a proposal
import { getSupabaseClient } from '../_lib/supabase.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const supabase = getSupabaseClient()
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Missing authorization' })
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' })

  // Extract ID from query (/api/proposals?id=xxx or /api/proposals/xxx)
  const id = req.query.id || req.url.split('/').pop()

  if (req.method === 'DELETE') {
    if (!id) return res.status(400).json({ error: 'Proposal ID required' })
    const { error } = await supabase
      .from('proposals')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true })
  }

  if (req.method === 'GET') {
    if (id && id !== 'list' && id !== 'proposals') {
      // Single proposal
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()
      if (error) return res.status(404).json({ error: 'Not found' })
      return res.status(200).json(data)
    } else {
      // List all
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json(data)
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}