import type { ReactNode } from 'react'

export type BadgeVariant = 'active' | 'inactive' | 'paid' | 'denied' | 'pending' | 'rpm' | 'ccm'

interface BadgeProps {
  variant:  BadgeVariant
  children: ReactNode
  dot?:     boolean
}

const styles: Record<BadgeVariant, { bg: string; text: string }> = {
  active:   { bg: '#98f99440', text: '#278631' },   // tertiary-fixed / tertiary-container
  inactive: { bg: '#eae7e7',   text: '#414752' },   // surface-container-high / on-surface-variant
  paid:     { bg: '#98f99440', text: '#278631' },
  denied:   { bg: '#ffdad6',   text: '#93000a' },   // error-container / on-error-container
  pending:  { bg: '#c9e7f7',   text: '#2e4b57' },   // secondary-fixed / on-secondary-fixed-variant
  rpm:      { bg: '#E6F1FB',   text: '#0C447C' },
  ccm:      { bg: '#E1F5EE',   text: '#085041' },
}

export function Badge({ variant, children, dot = false }: BadgeProps) {
  const { bg, text } = styles[variant]
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
      style={{ background: bg, color: text }}
    >
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full flex-shrink-0"
          style={{ background: text }}
        />
      )}
      {children}
    </span>
  )
}
