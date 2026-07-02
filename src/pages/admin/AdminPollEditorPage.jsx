import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  getPoll, createPoll, updatePoll,
  getStages, createStage, updateStage,
} from '@/services/pollService'
import { initializeStageResults, clearPollVotes } from '@/services/voteService'
import { Input, Textarea, DateInput, Toggle } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { StageEditor } from '@/components/admin/StageEditor'
import { InlineLoader } from '@/components/ui/Loader'
import { uuid } from '@/utils/helpers'
import { toDate } from '@/utils/dates'

function toDatetimeLocal(value) {
  const date = toDate(value)
  if (!date) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export default function AdminPollEditorPage() {
  const { pollId } = useParams()
  const navigate = useNavigate()
  const isNew = pollId === 'new'

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [showClearModal, setShowClearModal] = useState(false)

  const [form, setForm] = useState({
    title: '', description: '', startDate: '', endDate: '',
    isActive: true, enableImageZoom: true,
  })
  const [stages, setStages] = useState([])
  const [currentPollId, setCurrentPollId] = useState(isNew ? null : pollId)

  useEffect(() => { if (!isNew) loadPoll() }, [pollId])

  async function loadPoll() {
    setLoading(true)
    const [poll, pollStages] = await Promise.all([getPoll(pollId), getStages(pollId)])
    if (poll) {
      setForm({
        title: poll.title || '', description: poll.description || '',
        startDate: toDatetimeLocal(poll.startDate), endDate: toDatetimeLocal(poll.endDate),
        isActive: poll.isActive ?? true, enableImageZoom: poll.enableImageZoom ?? true,
      })
    }
    setStages(pollStages.length > 0 ? pollStages : [])
    setLoading(false)
  }

  function updateForm(field, value) { setForm(prev => ({ ...prev, [field]: value })) }

  function addStage() {
    setStages(prev => [...prev, {
      id: `new_${uuid()}`, title: '', description: '', order: prev.length,
      maxChoices: 1, cards: [], showVoteCounts: true, isNew: true,
    }])
  }

  function updateStageLocal(index, updated) {
    setStages(prev => { const next = [...prev]; next[index] = updated; return next })
  }

  function removeStageLocal(index) {
    setStages(prev => prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i })))
  }

  function moveStage(index, direction) {
    setStages(prev => {
      const next = [...prev]
      const target = index + direction
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next.map((s, i) => ({ ...s, order: i }))
    })
  }

  function validateForm() {
    if (!form.title.trim()) return 'Enter a poll title'
    if (!form.startDate || !form.endDate) return 'Enter start and end dates'
    if (new Date(form.startDate) >= new Date(form.endDate)) return 'End date must be after start date'
    if (stages.length === 0) return 'Add at least one stage'
    for (const stage of stages) {
      if (!stage.title.trim()) return 'Fill in the title for all stages'
      if (!stage.cards || stage.cards.length === 0) return `Add cards to stage «${stage.title}»`
      if (stage.cards.some(c => !c.title.trim())) return `Fill in all card titles in stage «${stage.title}»`
      if (stage.maxChoices > 0 && stage.maxChoices > stage.cards.length)
        return `Choice limit in stage «${stage.title}» cannot exceed the number of cards`
    }
    return null
  }

  async function handleSave() {
    const err = validateForm()
    if (err) { toast.error(err); return }
    setSaving(true)
    try {
      const pollData = {
        title: form.title.trim(), description: form.description.trim(),
        startDate: new Date(form.startDate), endDate: new Date(form.endDate),
        isActive: form.isActive, enableImageZoom: form.enableImageZoom,
      }
      let activePollId = currentPollId
      if (isNew) { activePollId = await createPoll(pollData); setCurrentPollId(activePollId) }
      else await updatePoll(currentPollId, pollData)

      for (const stage of stages) {
        const stageData = {
          title: stage.title.trim(), description: stage.description?.trim() || '',
          order: stage.order, maxChoices: stage.maxChoices,
          showVoteCounts: stage.showVoteCounts ?? true,
          cards: stage.cards.map(c => ({
            id: c.id, title: c.title.trim(), imageUrl: c.imageUrl || '',
            imagePosition: c.imagePosition || { x: 50, y: 50 },
          })),
        }
        if (stage.isNew) {
          const newStageId = await createStage(activePollId, stageData)
          await initializeStageResults(activePollId, { id: newStageId, ...stageData })
        } else {
          await updateStage(activePollId, stage.id, stageData)
          await initializeStageResults(activePollId, { id: stage.id, ...stageData })
        }
      }

      toast.success(isNew ? 'Poll created' : 'Changes saved')
      navigate(`/admin/polls/${activePollId}`)
      if (isNew) setTimeout(() => window.location.reload(), 500)
    } catch (err) {
      console.error(err)
      toast.error('Save error')
    } finally { setSaving(false) }
  }

  async function handleClearVotes() {
    setClearing(true)
    try {
      await clearPollVotes(currentPollId)
      toast.success('All votes cleared. The poll is ready to go again.')
      setShowClearModal(false)
    } catch (err) {
      console.error(err)
      toast.error('Error clearing votes')
    } finally { setClearing(false) }
  }

  if (loading) return <InlineLoader />

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <button onClick={() => navigate('/admin/polls')} className="btn-ghost text-text-muted mb-2 -ml-3">
            ← Back to list
          </button>
          <h1 className="text-2xl font-bold text-text-primary">
            {isNew ? 'New Poll' : 'Edit Poll'}
          </h1>
        </div>
        <div className="flex gap-3">
          {!isNew && (
            <Button variant="secondary" onClick={() => setShowClearModal(true)}>
              🗑️ Clear Votes
            </Button>
          )}
          <Button onClick={handleSave} loading={saving}>Save</Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic info */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel-lg p-6 space-y-4">
          <h2 className="font-semibold text-text-primary mb-2">Basic Information</h2>
          <Input label="Poll title" value={form.title} onChange={(e) => updateForm('title', e.target.value)} placeholder="e.g. Best character of the season" />
          <Textarea label="Description" value={form.description} onChange={(e) => updateForm('description', e.target.value)}
            placeholder="Brief description shown to voters" rows={3} />
          <div className="grid sm:grid-cols-2 gap-4">
            <DateInput label="Start date" value={form.startDate} onChange={(e) => updateForm('startDate', e.target.value)} />
            <DateInput label="End date" value={form.endDate} onChange={(e) => updateForm('endDate', e.target.value)} />
          </div>
          <Toggle checked={form.isActive} onChange={(v) => updateForm('isActive', v)} label="Poll is open (not manually blocked)" />
          <Toggle checked={form.enableImageZoom} onChange={(v) => updateForm('enableImageZoom', v)} label="Enable image zoom on hover in results" />
        </motion.div>

        {/* Stages */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-text-primary">Voting Stages ({stages.length})</h2>
            <Button variant="secondary" size="sm" onClick={addStage}>+ Add Stage</Button>
          </div>

          {stages.length === 0 ? (
            <div className="glass-panel p-8 text-center">
              <p className="text-text-muted text-sm mb-4">No stages yet</p>
              <Button variant="secondary" size="sm" onClick={addStage}>Add first stage</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {stages.map((stage, i) => (
                <StageEditor key={stage.id} stage={stage} index={i}
                  onChange={(updated) => updateStageLocal(i, updated)}
                  onRemove={() => removeStageLocal(i)}
                  onMoveUp={() => moveStage(i, -1)} onMoveDown={() => moveStage(i, 1)}
                  isFirst={i === 0} isLast={i === stages.length - 1} />
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pb-8">
          <Button onClick={handleSave} loading={saving} size="lg">Save Poll</Button>
        </div>
      </div>

      {/* Clear votes modal */}
      <Modal isOpen={showClearModal} onClose={() => setShowClearModal(false)} title="Clear all votes?" size="sm">
        <p className="text-text-secondary mb-2">
          This will delete all votes and reset all result counters to zero.
        </p>
        <p className="text-text-secondary mb-6">
          The poll itself, stages and cards will remain intact — only the voting data will be wiped.
          Use this to reset a test run before the real vote starts.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setShowClearModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleClearVotes} loading={clearing}>
            Clear all votes
          </Button>
        </div>
      </Modal>
    </div>
  )
}
