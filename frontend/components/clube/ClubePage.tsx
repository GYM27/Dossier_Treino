"use client";

import { useState } from "react";
import { type Team } from "@/models/team";
import { ClubDetailsTab } from "./ClubDetailsTab";
import { ClubStatsTab } from "./ClubStatsTab";
import { CreateTeamModal } from "./CreateTeamModal";
import { Shield, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClubePageProps {
  activeTeam: Team | null;
  teams?: Team[];
  onTeamChange?: (team: Team) => void;
  onRefreshMe?: () => void;
}

export function ClubePage({
  activeTeam,
  teams = [],
  onTeamChange,
  onRefreshMe,
}: ClubePageProps) {
  const [activeTab, setActiveTab] = useState<"clube" | "estatisticas">("clube");
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);

  const handleTeamCreated = (newTeam: Team) => {
    if (onRefreshMe) onRefreshMe();
    if (onTeamChange) onTeamChange(newTeam);
  };

  if (!activeTeam) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-12 text-center space-y-4">
        <div className="size-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <Shield className="size-8" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Nenhuma equipa selecionada</h2>
          <p className="text-xs text-muted-foreground mt-1">Crie a sua primeira equipa para começar.</p>
        </div>
        <Button
          onClick={() => setShowCreateTeamModal(true)}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2"
        >
          <Plus className="size-4" />
          <span>Criar Nova Equipa</span>
        </Button>
        <CreateTeamModal
          isOpen={showCreateTeamModal}
          onClose={() => setShowCreateTeamModal(false)}
          onTeamCreated={handleTeamCreated}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Topo da Página do Clube */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-xl bg-background border border-border/50 p-1 flex items-center justify-center shadow-sm">
            {activeTeam.emblemaUrl ? (
              <img
                src={activeTeam.emblemaUrl}
                alt={activeTeam.nome}
                className="max-h-full max-w-full object-contain drop-shadow-sm"
              />
            ) : (
              <Shield className="size-6 text-primary" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {activeTeam.nome}
            </h1>
            <p className="text-xs text-muted-foreground">
              {activeTeam.escalao || "Plantel Principal"} • {activeTeam.modalidade || "Futebol"} • {activeTeam.epocaNome || "2025/2026"}
            </p>
          </div>
        </div>

        <Button
          onClick={() => setShowCreateTeamModal(true)}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-sm"
        >
          <Plus className="size-4" />
          <span>Criar Nova Equipa</span>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-border/50">
        <button
          onClick={() => setActiveTab("clube")}
          className={`text-sm font-bold pb-3 border-b-2 transition-all ${
            activeTab === "clube"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Detalhes do Clube & Plantéis
        </button>
        <button
          onClick={() => setActiveTab("estatisticas")}
          className={`text-sm font-bold pb-3 border-b-2 transition-all ${
            activeTab === "estatisticas"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Estatísticas da Equipa
        </button>
      </div>

      {/* Conteúdo da Tab */}
      <div className="mt-6">
        {activeTab === "clube" && (
          <ClubDetailsTab
            team={activeTeam}
            teams={teams}
            onTeamChange={onTeamChange}
            onOpenCreateTeam={() => setShowCreateTeamModal(true)}
            onUpdate={onRefreshMe}
          />
        )}
        {activeTab === "estatisticas" && <ClubStatsTab team={activeTeam} />}
      </div>

      {/* Modal de Criação de Equipa */}
      <CreateTeamModal
        isOpen={showCreateTeamModal}
        onClose={() => setShowCreateTeamModal(false)}
        onTeamCreated={handleTeamCreated}
      />
    </div>
  );
}
