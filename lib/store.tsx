"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { createSeedOpportunities } from "./seed"
import type {
  AppState,
  EvidenceLevel,
  Interest,
  Opportunity,
  Requirement,
  Stage,
} from "./types"

const STORAGE_KEY = "placementos-state-v1"

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function initialState(): AppState {
  return {
    opportunities: createSeedOpportunities(),
    prepHours: 8,
    allocationOverride: null,
    manualOrder: null,
    followedId: null,
    savedPlan: false,
  }
}

/** Turn a free-text job description into starter requirements to analyze. */
function parseRequirements(description: string): Requirement[] {
  const chunks = description
    .split(/\r?\n|[.•;]|,(?=\s)/)
    .map((c) => c.trim())
    .filter((c) => c.length >= 4 && c.length <= 80)

  const unique = Array.from(new Set(chunks)).slice(0, 6)

  if (unique.length === 0) {
    return [
      { id: makeId(), text: "Core role responsibilities", kind: "must", evidence: "Unclear" },
      { id: makeId(), text: "Relevant tools & technical skills", kind: "must", evidence: "Unclear" },
      { id: makeId(), text: "Communication & collaboration", kind: "preferred", evidence: "Unclear" },
    ]
  }

  return unique.map((text, i) => ({
    id: makeId(),
    text: text.charAt(0).toUpperCase() + text.slice(1),
    kind: i < 3 ? "must" : "preferred",
    evidence: "Unclear" as EvidenceLevel,
  }))
}

export interface NewOpportunityInput {
  company: string
  role: string
  description: string
  stage: Stage
  nextDate: string
  interest: Interest
}

interface StoreValue {
  state: AppState
  addOpportunity: (input: NewOpportunityInput) => string
  updateOpportunity: (id: string, patch: Partial<Opportunity>) => void
  setInterest: (id: string, interest: Interest) => void
  confirmRequirement: (oppId: string, reqId: string) => void
  setPrepHours: (hours: number) => void
  setAllocationOverride: (override: Record<string, number> | null) => void
  setManualOrder: (ids: string[] | null) => void
  followRecommendation: (id: string) => void
  savePlan: () => void
  resetDemo: () => void
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initialState)
  const [hydrated, setHydrated] = useState(false)
  const skipWrite = useRef(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as AppState
        if (parsed && Array.isArray(parsed.opportunities)) {
          setState({ ...initialState(), ...parsed })
        }
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (skipWrite.current) {
      skipWrite.current = false
      return
    }
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* ignore quota errors */
    }
  }, [state, hydrated])

  const addOpportunity = useCallback((input: NewOpportunityInput) => {
    const id = makeId()
    const opp: Opportunity = {
      id,
      company: input.company,
      role: input.role,
      description: input.description,
      stage: input.stage,
      nextDate: input.nextDate,
      interest: input.interest,
      requirements: parseRequirements(input.description),
    }
    setState((s) => ({
      ...s,
      opportunities: [...s.opportunities, opp],
      // adding a new opportunity invalidates any manual ordering
      manualOrder: null,
      allocationOverride: null,
    }))
    return id
  }, [])

  const updateOpportunity = useCallback((id: string, patch: Partial<Opportunity>) => {
    setState((s) => ({
      ...s,
      opportunities: s.opportunities.map((o) => (o.id === id ? { ...o, ...patch } : o)),
    }))
  }, [])

  const setInterest = useCallback((id: string, interest: Interest) => {
    setState((s) => ({
      ...s,
      opportunities: s.opportunities.map((o) => (o.id === id ? { ...o, interest } : o)),
    }))
  }, [])

  const confirmRequirement = useCallback((oppId: string, reqId: string) => {
    setState((s) => ({
      ...s,
      opportunities: s.opportunities.map((o) =>
        o.id === oppId
          ? {
              ...o,
              requirements: o.requirements.map((r) =>
                r.id === reqId ? { ...r, confirmed: true } : r,
              ),
            }
          : o,
      ),
    }))
  }, [])

  const setPrepHours = useCallback((hours: number) => {
    setState((s) => ({ ...s, prepHours: hours, allocationOverride: null, savedPlan: false }))
  }, [])

  const setAllocationOverride = useCallback((override: Record<string, number> | null) => {
    setState((s) => ({ ...s, allocationOverride: override, savedPlan: false }))
  }, [])

  const setManualOrder = useCallback((ids: string[] | null) => {
    setState((s) => ({ ...s, manualOrder: ids }))
  }, [])

  const followRecommendation = useCallback((id: string) => {
    setState((s) => ({ ...s, followedId: id }))
  }, [])

  const savePlan = useCallback(() => {
    setState((s) => ({ ...s, savedPlan: true }))
  }, [])

  const resetDemo = useCallback(() => {
    setState(initialState())
  }, [])

  const value = useMemo<StoreValue>(
    () => ({
      state,
      addOpportunity,
      updateOpportunity,
      setInterest,
      confirmRequirement,
      setPrepHours,
      setAllocationOverride,
      setManualOrder,
      followRecommendation,
      savePlan,
      resetDemo,
    }),
    [
      state,
      addOpportunity,
      updateOpportunity,
      setInterest,
      confirmRequirement,
      setPrepHours,
      setAllocationOverride,
      setManualOrder,
      followRecommendation,
      savePlan,
      resetDemo,
    ],
  )

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Loading PlacementOS…</div>
      </div>
    )
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}
