// GET /api/admin/check-keys — verify env vars are correct (one-shot debug)
module.exports = async (req, res) => {
  if (req.headers['x-admin-secret'] !== 'propello-check') {
    return res.status(401).json({ error: 'unauthorized' })
  }
  
  const url = process.env.SUPABASE_URL || 'MISSING'
  const anon = process.env.SUPABASE_ANON_KEY || 'MISSING'
  const svc = process.env.SUPABASE_SERVICE_ROLE_KEY || 'MISSING'
  
  res.status(200).json({
    supabase_url: url.slice(0, 30) + '...',
    anon_key_len: anon.length,
    anon_key_prefix: anon.slice(0, 15) + '...',
    svc_key_len: svc.length,
    svc_key_prefix: svc.slice(0, 20) + '...',
    openrouter: (process.env.OPENROUTER_API_KEY || 'MISSING').slice(0, 15) + '...'
  })
}