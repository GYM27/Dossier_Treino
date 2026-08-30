"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Team } from "@/models/team";
import { Utilizador } from "@/models/utilizador";
import { apiFetch } from "@/lib/api";

const STORAGE_ACTIVE_TEAM_KEY = "dossier_active_team_id";

export interface ActiveTeamContextType {
  activeTeam: Team | null;
  teams: Team[];
  me: Utilizador | null;
  loading: boolean;
  setActiveTeam: (team: Team) => void;
  refreshData: () => Promise<void>;
}

const ActiveTeamContext = createContext<ActiveTeamContextType | undefined>(undefined);

export function ActiveTeamProvider({ children }: { children: React.ReactNode }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTeam, setActiveTeamState] = useState<Team | null>(null);
  const [me, setMe] = useState<Utilizador | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar dados de autenticação e equipas da API
  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Carregar perfil do utilizador
      const meData = await apiFetch("/auth/me");
      setMe(meData);

      // 2. Carregar lista de equipas
      const equipasData: Team[] = (await apiFetch("/equipas")) || [];
      setTeams(equipasData);

      if (equipasData.length > 0) {
        // Recuperar preferência de equipa do localStorage (apenas no cliente)
        const savedTeamId = typeof window !== "undefined" ? localStorage.getItem(STORAGE_ACTIVE_TEAM_KEY) : null;
        const matched = savedTeamId ? equipasData.find((t) => t.id === savedTeamId) : null;
        
        setActiveTeamState((prev) => {
          if (matched) return matched;
          if (prev) {
            const stillExists = equipasData.find((t) => t.id === prev.id);
            if (stillExists) return stillExists;
          }
          return equipasData[0];
        });
      } else {
        setActiveTeamState(null);
      }
    } catch (err) {
      console.error("Erro ao carregar dados do ActiveTeamContext:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Efeito de montagem inicial (SSR-safe: a leitura do localStorage ocorre apenas aqui)
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Função para alternar a equipa ativa com persistência imediata
  const setActiveTeam = useCallback((team: Team) => {
    setActiveTeamState(team);
    if (typeof window !== "undefined" && team?.id) {
      try {
        localStorage.setItem(STORAGE_ACTIVE_TEAM_KEY, team.id);
      } catch (err) {
        console.warn("Não foi possível gravar a equipa ativa no localStorage:", err);
      }
    }
  }, []);

  const value: ActiveTeamContextType = {
    activeTeam,
    teams,
    me,
    loading,
    setActiveTeam,
    refreshData,
  };

  return (
    <ActiveTeamContext.Provider value={value}>
      {children}
    </ActiveTeamContext.Provider>
  );
}

// Hook de consumo seguro
export function useActiveTeam(): ActiveTeamContextType {
  const context = useContext(ActiveTeamContext);
  if (!context) {
    throw new Error("useActiveTeam deve ser utilizado dentro de um ActiveTeamProvider");
  }
  return context;
}
