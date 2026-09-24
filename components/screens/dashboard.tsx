"use client"

import { ArrowRight, Calendar, Clock, Plus, Scale, Target, TrendingUp } from "lucide-react"
import { useNav } from "@/components/nav"
import { ScreenHeader } from "@/components/screen-header"
import { EvidenceBadge, MatchBadge } from "@/components/evidence-badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  criticalGap,
  evidenceMatch,
  formatDate,
  getRanked,
  recurringSkills,
  relativeDay,
} from "@/lib/logic"
import { useStore } from "@/lib/store"

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Clock
  label: string
  value: string
  sub?: string
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon className="size-4 text-primary" />
        {label}
      </div>
      <div className="mt-2 text-lg font-semibold leading-tight text-foreground">{value}</div>
      {sub ? <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div> : null}
    </Card>
  )
}

export function DashboardScreen() {
  const { state } = useStore()
  const { navigate } = useNav()
  const ranked = getRanked(state)
  const recurring = recurringSkills(state.opportunities)
  const topSkill = recurring[0]
  const top = ranked[0]

  return (
    <div>
      <ScreenHeader
        eyebrow="Decision support"
        title="What should I focus on next?"
        description="Given your active opportunities and limited preparation time, here is where your effort has the most leverage — and why."
        actions={
          <>
            <Button variant="outline" onClick={() => navigate("compare")}>
              <Scale className="size-4" />
              Compare all
            </Button>
            <Button onClick={() => navigate("add")}>
              <Plus className="size-4" />
              Add opportunity
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={Clock}
          label="Available preparation time"
          value={`${state.prepHours} hours`}
          sub="This week"
        />
        <StatCard
          icon={TrendingUp}
          label="Highest-leverage skill gap"
          value={topSkill ? topSkill.skill : "No recurring gaps"}
          sub={topSkill ? `${topSkill.jobs} opportunities benefit` : "Skills don't overlap yet"}
        />
        <StatCard
          icon={Target}
          label="Focus now"
          value={top ? top.opp.company : "—"}
          sub={top ? top.opp.role : undefined}
        />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Active opportunities by priority
        </h2>
        <button
          type="button"
          onClick={() => navigate("compare")}
          className="text-xs font-medium text-primary hover:underline"
        >
          Compare all
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {ranked.map((r) => {
          const gap = criticalGap(r.opp)
          return (
            <Card key={r.opp.id} className="p-4 transition-shadow hover:shadow-md">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    {r.rank}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{r.opp.company}</div>
                    <div className="text-sm text-muted-foreground">{r.opp.role}</div>
                  </div>
                </div>

                <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
                  <div>
                    <div className="text-xs text-muted-foreground">Stage</div>
                    <div className="text-sm font-medium text-foreground">{r.opp.stage}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Next event</div>
                    <div className="flex items-center gap-1 text-sm font-medium text-foreground">
                      <Calendar className="size-3.5 text-muted-foreground" />
                      {formatDate(r.opp.nextDate)}
                      <span className="text-xs font-normal text-muted-foreground">
                        ({relativeDay(r.opp.nextDate)})
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Evidence Match</div>
                    <MatchBadge match={evidenceMatch(r.opp)} className="mt-0.5" />
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {r.rank === 1 ? (
                    <Button variant="ghost" size="sm" onClick={() => navigate("recommendation")}>
                      Why #1?
                    </Button>
                  ) : null}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("analysis", r.opp.id)}
                  >
                    Analyze
                    <ArrowRight className="size-3.5" />
                  </Button>
                </div>
              </div>

              {gap ? (
                <div className="mt-3 flex items-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
                  <span>Critical gap:</span>
                  <span className="font-medium text-foreground">{gap.text}</span>
                  <EvidenceBadge level={gap.evidence} />
                </div>
              ) : null}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
