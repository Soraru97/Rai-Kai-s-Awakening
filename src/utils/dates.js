import { format, formatDistanceToNow, differenceInSeconds, isPast, isFuture } from 'date-fns'
import { ru } from 'date-fns/locale'

/**
 * Convert Firestore Timestamp or Date to JS Date
 */
export function toDate(value) {
  if (!value) return null
  if (value?.toDate) return value.toDate()
  if (value instanceof Date) return value
  if (typeof value === 'number') return new Date(value)
  return new Date(value)
}

/**
 * Format a date for display
 */
export function formatDate(value, fmt = 'dd MMMM yyyy') {
  const date = toDate(value)
  if (!date) return '—'
  return format(date, fmt, { locale: ru })
}

/**
 * Format date + time
 */
export function formatDateTime(value) {
  return formatDate(value, 'dd MMM yyyy, HH:mm')
}

/**
 * Get relative time string
 */
export function timeAgo(value) {
  const date = toDate(value)
  if (!date) return '—'
  return formatDistanceToNow(date, { addSuffix: true, locale: ru })
}

/**
 * Check if a date is in the past
 */
export function isExpired(value) {
  const date = toDate(value)
  if (!date) return false
  return isPast(date)
}

/**
 * Check if a date is in the future
 */
export function isUpcoming(value) {
  const date = toDate(value)
  if (!date) return false
  return isFuture(date)
}

/**
 * Get countdown object (days, hours, minutes, seconds) to a future date
 * @param {Date|Timestamp} value
 * @returns {{ days, hours, minutes, seconds, total } | null}
 */
export function getCountdown(value) {
  const date = toDate(value)
  if (!date) return null

  const total = differenceInSeconds(date, new Date())
  if (total <= 0) return null

  const days = Math.floor(total / 86400)
  const hours = Math.floor((total % 86400) / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60

  return { days, hours, minutes, seconds, total }
}

/**
 * Get poll status
 * @returns {'upcoming' | 'active' | 'ended'}
 */
export function getPollStatus(startDate, endDate, isActive) {
  if (!isActive) return 'ended'
  const start = toDate(startDate)
  const end = toDate(endDate)
  const now = new Date()

  if (start && now < start) return 'upcoming'
  if (end && now > end) return 'ended'
  return 'active'
}
