"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Footprints, Search, UserPlus, X } from "lucide-react"
import { useMemo, useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"
import { type Team } from "@/models/team"

// Substitutos das constantes que estavam no mock-data
const positionColors: Record<string, string> = {
  "Guarda-Redes": "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
  "Defesa": "bg-blue-500/15 text-blue-500 border-blue-500/30",
  "Médio": "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  "Avançado": "bg-rose-500/15 text-rose-500 border-rose-500/30",
}

function initials(name: string) {
  if (!name) return ""
  const parts = name.split(" ")
  return (parts[0][0] + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase()
}

function PlayerCard({ player, index }: { player: any; index: number }) {
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
          <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-blue-500/70 text-base font-bold text-primary-foreground ring-2 ring-foreground/10">
            {initials(player.name)}
          </div>
          <span className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full border-2 border-background bg-slate-800 text-[0.65rem] font-bold text-white">
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
            positionColors[player.positionGroup] || "bg-slate-500/15 text-slate-500 border-slate-500/30",
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

export function Squad({ activeTeam }: { activeTeam: Team }) {
  const [query, setQuery] = useState("")
  const [playersList, setPlayersList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  
  // Estado do Modal de Adicionar Atleta
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newPlayer, setNewPlayer] = useState({
    nome: "",
    dataNascimento: "",
    nacionalidade: "Portugal",
    posicaoPrincipal: "GUARDA_REDES",
    pePreferido: "DESTRO",
    numeroCamisola: 1,
    alturaCm: 180,
    pesoKg: 75
  })
  
  const fetchPlayers = async () => {
    try {
      setLoading(true)
      const data = await apiFetch(`/atletas?equipaId=${activeTeam.id}`)
      
      const formattedPlayers = data.map((dto: any) => ({
        id: dto.id,
        name: dto.nome,
        country: dto.nacionalidade || "Portugal",
        flag: "🇵🇹",
        age: dto.idade,
        number: dto.numeroCamisola || 0,
        positionGroup: dto.posicaoPrincipal.includes("GUARDA_REDES") ? "Guarda-Redes" : 
                       dto.posicaoPrincipal.includes("DEFESA") ? "Defesa" : 
                       dto.posicaoPrincipal.includes("MEDIO") ? "Médio" : "Avançado",
        position: dto.posicaoPrincipal.replace(/_/g, " "),
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

  useEffect(() => {
    if (activeTeam) {
      fetchPlayers()
    }
  }, [activeTeam])

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = {
        ...newPlayer,
        equipaId: activeTeam.id
      }
      await apiFetch("/atletas", {
        method: "POST",
        body: JSON.stringify(payload)
      })
      setShowAddModal(false)
      fetchPlayers() // Recarrega a lista instantaneamente
    } catch (err: any) {
      alert("Erro ao criar atleta: " + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return playersList
    return playersList.filter(
      (p) => p.name.toLowerCase().includes(q) || p.position.toLowerCase().includes(q),
    )
  }, [query, playersList])

  if (loading) return <div className="text-center py-10">A carregar plantel...</div>
  if (error) return <div className="text-center py-10 text-rose-500">Erro: {error}</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Plantel da Equipa</h1>
          <p className="text-sm text-muted-foreground">
            {playersList.length} atletas registados
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Procurar atleta..."
              className="h-9 w-full rounded-lg border border-border bg-foreground/[0.03] pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <Button onClick={() => setShowAddModal(true)} size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20">
            <UserPlus className="size-4 mr-2" />
            Adicionar Atleta
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass rounded-2xl py-16 text-center text-sm text-muted-foreground border-dashed border-2 border-slate-700">
          O teu plantel está vazio. Clica em "Adicionar Atleta" para criar o teu primeiro jogador!
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((player, i) => (
            <PlayerCard key={player.id} player={player} index={i} />
          ))}
        </div>
      )}

      {/* Modal de Adicionar Atleta */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#131b2f] border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center p-4 border-b border-slate-800/60 bg-slate-900/50">
              <h2 className="text-lg font-bold text-white">Criar Novo Atleta</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 col-span-2">
                  <label className="text-xs font-semibold text-slate-400">Nome Completo</label>
                  <input required value={newPlayer.nome} onChange={e => setNewPlayer({...newPlayer, nome: e.target.value})} className="w-full bg-[#0a0f1c] border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Data de Nascimento</label>
                  <input required type="date" value={newPlayer.dataNascimento} onChange={e => setNewPlayer({...newPlayer, dataNascimento: e.target.value})} className="w-full bg-[#0a0f1c] border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Nº Camisola</label>
                  <input required type="number" min="1" max="99" value={newPlayer.numeroCamisola} onChange={e => setNewPlayer({...newPlayer, numeroCamisola: parseInt(e.target.value)})} className="w-full bg-[#0a0f1c] border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Posição Principal</label>
                  <select value={newPlayer.posicaoPrincipal} onChange={e => setNewPlayer({...newPlayer, posicaoPrincipal: e.target.value})} className="w-full bg-[#0a0f1c] border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 outline-none">
                    <option value="GUARDA_REDES">Guarda-Redes</option>
                    <option value="DEFESA_CENTRAL">Defesa Central</option>
                    <option value="LATERAL_DIREITO">Lateral Direito</option>
                    <option value="LATERAL_ESQUERDO">Lateral Esquerdo</option>
                    <option value="MEDIO_DEFENSIVO">Médio Defensivo</option>
                    <option value="MEDIO_CENTRO">Médio Centro</option>
                    <option value="MEDIO_OFENSIVO">Médio Ofensivo</option>
                    <option value="EXTREMO_DIREITO">Extremo Direito</option>
                    <option value="EXTREMO_ESQUERDO">Extremo Esquerdo</option>
                    <option value="AVANCADO_CENTRO">Avançado Centro</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Pé Preferido</label>
                  <select value={newPlayer.pePreferido} onChange={e => setNewPlayer({...newPlayer, pePreferido: e.target.value})} className="w-full bg-[#0a0f1c] border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 outline-none">
                    <option value="DESTRO">Destro</option>
                    <option value="ESQUERDO">Esquerdino</option>
                    <option value="AMBIDESTRO">Ambidestro</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="border-slate-700 text-slate-300 hover:text-white">Cancelar</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                  {isSubmitting ? "A guardar..." : "Guardar Atleta"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
