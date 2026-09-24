"use client"

import {
  AlertTriangle,
  ArrowRight,
  Check,
  CircleCheck,
  Info,
  Lightbulb,
  Minus,
  Target,
} from "lucide-react"
import { useNav } from "@/components/nav"
import { ScreenHeader } from "@/components/screen-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  type FactorTone,
  evidenceMatch,
  getRanked,
  priorityScore,
  rankingFactors,
  recommendedAction,
  relativeDay,
} from "@/lib/logic"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"

const TONE_ICON: Record<FactorTone, typeof Check> = {
  positive: CircleCheck,
  impact: Target,
  warning: AlertTriangle,
  neutral: Minus,
}

const TONE_STYLES: Record<FactorTone, { icon: string; note: string }> = {
  positive: { icon: "text-emerald-600", note: "text-emerald-700" },
  impact: { icon: "text-primary", note: "text-primary" },
  warning: { icon: "text-amber-600", note: "text-amber-700" },
  neutral: { icon: "text-muted-foreground", note: "text-muted-foreground" },
}

export function RecommendationScreen() {
  const { state, followRecommendation } = useStore()
  const { navigate, showToast } = useNav()
  const ranked = getRanked(state)
  const top = ranked[0]
  const runnerUp = ranked[1]

  if (!top) {
    return (
      <div>
        <ScreenHeader
          eyebrow="Recommendation"
          title="Why this opportunity?"
          description="Add opportunities to get a prioritized recommendation."
        />
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No opportunities to recommend yet.
          </CardContent>
        </Card>
      </div>
    )
  }

  const factors = rankingFactors(top.opp, state)
  const action = recommendedAction(top.opp)
  const followed = state.followedId === top.opp.id
  const lead = runnerUp
    ? Math.round((priorityScore(top.opp) - priorityScore(runnerUp.opp)) * 10) / 10
    : null

  function follow() {
    followRecommendation(top.opp.id)
    showToast(`Following recommendation: ${top.opp.company}`)
    navigate("allocation")
  }

  return (
    <div>
      <ScreenHeader
        eyebrow="Recommendation"
        title="Why this is your #1 focus"
        description="PlacementOS weighs deadlines, application stage, evidence fit, gaps, effort, skill reuse, and your preference. Here's the transparent reasoning behind the top pick."
      />

      <Card className="overflow-hidden border-primary/30">
        <div className="flex items-center gap-2 border-b border-primary/20 bg-primary/5 px-5 py-2.5">
          <Lightbulb className="size-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wide text-primary">
            Recommended focus
          </span>
        </div>
        <CardContent className="pt-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-xl font-semibold text-foreground">{top.opp.company}</div>
              <div className="text-sm text-muted-foreground">{top.opp.role}</div>
              <p className="mt-3 max-w-xl text-sm text-foreground">
                This is your highest-leverage focus because its {top.opp.stage.toLowerCase()} is{" "}
                {relativeDay(top.opp.nextDate)} and you already have {evidenceMatch(top.opp).toLowerCase()}{" "}
                evidence — so a small amount of preparation moves you meaningfully closer to an offer.
              </p>
            </div>
            <div className="shrink-0 rounded-lg bg-primary/10 px-4 py-3 text-center">
              <div className="text-xs text-muted-foreground">Priority score</div>
              <div className="text-2xl font-bold text-primary">{top.score}</div>
              {lead && lead > 0 ? (
                <div className="text-xs text-muted-foreground">+{lead} vs next</div>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        How the factors weighed in
      </h2>
      <Card>
        <CardContent className="divide-y divide-border p-0">
          {factors.map((f) => {
            const Icon = TONE_ICON[f.tone]
            const styles = TONE_STYLES[f.tone]
            return (
              <div key={f.label} className="flex items-start gap-3 p-4">
                <Icon className={cn("mt-0.5 size-4 shrink-0", styles.icon)} />
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">{f.label}</div>
                  <div className="text-sm text-muted-foreground">{f.detail}</div>
                </div>
                <span className={cn("shrink-0 text-xs font-semibold", styles.note)}>{f.note}</span>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {runnerUp ? (
        <Card className="mt-4">
          <CardContent className="flex items-start gap-3 pt-5">
            <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Why not {runnerUp.opp.company}?</span>{" "}
              It ranks #{runnerUp.rank} ({runnerUp.label.toLowerCase()}) — its {runnerUp.opp.stage.toLowerCase()}{" "}
              is {relativeDay(runnerUp.opp.nextDate)}, giving you more runway. Prioritizing {top.opp.company}{" "}
              now doesn't cost you {runnerUp.opp.company}; it sequences your limited time where the deadline is closest.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Card className="mt-4 border-primary/30 bg-primary/5">
        <CardContent className="pt-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-primary">
            Recommended next action
          </div>
          <p className="mt-1 text-sm text-foreground">{action}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button onClick={follow}>
              {followed ? <Check className="size-4" /> : <Target className="size-4" />}
              {followed ? "Following this plan" : "Follow this recommendation"}
            </Button>
            <Button variant="outline" onClick={() => navigate("analysis", top.opp.id)}>
              View full analysis
              <ArrowRight className="size-3.5" />
            </Button>
            <Button variant="ghost" onClick={() => navigate("compare")}>
              Compare all
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
