import { Badge } from "@/components/ui/badge"
import type { EvidenceLevel, EvidenceMatch, Interest } from "@/lib/types"
import { cn } from "@/lib/utils"

const EVIDENCE_STYLES: Record<EvidenceLevel, string> = {
  Strong: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Some: "border-sky-200 bg-sky-50 text-sky-700",
  Weak: "border-amber-200 bg-amber-50 text-amber-700",
  None: "border-rose-200 bg-rose-50 text-rose-700",
  Unclear: "border-violet-200 bg-violet-50 text-violet-700",
}

const EVIDENCE_LABEL: Record<EvidenceLevel, string> = {
  Strong: "Strong evidence",
  Some: "Some evidence",
  Weak: "Weak evidence",
  None: "No evidence",
  Unclear: "Unclear",
}

export function EvidenceBadge({ level, className }: { level: EvidenceLevel; className?: string }) {
  return <Badge className={cn(EVIDENCE_STYLES[level], className)}>{EVIDENCE_LABEL[level]}</Badge>
}

const MATCH_STYLES: Record<EvidenceMatch, string> = {
  Strong: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Medium: "border-amber-200 bg-amber-50 text-amber-700",
  Weak: "border-rose-200 bg-rose-50 text-rose-700",
}

export function MatchBadge({ match, className }: { match: EvidenceMatch; className?: string }) {
  return <Badge className={cn(MATCH_STYLES[match], className)}>{match}</Badge>
}

const INTEREST_STYLES: Record<Interest, string> = {
  High: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Medium: "border-amber-200 bg-amber-50 text-amber-700",
  Low: "border-slate-200 bg-slate-50 text-slate-600",
}

export function InterestBadge({ interest, className }: { interest: Interest; className?: string }) {
  return <Badge className={cn(INTEREST_STYLES[interest], className)}>{interest} interest</Badge>
}

const URGENCY_STYLES: Record<string, string> = {
  High: "border-rose-200 bg-rose-50 text-rose-700",
  Medium: "border-amber-200 bg-amber-50 text-amber-700",
  Low: "border-slate-200 bg-slate-50 text-slate-600",
}

export function UrgencyBadge({ level, className }: { level: "High" | "Medium" | "Low"; className?: string }) {
  return <Badge className={cn(URGENCY_STYLES[level], className)}>{level} urgency</Badge>
}
