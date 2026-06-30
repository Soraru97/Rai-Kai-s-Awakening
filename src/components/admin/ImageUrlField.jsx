import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const DEFAULT_POSITION = { x: 50, y: 50 }
const DRAG_THRESHOLD = 3 // pixels of movement before a click counts as a drag

/**
 * Image input by URL instead of file upload, with drag-to-reposition support.
 * Used because Firebase Storage requires the Blaze (paid) plan;
 * this approach works entirely on the free Spark plan.
 *
 * Stores `imagePosition: { x, y }` as percentages (0-100), matching the
 * CSS `object-position` model, so the same value can be reused anywhere
 * the image is rendered with `object-fit: cover`.
 */
export function ImageUrlField({ imageUrl, position, onChange, onPositionChange }) {
  const [localUrl, setLocalUrl] = useState(imageUrl || '')
  const [error, setError] = useState(false)
  const [isPositioning, setIsPositioning] = useState(false)
  const frameRef = useRef(null)

  const pos = position || DEFAULT_POSITION

  function handleBlur() {
    onChange(localUrl.trim())
  }

  function handleImgError() {
    setError(true)
  }

  function handleImgLoad() {
    setError(false)
  }

  const updatePositionFromEvent = useCallback((clientX, clientY) => {
    const frame = frameRef.current
    if (!frame) return
    const rect = frame.getBoundingClientRect()
    const x = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
    const y = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100))
    onPositionChange?.({ x: Math.round(x), y: Math.round(y) })
  }, [onPositionChange])

  function handlePointerDown(e) {
    if (!isPositioning) return
    e.preventDefault()

    const startX = e.clientX
    const startY = e.clientY
    let hasDragged = false

    function handlePointerMove(moveEvent) {
      const dx = Math.abs(moveEvent.clientX - startX)
      const dy = Math.abs(moveEvent.clientY - startY)
      // Only start moving the image once the pointer has actually moved —
      // a plain click/tap shouldn't reposition anything.
      if (!hasDragged && (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD)) {
        hasDragged = true
      }
      if (hasDragged) {
        updatePositionFromEvent(moveEvent.clientX, moveEvent.clientY)
      }
    }
    function handlePointerUp() {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={frameRef}
        onPointerDown={handlePointerDown}
        className={`relative aspect-[4/3] rounded-xl border overflow-hidden flex items-center justify-center bg-surface-3 ${
          isPositioning ? 'border-accent cursor-move select-none' : 'border-border'
        }`}
      >
        {localUrl && !error ? (
          <img
            src={localUrl}
            alt=""
            draggable={false}
            className="w-full h-full object-cover pointer-events-none"
            style={{ objectPosition: `${pos.x}% ${pos.y}%` }}
            onError={handleImgError}
            onLoad={handleImgLoad}
          />
        ) : (
          <div className="text-center p-4">
            <svg className="w-8 h-8 mx-auto text-text-muted mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs text-text-muted">
              {error ? 'Не удалось загрузить изображение' : 'Вставьте ссылку на изображение'}
            </p>
          </div>
        )}

        {/* Reposition toggle button — isolated from the drag frame via
            pointerdown stopPropagation so clicking it never moves the image */}
        {localUrl && !error && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setIsPositioning(v => !v) }}
            onPointerDown={(e) => e.stopPropagation()}
            className={`absolute top-1.5 left-1.5 z-10 p-1.5 rounded-lg backdrop-blur-sm transition-colors ${
              isPositioning
                ? 'bg-accent text-white'
                : 'bg-surface-2/80 text-text-muted hover:text-text-primary'
            }`}
            title={isPositioning ? 'Готово' : 'Переместить изображение'}
          >
            {isPositioning ? (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 4v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            )}
          </button>
        )}

        {/* Positioning mode hint */}
        <AnimatePresence>
          {isPositioning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-1.5 left-1.5 right-1.5 px-2 py-1 rounded-md bg-surface-2/90 backdrop-blur-sm text-center pointer-events-none"
            >
              <p className="text-[10px] text-text-secondary">Перетащите для позиционирования</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <input
        type="url"
        value={localUrl}
        onChange={(e) => setLocalUrl(e.target.value)}
        onBlur={handleBlur}
        placeholder="https://example.com/image.jpg"
        className="input-field text-xs py-2"
      />
    </div>
  )
}
