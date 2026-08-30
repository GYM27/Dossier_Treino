import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { Dashboard } from "../Dashboard";
import { useActiveTeam } from "@/context/ActiveTeamContext";
import { useDashboardData } from "../useDashboardData";

vi.mock("@/context/ActiveTeamContext", () => ({
  useActiveTeam: vi.fn(),
}));

vi.mock("../useDashboardData", () => ({
  useDashboardData: vi.fn(),
}));

describe("Dashboard Component - Renderização Dinâmica", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar saudação ao utilizador e métricas reais da equipa ativa", () => {
    vi.mocked(useActiveTeam).mockReturnValue({
      activeTeam: { id: "team-1", nome: "Seniores Masculinos" },
      me: { id: "u-1", nomeCompleto: "Professor Rui", email: "rui@dossier.com", cargo: "TREINADOR_PRINCIPAL" },
      teams: [],
      loading: false,
      setActiveTeam: vi.fn(),
      refreshData: vi.fn(),
    });

    vi.mocked(useDashboardData).mockReturnValue({
      loading: false,
      totalAtletas: 22,
      taxaAssiduidade: "88%",
      totalAtrasos: 3,
      proximoEventoLabel: "02 SET",
      proximoEventoSub: "19:00 (Treino)",
      distribuicaoPosicoes: { guardaRedes: 3, defesas: 7, medios: 8, avancados: 4 },
      proximosEventos: [
        {
          id: "e-1",
          title: "Treino Tático - Pressão Alta",
          day: "02",
          month: "SET",
          time: "19:00",
          type: "TREINO",
          tone: "bg-cyan-500",
        },
      ],
      aniversariosMes: [
        { id: "a-1", nome: "Gonçalo Ramos", dia: 15, idade: 21, posicao: "AVANCADO" },
      ],
      atletas: [],
      refresh: vi.fn(),
    });

    render(<Dashboard />);

    expect(screen.getByText(/Bem-vindo, Professor Rui/i)).toBeInTheDocument();
    expect(screen.getAllByText("Seniores Masculinos").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("22")).toBeInTheDocument();
    expect(screen.getByText("88%")).toBeInTheDocument();
    expect(screen.getByText("Treino Tático - Pressão Alta")).toBeInTheDocument();
    expect(screen.getByText("Gonçalo Ramos")).toBeInTheDocument();
    expect(screen.getByText("21 anos")).toBeInTheDocument();
  });

  it("deve renderizar empty state quando não há próximos eventos agendados", () => {
    vi.mocked(useActiveTeam).mockReturnValue({
      activeTeam: { id: "team-1", nome: "Sub-19" },
      me: null,
      teams: [],
      loading: false,
      setActiveTeam: vi.fn(),
      refreshData: vi.fn(),
    });

    vi.mocked(useDashboardData).mockReturnValue({
      loading: false,
      totalAtletas: 18,
      taxaAssiduidade: "100%",
      totalAtrasos: 0,
      proximoEventoLabel: "Sem eventos",
      proximoEventoSub: "agendados",
      distribuicaoPosicoes: { guardaRedes: 2, defesas: 6, medios: 6, avancados: 4 },
      proximosEventos: [],
      aniversariosMes: [],
      atletas: [],
      refresh: vi.fn(),
    });

    render(<Dashboard />);

    expect(screen.getByText(/Sem eventos agendados para as próximas semanas/i)).toBeInTheDocument();
  });
});
