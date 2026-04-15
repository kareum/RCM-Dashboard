interface Tab {
  key:   string
  label: string
}

interface NavTabsProps {
  tabs:      Tab[]
  active:    string
  onChange:  (key: string) => void
  className?: string
}

export function NavTabs({ tabs, active, onChange, className = '' }: NavTabsProps) {
  return (
    <div className={`flex border-b border-slate-100 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={[
            'px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px',
            'bg-transparent border-l-0 border-r-0 border-t-0 cursor-pointer',
            active === tab.key
              ? 'text-[#0C447C] border-[#185FA5]'
              : 'text-slate-500 border-transparent hover:text-slate-800',
          ].join(' ')}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
