import { motion } from 'framer-motion'
import { VoteCard } from './VoteCard'

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20 } },
}

export function VoteGrid({ cards, isSelected, isDisabled, onToggle }) {
  if (!cards?.length) {
    return (
      <div className="text-center py-12 text-text-muted">
        No cards found
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
    >
      {cards.map((card) => (
        <motion.div key={card.id} variants={itemVariants}>
          <VoteCard
            card={card}
            selected={isSelected(card.id)}
            disabled={isDisabled(card.id)}
            onClick={onToggle}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
