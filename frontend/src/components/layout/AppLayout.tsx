import { Outlet } from 'react-router-dom'
import { SideNav } from './SideNav'
import { TopNav }  from './TopNav'
import { TopNavActionsProvider, useTopNavActions } from './TopNavActionsContext'

/* ── AppLayout ───────────────────────────────────────────────
   SideNav + TopNav 는 항상 고정.
   <Outlet /> 자리에 현재 라우트의 페이지 컴포넌트가 렌더링된다.

   /           → DashboardPage
   /clinics    → ClinicSettingsPage
   /billing    → BillingPage
──────────────────────────────────────────────────────────── */
function AppLayoutInner() {
  const { actions } = useTopNavActions()
  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* 좌측 — 항상 고정 */}
      <SideNav />

      {/* 우측 — TopNav + 콘텐츠 */}
      <div className="ml-64 flex flex-col flex-1 overflow-hidden">
        <TopNav actions={actions} />

        {/* 여기만 라우트에 따라 바뀐다 */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export function AppLayout() {
  return (
    <TopNavActionsProvider>
      <AppLayoutInner />
    </TopNavActionsProvider>
  )
}
