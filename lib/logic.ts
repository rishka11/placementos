import type {
  AppState,
  EvidenceLevel,
  EvidenceMatch,
  Interest,
  Opportunity,
  Requirement,
  Stage,
} from "./types"

/* ------------------------------------------------------------------ */
/* Dates                                                               */
/* ------------------------------------------------------------------ */

export function daysUntil(iso: string): number {
  const target = new Date(iso + "T00:00:00")
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - now.getTime()) / 86_400_000)
}

export function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00")
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function urgencyLabel(iso: string): "High" | "Medium" | "Low" {
  const d = daysUntil(iso)
  if (d <= 3) return "High"
  if (d <= 8) return "Medium"
  return "Low"
}

export function relativeDay(iso: string): string {
  const d = daysUntil(iso)
  if (d < 0) return `${Math.abs(d)} day${Math.abs(d) === 1 ? "" : "s"} ago`
  if (d === 0) return "today"
  if (d === 1) return "tomorrow"
  return `in ${d} days`
}

/* ------------------------------------------------------------------ */
/* Evidence                                                            */
/* ------------------------------------------------------------------ */

export function evidenceValue(req: Requirement): number {
  switch (req.evidence) {
    case "Strong":
      return 1
    case "Some":
      return 0.5
    case "Weak":
      return 0.2
    case "Unclear":
      return req.confirmed ? 1 : 0.3
    case "None":
      return 0
    default:
      return 0
  }
}

export function isStrong(req: Requirement): boolean {
  return req.evidence === "Strong" || (req.evidence === "Unclear" && !!req.confirmed)
}

export interface Coverage {
  strong: number
  total: number
  ratio: number
}

export function evidenceCoverage(opp: Opportunity): Coverage {
  const total = opp.requirements.length
  const strong = opp.requirements.filter(isStrong).length
  const value = opp.requirements.reduce((s, r) => s + evidenceValue(r), 0)
  return { strong, total, ratio: total === 0 ? 0 : value / total }
}

export function evidenceMatch(opp: Opportunity): EvidenceMatch {
  const { ratio } = evidenceCoverage(opp)
  if (ratio >= 0.7) return "Strong"
  if (ratio >= 0.45) return "Medium"
  return "Weak"
}

/** The most actionable must-have gap: None > Weak > unconfirmed Unclear. */
export function criticalGap(opp: Opportunity): Requirement | null {
  const musts = opp.requirements.filter((r) => r.kind === "must")
  return (
    musts.find((r) => r.evidence === "None") ??
    musts.find((r) => r.evidence === "Weak") ??
    musts.find((r) => r.evidence === "Unclear" && !r.confirmed) ??
    null
  )
}

export function mustHaveGapCount(opp: Opportunity): number {
  return opp.requirements.filter(
    (r) =>
      r.kind === "must" &&
      (r.evidence === "None" ||
        r.evidence === "Weak" ||
        (r.evidence === "Unclear" && !r.confirmed)),
  ).length
}

/* ------------------------------------------------------------------ */
/* Prioritization                                                      */
/* ------------------------------------------------------------------ */

const STAGE_WEIGHT: Record<Stage, number> = {
  Applied: 1,
  "Phone screen": 2,
  "Take-home task": 3,
  "Final interview": 4,
  Offer: 5,
}

const INTEREST_WEIGHT: Record<Interest, number> = {
  High: 3,
  Medium: 2,
  Low: 1,
}

function urgencyScore(iso: string): number {
  const d = daysUntil(iso)
  if (d <= 2) return 4
  if (d <= 5) return 3
  if (d <= 10) return 2
  if (d <= 20) return 1
  return 0.5
}

export function priorityScore(opp: Opportunity): number {
  const urgency = urgencyScore(opp.nextDate)
  const stage = STAGE_WEIGHT[opp.stage]
  const evidence = evidenceCoverage(opp).ratio * 3
  const interest = INTEREST_WEIGHT[opp.interest]
  const gaps = mustHaveGapCount(opp)
  return urgency * 2 + stage * 1.5 + evidence * 1.5 + interest - gaps * 0.5
}

export interface RankedOpportunity {
  opp: Opportunity
  rank: number
  label: string
  score: number
}

function rankLabel(rank: number): string {
  if (rank === 1) return "Focus now"
  if (rank === 2) return "Next"
  return "Monitor"
}

export function getRanked(state: AppState): RankedOpportunity[] {
  const byScore = [...state.opportunities].sort(
    (a, b) => priorityScore(b) - priorityScore(a),
  )

  let ordered = byScore
  if (state.manualOrder && state.manualOrder.length) {
    const index = new Map(state.manualOrder.map((id, i) => [id, i]))
    ordered = [...state.opportunities].sort((a, b) => {
      const ai = index.has(a.id) ? (index.get(a.id) as number) : Infinity
      const bi = index.has(b.id) ? (index.get(b.id) as number) : Infinity
      if (ai === bi) return priorityScore(b) - priorityScore(a)
      return ai - bi
    })
  }

  return ordered.map((opp, i) => ({
    opp,
    rank: i + 1,
    label: rankLabel(i + 1),
    score: Math.round(priorityScore(opp) * 10) / 10,
  }))
}

/* ------------------------------------------------------------------ */
/* Preparation allocation                                              */
/* ------------------------------------------------------------------ */

export interface AllocationItem {
  id: string
  company: string
  role: string
  focus: string
  hours: number
}

export interface Allocation {
  items: AllocationItem[]
  buffer: number
  total: number
}

function defaultFocus(opp: Opportunity): string {
  if (opp.prepFocus) return opp.prepFocus
  const gap = criticalGap(opp)
  if (gap) return `Close gap: ${gap.text}`
  if (opp.stage === "Applied") return "Company research and resume check"
  if (opp.stage === "Take-home task") return "Complete and review take-home task"
  if (opp.stage === "Final interview") return "Mock interview + role research"
  return "Interview preparation"
}

export function computeAllocation(state: AppState): Allocation {
  const ranked = getRanked(state)
  const total = state.prepHours
  const override = state.allocationOverride

  if (override) {
    const items = ranked.map((r) => ({
      id: r.opp.id,
      company: r.opp.company,
      role: r.opp.role,
      focus: defaultFocus(r.opp),
      hours: Math.max(0, override[r.opp.id] ?? 0),
    }))
    const used = items.reduce((s, i) => s + i.hours, 0)
    return { items, buffer: Math.max(0, Math.round((total - used) * 10) / 10), total }
  }

  const buffer = Math.round(total * 0.25)
  const remaining = Math.max(0, total - buffer)
  const weights = ranked.map((r) => Math.max(0.1, r.score))
  const weightSum = weights.reduce((s, w) => s + w, 0) || 1

  const raw = ranked.map((r, i) => (remaining * weights[i]) / weightSum)
  const floored = raw.map((v) => Math.floor(v))
  let leftover = remaining - floored.reduce((s, v) => s + v, 0)
  const fractions = raw
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac)
  for (const { i } of fractions) {
    if (leftover <= 0) break
    floored[i] += 1
    leftover -= 1
  }

  const items = ranked.map((r, i) => ({
    id: r.opp.id,
    company: r.opp.company,
    role: r.opp.role,
    focus: defaultFocus(r.opp),
    hours: floored[i],
  }))

  return { items, buffer, total }
}

/* ------------------------------------------------------------------ */
/* Recurring skills (skill reuse)                                      */
/* ------------------------------------------------------------------ */

export interface RecurringSkill {
  skill: string
  jobs: number
}

export function recurringSkills(opps: Opportunity[]): RecurringSkill[] {
  interface Entry {
    skill: string
    companies: Set<string>
    mustHave: boolean
    evSum: number
    count: number
  }
  const map = new Map<string, Entry>()

  for (const opp of opps) {
    const seen = new Set<string>()
    for (const req of opp.requirements) {
      const key = req.text.trim().toLowerCase()
      const entry =
        map.get(key) ??
        { skill: req.text, companies: new Set(), mustHave: false, evSum: 0, count: 0 }
      entry.companies.add(opp.id)
      if (req.kind === "must") entry.mustHave = true
      entry.evSum += evidenceValue(req)
      if (!seen.has(key)) {
        entry.count += 1
        seen.add(key)
      }
      map.set(key, entry)
    }
  }

  return [...map.values()]
    .filter((e) => e.companies.size >= 2)
    .sort((a, b) => {
      if (b.companies.size !== a.companies.size) return b.companies.size - a.companies.size
      if (a.mustHave !== b.mustHave) return a.mustHave ? -1 : 1
      return a.evSum / a.count - b.evSum / b.count
    })
    .map((e) => ({ skill: e.skill, jobs: e.companies.size }))
}

/* ------------------------------------------------------------------ */
/* Recommendation ranking factors                                     */
/* ------------------------------------------------------------------ */

export type FactorTone = "positive" | "impact" | "warning" | "neutral"

export interface RankingFactor {
  label: string
  detail: string
  note: string
  tone: FactorTone
}

export function rankingFactors(opp: Opportunity, state: AppState): RankingFactor[] {
  const cov = evidenceCoverage(opp)
  const gap = criticalGap(opp)
  const allocation = computeAllocation(state)
  const hours = allocation.items.find((i) => i.id === opp.id)?.hours ?? 0
  const recurring = recurringSkills(state.opportunities)
  const reuse = recurring.find((r) =>
    opp.requirements.some((req) => req.text === r.skill),
  )
  const otherBenefit = reuse
    ? state.opportunities.find(
        (o) => o.id !== opp.id && o.requirements.some((req) => req.text === reuse.skill),
      )
    : undefined

  return [
    {
      label: "Deadline",
      detail: `${opp.stage} ${relativeDay(opp.nextDate)}`,
      note: urgencyLabel(opp.nextDate) === "High" ? "High impact" : "Moderate impact",
      tone: "impact",
    },
    {
      label: "Application stage",
      detail: `${opp.stage} stage`,
      note: STAGE_WEIGHT[opp.stage] >= 4 ? "High impact" : "Moderate impact",
      tone: "impact",
    },
    {
      label: "Evidence Match",
      detail: `${evidenceMatch(opp)} evidence across ${cov.strong} of ${cov.total} requirements`,
      note: "Positive",
      tone: "positive",
    },
    {
      label: "Critical Gap",
      detail: gap
        ? `1 must-have gap: ${gap.text.toLowerCase()}`
        : "No open must-have gaps",
      note: gap ? "Needs work" : "Clear",
      tone: gap ? "warning" : "positive",
    },
    {
      label: "Preparation Effort",
      detail: `${hours} focused hour${hours === 1 ? "" : "s"} recommended`,
      note: hours <= 3 ? "Manageable" : "Significant",
      tone: "neutral",
    },
    {
      label: "Skill Reuse",
      detail: otherBenefit
        ? `Preparation also benefits ${otherBenefit.company}`
        : "Limited overlap with other opportunities",
      note: otherBenefit ? "Positive" : "Neutral",
      tone: otherBenefit ? "positive" : "neutral",
    },
    {
      label: "User Preference",
      detail: `${opp.interest} interest in this role`,
      note: opp.interest === "High" ? "Positive" : opp.interest === "Medium" ? "Neutral" : "Low",
      tone: opp.interest === "High" ? "positive" : "neutral",
    },
  ]
}

export function recommendedAction(opp: Opportunity): string {
  const gap = criticalGap(opp)
  if (gap && opp.stage === "Final interview") {
    return `Spend 2 hours reviewing ${gap.text.toLowerCase()}, then complete one 45-minute mock case before the final interview.`
  }
  if (gap) {
    return `Spend your first block closing the ${gap.text.toLowerCase()} gap, then move on to the next-highest opportunity.`
  }
  if (opp.stage === "Take-home task") {
    return "Timebox the take-home task and reserve 30 minutes to review your answer against the requirements before submitting."
  }
  return "Start with focused role research, then rehearse two likely interview questions out loud."
}
