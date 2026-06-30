/**
 * Browser identity utilities
 * Implements multi-layer voter fingerprinting without registration
 */

const STORAGE_KEY = 'vb_browser_id'
const COOKIE_KEY = 'vb_vid'
const VOTED_KEY = 'vb_voted_polls'

/**
 * Generate a cryptographically random browser ID
 */
function generateId() {
  const array = new Uint8Array(24)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Hash a string using SHA-256
 * @param {string} str
 * @returns {Promise<string>}
 */
export async function hashString(str) {
  const msgBuffer = new TextEncoder().encode(str)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Get or create a stable browser ID stored in localStorage + cookie
 * @returns {string}
 */
export function getBrowserId() {
  // Try localStorage first
  let id = localStorage.getItem(STORAGE_KEY)

  // If not in localStorage, check cookie
  if (!id) {
    id = getCookie(COOKIE_KEY)
  }

  // If still not found, generate new
  if (!id) {
    id = generateId()
  }

  // Persist everywhere
  localStorage.setItem(STORAGE_KEY, id)
  setCookie(COOKIE_KEY, id, 365)

  return id
}

/**
 * Create a composite fingerprint hash for this browser session
 * @returns {Promise<string>}
 */
export async function getBrowserFingerprint() {
  const browserId = getBrowserId()

  const components = [
    browserId,
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.hardwareConcurrency,
  ].join('|')

  return await hashString(components)
}

/**
 * Mark a poll as voted in localStorage
 * @param {string} pollId
 */
export function markPollAsVoted(pollId) {
  const voted = getVotedPolls()
  voted[pollId] = {
    timestamp: Date.now(),
    browserId: getBrowserId(),
  }
  localStorage.setItem(VOTED_KEY, JSON.stringify(voted))
}

/**
 * Check if a poll was already voted by this browser
 * @param {string} pollId
 * @returns {boolean}
 */
export function hasPollBeenVoted(pollId) {
  const voted = getVotedPolls()
  return Boolean(voted[pollId])
}

/**
 * Get all voted polls from localStorage
 * @returns {Object}
 */
export function getVotedPolls() {
  try {
    const raw = localStorage.getItem(VOTED_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

// ─── Cookie helpers ───────────────────────────────────────────────────────────

function setCookie(name, value, days) {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`
}

function getCookie(name) {
  const nameEQ = name + '='
  const cookies = document.cookie.split(';')
  for (let c of cookies) {
    c = c.trim()
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length)
  }
  return null
}
