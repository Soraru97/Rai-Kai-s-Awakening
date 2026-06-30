/**
 * Geo service - determines user's country from IP
 * Uses free ipapi.co API (no API key required for <1000 requests/day)
 * Never stores raw IP - only country and hashed fingerprint
 */

const GEO_CACHE_KEY = 'vb_geo'
const GEO_CACHE_TTL = 60 * 60 * 1000 // 1 hour

/**
 * Get user's geolocation data
 * @returns {Promise<{ country: string, region: string, city: string, countryCode: string }>}
 */
export async function getGeoData() {
  // Check cache
  const cached = getCachedGeo()
  if (cached) return cached

  try {
    const response = await fetch('https://ipapi.co/json/', {
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) throw new Error('Geo API error')

    const data = await response.json()

    const geo = {
      country: data.country_name || 'Unknown',
      countryCode: data.country_code || '',
      region: data.region || '',
      city: data.city || '',
    }

    cacheGeo(geo)
    return geo
  } catch {
    // Fallback - don't block voting if geo fails
    return { country: 'Unknown', countryCode: '', region: '', city: '' }
  }
}

function getCachedGeo() {
  try {
    const raw = sessionStorage.getItem(GEO_CACHE_KEY)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > GEO_CACHE_TTL) return null
    return data
  } catch {
    return null
  }
}

function cacheGeo(data) {
  try {
    sessionStorage.setItem(GEO_CACHE_KEY, JSON.stringify({ data, ts: Date.now() }))
  } catch {}
}
