// Supabase HTTP client — no npm dependencies needed, uses direct fetch calls

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

function getAuthHeaders(token) {
  return {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${token}`
  }
}

function getServiceHeaders() {
  return {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
  }
}

async function signUp(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: getAuthHeaders(''),
    body: JSON.stringify({ email, password })
  })
  return { status: res.status, data: await res.json() }
}

async function signIn(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: getAuthHeaders(''),
    body: JSON.stringify({ email, password })
  })
  return { status: res.status, data: await res.json() }
}

async function getUser(token) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: getAuthHeaders(token)
  })
  return { status: res.status, data: await res.json() }
}

async function query(table, options = {}) {
  let url = `${SUPABASE_URL}/rest/v1/${table}?select=*`
  if (options.filter) {
    Object.entries(options.filter).forEach(([key, value]) => {
      url += `&${key}=eq.${encodeURIComponent(value)}`
    })
  }
  if (options.order) {
    url += `&order=${options.order}`
  }
  if (options.single) {
    url += '&limit=1'
  }

  const res = await fetch(url, {
    headers: getAuthHeaders(options.token),
    method: options.method || 'GET',
    body: options.body ? JSON.stringify(options.body) : undefined
  })

  const data = res.status === 204 ? null : await res.json()
  return { status: res.status, data }
}

async function insert(table, body, token) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(token),
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(body)
  })
  return { status: res.status, data: await res.json() }
}

async function update(table, id, body, token) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      ...getAuthHeaders(token),
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(body)
  })
  const data = res.status === 204 ? null : await res.json()
  return { status: res.status, data }
}

async function del(table, id, token) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token)
  })
  return { status: res.status }
}

module.exports = { signUp, signIn, getUser, query, insert, update, del }