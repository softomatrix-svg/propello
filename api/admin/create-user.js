// One-shot Vercel function to create an admin account
// Deploy this temporarily, hit it once, then remove

module.exports = async (req, res) => {
  // Only respond to POST with a secret token
  if (req.method !== 'POST' || req.headers['x-admin-secret'] !== 'propello-create-2024') {
    return res.status(401).json({ error: 'unauthorized' })
  }

  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'missing fields' })

  const SUPABASE_URL = process.env.SUPABASE_URL
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  const ANON_KEY = process.env.SUPABASE_ANON_KEY

  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
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