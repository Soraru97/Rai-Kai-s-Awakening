import { useState, useCallback } from 'react'

/**
 * Hook for managing voting state within a single stage
 * @param {number} maxChoices - Maximum allowed selections. 0 means unlimited.
 */
export function useVoting(maxChoices = 1) {
  const [selected, setSelected] = useState(new Set())
  const isUnlimited = maxChoices === 0

  const isSelected = useCallback((cardId) => selected.has(cardId), [selected])
  const isDisabled = useCallback(
    (cardId) => !isUnlimited && selected.size >= maxChoices && !selected.has(cardId),
    [selected, maxChoices, isUnlimited]
  )
  const selectedCount = selected.size
  const canSubmit = selected.size > 0

  const toggleCard = useCallback((cardId) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(cardId)) {
        next.delete(cardId)
      } else if (isUnlimited || next.size < maxChoices) {
        next.add(cardId)
      }
      return next
    })
  }, [maxChoices, isUnlimited])

  const reset = useCallback(() => {
    setSelected(new Set())
  }, [])

  const getSelectedArray = useCallback(() => Array.from(selected), [selected])

  return {
    selected,
    isSelected,
    isDisabled,
    selectedCount,
    canSubmit,
    toggleCard,
    reset,
    getSelectedArray,
    isUnlimited,
  }
}
