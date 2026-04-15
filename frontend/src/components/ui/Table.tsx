import type { ReactNode } from 'react'

/* ── TableHeader ─────────────────────────────────────────────
   columns 배열로 헤더 셀을 일괄 렌더링하거나
   children으로 직접 <th> 를 넣을 수 있음
──────────────────────────────────────────────────────────── */
interface Column {
  label:    string
  width?:   string   // Tailwind width class (예: 'w-24')
  align?:   'left' | 'right' | 'center'
}

interface TableHeaderProps {
  columns?:  Column[]
  children?: ReactNode
}

export function TableHeader({ columns, children }: TableHeaderProps) {
  return (
    <thead className="bg-slate-50 border-b border-slate-100">
      <tr>
        {columns
          ? columns.map((col) => (
              <th
                key={col.label}
                className={[
                  'px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest',
                  col.align === 'right'  ? 'text-right'  : '',
                  col.align === 'center' ? 'text-center' : 'text-left',
                  col.width ?? '',
                ].join(' ')}
              >
                {col.label}
              </th>
            ))
          : children}
      </tr>
    </thead>
  )
}

/* ── TableRow ─────────────────────────────────────────────── */
interface TableRowProps {
  children:  ReactNode
  onClick?:  () => void
  selected?: boolean
}

export function TableRow({ children, onClick, selected }: TableRowProps) {
  return (
    <tr
      onClick={onClick}
      className={[
        'border-b border-slate-50 transition-colors',
        onClick ? 'cursor-pointer' : '',
        selected ? 'bg-blue-50/60' : 'hover:bg-slate-50/50',
      ].join(' ')}
    >
      {children}
    </tr>
  )
}

/* ── TableCell ────────────────────────────────────────────── */
interface TableCellProps {
  children:  ReactNode
  align?:    'left' | 'right' | 'center'
  mono?:     boolean
  muted?:    boolean   // on-surface-variant 색상
  className?: string
}

export function TableCell({
  children,
  align,
  mono  = false,
  muted = false,
  className = '',
}: TableCellProps) {
  return (
    <td
      className={[
        'px-5 py-3 text-sm',
        align === 'right'  ? 'text-right'  : '',
        align === 'center' ? 'text-center' : '',
        mono  ? 'font-mono text-xs'         : '',
        muted ? 'text-on-surface-variant'   : 'text-on-surface',
        className,
      ].join(' ')}
    >
      {children}
    </td>
  )
}

/* ── Table (wrapper) ──────────────────────────────────────── */
interface TableProps {
  children:  ReactNode
  className?: string
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-left ${className}`}>
        {children}
      </table>
    </div>
  )
}
