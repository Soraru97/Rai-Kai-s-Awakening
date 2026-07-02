import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { getAllPolls, deletePoll, updateGlobalSettings, getGlobalSettings } from '@/services/pollService'
import { getPollStatus, formatDate } from '@/utils/dates'
import { StatusBadge } from '@/components/ui/Badge'
import { InlineLoader } from '@/components/ui/Loader'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'

export default function AdminPollsListPage() {
  const navigate = useNavigate()
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [activePollId, setActivePollId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [settingActive, setSettingActive] = useState(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const [pollsData, settings] = await Promise.all([getAllPolls(), getGlobalSettings()])
    setPolls(pollsData)
    setActivePollId(settings.activePollId || null)
    setLoading(false)
  }

  async function handleSetActive(pollId) {
    setSettingActive(pollId)
    try {
      await updateGlobalSettings({ activePollId: pollId })
      setActivePollId(pollId)
      toast.success('Poll set as active on the main page')
    } catch { toast.error('Update error') } finally { setSettingActive(null) }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deletePoll(deleteTarget.id)
      toast.success('Poll deleted')
      setPolls(prev => prev.filter(p => p.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch { toast.error('Delete error') } finally { setDeleting(false) }
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Polls</h1>
          <p className="text-text-secondary text-sm mt-1">Manage all polls</p>
        </div>
        <Button onClick={() => navigate('/admin/polls/new')}>+ Create Poll</Button>
      </div>

      {loading ? <InlineLoader /> : polls.length === 0 ? (
        <EmptyState icon="🗳️" title="No polls yet"
          description="Create your first poll to start collecting votes"
          action={<Button onClick={() => navigate('/admin/polls/new')}>Create poll</Button>}
        />
      ) : (
        <div className="grid gap-4">
          {polls.map((poll, i) => {
            const status = getPollStatus(poll.startDate, poll.endDate, poll.isActive)
            const isCurrentActive = activePollId === poll.id
            return (
              <motion.div key={poll.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`glass-panel p-5 ${isCurrentActive ? 'ring-1 ring-accent/40' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <StatusBadge status={status} />
                      {isCurrentActive && <span className="badge badge-accent">Active on main</span>}
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-1">{poll.title}</h3>
                    {poll.description && (
                      <p className="text-sm text-text-secondary line-clamp-1 mb-2">{poll.description}</p>
                    )}
                    <p className="text-xs text-text-muted">
                      {formatDate(poll.startDate)} — {formatDate(poll.endDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!isCurrentActive && (
                      <Button variant="ghost" size="sm" onClick={() => handleSetActive(poll.id)}
                        loading={settingActive === poll.id}>
                        Set active
                      </Button>
                    )}
                    <Button variant="secondary" size="sm" onClick={() => navigate(`/admin/polls/${poll.id}`)}>
                      Edit
                    </Button>
                    <button onClick={() => setDeleteTarget(poll)}
                      className="p-2.5 rounded-xl text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <Modal isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Delete poll?" size="sm">
        <p className="text-text-secondary mb-6">
          Are you sure you want to delete «{deleteTarget?.title}»? This action is irreversible
          and will delete all stages, votes and results.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} loading={deleting}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
