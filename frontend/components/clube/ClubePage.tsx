"use client";

import { useState } from "react";
import { type Team } from "@/models/team";
import { ClubDetailsTab } from "./ClubDetailsTab";
import { ClubStatsTab } from "./ClubStatsTab";

interface ClubePageProps {
  activeTeam: Team | null;
  onRefreshMe?: () => void;
}

export function ClubePage({ activeTeam, onRefreshMe }: ClubePageProps) {
  const [activeTab, setActiveTab] = useState<"clube" | "estatisticas">("clube");

  if (!activeTeam) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Nenhuma equipa selecionada.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {activeTeam.emblemaUrl && (
            <img 
              src={activeTeam.emblemaUrl} 
              alt={activeTeam.nome} 
              className="size-10 object-contain drop-shadow-sm"
            />
          )}
          <p className="text-2xl font-bold">
            {activeTeam.nome}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 border-b border-border/50 pb-2">
        <button
          onClick={() => setActiveTab("clube")}
          className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
            activeTab === "clube"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Clube
        </button>
        <button
          onClick={() => setActiveTab("estatisticas")}
          className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
            activeTab === "estatisticas"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Estatísticas
        </button>
      </div>

      <div className="mt-6">
        {activeTab === "clube" && <ClubDetailsTab team={activeTeam} onUpdate={onRefreshMe} />}
        {activeTab === "estatisticas" && <ClubStatsTab team={activeTeam} />}
      </div>
    </div>
  );
}
