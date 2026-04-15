import { createContext, useContext, useState, type ReactNode } from 'react'

interface TopNavActionsContextType {
  actions: ReactNode
  setActions: (actions: ReactNode) => void
}

const TopNavActionsContext = createContext<TopNavActionsContextType>({
  actions: null,
  setActions: () => {},
})

export function TopNavActionsProvider({ children }: { children: ReactNode }) {
  const [actions, setActions] = useState<ReactNode>(null)
  return (
    <TopNavActionsContext.Provider value={{ actions, setActions }}>
      {children}
    </TopNavActionsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTopNavActions() {
  return useContext(TopNavActionsContext)
}
