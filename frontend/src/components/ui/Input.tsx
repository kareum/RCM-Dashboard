import type { InputHTMLAttributes, ReactNode } from 'react'

/* ── TextInput ───────────────────────────────────────────────
   variant:
     default   — 일반 입력 (흰 배경, 포커스 시 파란 테두리)
     readonly  — 읽기 전용 표시 (surface-container-low 배경)
     search    — 좌측 돋보기 아이콘 포함
──────────────────────────────────────────────────────────── */
type InputVariant = 'default' | 'readonly' | 'search'

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?:   InputVariant
  label?:     string
  hint?:      string
  error?:     string
  leftIcon?:  ReactNode
  mono?:      boolean
}

export function TextInput({
  variant   = 'default',
  label,
  hint,
  error,
  leftIcon,
  mono      = false,
  className = '',
  ...props
}: TextInputProps) {
  const isReadonly = variant === 'readonly'

  const inputBase = [
    'w-full text-sm rounded transition-all outline-none',
    mono ? 'font-mono text-xs' : '',
    leftIcon ? 'pl-9' : 'px-3',
    'py-2',
  ]

  const inputVariant = isReadonly
    ? 'bg-surface-container-low text-on-surface cursor-default border-none'
    : 'bg-white border border-outline-variant/40 focus:border-primary/60 focus:ring-2 focus:ring-primary/10'

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {leftIcon}
          </span>
        )}
        <input
          className={[...inputBase, inputVariant].join(' ')}
          readOnly={isReadonly}
          {...props}
        />
      </div>
      {hint && !error && (
        <p className="text-[10px] text-slate-400">{hint}</p>
      )}
      {error && (
        <p className="text-[10px] text-on-error-container">{error}</p>
      )}
    </div>
  )
}
