import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="flex-1 flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <p className="text-7xl font-black text-gradient mb-4">404</p>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Page not found</h1>
        <p className="text-text-secondary mb-8">
          This page doesn't exist or has been moved.
        </p>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </motion.div>
    </div>
  )
}
