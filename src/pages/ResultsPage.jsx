import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { usePoll } from '@/contexts/PollContext'
import { usePollData } from '@/hooks/usePollData'
import { useResults } from '@/hooks/useResults'
import { ResultBar } from '@/components/ui/ProgressBar'
import { InlineLoader } from '@/components/ui/Loader'
import { Button } from '@/components/ui/Button'
import { formatNumber } from '@/utils/helpers'

function ResultCard({ card, rank, total, showVotes = true, enableZoom = true }) {
  const colors = [
    'linear-gradient(90deg, #f59e0b, #fbbf24)',
    'linear-gradient(90deg, #94a3b8, #cbd5e1)',
    'linear-gradient(90deg, #92400e, #b45309)',
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.03 }}
      className="flex items-center gap-4"
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={{
          background: rank <= 2 ? colors[rank] : 'rgba(255,255,255,0.06)',
          color: rank <= 2 ? '#0d0f14' : '#565c75',
        }}
      >
        {rank + 1}
      </div>

      {card.imageUrl && (
        <div className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 relative border border-border ${enableZoom ? 'cursor-zoom-in' : ''}`}>
          <motion.img
            src={card.imageUrl}
            alt={card.title}
            className="w-full h-full object-cover"
            whileHover={enableZoom ? { scale: 2.2 } : {}}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{
              transformOrigin: 'center',
              position: 'relative',
              zIndex: 1,
              objectPosition: `${card.imagePosition?.x ?? 50}% ${card.imagePosition?.y ?? 50}%`,
            }}
          />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate mb-1.5">
          {card.title}
        </p>
        <ResultBar votes={card.votes} total={total} />
      </div>

      {showVotes && (
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-bold text-text-primary">{formatNumber(card.votes)}</p>
          <p className="text-xs text-text-muted">votes</p>
        </div>
      )}
    </motion.div>
  )
}

function StageResults({ stage, index, enableZoom }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="glass-panel p-6 h-full"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-text-primary">{stage.title}</h3>
          {stage.showVoteCounts && (
            <p className="text-sm text-text-muted mt-0.5">
              {formatNumber(stage.totalVotes)} {stage.totalVotes === 1 ? 'vote' : 'votes'}
            </p>
          )}
        </div>
        <div className="badge badge-accent flex-shrink-0">
          Stage {index + 1}
        </div>
      </div>

      {stage.cards.length === 0 ? (
        <p className="text-text-muted text-sm text-center py-4">No data yet</p>
      ) : (
        <div className="space-y-4">
          {stage.cards.map((card, i) => (
            <ResultCard
              key={card.id}
              card={card}
              rank={i}
              total={stage.totalVotes}
              showVotes={stage.showVoteCounts}
              enableZoom={enableZoom}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default function ResultsPage() {
  const navigate = useNavigate()
  const { poll: contextPoll } = usePoll()
  const { poll: fetchedPoll } = usePollData()
  const poll = contextPoll || fetchedPoll
  const { results, loading } = useResults(poll?.id)
  const totalVoters = results[0]?.totalVotes ?? 0

  return (
    <div className="flex-1 px-4 sm:px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <button onClick={() => navigate('/')} className="btn-ghost mb-6 text-text-muted">
            ← Back
          </button>
          <h1 className="text-3xl sm:text-4xl font-black text-text-primary mb-2">
            Poll Results
          </h1>
          {poll?.title && (
            <p className="text-text-secondary text-lg">{poll.title}</p>
          )}
          {totalVoters > 0 && results[0]?.showVoteCounts && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-surface-2 border border-border rounded-xl">
              <span className="text-2xl font-bold text-gradient">{formatNumber(totalVoters)}</span>
              <span className="text-text-secondary text-sm">
                {totalVoters === 1 ? 'participant' : 'participants'}
              </span>
            </div>
          )}
        </motion.div>

        {loading ? (
          <InlineLoader text="Loading results..." />
        ) : results.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📊</div>
            <p className="text-text-secondary">No results yet</p>
            <p className="text-text-muted text-sm mt-1">Votes will appear here in real time</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {results.map((stage, i) => (
              <StageResults
                key={stage.stageId}
                stage={stage}
                index={i}
                enableZoom={poll?.enableImageZoom ?? true}
              />
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex justify-center"
        >
          <Button variant="secondary" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
