import type { ReactNode } from 'react'
import { SectionLabel } from './Typography'
import type { TextColor } from './Typography'

/* ── CardHeader ──────────────────────────────────────────────
   시안 조정 포인트:
     titleColor — 섹션 제목 색상 (기본 'default' = #1b1c1c)
     headerBg   — 헤더 배경 Tailwind 클래스 (기본 'bg-slate-50')
     iconColor  — 아이콘 색상 클래스 (기본 'text-primary')
──────────────────────────────────────────────────────────── */
interface CardHeaderProps {
  icon?:        string
  title:        string
  badge?:       ReactNode
  titleColor?:  TextColor
  headerBg?:    string      // Tailwind bg 클래스
  iconColor?:   string      // Tailwind text 클래스
}

export function CardHeader({
  icon,
  title,
  badge,
  titleColor = 'default',
  headerBg   = 'bg-slate-50',
  iconColor  = 'text-primary',
}: CardHeaderProps) {
  return (
    <div
      className={`px-6 py-4 border-b border-slate-100 flex items-center justify-between ${headerBg}`}
    >
      <div className="flex items-center gap-2">
        {icon && (
          <span className={`material-symbols-outlined text-lg ${iconColor}`}>
            {icon}
          </span>
        )}
        <SectionLabel color={titleColor}>{title}</SectionLabel>
      </div>
      {badge && <div>{badge}</div>}
    </div>
  )
}

/* ── CardBody ─────────────────────────────────────────────── */
interface CardBodyProps {
  children:   ReactNode
  className?: string
  padding?:   'none' | 'sm' | 'md' | 'lg'
}

const paddingClass = {
  none: 'p-0',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
}

export function CardBody({ children, className = '', padding = 'md' }: CardBodyProps) {
  return (
    <div className={`${paddingClass[padding]} ${className}`}>
      {children}
    </div>
  )
}

/* ── Card ─────────────────────────────────────────────────── */
interface CardProps {
  children:   ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}
    >
      {children}
    </div>
  )
}
