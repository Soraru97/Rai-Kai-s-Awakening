import { motion } from 'framer-motion'
import { useCountdown } from '@/hooks/useCountdown'

function TimeUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="glass-panel w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-2xl">
        <motion.span key={value} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="text-2xl sm:text-3xl font-bold font-mono text-text-primary">
          {String(value).padStart(2, '0')}
        </motion.span>
      </div>
      <span className="text-xs text-text-muted mt-2 font-medium">{label}</span>
    </div>
  )
}

export function CountdownTimer({ targetDate, label = 'Voting starts in' }) {
  const countdown = useCountdown(targetDate)
  if (!countdown || countdown.expired) return null
  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-text-secondary text-base">{label}</p>
      <div className="flex items-end gap-3 sm:gap-4">
        <TimeUnit value={countdown.days} label="days" />
        <span className="text-2xl text-text-muted pb-6 font-light">:</span>
        <TimeUnit value={countdown.hours} label="hours" />
        <span className="text-2xl text-text-muted pb-6 font-light">:</span>
        <TimeUnit value={countdown.minutes} label="minutes" />
        <span className="text-2xl text-text-muted pb-6 font-light">:</span>
        <TimeUnit value={countdown.seconds} label="seconds" />
      </div>
    </div>
  )
}
