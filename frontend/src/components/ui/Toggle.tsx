interface ToggleProps {
  checked:   boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  label?:    string
  hint?:     string
}

export function Toggle({ checked, onChange, disabled = false, label, hint }: ToggleProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={[
          'relative w-8 h-5 rounded-full transition-colors duration-200 flex-shrink-0',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
          'disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer',
          checked ? 'bg-tertiary' : 'bg-slate-300',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200',
            checked ? 'translate-x-3.5' : 'translate-x-0.5',
          ].join(' ')}
        />
      </button>

      {(label || hint) && (
        <div>
          {label && <p className="text-sm text-on-surface">{label}</p>}
          {hint  && <p className="text-[10px] text-slate-400">{hint}</p>}
        </div>
      )}
    </div>
  )
}
