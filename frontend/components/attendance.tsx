"use client"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type AttendanceStatus = "presente" | "faltou" | "atrasado" | null;
export interface AttendanceRecord {
  status: AttendanceStatus;
  minutesLate?: number;
}
const currentEvent = { type: "Treino", date: "15 Outubro", time: "19:00", location: "Campo Nº 1" };
const players: any[] = [];
import { Calendar, CircleCheck, CircleX, Clock, MapPin, Save } from "lucide-react"
import { useMemo, useState } from "react"

function initials(name: string) {
  const parts = name.split(" ")
  return (parts[0][0] + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase()
}

const statusOptions: {
  key: Exclude<AttendanceStatus, null>
  label: string
  icon: typeof CircleCheck
  active: string
}[] = [
  {
    key: "presente",
    label: "Presente",
    icon: CircleCheck,
    active: "bg-success/20 text-success ring-1 ring-success/40",
  },
  {
    key: "faltou",
    label: "Faltou",
    icon: CircleX,
    active: "bg-danger/20 text-danger ring-1 ring-danger/40",
  },
  {
    key: "atrasado",
    label: "Atrasado",
    icon: Clock,
    active: "bg-warning/20 text-warning ring-1 ring-warning/40",
  },
]

export function Attendance() {
  const [records, setRecords] = useState<Record<string, AttendanceRecord>>(() =>
    Object.fromEntries(players.map((p) => [p.id, { status: null }])),
  )
  const [saved, setSaved] = useState(false)

  const stats = useMemo(() => {
    const values = Object.values(records)
    return {
      presente: values.filter((r) => r.status === "presente").length,
      faltou: values.filter((r) => r.status === "faltou").length,
      atrasado: values.filter((r) => r.status === "atrasado").length,
      pendente: values.filter((r) => r.status === null).length,
    }
  }, [records])

  function setStatus(id: string, status: AttendanceStatus) {
    setSaved(false)
    setRecords((prev) => ({
      ...prev,
      [id]: {
        status,
        minutesLate: status === "atrasado" ? (prev[id].minutesLate ?? 5) : undefined,
      },
    }))
  }

  function setMinutes(id: string, minutes: number) {
    setSaved(false)
    setRecords((prev) => ({ ...prev, [id]: { ...prev[id], minutesLate: minutes } }))
  }

  return (
    <div className="space-y-6 pb-28">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Assiduidade</h1>
        <p className="text-sm text-muted-foreground">
          Registe a presença dos atletas no evento selecionado
        </p>
      </div>

      {/* Event banner */}
      <div className="glass flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Calendar className="size-6" />
          </div>
          <div>
            <p className="font-semibold">
              {currentEvent.type} — {currentEvent.date}
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" /> {currentEvent.time}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" /> {currentEvent.location}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Stat label="Presentes" value={stats.presente} tone="text-success" />
          <Stat label="Faltas" value={stats.faltou} tone="text-danger" />
          <Stat label="Atrasos" value={stats.atrasado} tone="text-warning" />
          <Stat label="Pendente" value={stats.pendente} tone="text-muted-foreground" />
        </div>
      </div>

      {/* Player list */}
      <div className="glass overflow-hidden rounded-2xl">
        <div className="hidden grid-cols-[1fr_auto] items-center gap-4 border-b border-border px-5 py-3 text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground sm:grid">
          <span>Atleta</span>
          <span>Estado</span>
        </div>

        <ul className="divide-y divide-border">
          {players.map((player, i) => {
            const record = records[player.id]
            return (
              <li
                key={player.id}
                className="animate-fade-up flex flex-col gap-3 px-5 py-3.5 transition-colors hover:bg-foreground/[0.02] sm:flex-row sm:items-center sm:justify-between"
                style={{ animationDelay: `${i * 25}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-muted text-xs font-bold text-foreground ring-1 ring-foreground/10">
                    {initials(player.name)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      <span className="mr-1.5 text-muted-foreground">{player.number}</span>
                      {player.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {player.position} {player.flag}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="inline-flex rounded-lg border border-border bg-foreground/[0.03] p-1">
                    {statusOptions.map((opt) => {
                      const Icon = opt.icon
                      const isActive = record.status === opt.key
                      return (
                        <button
                          key={opt.key}
                          onClick={() => setStatus(player.id, isActive ? null : opt.key)}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all",
                            isActive
                              ? opt.active
                              : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
                          )}
                        >
                          <Icon className="size-3.5" />
                          <span className="hidden md:inline">{opt.label}</span>
                        </button>
                      )
                    })}
                  </div>

                  {record.status === "atrasado" && (
                    <div className="animate-fade-up flex items-center gap-1.5 rounded-lg border border-warning/30 bg-warning/10 px-2 py-1">
                      <input
                        type="number"
                        min={1}
                        max={120}
                        value={record.minutesLate ?? 5}
                        onChange={(e) =>
                          setMinutes(player.id, Math.max(1, Number(e.target.value) || 1))
                        }
                        className="w-12 bg-transparent text-center text-sm font-semibold text-warning outline-none"
                        aria-label="Minutos de atraso"
                      />
                      <span className="text-xs text-warning">min</span>
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 md:left-64">
        <div className="glass-strong mx-auto flex max-w-[1600px] items-center justify-between gap-4 border-t px-4 py-3 md:px-8">
          <p className="text-sm text-muted-foreground">
            {saved ? (
              <span className="text-success">Assiduidade guardada com sucesso.</span>
            ) : (
              <>
                <span className="font-medium text-foreground">{stats.pendente}</span> atletas por
                registar
              </>
            )}
          </p>
          <Button size="lg" onClick={() => setSaved(true)} className="shadow-lg shadow-primary/25">
            <Save className="size-4" />
            Guardar Assiduidade
          </Button>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-lg border border-border bg-foreground/[0.02] px-3 py-1.5 text-center">
      <p className={cn("text-lg font-bold leading-none", tone)}>{value}</p>
      <p className="mt-1 text-[0.65rem] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  )
}
