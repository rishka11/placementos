"use client"

import { createContext, useCallback, useContext, useMemo, useState } from "react"

export type Screen =
  | "dashboard"
  | "add"
  | "analysis"
  | "compare"
  | "allocation"
  | "recommendation"

interface NavValue {
  screen: Screen
  selectedId: string | null
  navigate: (screen: Screen, id?: string | null) => void
  toast: string | null
  showToast: (message: string) => void
}

const NavContext = createContext<NavValue | null>(null)

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreen] = useState<Screen>("dashboard")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const navigate = useCallback((next: Screen, id: string | null = null) => {
    setScreen(next)
    if (id !== undefined) setSelectedId(id)
    if (typeof window !== "undefined") window.scrollTo({ top: 0 })
  }, [])

  const showToast = useCallback((message: string) => {
    setToast(message)
    window.clearTimeout((showToast as unknown as { _t?: number })._t)
    ;(showToast as unknown as { _t?: number })._t = window.setTimeout(
      () => setToast(null),
      2600,
    )
  }, [])

  const value = useMemo<NavValue>(
    () => ({ screen, selectedId, navigate, toast, showToast }),
    [screen, selectedId, navigate, toast, showToast],
  )

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>
}

export function useNav(): NavValue {
  const ctx = useContext(NavContext)
  if (!ctx) throw new Error("useNav must be used within NavProvider")
  return ctx
}
