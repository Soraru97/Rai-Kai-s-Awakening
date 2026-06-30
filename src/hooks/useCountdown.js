import { useState, useEffect } from 'react'
import { getCountdown, toDate } from '@/utils/dates'

/**
 * Real-time countdown hook
 * @param {Date|Timestamp} targetDate
 * @returns {{ days, hours, minutes, seconds, total, expired }}
 */
export function useCountdown(targetDate) {
  const [countdown, setCountdown] = useState(() => {
    const date = toDate(targetDate)
    return date ? getCountdown(date) : null
  })

  useEffect(() => {
    if (!targetDate) return

    const tick = () => {
      const date = toDate(targetDate)
      setCountdown(date ? getCountdown(date) : null)
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  return {
    ...countdown,
    expired: !countdown || countdown.total <= 0,
  }
}
