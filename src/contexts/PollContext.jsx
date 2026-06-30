import { createContext, useContext, useState, useCallback } from 'react'

const PollContext = createContext(null)

export function PollProvider({ children }) {
  const [poll, setPoll] = useState(null)
  const [stages, setStages] = useState([])
  const [currentStageIndex, setCurrentStageIndex] = useState(0)
  const [stageVotes, setStageVotes] = useState({}) // { [stageId]: string[] }
  const [geoData, setGeoData] = useState(null)

  const currentStage = stages[currentStageIndex] || null
  const totalStages = stages.length
  const isLastStage = currentStageIndex === totalStages - 1

  const saveStageVote = useCallback((stageId, cardIds) => {
    setStageVotes(prev => ({ ...prev, [stageId]: cardIds }))
  }, [])

  const advanceStage = useCallback(() => {
    setCurrentStageIndex(prev => Math.min(prev + 1, totalStages - 1))
  }, [totalStages])

  const resetVoting = useCallback(() => {
    setCurrentStageIndex(0)
    setStageVotes({})
  }, [])

  return (
    <PollContext.Provider value={{
      poll, setPoll,
      stages, setStages,
      currentStageIndex,
      currentStage,
      totalStages,
      isLastStage,
      stageVotes,
      geoData, setGeoData,
      saveStageVote,
      advanceStage,
      resetVoting,
    }}>
      {children}
    </PollContext.Provider>
  )
}

export function usePoll() {
  const ctx = useContext(PollContext)
  if (!ctx) throw new Error('usePoll must be used within PollProvider')
  return ctx
}
