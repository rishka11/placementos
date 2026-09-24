export type Stage =
  | "Applied"
  | "Phone screen"
  | "Take-home task"
  | "Final interview"
  | "Offer"

export const STAGES: Stage[] = [
  "Applied",
  "Phone screen",
  "Take-home task",
  "Final interview",
  "Offer",
]

export type Interest = "High" | "Medium" | "Low"

export type EvidenceMatch = "Strong" | "Medium" | "Weak"

export type EvidenceLevel = "Strong" | "Some" | "Weak" | "None" | "Unclear"

export type RequirementKind = "must" | "preferred"

export interface Requirement {
  id: string
  text: string
  kind: RequirementKind
  /** Evidence level pulled from the user's resume/profile signals. */
  evidence: EvidenceLevel
  /** For "Unclear" requirements the user can confirm they meet it. */
  confirmed?: boolean
}

export interface Opportunity {
  id: string
  company: string
  role: string
  description: string
  stage: Stage
  /** ISO date string of the next important date. */
  nextDate: string
  interest: Interest
  /** Optional prep focus label; derived when absent. */
  prepFocus?: string
  requirements: Requirement[]
}

export interface AppState {
  opportunities: Opportunity[]
  /** Available preparation time for the week, in hours. */
  prepHours: number
  /** Manual per-opportunity hour overrides keyed by id. */
  allocationOverride: Record<string, number> | null
  /** Manual priority ordering (opportunity ids) that overrides the computed order. */
  manualOrder: string[] | null
  /** Id of the opportunity the user committed to following. */
  followedId: string | null
  savedPlan: boolean
}
