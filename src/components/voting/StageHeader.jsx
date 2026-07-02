import { motion } from 'framer-motion'
import { ProgressBar } from '@/components/ui/ProgressBar'

function pluralVote(n) {
  return n === 1 ? 'option' : 'options'
}

export function StageHeader({ stage, currentIndex, total, selectedCount }) {
  const isUnlimited = stage.maxChoices === 0
  const remaining = isUnlimited ? null : stage.maxChoices - selectedCount

  return (
    <div className="mb-8">
      <ProgressBar value={currentIndex + 1} max={total} />

      <motion.div key={stage.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">{stage.title}</h1>
        {stage.description && <p className="text-text-secondary mt-1.5">{stage.description}</p>}
      </motion.div>

      <motion.div className="mt-4 flex items-center gap-3 flex-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <div className="glass-panel px-4 py-2.5 flex items-center gap-2.5">
          <span className="text-text-secondary text-sm">Selected:</span>
          {!isUnlimited && (
            <div className="flex items-center gap-1">
              {Array.from({ length: stage.maxChoices }).map((_, i) => (
                <motion.div key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-colors duration-200 ${i < selectedCount ? 'bg-success' : 'bg-surface-4'}`}
                  animate={{ scale: i === selectedCount - 1 ? [1, 1.4, 1] : 1 }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>
          )}
          <span className="font-semibold text-text-primary">
            {isUnlimited ? selectedCount : `${selectedCount} / ${stage.maxChoices}`}
          </span>
        </div>

        {isUnlimited && (
          <span className="text-sm text-text-muted">You can select as many options as you like</span>
        )}

        {!isUnlimited && remaining > 0 && selectedCount < stage.maxChoices && (
          <motion.span key={remaining} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className="text-sm text-text-muted">
            Select {remaining} more {pluralVote(remaining)}
          </motion.span>
        )}

        {!isUnlimited && selectedCount === stage.maxChoices && (
          <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="text-sm text-success font-medium flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Selection limit reached
          </motion.span>
        )}
      </motion.div>
    </div>
  )
}
