import type { Opportunity } from "./types"

/** Returns an ISO date string `days` from today (local time). */
function daysFromNow(days: number): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function createSeedOpportunities(): Opportunity[] {
  return [
    {
      id: "northstar",
      company: "Northstar Labs",
      role: "Product Analyst Intern",
      description:
        "Support the product team by analyzing user behavior, building dashboards, and designing lightweight experiments to inform roadmap decisions.",
      stage: "Final interview",
      nextDate: daysFromNow(2),
      interest: "High",
      prepFocus: "Experiment design review + mock interview",
      requirements: [
        { id: "ns-1", text: "SQL for data analysis", kind: "must", evidence: "Strong" },
        { id: "ns-2", text: "Product metrics & funnel analysis", kind: "must", evidence: "Strong" },
        { id: "ns-3", text: "Experiment design (A/B testing)", kind: "must", evidence: "Weak" },
        { id: "ns-4", text: "Data storytelling & dashboards", kind: "must", evidence: "Strong" },
        { id: "ns-5", text: "Stakeholder communication", kind: "must", evidence: "Strong" },
        { id: "ns-6", text: "Python for analysis", kind: "preferred", evidence: "Strong" },
        { id: "ns-7", text: "SQL window functions", kind: "preferred", evidence: "Weak" },
        { id: "ns-8", text: "Amplitude / Mixpanel familiarity", kind: "preferred", evidence: "Unclear" },
        { id: "ns-9", text: "Basic wireframing", kind: "preferred", evidence: "None" },
      ],
    },
    {
      id: "acme",
      company: "Acme Health",
      role: "Data Analyst",
      description:
        "Own reporting for the operations team, ship a take-home analysis, and turn messy healthcare datasets into clear, decision-ready insights.",
      stage: "Take-home task",
      nextDate: daysFromNow(5),
      interest: "Medium",
      prepFocus: "SQL practice for take-home task",
      requirements: [
        { id: "ac-1", text: "SQL (joins & aggregations)", kind: "must", evidence: "Strong" },
        { id: "ac-2", text: "SQL window functions", kind: "must", evidence: "Weak" },
        { id: "ac-3", text: "Data cleaning & validation", kind: "must", evidence: "Strong" },
        { id: "ac-4", text: "Healthcare data familiarity", kind: "must", evidence: "Weak" },
        { id: "ac-5", text: "Dashboarding (Tableau / Looker)", kind: "preferred", evidence: "Some" },
        { id: "ac-6", text: "Python for analysis", kind: "preferred", evidence: "Some" },
      ],
    },
    {
      id: "orbit",
      company: "Orbit Systems",
      role: "Business Operations Intern",
      description:
        "Help the ops team streamline internal processes, maintain operational models, and document workflows across teams.",
      stage: "Applied",
      nextDate: daysFromNow(12),
      interest: "Medium",
      prepFocus: "Company research and resume check",
      requirements: [
        { id: "or-1", text: "Spreadsheet modeling (Excel)", kind: "must", evidence: "Strong" },
        { id: "or-2", text: "Process documentation", kind: "must", evidence: "Strong" },
        { id: "or-3", text: "Stakeholder communication", kind: "must", evidence: "Strong" },
        { id: "or-4", text: "SQL basics", kind: "preferred", evidence: "Some" },
        { id: "or-5", text: "Project management tools", kind: "preferred", evidence: "Strong" },
      ],
    },
  ]
}
