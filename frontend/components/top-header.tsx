"use client"

import { cn } from "@/lib/utils"
import { type Team } from "@/models/team"
import { Bell, Check, ChevronsUpDown, Menu } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"

export function TopHeader({
  teams = [],
  activeTeam,
  onTeamChange,
  onOpenMobileNav,
}: {
  teams?: Team[]
  activeTeam: Team
  onTeamChange: (team: Team) => void
  onOpenMobileNav: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  return (
    <header className="glass sticky top-0 z-30 flex items-center justify-between gap-3 border-b px-4 py-3 md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileNav}
          className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-foreground/5 hover:text-foreground md:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="size-5" />
        </button>

        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg border border-border bg-foreground/[0.03] px-3 py-2 text-sm font-medium transition-colors hover:bg-foreground/[0.06]"
          >
            <span className="flex size-6 items-center justify-center rounded-md bg-primary/15 text-xs font-bold text-primary">
              {activeTeam.nome.charAt(0)}
            </span>
            <span className="max-w-[9rem] truncate sm:max-w-none">{activeTeam.nome}</span>
            <ChevronsUpDown className="size-4 text-muted-foreground" />
          </button>

          {open && (
            <div className="glass-strong absolute left-0 mt-2 w-64 overflow-hidden rounded-xl border p-1 shadow-2xl shadow-black/40">
              <p className="px-3 py-2 text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground">
                Equipas
              </p>
              {teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => {
                    onTeamChange(team)
                    setOpen(false)
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-foreground/5",
                    team.id === activeTeam.id ? "text-primary" : "text-foreground",
                  )}
                >
                  <span className="truncate">{team.nome}</span>
                  {team.id === activeTeam.id && <Check className="size-4 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button
          className="relative flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
          aria-label="Notificações"
        >
          <Bell className="size-5" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-danger ring-2 ring-background" />
        </button>

        <div className="flex items-center gap-2.5 rounded-lg border border-border bg-foreground/[0.03] py-1 pl-1 pr-3">
          <span className="flex size-8 items-center justify-center rounded-md bg-gradient-to-br from-primary to-chart-2 text-xs font-bold text-primary-foreground">
            JM
          </span>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-medium">José Mourinho</p>
            <p className="text-[0.7rem] text-muted-foreground">Treinador Principal</p>
          </div>
        </div>
      </div>
    </header>
  )
}
