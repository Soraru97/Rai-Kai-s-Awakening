import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  getPoll, createPoll, updatePoll,
  getStages, createStage, updateStage, deleteStage,
} from '@/services/pollService'
import { initializeStageResults } from '@/services/voteService'
import { Input, Textarea, DateInput, Toggle } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
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

  const [form, setForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    isActive: true,
    enableImageZoom: true,
  })

  const [stages, setStages] = useState([])
  const [currentPollId, setCurrentPollId] = useState(isNew ? null : pollId)

  useEffect(() => {
    if (!isNew) loadPoll()
  }, [pollId])

  async function loadPoll() {
    setLoading(true)
    const [poll, pollStages] = await Promise.all([
      getPoll(pollId),
      getStages(pollId),
    ])

    if (poll) {
      setForm({
        title: poll.title || '',
        description: poll.description || '',
        startDate: toDatetimeLocal(poll.startDate),
        endDate: toDatetimeLocal(poll.endDate),
        isActive: poll.isActive ?? true,
        enableImageZoom: poll.enableImageZoom ?? true,
      })
    }

    setStages(pollStages.length > 0 ? pollStages : [])
    setLoading(false)
  }

  function updateForm(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function addStage() {
    setStages(prev => [...prev, {
      id: `new_${uuid()}`,
      title: '',
      description: '',
      order: prev.length,
      maxChoices: 1,
      cards: [],
      isNew: true,
    }])
  }

  function updateStageLocal(index, updated) {
    setStages(prev => {
      const next = [...prev]
      next[index] = updated
      return next
    })
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
    if (!form.title.trim()) return 'Укажите название голосования'
    if (!form.startDate || !form.endDate) return 'Укажите даты начала и окончания'
    if (new Date(form.startDate) >= new Date(form.endDate)) return 'Дата окончания должна быть позже даты начала'
    if (stages.length === 0) return 'Добавьте хотя бы один этап'

    for (const stage of stages) {
      if (!stage.title.trim()) return `Заполните название для всех этапов`
      if (!stage.cards || stage.cards.length === 0) return `Добавьте карточки в этап «${stage.title}»`
      if (stage.cards.some(c => !c.title.trim())) return `Заполните названия всех карточек в этапе «${stage.title}»`
      if (stage.maxChoices > stage.cards.length) return `Лимит выбора в этапе «${stage.title}» не может превышать количество карточек`
    }

    return null
  }

  async function handleSave() {
    const validationError = validateForm()
    if (validationError) {
      toast.error(validationError)
      return
    }

    setSaving(true)
    try {
      const pollData = {
        title: form.title.trim(),
        description: form.description.trim(),
        startDate: new Date(form.startDate),
        endDate: new Date(form.endDate),
        isActive: form.isActive,
        enableImageZoom: form.enableImageZoom,
      }

      let activePollId = currentPollId

      if (isNew) {
        activePollId = await createPoll(pollData)
        setCurrentPollId(activePollId)
      } else {
        await updatePoll(currentPollId, pollData)
      }

      // Save stages
      for (const stage of stages) {
        const stageData = {
          title: stage.title.trim(),
          description: stage.description?.trim() || '',
          order: stage.order,
          maxChoices: stage.maxChoices,
          showVoteCounts: stage.showVoteCounts ?? true,
          cards: stage.cards.map(c => ({
            id: c.id,
            title: c.title.trim(),
            imageUrl: c.imageUrl || '',
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

      toast.success(isNew ? 'Голосование создано' : 'Изменения сохранены')
      navigate(`/admin/polls/${activePollId}`)

      if (isNew) {
        // Reload to get fresh stage IDs
        setTimeout(() => window.location.reload(), 500)
      }
    } catch (err) {
      console.error(err)
      toast.error('Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <InlineLoader />

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <button onClick={() => navigate('/admin/polls')} className="btn-ghost text-text-muted mb-2 -ml-3">
            ← К списку
          </button>
          <h1 className="text-2xl font-bold text-text-primary">
            {isNew ? 'Новое голосование' : 'Редактирование голосования'}
          </h1>
        </div>
        <Button onClick={handleSave} loading={saving}>
          Сохранить
        </Button>
      </div>

      <div className="space-y-6">
        {/* Basic info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel-lg p-6 space-y-4"
        >
          <h2 className="font-semibold text-text-primary mb-2">Основная информация</h2>

          <Input
            label="Название голосования"
            value={form.title}
            onChange={(e) => updateForm('title', e.target.value)}
            placeholder="Например: Лучший игрок сезона"
          />

          <Textarea
            label="Описание"
            value={form.description}
            onChange={(e) => updateForm('description', e.target.value)}
            placeholder="Краткое описание голосования для пользователей"
            rows={3}
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <DateInput
              label="Дата начала"
              value={form.startDate}
              onChange={(e) => updateForm('startDate', e.target.value)}
            />
            <DateInput
              label="Дата окончания"
              value={form.endDate}
              onChange={(e) => updateForm('endDate', e.target.value)}
            />
          </div>

          <Toggle
            checked={form.isActive}
            onChange={(v) => updateForm('isActive', v)}
            label="Голосование открыто (не заблокировано вручную)"
          />

          <Toggle
            checked={form.enableImageZoom}
            onChange={(v) => updateForm('enableImageZoom', v)}
            label="Увеличение изображений при наведении на странице результатов"
          />
        </motion.div>

        {/* Stages */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-text-primary">
              Этапы голосования ({stages.length})
            </h2>
            <Button variant="secondary" size="sm" onClick={addStage}>
              + Добавить этап
            </Button>
          </div>

          {stages.length === 0 ? (
            <div className="glass-panel p-8 text-center">
              <p className="text-text-muted text-sm mb-4">Ещё нет этапов голосования</p>
              <Button variant="secondary" size="sm" onClick={addStage}>
                Добавить первый этап
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {stages.map((stage, i) => (
                <StageEditor
                  key={stage.id}
                  stage={stage}
                  index={i}
                  onChange={(updated) => updateStageLocal(i, updated)}
                  onRemove={() => removeStageLocal(i)}
                  onMoveUp={() => moveStage(i, -1)}
                  onMoveDown={() => moveStage(i, 1)}
                  isFirst={i === 0}
                  isLast={i === stages.length - 1}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pb-8">
          <Button onClick={handleSave} loading={saving} size="lg">
            Сохранить голосование
          </Button>
        </div>
      </div>
    </div>
  )
}
