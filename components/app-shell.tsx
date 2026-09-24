"use client"

import {
  CheckCircle2,
  Clock,
  GraduationCap,
  LayoutDashboard,
  Lightbulb,
  Plus,
  RotateCcw,
  Scale,
  Table2,
} from "lucide-react"
import { NavProvider, useNav, type Screen } from "@/components/nav"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { AddOpportunityScreen } from "@/components/screens/add-opportunity"
import { AllocationScreen } from "@/components/screens/allocation"
import { AnalysisScreen } from "@/components/screens/analysis"
import { ComparisonScreen } from "@/components/screens/comparison"
import { DashboardScreen } from "@/components/screens/dashboard"
import { RecommendationScreen } from "@/components/screens/recommendation"

const NAV_ITEMS: { screen: Screen; label: string; icon: typeof LayoutDashboard }[] = [
  { screen: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { screen: "add", label: "Add opportunity", icon: Plus },
  { screen: "analysis", label: "Opportunity analysis", icon: Table2 },
  { screen: "compare", label: "Comparison", icon: Scale },
  { screen: "allocation", label: "Preparation plan", icon: Clock },
  { screen: "recommendation", label: "Recommendation", icon: Lightbulb },
]

function Sidebar() {
  const { screen, navigate } = useNav()
  const { resetDemo, state } = useStore()

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-sidebar-border bg-sidebar md:h-screen md:w-64 md:border-b-0 md:border-r">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <GraduationCap className="size-5" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-sidebar-foreground">PlacementOS</div>
          <div className="text-xs text-muted-foreground">Prep prioritization</div>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-1 md:flex-col md:overflow-visible md:pb-0">
        {NAV_ITEMS.map((item) => {
          const active = screen === item.screen
          const Icon = item.icon
          return (
            <button
              key={item.screen}
              type="button"
              onClick={() => navigate(item.screen)}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-sidebar-foreground hover:bg-accent/60",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="size-4 shrink-0" />
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="hidden border-t border-sidebar-border p-3 md:block">
        <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
          <div className="font-medium text-foreground">{state.opportunities.length} active opportunities</div>
          <div className="mt-0.5">{state.prepHours}h prep time this week</div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 w-full justify-start text-muted-foreground"
          onClick={resetDemo}
        >
          <RotateCcw className="size-3.5" />
          Reset demo data
        </Button>
      </div>
    </aside>
  )
}

function ScreenRouter() {
  const { screen } = useNav()
  switch (screen) {
    case "dashboard":
      return <DashboardScreen />
    case "add":
      return <AddOpportunityScreen />
    case "analysis":
      return <AnalysisScreen />
    case "compare":
      return <ComparisonScreen />
    case "allocation":
      return <AllocationScreen />
    case "recommendation":
      return <RecommendationScreen />
    default:
      return <DashboardScreen />
  }
}

function ToastHost() {
  const { toast } = useNav()
  if (!toast) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background shadow-lg">
        <CheckCircle2 className="size-4" />
        {toast}
      </div>
    </div>
  )
}

export function AppShell() {
  return (
    <NavProvider>
      <div className="flex min-h-screen flex-col bg-background md:flex-row">
        <Sidebar />
        <main className="flex-1 md:h-screen md:overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8 md:py-10">
            <ScreenRouter />
          </div>
        </main>
      </div>
      <ToastHost />
    </NavProvider>
  )
}
