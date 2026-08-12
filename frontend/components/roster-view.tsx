"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { players, positionColors, type Player } from "@/lib/mock-data"
import { Footprints, Search, UserPlus } from "lucide-react"
import { useMemo, useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"

function initials(name: string) {
  const parts = name.split(" ")
  return (parts[0][0] + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase()
}

function PlayerCard({ player, index }: { player: Player; index: number }) {
  return (
    <div
      className="glass animate-fade-up group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <span className="pointer-events-none absolute -right-6 -top-6 text-7xl font-black text-foreground/[0.04] transition-colors group-hover:text-primary/15">
        {player.number}
      </span>

      <div className="flex items-start gap-4">
        <div className="relative">
          <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-chart-2/70 text-base font-bold text-primary-foreground ring-2 ring-foreground/10">
            {initials(player.name)}
          </div>
          <span className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full border-2 border-background bg-secondary text-[0.65rem] font-bold">
            {player.number}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-semibold tracking-tight">{player.name}</h3>
            <span className="text-base leading-none" aria-label={player.country} title={player.country}>
              {player.flag}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{player.age} anos</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
            positionColors[player.positionGroup],
          )}
        >
          {player.position}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-foreground/[0.03] px-2.5 py-1 text-xs text-muted-foreground">
          <Footprints className="size-3.5" />
          Pé {player.foot}
        </span>
      </div>
    </div>
  )
}

export function RosterView() {
  const [query, setQuery] = useState("")
  const [playersList, setPlayersList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  
  useEffect(() => {
    async function fetchPlayers() {
      try {
        setLoading(true)
        const data = await apiFetch("/atletas")
        
        // Mapear o DTO do backend para o formato que a nossa UI espera
        const formattedPlayers = data.map((dto: any) => ({
          id: dto.id,
          name: dto.nome,
          country: dto.nacionalidade || "Portugal", // Fallback
          flag: "🇵🇹", // Para já deixamos a bandeira fixa ou podíamos criar um mapa
          age: dto.idade,
          number: Math.floor(Math.random() * 99) + 1, // Geramos um número aleatório pois o backend ainda não tem número de camisola
          positionGroup: dto.posicaoPrincipal.includes("GUARDA_REDES") ? "goalkeepers" : 
                         dto.posicaoPrincipal.includes("DEFESA") ? "defenders" : 
                         dto.posicaoPrincipal.includes("MEDIO") ? "midfielders" : "forwards",
          position: dto.posicaoPrincipal.replace("_", " "),
          foot: dto.pePreferido === "DESTRO" ? "Direito" : dto.pePreferido === "ESQUERDO" ? "Esquerdo" : "Ambidestro",
          status: "active",
        }))
        
        setPlayersList(formattedPlayers)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchPlayers()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return playersList
    return playersList.filter(
      (p) => p.name.toLowerCase().includes(q) || p.position.toLowerCase().includes(q),
    )
  }, [query, playersList])

  if (loading) return <div className="text-center py-10">A carregar plantel...</div>
  if (error) return <div className="text-center py-10 text-red-500">Erro: {error}</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Plantel</h1>
          <p className="text-sm text-muted-foreground">
            {players.length} atletas registados nesta época
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Procurar atleta..."
              className="h-9 w-full rounded-lg border border-border bg-foreground/[0.03] pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button size="lg" className="shadow-lg shadow-primary/20">
            <UserPlus className="size-4" />
            Adicionar Atleta
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass rounded-2xl py-16 text-center text-sm text-muted-foreground">
          Nenhum atleta encontrado para “{query}”.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((player, i) => (
            <PlayerCard key={player.id} player={player} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
