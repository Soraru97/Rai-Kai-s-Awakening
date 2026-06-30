import { useState, useEffect } from 'react'
import { subscribeToResults } from '@/services/voteService'
import { percentage } from '@/utils/helpers'

/**
 * Hook to subscribe to live poll results
 */
export function useResults(pollId) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!pollId) {
      setLoading(false)
      return
    }

    setLoading(true)

    const unsubscribe = subscribeToResults(pollId, (rawResults) => {
      const processed = rawResults.map(stage => {
        const cards = Object.entries(stage.cards || {}).map(([id, card]) => ({
          id,
          title: card.title,
          imageUrl: card.imageUrl,
          imagePosition: card.imagePosition || { x: 50, y: 50 },
          votes: card.votes || 0,
          percentage: percentage(card.votes || 0, stage.totalVotes || 0),
        }))

        // Sort by votes descending
        cards.sort((a, b) => b.votes - a.votes)

        return {
          stageId: stage.stageId,
          title: stage.stageTitle,
          order: stage.stageOrder,
          totalVotes: stage.totalVotes || 0,
          showVoteCounts: stage.showVoteCounts ?? true,
          cards,
        }
      })

      setResults(processed)
      setLoading(false)
    })

    return unsubscribe
  }, [pollId])

  return { results, loading, error }
}
