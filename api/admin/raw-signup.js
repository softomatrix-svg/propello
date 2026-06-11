// POST /api/admin/raw-signup — test Supabase auth directly (debug)
module.exports = async (req, res) => {
  if (req.headers['x-admin-secret'] !== 'propello-check') {
    return res.status(401).json({ error: 'unauthorized' })
  }
  
  const ANON_KEY = process.env.SUPABASE_ANON_KEY
  const SVC_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  const URL = process.env.SUPABASE_URL
  
  // Test with anon key
  const r1 = await fetch(`${URL}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'apikey': ANON_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: 'debug@propello.io', password: 'debug123456' })
  })
  const d1 = await r1.json()
  
  res.status(200).json({
    anon_key_len: ANON_KEY.length,
    anon_key_first10: ANON_KEY.slice(0, 10),
    anon_key_last10: ANON_KEY.slice(-10),
    svc_key_len: SVC_KEY.length,
    svc_key_first10: SVC_KEY.slice(0, 10),
    svc_key_last10: SVC_KEY.slice(-10),
    signup_status: r1.status,
    signup_response: d1
  })
}