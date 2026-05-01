const BASE = import.meta.env.VITE_API_URL || ''

async function apiFetch(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) {
    if (res.status === 429) throw new Error('NASA API rate limit raggiunto (500 req/h). Riprova tra qualche minuto.')
    if (res.status === 503) throw new Error('NASA API non disponibile. Riprova più tardi.')
    if (res.status === 500) throw new Error('Errore interno del server. Controlla i log Railway.')
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Errore server (${res.status})`)
  }
  const data = await res.json()
  const partial = res.headers.get('X-Partial-Results') === 'true'
  return { data, partial }
}

export async function fetchFeed(startDate, endDate) {
  const { data, partial } = await apiFetch(`/api/feed?start_date=${startDate}&end_date=${endDate}`)
  return { asteroids: data, partial }
}

export async function fetchNeo(nasaId) {
  const { data } = await apiFetch(`/api/neo/${nasaId}`)
  return data
}
