"use client";

import React, { useState, useEffect } from "react";
import { Team } from "@/models/team";
import { SessaoTreino } from "@/models/sessao-treino";
import { treinoService } from "@/services";
import { Placeholder } from "@/components/ui/Placeholder";
import { TreinosSidebarList } from "./components/TreinosSidebarList";
import { TreinoDetailStudio } from "./components/TreinoDetailStudio";
import { NovoTreinoModal } from "./modals/NovoTreinoModal";
import { Dumbbell, Plus, Sparkles } from "lucide-react";

interface TreinosOrchestratorProps {
  activeTeam: Team | null;
  initialTreinoId?: string | null;
}

export function TreinosOrchestrator({ activeTeam, initialTreinoId }: TreinosOrchestratorProps) {
  const [treinos, setTreinos] = useState<SessaoTreino[]>([]);
  const [selectedTreinoId, setSelectedTreinoId] = useState<string | null>(initialTreinoId || null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNovoModalOpen, setIsNovoModalOpen] = useState(false);

  // Sincronizar se o initialTreinoId mudar externamente (ex: vindo do calendário)
  useEffect(() => {
    if (initialTreinoId) {
      setSelectedTreinoId(initialTreinoId);
    }
  }, [initialTreinoId]);

  // Carregar lista de treinos da equipa ativa
  const loadTreinos = async () => {
    if (!activeTeam) return;
    setIsLoading(true);
    try {
      const data = await treinoService.getTreinosByEquipa(activeTeam.id);
      setTreinos(data || []);

      if (data && data.length > 0) {
        if (initialTreinoId && data.some((t) => t.id === initialTreinoId || t.eventoId === initialTreinoId)) {
          const matching = data.find((t) => t.id === initialTreinoId || t.eventoId === initialTreinoId);
          setSelectedTreinoId(matching ? matching.id : data[0].id);
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
    if (activeTeam?.id) {
      loadTreinos();
    }
  }, [activeTeam?.id]);

  // Quando um novo treino é criado no modal
  const handleTreinoCreated = (novoTreino: SessaoTreino) => {
    setTreinos((prev) => [novoTreino, ...prev]);
    setSelectedTreinoId(novoTreino.id);
    setIsNovoModalOpen(false);
  };

  // Quando o treino é atualizado pelo estúdio
  const handleTreinoUpdated = (treinoAtualizado: SessaoTreino) => {
    setTreinos((prev) =>
      prev.map((t) => (t.id === treinoAtualizado.id ? treinoAtualizado : t))
    );
  };

  // Recarregar lista de treinos preservando a seleção atual
  const handleReloadTreino = async (treinoId?: string) => {
    if (!activeTeam) return;
    try {
      const data = await treinoService.getTreinosByEquipa(activeTeam.id);
      setTreinos(data || []);
      if (data && data.length > 0) {
        const idToSelect = treinoId || selectedTreinoId;
        if (idToSelect && data.some((t) => t.id === idToSelect)) {
          setSelectedTreinoId(idToSelect);
        } else {
          setSelectedTreinoId(data[0].id);
        }
      } else {
        setSelectedTreinoId(null);
      }
    } catch (err) {
      console.error("Erro ao recarregar treino:", err);
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] print:hidden w-full overflow-hidden bg-[#070b14] border border-slate-800/80 rounded-2xl shadow-2xl">
      {/* Barra Lateral Esquerda: Lista de Treinos */}
      <div className="h-full shrink-0 flex">
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
        {isLoading ? (
          <Placeholder title="A carregar treinos..." />
        ) : selectedTreinoId ? (
<TreinoDetailStudio
              key={selectedTreinoId}
              treino={treinos.find((t) => t.id === selectedTreinoId)!}
              activeTeam={activeTeam!}
              onTreinoUpdated={handleTreinoUpdated}
              onReloadTreino={handleReloadTreino}
            />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Dumbbell className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Nenhum treino selecionado</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Selecione uma sessão na lista à esquerda ou crie um novo treino para começar a planear exercícios.
              </p>
            </div>
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