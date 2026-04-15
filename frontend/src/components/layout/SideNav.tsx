import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { label: 'Main Dashboard',      icon: 'monitoring',      to: '/'        },
  { label: 'Clinic Settings',     icon: 'medical_services', to: '/clinics' },
  { label: 'Billing & Settlement',icon: 'receipt_long',    to: '/billing' },
] as const

interface SideNavProps {
  userName?: string
  userRole?: string
  userInitials?: string
}

export function SideNav({
  userName     = 'Areum Kim',
  userRole     = 'Administrator',
  userInitials = 'AR',
}: SideNavProps) {
  return (
    <aside className="bg-slate-900 h-screen w-64 fixed left-0 top-0 shadow-2xl flex flex-col z-50">
      {/* 로고 */}
      <div className="px-6 py-8">
        <h1 className="text-xl font-bold tracking-tighter text-white">
          Hicare Inc.
        </h1>
        <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-1 font-semibold">
          RCM Dashboard
        </p>
      </div>

      {/* 내비게이션 */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV_ITEMS.map(({ label, icon, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-4 py-3 transition-all duration-200',
                isActive
                  ? 'text-white bg-blue-600/20 border-r-4 border-blue-500'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-sm',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`material-symbols-outlined text-[22px] ${isActive ? 'text-blue-400 icon-filled' : ''}`}
                >
                  {icon}
                </span>
                <span className={`text-sm ${isActive ? 'font-semibold' : ''}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* 유저 프로필 */}
      <div className="p-4 mt-auto">
        <div className="flex items-center gap-3 px-2">
          <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
            {userInitials}
          </div>
          <div>
            <p className="text-xs font-bold text-white">{userName}</p>
            <p className="text-[10px] text-slate-500">{userRole}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
