import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { usePoll } from '@/contexts/PollContext'
import { useVoting } from '@/hooks/useVoting'
import { submitVote, hasVoted } from '@/services/voteService'
import { getGeoData } from '@/services/geoService'
import { getPollStatus } from '@/utils/dates'
import { StageHeader } from '@/components/voting/StageHeader'
import { VoteGrid } from '@/components/voting/VoteGrid'
import { Button } from '@/components/ui/Button'
import { PageLoader } from '@/components/ui/Loader'
import toast from 'react-hot-toast'

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
}

export default function VotePage() {
  const navigate = useNavigate()
  const {
    poll, stages,
    currentStageIndex, currentStage, totalStages, isLastStage,
    stageVotes, geoData, setGeoData,
    saveStageVote, advanceStage,
  } = usePoll()

  const [submitting, setSubmitting] = useState(false)
  const [direction, setDirection] = useState(1)

  const {
    selected, isSelected, isDisabled, selectedCount, canSubmit,
    toggleCard, reset, getSelectedArray,
  } = useVoting(currentStage?.maxChoices ?? 1)

  // Guard: redirect if no poll or stage data
  useEffect(() => {
    if (!poll || !stages.length) {
      navigate('/')
      return
    }

    // Check if already voted
    hasVoted(poll.id).then((voted) => {
      if (voted) navigate('/')
    })

    const status = getPollStatus(poll.startDate, poll.endDate, poll.isActive)
    if (status !== 'active') navigate('/')

    // Prefetch geo data
    if (!geoData) {
      getGeoData().then(setGeoData)
    }
  }, [poll, stages])

  // Reset selection when stage changes
  useEffect(() => {
    reset()
  }, [currentStageIndex])

  async function handleNextStage() {
    if (!canSubmit) {
      toast.error('Выберите хотя бы один вариант')
      return
    }

    saveStageVote(currentStage.id, getSelectedArray())

    if (isLastStage) {
      await handleSubmitAll()
    } else {
      setDirection(1)
      advanceStage()
    }
  }

  async function handleSubmitAll() {
    setSubmitting(true)
    try {
      const allVotes = {
        ...stageVotes,
        [currentStage.id]: getSelectedArray(),
      }

      await submitVote(poll.id, allVotes, geoData || {})
      navigate('/thank-you')
    } catch (err) {
      console.error('=== submitVote ERROR ===')
      console.error('message:', err.message)
      console.error('code:', err.code)
      console.error('full error:', err)

      if (err.message === 'ALREADY_VOTED') {
        toast.error('Вы уже проголосовали')
        navigate('/')
      } else {
        toast.error(`Ошибка: ${err.code || err.message || 'неизвестная'}`)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!poll || !currentStage) return <PageLoader />

  return (
    <div className="flex-1 px-4 sm:px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Stage header */}
        <StageHeader
          stage={currentStage}
          currentIndex={currentStageIndex}
          total={totalStages}
          selectedCount={selectedCount}
        />

        {/* Cards */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStage.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', damping: 24, stiffness: 200 }}
          >
            <VoteGrid
              cards={currentStage.cards || []}
              isSelected={isSelected}
              isDisabled={isDisabled}
              onToggle={toggleCard}
            />
          </motion.div>
        </AnimatePresence>

        {/* Bottom action bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex items-center justify-between gap-4"
        >
          <div className="text-sm text-text-muted">
            {currentStageIndex + 1} / {totalStages}
          </div>

          <Button
            size="lg"
            onClick={handleNextStage}
            loading={submitting}
            disabled={!canSubmit}
          >
            {isLastStage ? (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Завершить голосование
              </>
            ) : (
              <>
                Следующий этап
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
