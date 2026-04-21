export interface MoneyInputProps {
  label:    string
  id:       string
  value:    string
  onChange: (v: string) => void
  hint?:    string
}

export function MoneyInput({ label, id, value, onChange, hint }: MoneyInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[11px] text-slate-500">{label}</label>
      <div className="relative">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[13px] pointer-events-none">$</span>
        <input
          id={id}
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full pl-5 pr-2.5 py-1.5 text-[13px] border border-slate-200 rounded-md bg-white focus:outline-none focus:border-[#185FA5] transition-colors"
        />
      </div>
      {hint && <p className="text-[10px] text-slate-400">{hint}</p>}
    </div>
  )
}
