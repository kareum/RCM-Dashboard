type SpinnerSize = 'sm' | 'md' | 'lg'

interface SpinnerProps {
  size?:  SpinnerSize
  label?: string        // 스크린 리더용 텍스트
}

const sizeClass: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-[3px]',
}

export function Spinner({ size = 'md', label = 'Loading...' }: SpinnerProps) {
  return (
    <span role="status" aria-label={label} className="inline-flex items-center justify-center">
      <span
        className={[
          'rounded-full border-slate-200 border-t-primary animate-spin',
          sizeClass[size],
        ].join(' ')}
      />
      <span className="sr-only">{label}</span>
    </span>
  )
}
