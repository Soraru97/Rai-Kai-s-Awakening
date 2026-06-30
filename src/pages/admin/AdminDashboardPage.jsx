import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getAllPolls } from '@/services/pollService'
import { getPollStatus, formatDate } from '@/utils/dates'
import { formatNumber } from '@/utils/helpers'
import { StatusBadge } from '@/components/ui/Badge'
import { InlineLoader } from '@/components/ui/Loader'
import { Button } from '@/components/ui/Button'

function StatCard({ label, value, sub, icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="stat-card"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-text-muted text-sm">{label}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-text-primary">{value}</p>
      {sub && <p className="text-xs text-text-muted mt-1">{sub}</p>}
    </motion.div>
  )
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllPolls().then(p => {
      setPolls(p)
      setLoading(false)
    })
  }, [])

  const active = polls.filter(p => getPollStatus(p.startDate, p.endDate, p.isActive) === 'active')
  const upcoming = polls.filter(p => getPollStatus(p.startDate, p.endDate, p.isActive) === 'upcoming')
  const ended = polls.filter(p => getPollStatus(p.startDate, p.endDate, p.isActive) === 'ended')

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Обзор</h1>
          <p className="text-text-secondary text-sm mt-1">Общая статистика и управление</p>
        </div>
        <Button onClick={() => navigate('/admin/polls/new')}>
          + Создать голосование
        </Button>
      </div>

      {loading ? (
        <InlineLoader />
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Всего голосований" value={polls.length} icon="🗳️" />
            <StatCard label="Активных" value={active.length} icon="✅" />
            <StatCard label="Предстоящих" value={upcoming.length} icon="⏳" />
            <StatCard label="Завершённых" value={ended.length} icon="🔒" />
          </div>

          {/* Recent polls */}
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-text-primary">Последние голосования</h2>
              <button
                onClick={() => navigate('/admin/polls')}
                className="text-sm text-accent hover:text-accent/80 transition-colors"
              >
                Все →
              </button>
            </div>

            {polls.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-text-muted">Нет голосований</p>
                <Button className="mt-4" variant="secondary" size="sm" onClick={() => navigate('/admin/polls/new')}>
                  Создать первое
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {polls.slice(0, 5).map(poll => {
                  const status = getPollStatus(poll.startDate, poll.endDate, poll.isActive)
                  return (
                    <motion.div
                      key={poll.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => navigate(`/admin/polls/${poll.id}`)}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-3 cursor-pointer transition-colors group"
                    >
                      <StatusBadge status={status} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate group-hover:text-accent transition-colors">
                          {poll.title}
                        </p>
                        <p className="text-xs text-text-muted">
                          {formatDate(poll.startDate)} — {formatDate(poll.endDate)}
                        </p>
                      </div>
                      <svg className="w-4 h-4 text-text-muted group-hover:text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
