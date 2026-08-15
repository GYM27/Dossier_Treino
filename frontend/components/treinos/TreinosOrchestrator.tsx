"use client";

import React, { useState, useEffect } from "react";
import { Team } from "@/models/team";
import { SessaoTreino } from "@/models/sessao-treino";
import { Placeholder } from "@/components/ui/Placeholder";
import { TreinosSidebarList } from "./TreinosSidebarList";
import { TreinoDetailStudio } from "./TreinoDetailStudio";
import { NovoTreinoModal } from "./NovoTreinoModal";
import { treinoService } from "@/services";
import { Dumbbell, Plus, Sparkles } from "lucide-react";

export function TreinosOrchestrator({ activeTeam }: { activeTeam: Team | null }) {
  const [treinos, setTreinos] = useState<SessaoTreino[]>([]);
  const [selectedTreinoId, setSelectedTreinoId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNovoModalOpen, setIsNovoModalOpen] = useState(false);

  // Carregar lista de treinos da equipa ativa
  const loadTreinos = async (selectIdAfterLoad?: string) => {
    if (!activeTeam) return;
    setIsLoading(true);
    try {
      const data = await treinoService.getTreinosByEquipa(activeTeam.id);
      setTreinos(data || []);

      if (data && data.length > 0) {
        if (selectIdAfterLoad) {
          setSelectedTreinoId(selectIdAfterLoad);
        } else if (!selectedTreinoId || !data.some((t) => t.id === selectedTreinoId)) {
          setSelectedTreinoId(data[0].id);
        }
      } else {
        setSelectedTreinoId(null);
      }
    } catch (err) {
      console.error("Erro ao carregar treinos da equipa:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTeam) {
      loadTreinos();
    }
  }, [activeTeam?.id]);

  // Recarregar um treino específico
  const handleReloadTreino = async (treinoId: string) => {
    if (!activeTeam) return;
    try {
      const data = await treinoService.getTreinosByEquipa(activeTeam.id);
      setTreinos(data || []);
    } catch (err) {
      console.error("Erro ao recarregar treino:", err);
    }
  };

  // Quando um novo treino é criado no modal
  const handleTreinoCreated = (novoTreino: SessaoTreino) => {
    setTreinos((prev) => [novoTreino, ...prev]);
    setSelectedTreinoId(novoTreino.id);
  };

  // Quando o treino é atualizado pelo estúdio
  const handleTreinoUpdated = (treinoAtualizado: SessaoTreino) => {
    setTreinos((prev) =>
      prev.map((t) => (t.id === treinoAtualizado.id ? treinoAtualizado : t))
    );
  };

  if (!activeTeam) {
    return <Placeholder title="Nenhuma equipa selecionada" />;
  }

  const selectedTreino = treinos.find((t) => t.id === selectedTreinoId) || null;

  return (
    <div className="flex h-[calc(100vh-80px)] print:h-auto print:block w-full overflow-hidden print:overflow-visible bg-[#070b14] print:bg-white border border-slate-800/80 rounded-2xl print:border-none print:shadow-none shadow-2xl">
      {/* Barra Lateral Esquerda: Lista de Treinos */}
      <div className="print:hidden h-full shrink-0 flex">
        <TreinosSidebarList
          treinos={treinos}
        selectedTreinoId={selectedTreinoId}
        onSelectTreino={(t) => setSelectedTreinoId(t.id)}
        onNewTreino={() => setIsNovoModalOpen(true)}
        isLoading={isLoading}
      />
      </div>

      {/* Área Principal: Estúdio do Treino Selecionado */}
      <main className="flex-1 flex flex-col overflow-hidden print:overflow-visible bg-[#0a0f1d] print:bg-white">
        {selectedTreino ? (
          <TreinoDetailStudio
            key={selectedTreino.id}
            treino={selectedTreino}
            activeTeam={activeTeam}
            onTreinoUpdated={handleTreinoUpdated}
            onReloadTreino={handleReloadTreino}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Dumbbell className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">
                Nenhum treino selecionado
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Selecione uma sessão na lista à esquerda ou crie um novo treino para começar a planear exercícios.
              </p>
            </div>
            <button
              onClick={() => setIsNovoModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Criar Novo Treino</span>
            </button>
          </div>
        )}
      </main>

      {/* Modal de Criação de Novo Treino */}
      {isNovoModalOpen && (
        <NovoTreinoModal
          activeTeam={activeTeam}
          isOpen={isNovoModalOpen}
          onClose={() => setIsNovoModalOpen(false)}
          onTreinoCreated={handleTreinoCreated}
        />
      )}
    </div>
  );
}
