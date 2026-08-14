/**
 * Squad.tsx — Página Principal do Plantel (Orquestrador).
 *
 * Responsabilidade: Orquestrar os sub-componentes e o hook de dados.
 * NÃO contém lógica de API, NÃO contém o visual do cartão, NÃO contém o formulário.
 * Apenas "cola" as peças juntas:
 *   1. useAtletasCrud  → Dados e ações (o "Cérebro")
 *   2. PlayerCard      → Renderização visual (o "Rosto")
 *   3. AtletaFormModal  → Formulário no modal (a "Mão")
 *
 * ── Antes vs Depois ─────────────────────────────────────────────────────────
 *   ANTES: 356 linhas, 3 responsabilidades misturadas num único ficheiro.
 *   AGORA: ~70 linhas, focado apenas em compor a página.
 */
"use client"

import { Button } from "@/components/ui/button"
import { Search, UserPlus, X } from "lucide-react"
import { useMemo, useState } from "react"
import { type Team } from "@/models/team"
import { PlayerCard } from "./PlayerCard"
import { SquadTable } from "./SquadTable"
import { AtletaFormModal } from "./AtletaFormModal"
import { useAtletasCrud } from "./useAtletasCrud"

export function Squad({ activeTeam }: { activeTeam: Team }) {
  const [query, setQuery] = useState("")

  // ── O Hook Custom faz TODO o trabalho pesado ────────────────────────────
  const {
    jogadores,
    loading,
    error,
    showModal,
    editingPlayerId,
    isSubmitting,
    formData,
    setFormData,
    abrirModalCriar,
    abrirModalEditar,
    fecharModal,
    submeterFormulario,
  } = useAtletasCrud(activeTeam.id)

  // ── Filtragem por pesquisa ──────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return jogadores
    return jogadores.filter(
      (p) => p.name.toLowerCase().includes(q) || p.position.toLowerCase().includes(q),
    )
  }, [query, jogadores])

  // ── Estados de Loading e Erro ───────────────────────────────────────────
  if (loading) return <div className="text-center py-10">A carregar plantel...</div>
  if (error) return <div className="text-center py-10 text-rose-500">Erro: {error}</div>

  return (
    <div className="space-y-6">
      {/* Cabeçalho: Título + Pesquisa + Botão Adicionar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Plantel da Equipa</h1>
          <p className="text-sm text-muted-foreground">
            {jogadores.length} atletas registados
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
          <Button onClick={abrirModalCriar} size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20">
            <UserPlus className="size-4 mr-2" />
            Adicionar Atleta
          </Button>
        </div>
      </div>

      {/* Grelha de Cartões ou Mensagem de Vazio */}
      {filtered.length === 0 ? (
        <div className="glass rounded-2xl py-16 text-center text-sm text-muted-foreground border-dashed border-2 border-slate-700">
          O teu plantel está vazio. Clica em &quot;Adicionar Atleta&quot; para criar o teu primeiro jogador!
        </div>
      ) : (
        <SquadTable 
          players={filtered}
          onEdit={abrirModalEditar}
          onProfile={(id) => {
            const player = jogadores.find((p) => p.id === id)
            if (player) abrirModalEditar(player)
          }}
        />
      )}

      {/* Modal de Criar/Editar Atleta */}
      {showModal && (
        <AtletaFormModal
          formData={formData}
          onChange={setFormData}
          onSubmit={submeterFormulario}
          onClose={fecharModal}
          isSubmitting={isSubmitting}
          isEditing={!!editingPlayerId}
        />
      )}
    </div>
  )
}
