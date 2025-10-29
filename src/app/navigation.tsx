import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { SCREENS } from './screen'
import type { Screen } from './screen'

type Entry = { name: Screen; params?: unknown }

type Navigation = {
  screen: Screen
  params?: unknown
  navigate: (name: Screen, params?: unknown) => void
  replace: (name: Screen, params?: unknown) => void
  back: () => void
  reset: (name: Screen, params?: unknown) => void
}

const NavigationContext = createContext<Navigation | null>(null)

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [stack, setStack] = useState<Entry[]>([{ name: SCREENS.MAIN_MENU }])
  const top = stack[stack.length - 1]

  const navigate = useCallback(
    (name: Screen, params?: unknown) => setStack(s => [...s, { name, params }]),
    [],
  )
  const replace = useCallback(
    (name: Screen, params?: unknown) =>
      setStack(s => [...s.slice(0, -1), { name, params }]),
    [],
  )
  const back = useCallback(() => setStack(s => (s.length > 1 ? s.slice(0, -1) : s)), [])
  const reset = useCallback(
    (name: Screen, params?: unknown) => setStack([{ name, params }]),
    [],
  )

  const value = useMemo(
    () => ({ screen: top.name, params: top.params, navigate, replace, back, reset }),
    [top, navigate, replace, back, reset],
  )

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>
}

export function useNavigation() {
  const ctx = useContext(NavigationContext)
  if (!ctx) throw new Error('useNavigation must be used within NavigationProvider')
  return ctx
}

