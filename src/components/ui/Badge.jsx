export function StatusBadge({ status }) {
  const config = {
    active: { label: 'Активно', className: 'badge-success' },
    upcoming: { label: 'Скоро', className: 'badge-warning' },
    ended: { label: 'Завершено', className: 'badge-danger' },
  }

  const { label, className } = config[status] || config.ended

  return (
    <span className={`badge ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  )
}

export function CountBadge({ count, label }) {
  return (
    <span className="badge badge-accent">
      {count} {label}
    </span>
  )
}

export function Tag({ children, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-3 border border-border rounded-lg text-xs text-text-secondary">
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="text-text-muted hover:text-red-400 transition-colors"
        >
          ×
        </button>
      )}
    </span>
  )
}
