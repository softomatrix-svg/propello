// POST /api/proposals/save
// Save a new proposal or update an existing one
import { getSupabaseClient } from '../_lib/supabase.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const supabase = getSupabaseClient()
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Missing authorization' })
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' })

  const { id, title, client_name, job_description, framework, ai_generated_proposal, edited_proposal, status } = req.body

  if (id) {
    // Update existing
    const { data, error } = await supabase
      .from('proposals')
      .update({ title, client_name, job_description, framework, ai_generated_proposal, edited_proposal, status })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  } else {
    // Create new
    if (!title || !job_description || !framework) {
      return res.status(400).json({ error: 'Title, job_description, and framework are required' })
    }
    const { data, error } = await supabase
      .from('proposals')
      .insert({
        user_id: user.id,
        title,
        client_name,
        job_description,
        framework,
        ai_generated_proposal,
        edited_proposal,
        status: status || 'draft'
      })
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json(data)
  }
}