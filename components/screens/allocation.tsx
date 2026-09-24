"use client"

import { useState } from "react"
import { Clock, Pencil, RotateCcw, Save, Sparkles, TrendingUp } from "lucide-react"
import { useNav } from "@/components/nav"
import { ScreenHeader } from "@/components/screen-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, Input } from "@/components/ui/field"
import { computeAllocation, recurringSkills } from "@/lib/logic"
import { useStore } from "@/lib/store"

export function AllocationScreen() {
  const { state, setPrepHours, setAllocationOverride, savePlan } = useStore()
  const { showToast } = useNav()
  const [editing, setEditing] = useState(false)

  const allocation = computeAllocation(state)
  const recurring = recurringSkills(state.opportunities)
  const topSkill = recurring[0]

  function handleHoursChange(value: string) {
    const n = Math.max(0, Math.min(60, Math.round(Number(value) || 0)))
    setPrepHours(n)
  }

  function handleItemChange(id: string, value: string) {
    const n = Math.max(0, Math.round(Number(value) || 0))
    const base: Record<string, number> = {}
    for (const item of allocation.items) base[item.id] = item.hours
    base[id] = n
    setAllocationOverride(base)
  }

  function resetRecommended() {
    setAllocationOverride(null)
    setEditing(false)
    showToast("Reset to recommended allocation")
  }

  function handleSave() {
    savePlan()
    setEditing(false)
    showToast("Weekly plan saved")
  }

  return (
    <div>
      <ScreenHeader
        eyebrow="Preparation allocation"
        title="Allocate your prep time"
        description="Distribute your limited hours across opportunities based on priority — with a buffer reserved for the unexpected."
        actions={
          <>
            {editing ? (
              <Button variant="outline" onClick={resetRecommended}>
                <RotateCcw className="size-4" />
                Reset to recommended
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setEditing(true)}>
                <Pencil className="size-4" />
                Edit allocation
              </Button>
            )}
            <Button onClick={handleSave}>
              <Save className="size-4" />
              Save weekly plan
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="pt-5">
            <Field
              label="Available preparation hours"
              htmlFor="hours"
              hint="How much focused time you have this week."
            >
              <Input
                id="hours"
                type="number"
                min={0}
                max={60}
                value={state.prepHours}
                onChange={(e) => handleHoursChange(e.target.value)}
              />
            </Field>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted/60 p-3 text-sm">
              <Clock className="size-4 text-primary" />
              <span className="text-muted-foreground">
                Allocating <span className="font-semibold text-foreground">{allocation.total}h</span> this week
              </span>
            </div>
            {state.savedPlan ? (
              <div className="mt-2 text-xs font-medium text-emerald-700">Weekly plan saved</div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="space-y-3 pt-5">
            {allocation.items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="font-medium text-foreground">{item.company}</div>
                  <div className="text-sm text-muted-foreground">{item.focus}</div>
                </div>
                {editing ? (
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="number"
                      min={0}
                      value={item.hours}
                      onChange={(e) => handleItemChange(item.id, e.target.value)}
                      className="h-8 w-20"
                    />
                    <span className="text-sm text-muted-foreground">hours</span>
                  </div>
                ) : (
                  <div className="shrink-0 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
                    {item.hours} {item.hours === 1 ? "hour" : "hours"}
                  </div>
                )}
              </div>
            ))}

            <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border bg-muted/40 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-medium text-foreground">Flexible buffer</div>
                <div className="text-sm text-muted-foreground">
                  Reserved for unexpected changes or additional preparation
                </div>
              </div>
              <div className="shrink-0 rounded-lg bg-muted px-3 py-1.5 text-sm font-semibold text-foreground">
                {allocation.buffer} {allocation.buffer === 1 ? "hour" : "hours"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {topSkill ? (
        <Card className="mt-4">
          <CardContent className="flex items-start gap-3 pt-5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <TrendingUp className="size-5" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-primary">
                Recurring skill
              </div>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{topSkill.skill}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  <Sparkles className="size-3" />
                  {topSkill.jobs} jobs benefit
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Practicing this once pays off across multiple opportunities — a high-leverage use of buffer time.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
