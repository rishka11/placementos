"use client"

import { useState } from "react"
import { Sparkles } from "lucide-react"
import { useNav } from "@/components/nav"
import { ScreenHeader } from "@/components/screen-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, Input, Select, Textarea } from "@/components/ui/field"
import { useStore } from "@/lib/store"
import { STAGES, type Interest, type Stage } from "@/lib/types"

function defaultDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return d.toISOString().slice(0, 10)
}

export function AddOpportunityScreen() {
  const { addOpportunity } = useStore()
  const { navigate, showToast } = useNav()

  const [company, setCompany] = useState("")
  const [role, setRole] = useState("")
  const [description, setDescription] = useState("")
  const [stage, setStage] = useState<Stage>("Applied")
  const [nextDate, setNextDate] = useState(defaultDate)
  const [interest, setInterest] = useState<Interest>("High")
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!company.trim() || !role.trim()) {
      setError("Company and role are required.")
      return
    }
    const id = addOpportunity({
      company: company.trim(),
      role: role.trim(),
      description: description.trim(),
      stage,
      nextDate,
      interest,
    })
    showToast(`${company.trim()} added and analyzed`)
    navigate("analysis", id)
  }

  return (
    <div>
      <ScreenHeader
        eyebrow="New opportunity"
        title="Add an opportunity"
        description="Capture an active internship or entry-level opportunity. PlacementOS turns the job description into requirements you can analyze against your evidence."
      />

      <Card className="max-w-2xl">
        <CardContent className="pt-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Company" htmlFor="company">
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Northstar Labs"
                />
              </Field>
              <Field label="Role" htmlFor="role">
                <Input
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Product Analyst Intern"
                />
              </Field>
            </div>

            <Field
              label="Job description"
              htmlFor="description"
              hint="Paste the responsibilities and requirements. Each line or bullet becomes a requirement to analyze."
            >
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  "e.g.\nSQL for data analysis\nProduct metrics & funnel analysis\nExperiment design (A/B testing)\nStakeholder communication"
                }
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Current application stage" htmlFor="stage">
                <Select
                  id="stage"
                  value={stage}
                  onChange={(e) => setStage(e.target.value as Stage)}
                >
                  {STAGES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Next important date" htmlFor="nextDate">
                <Input
                  id="nextDate"
                  type="date"
                  value={nextDate}
                  onChange={(e) => setNextDate(e.target.value)}
                />
              </Field>
            </div>

            <Field label="Interest level" htmlFor="interest">
              <Select
                id="interest"
                value={interest}
                onChange={(e) => setInterest(e.target.value as Interest)}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </Select>
            </Field>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <div className="flex items-center gap-2 border-t border-border pt-4">
              <Button type="submit">
                <Sparkles className="size-4" />
                Save and analyze
              </Button>
              <Button type="button" variant="ghost" onClick={() => navigate("dashboard")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
