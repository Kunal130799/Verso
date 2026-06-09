const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

async function request(path, options = {}, token = null) {
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    const e = new Error(err.error || 'Request failed')
    e.status = res.status
    throw e
  }
  return res.json()
}

export const api = {
  get:    (path, token)        => request(path, { method: 'GET' }, token),
  post:   (path, body, token)  => request(path, { method: 'POST',   body: JSON.stringify(body) }, token),
  put:    (path, body, token)  => request(path, { method: 'PUT',    body: JSON.stringify(body) }, token),
  delete: (path, token)        => request(path, { method: 'DELETE' }, token),
  upload: (path, formData, token) => {
    const headers = {}
    if (token) headers['Authorization'] = `Bearer ${token}`
    return fetch(`${BASE}${path}`, { method: 'POST', headers, body: formData })
      .then(async res => {
        if (!res.ok) throw new Error('Upload failed')
        return res.json()
      })
  },
}
