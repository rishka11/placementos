"use client"

import { Check, ListChecks } from "lucide-react"
import { useNav } from "@/components/nav"
import { ScreenHeader } from "@/components/screen-header"
import { MatchBadge, UrgencyBadge } from "@/components/evidence-badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  computeAllocation,
  criticalGap,
  evidenceMatch,
  getRanked,
  urgencyLabel,
} from "@/lib/logic"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export function ComparisonScreen() {
  const { state, setManualOrder } = useStore()
  const { navigate, showToast } = useNav()
  const ranked = getRanked(state)
  const allocation = computeAllocation(state)
  const hoursById = new Map(allocation.items.map((i) => [i.id, i.hours]))

  function applyOrder() {
    setManualOrder(ranked.map((r) => r.opp.id))
    showToast("Priority order applied across PlacementOS")
  }

  const rows: { label: string; render: (rank: (typeof ranked)[number]) => React.ReactNode }[] = [
    {
      label: "Evidence Match",
      render: (r) => <MatchBadge match={evidenceMatch(r.opp)} />,
    },
    {
      label: "Application Stage",
      render: (r) => <span className="text-sm text-foreground">{r.opp.stage}</span>,
    },
    {
      label: "Urgency",
      render: (r) => <UrgencyBadge level={urgencyLabel(r.opp.nextDate)} />,
    },
    {
      label: "Critical Gap",
      render: (r) => {
        const gap = criticalGap(r.opp)
        return (
          <span className={cn("text-sm", gap ? "text-amber-700" : "text-emerald-700")}>
            {gap ? gap.text : "None"}
          </span>
        )
      },
    },
    {
      label: "Preparation Effort",
      render: (r) => (
        <span className="text-sm text-foreground">{hoursById.get(r.opp.id) ?? 0}h recommended</span>
      ),
    },
    {
      label: "User Preference",
      render: (r) => <span className="text-sm text-foreground">{r.opp.interest} interest</span>,
    },
    {
      label: "Priority",
      render: (r) => (
        <span className="font-semibold text-primary">
          {r.rank} — {r.label}
        </span>
      ),
    },
  ]

  return (
    <div>
      <ScreenHeader
        eyebrow="Cross-opportunity comparison"
        title="Compare your opportunities"
        description="A side-by-side view of the signals that drive prioritization, so you can see the trade-offs before committing your time."
        actions={
          <Button onClick={applyOrder}>
            <ListChecks className="size-4" />
            Use this priority order
          </Button>
        }
      />

      {state.manualOrder ? (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          <Check className="size-4" />
          This priority order is currently applied to your dashboard and plan.
        </div>
      ) : null}

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border">
              <th className="p-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Signal
              </th>
              {ranked.map((r) => (
                <th key={r.opp.id} className="p-4">
                  <div className="font-semibold text-foreground">{r.opp.company}</div>
                  <div className="text-xs font-normal text-muted-foreground">{r.opp.role}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-border last:border-0">
                <td className="p-4 text-sm font-medium text-muted-foreground">{row.label}</td>
                {ranked.map((r) => (
                  <td key={r.opp.id} className="p-4 align-middle">
                    {row.render(r)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => navigate("allocation")}>
          Plan preparation time
        </Button>
        <Button variant="ghost" onClick={() => navigate("recommendation")}>
          See why #1 is recommended
        </Button>
      </div>
    </div>
  )
}
