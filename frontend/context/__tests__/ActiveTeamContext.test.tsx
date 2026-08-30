import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import { ActiveTeamProvider, useActiveTeam } from "../ActiveTeamContext";
import * as api from "@/lib/api";
import { Team } from "@/models/team";
import { Utilizador } from "@/models/utilizador";

// Mock do módulo apiFetch
vi.mock("@/lib/api", () => ({
  apiFetch: vi.fn(),
}));

const mockTeams: Team[] = [
  {
    id: "team-1",
    nome: "Seniores Masculinos",
    escalao: "Seniores",
    modalidade: "Futebol 11",
    epocaNome: "2025/2026",
    duracaoJogo: "45'+45'",
    numeroJogadores: "11",
    emblemaUrl: "https://example.com/logo1.png",
  },
  {
    id: "team-2",
    nome: "Sub-19 Nacional",
    escalao: "Sub-19",
    modalidade: "Futebol 11",
    epocaNome: "2025/2026",
    duracaoJogo: "45'+45'",
    numeroJogadores: "11",
    emblemaUrl: "",
  },
];

const mockUser: Utilizador = {
  id: "user-1",
  nomeCompleto: "Professor Rui",
  email: "rui@dossier.com",
  cargo: "TREINADOR_PRINCIPAL",
};

// Componente de teste consumidor
function TestConsumer() {
  const { activeTeam, teams, me, loading, setActiveTeam } = useActiveTeam();

  if (loading) {
    return <div>A carregar dados...</div>;
  }

  return (
    <div>
      <div data-testid="user-name">{me?.nomeCompleto || "Sem utilizador"}</div>
      <div data-testid="active-team-name">{activeTeam?.nome || "Sem equipa ativa"}</div>
      <div data-testid="teams-count">{teams.length}</div>
      <button
        data-testid="switch-team-btn"
        onClick={() => {
          if (teams.length > 1) {
            setActiveTeam(teams[1]);
          }
        }}
      >
        Trocar Equipa
      </button>
    </div>
  );
}

describe("ActiveTeamContext (TDD)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("deve carregar utilizador e equipas da API e definir a primeira equipa como ativa por defeito", async () => {
    vi.mocked(api.apiFetch).mockImplementation(async (endpoint: string) => {
      if (endpoint === "/auth/me") return mockUser;
      if (endpoint === "/equipas") return mockTeams;
      return null;
    });

    render(
      <ActiveTeamProvider>
        <TestConsumer />
      </ActiveTeamProvider>
    );

    expect(screen.getByText("A carregar dados...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("user-name")).toHaveTextContent("Professor Rui");
      expect(screen.getByTestId("active-team-name")).toHaveTextContent("Seniores Masculinos");
      expect(screen.getByTestId("teams-count")).toHaveTextContent("2");
    });
  });

  it("deve recuperar a equipa ativa a partir do localStorage se o ID existir", async () => {
    localStorage.setItem("dossier_active_team_id", "team-2");

    vi.mocked(api.apiFetch).mockImplementation(async (endpoint: string) => {
      if (endpoint === "/auth/me") return mockUser;
      if (endpoint === "/equipas") return mockTeams;
      return null;
    });

    render(
      <ActiveTeamProvider>
        <TestConsumer />
      </ActiveTeamProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("active-team-name")).toHaveTextContent("Sub-19 Nacional");
    });
  });

  it("deve alternar a equipa ativa e persistir o novo ID em localStorage ao chamar setActiveTeam", async () => {
    vi.mocked(api.apiFetch).mockImplementation(async (endpoint: string) => {
      if (endpoint === "/auth/me") return mockUser;
      if (endpoint === "/equipas") return mockTeams;
      return null;
    });

    render(
      <ActiveTeamProvider>
        <TestConsumer />
      </ActiveTeamProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("active-team-name")).toHaveTextContent("Seniores Masculinos");
    });

    act(() => {
      screen.getByTestId("switch-team-btn").click();
    });

    expect(screen.getByTestId("active-team-name")).toHaveTextContent("Sub-19 Nacional");
    expect(localStorage.getItem("dossier_active_team_id")).toBe("team-2");
  });

  it("deve lançar um erro explicativo quando o hook useActiveTeam é usado fora do ActiveTeamProvider", () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<TestConsumer />);
    }).toThrow("useActiveTeam deve ser utilizado dentro de um ActiveTeamProvider");

    consoleErrorSpy.mockRestore();
  });
});
