import { useState } from 'react'
import { motion } from 'framer-motion'
import { CardEditor } from './CardEditor'
import { Input, NumberInput, Textarea, Toggle } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function StageEditor({ stage, index, onChange, onRemove, onMoveUp, onMoveDown, isFirst, isLast }) {
  const [expanded, setExpanded] = useState(true)

  function updateField(field, value) {
    onChange({ ...stage, [field]: value })
  }

  const cardCount = stage.cards?.length || 0
  const maxChoices = stage.maxChoices ?? 1
  const isUnlimited = maxChoices === 0
  const isValid = stage.title && cardCount > 0 && (isUnlimited || maxChoices <= cardCount)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel-lg overflow-hidden"
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center text-accent font-bold text-sm flex-shrink-0">
          {index + 1}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-text-primary truncate">
            {stage.title || `Этап ${index + 1}`}
          </p>
          <p className="text-xs text-text-muted">
            {cardCount} {cardCount === 1 ? 'карточка' : 'карточек'} · максимум выбора: {isUnlimited ? 'без ограничений' : maxChoices}
          </p>
        </div>

        {!isValid && (
          <span className="badge badge-warning text-xs">Не заполнено</span>
        )}

        {stage.showVoteCounts === false && (
          <span className="badge text-xs bg-surface-3 text-text-muted border border-border">
            🙈 Голоса скрыты
          </span>
        )}

        {/* Reorder controls */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-3 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-3 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          className="p-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>

        <svg
          className={`w-5 h-5 text-text-muted transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Body */}
      {expanded && (
        <div className="px-5 pb-5 pt-1 border-t border-border space-y-4">
          <div className="grid sm:grid-cols-[1fr_140px] gap-4 pt-4">
            <Input
              label="Название этапа"
              value={stage.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Например: Лучший персонаж"
            />
            <NumberInput
              label="Максимум выбора"
              value={maxChoices}
              min={0}
              max={cardCount}
              hint="0 = можно выбрать сколько угодно"
              onChange={(e) => updateField('maxChoices', parseInt(e.target.value, 10) || 0)}
            />
          </div>

          <Textarea
            label="Описание (необязательно)"
            value={stage.description || ''}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Краткое описание этапа голосования"
            rows={2}
          />

          <div className="glass-panel p-4">
            <Toggle
              checked={stage.showVoteCounts ?? true}
              onChange={(v) => updateField('showVoteCounts', v)}
              label="Показывать количество голосов на странице результатов"
            />
            <p className="text-xs text-text-muted mt-2 ml-14">
              Если выключено, пользователи увидят только процентное соотношение и рейтинг — без точных чисел голосов. Полные цифры всегда доступны вам в разделе «Статистика».
            </p>
          </div>

          <div>
            <label className="label">Карточки</label>
            <CardEditor
              cards={stage.cards || []}
              onChange={(cards) => updateField('cards', cards)}
            />
          </div>
        </div>
      )}
    </motion.div>
  )
}
