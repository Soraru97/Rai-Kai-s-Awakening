import { motion } from 'framer-motion'

export function ProgressBar({ value, max, className = '', showLabel = true }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-text-secondary font-medium">
            Этап {value} из {max}
          </span>
          <span className="text-xs text-accent font-semibold">
            {Math.round(pct)}%
          </span>
        </div>
      )}
      <div className="progress-bar-track h-1.5">
        <motion.div
          className="progress-bar-fill h-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

export function VoteProgressBar({ value, max }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 progress-bar-track h-2 rounded-full">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #6c63ff 0%, #8b5cf6 100%)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span className="text-sm font-semibold text-accent w-10 text-right">
        {Math.round(pct)}%
      </span>
    </div>
  )
}

export function ResultBar({ votes, total, color = '#6c63ff' }) {
  const pct = total > 0 ? Math.min((votes / total) * 100, 100) : 0

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-surface-3 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        />
      </div>
      <span className="text-sm font-mono text-text-secondary w-10 text-right">
        {Math.round(pct)}%
      </span>
    </div>
  )
}
