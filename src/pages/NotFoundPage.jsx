import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex-1 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-7xl font-black text-gradient mb-4">404</p>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Страница не найдена</h1>
        <p className="text-text-secondary mb-8">
          Похоже, такой страницы не существует или она была перемещена.
        </p>
        <Button onClick={() => navigate('/')}>На главную</Button>
      </motion.div>
    </div>
  )
}
