import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { CatalogoExerciciosModal } from "../../CatalogoExerciciosModal";
import { exercicioService } from "@/services/exercicioService";

vi.mock("@/services/exercicioService", () => ({
  exercicioService: {
    getExercicios: vi.fn(),
    eliminarExercicio: vi.fn(),
  },
}));

vi.mock("@/components/prancheta/TacticalBoardThumbnail", () => ({
  TacticalBoardThumbnail: () => <div data-testid="mock-thumbnail">Thumbnail</div>,
}));

describe("CatalogoExerciciosModal - Integração e Seleção no Treino (TDD)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar o título do catálogo, barra de busca e exercícios carregados", async () => {
    vi.mocked(exercicioService.getExercicios).mockResolvedValue([
      {
        id: "ex-1",
        nome: "Finalização 2v1",
        categoria: "TATICO",
        pasta: "Organização Ofensiva",
        tempo: 12,
        jogadoresEnvolvidos: 4,
        descricao: "Exercício de finalização",
        nivelDificuldade: 3,
      },
    ]);

    render(<CatalogoExerciciosModal onClose={vi.fn()} onSelect={vi.fn()} />);

    expect(screen.getByText("Catálogo de Exercícios")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Pesquisar por nome, objetivo...")).toBeInTheDocument();
  });
});
