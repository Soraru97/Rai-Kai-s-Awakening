import { motion } from 'framer-motion'

export function VoteCard({ card, selected, disabled, onClick }) {
  return (
    <motion.button
      onClick={() => !disabled && onClick(card.id)}
      className={`
        relative group flex flex-col rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 text-left w-full
        ${disabled && !selected
          ? 'opacity-40 cursor-not-allowed'
          : 'cursor-pointer'
        }
      `}
      whileHover={!disabled || selected ? { y: -4, scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      {/* Border glow wrapper */}
      <div
        className={`
          relative w-full h-full rounded-2xl transition-all duration-300
          ${selected
            ? 'shadow-card-selected'
            : 'shadow-card hover:shadow-card-hover'
          }
        `}
        style={{
          outline: selected
            ? '2px solid #22c55e'
            : disabled
            ? '1px solid rgba(255,255,255,0.04)'
            : '1px solid rgba(255,255,255,0.08)',
          outlineOffset: selected ? '0px' : '-1px',
        }}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] bg-surface-3 overflow-hidden rounded-t-2xl">
          {card.imageUrl ? (
            <img
              src={card.imageUrl}
              alt={card.title}
              className={`w-full h-full object-cover transition-transform duration-500 ${
                !disabled ? 'group-hover:scale-105' : ''
              }`}
              style={{
                objectPosition: `${card.imagePosition?.x ?? 50}% ${card.imagePosition?.y ?? 50}%`,
              }}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-text-muted">
              🖼️
            </div>
          )}

          {/* Selected overlay */}
          {selected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-success/20 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                className="w-12 h-12 rounded-full bg-success flex items-center justify-center shadow-success"
              >
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            </motion.div>
          )}

          {/* Hover shimmer */}
          {!selected && !disabled && (
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-accent/10 to-transparent" />
          )}
        </div>

        {/* Card footer */}
        <div
          className={`px-4 py-3 transition-colors duration-300 rounded-b-2xl ${
            selected
              ? 'bg-success/10 border-t border-success/20'
              : 'bg-surface-2 border-t border-border'
          }`}
        >
          <p
            className={`font-semibold text-sm leading-tight transition-colors duration-200 ${
              selected ? 'text-success' : 'text-text-primary'
            }`}
          >
            {card.title}
          </p>
        </div>
      </div>
    </motion.button>
  )
}
