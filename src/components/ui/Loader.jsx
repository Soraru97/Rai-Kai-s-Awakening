import { motion } from 'framer-motion'

export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-3', xl: 'w-16 h-16 border-4' }
  return <div className={`${sizes[size]} rounded-full border-surface-4 border-t-accent animate-spin ${className}`} role="status" aria-label="Loading..." />
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4">
        <Spinner size="xl" />
        <p className="text-text-secondary text-sm">Loading...</p>
      </motion.div>
    </div>
  )
}

export function InlineLoader({ text = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12">
      <Spinner />
      <span className="text-text-secondary">{text}</span>
    </div>
  )
}
