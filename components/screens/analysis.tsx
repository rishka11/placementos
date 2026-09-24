"use client"

import { AlertTriangle, Calendar, Check, HelpCircle } from "lucide-react"
import { useNav } from "@/components/nav"
import { ScreenHeader } from "@/components/screen-header"
import { EvidenceBadge, MatchBadge } from "@/components/evidence-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  criticalGap,
  evidenceCoverage,
  evidenceMatch,
  formatDate,
  getRanked,
  relativeDay,
} from "@/lib/logic"
import { useStore } from "@/lib/store"
import type { Opportunity, Requirement } from "@/lib/types"
import { cn } from "@/lib/utils"

function RequirementRow({
  req,
  isGap,
  onConfirm,
}: {
  req: Requirement
  isGap: boolean
  onConfirm: () => void
}) {
  const needsClarification = req.evidence === "Unclear" && !req.confirmed
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between",
        isGap ? "border-amber-200 bg-amber-50/50" : "border-border bg-card",
      )}
    >
      <div className="flex items-start gap-2">
        {isGap ? <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" /> : null}
        <div>
          <div className="text-sm font-medium text-foreground">{req.text}</div>
          {needsClarification ? (
            <div className="mt-0.5 flex items-center gap-1 text-xs text-violet-700">
              <HelpCircle className="size-3.5" />
              Needs clarification
            </div>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <EvidenceBadge level={req.confirmed ? "Strong" : req.evidence} />
        {needsClarification ? (
          <Button size="xs" variant="outline" onClick={onConfirm}>
            <Check className="size-3" />
            Confirm I meet this
          </Button>
        ) : req.confirmed ? (
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-700">
            <Check className="size-3.5" />
            Confirmed
          </span>
        ) : null}
      </div>
    </div>
  )
}

function AnalysisBody({ opp }: { opp: Opportunity }) {
  const { confirmRequirement } = useStore()
  const cov = evidenceCoverage(opp)
  const gap = criticalGap(opp)
  const musts = opp.requirements.filter((r) => r.kind === "must")
  const preferred = opp.requirements.filter((r) => r.kind === "preferred")
  const coveragePct = Math.round(cov.ratio * 100)

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-lg font-semibold text-foreground">{opp.company}</div>
              <div className="text-sm text-muted-foreground">{opp.role}</div>
            </div>
            <MatchBadge match={evidenceMatch(opp)} className="text-sm" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <div className="text-xs text-muted-foreground">Stage</div>
              <div className="text-sm font-medium text-foreground">{opp.stage}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Next event</div>
              <div className="flex items-center gap-1 text-sm font-medium text-foreground">
                <Calendar className="size-3.5 text-muted-foreground" />
                {formatDate(opp.nextDate)} ({relativeDay(opp.nextDate)})
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Evidence Match</div>
              <div className="text-sm font-medium text-foreground">{evidenceMatch(opp)}</div>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Evidence coverage</span>
              <span className="font-medium text-foreground">
                {cov.strong} of {cov.total} requirements with strong evidence
              </span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${coveragePct}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {gap ? (
        <Card className="border-amber-200 bg-amber-50/40">
          <CardContent className="flex items-start gap-3 pt-5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                Critical gap
              </div>
              <div className="mt-0.5 text-sm font-semibold text-foreground">{gap.text}</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Must-have requirement with {gap.evidence === "None" ? "no" : gap.evidence.toLowerCase()} resume
                evidence. Closing this gap has the biggest impact on this opportunity.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Must-have requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {musts.map((req) => (
            <RequirementRow
              key={req.id}
              req={req}
              isGap={gap?.id === req.id}
              onConfirm={() => confirmRequirement(opp.id, req.id)}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferred requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {preferred.length === 0 ? (
            <p className="text-sm text-muted-foreground">No preferred requirements listed.</p>
          ) : (
            preferred.map((req) => (
              <RequirementRow
                key={req.id}
                req={req}
                isGap={gap?.id === req.id}
                onConfirm={() => confirmRequirement(opp.id, req.id)}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function AnalysisScreen() {
  const { state } = useStore()
  const { selectedId, navigate } = useNav()
  const ranked = getRanked(state)
  const opp =
    state.opportunities.find((o) => o.id === selectedId) ?? ranked[0]?.opp ?? null

  return (
    <div>
      <ScreenHeader
        eyebrow="Opportunity analysis"
        title="Evidence & requirement fit"
        description="See how your evidence maps to each requirement, resolve anything unclear, and spot the must-have gaps that matter most."
      />

      {state.opportunities.length > 1 ? (
        <div className="mb-5 flex flex-wrap gap-2">
          {state.opportunities.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => navigate("analysis", o.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                o.id === opp?.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:bg-muted",
              )}
            >
              {o.company}
            </button>
          ))}
        </div>
      ) : null}

      {opp ? (
        <AnalysisBody opp={opp} />
      ) : (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No opportunities yet. Add one to see its analysis.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
