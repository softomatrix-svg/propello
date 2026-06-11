// POST /api/admin/create-user — v2 with correct auth headers
module.exports = async (req, res) => {
  if (req.method !== 'POST' || req.headers['x-admin-secret'] !== 'propello-create-2024') {
    return res.status(401).json({ error: 'unauthorized' })
  }

  const { email, password } = req.body
  const SVC_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  const SUPABASE_URL = process.env.SUPABASE_URL

  try {
    // For sb_secret_ format keys, use apikey header, skip Bearer
    const r = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'apikey': SVC_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, email_confirm: true })
    })

    const data = await r.json()
    if (!r.ok) return res.status(r.status).json(data)
    return res.status(200).json({ success: true, id: data.id, email: data.email })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}