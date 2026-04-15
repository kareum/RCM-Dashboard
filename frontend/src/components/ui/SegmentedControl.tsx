/* All / Active / Inactive 같은 세그먼트 탭 필터에 사용 */

interface Option<T extends string> {
  label: string
  value: T
  count?: number
}

interface SegmentedControlProps<T extends string> {
  options:  Option<T>[]
  value:    T
  onChange: (value: T) => void
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="flex gap-1 bg-surface-container rounded p-0.5">
      {options.map((opt) => {
        const isActive = opt.value === value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={[
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-[11px] font-bold transition-all cursor-pointer border-none',
              isActive
                ? 'bg-white shadow-sm text-on-surface'
                : 'text-on-surface-variant hover:text-on-surface bg-transparent',
            ].join(' ')}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span
                className={[
                  'text-[9px] px-1.5 py-0.5 rounded-full font-bold',
                  isActive ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-400',
                ].join(' ')}
              >
                {opt.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
