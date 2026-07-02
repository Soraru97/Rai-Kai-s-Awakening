import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { usePoll } from '@/contexts/PollContext'
import { usePollData } from '@/hooks/usePollData'
import { hasVoted } from '@/services/voteService'
import { getPollStatus, formatDate } from '@/utils/dates'
import { CountdownTimer } from '@/components/voting/CountdownTimer'
import { StatusBadge } from '@/components/ui/Badge'
import { PageLoader } from '@/components/ui/Loader'
import { Button } from '@/components/ui/Button'

export default function HomePage() {
  const navigate = useNavigate()
  const { setPoll, setStages } = usePoll()
  const { poll, stages, loading } = usePollData()
  const [voted, setVoted] = useState(false)
  const [checkingVote, setCheckingVote] = useState(false)

  useEffect(() => {
    if (poll) {
      setPoll(poll)
      setStages(stages)
      checkIfVoted(poll.id)
    }
  }, [poll, stages])

  async function checkIfVoted(pollId) {
    setCheckingVote(true)
    const alreadyVoted = await hasVoted(pollId)
    setVoted(alreadyVoted)
    setCheckingVote(false)
  }

  if (loading) return <PageLoader />

  if (!poll) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-lg"
        >
          <div className="text-6xl mb-6">🗳️</div>
          <h1 className="text-3xl font-bold text-text-primary mb-3">
            No polls yet
          </h1>
          <p className="text-text-secondary">
            No active polls found. Check back later!
          </p>
        </motion.div>
      </div>
    )
  }

  const status = getPollStatus(poll.startDate, poll.endDate, poll.isActive)

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12">
      <div className="max-w-2xl w-full">

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black text-text-primary leading-tight mb-4"
          >
            {poll.title}
          </motion.h1>

          {poll.description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-lg text-text-secondary leading-relaxed"
            >
              {poll.description}
            </motion.p>
          )}
        </motion.div>

        {/* Status badge + Poll info card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-6 mb-8"
        >
          <div className="flex justify-center mb-5">
            <StatusBadge status={status} />
          </div>

          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-gradient">{stages.length}</p>
              <p className="text-sm text-text-secondary mt-1">
                {stages.length === 1 ? 'stage' : 'stages'}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-secondary mb-1">Starts</p>
              <p className="font-semibold text-text-primary">{formatDate(poll.startDate)}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary mb-1">Ends</p>
              <p className="font-semibold text-text-primary">{formatDate(poll.endDate)}</p>
            </div>
          </div>
        </motion.div>

        {/* CTA section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center space-y-4"
        >
          {status === 'upcoming' && (
            <div className="space-y-6">
              <CountdownTimer targetDate={poll.startDate} />
              <p className="text-text-secondary text-sm">
                Voting starts on {formatDate(poll.startDate, 'MMMM dd \'at\' HH:mm')}
              </p>
            </div>
          )}

          {status === 'active' && !voted && !checkingVote && (
            <Button size="xl" onClick={() => navigate('/vote')} className="w-full sm:w-auto">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Start Voting
            </Button>
          )}

          {status === 'active' && voted && !checkingVote && (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-success/15 border border-success/30 text-success font-semibold">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                You've already voted
              </div>
              <div>
                <Button variant="secondary" onClick={() => navigate('/results')}>
                  View Results
                </Button>
              </div>
            </div>
          )}

          {status === 'ended' && (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-3 border border-border text-text-secondary font-semibold">
                🔒 Voting has ended
              </div>
              <div>
                <Button variant="secondary" onClick={() => navigate('/results')}>
                  View Results
                </Button>
              </div>
            </div>
          )}

          {checkingVote && (
            <div className="text-text-muted text-sm">Checking status...</div>
          )}
        </motion.div>

      </div>
    </div>
  )
}
