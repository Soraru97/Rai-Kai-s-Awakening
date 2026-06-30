import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'

const REDIRECT_DELAY = 5000

export default function ThankYouPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/results')
    }, REDIRECT_DELAY)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="flex-1 flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        {/* Animated checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 150, delay: 0.1 }}
          className="inline-flex items-center justify-center w-28 h-28 rounded-full mb-8"
          style={{
            background: 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)',
            boxShadow: '0 20px 60px rgba(34,197,94,0.5)',
          }}
        >
          <motion.svg
            className="w-16 h-16 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
          >
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            />
          </motion.svg>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-black text-text-primary mb-4"
        >
          Спасибо за участие!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-text-secondary mb-8"
        >
          Ваш голос сохранён и учтён в результатах.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <Button size="lg" onClick={() => navigate('/results')} className="w-full">
            Посмотреть результаты
          </Button>

          <p className="text-sm text-text-muted">
            Автоматический переход через 5 секунд...
          </p>

          {/* Progress bar for redirect */}
          <div className="w-full h-0.5 bg-surface-3 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent rounded-full"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: REDIRECT_DELAY / 1000, ease: 'linear' }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
