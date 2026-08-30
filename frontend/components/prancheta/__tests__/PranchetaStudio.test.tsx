import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { PranchetaStudio } from "../PranchetaStudio";
import { exercicioService } from "@/services/exercicioService";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/services/exercicioService", () => ({
  exercicioService: {
    getExercicios: vi.fn(),
    getExercicioById: vi.fn(),
    criarExercicio: vi.fn(),
    atualizarExercicio: vi.fn(),
    eliminarExercicio: vi.fn(),
  },
}));

vi.mock("@/components/prancheta/TacticalBoard", () => ({
  default: () => <div data-testid="mock-tactical-board">TacticalBoard Loaded</div>,
}));

describe("PranchetaStudio - Integração e Orquestração Modular", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar a barra superior, ficha técnica e prancheta tática", async () => {
    vi.mocked(exercicioService.getExercicios).mockResolvedValue([
      { id: "ex-1", nome: "Pressão 3v2", descricao: "Exercício de pressão", categoria: "TATICO", nivelDificuldade: 3 },
    ]);

    render(<PranchetaStudio />);

    expect(screen.getByText("Novo Exercício Tático")).toBeInTheDocument();
    expect(screen.getByText("Ocultar Ficha")).toBeInTheDocument();
    expect(screen.getByText("Guardar")).toBeInTheDocument();
    expect(screen.getByText("Nome do Exercício *")).toBeInTheDocument();
  });
});
