export interface SelectInputProps {
  label:    string
  id:       string
  value:    string
  onChange: (v: string) => void
  options:  string[]
}

export function SelectInput({ label, id, value, onChange, options }: SelectInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[11px] text-slate-500">{label}</label>
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-2.5 py-1.5 text-[13px] border border-slate-200 rounded-md bg-white focus:outline-none focus:border-[#185FA5] transition-colors"
      >
        <option value="">Select</option>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  )
}
