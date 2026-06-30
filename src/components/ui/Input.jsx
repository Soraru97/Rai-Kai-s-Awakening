import { forwardRef } from 'react'

export const Input = forwardRef(function Input({
  label,
  error,
  hint,
  className = '',
  ...props
}, ref) {
  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <input
        ref={ref}
        className={`input-field ${error ? 'border-red-500 focus:border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-text-muted">{hint}</p>}
    </div>
  )
})

export const Textarea = forwardRef(function Textarea({
  label,
  error,
  hint,
  rows = 4,
  className = '',
  ...props
}, ref) {
  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <textarea
        ref={ref}
        rows={rows}
        className={`input-field resize-none ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-text-muted">{hint}</p>}
    </div>
  )
})

export function DateInput({ label, error, ...props }) {
  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <input
        type="datetime-local"
        className={`input-field ${error ? 'border-red-500' : ''} [color-scheme:dark]`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  )
}

export function NumberInput({ label, error, hint, min = 1, max = 50, ...props }) {
  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <input
        type="number"
        min={min}
        max={max}
        className={`input-field ${error ? 'border-red-500' : ''}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-text-muted">{hint}</p>}
    </div>
  )
}

export function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={`w-11 h-6 rounded-full transition-colors duration-200 ${
            checked ? 'bg-accent' : 'bg-surface-4'
          }`}
        />
        <div
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </div>
      {label && <span className="text-sm text-text-primary">{label}</span>}
    </label>
  )
}
