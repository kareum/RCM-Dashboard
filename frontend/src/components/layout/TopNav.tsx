import { type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { CompanyInfo } from './CompanyInfo'

interface TabItem {
  label: string
  to:    string
}

interface TopNavProps {
  title?:   string
  tabs?:    TabItem[]
  actions?: ReactNode
}

export function TopNav({ title, tabs, actions }: TopNavProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white flex items-center justify-between px-8 py-4 border-b border-slate-100">
      {/* 좌측: 타이틀 + 검색 */}
      <div className="flex items-center gap-8">
        {title && <span className="text-lg font-semibold text-slate-900">{title}</span>}
        <div className="relative w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            search
          </span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
            placeholder="Global search..."
            type="text"
          />
        </div>
      </div>

      {/* 우측: 탭 + 아이콘 액션 */}
      <div className="flex items-center gap-6">
        {tabs && (
          <nav className="flex gap-6 text-sm font-medium">
            {tabs.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                end
                className={({ isActive }) =>
                  isActive
                    ? 'text-blue-700 border-b-2 border-blue-700 pb-2'
                    : 'text-slate-500 hover:text-slate-900 transition-colors pb-2'
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        )}

        {(tabs || actions) && (
          <div className="h-4 w-px bg-slate-200" />
        )}

        <div className="flex items-center gap-4 text-slate-500">
          {actions}
          <CompanyInfo />
          <button className="material-symbols-outlined hover:text-blue-600 transition-colors cursor-pointer bg-transparent border-none p-0">
            help_outline
          </button>
        </div>
      </div>
    </header>
  )
}
