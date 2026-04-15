import { Badge } from '../ui'
import type { Clinic } from '../../data/clinics'

interface ClinicListItemProps {
  clinic:   Clinic
  isActive: boolean
  onClick:  () => void
}

export function ClinicListItem({ clinic, isActive, onClick }: ClinicListItemProps) {
  return (
    <div
      onClick={onClick}
      className={[
        'flex items-center gap-2 px-3 py-3 cursor-pointer transition-colors group',
        'border-r-4',
        isActive ? 'bg-blue-50/80 border-primary' : 'hover:bg-white/60 border-transparent',
        !clinic.active ? 'opacity-50' : '',
      ].join(' ')}
    >
      <span className="text-slate-300 group-hover:text-slate-400 text-base flex-shrink-0 select-none">⠿</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`text-sm truncate ${isActive ? 'font-semibold text-blue-900' : 'font-medium text-slate-700'}`}>
            {clinic.name}
          </span>
          {!clinic.active && <Badge variant="inactive">Inactive</Badge>}
        </div>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <span className={`text-[10px] font-mono ${isActive ? 'text-primary' : 'text-slate-400'}`}>{clinic.code}</span>
          <span className="text-[10px] text-slate-400">·</span>
          <span className={`text-[10px] ${isActive ? 'text-blue-500' : 'text-slate-400'}`}>{clinic.state}</span>
          {clinic.services.map(s => (
            <Badge key={s} variant={s.toLowerCase() as 'rpm' | 'ccm'}>{s}</Badge>
          ))}
        </div>
      </div>
      <span className={`h-2 w-2 rounded-full flex-shrink-0 ${clinic.active ? 'bg-tertiary' : 'bg-slate-300'}`} />
    </div>
  )
}
