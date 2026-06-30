import { useState, useEffect } from 'react'
import { getActivePoll, getStages } from '@/services/pollService'
import { subscribeToSettings } from '@/services/pollService'

/**
 * Hook to load the currently active poll with its stages
 */
export function usePollData() {
  const [poll, setPoll] = useState(null)
  const [stages, setStages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function loadPoll() {
      try {
        setLoading(true)
        setError(null)
        const activePoll = await getActivePoll()

        if (cancelled) return

        if (!activePoll) {
          setPoll(null)
          setStages([])
          setLoading(false)
          return
        }

        const pollStages = await getStages(activePoll.id)

        if (cancelled) return

        setPoll(activePoll)
        setStages(pollStages)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadPoll()

    // Subscribe to settings changes (e.g. activePollId changes)
    const unsubscribe = subscribeToSettings((settings) => {
      if (!cancelled && settings.activePollId) {
        loadPoll()
      }
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  return { poll, stages, loading, error }
}
