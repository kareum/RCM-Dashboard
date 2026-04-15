import type { ReactNode } from 'react'

/* ── 색상 팔레트 (시안 조정용) ───────────────────────────────
   여기서 variant별 색상만 바꾸면 앱 전체에 반영된다.
──────────────────────────────────────────────────────────── */
// eslint-disable-next-line react-refresh/only-export-components
export const textColors = {
  default:   'text-on-surface',           // #1b1c1c
  muted:     'text-on-surface-variant',   // #414752
  primary:   'text-primary',              // #005dac
  inverse:   'text-white',
  error:     'text-on-error-container',
  success:   'text-tertiary-container',
} as const

export type TextColor = keyof typeof textColors

/* ── PageTitle ──────────────────────────────────────────────
   TopNav 좌측 페이지 이름 (예: "Clinic Settings")
──────────────────────────────────────────────────────────── */
interface PageTitleProps {
  children: ReactNode
  color?:   TextColor
}
export function PageTitle({ children, color = 'default' }: PageTitleProps) {
  return (
    <span className={`text-lg font-semibold ${textColors[color]}`}>
      {children}
    </span>
  )
}

/* ── SectionLabel ───────────────────────────────────────────
   카드 헤더 제목 (예: "BASIC INFORMATION")
   size: 'xs'=10px(기본), 'sm'=11px, 'md'=12px
──────────────────────────────────────────────────────────── */
type LabelSize = 'xs' | 'sm' | 'md'

interface SectionLabelProps {
  children:  ReactNode
  color?:    TextColor
  size?:     LabelSize
  uppercase?: boolean
}

const labelSizeClass: Record<LabelSize, string> = {
  xs: 'text-[10px]',
  sm: 'text-[11px]',
  md: 'text-xs',
}

export function SectionLabel({
  children,
  color    = 'default',
  size     = 'xs',
  uppercase = true,
}: SectionLabelProps) {
  return (
    <h3
      className={[
        'font-bold tracking-widest',
        labelSizeClass[size],
        textColors[color],
        uppercase ? 'uppercase' : '',
      ].join(' ')}
    >
      {children}
    </h3>
  )
}

/* ── FieldLabel ─────────────────────────────────────────────
   입력 필드 위 레이블 (예: "CLINIC NAME · Box 25")
──────────────────────────────────────────────────────────── */
interface FieldLabelProps {
  children: ReactNode
  color?:   TextColor
  sub?:     ReactNode   // 우측에 붙는 보조 텍스트 (Box 번호 등)
}
export function FieldLabel({ children, color = 'muted', sub }: FieldLabelProps) {
  return (
    <label
      className={[
        'text-[10px] font-bold uppercase tracking-widest block',
        textColors[color],
      ].join(' ')}
    >
      {children}
      {sub && (
        <span className="text-slate-300 font-normal normal-case tracking-normal ml-1.5">
          {sub}
        </span>
      )}
    </label>
  )
}

/* ── FieldValue ─────────────────────────────────────────────
   읽기 전용 값 표시 (원서버 동기화 데이터)
──────────────────────────────────────────────────────────── */
interface FieldValueProps {
  children:  ReactNode
  mono?:     boolean
  size?:     'sm' | 'md' | 'lg'   // sm=12px, md=13px(기본), lg=18px
}

const valueSizeClass = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-lg font-bold',
}

export function FieldValue({ children, mono = false, size = 'md' }: FieldValueProps) {
  return (
    <div
      className={[
        'bg-surface-container-low text-on-surface px-2.5 py-2 rounded-lg',
        valueSizeClass[size],
        mono ? 'font-mono' : '',
      ].join(' ')}
    >
      {children}
    </div>
  )
}

/* ── HintText ───────────────────────────────────────────────
   필드 아래 보조 설명
──────────────────────────────────────────────────────────── */
export function HintText({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{children}</p>
  )
}
