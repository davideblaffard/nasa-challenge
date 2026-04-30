const BASE = import.meta.env.VITE_API_URL || ''

async function apiFetch(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Errore ${res.status}`)
  }
  return res.json()
}

export const fetchFeed = (startDate, endDate) =>
  apiFetch(`/api/feed?start_date=${startDate}&end_date=${endDate}`)

export const fetchNeo = (nasaId) =>
  apiFetch(`/api/neo/${nasaId}`)
