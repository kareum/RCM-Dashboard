import type { ReactNode } from 'react'

interface ModalProps {
  open:       boolean
  onClose:    () => void
  title:      string
  subtitle?:  string
  children:   ReactNode
  footer?:    ReactNode
  size?:      'sm' | 'md' | 'lg'
}

const sizeClass = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pl-64 py-8">
      {/* Backdrop — Glassmorphic (design-tokens: surface-variant 70% + blur) */}
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={[
          'relative bg-white rounded-xl shadow-2xl w-full mx-4',
          'flex flex-col max-h-[90vh]',
          sizeClass[size],
        ].join(' ')}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header — 항상 고정 */}
        <div className="flex-shrink-0 px-6 py-5 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h3 id="modal-title" className="text-base font-bold text-slate-900">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer bg-transparent border-none p-0 mt-0.5"
            aria-label="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body — 콘텐츠가 길면 이 영역만 스크롤 */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {/* Footer — 항상 고정 */}
        {footer && (
          <div className="flex-shrink-0 px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
