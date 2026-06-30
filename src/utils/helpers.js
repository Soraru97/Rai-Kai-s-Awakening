/**
 * Format a number with thousands separator
 */
export function formatNumber(n) {
  if (n == null) return '0'
  return n.toLocaleString('ru-RU')
}

/**
 * Calculate percentage
 */
export function percentage(value, total) {
  if (!total || total === 0) return 0
  return Math.round((value / total) * 100)
}

/**
 * Clamp a number between min and max
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

/**
 * Pluralize Russian words
 * @param {number} n
 * @param {[string, string, string]} forms - [1 голос, 2 голоса, 5 голосов]
 */
export function pluralize(n, forms) {
  const abs = Math.abs(n) % 100
  const n1 = abs % 10
  if (abs > 10 && abs < 20) return forms[2]
  if (n1 > 1 && n1 < 5) return forms[1]
  if (n1 === 1) return forms[0]
  return forms[2]
}

/**
 * Debounce a function
 */
export function debounce(fn, delay) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Deep clone an object (JSON-safe)
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Generate a UUID v4
 */
export function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

/**
 * Sort array of objects by a key
 */
export function sortBy(arr, key, direction = 'asc') {
  return [...arr].sort((a, b) => {
    if (a[key] < b[key]) return direction === 'asc' ? -1 : 1
    if (a[key] > b[key]) return direction === 'asc' ? 1 : -1
    return 0
  })
}

/**
 * Group array of objects by a key
 */
export function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const group = item[key]
    if (!acc[group]) acc[group] = []
    acc[group].push(item)
    return acc
  }, {})
}

/**
 * Truncate a string with ellipsis
 */
export function truncate(str, maxLen = 50) {
  if (!str) return ''
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str
}
