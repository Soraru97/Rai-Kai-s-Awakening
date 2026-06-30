import { forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ImageUrlField } from './ImageUrlField'
import { uuid } from '@/utils/helpers'

const CardRow = forwardRef(function CardRow({ card, onUpdate, onRemove }, ref) {
  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-panel p-3 flex flex-col gap-2 relative"
    >
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 z-10 p-1.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors bg-surface-2/80 backdrop-blur-sm"
        aria-label="Удалить карточку"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <ImageUrlField
        imageUrl={card.imageUrl}
        position={card.imagePosition}
        onChange={(url) => onUpdate({ ...card, imageUrl: url })}
        onPositionChange={(position) => onUpdate({ ...card, imagePosition: position })}
      />

      <input
        type="text"
        value={card.title}
        onChange={(e) => onUpdate({ ...card, title: e.target.value })}
        placeholder="Название карточки"
        className="input-field text-sm py-2"
      />
    </motion.div>
  )
})

export function CardEditor({ cards, onChange }) {
  function addCard() {
    onChange([...cards, { id: uuid(), title: '', imageUrl: '', imagePosition: { x: 50, y: 50 } }])
  }

  function updateCard(index, updated) {
    const next = [...cards]
    next[index] = updated
    onChange(next)
  }

  function removeCard(index) {
    onChange(cards.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-text-muted">
        Вставьте ссылку на изображение для каждой карточки (например, с imgbb.com, imgur.com или любого другого хостинга картинок)
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AnimatePresence mode="popLayout">
          {cards.map((card, i) => (
            <CardRow
              key={card.id}
              card={card}
              onUpdate={(updated) => updateCard(i, updated)}
              onRemove={() => removeCard(i)}
            />
          ))}
        </AnimatePresence>
      </div>

      <button
        onClick={addCard}
        className="w-full py-3 rounded-xl border-2 border-dashed border-border hover:border-accent/50 text-text-secondary hover:text-accent transition-all duration-200 text-sm font-medium"
      >
        + Добавить карточку
      </button>
    </div>
  )
}
