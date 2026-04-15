import { useEffect } from 'react'

type ToastVariant = 'success' | 'error' | 'info'

interface ToastProps {
  message:   string
  variant?:  ToastVariant
  visible:   boolean
  onClose:   () => void
  duration?: number   // ms, 기본 2800
}

const config: Record<ToastVariant, { icon: string; iconColor: string }> = {
  success: { icon: 'check_circle', iconColor: 'text-tertiary-fixed'   },
  error:   { icon: 'error',        iconColor: 'text-red-400'           },
  info:    { icon: 'info',         iconColor: 'text-blue-300'          },
}

export function Toast({
  message,
  variant  = 'success',
  visible,
  onClose,
  duration = 2800,
}: ToastProps) {
  useEffect(() => {
    if (!visible) return
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [visible, duration, onClose])

  if (!visible) return null

  const { icon, iconColor } = config[variant]

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900 text-white text-sm rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
      <span className={`material-symbols-outlined text-base ${iconColor}`}>{icon}</span>
      <span>{message}</span>
    </div>
  )
}
